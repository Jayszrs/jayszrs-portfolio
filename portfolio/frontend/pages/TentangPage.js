import { readContent } from "@/backend/lib/content";
import { pageMetadata } from "@/frontend/lib/site-metadata";
import PublicPage from "@/frontend/components/PublicPage";
import About from "@/frontend/components/About";
import JourneyTimeline from "@/frontend/components/JourneyTimeline";

export const revalidate = 3600;

export const metadata = pageMetadata("/tentang", {
  title: "Tentang Jaelani Surya Saputra, Web Developer & IT",
  description: "Profil Jay Szrs atau Jaelani Surya Saputra: pengembang web dan praktisi IT, beserta perjalanan pendidikan dan pengalaman di Jakarta dan Bekasi.",
});

export default async function TentangPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        ...content.pageHeroes.tentang,
        description: "Kenali cerita singkat, cara berpikir, dan arah kerja saya dalam membangun produk digital.",
      }}
    >
      <About about={content.about} section={content.sections.about} />
      <JourneyTimeline education={content.education} experience={content.experience} />
    </PublicPage>
  );
}
