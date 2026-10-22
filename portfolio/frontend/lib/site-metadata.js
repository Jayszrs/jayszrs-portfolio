export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jayszrs.my.id').replace(/\/+$/, '');
export const SITE_NAME = 'Jay Szrs';
export const HOME_TITLE = 'Jaelani Surya Saputra — Web Developer & IT | Jay Szrs';
export const HOME_DESCRIPTION = 'Jaelani Surya Saputra (Jay Szrs), pengembang web dan praktisi IT di Jakarta & Bekasi. Jasa pembuatan website, aplikasi web, portofolio proyek dan pengalaman IT.';

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
