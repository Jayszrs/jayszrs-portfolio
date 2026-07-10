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
      hero={content.pageHeroes.tentang}
    >
      <About about={content.about} section={content.sections.about} />
      <Education items={content.education} section={content.sections.education} />
      <Capabilities capabilities={content.capabilities} section={content.sections.capabilities} />
    </PublicPage>
  );
}
