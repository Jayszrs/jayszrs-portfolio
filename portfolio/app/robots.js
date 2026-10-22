import { SITE_URL as siteUrl } from '@/frontend/lib/site-metadata';

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/content", "/api/ratings"],
      disallow: ["/admin", "/api/auth", "/api/upload"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
