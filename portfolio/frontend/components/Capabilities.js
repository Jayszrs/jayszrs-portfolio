"use client";

import { useState } from "react";
import { CalendarDays, Code2, MonitorCog, Palette, Sparkles } from "lucide-react";
import DetailModal from "@/frontend/components/DetailModal";
import BrandIcon from "@/frontend/components/BrandIcon";

const GROUPS = [
  {
    key: "editingSoftware",
    eyebrow: "Creative toolkit",
    title: "Software Editing",
    shortTitle: "Software",
    description: "Perangkat yang saya gunakan untuk desain, video, dan motion.",
    icon: Palette,
  },
  {
    key: "programming",
    eyebrow: "Development",
    title: "Programming Skill",
    shortTitle: "Programming",
    description: "Bahasa dan framework yang saya gunakan untuk membangun produk.",
    icon: Code2,
  },
  {
    key: "operatingSystems",
    eyebrow: "Daily environment",
    title: "Operating System",
    shortTitle: "Operating System",
    description: "Sistem operasi yang terbiasa saya gunakan dan kelola.",
    icon: MonitorCog,
  },
];

export default function Capabilities({ capabilities }) {
  const [activeKey, setActiveKey] = useState(GROUPS[0].key);
  const [selected, setSelected] = useState(null);
  const activeGroup = GROUPS.find((group) => group.key === activeKey) || GROUPS[0];
  const items = capabilities?.[activeGroup.key] || [];
  const ActiveIcon = activeGroup.icon;

  return (
    <section id="keahlian" className="section-pad scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-glass backdrop-blur-xl">
          <div className="border-b border-line/80 p-5 sm:p-7">
            <p className="eyebrow">Toolbox & workflow</p>
            <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Keahlian yang saya pakai.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  Bukan sekadar daftar nama—setiap item bisa dibuka untuk melihat sejak kapan dan bagaimana saya menggunakannya.
                </p>
              </div>
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-white/70 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {GROUPS.map((group) => {
                  const Icon = group.icon;
                  const active = activeKey === group.key;
                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => setActiveKey(group.key)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active ? "bg-ink text-white shadow-sm" : "text-muted hover:bg-emerald-soft hover:text-ink"
                      }`}
                    >
                      <Icon size={16} /> {group.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-emerald-deep">
                  <ActiveIcon size={16} />
                  <p className="eyebrow">{activeGroup.eyebrow}</p>
                </div>
                <h3 className="font-display text-3xl font-semibold text-ink">{activeGroup.title}</h3>
              </div>
              <p className="max-w-md text-sm text-muted">{activeGroup.description}</p>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected({ ...item, group: activeGroup.title })}
                  className="group flex min-h-48 flex-col items-start rounded-[1.5rem] border border-line bg-white p-6 text-left shadow-[0_8px_30px_rgba(20,22,26,.05)] transition duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-glass-lg"
                >
                  <BrandIcon name={item.name} />
                  <span className="mt-5 font-display text-lg font-semibold text-ink">{item.name}</span>
                  <span className="mt-1.5 text-sm text-muted">Sejak {item.since || "—"} · {item.level || "Belajar"}</span>
                  <span className="mt-auto pt-4 text-xs font-semibold text-emerald-deep transition sm:opacity-0 sm:group-hover:opacity-100">
                    Lihat detail <span aria-hidden="true">→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DetailModal open={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={selected?.group} title={selected?.name}>
        {selected && (
          <>
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
              <BrandIcon name={selected.name} size="modal" />
              <div>
                <p className="text-xs font-medium text-muted">Tingkat penguasaan</p>
                <p className="font-display text-lg font-semibold text-ink">{selected.level || "Sedang dipelajari"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-4">
              <CalendarDays size={18} className="text-emerald" />
              <div>
                <p className="text-xs text-muted">Mulai digunakan</p>
                <p className="text-sm font-semibold text-ink">{selected.since || "Belum diisi"}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/65">Penggunaan</p>
              </div>
              <p className="text-sm leading-relaxed text-muted">{selected.usage || "Catatan penggunaan belum diisi."}</p>
            </div>
          </>
        )}
      </DetailModal>
    </section>
  );
}
