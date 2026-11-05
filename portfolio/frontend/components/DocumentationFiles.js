"use client";

import { Download, ExternalLink } from "lucide-react";
import { documentationFiles } from "@/frontend/lib/documentation";

export default function DocumentationFiles({ item, onPreview, title = "File dokumentasi" }) {
  const items = documentationFiles(item).map((src, index) => ({ src, title: `${title} ${index + 1}` }));
  if (!items.length) return null;
  return <div className="mt-4 flex flex-wrap gap-3">
    {items.map((file, index) => <div key={file.src} className="flex max-w-full items-center gap-1">
      <button type="button" onClick={() => onPreview({ items, initialIndex: index, title: file.title })}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-left text-sm font-semibold text-ink">
        {file.title} <ExternalLink size={15} className="shrink-0" />
      </button>
      <a href={file.src} download target="_blank" rel="noreferrer" aria-label={`Unduh ${file.title}`}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink"><Download size={15} /></a>
    </div>)}
  </div>;
}
