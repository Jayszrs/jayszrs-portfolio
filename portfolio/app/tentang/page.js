import { readContent } from "@/lib/content";
import PublicPage from "@/components/PublicPage";
import About from "@/components/About";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tentang — Jaelani Surya Saputra",
  description: "Profil, fokus, dan keahlian Jaelani Surya Saputra.",
};

export default async function TentangPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        eyebrow: "Lebih dekat",
        title: "Teknologi yang rapi, aman, dan benar-benar berguna.",
        description: "Kenali cara saya berpikir, bidang yang saya pelajari, serta kemampuan yang saya bawa ke setiap proyek.",
        accent: "emerald",
      }}
    >
      <About about={content.about} />
    </PublicPage>
  );
}
