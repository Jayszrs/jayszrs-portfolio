"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import SafeImage, { ImageUnavailable } from "./SafeImage";
import { profileDisplayImages } from "@/frontend/lib/profileImages";
import { mediaSource } from "@/frontend/lib/media";
import portraits from "@/frontend/lib/lanyard-portraits.json";
import useLanyardPhysics from "@/frontend/lib/useLanyardPhysics";

export default function LanyardCard({ profile }) {
  const images = useMemo(() => profileDisplayImages(profile), [profile]);
  const [failed, setFailed] = useState([]);
  const [index, setIndex] = useState(0);
  const available = images.filter((src) => !failed.includes(src));
  const current = available[index % Math.max(available.length, 1)];
  const stage = useRef(null);
  const badge = useRef(null);
  const rigging = useRef(null);
  const rope = useRef(null);
  const leftEdge = useRef(null);
  const rightEdge = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failedCutouts, setFailedCutouts] = useState([]);
  const clipId = useId();
  const original = mediaSource(current || "");
  const portrait = failedCutouts.includes(original) ? original : portraits[original] || original;
  useEffect(() => { setFailed([]); setIndex(0); }, [images]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(media.matches);
    const syncVisibility = () => setHidden(document.hidden);
    const syncDialog = () => setBlocked(document.documentElement.dataset.dialogOpen === "true" || document.documentElement.dataset.scrollActive === "true");
    syncMotion(); syncVisibility(); syncDialog();
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(stage.current);
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    document.addEventListener("portfolio:dialogchange", syncDialog);
    document.addEventListener("portfolio:scrollactivity", syncDialog);
    return () => { observer.disconnect(); media.removeEventListener("change", syncMotion); document.removeEventListener("visibilitychange", syncVisibility); document.removeEventListener("portfolio:dialogchange", syncDialog); document.removeEventListener("portfolio:scrollactivity", syncDialog); };
  }, []);
  useLanyardPhysics({ stage, badge, rigging, rope, leftEdge, rightEdge, enabled: visible && !hidden && !blocked, reduced, onDragChange: setDragging });
  const playing = !dragging && !hovered && !focused && !hidden && !blocked && visible && !reduced && available.length > 1;
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % available.length), 3000);
    return () => clearInterval(timer);
  }, [playing, available.length]);
  return (
    <div ref={stage} className="lanyard-stage" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <svg className="lanyard-rope" width="100%" height="100%" fill="none" aria-hidden="true">
        <defs>
          <pattern id={`${clipId}-weave`} width="32" height="64" patternUnits="userSpaceOnUse">
            <path d="M0 0h32v64H0z" fill="#161719" />
            <path d="M0 0v64M4 0v64M8 0v64M12 0v64M16 0v64M20 0v64M24 0v64M28 0v64" stroke="#a8a9ad" strokeWidth=".35" opacity=".3" />
            <path d="m-8 12 24 15 24-15v8L16 35-8 20zM-8 36l24 15 24-15v8L16 59-8 44z" fill="#f6f7fa" />
            <path d="m12 1 4-4 4 4-4 4zm-8 0 4-4 4 4-4 4zm16 0 4-4 4 4-4 4zm-8 8 4-4 4 4-4 4z" fill="#f6f7fa" />
            <path d="M0 30h32M0 62h32" stroke="#b9bcc4" strokeWidth=".4" opacity=".45" />
          </pattern>
        </defs>
        <g ref={rigging}>
        <path ref={rope} data-rope-centerline d="M250 0L250 180" stroke="none" />
        <path ref={leftEdge} className="lanyard-fabric" data-lanyard-strand="left" d="M232 0L250 180" stroke={`url(#${clipId}-weave)`} strokeWidth="18" />
        <path ref={rightEdge} className="lanyard-fabric" data-lanyard-strand="right" d="M268 0L250 180" stroke={`url(#${clipId}-weave)`} strokeWidth="18" />
        </g>
      </svg>
      <figure
        ref={badge}
        className="lanyard-badge"
        data-source-photo={original}
        tabIndex={0}
        aria-label="Kartu profil interaktif"
        aria-describedby={`${clipId}-help`}
      >
        <svg className="lanyard-clasp" viewBox="0 0 64 110" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={clipId} x1="14" y1="0" x2="53" y2="102" gradientUnits="userSpaceOnUse"><stop stopColor="#767d87" /><stop offset=".28" stopColor="#f8fafc" /><stop offset=".45" stopColor="#9ba1aa" /><stop offset=".67" stopColor="#e1e5ea" /><stop offset="1" stopColor="#616873" /></linearGradient>
            <linearGradient id={`${clipId}-buckle`} x1="15" y1="0" x2="50" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#e2e4e9" /><stop offset=".4" stopColor="#777c85" /><stop offset="1" stopColor="#282c33" /></linearGradient>
          </defs>
          <path d="M16 3h32v28c0 7-5 12-12 12h-8c-7 0-12-5-12-12V3Z" fill={`url(#${clipId}-buckle)`} stroke="#bec2cb" strokeWidth="1.1" />
          <path d="M19 7h26M20 10h24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <rect x="25" y="17" width="14" height="15" rx="5" fill="#292d34" stroke="#e0e4ee" strokeWidth="1" />
          <path d="M27 41h10v16H27z" fill={`url(#${clipId})`} stroke="#777e88" />
          <path d="M32 51c-11 0-18 8-18 19v15c0 12 8 21 18 21s18-9 18-21V77H40v9c0 6-3 10-8 10s-8-4-8-10V70c0-6 3-9 8-9 3 0 6 2 7 5l9-4c-3-7-8-11-16-11Z" fill={`url(#${clipId})`} stroke="#777e88" strokeWidth="1.2" />
          <path d="M44 64v21" stroke="#535b65" strokeWidth="4" strokeLinecap="round" /><path d="M42 64v19" stroke="#eef1f5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div aria-hidden="true" className="lanyard-slot" />
        <div className="badge-print-header" data-no-translate>
          <img src="/icon.svg" width="24" height="24" alt="" aria-hidden="true" />
          <span>{profile.handle || profile.brandName}</span>
        </div>
        <svg className="badge-traces" viewBox="0 0 300 430" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8"><path d="M9 103h15l14 14v40M9 126h8l12 12v34M291 92h-13l-18 18v37M291 119h-8l-13 13v32M10 365h18l19-19h24M10 380h27l20-20h19M290 353h-19l-16-16h-27M290 369h-30l-17-17h-22" /><circle cx="38" cy="161" r="3" /><circle cx="29" cy="177" r="2" /><circle cx="260" cy="151" r="3" /><circle cx="270" cy="168" r="2" /><circle cx="75" cy="346" r="3" /><circle cx="225" cy="337" r="3" /></g></svg>
        <div className={`badge-portrait ${portraits[original] && portrait !== original ? "badge-portrait--cutout" : "badge-portrait--original"} ${portrait.endsWith("conference-duo-cutout.png") ? "badge-portrait--duo" : ""}`}>
          {current ? <SafeImage key={portrait} src={portrait} alt={portrait.endsWith("conference-duo-cutout.png") ? `Foto ${profile.fullName} bersama Pak Narendra Wicaksono, keduanya berpose jempol` : `Foto ${profile.fullName}`} draggable={false} priority={index === 0} sizes="(max-width: 640px) 78vw, 320px" className="h-full w-full" imgClassName="lanyard-photo object-contain object-bottom" fallback={<ImageUnavailable />} onError={() => portraits[original] && portrait !== original ? setFailedCutouts((values) => [...values, original]) : setFailed((values) => [...values, current])} /> : <ImageUnavailable />}
        </div>
        <figcaption className="badge-identity">
          <p className="badge-name" data-no-translate>{profile.fullName}</p>
          <p className="badge-role">{profile.roles?.[0] || profile.role}</p>
          <span className="badge-signature" data-no-translate>{profile.brandName || "jayszrs."}</span>
        </figcaption>
        <div className="badge-print-footer" data-no-translate><span>jayszrs.my.id</span><span>{profile.location?.split(",")[0] || "Indonesia"}</span></div>
      </figure>
      <p id={`${clipId}-help`} className="lanyard-help">Tarik kartu, lalu lepaskan.<span className="sr-only"> Gunakan tombol panah untuk mengayun dan Home untuk mengatur ulang posisi.</span></p>
    </div>
  );
}
