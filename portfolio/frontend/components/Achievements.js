"use client";

import { useEffect, useRef, useState } from "react";
import { Award, CalendarDays, ExternalLink, FileBadge, FileText, Fingerprint } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";
import MediaPreview from "@/frontend/components/MediaPreview";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";
import { externalUrl } from "@/frontend/lib/urls";

function certificatePdfs(item = {}) {
  const extras = [
    ...(Array.isArray(item.pdfUrls) ? item.pdfUrls : []),
    ...(Array.isArray(item.certificateFiles) ? item.certificateFiles : []),
    ...(Array.isArray(item.certificatePdfs) ? item.certificatePdfs : []),
    ...(Array.isArray(item.documents) ? item.documents : []),
  ];

  return [item.pdfUrl, ...extras].filter((src) => typeof src === "string" && src.trim());
}

function mediaAssets(item = {}, kind = "") {
  const assets = kind === "Sertifikat"
    ? certificatePdfs(item).map((src, index) => ({
        src,
        title: index === 0 ? `Sertifikat ${item.title}` : `Sertifikat ${item.title} ${index + 1}`,
      }))
    : [
        item.image && { src: item.image, title: `Dokumentasi ${item.title}` },
        item.logo && { src: item.logo, title: `Logo ${item.issuer || item.title}` },
      ].filter(Boolean);

  return assets.filter((asset, index, list) => list.findIndex((itemAsset) => itemAsset.src === asset.src) === index);
}

function isPdf(src = "") {
  return /\.pdf(\?.*)?(#.*)?$/i.test(src);
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

function PdfThumbnail({ src = "", title = "Preview PDF" }) {
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return undefined;

    const updateBox = () => {
      setBox({
        width: Math.max(220, Math.floor(node.clientWidth - 28)),
        height: Math.max(120, Math.floor(node.clientHeight - 24)),
      });
    };
    updateBox();

    const observer = new ResizeObserver(updateBox);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src || !box.width || !box.height) return undefined;

    let cancelled = false;
    setFailed(false);

    async function renderThumbnail() {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        const pdf = await pdfjs.getDocument({ url: src, withCredentials: false }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const cssScale = Math.min(box.width / viewport.width, box.height / viewport.height);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: cssScale * pixelRatio });
        const cssWidth = Math.floor(viewport.width * cssScale);
        const cssHeight = Math.floor(viewport.height * cssScale);

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        await page.render({
          canvasContext: canvas.getContext("2d", { alpha: false }),
          viewport: renderViewport,
        }).promise;
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    renderThumbnail();

    return () => {
      cancelled = true;
    };
  }, [box.height, box.width, src]);

  return (
    <div ref={shellRef} className="flex h-full w-full items-center justify-center bg-white p-3">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep">
          <FileBadge size={28} />
        </div>
      ) : (
        <canvas ref={canvasRef} aria-label={title} className="block max-h-full max-w-full rounded-sm bg-white shadow-sm" />
      )}
    </div>
  );
}

function Card({ item, icon: Icon, onClick, compact = false }) {
  if (compact) {
    return (
      <button type="button" onClick={onClick} className="glass group min-h-[13rem] rounded-2xl p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
        <div className="flex h-full flex-col">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface p-2.5">
              {item.image || item.logo ? (
                <SafeImage
                  src={item.image || item.logo}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  sizes="64px"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-contain"
                  fallback={<LogoFallback label={item.title || item.issuer} icon={Icon} />}
                />
              ) : (
                <Icon size={26} className="text-emerald-deep" />
              )}
            </span>
            <div className="min-w-0">
              <h4 className="font-display text-base font-semibold leading-snug text-ink">{item.title}</h4>
              <p className="mt-1 text-sm text-muted">{item.issuer}</p>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between pt-5">
            <p className="font-mono text-xs text-emerald-deep">{item.issuedAt || item.year}</p>
            <span className="text-xs font-semibold text-ink/50 transition group-hover:text-emerald">Detail →</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className="glass group overflow-hidden rounded-2xl text-left transition duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
      {item.image ? (
        <SafeImage
          src={item.image}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="h-40 w-full overflow-hidden"
          imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fallback={<LogoFallback label={item.title || item.issuer} icon={Icon} />}
        />
      ) : item.logo ? (
        <SafeImage
          src={item.logo}
          alt={`Logo ${item.issuer}`}
          loading="lazy"
          decoding="async"
          className="flex h-40 w-full items-center justify-center bg-surface"
          imgClassName="h-full w-full object-contain p-7"
          fallback={<LogoFallback label={item.issuer || item.title} icon={Icon} />}
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-emerald-soft to-surface">
          <Icon size={34} className="text-emerald-deep" />
        </div>
      )}
      <div className="p-5">
        <h4 className="font-display text-base font-semibold text-ink">{item.title}</h4>
        <p className="mt-1 text-sm text-muted">{item.issuer}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-xs text-emerald-deep">{item.issuedAt || item.year}</p>
          <span className="text-xs font-semibold text-ink/50 transition group-hover:text-emerald">Detail →</span>
        </div>
      </div>
    </button>
  );
}

export default function Achievements({ achievements = [], certificates = [], section = {} }) {
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const openGroupPreview = (src, fallbackTitle) => {
    if (!src || !selected) return;
    const group = selected.kind === "Sertifikat" ? certificates : achievements;
    const mediaItems = group.flatMap((item) => mediaAssets(item, selected.kind));
    const initialIndex = Math.max(0, mediaItems.findIndex((item) => item.src === src));
    setPreview({ src, items: mediaItems, initialIndex, title: fallbackTitle });
  };

  return (
    <section id="pencapaian" className="section-pad py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">{section.eyebrow || "Pengakuan"}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{section.title || "Pencapaian & Sertifikat"}</h2>

        {achievements.length > 0 && (
          <div className="mt-10">
            <p className="mb-4 text-sm font-semibold text-ink/70">{section.achievementsLabel || "Pencapaian"}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((item) => (
                <Card key={item.id} item={item} icon={Award} compact onClick={() => setSelected({ ...item, kind: "Pencapaian" })} />
              ))}
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="mt-12">
            <p className="mb-4 text-sm font-semibold text-ink/70">{section.certificatesLabel || "Sertifikat"}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((item) => (
                <Card key={item.id} item={item} icon={FileBadge} compact onClick={() => setSelected({ ...item, kind: "Sertifikat" })} />
              ))}
            </div>
          </div>
        )}
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={selected?.kind} title={selected?.title} size="wide">
        {selected && (
          <>
            <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[88px_1fr] sm:p-6">
              <button
                type="button"
                onClick={() => {
                  const src = selected.image || selected.logo || selected.pdfUrl;
                  openGroupPreview(src, selected.title);
                }}
                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-soft"
              >
                {selected.image || selected.logo ? (
                  <SafeImage
                    src={selected.image || selected.logo}
                    alt={`Logo ${selected.issuer}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full"
                    imgClassName="h-full w-full object-contain p-2"
                    fallback={<LogoFallback label={selected.issuer || selected.title} icon={FileBadge} />}
                  />
                ) : (
                  <FileBadge size={32} className="text-emerald-deep" />
                )}
              </button>
              <div>
                <p className="text-lg font-semibold text-ink">{selected.issuer}</p>
                {selected.description && <p className="mt-2 text-sm leading-relaxed text-muted">{selected.description}</p>}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <CalendarDays size={18} className="text-emerald" />
                <div>
                  <p className="text-xs text-muted">Diterbitkan</p>
                  <p className="text-sm font-semibold text-ink">{selected.issuedAt || selected.year || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <CalendarDays size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-muted">Kedaluwarsa</p>
                  <p className="text-sm font-semibold text-ink">{selected.expiresAt || "Tidak kedaluwarsa"}</p>
                </div>
              </div>
            </div>
            {selected.credentialId && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line p-4">
                <Fingerprint size={18} className="text-emerald" />
                <div className="min-w-0">
                  <p className="text-xs text-muted">Credential ID</p>
                  <p className="truncate font-mono text-sm font-medium text-ink">{selected.credentialId}</p>
                </div>
              </div>
            )}
            {mediaAssets(selected, selected.kind).length > 0 && (
              <section className="mt-5">
                <h3 className="mb-3 font-display text-lg font-semibold text-ink">Media terkait</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaAssets(selected, selected.kind).map((asset, index) => (
                    <button
                      key={`${asset.src}-${index}`}
                      type="button"
                      onClick={() => openGroupPreview(asset.src, asset.title)}
                      className="group overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:border-emerald/35"
                    >
                      {isPdf(asset.src) ? (
                        <div className="h-44 w-full overflow-hidden bg-white">
                          <PdfThumbnail src={asset.src} title={asset.title} />
                        </div>
                      ) : (
                        <SafeImage
                          src={asset.src}
                          alt={asset.title}
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 90vw, 320px"
                          className="h-36 w-full bg-white"
                          imgClassName="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                          fallback={<LogoFallback label={asset.title} icon={FileBadge} />}
                        />
                      )}
                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="truncate text-sm font-semibold text-ink">{asset.title}</p>
                        <span className="shrink-0 text-xs font-semibold text-emerald-deep">Preview</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {selected.credentialUrl && (
                <a href={externalUrl(selected.credentialUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white">
                  Lihat credential <ExternalLink size={14} />
                </a>
              )}
              {selected.pdfUrl && (
                <button
                  type="button"
                  onClick={() => openGroupPreview(selected.pdfUrl, `Sertifikat ${selected.title}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  Dokumentasi PDF <FileText size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </DetailModal>
      <MediaPreview
        src={preview?.src}
        items={preview?.items}
        initialIndex={preview?.initialIndex || 0}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
    </section>
  );
}
