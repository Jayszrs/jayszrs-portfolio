"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import DetailModal from "@/frontend/components/DetailModal";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";

export default function Education({ items = [], section = {} }) {
  const [selected, setSelected] = useState(null);
  if (!items.length) return null;

  return (
    <section id="pendidikan" className="section-pad py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{section.eyebrow || "Academic journey"}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl">{section.title || "Pendidikan"}</h2>
          </div>
          <GraduationCap className="hidden text-emerald/25 sm:block" size={64} />
        </div>

        <div className="mt-8 grid gap-5">
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08 }}
              className="glass group grid gap-5 rounded-[1.5rem] p-5 text-left hover:-translate-y-0.5 hover:shadow-glass-lg sm:grid-cols-[1fr_auto] sm:rounded-[1.75rem] sm:p-8"
            >
              <div className="flex items-start gap-4">
                {item.logo && (
                  <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface p-2 sm:flex">
                    <SafeImage
                      src={item.logo}
                      alt={`Logo ${item.institution}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-contain"
                      fallback={<LogoFallback label={item.institution} icon={GraduationCap} />}
                    />
                  </span>
                )}
                <div>
                  <span className="rounded-full bg-emerald-soft px-3 py-1 font-mono text-xs text-emerald-deep">{item.period}</span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">{item.degree}</h3>
                  <p className="mt-1 text-base font-semibold text-emerald-deep">{item.institution}</p>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between gap-4 sm:items-end">
                {item.location && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                    <MapPin size={15} /> {item.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:text-emerald">
                  Buka detail <ArrowUpRight size={14} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={section.detailEyebrow || "Riwayat pendidikan"} title={selected?.institution} size="wide">
        {selected && (
          <div className="space-y-7">
            <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[80px_1fr] sm:p-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-soft">
                {selected.logo ? (
                  <SafeImage
                    src={selected.logo}
                    alt={`Logo ${selected.institution}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full"
                    imgClassName="h-full w-full object-contain p-2"
                    fallback={<LogoFallback label={selected.institution} icon={GraduationCap} />}
                  />
                ) : (
                  <GraduationCap size={34} className="text-emerald-deep" />
                )}
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink">{selected.degree}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-muted">
                    <CalendarDays size={15} /> {selected.period}
                  </span>
                  {selected.location && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-muted">
                      <MapPin size={15} /> {selected.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <section>
              <h3 className="flex items-center gap-2 border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">
                <BookOpen size={19} className="text-emerald" /> Fokus Pembelajaran
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{selected.focus || selected.description}</p>
            </section>
            {selected.activities && (
              <section>
                <h3 className="border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">Aktivitas & Pencapaian</h3>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{selected.activities}</p>
              </section>
            )}
            {selected.link && (
              <a href={selected.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
                Kunjungi institusi <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        )}
      </DetailModal>
    </section>
  );
}
