"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Github, Instagram, Linkedin } from "lucide-react";
import TikTokIcon from "./TikTokIcon";
import curation from "@/frontend/lib/social-curation.json";

const GitHubProfile = dynamic(() => import("./GitHubProfile"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat profil dan README…</p> });
const InstagramGallery = dynamic(() => import("./InstagramGallery"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat galeri Instagram…</p> });
const TikTokVideos = dynamic(() => import("./TikTokVideos"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat video TikTok…</p> });
const LinkedInProfile = dynamic(() => import("./LinkedInProfile"), { loading: () => <p role="status" className="py-12 text-sm text-muted">Memuat profil LinkedIn…</p> });

function linkedinAccount(value) {
  try {
    const input = String(value || "").trim();
    const url = new URL(/^(?:www\.)?linkedin\.com\//i.test(input) ? `https://${input}` : input);
    const match = /^\/in\/([a-z0-9_-]+)\/?$/i.exec(url.pathname);
    if (url.protocol !== "https:" || !["linkedin.com", "www.linkedin.com"].includes(url.hostname) || !match) return null;
    return { handle: match[1], url: `https://www.linkedin.com/in/${match[1]}` };
  } catch { return null; }
}

function account(value, host, pattern) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || ![host, `www.${host}`].includes(url.hostname)) return null;
    const handle = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    return pattern.test(handle || "") ? { handle, url: `https://${host}/${host === "tiktok.com" ? "@" : ""}${handle}` } : null;
  } catch { return null; }
}

export default function SocialHub({ socials = {}, highlights, identity }) {
  const profiles = {
    linkedin: linkedinAccount(socials.linkedin),
    github: account(socials.github, "github.com", /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i),
    instagram: account(socials.instagram, "instagram.com", /^[\w.]+$/),
    tiktok: account(socials.tiktok, "tiktok.com", /^[\w.]+$/),
  };
  const options = [{ id: "linkedin", label: "LinkedIn", icon: Linkedin }, { id: "github", label: "GitHub", icon: Github }, { id: "instagram", label: "Instagram", icon: Instagram }, { id: "tiktok", label: "TikTok", icon: TikTokIcon }].filter((option) => profiles[option.id]);
  const [active, setActive] = useState(options[0]?.id);
  if (!options.length) return null;
  const selected = options.find((option) => option.id === active) || options[0];
  const music = highlights?.instagramMusic ?? (profiles.instagram?.handle.toLowerCase() === curation.instagramHandle ? curation.instagramMusic : null);

  return <section aria-label="Profil sosial media" className="section-pad py-14 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="social-heading"><h2>Di luar portofolio.</h2><p>Profil, catatan, dan hal yang saya bagikan.</p></div>
      <div className="social-workspace">
        <div className="social-workspace-bar">
          <div role="tablist" aria-label="Platform sosial media" className="social-tabs">
            {options.map((option, index) => {
              const Icon = option.icon;
              const chosen = selected.id === option.id;
              return <button key={option.id} type="button" role="tab" id={`social-tab-${option.id}`} aria-selected={chosen} aria-controls={`social-panel-${option.id}`} tabIndex={chosen ? 0 : -1} onClick={() => setActive(option.id)} onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
                setActive(options[next].id);
                document.getElementById(`social-tab-${options[next].id}`)?.focus();
              }}><Icon size={17} /><span>{option.label}</span></button>;
            })}
          </div>
          <a href={profiles[selected.id].url} target="_blank" rel="noreferrer" className="social-platform-link" data-no-translate>@{profiles[selected.id].handle}<ArrowUpRight size={14} /></a>
        </div>
        <div key={selected.id} role="tabpanel" id={`social-panel-${selected.id}`} aria-labelledby={`social-tab-${selected.id}`} tabIndex={0} className="social-panel">
          {selected.id === "linkedin" && <LinkedInProfile profile={profiles.linkedin} identity={identity} />}
          {selected.id === "github" && <GitHubProfile profile={profiles.github} />}
          {selected.id === "instagram" && <InstagramGallery profile={profiles.instagram} music={music} />}
          {selected.id === "tiktok" && <TikTokVideos profile={profiles.tiktok} />}
        </div>
      </div>
    </div>
  </section>;
}
