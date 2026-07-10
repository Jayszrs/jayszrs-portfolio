import { readContent } from "@/backend/lib/content";
import PublicPage from "@/frontend/components/PublicPage";
import Capabilities from "@/frontend/components/Capabilities";

export const revalidate = 3600;

export const metadata = {
  title: "Keahlian",
  description: "Software, programming skill, dan operating system yang digunakan Jaelani Surya Saputra.",
};

function countCapabilities(capabilities = {}) {
  return Object.values(capabilities).reduce((total, items) => total + (Array.isArray(items) ? items.length : 0), 0);
}

export default async function KeahlianPage() {
  const content = await readContent();

  return (
    <PublicPage
      content={content}
      hero={{
        eyebrow: "Toolbox & workflow",
        title: "Keahlian & Software",
        description: "Software editing, programming skill, dan operating system yang saya gunakan dalam proyek.",
        accent: "gold",
        count: countCapabilities(content.capabilities),
      }}
    >
      <Capabilities capabilities={content.capabilities} section={content.sections.capabilities} />
    </PublicPage>
  );
}
