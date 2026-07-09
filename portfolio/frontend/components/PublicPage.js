import Navbar from "@/frontend/components/Navbar";
import ParallaxBlobs from "@/frontend/components/ParallaxBlobs";
import PageHero from "@/frontend/components/PageHero";
import SiteFooter from "@/frontend/components/SiteFooter";

export default function PublicPage({ content, hero, children, hideFooter = false }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParallaxBlobs />
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} />
      <PageHero {...hero} />
      {children}
      {!hideFooter && <SiteFooter profile={content.profile} />}
    </main>
  );
}
