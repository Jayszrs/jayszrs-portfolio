import Navbar from "@/frontend/components/Navbar";
import PageHero from "@/frontend/components/PageHero";
import SiteFooter from "@/frontend/components/SiteFooter";

export default function PublicPage({ content, hero, children, hideFooter = false }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} cvUrl={content.profile.cvUrl} />
      <PageHero {...hero} />
      {children}
      {!hideFooter && <SiteFooter profile={content.profile} section={content.sections.contact} />}
    </main>
  );
}
