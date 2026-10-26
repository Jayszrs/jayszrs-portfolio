import { ArrowUpRight, Code2 } from 'lucide-react';
import Link from 'next/link';

function destination(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export default function WebServicesCard({ promotion = {} }) {
  if (promotion.enabled === false) return null;
  const url = destination(promotion.url);
  return <section id="jasa-website" className="section-pad py-14 sm:py-20" aria-labelledby="web-services-heading">
    <div className="web-services-card mx-auto max-w-6xl">
      <div className="web-services-copy">
        <h2 id="web-services-heading">Jasa pembuatan website untuk bisnis Anda.</h2>
        <p>Saya membantu membangun landing page, company profile, dan aplikasi web melalui <span data-no-translate>Wasla Informatika</span>. Ceritakan kebutuhan Anda, lalu kita tentukan solusi yang sesuai.</p>
        {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="action-button">Kunjungi Wasla Informatika<ArrowUpRight size={17} aria-hidden="true" /></a> : <a href="/kontak" className="action-button">Diskusikan kebutuhan website<ArrowUpRight size={17} aria-hidden="true" /></a>}
        <nav aria-label="Detail layanan" className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"><Link href="/jasa-pembuatan-website" className="inline-flex min-h-11 items-center underline underline-offset-4">Detail jasa website</Link><Link href="/jasa-it-network" className="inline-flex min-h-11 items-center underline underline-offset-4">Jasa IT network & support</Link></nav>
      </div>
      <div className="web-services-summary">
        <div className="web-services-brand"><Code2 size={27} strokeWidth={1.4} aria-hidden="true" /><span data-no-translate>Wasla<br />Informatika</span></div>
        <ul><li>Landing page</li><li>Company profile</li><li>Aplikasi web</li></ul>
        <p>Pengembangan web oleh <span data-no-translate>Jay Szrs</span>.</p>
      </div>
    </div>
  </section>;
}
