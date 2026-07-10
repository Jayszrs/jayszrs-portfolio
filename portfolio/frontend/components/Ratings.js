"use client";

import { useState } from "react";
import { ArrowUpRight, Image as ImageIcon, Star } from "lucide-react";
import MediaPreview from "@/frontend/components/MediaPreview";
import SafeImage from "@/frontend/components/SafeImage";

function Stars({ value = 5 }) {
  const count = Math.max(1, Math.min(5, Number(value) || 5));

  return (
    <div className="flex items-center gap-1" aria-label={`${count} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          className={index < count ? "fill-amber-400 text-amber-400" : "text-muted/35"}
        />
      ))}
    </div>
  );
}

export default function Ratings({ items = [], section = {} }) {
  const [form, setForm] = useState({ name: "", role: "", stars: "5", comment: "", proofText: "", proofUrl: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const visibleItems = items.filter((item) => {
    const approved = item?.approved;
    const isApproved = approved === undefined || approved === true || approved === "true";
    return isApproved && (item?.name || item?.comment || item?.image);
  });

  const submitRating = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rating gagal dikirim.");
      setForm({ name: "", role: "", stars: "5", comment: "", proofText: "", proofUrl: "" });
      setStatus("Rating terkirim. Nanti tampil setelah dicek admin.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="rating" className="section-pad py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{section.eyebrow || "Rating pengunjung"}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              {section.title || "Bukti pengalaman orang yang pernah mampir."}
            </h2>
          </div>
          {section.description && (
            <p className="max-w-md text-sm leading-6 text-muted">{section.description}</p>
          )}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5 md:grid-cols-2">
            {visibleItems.map((item) => (
              <article key={item.id || `${item.name}-${item.date}`} className="glass overflow-hidden rounded-2xl">
                {item.image && (
                  <button
                    type="button"
                    onClick={() => setPreview({ src: item.image, title: item.name || "Dokumentasi rating" })}
                    className="h-52 w-full overflow-hidden bg-ink text-left"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.name || "Dokumentasi rating"}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 90vw, 50vw"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  </button>
                )}
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">{item.name || "Pengunjung"}</h3>
                      {(item.role || item.date) && (
                        <p className="mt-1 text-xs text-muted">{[item.role, item.date].filter(Boolean).join(" - ")}</p>
                      )}
                    </div>
                    <Stars value={item.stars} />
                  </div>

                  {item.comment && <p className="whitespace-pre-line text-sm leading-7 text-muted">{item.comment}</p>}

                  {(item.proofText || item.proofUrl) && (
                    <div className="rounded-xl border border-line bg-surface/70 p-3 text-xs leading-5 text-muted">
                      <div className="mb-1 flex items-center gap-2 font-semibold text-ink">
                        <ImageIcon size={14} className="text-emerald" /> Bukti dokumentasi
                      </div>
                      {item.proofText && <p className="whitespace-pre-line">{item.proofText}</p>}
                      {item.proofUrl && (
                        <button
                          type="button"
                          onClick={() => setPreview({ src: item.proofUrl, title: `Bukti dokumentasi ${item.name || "rating"}` })}
                          className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-deep"
                        >
                          Lihat bukti <ArrowUpRight size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!visibleItems.length && (
              <div className="glass flex min-h-[260px] items-center rounded-2xl p-6">
                <p className="text-sm leading-7 text-muted">Belum ada rating yang ditampilkan.</p>
              </div>
            )}
          </div>

          <form onSubmit={submitRating} className="glass h-fit space-y-4 rounded-2xl p-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">Kasih rating</h3>
              <p className="mt-1 text-xs leading-5 text-muted">Rating masuk sebagai pending dulu sebelum tampil.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/70">Bintang</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, stars: String(value) }))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-amber-400 transition hover:border-amber-300"
                    aria-label={`${value} bintang`}
                  >
                    <Star size={16} className={value <= Number(form.stars) ? "fill-amber-400" : ""} />
                  </button>
                ))}
              </div>
            </div>
            <input className="field" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nama" required />
            <input className="field" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} placeholder="Role / asal" />
            <textarea className="field min-h-28 resize-y" value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Deskripsi rating" required />
            <textarea className="field min-h-20 resize-y" value={form.proofText} onChange={(event) => setForm((current) => ({ ...current, proofText: event.target.value }))} placeholder="Catatan bukti dokumentasi" />
            <input className="field" value={form.proofUrl} onChange={(event) => setForm((current) => ({ ...current, proofUrl: event.target.value }))} placeholder="Link bukti dokumentasi" />
            {status && <p className="text-xs leading-5 text-muted">{status}</p>}
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Mengirim..." : "Kirim rating"}
            </button>
          </form>
        </div>
      </div>
      <MediaPreview src={preview?.src} title={preview?.title} onClose={() => setPreview(null)} />
    </section>
  );
}
