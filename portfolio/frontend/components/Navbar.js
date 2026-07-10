"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Download, Eye, Menu, X } from "lucide-react";
import MediaPreview from "@/frontend/components/MediaPreview";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/tentang#pendidikan", label: "Pendidikan" },
  { href: "/pengalaman", label: "Pengalaman" },
  { href: "/proyek", label: "Proyek" },
  { href: "/pencapaian", label: "Pencapaian" },
];

export default function Navbar({ brandName = "Jay Szrs", cvUrl = "" }) {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [resumePreview, setResumePreview] = useState(false);
  const pathname = usePathname();
  const hasResume = Boolean(cvUrl);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

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
    document.getElementById(targetHash)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink transition hover:bg-emerald-soft hover:text-emerald-deep md:h-8"
        >
          {compact ? "CV" : "Preview"} <Eye size={14} />
        </button>
        <a
          href={cvUrl}
          download
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white md:h-8"
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
    <header className="fixed left-0 right-0 top-3 z-50 flex justify-center px-4 sm:top-4 sm:px-4">
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-[1.75rem] px-3 py-2.5 md:rounded-full md:px-4 md:py-2">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ef3340] p-1.5 shadow-sm sm:h-9 sm:w-9">
            <img
              src="https://api.iconify.design/simple-icons:kalilinux.svg?color=%23ffffff"
              alt=""
              aria-hidden="true"
              className="h-full w-full"
            />
          </span>
          <span className="block max-w-[8rem] truncate font-display text-sm font-semibold text-[#ef3340] sm:max-w-[10rem]">{brandName}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className={`block rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-ink text-paper"
                    : "text-ink/65 hover:bg-surface/70 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            {renderResumeControls(true)}
          </div>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep"
          >
            Kontak <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="glass-strong absolute top-16 w-[calc(100%-2rem)] max-w-[30rem] rounded-3xl p-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
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
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald px-4 py-3.5 text-sm font-semibold text-white"
              >
                Hubungi saya <ArrowUpRight size={15} />
              </Link>
            </li>
          </ul>
        </div>
      )}
      <MediaPreview
        src={resumePreview ? cvUrl : ""}
        title="Preview Resume"
        pdfPageCount={4}
        onClose={() => setResumePreview(false)}
      />
    </header>
  );
}
