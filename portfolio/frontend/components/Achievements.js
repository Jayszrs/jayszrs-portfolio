"use client";

import { useState } from "react";
import { Award, CalendarDays, ExternalLink, FileBadge, FileText, Fingerprint } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";
import SafeImage, { LogoFallback } from "@/frontend/components/SafeImage";

function Card({ item, icon: Icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="glass group overflow-hidden rounded-2xl text-left transition duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
      {item.image ? (
        <SafeImage
          src={item.image}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="h-40 w-full overflow-hidden"
          imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fallback={<LogoFallback label={item.title || item.issuer} icon={Icon} />}
        />
      ) : item.logo ? (
        <SafeImage
          src={item.logo}
          alt={`Logo ${item.issuer}`}
          loading="lazy"
          decoding="async"
          className="flex h-40 w-full items-center justify-center bg-surface"
          imgClassName="h-full w-full object-contain p-7"
          fallback={<LogoFallback label={item.issuer || item.title} icon={Icon} />}
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-emerald-soft to-surface">
          <Icon size={34} className="text-emerald-deep" />
        </div>
      )}
      <div className="p-5">
        <h4 className="font-display text-base font-semibold text-ink">{item.title}</h4>
        <p className="mt-1 text-sm text-muted">{item.issuer}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-xs text-emerald-deep">{item.issuedAt || item.year}</p>
          <span className="text-xs font-semibold text-ink/50 transition group-hover:text-emerald">Detail →</span>
        </div>
      </div>
    </button>
  );
}

export default function Achievements({ achievements = [], certificates = [], section = {} }) {
  const [selected, setSelected] = useState(null);

  return (
    <section id="pencapaian" className="section-pad py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">{section.eyebrow || "Pengakuan"}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{section.title || "Pencapaian & Sertifikat"}</h2>

        {achievements.length > 0 && (
          <div className="mt-10">
            <p className="mb-4 text-sm font-semibold text-ink/70">{section.achievementsLabel || "Pencapaian"}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((item) => (
                <Card key={item.id} item={item} icon={Award} onClick={() => setSelected({ ...item, kind: "Pencapaian" })} />
              ))}
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="mt-12">
            <p className="mb-4 text-sm font-semibold text-ink/70">{section.certificatesLabel || "Sertifikat"}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((item) => (
                <Card key={item.id} item={item} icon={FileBadge} onClick={() => setSelected({ ...item, kind: "Sertifikat" })} />
              ))}
            </div>
          </div>
        )}
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={selected?.kind} title={selected?.title} size="wide">
        {selected && (
          <>
            <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[88px_1fr] sm:p-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-soft">
                {selected.logo || selected.image ? (
                  <SafeImage
                    src={selected.logo || selected.image}
                    alt={`Logo ${selected.issuer}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full"
                    imgClassName="h-full w-full object-contain p-2"
                    fallback={<LogoFallback label={selected.issuer || selected.title} icon={FileBadge} />}
                  />
                ) : (
                  <FileBadge size={32} className="text-emerald-deep" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{selected.issuer}</p>
                {selected.description && <p className="mt-2 text-sm leading-relaxed text-muted">{selected.description}</p>}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <CalendarDays size={18} className="text-emerald" />
                <div>
                  <p className="text-xs text-muted">Diterbitkan</p>
                  <p className="text-sm font-semibold text-ink">{selected.issuedAt || selected.year || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <CalendarDays size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-muted">Kedaluwarsa</p>
                  <p className="text-sm font-semibold text-ink">{selected.expiresAt || "Tidak kedaluwarsa"}</p>
                </div>
              </div>
            </div>
            {selected.credentialId && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line p-4">
                <Fingerprint size={18} className="text-emerald" />
                <div className="min-w-0">
                  <p className="text-xs text-muted">Credential ID</p>
                  <p className="truncate font-mono text-sm font-medium text-ink">{selected.credentialId}</p>
                </div>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {selected.credentialUrl && (
                <a href={selected.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white">
                  Lihat credential <ExternalLink size={14} />
                </a>
              )}
              {selected.pdfUrl && (
                <a href={selected.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink">
                  Dokumentasi PDF <FileText size={14} />
                </a>
              )}
            </div>
          </>
        )}
      </DetailModal>
    </section>
  );
}
