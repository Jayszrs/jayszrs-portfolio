"use client";

import { Mail, Github, Linkedin, Instagram } from "lucide-react";

export default function Contact({ contact, profile }) {
  return (
    <section id="kontak" className="section-pad py-24">
      <div className="glass-strong mx-auto max-w-4xl rounded-[2rem] px-8 py-14 text-center">
        <p className="eyebrow">Kontak</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {contact.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-muted">{contact.subheading}</p>

        <a
          href={`mailto:${contact.email}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-white shadow-glass transition hover:bg-emerald-deep"
        >
          <Mail size={16} /> {contact.email}
        </a>

        <div className="mt-8 flex items-center justify-center gap-4">
          {profile.socials.github && (
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
              <Github size={18} />
            </a>
          )}
          {profile.socials.linkedin && (
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
              <Linkedin size={18} />
            </a>
          )}
          {profile.socials.instagram && (
            <a href={profile.socials.instagram} target="_blank" rel="noreferrer" className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:text-emerald">
              <Instagram size={18} />
            </a>
          )}
        </div>
      </div>

      <footer className="mt-16 text-center">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.fullName}. Dibuat dengan Next.js.
        </p>
      </footer>
    </section>
  );
}
