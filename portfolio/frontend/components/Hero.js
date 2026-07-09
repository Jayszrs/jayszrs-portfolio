"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import TypewriterText from "@/frontend/components/TypewriterText";

export default function Hero({ profile }) {
  const { socials } = profile;

  return (
    <section id="beranda" className="section-pad relative flex min-h-[760px] items-center pb-14 pt-28 sm:pb-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-emerald" />
            <p className="eyebrow">{profile.greeting}</p>
          </div>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
            {profile.fullName}
          </h1>

          <div className="mt-7">
            <p className="mb-1 text-sm font-medium uppercase tracking-[0.16em] text-muted">Saat ini berfokus sebagai</p>
            <p className="font-display text-2xl font-semibold text-emerald-deep sm:text-3xl">
              <TypewriterText words={profile.roles} fallback={profile.role} />
            </p>
          </div>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {profile.tagline}
          </p>

          <div className="mt-7 flex items-center gap-3">
            {socials.github && (
              <a href={socials.github} target="_blank" rel="noreferrer" className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
                <Github size={18} />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
                <Linkedin size={18} />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
                <Instagram size={18} />
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/proyek"
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white shadow-glass transition hover:bg-emerald-deep"
            >
              Lihat Proyek <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/kontak"
              className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink transition hover:border-emerald/40"
            >
              Kontak Saya
            </Link>
          </div>
        </motion.div>

        {/* Right: glass portrait card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -left-8 top-14 hidden -rotate-90 font-mono text-[10px] uppercase tracking-[0.32em] text-muted/60 xl:block">
            Bekasi · Indonesia · 2026
          </div>
          <div className="glass-strong relative overflow-hidden rounded-[2rem] p-3">
            <div className="relative h-[460px] w-full overflow-hidden rounded-[1.5rem] sm:h-[520px]">
              <img
                src={profile.heroImage}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
              <div className="absolute left-5 top-5 text-white">
                <p className="font-display text-2xl font-semibold drop-shadow">{profile.fullName}</p>
                <p className="glass-pill mt-1 inline-block rounded-full px-3 py-1 text-xs text-white/90">
                  {profile.roles?.[0] || profile.role}
                </p>
              </div>
            </div>

            {/* status bar */}
            <div className="glass mt-3 flex items-center justify-between rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-emerald" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{profile.handle}</p>
                  <p className="text-xs text-muted">{profile.status}</p>
                </div>
              </div>
              <Link
                href="/kontak"
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-emerald hover:text-white"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
