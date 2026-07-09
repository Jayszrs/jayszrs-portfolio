"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, CalendarDays, Code2, Layers3, UserRound } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";

export default function Gallery({ items }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (paused) return;
    const el = trackRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (!el) return;
      const cardWidth = el.firstChild?.offsetWidth || 320;
      const gap = 24;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [paused, items.length]);

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 320;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
  };

  return (
    <section id="proyek" className="section-pad py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Portofolio</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Proyek Terpilih
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollByAmount(-1)}
              className="glass flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:text-emerald"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              className="glass flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:text-emerald"
              aria-label="Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-10 flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="glass group w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl text-left transition hover:-translate-y-1 hover:shadow-glass-lg sm:w-[340px]"
            >
              <div className="h-44 w-full overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-deep">
                  Lihat detail <ArrowUpRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow="Project case study" title={selected?.title} size="wide">
        {selected && (
          <div className="space-y-7">
            {selected.image && (
              <div className="h-64 overflow-hidden rounded-2xl bg-ink sm:h-80">
                <img src={selected.image} alt={selected.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {selected.role && (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <UserRound size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Peran</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.role}</p>
                </div>
              )}
              {selected.period && (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <CalendarDays size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Periode</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.period}</p>
                </div>
              )}
              {selected.techStack && (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <Code2 size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Stack utama</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.techStack}</p>
                </div>
              )}
            </div>
            <section>
              <h3 className="flex items-center gap-2 border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">
                <Layers3 size={19} className="text-emerald" /> Tentang Proyek
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{selected.background || selected.description}</p>
            </section>
            {selected.contribution && (
              <section>
                <h3 className="border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">Kontribusi Saya</h3>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{selected.contribution}</p>
              </section>
            )}
            {selected.link && (
              <a href={selected.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                Buka proyek <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        )}
      </DetailModal>
    </section>
  );
}
