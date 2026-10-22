"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Eye, Play, RefreshCw } from "lucide-react";
import TikTokIcon from "./TikTokIcon";
import curation from "@/frontend/lib/social-curation.json";

function ViewCount({ video }) {
  const available = Number.isSafeInteger(video.viewCount) && video.viewCount >= 0;
  const label = video.viewCountSource === "tiktok-api" ? "Data TikTok" : video.viewCountSource === "owner-snapshot" ? "Catatan pemilik" : "Cuplikan publik";
  const capturedAt = video.viewCountCapturedAt;
  const validDate = capturedAt && Number.isFinite(Date.parse(capturedAt));
  return <div className="min-h-14 px-1 pb-1" data-view-count={available ? video.viewCount : "unavailable"} data-count-source={video.viewCountSource || "unavailable"}>
    <p className="flex items-center gap-2 text-sm font-semibold tabular-nums text-ink"><Eye size={15} aria-hidden="true" />{available ? <span><span data-no-translate>{video.viewCount.toLocaleString("id-ID")}</span>{' '}<span>tayangan</span></span> : <span>Tayangan belum tersedia</span>}</p>
    {available && validDate ? <p className="mt-1 text-[11px] leading-5 text-muted">{label} · <time dateTime={capturedAt}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(capturedAt))}</time></p> : <a href={video.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-7 items-center gap-1 text-xs text-muted underline underline-offset-4">Lihat jumlah di TikTok<ArrowUpRight size={12} aria-hidden="true" /></a>}
  </div>;
}

function Player({ video, active, onActivate, onUnavailable }) {
  const shell = useRef(null);
  const frame = useRef(null);
  const requested = useRef(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("loading");
  const [errorCode, setErrorCode] = useState(null);
  const [reduced, setReduced] = useState(true);
  const state = useRef({ active, visible, reduced });
  state.current = { active, visible, reduced };
  const activate = useRef(onActivate);
  activate.current = onActivate;
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  const send = (type) => frame.current?.contentWindow?.postMessage({ type, "x-tiktok-player": true }, "https://www.tiktok.com");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(shell.current);
    const pauseHidden = () => { if (document.hidden) send("pause"); };
    document.addEventListener("visibilitychange", pauseHidden);
    return () => { observer.disconnect(); media.removeEventListener("change", syncMotion); document.removeEventListener("visibilitychange", pauseHidden); };
  }, []);
  useEffect(() => {
    if (!visible) { send("pause"); setStatus("loading"); return; }
    if (status !== "loading") return;
    const timeout = setTimeout(() => setStatus("error"), 18000);
    return () => clearTimeout(timeout);
  }, [visible, status]);
  useEffect(() => {
    if (status === "error" && active) unavailable.current();
  }, [status, active]);
  useEffect(() => {
    if (!active) requested.current = false;
    if (!active || !visible || (reduced && !requested.current)) send("pause");
    else if (status === "ready" || status === "loaded") { send("mute"); send("play"); }
  }, [active, visible, reduced, status]);
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== "https://www.tiktok.com" || event.source !== frame.current?.contentWindow || !event.data?.["x-tiktok-player"]) return;
      if (event.data.type === "onPlayerReady") setStatus("ready");
      if (event.data.type === "onStateChange" && event.data.value === 1) {
        setStatus("ready");
        if (!state.current.visible || document.hidden) send("pause");
        else activate.current();
      }
      if (event.data.type === "onPlayerError" && event.data.value?.errorCode !== 3002) { setErrorCode(event.data.value?.errorCode ?? null); setStatus("error"); }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  return <div ref={shell} className="tiktok-player" data-video-id={video.id} data-player-state={status} data-player-error={errorCode}>
    {visible && status !== "error" && <iframe ref={frame} src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=0&muted=1&loop=1&controls=1&description=0&music_info=0&rel=0`} title={video.title} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" onLoad={() => setStatus((current) => current === "error" ? current : "loaded")} onError={() => setStatus("error")} />}
    {status === "loading" && <p role="status" className="tiktok-player-status">Memuat video…</p>}
    {status === "error" && <div role="status" className="tiktok-player-error"><TikTokIcon size={30} /><p>Video ini belum bisa disematkan. Buka postingan aslinya di TikTok.</p><a href={video.url} target="_blank" rel="noreferrer">Tonton di TikTok<ArrowUpRight size={15} /></a></div>}
    {status !== "error" && <button type="button" className="tiktok-play-control" aria-label={`Putar ${video.title}`} onClick={() => { requested.current = true; onActivate(); send("mute"); send("play"); }}><Play size={13} fill="currentColor" /><span>Putar video</span></button>}
  </div>;
}

export default function TikTokVideos({ profile }) {
  const selected = profile.handle.toLowerCase() === curation.tiktokHandle ? curation.tiktokVideos.map((url, index) => ({ id: url.split("/").at(-1), url, title: `Video pilihan ${index + 1}`, viewCount: null })) : [];
  const [data, setData] = useState({ videos: selected, ranking: "curated" });
  const [status, setStatus] = useState(selected.length ? "ready" : "loading");
  const [active, setActive] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);
    let mounted = true;
    fetch("/api/social/tiktok", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const value = (await response.json()).tiktok;
      if (value?.username?.toLowerCase() !== profile.handle.toLowerCase()) throw new Error("Account mismatch");
      if (mounted) { setData(value); setStatus(value.videos?.length ? "ready" : "empty"); }
    }).catch(() => { if (mounted && !selected.length) setStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => { mounted = false; clearTimeout(timeout); controller.abort(); };
  }, [profile.handle, attempt]);
  const videos = data?.videos?.slice(0, 3) || [];

  return <div>
    <div className="tiktok-heading"><div><h3>Video pilihan.</h3><p>Tiga cerita singkat dari TikTok saya.</p></div><a href={profile.url} target="_blank" rel="noreferrer" className="social-account"><TikTokIcon size={19} /><span>@{profile.handle}</span><ArrowUpRight size={15} /></a></div>
    {videos.length ? <><div className="tiktok-grid">{videos.map((video, index) => <article key={video.id} className="tiktok-card" data-active={active === index}>
      <Player video={{ ...video, title: video.title === "Video pilihan" ? `Video pilihan ${index + 1}` : video.title }} active={active === index} onActivate={() => setActive(index)} onUnavailable={() => setActive((current) => current === index && index < videos.length - 1 ? index + 1 : current)} />
      <a href={video.url} target="_blank" rel="noreferrer" className="tiktok-card-link"><TikTokIcon size={16} /><span>Lihat postingan</span><ArrowUpRight size={16} /></a>
      <ViewCount video={video} />
    </article>)}</div><p className="tiktok-note">Satu video diputar tanpa suara agar halaman tetap ringan. Angka tayangan mengikuti tanggal yang tertera; buka TikTok untuk jumlah terbaru.</p></> : <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"><TikTokIcon size={32} /><p className="max-w-md text-sm leading-7 text-muted">{status === "loading" ? "Mencari unggahan TikTok…" : "Video pilihan belum tersedia di sini. Semua unggahan tetap bisa ditonton di profil TikTok saya."}</p><a href={profile.url} target="_blank" rel="noreferrer" className="action-button">Tonton di TikTok<ArrowUpRight size={15} /></a>{status !== "loading" && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink"><RefreshCw size={15} />Coba lagi</button>}</div>}
  </div>;
}
