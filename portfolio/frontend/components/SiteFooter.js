import Link from 'next/link';

export default function SiteFooter({ profile = {} }) {
  return (
    <footer className="site-footer section-pad pt-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-ink" data-no-translate>Jay Szrs</p>
        <nav aria-label="Navigasi footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/tentang" prefetch={false}>Tentang</Link><Link href="/proyek" prefetch={false}>Proyek</Link><Link href="/kontak" prefetch={false}>Kontak</Link>
        </nav>
        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} <span data-no-translate>{profile.fullName || 'Jaelani Surya Saputra'}</span></p>
      </div>
      <div className="footer-wordmark" aria-hidden="true" data-no-translate>Jay Szrs</div>
    </footer>
  );
}
