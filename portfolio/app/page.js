import { readContent } from "@/lib/content";
import ParallaxBlobs from "@/components/ParallaxBlobs";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Gallery from "@/components/Gallery";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative">
      <ParallaxBlobs />
      <Navbar brandName={content.profile.brandName} />
      <Hero profile={content.profile} />
      <About about={content.about} />
      <Experience items={content.experience} />
      <Gallery items={content.gallery} />
      <Achievements achievements={content.achievements} certificates={content.certificates} />
      <Contact contact={content.contact} profile={content.profile} />
    </main>
  );
}
