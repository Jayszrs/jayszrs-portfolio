"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Github, Instagram, Music2 } from "lucide-react";
import TikTokIcon from "./TikTokIcon";
import curation from "@/frontend/lib/social-curation.json";

const GitHubProfile = dynamic(() => import("./GitHubProfile"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat profil dan README…</p> });
const TikTokVideos = dynamic(() => import("./TikTokVideos"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat video TikTok…</p> });

function account(value, host, pattern) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || ![host, `www.${host}`].includes(url.hostname)) return null;
    const handle = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    return pattern.test(handle || "") ? { handle, url: `https://${host}/${host === "tiktok.com" ? "@" : ""}${handle}` } : null;
  } catch { return null; }
}

function InstagramProfile({ profile, music }) {
  const [preview, setPreview] = useState(true);
  const [failed, setFailed] = useState(false);
  let trackId = "";
  try {
    const url = new URL(music?.spotifyUrl);
    if (url.protocol === "https:" && url.hostname === "open.spotify.com") trackId = /^\/track\/([a-zA-Z0-9]{22})\/?$/.exec(url.pathname)?.[1] || "";
  } catch { /* A missing or invalid music URL must not become an arbitrary iframe. */ }
  return <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-12">
    <div className="min-w-0 py-2 lg:py-5">
      <Instagram size={28} className="text-muted" />
      <h3 className="mt-5 text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">Di balik keseharian.</h3>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted">Momen, pertemuan, dan cerita yang saya bagikan di Instagram.</p>
      <a href={profile.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">@{profile.handle}<ArrowUpRight size={15} /></a>
      {music?.title && <section className="mt-8 border-t border-line pt-6" aria-label="Musik pilihan profil Instagram">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted"><Music2 size={15} />Musik di profil saya</p>
        <p className="mt-3 font-display text-xl font-semibold text-ink">{music.title}</p>
        <p className="mt-1 text-sm text-muted">{music.artist}</p>
        {trackId && <iframe src={`https://open.spotify.com/embed/track/${trackId}?theme=0`} title={`${music.title} — ${music.artist}`} width="100%" height="152" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" className="mt-5 rounded-xl border-0" />}
      </section>}
      <div className="mt-7 border-t border-line pt-4"><button type="button" onClick={() => { setPreview((value) => !value); setFailed(false); }} aria-expanded={preview} aria-controls={`instagram-preview-${profile.handle}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-ink underline-offset-4 hover:underline">{preview ? "Sembunyikan pratinjau postingan" : "Tampilkan postingan Instagram"}</button><p className="mt-2 max-w-sm text-xs leading-6 text-muted">Story dan Notes bisa dilihat langsung di Instagram.</p></div>
    </div>
    <div id={`instagram-preview-${profile.handle}`} className="min-w-0">
      {preview && !failed ? <div className="mx-auto max-w-[510px] overflow-hidden rounded-2xl border border-line bg-white"><iframe title={`Postingan publik Instagram @${profile.handle}`} src={`${profile.url}/embed/`} loading="lazy" className="h-[610px] w-full border-0 sm:h-[650px]" onError={() => setFailed(true)} referrerPolicy="strict-origin-when-cross-origin" /><a href={profile.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs font-semibold text-gray-700">Lihat lebih banyak di Instagram<ArrowUpRight size={15} /></a></div> : <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-paper/60 px-7 text-center"><Instagram size={28} className="text-muted" /><p className="max-w-xs text-sm leading-7 text-muted">{failed ? "Pratinjau belum bisa dimuat. Postingan tetap tersedia di Instagram." : "Pratinjau postingan disembunyikan."}</p><a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">Buka Instagram<ArrowUpRight size={15} /></a></div>}
    </div>
  </div>;
}

export default function SocialHub({ socials = {}, highlights }) {
  const profiles = {
    github: account(socials.github, "github.com", /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i),
    instagram: account(socials.instagram, "instagram.com", /^[\w.]+$/),
    tiktok: account(socials.tiktok, "tiktok.com", /^[\w.]+$/),
  };
  const options = [{ id: "github", label: "GitHub", icon: Github }, { id: "instagram", label: "Instagram", icon: Instagram }, { id: "tiktok", label: "TikTok", icon: TikTokIcon }].filter((option) => profiles[option.id]);
  const [active, setActive] = useState(options[0]?.id);
  if (!options.length) return null;
  const selected = options.find((option) => option.id === active) || options[0];
  const music = highlights?.instagramMusic ?? (profiles.instagram?.handle.toLowerCase() === curation.instagramHandle ? curation.instagramMusic : null);
  return <section id="sosial-media" className="section-pad py-14 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Di luar portofolio.</h2><p className="max-w-sm text-sm leading-7 text-muted">Profil, catatan, dan hal yang saya bagikan.</p></div>
      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-7">
          <div role="tablist" aria-label="Platform sosial media" className="flex max-w-full gap-1">
            {options.map((option, index) => { const Icon = option.icon; const chosen = selected.id === option.id; return <button key={option.id} type="button" role="tab" id={`social-tab-${option.id}`} aria-selected={chosen} aria-controls={`social-panel-${option.id}`} tabIndex={chosen ? 0 : -1} onClick={() => setActive(option.id)} onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
              setActive(options[next].id); document.getElementById(`social-tab-${options[next].id}`)?.focus();
            }} className={`inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition sm:px-5 ${chosen ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"}`}><Icon size={17} /><span>{option.label}</span></button>; })}
          </div>
          <a href={profiles[selected.id].url} target="_blank" rel="noreferrer" className="hidden min-h-11 items-center gap-2 text-xs font-semibold text-muted sm:inline-flex">@{profiles[selected.id].handle}<ArrowUpRight size={14} /></a>
        </div>
        <div key={selected.id} role="tabpanel" id={`social-panel-${selected.id}`} aria-labelledby={`social-tab-${selected.id}`} tabIndex={0} className="min-w-0 p-5 outline-offset-[-3px] sm:p-8 lg:p-10">
          {selected.id === "github" && <GitHubProfile profile={profiles.github} />}
          {selected.id === "instagram" && <InstagramProfile profile={profiles.instagram} music={music} />}
          {selected.id === "tiktok" && <TikTokVideos profile={profiles.tiktok} />}
        </div>
      </div>
    </div>
  </section>;
}
