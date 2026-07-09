"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/tentang#pendidikan", label: "Pendidikan" },
  { href: "/pengalaman", label: "Pengalaman" },
  { href: "/proyek", label: "Proyek" },
  { href: "/pencapaian", label: "Pencapaian" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2 md:px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ef3340] p-1.5 shadow-sm">
            <img
              src="https://api.iconify.design/simple-icons:kalilinux.svg?color=%23ffffff"
              alt=""
              aria-hidden="true"
              className="h-full w-full"
            />
          </span>
          <span className="hidden font-display text-sm font-semibold text-[#ef3340] sm:block">Jay Szrs</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-ink text-white"
                    : "text-ink/65 hover:bg-white/70 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/kontak"
          className="hidden items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep md:inline-flex"
        >
          Hubungi <ArrowUpRight size={14} />
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {open && (
        <div className="glass-strong absolute top-16 w-[calc(100%-2rem)] max-w-sm rounded-2xl p-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                    pathname === link.href ? "bg-ink text-white" : "text-ink/80"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
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
