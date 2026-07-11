"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function DetailModal({ open, onClose, eyebrow, title, children, size = "default" }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overscroll-contain bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        className={`max-h-[90svh] w-full overflow-y-auto overscroll-contain rounded-[1.75rem] border border-surface/70 bg-paper p-6 shadow-2xl [-webkit-overflow-scrolling:touch] sm:p-8 ${
          size === "wide" ? "max-w-6xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id="detail-modal-title" className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-emerald/40 hover:text-emerald"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
