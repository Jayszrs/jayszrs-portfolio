"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import SafeImage, { ImageUnavailable } from "./SafeImage";
import { profileDisplayImages } from "@/frontend/lib/profileImages";

export default function LanyardCard({ profile }) {
  const images = useMemo(() => profileDisplayImages(profile), [profile]);
  const [failed, setFailed] = useState([]);
  const [index, setIndex] = useState(0);
  const available = images.filter((src) => !failed.includes(src));
  const current = available[index % Math.max(available.length, 1)];
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-40, 40], [-6, 6]);
  useEffect(() => { setFailed([]); setIndex(0); }, [images]);
  const step = (delta) => setIndex((value) => (value + delta + available.length) % available.length);

  return (
    <div className="lanyard-stage">
      <div aria-hidden="true" className="lanyard-strap"><span>jayszrs.</span><span>PORTFOLIO</span></div>
      <div aria-hidden="true" className="lanyard-ring" />
      <motion.div
        className="lanyard-badge glass-strong"
        style={reduced ? undefined : { x, rotate }}
        drag={reduced ? false : "x"}
        dragConstraints={{ left: -36, right: 36 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={() => animate(x, 0, { type: "spring", stiffness: 240, damping: 18 })}
      >
        <div aria-hidden="true" className="lanyard-slot" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <img src="/icon.svg" width="36" height="36" alt="" aria-hidden="true" className="rounded-xl" />
          <span className="text-xs font-semibold text-muted">{profile.handle || profile.brandName}</span>
        </div>
        <div className="relative aspect-[4/4.7] overflow-hidden rounded-2xl bg-paper">
          {current ? <SafeImage key={current} src={current} alt={`Foto ${profile.fullName}`} priority sizes="(max-width: 640px) 78vw, 320px" className="h-full w-full" imgClassName="object-cover" fallback={<ImageUnavailable />} onError={() => setFailed((values) => [...values, current])} /> : <ImageUnavailable />}
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
            </div>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
