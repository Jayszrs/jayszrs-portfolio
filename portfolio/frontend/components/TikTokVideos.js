"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, RefreshCw } from "lucide-react";
import SafeImage from "./SafeImage";
import TikTokIcon from "./TikTokIcon";

function Player({ video, active, onActivate }) {
  const shell = useRef(null);
  const frame = useRef(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("loading");
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) frame.current?.contentWindow?.postMessage({ type: "pause", "x-tiktok-player": true }, "https://www.tiktok.com");
    }, { threshold: 0.55 });
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !active || status !== "loading") return;
    const timeout = setTimeout(() => setStatus("error"), 18000);
    return () => clearTimeout(timeout);
  }, [visible, active, status]);
  useEffect(() => { if (!visible || !active) setStatus("loading"); }, [visible, active]);
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== "https://www.tiktok.com" || event.source !== frame.current?.contentWindow || !event.data?.["x-tiktok-player"]) return;
      if (event.data.type === "onPlayerReady") setStatus("ready");
      if (event.data.type === "onPlayerError" && event.data.value?.errorCode !== 3002) setStatus("error");
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <div ref={shell} className="relative mx-auto aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-2xl border border-line bg-paper">
    {visible && active && status !== "error" && <iframe ref={frame} src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=${reduced ? 0 : 1}&muted=1&loop=1&controls=1&description=1&music_info=1&rel=0`} title={video.title} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" onError={() => setStatus("error")} />}
    {(!visible || !active) && <button type="button" onClick={onActivate} aria-label={`Putar ${video.title}`} className="absolute inset-0 flex h-full w-full items-center justify-center bg-ink/5">{video.cover && <SafeImage src={video.cover} alt="" sizes="(max-width: 640px) 85vw, 330px" className="absolute inset-0 h-full w-full" imgClassName="object-cover" />}<span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface/95 text-ink shadow-lg"><Play size={24} /></span></button>}
    {visible && active && status === "loading" && <p role="status" className="pointer-events-none absolute inset-x-3 bottom-4 rounded-xl bg-surface/95 p-3 text-center text-xs text-muted">Memuat video…</p>}
    {status === "error" && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center"><TikTokIcon size={32} /><p className="text-sm leading-6 text-muted">Pemutar TikTok belum tersedia di browser ini.</p><a href={video.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper">Tonton di TikTok<ArrowUpRight size={15} /></a></div>}
  </div>;
}

export default function TikTokVideos({ profile }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [active, setActive] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);
    let mounted = true;
    setStatus("loading");
    fetch("/api/social/tiktok", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const value = (await response.json()).tiktok;
      if (value?.username?.toLowerCase() !== profile.handle.toLowerCase()) throw new Error("Account mismatch");
      if (mounted) { setData(value); setActive(0); setStatus(value.videos?.length ? "ready" : "empty"); }
    }).catch(() => { if (mounted) setStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => { mounted = false; clearTimeout(timeout); controller.abort(); };
  }, [profile.handle, attempt]);
  const videos = data?.videos?.slice(0, 3) || [];
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink"><TikTokIcon size={23} />Video TikTok</h3><p className="mt-2 text-sm text-muted">@{profile.handle}{data?.ranking === "views" ? ` · ${data.complete ? "Paling banyak ditonton" : `Pilihan dari ${data.scanned} unggahan terbaca`}` : ""}</p></div><a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">Buka profil<ArrowUpRight size={15} /></a></div>
    {videos.length ? <><div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">{videos.map((video, index) => <article key={video.id} className="min-w-0 rounded-3xl border border-line bg-paper/50 p-3"><Player video={video} active={active === index} onActivate={() => setActive(index)} /><div className="px-2 pb-2 pt-4"><a href={video.url} target="_blank" rel="noreferrer" className="flex min-h-11 items-start justify-between gap-3 text-sm font-semibold leading-6 text-ink"><span className="line-clamp-2">{video.title}</span><ArrowUpRight size={16} className="mt-1 shrink-0" /></a>{Number.isFinite(video.viewCount) && <p className="mt-1 text-xs text-muted">{video.viewCount.toLocaleString("id-ID")} tayangan</p>}</div></article>)}</div><p className="mt-5 text-xs leading-6 text-muted">Satu video diputar tanpa suara agar halaman tetap ringan. Pilih kartu lain untuk menontonnya.</p>{videos.length < 3 && <p className="mt-2 text-xs leading-6 text-muted">Unggahan lain tersedia langsung di profil TikTok saya.</p>}</> : <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-paper/50 px-6 py-12 text-center"><TikTokIcon size={32} /><p className="max-w-md text-sm leading-7 text-muted">{status === "loading" ? "Mencari unggahan TikTok…" : "Video pilihan belum tersedia di sini. Semua unggahan tetap bisa ditonton di profil TikTok saya."}</p><div className="flex flex-wrap justify-center gap-3"><a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper">Tonton di TikTok<ArrowUpRight size={15} /></a>{status !== "loading" && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-ink"><RefreshCw size={15} />Coba lagi</button>}</div></div>}
  </div>;
}
