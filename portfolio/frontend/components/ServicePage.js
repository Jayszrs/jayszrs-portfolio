import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PublicPage from '@/frontend/components/PublicPage';
import { SITE_URL } from '@/frontend/lib/site-metadata';
import { services } from '@/frontend/lib/services';

export default function ServicePage({ content, service }) {
  const url = `${SITE_URL}/${service.slug}`;
  const name = content.profile.fullName || 'Jaelani Surya Saputra';
  const graph = [
    { '@type': 'Person', '@id': `${SITE_URL}/#person`, name, alternateName: 'Jay Szrs', url: SITE_URL },
    {
      '@type': 'Service', '@id': `${url}#service`, name: service.label,
      serviceType: service.label, description: service.description, url,
      provider: { '@id': `${SITE_URL}/#person` },
      areaServed: [{ '@type': 'City', name: 'Jakarta' }, { '@type': 'City', name: 'Bekasi' }],
      hasOfferCatalog: { '@type': 'OfferCatalog', name: service.label, itemListElement: service.items.map(item => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: item.title, description: item.description } })) },
    },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: service.title, description: service.description, inLanguage: 'id-ID', mainEntity: { '@id': `${url}#service` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: service.label, item: url }] },
  ];

  return <PublicPage content={content} hero={{ title: service.title, description: service.introduction }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') }} />
    <div className="section-pad py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-muted"><Link href="/" className="underline underline-offset-4">Beranda</Link><span aria-hidden="true">/</span><span aria-current="page">{service.label}</span></nav>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.55fr)] lg:gap-20">
          <div>
            <section aria-labelledby="service-scope">
              <h2 id="service-scope" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Apa yang bisa saya bantu?</h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {service.items.map(item => <div key={item.title} className="py-6"><dt className="font-display text-lg font-semibold text-ink">{item.title}</dt><dd className="mt-3 max-w-[68ch] text-base leading-8 text-muted">{item.description}</dd></div>)}
              </dl>
            </section>
            <section aria-labelledby="service-process" className="mt-12">
              <h2 id="service-process" className="font-display text-2xl font-semibold tracking-tight">Cara memulai kerja sama</h2>
              <p className="mt-4 max-w-[68ch] leading-8 text-muted">{service.process}</p>
              <Link href={service.proof.href} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4">{service.proof.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </section>
          </div>
          <aside className="rounded-xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="service-contact">
            <h2 id="service-contact" className="font-display text-2xl font-semibold">Ceritakan kebutuhan Anda</h2>
            <p className="mt-4 leading-8 text-muted">{service.preparation}</p>
            <Link href="/kontak" className="action-button mt-7 min-h-12">Diskusikan kebutuhan<ArrowUpRight size={17} aria-hidden="true" /></Link>
            <p className="mt-5 text-sm leading-7 text-muted">Hubungi <span data-no-translate>{name}</span> melalui WhatsApp atau email pada halaman kontak.</p>
          </aside>
        </div>
        <section aria-labelledby="service-questions" className="mt-16 max-w-3xl">
          <h2 id="service-questions" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Pertanyaan sebelum memulai</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">{service.questions.map(item => <details key={item.question} className="py-5"><summary className="cursor-pointer text-base font-semibold leading-7 text-ink">{item.question}</summary><p className="mt-3 max-w-[68ch] leading-8 text-muted">{item.answer}</p></details>)}</div>
        </section>
        <nav aria-label="Layanan lainnya" className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-line pt-7 text-sm text-muted"><span>Layanan lainnya</span>{services.filter(item => item.slug !== service.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-4">{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav>
      </div>
    </div>
  </PublicPage>;
}
