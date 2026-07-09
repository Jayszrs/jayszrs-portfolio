import { readContent } from "@/backend/lib/content";
import ParallaxBlobs from "@/frontend/components/ParallaxBlobs";
import Navbar from "@/frontend/components/Navbar";
import Hero from "@/frontend/components/Hero";
import About from "@/frontend/components/About";
import Experience from "@/frontend/components/Experience";
import Gallery from "@/frontend/components/Gallery";
import Achievements from "@/frontend/components/Achievements";
import Contact from "@/frontend/components/Contact";
import Capabilities from "@/frontend/components/Capabilities";
import SelectedDesigns from "@/frontend/components/SelectedDesigns";
import Education from "@/frontend/components/Education";
import SignalStrip from "@/frontend/components/SignalStrip";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative">
      <ParallaxBlobs />
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} />
      <Hero profile={content.profile} />
      <SignalStrip roles={content.profile.roles} />
      <About about={content.about} />
      <Education items={content.education} />
      <Capabilities capabilities={content.capabilities} />
      <Experience items={content.experience} />
      <Gallery items={content.gallery} />
      <SelectedDesigns items={content.selectedDesigns} />
      <Achievements achievements={content.achievements} certificates={content.certificates} />
      <Contact contact={content.contact} profile={content.profile} />
    </main>
  );
}
