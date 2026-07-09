import { readContent } from "@/lib/content";
import PublicPage from "@/components/PublicPage";
import Achievements from "@/components/Achievements";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pencapaian — Jaelani Surya Saputra",
  description: "Pencapaian dan sertifikat Jaelani Surya Saputra.",
};

export default async function PencapaianPage() {
  const content = await readContent();
  const total = content.achievements.length + content.certificates.length;

  return (
    <PublicPage
      content={content}
      hero={{
        eyebrow: "Milestone",
        title: "Bukti kecil dari proses yang terus berjalan.",
        description: "Kumpulan pencapaian, sertifikasi, dan pengakuan yang menjadi penanda perjalanan belajar saya.",
        accent: "gold",
        count: total,
      }}
    >
      <Achievements achievements={content.achievements} certificates={content.certificates} />
    </PublicPage>
  );
}
