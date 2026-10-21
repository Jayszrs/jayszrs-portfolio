"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Pause, Play } from "lucide-react";
import SafeImage, { ImageUnavailable } from "./SafeImage";
import { profileDisplayImages } from "@/frontend/lib/profileImages";

export default function LanyardCard({ profile }) {
  const images = useMemo(() => profileDisplayImages(profile), [profile]);
  const [failed, setFailed] = useState([]);
  const [index, setIndex] = useState(0);
  const available = images.filter((src) => !failed.includes(src));
  const current = available[index % Math.max(available.length, 1)];
  const stage = useRef(null);
  const badge = useRef(null);
  const drag = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setFailed([]); setIndex(0); }, [images]);
  const step = (delta) => setIndex((value) => (value + delta + available.length) % available.length);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(media.matches);
    const syncVisibility = () => setHidden(document.hidden);
    syncMotion(); syncVisibility();
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(stage.current);
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => { observer.disconnect(); media.removeEventListener("change", syncMotion); document.removeEventListener("visibilitychange", syncVisibility); };
  }, []);
  const playing = !paused && !hovered && !focused && !hidden && visible && !reduced && available.length > 1;
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % available.length), 3000);
    return () => clearInterval(timer);
  }, [playing, available.length]);
  const resetTilt = () => {
    drag.current = null;
    badge.current?.style.removeProperty("--badge-x");
    badge.current?.style.removeProperty("--badge-rotate");
  };

  return (
    <div ref={stage} className="lanyard-stage" onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); resetTilt(); }} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div aria-hidden="true" className="lanyard-strap"><span>jayszrs.</span><span>PORTFOLIO</span></div>
      <div aria-hidden="true" className="lanyard-ring" />
      <div
        ref={badge}
        className="lanyard-badge glass-strong"
        onPointerDown={(event) => {
          if (reduced || event.target.closest("button, a")) return;
          drag.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!drag.current || reduced) return;
          const distance = event.clientX - drag.current.x;
          if (Math.abs(event.clientY - drag.current.y) > Math.abs(distance) + 8) { resetTilt(); return; }
          if (Math.abs(distance) < 8) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const offset = Math.max(-32, Math.min(32, distance * 0.3));
          event.currentTarget.style.setProperty("--badge-x", `${offset}px`);
          event.currentTarget.style.setProperty("--badge-rotate", `${offset / 6}deg`);
        }}
        onPointerUp={resetTilt}
        onPointerCancel={resetTilt}
        onLostPointerCapture={resetTilt}
      >
        <div aria-hidden="true" className="lanyard-slot" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <img src="/icon.svg" width="36" height="36" alt="" aria-hidden="true" className="rounded-xl" />
          <span className="text-xs font-semibold text-muted">{profile.handle || profile.brandName}</span>
        </div>
        <div className="relative aspect-[4/4.7] overflow-hidden rounded-2xl bg-paper">
          {current ? <SafeImage key={current} src={current} alt={`Foto ${profile.fullName}`} draggable={false} priority={index === 0} sizes="(max-width: 640px) 78vw, 320px" className="h-full w-full" imgClassName="lanyard-photo object-cover" fallback={<ImageUnavailable />} onError={() => setFailed((values) => [...values, current])} /> : <ImageUnavailable />}
        </div>
        <div className="pt-5">
          <p className="max-w-[18rem] font-display text-xl font-semibold leading-tight text-ink">{profile.fullName}</p>
          <p className="mt-2 text-sm text-muted">{profile.roles?.[0] || profile.role}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted"><MapPin size={13} className="shrink-0" /><span className="truncate">{profile.location || "Indonesia"}</span></span>
            {available.length > 1 && <div className="flex shrink-0 items-center gap-1" onPointerDownCapture={(event) => event.stopPropagation()}>
              <button type="button" aria-label="Foto profil sebelumnya" onClick={() => step(-1)} className="lanyard-control"><ChevronLeft size={16} /></button>
              <span className="min-w-7 text-center text-[11px] tabular-nums text-muted">{index % available.length + 1}/{available.length}</span>
              <button type="button" aria-label="Foto profil berikutnya" onClick={() => step(1)} className="lanyard-control"><ChevronRight size={16} /></button>
              <button type="button" aria-label={paused ? "Putar pergantian foto otomatis" : "Jeda pergantian foto otomatis"} aria-pressed={!paused} onClick={() => setPaused((value) => !value)} className="lanyard-control">{paused ? <Play size={14} /> : <Pause size={14} />}</button>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
