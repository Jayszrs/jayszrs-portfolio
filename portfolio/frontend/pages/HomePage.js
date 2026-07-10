import { readContent } from "@/backend/lib/content";
import Navbar from "@/frontend/components/Navbar";
import Hero from "@/frontend/components/Hero";
import About from "@/frontend/components/About";
import SignalStrip from "@/frontend/components/SignalStrip";
import LazyHomeSections from "@/frontend/components/LazyHomeSections";

export const revalidate = 3600;

export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative">
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} cvUrl={content.profile.cvUrl} />
      <Hero profile={content.profile} />
      <SignalStrip roles={content.profile.roles} section={content.sections.signalStrip} />
      <About about={content.about} section={content.sections.about} />
      <LazyHomeSections content={content} />
    </main>
  );
}
