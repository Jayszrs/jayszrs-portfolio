"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Building2, Check, ChevronDown, Code2, ExternalLink, GitCommitHorizontal, Github, Instagram, MapPin, Music2, Play, RefreshCw, Repeat2, Star, Users } from "lucide-react";
import SafeImage from "./SafeImage";
import TikTokIcon from "./TikTokIcon";
import githubSnapshot from "@/frontend/lib/github-profile-snapshot.json";

function account(value, host, pattern) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || ![host, `www.${host}`].includes(url.hostname)) return null;
    const handle = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    return pattern.test(handle || "") ? { handle, url: `https://${host}/${host === "tiktok.com" ? "@" : ""}${handle}` } : null;
  } catch { return null; }
}

function ProfileLink({ profile, children = "Buka profil", primary = false }) {
  return <a href={profile.url} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${primary ? "bg-ink text-paper hover:bg-emerald-deep hover:text-white" : "border border-line bg-surface text-ink hover:border-emerald/40 hover:text-emerald-deep"}`}>{children}<ArrowUpRight size={14} /></a>;
}

function ContributionCalendar({ days = [], total, loading = false }) {
  const colors = ["bg-line/65", "bg-emerald/20", "bg-emerald/40", "bg-emerald/70", "bg-emerald"];
  const offset = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
  const weeks = Math.ceil((days.length + offset) / 7);
  const months = Array.from({ length: weeks }, (_, index) => {
    const day = days[Math.max(0, index * 7 - offset)];
    if (!day) return "";
    const date = new Date(`${day.date}T00:00:00Z`);
    return index === 0 || date.getUTCDate() <= 7 ? date.toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" }) : "";
  });
  return <div className="min-w-0 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
    <div className="mb-5 flex items-center justify-between gap-3"><h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><GitCommitHorizontal size={17} className="text-emerald-deep" />Setahun membangun</h4><span className="text-[10px] text-muted">12 bulan terakhir</span></div>
    {days.length > 0 ? <>
      <div tabIndex={0} role="region" aria-label="Kalender kontribusi GitHub; geser untuk melihat seluruh tahun" className="overflow-x-auto pb-3 focus-visible:outline-emerald">
        <div className="w-max">
          <div className="mb-2 ml-7 grid gap-[3px] text-[9px] text-muted" style={{ gridTemplateColumns: `repeat(${weeks}, 11px)` }}>{months.map((month, index) => <span key={index} className="overflow-visible whitespace-nowrap">{month}</span>)}</div>
          <div className="flex gap-2">
            <div aria-hidden="true" className="grid w-5 grid-rows-7 gap-[3px] text-[8px] leading-[11px] text-muted">{["", "Sen", "", "Rab", "", "Jum", ""].map((label, index) => <span key={index}>{label}</span>)}</div>
            <div role="img" aria-label={`${total?.toLocaleString("id-ID")} kontribusi, ${days[0].date} sampai ${days[days.length - 1].date}`} className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
              {Array.from({ length: offset }, (_, index) => <span key={`pad-${index}`} aria-hidden="true" className="h-[11px] w-[11px]" />)}
              {days.map((day) => <span key={day.date} title={`${day.count.toLocaleString("id-ID")} kontribusi · ${day.date}`} className={`h-[11px] w-[11px] rounded-[3px] transition hover:ring-2 hover:ring-emerald/40 ${colors[day.level] || colors[0]}`} />)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted"><span>Setiap kotak, satu hari.</span><div className="flex items-center gap-1.5"><span>Sedikit</span>{colors.map((color) => <span key={color} className={`h-2.5 w-2.5 rounded-sm ${color}`} />)}<span>Banyak</span></div></div>
    </> : loading ? <div role="status" className="flex min-h-40 items-center justify-center gap-2 rounded-xl bg-emerald-soft/30 text-xs text-muted"><RefreshCw size={15} className="animate-spin motion-reduce:animate-none" />Memuat kalender kontribusi…</div> : <p className="py-8 text-center text-sm leading-6 text-muted">Kalender belum bisa dimuat. Aktivitas lengkap tersedia di GitHub.</p>}
  </div>;
}

function ReadmeProfile({ data, profile }) {
  const readme = data.readme;
  const featured = readme?.blocks?.filter((_, index) => index === 0 || index === 3) || [];
  const more = readme?.blocks?.filter((_, index) => index !== 0 && index !== 3) || [];
  return <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_1fr]">
    <aside className="relative overflow-hidden rounded-2xl border border-emerald/15 bg-gradient-to-br from-emerald-soft via-surface to-surface p-5 sm:p-6">
      <Github aria-hidden="true" size={116} strokeWidth={0.8} className="absolute -right-7 -top-7 text-emerald/10" />
      <div className="relative flex items-center gap-4 lg:block">
        <SafeImage src={data.avatar} alt={`Avatar GitHub ${profile.handle}`} unoptimized className="h-16 w-16 shrink-0 rounded-2xl border border-line bg-surface lg:h-20 lg:w-20" imgClassName="object-cover" fallback={<Github className="h-full w-full p-4 text-emerald-deep" />} />
        <div className="min-w-0 lg:mt-4"><h3 className="font-display text-xl font-semibold text-ink">{data.name || profile.handle}</h3><p className="mt-1 text-xs text-emerald-deep">@{profile.handle}</p></div>
      </div>
      {data.bio && <p className="relative mt-4 text-sm leading-6 text-muted">{data.bio}</p>}
      <div className="mt-4 space-y-2 text-xs text-muted">{data.company && <p className="flex items-start gap-2"><Building2 size={14} className="mt-0.5 shrink-0" />{data.company}</p>}{data.location && <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{data.location}</p>}</div>
      <div className="mt-5"><ProfileLink profile={profile} primary>Jelajahi GitHub</ProfileLink></div>
    </aside>
    <div className="min-w-0 rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-semibold text-emerald-deep"><BookOpen size={15} />{profile.handle} / README.md</p><a href={readme?.sourceUrl || `${profile.url}/${profile.handle}#readme`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-emerald-deep">Baca selengkapnya<ArrowUpRight size={12} /></a></div>
      {featured.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2">{featured.map((block) => <div key={block.label}><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">{block.label}</p><p className="text-sm leading-7 text-ink/85">{block.body}</p></div>)}</div> : <p className="mt-5 text-sm leading-7 text-muted">Temukan proyek, dokumentasi, dan hal yang sedang saya pelajari di profil GitHub.</p>}
      {more.length > 0 && <details className="group mt-5 border-t border-line pt-4"><summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-emerald-deep">Kolaborasi, minat & cerita lainnya<ChevronDown size={15} className="transition group-open:rotate-180" /></summary><div className="mt-5 grid gap-5 sm:grid-cols-2">{more.map((block) => <div key={block.label}><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{block.label}</p><p className="text-sm leading-7 text-ink/85">{block.body}</p></div>)}</div></details>}
      {readme?.technologies?.length > 0 && <div className="mt-5 border-t border-line pt-4"><p className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink"><Code2 size={15} className="text-emerald-deep" />Tech stack dari README</p><div className="flex flex-wrap gap-1.5">{readme.technologies.slice(0, 14).map((tech) => <span key={tech} className="rounded-lg border border-line bg-paper/60 px-2.5 py-1 text-[10px] font-medium text-ink/80">{tech}</span>)}</div>{readme.technologies.length > 14 && <details className="group mt-3"><summary className="cursor-pointer text-[11px] font-semibold text-emerald-deep">Lihat {readme.technologies.length - 14} lainnya</summary><div className="mt-3 flex flex-wrap gap-1.5">{readme.technologies.slice(14).map((tech) => <span key={tech} className="rounded-lg border border-line bg-paper/60 px-2.5 py-1 text-[10px] text-muted">{tech}</span>)}</div></details>}</div>}
    </div>
  </div>;
}

function GitHubActivity({ profile }) {
  const fallback = profile.handle.toLowerCase() === githubSnapshot.username.toLowerCase() ? githubSnapshot : { username: profile.handle };
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeout = setTimeout(() => controller.abort(), 25000);
    setStatus("loading");
    fetch("/api/social", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const value = await response.json();
      if (value.github?.username?.toLowerCase() !== profile.handle.toLowerCase()) throw new Error("Profile mismatch");
      if (!cancelled) {
        setData({ ...fallback, ...value.github, readme: value.github.readme || fallback.readme, readmeIsSnapshot: !value.github.readme });
        setStatus("ready");
      }
    }).catch(() => { if (!cancelled) setStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  // The configured handle identifies the verified fallback snapshot.
  }, [attempt, profile.handle]);
  const ranked = data.topRepositories || [];
  const maximum = Math.max(1, ...ranked.map((repo) => repo.commits || 0));
  return <div className="space-y-6">
    <ReadmeProfile data={data} profile={profile} />
    <div className="grid grid-cols-3 gap-2 sm:gap-4">{[
      [data.totalContributions, "Kontribusi setahun", GitCommitHorizontal],
      [data.repositories, "Repositori publik", Code2], [data.followers, "Pengikut", Users],
    ].map(([value, label, Icon]) => <div key={label} className="rounded-2xl border border-line bg-surface/60 p-3 sm:p-5"><Icon size={17} className="mb-3 text-emerald-deep" /><p className={`font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl ${status === "loading" && !Number.isFinite(value) ? "animate-pulse motion-reduce:animate-none" : ""}`}>{Number.isFinite(value) ? value.toLocaleString("id-ID") : "—"}</p><p className="mt-1.5 text-[10px] leading-4 text-muted sm:text-xs">{label}</p></div>)}</div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[1.3fr_1fr]">
      <ContributionCalendar days={data.days} total={data.totalContributions} loading={status === "loading"} />
      <div className="min-w-0 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-ink">{data.rankingKind === "recent-repositories" ? "Repositori terbaru" : "Top kontribusi commit"}</h4><Github size={17} className="text-emerald-deep" /></div>
        <p className="mt-2 text-[11px] leading-5 text-muted">{data.rankingKind === "recent-repositories" ? "Repositori publik yang terakhir diperbarui." : `Commit ${profile.handle} di repositori publik miliknya. ${data.verifiedRepositoryCount ?? "—"} dari ${data.rankedRepositoryCount ?? "—"} repositori terbaca.`}</p>
        <div className="mt-4 space-y-2">{ranked.map((repo, index) => <a key={repo.url} href={repo.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-line bg-paper/50 p-3 transition hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-emerald-soft/30"><span className="font-mono text-xs text-emerald-deep">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-ink group-hover:text-emerald-deep">{repo.name}</p><div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">{repo.language && <span>{repo.language}</span>}{Number.isFinite(repo.commits) && <span>{repo.commits.toLocaleString("id-ID")} commit</span>}<span className="inline-flex items-center gap-1"><Star size={10} />{repo.stars}</span></div>{Number.isFinite(repo.commits) && <div className="mt-2 h-1 overflow-hidden rounded-full bg-line/60"><div className="h-full rounded-full bg-emerald/70" style={{ width: `${Math.max(2, repo.commits / maximum * 100)}%` }} /></div>}</div><ArrowUpRight size={14} className="shrink-0 text-muted" /></a>)}</div>
        {!ranked.length && <p className="py-8 text-center text-xs leading-6 text-muted">{status === "loading" ? "Memuat repositori dari GitHub…" : "Daftar repositori tersedia langsung di profil GitHub."}</p>}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px] leading-5 text-muted"><p className="flex items-center gap-2">{status === "loading" ? <RefreshCw size={13} className="animate-spin motion-reduce:animate-none" /> : status === "ready" ? <Check size={13} className="text-emerald-deep" /> : <Github size={13} />}{status === "loading" ? "Memperbarui aktivitas publik…" : status === "ready" ? (data.readmeIsSnapshot ? "Aktivitas GitHub diperbarui; README memakai arsip terverifikasi." : "Profil dan README terhubung ke GitHub.") : "Aktivitas sementara belum terbaca. Arsip README tetap tersedia."}</p>{status === "error" && <button type="button" onClick={() => setAttempt((n) => n + 1)} className="inline-flex items-center gap-2 font-semibold text-emerald-deep"><RefreshCw size={12} />Coba lagi</button>}</div>
  </div>;
}

function TikTokProfile({ profile }) {
  return <div className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_1fr]">
    <div className="relative isolate overflow-hidden rounded-3xl border border-emerald/15 bg-gradient-to-br from-emerald-soft via-surface to-surface p-6 sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-3 h-64 w-64 rounded-full border border-emerald/10"><div className="absolute inset-7 rounded-full border border-emerald/15" /><div className="absolute inset-14 rounded-full border border-emerald/10" /></div>
      <span className="relative inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-[10px] font-semibold text-emerald-deep"><TikTokIcon size={12} />TikTok / @{profile.handle}</span>
      <h3 className="relative mt-7 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">Ide, cerita, dan sedikit<br /><span className="text-emerald-deep">sisi lainnya.</span></h3>
      <p className="relative mt-4 max-w-md text-sm leading-7 text-muted">Ruang untuk video pendek, hal yang menarik perhatian, dan konten yang saya bagikan kembali.</p>
      <div className="relative mt-7"><ProfileLink profile={profile} primary>Jelajahi TikTok saya</ProfileLink></div>
    </div>
    <div className="flex min-w-0 flex-col justify-between rounded-3xl border border-line bg-surface/60 p-6 sm:p-8">
      <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-paper"><TikTokIcon size={24} /></span><div><p className="font-display text-lg font-semibold text-ink">@{profile.handle}</p><p className="mt-1 text-xs text-muted">Temui saya di TikTok</p></div></div>
      <div className="my-6 space-y-2">{[
        [Play, "Unggahan", "Video dan cerita dalam format singkat"],
        [Repeat2, "Repost", "Konten yang saya bagikan kembali"],
        [Music2, "Suara & inspirasi", "Lanjutkan eksplorasi di profil TikTok"],
      ].map(([Icon, title, description]) => <a key={title} href={profile.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-line bg-paper/50 p-4 transition hover:border-emerald/35 hover:bg-emerald-soft/30"><Icon size={18} className="shrink-0 text-emerald-deep" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-ink">{title}</p><p className="mt-1 text-[11px] leading-5 text-muted">{description}</p></div><ArrowUpRight size={14} className="text-muted group-hover:text-emerald-deep" /></a>)}</div>
      <p className="text-[11px] leading-6 text-muted">Unggahan dan repost dibuka langsung di TikTok agar kamu bisa menonton dan berinteraksi di profil saya.</p>
    </div>
  </div>;
}

function InstagramProfile({ profile }) {
  const [preview, setPreview] = useState(true);
  const [failed, setFailed] = useState(false);
  return <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-3xl border border-line bg-gradient-to-br from-emerald-soft via-surface to-surface p-6 sm:p-9">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-emerald-deep"><Instagram size={24} /></span>
      <p className="mt-6 text-xs font-semibold text-emerald-deep">@{profile.handle}</p>
      <h3 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">Momen di<br />luar layar.</h3>
      <p className="mt-4 max-w-sm text-sm leading-7 text-muted">Potongan keseharian, pertemuan, dan cerita di balik perjalanan saya. Kenalan lebih dekat melalui Instagram.</p>
      <div className="mt-7 flex flex-wrap gap-3"><ProfileLink profile={profile} primary>Ikuti di Instagram</ProfileLink><button type="button" onClick={() => { setPreview((value) => !value); setFailed(false); }} aria-expanded={preview} aria-controls={`instagram-preview-${profile.handle}`} className="rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink hover:text-emerald-deep">{preview ? "Tutup pratinjau" : "Lihat pratinjau"}</button></div>
      <div className="mt-7 border-t border-line pt-5"><p className="text-xs font-semibold text-ink">Postingan, Story & Notes</p><p className="mt-2 max-w-sm text-xs leading-6 text-muted">Pratinjau menampilkan postingan publik. Untuk Story, Notes, dan musik, lanjutkan langsung di Instagram.</p></div>
    </div>
    <div id={`instagram-preview-${profile.handle}`} className="min-w-0">
      {preview && !failed ? <div className="mx-auto max-w-[510px] overflow-hidden rounded-3xl border border-line bg-white shadow-sm"><iframe key={profile.handle} title={`Postingan publik Instagram @${profile.handle}`} src={`${profile.url}/embed/`} loading="lazy" className="h-[610px] w-full border-0 sm:h-[650px]" onError={() => setFailed(true)} referrerPolicy="strict-origin-when-cross-origin" /><div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-xs text-gray-500"><span>Lebih banyak cerita di Instagram</span><a href={profile.url} target="_blank" rel="noreferrer" aria-label={`Buka Instagram ${profile.handle}`} className="font-semibold text-gray-800"><ExternalLink size={15} /></a></div></div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-surface/60 p-8 text-center"><Instagram size={32} className="text-emerald-deep" /><p className="max-w-xs text-sm leading-7 text-muted">{failed ? "Pratinjau belum tersedia. Momen terbaru tetap bisa dilihat di Instagram." : "Lihat momen terbaru langsung dari profil Instagram saya."}</p><ProfileLink profile={profile}>Buka Instagram</ProfileLink></div>}
    </div>
  </div>;
}

export default function SocialHub({ socials = {} }) {
  const profiles = {
    github: account(socials.github, "github.com", /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i),
    instagram: account(socials.instagram, "instagram.com", /^[\w.]+$/),
    tiktok: account(socials.tiktok, "tiktok.com", /^[\w.]+$/),
  };
  const options = [{ id: "github", label: "GitHub", icon: Github, detail: "Kode & kontribusi" }, { id: "instagram", label: "Instagram", icon: Instagram, detail: "Momen & cerita" }, { id: "tiktok", label: "TikTok", icon: TikTokIcon, detail: "Video & inspirasi" }].filter((option) => profiles[option.id]);
  const [active, setActive] = useState(options[0]?.id);
  if (!options.length) return null;
  const selected = options.find((option) => option.id === active) || options[0];
  const profile = profiles[selected.id];
  return <section id="sosial-media" className="section-pad py-16 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Terhubung, lebih dekat</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Kode, cerita, dan sisi lainnya.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted">Hal yang sedang saya bangun, pelajari, dan bagikan. Temukan semuanya di sini.</p></div><div className="flex gap-2" aria-label="Profil sosial">{options.map(({ id, label, icon: Icon }) => <a key={id} href={profiles[id].url} target="_blank" rel="noreferrer" aria-label={`Buka ${label} ${profiles[id].handle}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/70 text-muted transition hover:-translate-y-0.5 hover:border-emerald/40 hover:text-emerald-deep"><Icon size={17} /></a>)}</div></div>
      <div className="glass mt-8 overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface/50 px-3 py-3 sm:px-6 sm:py-4">
          <div role="tablist" aria-label="Platform sosial media" className="flex max-w-full gap-1 rounded-2xl border border-line bg-paper/50 p-1">{options.map((option, index) => { const Icon = option.icon; return <button key={option.id} type="button" role="tab" id={`social-tab-${option.id}`} aria-selected={selected.id === option.id} aria-controls={`social-panel-${option.id}`} tabIndex={selected.id === option.id ? 0 : -1} onClick={() => setActive(option.id)} onKeyDown={(event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length; setActive(options[next].id); document.getElementById(`social-tab-${options[next].id}`)?.focus(); }} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition sm:px-4 ${selected.id === option.id ? "bg-ink text-paper shadow-sm" : "text-muted hover:bg-emerald-soft hover:text-emerald-deep"}`}><Icon size={16} className="hidden min-[375px]:block" /><span><span className="block text-xs font-semibold sm:text-sm">{option.label}</span><span className={`mt-0.5 hidden text-[9px] sm:block ${selected.id === option.id ? "text-paper/60" : "text-muted"}`}>{option.detail}</span></span></button>; })}</div>
          <div className="hidden sm:block"><ProfileLink profile={profile}>@{profile.handle}</ProfileLink></div>
        </div>
        <div key={selected.id} role="tabpanel" id={`social-panel-${selected.id}`} aria-labelledby={`social-tab-${selected.id}`} tabIndex={0} className="min-w-0 p-4 focus-visible:outline-emerald sm:p-6 lg:p-8">
          {selected.id === "github" && <GitHubActivity key={profile.handle} profile={profile} />}
          {selected.id === "instagram" && <InstagramProfile key={profile.handle} profile={profile} />}
          {selected.id === "tiktok" && <TikTokProfile profile={profile} />}
        </div>
      </div>
    </div>
  </section>;
}
