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
      hero={{
        eyebrow: "Mari bicara",
        title: "Punya ide menarik? Saya siap mendengarkan.",
        description: "Ceritakan kebutuhan, tantangan, atau peluang kolaborasinya. Kita bisa mulai dari percakapan sederhana.",
        accent: "emerald",
      }}
    >
      <Contact contact={content.contact} profile={content.profile} />
    </PublicPage>
  );
}
