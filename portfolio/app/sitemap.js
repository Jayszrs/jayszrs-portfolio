import { SITE_URL as siteUrl } from '@/frontend/lib/site-metadata';
import { services } from '@/frontend/lib/services';

const routes = [
  "",
  "/tentang",
  "/pendidikan",
  "/keahlian",
  "/pengalaman",
  "/proyek",
  "/pencapaian",
  "/kontak",
  ...services.map(service => `/${service.slug}`),
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
