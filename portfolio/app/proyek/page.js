import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Gallery from "@/frontend/components/Gallery";
import SelectedDesigns from "@/frontend/components/SelectedDesigns";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Proyek",
  description: "Kumpulan proyek web, IoT, dan desain Jaelani Surya Saputra.",
};

export default async function ProyekPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        eyebrow: "Selected work",
        title: "Dari ide, jadi produk yang bisa dipakai.",
        description: "Pilihan proyek yang mencakup pengembangan web, sistem informasi, desain produk, dan eksperimen IoT.",
        accent: "gold",
        count: content.gallery.length,
      }}
    >
      <Gallery items={content.gallery} />
      <SelectedDesigns items={content.selectedDesigns} />
    </PublicPage>
  );
}
