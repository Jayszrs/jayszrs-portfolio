"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Download, Eye, Star } from "lucide-react";
import MediaPreview from "@/frontend/components/MediaPreview";
import { scrollToTarget } from "@/frontend/lib/hashScroll";
import { mediaSource } from "@/frontend/lib/media";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/pendidikan", label: "Pendidikan" },
  { href: "/keahlian", label: "Keahlian" },
  { href: "/pengalaman", label: "Pengalaman" },
  { href: "/proyek", label: "Proyek" },
  { href: "/pencapaian", label: "Pencapaian" },
];

export default function Navbar({ brandName = "Jay Szrs", cvUrl = "" }) {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [resumePreview, setResumePreview] = useState(false);
  const header = useRef(null);
  const menuButton = useRef(null);
  const pathname = usePathname();
  const resumeUrl = mediaSource(cvUrl);
  const hasResume = Boolean(resumeUrl);

  useEffect(() => {
    let frame = 0;
    let idle = 0;
    const root = document.documentElement;
    const endScroll = () => {
      delete root.dataset.scrollActive;
      document.dispatchEvent(new Event("portfolio:scrollactivity"));
    };
    const update = () => {
      frame = 0;
      const wasScrolled = root.dataset.scrolled === "true";
      const scrolled = window.scrollY > (wasScrolled ? 100 : 130);
      if (scrolled !== wasScrolled || root.dataset.scrolled === undefined) root.dataset.scrolled = String(scrolled);
    };
    const onScroll = () => {
      if (root.dataset.scrollActive !== "true") {
        root.dataset.scrollActive = "true";
        document.dispatchEvent(new Event("portfolio:scrollactivity"));
      }
      clearTimeout(idle);
      idle = setTimeout(endScroll, 350);
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); clearTimeout(idle); delete root.dataset.scrolled; endScroll(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => { if (!header.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    const currentHash = hash.replace("#", "") || window.location.hash.replace("#", "");
    if (pathname === "/" && currentHash) {
      scrollToTarget(currentHash);
    }
  }, [hash, pathname]);

  const handleNavClick = (event, href) => {
    setOpen(false);
    if (!href.includes("#")) {
      setHash("");
      return;
    }

    const [targetPath, targetHash] = href.split("#");
    if (pathname !== targetPath) return;

    event.preventDefault();
    const nextHash = `#${targetHash}`;
    setHash(nextHash);
    window.history.pushState(null, "", href);
    scrollToTarget(targetHash);
  };

  const handleBrandClick = (event) => {
    setOpen(false);
    setHash("");
    if (pathname !== "/") return;
    event.preventDefault();
    window.history.pushState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (href) => {
    if (href.includes("#")) {
      const [targetPath, targetHash] = href.split("#");
      return pathname === targetPath && hash === `#${targetHash}`;
    }
    if (href === "/tentang" && hash === "#pendidikan") return false;
    return pathname === href;
  };

  const renderResumeControls = (compact = false) => (
    hasResume ? (
      <>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResumePreview(true);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink transition hover:bg-emerald-soft hover:text-emerald-deep md:h-8 lg:px-3.5"
        >
          {compact ? "CV" : "Preview"} <Eye size={14} />
        </button>
        <a
          href={resumeUrl}
          download
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white md:h-8 lg:px-3.5"
        >
          {compact ? "Unduh" : "Download"} <Download size={14} />
        </a>
      </>
    ) : (
      <>
        <button
          type="button"
          disabled
          title="Upload resume dari admin dulu"
          className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted opacity-70 md:h-8"
        >
          {compact ? "CV" : "Preview"} <Eye size={14} />
        </button>
        <button
          type="button"
          disabled
          title="Upload resume dari admin dulu"
          className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-ink/70 px-3 text-sm font-semibold text-paper/80 opacity-70 md:h-8"
        >
          {compact ? "Unduh" : "Download"} <Download size={14} />
        </button>
      </>
    )
  );

  return (
    <header ref={header} data-menu-open={open} className="site-header fixed left-0 right-0 top-3 z-50 flex justify-center px-4 sm:top-4 sm:px-4">
      <nav aria-label="Navigasi utama" className="site-nav glass glass-float flex w-full max-w-7xl items-center justify-between gap-3 rounded-[1.75rem] px-3 py-2.5 lg:rounded-full lg:px-4 lg:py-2 xl:px-5">
        <Link href="/" prefetch={false} onClick={handleBrandClick} className="flex min-w-0 shrink-0 items-center gap-2.5 lg:min-w-[9.75rem]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#08080a] sm:h-9 sm:w-9">
            <img
              src="/icon.svg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
          </span>
          <span className="block max-w-[7rem] truncate font-display text-sm font-semibold text-white sm:max-w-[10rem] lg:max-w-[8.5rem]">{brandName}</span>
        </Link>

        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex xl:gap-1.5">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={(event) => handleNavClick(event, link.href)}
                className={`block rounded-full px-2.5 py-2 text-sm font-medium transition xl:px-3.5 ${
                  isActive(link.href)
                    ? "bg-ink text-paper"
                    : "text-muted hover:bg-surface/70 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-1.5 xl:flex xl:gap-2.5">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            {renderResumeControls(true)}
          </div>
          <Link
            href="/#rating"
            prefetch={false}
            onClick={(event) => handleNavClick(event, "/#rating")}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-emerald/40 hover:text-emerald-deep xl:px-4"
          >
            Rating <Star size={14} />
          </Link>
          <Link
            href="/kontak"
            prefetch={false}
            className="action-button min-h-9 px-3 py-2 xl:px-4"
          >
            Kontak <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          ref={menuButton}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="menu-toggle flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper/70 text-ink xl:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <span aria-hidden="true" className="menu-glyph"><span /><span /><span /></span>
        </button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="mobile-navigation glass-strong glass-float absolute top-20 max-h-[calc(100svh-7rem)] w-[calc(100%-2rem)] max-w-[40rem] overflow-y-auto rounded-3xl p-3 xl:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className={`block rounded-2xl px-4 py-3.5 text-sm font-semibold ${
                    isActive(link.href) ? "bg-ink text-paper" : "text-ink/80 hover:bg-paper"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface p-1.5">
                {renderResumeControls()}
              </div>
              <Link
                href="/kontak"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald px-4 py-3.5 text-sm font-semibold text-white"
              >
                Hubungi saya <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/#rating"
                prefetch={false}
                onClick={(event) => handleNavClick(event, "/#rating")}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-ink"
              >
                Kasih rating <Star size={15} />
              </Link>
            </li>
          </ul>
        </div>
      )}
      <MediaPreview
        src={resumePreview ? resumeUrl : ""}
        title="Preview Resume"
        onClose={() => setResumePreview(false)}
      />
    </header>
  );
}
