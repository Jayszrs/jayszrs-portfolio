"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays,
  CircleCheck, MapPin, Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import DetailModal from "@/frontend/components/DetailModal";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";
import { documentationImages } from "@/frontend/lib/documentation";

const ORDER = ["Semua", "Proyek", "Magang", "Kerja", "Volunteer", "Organisasi"];

function periodOf(item) {
  return item.period || [item.startDate, item.endDate || "Sekarang"].filter(Boolean).join(" — ");
}

function documentationFileOf(item = {}) {
  return item.documentationFile || item.link || "";
}

function looksLikeImage(src = "") {
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(src);
}

export default function Experience({ items = [], section = {} }) {
  const available = useMemo(
    () => ORDER.filter((type) => type === "Semua" || items.some((item) => item.type === type)),
    [items]
  );
  const [active, setActive] = useState("Semua");
  const [selected, setSelected] = useState(null);
  const filtered = active === "Semua" ? items : items.filter((item) => item.type === active);

  return (
    <section id="pengalaman" className="section-pad py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">{section.eyebrow || "Rekam Jejak"}</p>
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{section.title || "Pengalaman"}</h2>
            <p className="mt-2 text-sm text-muted">{section.description || "Klik pengalaman untuk membuka cerita dan kontribusi lengkap."}</p>
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {available.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActive(type)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active === type ? "bg-ink text-paper" : "border border-line bg-surface/70 text-muted hover:text-ink"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-10 space-y-6 border-l border-line pl-7 sm:pl-9">
          {filtered.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.06 }}
              className="glass group relative block w-full rounded-2xl text-left hover:-translate-y-0.5 hover:shadow-glass-lg"
            >
              <span className="absolute -left-[2.2rem] top-7 h-3 w-3 rounded-full bg-emerald ring-4 ring-emerald-soft sm:-left-[2.8rem]" />
              <div className="grid overflow-hidden rounded-2xl sm:grid-cols-[220px_1fr]">
                <SafeImage
                  src={item.image}
                  alt={item.org || item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-full sm:h-full"
                  imgClassName={`h-full w-full ${item.type === "Organisasi" ? "bg-surface object-contain p-5" : "object-cover"}`}
                  fallback={<LogoFallback label={item.org || item.title} icon={Building2} />}
                />
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-deep">{item.type}</span>
                    <span className="text-xs text-muted">{periodOf(item)}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium text-emerald-deep">{item.org}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>
                  {documentationImages(item).length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {documentationImages(item).slice(0, 3).map((src, imageIndex) => (
                        <span key={`${src}-${imageIndex}`} className="h-12 w-16 overflow-hidden rounded-xl border border-line bg-surface">
                          <SafeImage
                            src={src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            sizes="64px"
                            className="h-full w-full"
                            imgClassName="h-full w-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:text-emerald">
                    Buka detail <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <DetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow={selected?.type}
        title={selected?.org}
        size="wide"
      >
        {selected && (
          <div className="space-y-7">
            <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[88px_1fr] sm:p-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-soft">
                <SafeImage
                  src={selected.image}
                  alt={selected.org || selected.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full"
                  imgClassName={`h-full w-full ${selected.type === "Organisasi" ? "object-contain p-2" : "object-cover"}`}
                  fallback={<LogoFallback label={selected.org || selected.title} icon={Building2} />}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <BriefcaseBusiness size={16} className="text-emerald" /> {selected.title}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-muted">
                    <CalendarDays size={15} /> {periodOf(selected)}
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
                <Building2 size={19} className="text-emerald" /> Latar Belakang
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">
                {selected.companyBackground || selected.description || "Deskripsi latar belakang belum ditambahkan."}
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">
                <CircleCheck size={19} className="text-emerald" /> Peran & Kontribusi
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">
                {selected.responsibilities || selected.description || "Detail kontribusi belum ditambahkan."}
              </p>
              {selected.workingUnit && (
                <div className="mt-4 rounded-xl bg-emerald-soft p-4 text-sm">
                  <span className="font-semibold text-ink">Unit kerja:</span>{" "}
                  <span className="text-emerald-deep">{selected.workingUnit}</span>
                </div>
              )}
            </section>

            {selected.tools && (
              <section>
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                  <Wrench size={18} className="text-emerald" /> Tools & Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.tools.split(",").map((tool) => tool.trim()).filter(Boolean).map((tool) => (
                    <span key={tool} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink/75">{tool}</span>
                  ))}
                </div>
              </section>
            )}

            {(documentationImages(selected).length > 0 || documentationFileOf(selected)) && (
              <section>
                <h3 className="flex items-center gap-2 border-b border-emerald/25 pb-3 font-display text-xl font-semibold text-ink">
                  <ArrowUpRight size={19} className="text-emerald" /> Dokumentasi
                </h3>
                {(documentationImages(selected).length > 0 || looksLikeImage(documentationFileOf(selected))) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[...documentationImages(selected), ...(looksLikeImage(documentationFileOf(selected)) ? [documentationFileOf(selected)] : [])].map((src, index) => (
                      <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-line bg-surface">
                        <SafeImage
                          src={src}
                          alt={`Dokumentasi pengalaman ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
                          className="h-48 w-full"
                          imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                )}
                {documentationFileOf(selected) && (
                  <a href={documentationFileOf(selected)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
                    Buka file dokumentasi <ArrowUpRight size={15} />
                  </a>
                )}
              </section>
            )}
          </div>
        )}
      </DetailModal>
    </section>
  );
}
