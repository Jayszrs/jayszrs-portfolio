const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";

const routes = [
  "",
  "/tentang",
  "/pendidikan",
  "/keahlian",
  "/pengalaman",
  "/proyek",
  "/pencapaian",
  "/kontak",
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
