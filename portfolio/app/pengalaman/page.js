import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Experience from "@/frontend/components/Experience";

export const dynamic = "force-dynamic";

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
        eyebrow: "Perjalanan",
        title: "Belajar lewat kerja nyata dan kolaborasi.",
        description: "Catatan pengalaman profesional, organisasi, dan volunteer yang membentuk cara saya bekerja hari ini.",
        accent: "ink",
        count: content.experience.length,
      }}
    >
      <Experience items={content.experience} />
    </PublicPage>
  );
}
