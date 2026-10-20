"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import SafeImage from "./SafeImage";
import MediaPreview from "./MediaPreview";
import { adminRecoveredMedia } from "@/frontend/lib/admin-media";

export default function RecoveredMediaPanel({ item, section }) {
  const [previewIndex, setPreviewIndex] = useState(null);
  const media = adminRecoveredMedia(item, section);
  if (!media.length) return null;
  const title = item.title || item.institution || item.name || "Dokumentasi";
  const images = media.filter((entry) => entry.kind === "image").length;
  const pdfs = media.length - images;

  return (
    <>
      <details className="recovered-media-panel">
        <summary className="text-sm font-semibold">
          Media tersedia · {[images && `${images} gambar`, pdfs && `${pdfs} PDF`].filter(Boolean).join(" · ")}
        </summary>
        <div className="p-4">
          <p className="mb-4 text-xs leading-relaxed text-muted">Pratinjau file pulihan yang digunakan di website. URL asli pada form tetap tersimpan.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {media.map((entry, index) => (
              <button
                key={entry.src}
                type="button"
                onClick={() => setPreviewIndex(index)}
                aria-label={`Buka ${entry.kind === "pdf" ? "PDF" : "gambar"} ${index + 1}: ${title}`}
                className="overflow-hidden rounded-xl border border-line bg-surface text-left transition hover:border-emerald/50"
              >
                {entry.kind === "pdf" ? (
                  <span className="flex aspect-[4/3] items-center justify-center gap-2 text-sm font-semibold text-emerald-deep"><FileText size={22} /> PDF</span>
                ) : (
                  <SafeImage src={entry.src} alt={`${title} ${index + 1}`} className="aspect-[4/3] w-full" imgClassName="object-contain p-1" sizes="(max-width: 640px) 40vw, 200px" />
                )}
                <span className="block border-t border-line px-3 py-2 text-xs text-muted">{entry.kind === "pdf" ? "Dokumen" : "Gambar"} {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </details>
      {previewIndex !== null && <MediaPreview onClose={() => setPreviewIndex(null)} items={media.map((entry) => ({ src: entry.src, title }))} initialIndex={previewIndex} title={title} />}
    </>
  );
}
