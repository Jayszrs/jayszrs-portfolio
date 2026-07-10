import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Education from "@/frontend/components/Education";

export const revalidate = 3600;

export const metadata = {
  title: "Pendidikan",
  description: "Riwayat pendidikan dan dokumentasi akademik Jaelani Surya Saputra.",
};

export default async function PendidikanPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        eyebrow: "Academic journey",
        title: "Pendidikan",
        description: "Riwayat sekolah, kampus, fokus pembelajaran, nilai, dan dokumentasi akademik.",
        accent: "emerald",
        count: content.education.length,
      }}
    >
      <Education items={content.education} section={content.sections.education} />
    </PublicPage>
  );
}
