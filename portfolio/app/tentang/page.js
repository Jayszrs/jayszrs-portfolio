import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import About from "@/frontend/components/About";
import Capabilities from "@/frontend/components/Capabilities";
import Education from "@/frontend/components/Education";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tentang",
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
      <Education items={content.education} />
      <Capabilities capabilities={content.capabilities} />
    </PublicPage>
  );
}
