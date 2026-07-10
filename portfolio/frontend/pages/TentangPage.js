import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import About from "@/frontend/components/About";

export const revalidate = 3600;

export const metadata = {
  title: "Tentang",
  description: "Profil dan cerita singkat Jaelani Surya Saputra.",
};

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
    </PublicPage>
  );
}
