"use client";

import { Award, FileBadge } from "lucide-react";

function Card({ title, issuer, year, image, icon: Icon }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      {image ? (
        <div className="h-36 w-full overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-emerald-soft">
          <Icon size={30} className="text-emerald-deep" />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
        <p className="mt-1 text-sm text-muted">{issuer}</p>
        <p className="mt-1 font-mono text-xs text-emerald-deep">{year}</p>
      </div>
    </div>
  );
}

export default function Achievements({ achievements, certificates }) {
  return (
    <section id="pencapaian" className="section-pad py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Pengakuan</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Pencapaian & Sertifikat
        </h2>

        {achievements.length > 0 && (
          <div className="mt-10">
            <p className="mb-4 text-sm font-semibold text-ink/70">Pencapaian</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <Card key={a.id} {...a} icon={Award} />
              ))}
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="mt-12">
            <p className="mb-4 text-sm font-semibold text-ink/70">Sertifikat</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((c) => (
                <Card key={c.id} {...c} icon={FileBadge} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
