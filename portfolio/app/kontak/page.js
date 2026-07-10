import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Contact from "@/frontend/components/Contact";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kontak",
  description: "Hubungi Jaelani Surya Saputra untuk kolaborasi dan proyek.",
};

export default async function KontakPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hideFooter
      hero={content.pageHeroes.kontak}
    >
      <Contact contact={content.contact} profile={content.profile} section={content.sections.contact} />
    </PublicPage>
  );
}
