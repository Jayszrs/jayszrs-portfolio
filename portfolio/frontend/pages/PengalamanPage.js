import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Experience from "@/frontend/components/Experience";

export const revalidate = 3600;

export const metadata = {
  title: "Pengalaman",
  description: "Pengalaman organisasi, kerja, dan volunteer Jaelani Surya Saputra.",
};

export default async function PengalamanPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        ...content.pageHeroes.pengalaman,
        count: content.experience.length,
      }}
    >
      <Experience items={content.experience} section={content.sections.experience} />
    </PublicPage>
  );
}
