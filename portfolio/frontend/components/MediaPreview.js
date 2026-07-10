"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import SafeImage from "@/frontend/components/SafeImage";

function isPdf(src = "") {
  return /\.pdf(\?.*)?$/i.test(src);
}

export default function MediaPreview({ src = "", title = "Preview", onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-surface/70 bg-paper shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
          <p className="truncate font-display text-lg font-semibold text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup preview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-emerald/40 hover:text-emerald"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-[76vh] bg-ink">
          {isPdf(src) ? (
            <iframe src={src} title={title} className="h-full w-full bg-surface" />
          ) : (
            <SafeImage
              src={src}
              alt={title}
              loading="eager"
              sizes="95vw"
              className="h-full w-full"
              imgClassName="h-full w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
