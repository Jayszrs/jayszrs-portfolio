"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Github, GitCommitHorizontal, Instagram, RefreshCw, Star } from "lucide-react";
import TikTokIcon from "./TikTokIcon";

function account(value, host, pattern) {
  try {
    const url = new URL(value);
    if (![host, `www.${host}`].includes(url.hostname)) return null;
    const handle = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    return pattern.test(handle || "") ? { handle, url: `https://${host}/${host === "tiktok.com" ? "@" : ""}${handle}` } : null;
  } catch { return null; }
}

function ProfileLink({ profile, children = "Buka profil" }) {
  return <a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-emerald/40 hover:text-emerald-deep">{children}<ArrowUpRight size={14} /></a>;
}

function GitHubActivity({ profile }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/social", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const value = await response.json();
      if (!value.github) throw new Error("Unavailable");
      setData(value.github); setStatus("ready");
    }).catch((error) => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [attempt]);

  if (status === "loading") return <div role="status" className="flex min-h-72 items-center justify-center gap-3 text-sm text-muted"><RefreshCw size={18} className="animate-spin motion-reduce:animate-none" />Memuat aktivitas GitHub…</div>;
  if (status === "error") return <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"><Github size={32} className="text-emerald-deep" /><p className="max-w-sm text-sm leading-6 text-muted">Aktivitas belum dapat dimuat. Profil GitHub tetap bisa dibuka.</p><div className="flex gap-2"><button onClick={() => setAttempt((n) => n + 1)} className="rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white">Coba lagi</button><ProfileLink profile={profile} /></div></div>;
  const colors = ["bg-line/55", "bg-emerald/20", "bg-emerald/40", "bg-emerald/70", "bg-emerald"];
  const days = data.days || [];
  return <div className="grid gap-7 lg:grid-cols-[1.35fr_1fr]">
    <div>
      <div className="flex flex-wrap items-center gap-6">
        {[ [data.totalContributions, "Kontribusi · 12 bulan"], [data.repositories, "Repositori publik"], [data.followers, "Pengikut"] ].map(([value, label]) => <div key={label}><p className="font-display text-3xl font-semibold tracking-tight text-ink">{value === null ? "—" : value.toLocaleString("id-ID")}</p><p className="mt-1 text-xs text-muted">{label}</p></div>)}
      </div>
      {days.length > 0 && <div className="mt-7 rounded-2xl border border-line bg-paper/60 p-4">
        <div className="overflow-x-auto pb-2" tabIndex={0} role="region" aria-label="Kalender kontribusi GitHub, geser untuk melihat seluruh tahun">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">{days.map((day) => <span key={day.date} title={`${day.count} kontribusi · ${day.date}`} aria-label={`${day.count} kontribusi pada ${day.date}`} className={`h-[11px] w-[11px] rounded-[3px] ${colors[day.level]}`} />)}</div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-muted"><span>{days[0]?.date} — {days[days.length - 1]?.date}</span><div className="flex items-center gap-1.5"><span>Sedikit</span>{colors.map((color) => <span key={color} className={`h-2.5 w-2.5 rounded-sm ${color}`} />)}<span>Banyak</span></div></div>
      </div>}
      <p className="mt-4 text-xs leading-6 text-muted">Aktivitas publik dari GitHub. Diperbarui berkala; kontribusi privat mengikuti pengaturan profil.</p>
    </div>
    <div>
      <div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-ink">Top kontribusi commit</h4><GitCommitHorizontal size={18} className="text-emerald" /></div>
      <p className="mb-4 text-xs leading-5 text-muted">Di {data.rankedRepositoryCount} repositori publik milik {profile.handle}.</p>
      <div className="space-y-2">{data.topRepositories.map((repo, index) => <a key={repo.url} href={repo.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-line bg-surface/70 p-3 transition hover:border-emerald/40"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-soft text-xs font-semibold text-emerald-deep">0{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink group-hover:text-emerald-deep">{repo.name}</p><p className="mt-1 flex gap-3 text-[11px] text-muted"><span>{repo.commits === null ? repo.language || "Repositori" : `${repo.commits.toLocaleString("id-ID")} commit`}</span><span className="inline-flex items-center gap-1"><Star size={11} />{repo.stars}</span></p></div><ArrowUpRight size={15} className="shrink-0 text-muted" /></a>)}</div>
    </div>
  </div>;
}

function TikTokFeed({ profile }) {
  const ref = useRef(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    const root = ref.current;
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js"; script.async = true;
    script.onerror = () => setState("error");
    root.appendChild(script);
    const observer = new MutationObserver(() => { if (root.querySelector("iframe")) setState("ready"); });
    observer.observe(root, { childList: true, subtree: true });
    const timeout = setTimeout(() => setState((value) => value === "ready" ? value : "error"), 15000);
    return () => { clearTimeout(timeout); observer.disconnect(); script.remove(); };
  }, [profile.handle]);
  return <div>
    <div ref={ref} className="mx-auto min-h-64 max-w-3xl overflow-hidden rounded-2xl bg-white text-ink">
      <blockquote className="tiktok-embed" cite={profile.url} data-unique-id={profile.handle} data-embed-type="creator" data-embed-from="oembed" style={{ maxWidth: 720, minWidth: 288, margin: "0 auto" }}><section><a href={profile.url} target="_blank" rel="noreferrer">@{profile.handle}</a></section></blockquote>
    </div>
    {state === "loading" && <p role="status" className="mt-3 text-center text-xs text-muted">Memuat unggahan terbaru dari TikTok…</p>}
    {state === "error" && <p className="mt-3 text-center text-sm text-muted">Embed TikTok belum bisa dimuat di browser ini. <a className="font-semibold text-emerald-deep underline" href={profile.url} target="_blank" rel="noreferrer">Buka TikTok</a></p>}
    <p className="mt-5 text-center text-xs leading-6 text-muted">Video unggahan terbaru melalui embed resmi TikTok. Repost dapat dilihat langsung di profil.</p>
  </div>;
}

export default function SocialMedia({ socials = {} }) {
  const profiles = {
    github: account(socials.github, "github.com", /^[\w-]+$/),
    instagram: account(socials.instagram, "instagram.com", /^[\w.]+$/),
    tiktok: account(socials.tiktok, "tiktok.com", /^[\w.]+$/),
  };
  const options = [{ id: "github", label: "GitHub", icon: Github }, { id: "instagram", label: "Instagram", icon: Instagram }, { id: "tiktok", label: "TikTok", icon: TikTokIcon }].filter((p) => profiles[p.id]);
  const [active, setActive] = useState(options[0]?.id);
  if (!options.length) return null;
  const selected = options.find((p) => p.id === active) || options[0];
  const profile = profiles[selected.id];
  const Icon = selected.icon;
  return <section id="sosial-media" className="section-pad py-16 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <p className="eyebrow">Di luar portofolio</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-6"><div><h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Cerita, karya, dan aktivitas.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted">Ikuti yang sedang saya bangun, bagikan, dan eksplorasi di media sosial.</p></div><span className="rounded-full border border-emerald/20 bg-emerald-soft px-4 py-2 text-xs font-semibold text-emerald-deep">Profil & aktivitas publik</span></div>
      <div className="glass mt-8 overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div role="tablist" aria-label="Platform sosial media" className="flex flex-wrap gap-2">{options.map((option, index) => { const TabIcon = option.icon; return <button key={option.id} role="tab" id={`social-tab-${option.id}`} aria-selected={selected.id === option.id} aria-controls="social-panel" tabIndex={selected.id === option.id ? 0 : -1} onClick={() => setActive(option.id)} onKeyDown={(event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length; setActive(options[next].id); document.getElementById(`social-tab-${options[next].id}`)?.focus(); }} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${selected.id === option.id ? "bg-ink text-paper shadow-sm" : "text-muted hover:bg-emerald-soft hover:text-emerald-deep"}`}><TabIcon size={16} />{option.label}</button>; })}</div>
          <ProfileLink profile={profile}>@{profile.handle}</ProfileLink>
        </div>
        <div role="tabpanel" id="social-panel" aria-labelledby={`social-tab-${selected.id}`} className="p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep"><Icon size={20} /></span><div><h3 className="text-sm font-semibold text-ink">{selected.label === "GitHub" ? "Jejak kontribusi" : selected.label === "Instagram" ? "Momen dan cerita" : "Video terbaru"}</h3><p className="mt-1 text-xs text-muted">@{profile.handle}</p></div></div>
          {selected.id === "github" && <GitHubActivity profile={profile} />}
          {selected.id === "tiktok" && <TikTokFeed key={profile.handle} profile={profile} />}
          {selected.id === "instagram" && <div><div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-white"><iframe title={`Profil Instagram @${profile.handle}`} src={`${profile.url}/embed/`} loading="lazy" className="h-[560px] w-full border-0" allowTransparency referrerPolicy="strict-origin-when-cross-origin" /></div><div className="mt-5 flex flex-wrap items-center justify-center gap-4"><p className="max-w-lg text-center text-xs leading-6 text-muted">Postingan publik ditampilkan sesuai izin embed Instagram. Story, Notes, dan musik tersedia langsung di Instagram.</p><ProfileLink profile={profile}>Lihat Instagram</ProfileLink></div></div>}
        </div>
      </div>
    </div>
  </section>;
}
