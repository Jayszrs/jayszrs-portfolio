export default function manifest() {
  return {
    name: "Jay Szrs Portfolio",
    short_name: "Jay Szrs",
    description:
      "Jaelani Surya Saputra: jasa pembuatan website, IT network, IT support, dan portofolio proyek.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    icons: [
      {
        src: "/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
