import { readContent } from "@/lib/content";
import PublicPage from "@/components/PublicPage";
import Contact from "@/components/Contact";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kontak — Jaelani Surya Saputra",
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
