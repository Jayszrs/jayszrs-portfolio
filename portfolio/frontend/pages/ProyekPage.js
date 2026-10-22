import { readContent } from "@/backend/lib/content";
import { pageMetadata } from "@/frontend/lib/site-metadata";
import PublicPage from "@/frontend/components/PublicPage";
import Gallery from "@/frontend/components/Gallery";
import SelectedDesigns from "@/frontend/components/SelectedDesigns";
import Collaborations from "@/frontend/components/Collaborations";
import WebServicesCard from "@/frontend/components/WebServicesCard";

export const revalidate = 3600;

export const metadata = pageMetadata("/proyek", {
  title: "Proyek Website & Aplikasi — Jaelani Surya Saputra",
  description: "Portofolio proyek website, aplikasi web, IoT dan desain Jaelani Surya Saputra (Jay Szrs). Lihat karya dan layanan pengembangan web melalui Wasla Informatika.",
});

export default async function ProyekPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        ...content.pageHeroes.proyek,
        count: content.gallery.length,
      }}
    >
      <Gallery items={content.gallery} section={content.sections.gallery} />
      <SelectedDesigns items={content.selectedDesigns} section={content.sections.selectedDesigns} />
      <Collaborations items={content.collaborations} />
      <WebServicesCard promotion={content.profile.webServices} />
    </PublicPage>
  );
}
