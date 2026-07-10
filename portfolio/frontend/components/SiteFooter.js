import Link from "next/link";

export default function SiteFooter({ profile, section = {} }) {
  return (
    <footer className="section-pad pb-10 pt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line pt-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {profile.fullName}
          <span className="ml-2 text-[10px] text-muted/60">- {section.footerSuffix || "Dibuat dengan Next.js."}</span>
        </p>
        <div className="flex items-center gap-5">
          <Link href="/kontak" className="transition hover:text-emerald">Kontak</Link>
          <Link href="/admin" className="transition hover:text-emerald">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
