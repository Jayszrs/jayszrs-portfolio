import { readContent } from "@/backend/lib/content";
import { pageMetadata } from "@/frontend/lib/site-metadata";
import PublicPage from "@/frontend/components/PublicPage";
import Contact from "@/frontend/components/Contact";

export const revalidate = 3600;

export const metadata = pageMetadata("/kontak", {
  title: "Hubungi Jaelani Surya Saputra — Website & IT",
  description: "Hubungi Jay Szrs (Jaelani Surya Saputra) untuk jasa pembuatan website, aplikasi web, kolaborasi dan proyek IT di Jakarta dan Bekasi.",
});

export default async function KontakPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={content.pageHeroes.kontak}
    >
      <Contact contact={content.contact} profile={content.profile} section={content.sections.contact} />
    </PublicPage>
  );
}
