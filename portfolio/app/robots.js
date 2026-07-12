const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";

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
