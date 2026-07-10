import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Achievements from "@/frontend/components/Achievements";

export const revalidate = 3600;

export const metadata = {
  title: "Pencapaian",
  description: "Pencapaian dan sertifikat Jaelani Surya Saputra.",
};

export default async function PencapaianPage() {
  const content = await readContent();
  const total = content.achievements.length + content.certificates.length;

  return (
    <PublicPage
      content={content}
      hero={{
        ...content.pageHeroes.pencapaian,
        count: total,
      }}
    >
      <Achievements achievements={content.achievements} certificates={content.certificates} section={content.sections.achievements} />
    </PublicPage>
  );
}
