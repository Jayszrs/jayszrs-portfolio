"use client";

import { useState } from "react";
import { Github, Linkedin, Instagram, ArrowUpRight, Download, Eye, Star } from "lucide-react";
import Link from "next/link";
import LanyardCard from "./LanyardCard";
import MediaPreview from "./MediaPreview";
import TypewriterText from "./TypewriterText";
import TikTokIcon from "./TikTokIcon";
import { scrollToTarget } from "@/frontend/lib/hashScroll";
import { externalUrl } from "@/frontend/lib/urls";
import { mediaSource } from "@/frontend/lib/media";

export default function Hero({ profile }) {
  const [resumePreview, setResumePreview] = useState(false);
  const resumeUrl = mediaSource(profile.cvUrl);
  const socials = profile.socials || {};
  const links = [["github", "GitHub", Github], ["linkedin", "LinkedIn", Linkedin], ["instagram", "Instagram", Instagram], ["tiktok", "TikTok", TikTokIcon]];

  return (
    <section id="beranda" className="section-pad relative pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-6 lg:min-h-[640px] lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div className="min-w-0 py-5 sm:py-10">
          <h1 className="max-w-3xl text-balance font-display text-[clamp(2.65rem,6.1vw,5.4rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">{profile.fullName}</h1>
          <div className="mt-7 min-h-[4.5rem]">
            <p className="text-sm text-muted">Saat ini berfokus sebagai</p>
            <p className="mt-2 max-w-xl break-words font-display text-2xl font-medium leading-tight text-emerald-deep sm:text-3xl"><TypewriterText words={profile.roles} fallback={profile.role} /></p>
          </div>
          {profile.tagline && <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg">{profile.tagline}</p>}
          <div className="mt-7 flex gap-2" aria-label="Profil sosial">
            {links.filter(([key]) => socials[key]).map(([key, label, Icon]) => <a key={key} href={externalUrl(socials[key])} target="_blank" rel="noreferrer" aria-label={`Buka ${label}`} className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:border-emerald/40 hover:text-ink"><Icon size={18} /></a>)}
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/proyek" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition hover:bg-emerald-deep">Lihat Proyek <ArrowUpRight size={16} /></Link>
            <Link href="/kontak" prefetch={false} className="glass-pill inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-ink transition hover:border-emerald/40">Kontak Saya</Link>
            <Link href="/#rating" prefetch={false} onClick={(event) => { event.preventDefault(); window.history.pushState(null, "", "/#rating"); scrollToTarget("rating"); }} className="glass-pill inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-ink transition hover:border-emerald/40">Rating <Star size={16} /></Link>
          </div>
          {resumeUrl && <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1">
            <button type="button" onClick={() => setResumePreview(true)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"><Eye size={16} />Lihat CV</button>
            <a href={resumeUrl} download className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"><Download size={16} />Unduh CV</a>
          </div>}
        </div>
        <LanyardCard profile={profile} />
      </div>
      <MediaPreview src={resumePreview ? resumeUrl : ""} title="Preview Resume" onClose={() => setResumePreview(false)} />
    </section>
  );
}
