import { readContent } from "@/backend/lib/content";
import { pageMetadata } from "@/frontend/lib/site-metadata";
import PublicPage from "@/frontend/components/PublicPage";
import Experience from "@/frontend/components/Experience";

export const revalidate = 3600;

export const metadata = pageMetadata("/pengalaman", {
  title: "Pengalaman Web Developer & IT — Jaelani Surya Saputra",
  description: "Pengalaman Jaelani Surya Saputra dalam pengembangan web, IT infrastructure, IT support, organisasi dan kegiatan volunteer.",
});

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
