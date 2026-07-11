const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";

export default function manifest() {
  return {
    name: "Jay Szrs Portfolio",
    short_name: "Jay Szrs",
    description:
      "Portofolio Jaelani Surya Saputra untuk software engineering, IT infrastructure, dan web development.",
    start_url: siteUrl,
    scope: "/",
    display: "standalone",
    background_color: "#f7f9f8",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
