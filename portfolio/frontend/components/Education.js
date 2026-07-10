"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import DetailModal from "@/frontend/components/DetailModal";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";

function documentationImages(item = {}) {
  return [item.documentationImage, item.documentationImage2, item.documentationImage3]
    .filter((src) => String(src || "").trim());
}

function educationLogoSource(item = {}) {
  return String(item.logo || item.institutionLogo || item.schoolLogo || item.campusLogo || "").trim();
}

export default function Education({ items = [], section = {} }) {
  const [selected, setSelected] = useState(null);
  if (!items.length) return null;

  return (
    <section id="pendidikan" className="section-pad scroll-mt-28 py-14 sm:scroll-mt-32 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{section.eyebrow || "Academic journey"}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl">{section.title || "Pendidikan"}</h2>
          </div>
          <GraduationCap className="hidden text-emerald/25 sm:block" size={64} />
        </div>

        <div className="mt-8 grid gap-5">
          {items.map((item, index) => {
            const logoSrc = educationLogoSource(item);

            return (
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
                  {logoSrc && (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface p-2 sm:h-16 sm:w-16">
                      <SafeImage
                        src={logoSrc}
                        alt={`Logo ${item.institution}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full"
                        imgClassName="h-full w-full object-contain"
                        fallback={<LogoFallback label={item.institution} icon={GraduationCap} />}
                      />
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="rounded-full bg-emerald-soft px-3 py-1 font-mono text-xs text-emerald-deep">{item.period}</span>
                    <h3 className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">{item.degree}</h3>
                    <p className="mt-1 text-base font-semibold text-emerald-deep">{item.institution}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{item.description}</p>
                    {documentationImages(item).length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {documentationImages(item).slice(0, 3).map((src, imageIndex) => (
                          <span key={`${src}-${imageIndex}`} className="h-14 w-20 overflow-hidden rounded-xl border border-line bg-surface">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </span>
                        ))}
                      </div>
                    )}
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
            );
          })}
        </div>
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={section.detailEyebrow || "Riwayat pendidikan"} title={selected?.institution} size="wide">
        {selected && (
          <div className="space-y-7">
            <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[80px_1fr] sm:p-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-soft">
                {educationLogoSource(selected) ? (
                  <SafeImage
                    src={educationLogoSource(selected)}
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
            {(documentationImages(selected).length > 0 || selected.documentationFile) && (
              <section>
                <h3 className="border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">Dokumentasi Pendidikan</h3>
                {documentationImages(selected).length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {documentationImages(selected).map((src, index) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-line bg-surface">
                        <img src={src} alt={`Dokumentasi pendidikan ${index + 1}`} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                      </a>
                    ))}
                  </div>
                )}
                {selected.documentationFile && (
                  <a href={selected.documentationFile} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
                    Buka file dokumentasi <ArrowUpRight size={15} />
                  </a>
                )}
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
