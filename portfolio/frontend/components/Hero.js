"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, ArrowUpRight, Download, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import TypewriterText from "@/frontend/components/TypewriterText";
import TikTokIcon from "@/frontend/components/TikTokIcon";

const MotionImage = motion(Image);

export default function Hero({ profile }) {
  const { socials } = profile;
  const heroImages = useMemo(
    () => [profile.heroImage, profile.heroImage2, profile.heroImage3, profile.heroImage4].filter(Boolean),
    [profile.heroImage, profile.heroImage2, profile.heroImage3, profile.heroImage4],
  );
  const heroImageKey = heroImages.join("|");
  const [activeImage, setActiveImage] = useState(0);
  const hasResume = Boolean(profile.cvUrl);
  const currentHeroImage = heroImages[activeImage] || heroImages[0] || "";

  useEffect(() => {
    setActiveImage(0);
  }, [heroImageKey]);

  useEffect(() => {
    if (heroImages.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveImage((index) => (index + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length, heroImageKey]);

  return (
    <section id="beranda" className="section-pad relative flex min-h-[720px] items-center pb-12 pt-28 sm:min-h-[760px] sm:pb-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-emerald sm:w-10" />
            <p className="eyebrow">{profile.greeting}</p>
          </div>
          <h1 className="max-w-3xl font-display text-[2.9rem] font-semibold leading-[1.02] text-ink sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            {profile.fullName}
          </h1>

          <div className="mt-6 sm:mt-7">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted sm:text-sm">Saat ini berfokus sebagai</p>
            <p className="max-w-[22rem] break-words font-display text-2xl font-semibold leading-snug text-emerald-deep sm:max-w-none sm:text-3xl sm:leading-tight">
              <TypewriterText words={profile.roles} fallback={profile.role} />
            </p>
          </div>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:mt-7 sm:text-lg">
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
            {socials.tiktok && (
              <a href={socials.tiktok} target="_blank" rel="noreferrer" className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald" aria-label="TikTok">
                <TikTokIcon size={17} />
              </a>
            )}
          </div>

          <div className="mt-8 flex max-w-xl flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/proyek"
              className="inline-flex h-11 flex-[1_1_11rem] items-center justify-center gap-2 rounded-full bg-emerald px-5 text-sm font-semibold text-white shadow-glass transition hover:bg-emerald-deep sm:h-12 sm:flex-none sm:px-6"
            >
              Lihat Proyek <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/kontak"
              className="glass-pill inline-flex h-11 flex-[1_1_8rem] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ink transition hover:border-emerald/40 sm:h-12 sm:flex-none sm:px-6"
            >
              Kontak Saya
            </Link>
            {hasResume ? (
              <>
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-pill inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-ink transition hover:border-emerald/40 hover:text-emerald-deep sm:h-12 sm:w-auto sm:px-5"
                  aria-label="Preview Resume"
                >
                  <span className="hidden sm:inline">Preview Resume</span> <Eye size={16} />
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="glass-pill inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-ink transition hover:border-emerald/40 hover:text-emerald-deep sm:h-12 sm:w-auto sm:px-5"
                  aria-label="Download Resume"
                >
                  <span className="hidden sm:inline">Download Resume</span> <Download size={16} />
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  title="Upload resume dari admin dulu"
                  className="glass-pill inline-flex h-11 w-11 cursor-not-allowed items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted opacity-70 sm:h-12 sm:w-auto sm:px-5"
                  aria-label="Preview Resume"
                >
                  <span className="hidden sm:inline">Preview Resume</span> <Eye size={16} />
                </button>
                <button
                  type="button"
                  disabled
                  title="Upload resume dari admin dulu"
                  className="glass-pill inline-flex h-11 w-11 cursor-not-allowed items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted opacity-70 sm:h-12 sm:w-auto sm:px-5"
                  aria-label="Download Resume"
                >
                  <span className="hidden sm:inline">Download Resume</span> <Download size={16} />
                </button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-[380px] sm:max-w-md"
        >
          <div className="absolute -left-8 top-14 hidden -rotate-90 font-mono text-[10px] uppercase tracking-[0.32em] text-muted/60 xl:block">
            Bekasi - Indonesia - 2026
          </div>
          <div className="glass-strong relative overflow-hidden rounded-[1.5rem] p-2.5 sm:rounded-[2rem] sm:p-3">
            <div className="relative h-[360px] w-full overflow-hidden rounded-[1.15rem] sm:h-[520px] sm:rounded-[1.5rem]">
              {currentHeroImage ? (
                <MotionImage
                  key={currentHeroImage}
                  src={currentHeroImage}
                  alt={profile.fullName}
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 420px, 380px"
                  className="object-cover"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-soft text-sm font-semibold text-emerald-deep">
                  Upload foto hero di admin
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
              <div className="absolute left-4 top-4 text-white sm:left-5 sm:top-5">
                <p className="font-display text-xl font-semibold leading-tight drop-shadow sm:text-2xl">{profile.fullName}</p>
                <p className="glass-pill mt-1 inline-block rounded-full px-3 py-1 text-xs text-white/90">
                  {profile.roles?.[0] || profile.role}
                </p>
              </div>
              {heroImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/28 px-2.5 py-2 backdrop-blur-md">
                  {heroImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-2.5 rounded-full transition ${
                        activeImage === index ? "w-7 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
                      }`}
                      aria-label={`Tampilkan foto hero ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="glass mt-3 flex items-center justify-between rounded-2xl px-3.5 py-3 sm:px-4">
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
