"use client";

import { Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import TikTokIcon from "@/frontend/components/TikTokIcon";
import { externalUrl } from "@/frontend/lib/urls";

const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
};

export default function Contact({ contact, profile, section = {} }) {
  const socials = { ...(profile?.socials || {}), ...(contact.socials || {}) };
  const whatsappNumber = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");

  return (
    <section id="kontak" className="section-pad py-12 sm:py-20">
      <div className="glass-strong mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-6 sm:p-12">
            <p className="eyebrow">{section.eyebrow || "Kontak"}</p>
            <h2 className="mt-3 font-display text-[2.25rem] font-semibold leading-tight text-ink sm:text-5xl">{contact.heading}</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg">{contact.subheading}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${contact.email}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep sm:px-6">
                <Mail size={16} /> {section.emailButton || "Kirim email"}
              </a>
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white sm:px-6">
                  <MessageCircle size={16} /> {section.whatsappButton || "WhatsApp"}
                </a>
              )}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              {Object.entries(socials).map(([name, url]) => {
                const Icon = SOCIAL_ICONS[name];
                if (!url) return null;
                if (name === "tiktok") {
                  return (
                    <a key={name} href={externalUrl(url)} target="_blank" rel="noreferrer" aria-label="TikTok" className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:-translate-y-0.5 hover:text-emerald">
                      <TikTokIcon size={18} />
                    </a>
                  );
                }
                if (!Icon) return null;
                return (
                  <a key={name} href={externalUrl(url)} target="_blank" rel="noreferrer" aria-label={name} className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:-translate-y-0.5 hover:text-emerald">
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="bg-ink p-6 text-paper sm:p-10">
            <p className="font-display text-lg font-semibold">{section.detailsTitle || "Detail kontak"}</p>
            <div className="mt-7 space-y-5">
              <a href={`mailto:${contact.email}`} className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-emerald" />
                <div>
                  <p className="text-xs text-paper/55">Email</p>
                  <p className="mt-1 break-all text-sm font-medium">{contact.email}</p>
                </div>
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-emerald" />
                  <div>
                    <p className="text-xs text-paper/55">Nomor telepon</p>
                    <p className="mt-1 text-sm font-medium">{contact.phone}</p>
                  </div>
                </a>
              )}
              {(contact.address || profile?.location) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-emerald" />
                  <div>
                    <p className="text-xs text-paper/55">Lokasi</p>
                    <p className="mt-1 text-sm font-medium">{contact.address || profile.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center sm:mt-16">
        <p className="font-mono text-xs text-muted">&copy; {new Date().getFullYear()} jayszrs</p>
      </footer>
    </section>
  );
}
