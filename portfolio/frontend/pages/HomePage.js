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
import Ratings from "@/frontend/components/Ratings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative">
      <ParallaxBlobs />
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} cvUrl={content.profile.cvUrl} />
      <Hero profile={content.profile} />
      <SignalStrip roles={content.profile.roles} section={content.sections.signalStrip} />
      <About about={content.about} section={content.sections.about} />
      <Education items={content.education} section={content.sections.education} />
      <Capabilities capabilities={content.capabilities} section={content.sections.capabilities} />
      <Experience items={content.experience} section={content.sections.experience} />
      <Gallery items={content.gallery} section={content.sections.gallery} />
      <SelectedDesigns items={content.selectedDesigns} section={content.sections.selectedDesigns} />
      <Ratings items={content.ratings} section={content.sections.ratings} />
      <Achievements achievements={content.achievements} certificates={content.certificates} section={content.sections.achievements} />
      <Contact contact={content.contact} profile={content.profile} section={content.sections.contact} />
    </main>
  );
}
