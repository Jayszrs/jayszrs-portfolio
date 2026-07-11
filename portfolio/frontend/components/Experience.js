"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays,
  CircleCheck, MapPin, Wrench,
} from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";
import MediaPreview from "@/frontend/components/MediaPreview";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";
import { documentationImages } from "@/frontend/lib/documentation";
import { externalUrl } from "@/frontend/lib/urls";

const ORDER = ["Semua", "Proyek", "Magang", "Kerja", "Volunteer", "Organisasi"];

function periodOf(item) {
  return item.period || [item.startDate, item.endDate || "Sekarang"].filter(Boolean).join(" — ");
}

function documentationFileOf(item = {}) {
  return item.documentationFile || "";
}

function orgLinkOf(item = {}) {
  return item.orgLink || item.organizationLink || item.companyLink || item.website || "";
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
  const [preview, setPreview] = useState(null);
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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:relative sm:mt-10 sm:block sm:space-y-6 sm:border-l sm:border-line sm:pl-9">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="glass group relative block h-full w-full rounded-2xl text-left hover:-translate-y-0.5 hover:shadow-glass-lg"
            >
              <span className="absolute -left-[2.8rem] top-7 hidden h-3 w-3 rounded-full bg-emerald ring-4 ring-emerald-soft sm:block" />
              <div className="grid overflow-hidden rounded-2xl sm:grid-cols-[220px_1fr]">
                <SafeImage
                  src={item.image}
                  alt={item.org || item.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 44vw, 220px"
                  className="h-24 w-full sm:h-full"
                  imgClassName="h-full w-full bg-surface object-contain p-3 sm:p-5"
                  fallback={<LogoFallback label={item.org || item.title} icon={Building2} />}
                />
                <div className="flex h-full flex-col p-3 sm:block sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <span className="rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-emerald-deep sm:px-3 sm:py-1 sm:text-xs">{item.type}</span>
                    <span className="hidden text-xs text-muted sm:inline">{periodOf(item)}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-display text-sm font-semibold leading-tight text-ink sm:mt-4 sm:text-xl">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-emerald-deep sm:text-sm">{item.org}</p>
                  <p className="mt-1 text-[10px] text-muted sm:hidden">{periodOf(item)}</p>
                  <p className="mt-3 hidden line-clamp-2 text-sm leading-relaxed text-muted sm:block">{item.description}</p>
                  {documentationImages(item).length > 0 && (
                    <div className="mt-4 hidden gap-2 sm:flex">
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
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-ink transition group-hover:text-emerald sm:mt-4 sm:pt-0 sm:text-sm">
                    Buka detail <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </button>
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
                  imgClassName="h-full w-full object-contain p-2"
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
                  {orgLinkOf(selected) && (
                    <a
                      href={externalUrl(orgLinkOf(selected))}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white"
                    >
                      Link instansi <ArrowUpRight size={15} />
                    </a>
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
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => {
                          const mediaItems = [
                            ...documentationImages(selected),
                            ...(looksLikeImage(documentationFileOf(selected)) ? [documentationFileOf(selected)] : []),
                          ].map((image, itemIndex) => ({
                            src: image,
                            title: `Dokumentasi pengalaman ${itemIndex + 1}`,
                          }));
                          setPreview({
                            items: mediaItems,
                            initialIndex: index,
                            title: `Dokumentasi pengalaman ${index + 1}`,
                          });
                        }}
                        className="group overflow-hidden rounded-2xl border border-line bg-surface text-left"
                      >
                        <SafeImage
                          src={src}
                          alt={`Dokumentasi pengalaman ${index + 1}`}
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
                {documentationFileOf(selected) && (
                  <button
                    type="button"
                    onClick={() => setPreview({ src: documentationFileOf(selected), title: "File dokumentasi pengalaman" })}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
                  >
                    Buka file dokumentasi <ArrowUpRight size={15} />
                  </button>
                )}
              </section>
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
