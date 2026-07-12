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

const PDFJS_MODULE = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs";
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

let pdfJsLoader;

function loadPdfJs() {
  if (!pdfJsLoader) {
    pdfJsLoader = import(/* webpackIgnore: true */ PDFJS_MODULE).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return pdfjs;
    });
  }
  return pdfJsLoader;
}

function MobilePdfPages({ src = "", title = "Preview PDF" }) {
  const shellRef = useRef(null);
  const pagesRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return undefined;

    const updateWidth = () => setWidth(Math.max(260, Math.floor(node.clientWidth - 24)));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = pagesRef.current;
    if (!node || !src || !width) return undefined;

    let cancelled = false;
    node.replaceChildren();
    setStatus("loading");

    async function renderPdf() {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        const task = pdfjs.getDocument({ url: src, withCredentials: false });
        const pdf = await task.promise;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const pageWidth = Math.min(width, 760);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const cssScale = pageWidth / baseViewport.width;
          const renderViewport = page.getViewport({ scale: cssScale * pixelRatio });
          const cssWidth = baseViewport.width * cssScale;
          const cssHeight = baseViewport.height * cssScale;

          const pageWrap = document.createElement("div");
          pageWrap.className = "mx-auto overflow-hidden rounded-xl border border-line bg-white shadow-sm";
          pageWrap.style.width = `${cssWidth}px`;
          pageWrap.setAttribute("aria-label", `${title} halaman ${pageNumber}`);

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${cssHeight}px`;
          canvas.className = "block h-auto w-full";

          pageWrap.appendChild(canvas);
          node.appendChild(pageWrap);

          await page.render({
            canvasContext: canvas.getContext("2d", { alpha: false }),
            viewport: renderViewport,
          }).promise;
        }

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
      node.replaceChildren();
    };
  }, [src, title, width]);

  return (
    <div ref={shellRef} className="relative h-full w-full overflow-y-auto bg-surface px-3 py-4">
      <div ref={pagesRef} className="space-y-4 pb-5" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface text-sm font-semibold text-muted">
          Memuat semua halaman PDF...
        </div>
      )}
      {status === "error" && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm font-semibold text-ink">Preview PDF belum bisa dimuat di perangkat ini.</p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white"
          >
            Buka PDF <ExternalLink size={15} />
          </a>
        </div>
      )}
    </div>
  );
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
  const [useMobilePdf, setUseMobilePdf] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
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

    setUseMobilePdf(isAppleTouchDevice || isSmallTouchScreen);
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
  const pdfFrameSrc = useMobilePdf ? current?.src || "" : pdfViewerSrc;

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
            useMobilePdf ? (
              <MobilePdfPages src={current.src} title={current.title || title} />
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-surface">
                <iframe
                  key={pdfFrameSrc}
                  src={pdfFrameSrc}
                  title={current.title || title}
                  loading="lazy"
                  onLoad={() => setPdfLoaded(true)}
                  className="h-full w-full border-0 bg-surface"
                />
                {!pdfLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface text-sm font-semibold text-muted">
                    Memuat preview PDF...
                  </div>
                )}
              </div>
            )
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
