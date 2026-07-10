"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, CalendarDays, Code2, Image as ImageIcon, ListChecks, UserRound } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";
import MediaPreview from "@/frontend/components/MediaPreview";
import SafeImage from "@/frontend/components/SafeImage";
import { documentationImages } from "@/frontend/lib/documentation";
import { externalUrl } from "@/frontend/lib/urls";

function CaseStudySection({ title, children }) {
  if (!children) return null;

  return (
    <section className="scroll-mt-24">
      <h3 className="border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{children}</p>
    </section>
  );
}

export default function Gallery({ items = [], section = {} }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) return;
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
    <section id="proyek" className="section-pad py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{section.eyebrow || "Portofolio"}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              {section.title || "Proyek Terpilih"}
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
          className="mt-8 flex gap-4 overflow-x-auto scroll-smooth pb-4 sm:mt-10 sm:gap-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="glass group w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl text-left transition hover:-translate-y-1 hover:shadow-glass-lg sm:w-[340px] sm:max-w-none"
            >
              <div className="h-44 w-full overflow-hidden">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 82vw, 340px"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
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

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={section.detailEyebrow || "Project case study"} title={selected?.title} size="wide">
        {selected && (
          <div className="space-y-7">
            {selected.image && (
              <button
                type="button"
                onClick={() => {
                  const mediaItems = [
                    selected.image,
                    ...documentationImages(selected),
                  ].filter(Boolean).map((image, index) => ({
                    src: image,
                    title: index === 0 ? selected.title : `Dokumentasi ${selected.title} ${index}`,
                  }));
                  setPreview({ items: mediaItems, initialIndex: 0, title: selected.title });
                }}
                className="h-64 w-full overflow-hidden rounded-2xl bg-ink text-left sm:h-80"
              >
                <SafeImage
                  src={selected.image}
                  alt={selected.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 90vw, 800px"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </button>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {selected.role && (
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <UserRound size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Peran</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.role}</p>
                </div>
              )}
              {selected.period && (
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <CalendarDays size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Periode</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.period}</p>
                </div>
              )}
              {selected.techStack && (
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <Code2 size={18} className="text-emerald" />
                  <p className="mt-3 text-xs text-muted">Stack utama</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selected.techStack}</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                <ListChecks size={19} className="text-emerald" /> Ringkasan Case Study
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{selected.description || selected.background}</p>
            </div>
            <CaseStudySection title="Background">{selected.background}</CaseStudySection>
            <CaseStudySection title="Problem Identification">{selected.problem}</CaseStudySection>
            <CaseStudySection title="Apa yang Dibuat">{selected.whatBuilt}</CaseStudySection>
            <CaseStudySection title="Goals and Objectives">{selected.goals}</CaseStudySection>
            <CaseStudySection title="Roles and Responsibilities">{selected.responsibilities || selected.contribution}</CaseStudySection>
            <CaseStudySection title="Process and Execution">{selected.process}</CaseStudySection>
            <CaseStudySection title="Results">{selected.results}</CaseStudySection>
            <CaseStudySection title="Impact">{selected.impact}</CaseStudySection>
            {(selected.documentation || documentationImages(selected).length > 0) && (
              <section>
                <h3 className="flex items-center gap-2 border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">
                  <ImageIcon size={19} className="text-emerald" /> Bukti Dokumentasi
                </h3>
                {selected.documentation && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{selected.documentation}</p>
                )}
                {documentationImages(selected).length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {documentationImages(selected).map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => {
                          const mediaItems = [
                            selected.image,
                            ...documentationImages(selected),
                          ].filter(Boolean).map((image, itemIndex) => ({
                            src: image,
                            title: itemIndex === 0 ? selected.title : `Dokumentasi ${selected.title} ${itemIndex}`,
                          }));
                          setPreview({
                            items: mediaItems,
                            initialIndex: selected.image ? index + 1 : index,
                            title: `Dokumentasi ${selected.title} ${index + 1}`,
                          });
                        }}
                        className="group overflow-hidden rounded-2xl border border-line bg-surface text-left"
                      >
                        <SafeImage
                          src={src}
                          alt={`Dokumentasi ${selected.title} ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
                          className="h-48 w-full"
                          imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
            {selected.link && (
              <a href={externalUrl(selected.link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
                Buka proyek <ArrowUpRight size={15} />
              </a>
            )}
          </div>
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
