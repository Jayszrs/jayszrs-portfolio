"use client";

import { useState } from "react";
import { ArrowUpRight, Image as ImageIcon, Maximize2 } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";

export default function SelectedDesigns({ items = [] }) {
  const [selected, setSelected] = useState(null);

  return (
    <section id="desain" className="section-pad scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Visual archive</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Selected Design</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Pilihan karya visual. Klik kartu untuk membuka preview dan detail desain.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className={`group glass overflow-hidden rounded-2xl text-left transition duration-300 hover:-translate-y-1 hover:shadow-glass-lg ${
                index === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <div className={`${index === 0 ? "h-72" : "h-56"} relative overflow-hidden bg-gradient-to-br from-ink to-slate-700`}>
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
                    <ImageIcon size={32} />
                    <span className="text-xs">Upload preview dari admin</span>
                  </div>
                )}
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition group-hover:opacity-100">
                  <Maximize2 size={16} />
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep">{item.category} · {item.year}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <DetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow={selected ? `${selected.category} · ${selected.year}` : ""}
        title={selected?.title}
      >
        {selected && (
          <>
            <div className="overflow-hidden rounded-2xl bg-ink">
              {selected.image ? (
                <img src={selected.image} alt={selected.title} className="max-h-[55vh] w-full object-contain" />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-white/50">Preview belum diunggah.</div>
              )}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">{selected.description}</p>
            {selected.link && (
              <a href={selected.link} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                Buka karya <ArrowUpRight size={15} />
              </a>
            )}
          </>
        )}
      </DetailModal>
    </section>
  );
}
