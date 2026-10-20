"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play, RefreshCw } from "lucide-react";
import SafeImage from "./SafeImage";
import TikTokIcon from "./TikTokIcon";

function Player({ video }) {
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
    if (!visible || status !== "loading") return;
    const timeout = setTimeout(() => setStatus("error"), 18000);
    return () => clearTimeout(timeout);
  }, [visible, status]);
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
    {visible && status !== "error" && <iframe ref={frame} src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=${reduced ? 0 : 1}&muted=1&loop=1&controls=1&description=1&music_info=1&rel=0`} title={video.title} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" onError={() => setStatus("error")} />}
    {status === "loading" && <p role="status" className="pointer-events-none absolute inset-x-3 bottom-4 rounded-xl bg-surface/95 p-3 text-center text-xs text-muted">Memuat video…</p>}
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
  const video = data?.videos?.[active];
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink"><TikTokIcon size={23} />Video TikTok</h3><p className="mt-2 text-sm text-muted">@{profile.handle}{data?.ranking === "views" ? ` · ${data.complete ? "Paling banyak ditonton" : `Pilihan dari ${data.scanned} unggahan terbaca`}` : ""}</p></div><a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">Buka profil<ArrowUpRight size={15} /></a></div>
    {video ? <div className="grid items-start gap-8 md:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] lg:gap-12">
      <Player key={video.id} video={video} />
      <div className="min-w-0"><p className="mb-4 text-xs font-semibold text-muted">{data.ranking === "views" ? "Urut berdasarkan jumlah tayangan" : "Pilihan video"}</p><div className="space-y-2">{data.videos.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} aria-pressed={active === index} className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${active === index ? "border-emerald/45 bg-emerald-soft" : "border-line bg-surface/50 hover:bg-paper"}`}>
        {item.cover ? <SafeImage src={item.cover} alt="" className="h-20 w-14 shrink-0 rounded-lg" imgClassName="object-cover" sizes="56px" /> : <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl bg-paper text-muted"><Play size={18} /></span>}
        <span className="min-w-0 flex-1"><span className="line-clamp-2 block text-sm font-semibold leading-6 text-ink">{item.title}</span>{Number.isFinite(item.viewCount) && <span className="mt-1 block text-xs text-muted">{item.viewCount.toLocaleString("id-ID")} tayangan</span>}</span><Play size={16} className="shrink-0 text-muted" />
      </button>)}</div><p className="mt-5 text-xs leading-6 text-muted">Video diputar tanpa suara. Kontrol pemutar tersedia untuk menonton dengan nyaman.</p></div>
    </div> : <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-paper/50 px-6 py-12 text-center"><TikTokIcon size={32} /><p className="max-w-md text-sm leading-7 text-muted">{status === "loading" ? "Mencari unggahan TikTok…" : "Video pilihan belum tersedia di sini. Semua unggahan tetap bisa ditonton di profil TikTok saya."}</p><div className="flex flex-wrap justify-center gap-3"><a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper">Tonton di TikTok<ArrowUpRight size={15} /></a>{status !== "loading" && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-ink"><RefreshCw size={15} />Coba lagi</button>}</div></div>}
  </div>;
}
