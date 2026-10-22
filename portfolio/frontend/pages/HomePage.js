import { readContent } from "@/backend/lib/content";
import Navbar from "@/frontend/components/Navbar";
import Hero from "@/frontend/components/Hero";
import About from "@/frontend/components/About";
import LazyHomeSections from "@/frontend/components/LazyHomeSections";
import SocialHub from "@/frontend/components/DeferredSocialHub";
import { profileHeroImages } from "@/frontend/lib/profileImages";
import { externalUrl } from "@/frontend/lib/urls";
import { mediaSource } from "@/frontend/lib/media";
import { SITE_URL as siteUrl } from "@/frontend/lib/site-metadata";
import WebServicesCard from "@/frontend/components/WebServicesCard";
import SiteFooter from "@/frontend/components/SiteFooter";
import Collaborations from "@/frontend/components/Collaborations";

export const revalidate = 3600;


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
    image: heroImage ? new URL(mediaSource(heroImage), `${siteUrl}/`).href : `${siteUrl}/favicon-512.png`,
    description: 'Jaelani Surya Saputra, dikenal sebagai Jay Szrs, pengembang web dan praktisi IT di Jakarta dan Bekasi.',
    jobTitle: roles,
    sameAs,
    knowsAbout: [
      "IT Infrastructure",
      "Web Development",
      "Pengembangan web",
      "Jasa pembuatan website",
      "Infrastruktur IT",
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
        __html: JSON.stringify([person, webSite, profilePage, {
          '@context': 'https://schema.org', '@type': 'Service', '@id': `${siteUrl}/#web-development`,
          name: 'Jasa pembuatan website dan aplikasi web', serviceType: 'Pengembangan web',
          description: 'Pengembangan landing page, company profile dan aplikasi web oleh Jaelani Surya Saputra melalui Wasla Informatika.',
          url: `${siteUrl}/#jasa-website`, provider: { '@id': `${siteUrl}/#person` },
          areaServed: ['Jakarta', 'Bekasi'],
        }]).replace(/</g, "\\u003c"),
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
      <SocialHub socials={content.profile.socials} highlights={content.profile.socialHighlights} identity={{ name: content.profile.fullName, role: content.profile.role, location: content.profile.location, photo: profileHeroImages(content.profile)[0] }} />
      <About about={content.about} section={content.sections.about} />
      <LazyHomeSections content={content} />
      <Collaborations items={content.collaborations} />
      <WebServicesCard promotion={content.profile.webServices} />
      <SiteFooter profile={content.profile} />
    </main>
  );
}
