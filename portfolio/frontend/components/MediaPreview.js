"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import SafeImage from "@/frontend/components/SafeImage";

function isPdf(src = "") {
  return /\.pdf(\?.*)?(#.*)?$/i.test(src);
}

function withPdfOptions(src = "") {
  if (!src) return src;
  const [base, fragment = ""] = src.split("#");
  const params = new URLSearchParams(fragment);
  params.set("toolbar", "0");
  params.set("navpanes", "0");
  params.set("scrollbar", "1");
  params.set("page", "1");
  params.set("view", "FitH");
  params.set("zoom", "page-width");
  return `${base}#${params.toString()}`;
}

function normalizeItem(item, fallbackTitle) {
  if (!item) return null;
  if (typeof item === "string") return { src: item, title: fallbackTitle };
  if (!item.src) return null;
  return { src: item.src, title: item.title || fallbackTitle };
}

export default function MediaPreview({ src = "", title = "Preview", items = [], initialIndex = 0, onClose }) {
  const galleryItems = useMemo(() => {
    const normalized = (items || []).map((item) => normalizeItem(item, title)).filter(Boolean);
    if (normalized.length) return normalized;
    return src ? [{ src, title }] : [];
  }, [items, src, title]);
  const galleryKey = galleryItems.map((item) => `${item.src}|${item.title}`).join("::");
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [useScaledPdf, setUseScaledPdf] = useState(false);
  const [pdfBoxWidth, setPdfBoxWidth] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const pdfBoxRef = useRef(null);
  const current = galleryItems[activeIndex] || galleryItems[0];
  const hasMultiple = galleryItems.length > 1;

  useEffect(() => {
    if (!galleryItems.length) return undefined;
    setActiveIndex(Math.min(Math.max(Number(initialIndex) || 0, 0), galleryItems.length - 1));
  }, [galleryItems.length, galleryKey, initialIndex]);

  useEffect(() => {
    if (!current?.src) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultiple) showPrevious();
      if (event.key === "ArrowRight" && hasMultiple) showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [current?.src, hasMultiple, onClose]);

  useEffect(() => {
    const isAppleTouchDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSmallTouchScreen =
      window.matchMedia("(max-width: 640px)").matches &&
      window.matchMedia("(pointer: coarse)").matches;

    setUseScaledPdf(isAppleTouchDevice || isSmallTouchScreen);
  }, []);

  useEffect(() => {
    setPdfLoaded(false);
  }, [current?.src]);

  const showPrevious = () => {
    if (!hasMultiple) return;
    setActiveIndex((index) => (index - 1 + galleryItems.length) % galleryItems.length);
  };

  const showNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((index) => (index + 1) % galleryItems.length);
  };

  const handlePointerUp = (event) => {
    if (!touchStart || !hasMultiple) return;
    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    setTouchStart(null);
    if (Math.abs(deltaX) < 44 || Math.abs(deltaY) > 80) return;
    if (deltaX < 0) showNext();
    else showPrevious();
  };

  const pdf = Boolean(current?.src && isPdf(current.src));
  const pdfViewerSrc = withPdfOptions(current?.src || "");
  const pdfFrameWidth = 1440;
  const pdfFrameHeight = 2200;
  const pdfScale = useScaledPdf && pdfBoxWidth ? Math.min(1, Math.max(0.18, (pdfBoxWidth - 24) / pdfFrameWidth)) : 1;
  const scaledPdfShellStyle = useScaledPdf
    ? {
        width: `${pdfFrameWidth * pdfScale}px`,
        height: `${pdfFrameHeight * pdfScale}px`,
      }
    : undefined;
  const scaledPdfFrameStyle = useScaledPdf
    ? {
        width: `${pdfFrameWidth}px`,
        height: `${pdfFrameHeight}px`,
        transform: `scale(${pdfScale})`,
        transformOrigin: "top left",
      }
    : undefined;

  useEffect(() => {
    const node = pdfBoxRef.current;
    if (!node || !pdf || !useScaledPdf) return undefined;

    const updateWidth = () => setPdfBoxWidth(node.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [pdf, useScaledPdf]);

  if (!current?.src) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center overscroll-contain bg-black/70 p-3 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-surface/70 bg-paper shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">{current.title || title}</p>
            {hasMultiple && (
              <p className="mt-0.5 text-xs font-semibold text-muted">
                {activeIndex + 1} / {galleryItems.length}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {pdf && (
              <a
                href={current.src}
                target="_blank"
                rel="noreferrer"
                aria-label="Buka PDF penuh"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink transition hover:border-emerald/40 hover:text-emerald"
              >
                PDF <ExternalLink size={14} />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup preview"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-emerald/40 hover:text-emerald"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div
          className="relative h-[76svh] touch-pan-y overscroll-contain bg-ink sm:h-[76vh]"
          onPointerDown={(event) => setTouchStart({ x: event.clientX, y: event.clientY })}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setTouchStart(null)}
        >
          {pdf ? (
            <div ref={pdfBoxRef} className="relative flex h-full w-full justify-center overflow-auto bg-surface p-3 sm:block sm:p-0">
              <div className={useScaledPdf ? "relative overflow-hidden bg-surface" : "h-full w-full"} style={scaledPdfShellStyle}>
                <iframe
                  key={pdfViewerSrc}
                  src={pdfViewerSrc}
                  title={current.title || title}
                  loading="lazy"
                  onLoad={() => setPdfLoaded(true)}
                  className={useScaledPdf ? "block max-w-none border-0 bg-surface" : "h-full w-full border-0 bg-surface"}
                  style={scaledPdfFrameStyle}
                />
              </div>
              {!pdfLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface text-sm font-semibold text-muted">
                  Memuat preview PDF...
                </div>
              )}
            </div>
          ) : (
            <SafeImage
              src={current.src}
              alt={current.title || title}
              loading="eager"
              sizes="95vw"
              className="h-full w-full"
              imgClassName="h-full w-full object-contain"
            />
          )}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Media sebelumnya"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Media berikutnya"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70"
              >
                <ChevronRight size={22} />
              </button>
              <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 gap-1.5 overflow-hidden rounded-full bg-black/45 px-2.5 py-2">
                {galleryItems.map((item, index) => (
                  <button
                    key={`${item.src}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Buka media ${index + 1}`}
                    className={`h-2 rounded-full transition ${index === activeIndex ? "w-7 bg-white" : "w-2 bg-white/55"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
