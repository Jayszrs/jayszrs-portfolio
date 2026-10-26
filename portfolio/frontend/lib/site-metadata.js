// Vercel redirects the www hostname to this site's apex domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jayszrs.my.id')
  .replace(/^https?:\/\/www\.jayszrs\.my\.id(?=\/|$)/i, 'https://jayszrs.my.id')
  .replace(/\/+$/, '');
export const SITE_NAME = 'Jay Szrs';
export const HOME_TITLE = 'Jaelani Surya Saputra | Jasa Website & IT Network';
export const HOME_DESCRIPTION = 'Jaelani Surya Saputra (Jay Szrs). Jasa pembuatan website, aplikasi web, IT network, dan IT support di Jakarta & Bekasi. Lihat proyek dan diskusikan kebutuhan Anda.';

export function pageMetadata(path, { title, description }) {
  const url = new URL(path, `${SITE_URL}/`).href;
  const fullTitle = path === '/' ? HOME_TITLE : `${title} | Jay Szrs`;
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: fullTitle, description, siteName: SITE_NAME, locale: 'id_ID', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Jaelani Surya Saputra — Web Developer & IT, Jay Szrs' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/opengraph-image'] },
  };
}
