import { readContent } from "@/backend/lib/content";
import Navbar from "@/frontend/components/Navbar";
import Hero from "@/frontend/components/Hero";
import About from "@/frontend/components/About";
import LazyHomeSections from "@/frontend/components/LazyHomeSections";
import { profileHeroImages } from "@/frontend/lib/profileImages";
import { externalUrl } from "@/frontend/lib/urls";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";

function unique(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function publicUrl(value = "") {
  const url = externalUrl(value);
  return /^https?:\/\//i.test(url) ? url : "";
}

function JsonLd({ content }) {
  const profile = content.profile || {};
  const contact = content.contact || {};
  const profileSocials = profile.socials || {};
  const contactSocials = contact.socials || {};
  const sameAs = unique([
    publicUrl(profileSocials.github),
    publicUrl(profileSocials.linkedin),
    publicUrl(profileSocials.instagram),
    publicUrl(profileSocials.tiktok),
    publicUrl(contactSocials.github),
    publicUrl(contactSocials.linkedin),
    publicUrl(contactSocials.instagram),
    publicUrl(contactSocials.tiktok),
  ]);
  const heroImage = profileHeroImages(profile)[0];
  const roles = Array.isArray(profile.roles) && profile.roles.length
    ? profile.roles
    : String(profile.role || "")
      .split(/[,|-]/)
      .map((role) => role.trim())
      .filter(Boolean);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.fullName || "Jaelani Surya Saputra",
    alternateName: unique([
      "Jaelani",
      "Jaelani Surya Saputra",
      "Jay",
      "Jay Szrs",
      "jayszrs",
      profile.brandName,
      profile.handle,
    ]),
    url: siteUrl,
    image: heroImage ? publicUrl(heroImage) : `${siteUrl}/favicon-512.png`,
    jobTitle: roles,
    sameAs,
    knowsAbout: [
      "IT Infrastructure",
      "Web Development",
      "AI Engineering",
      "Software Engineering",
      "Cyber Security",
      "Network Forensics",
      "Graphic Design",
      "Video Editing",
    ],
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Jay Szrs Portfolio",
    alternateName: ["Jaelani Surya Saputra", "Jay Szrs", "jayszrs", "Jay"],
    url: siteUrl,
    inLanguage: "id-ID",
    publisher: { "@id": `${siteUrl}/#person` },
  };

  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#profile`,
    url: siteUrl,
    name: "Portfolio Jaelani Surya Saputra",
    about: { "@id": `${siteUrl}/#person` },
    mainEntity: { "@id": `${siteUrl}/#person` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([person, webSite, profilePage]).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative">
      <JsonLd content={content} />
      <Navbar brandName={content.profile.brandName} fullName={content.profile.fullName} cvUrl={content.profile.cvUrl} />
      <Hero profile={content.profile} />
      <About about={content.about} section={content.sections.about} />
      <LazyHomeSections content={content} />
    </main>
  );
}
