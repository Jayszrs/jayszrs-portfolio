import Navbar from "@/components/Navbar";
import ParallaxBlobs from "@/components/ParallaxBlobs";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";

export default function PublicPage({ content, hero, children, hideFooter = false }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParallaxBlobs />
      <Navbar brandName={content.profile.brandName} />
      <PageHero {...hero} />
      {children}
      {!hideFooter && <SiteFooter profile={content.profile} />}
    </main>
  );
}
