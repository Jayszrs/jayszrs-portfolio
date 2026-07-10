"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Download, Eye, Menu, X } from "lucide-react";

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
  const pathname = usePathname();

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

  return (
    <header className="fixed left-0 right-0 top-3 z-50 flex justify-center px-5 sm:top-4 sm:px-4">
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2 md:px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef3340] p-1.5 shadow-sm sm:h-9 sm:w-9">
            <img
              src="https://api.iconify.design/simple-icons:kalilinux.svg?color=%23ffffff"
              alt=""
              aria-hidden="true"
              className="h-full w-full"
            />
          </span>
          <span className="hidden font-display text-sm font-semibold text-[#ef3340] sm:block">{brandName}</span>
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
          {cvUrl && (
            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink transition hover:bg-emerald-soft hover:text-emerald-deep"
              >
                Preview <Eye size={14} />
              </a>
              <a
                href={cvUrl}
                download
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white"
              >
                Download <Download size={14} />
              </a>
            </div>
          )}
          <Link
            href="/kontak"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep"
          >
            Hubungi <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {open && (
        <div className="glass-strong absolute top-16 w-[calc(100%-2.5rem)] max-w-sm rounded-2xl p-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                    isActive(link.href) ? "bg-ink text-paper" : "text-ink/80"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {cvUrl && (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold text-ink"
                  >
                    Preview <Eye size={15} />
                  </a>
                  <a
                    href={cvUrl}
                    download
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-3 text-sm font-semibold text-paper"
                  >
                    Download <Download size={15} />
                  </a>
                </div>
              )}
              <Link
                href="/kontak"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white"
              >
                Hubungi saya
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
