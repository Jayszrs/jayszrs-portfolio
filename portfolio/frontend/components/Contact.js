"use client";

import { Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";

const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: MessageCircle,
};

export default function Contact({ contact, profile }) {
  const socials = { ...(profile?.socials || {}), ...(contact.socials || {}) };
  const whatsappNumber = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");

  return (
    <section id="kontak" className="section-pad py-16 sm:py-20">
      <div className="glass-strong mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-8 sm:p-12">
            <p className="eyebrow">Kontak</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-5xl">{contact.heading}</h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">{contact.subheading}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep">
                <Mail size={16} /> Kirim email
              </a>
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              )}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              {Object.entries(socials).map(([name, url]) => {
                const Icon = SOCIAL_ICONS[name];
                if (!url || !Icon) return null;
                return (
                  <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition hover:-translate-y-0.5 hover:text-emerald">
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="bg-ink p-8 text-white sm:p-10">
            <p className="font-display text-lg font-semibold">Detail kontak</p>
            <div className="mt-7 space-y-5">
              <a href={`mailto:${contact.email}`} className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-emerald" />
                <div>
                  <p className="text-xs text-white/45">Email</p>
                  <p className="mt-1 break-all text-sm font-medium">{contact.email}</p>
                </div>
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-emerald" />
                  <div>
                    <p className="text-xs text-white/45">Nomor telepon</p>
                    <p className="mt-1 text-sm font-medium">{contact.phone}</p>
                  </div>
                </a>
              )}
              {(contact.address || profile?.location) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-emerald" />
                  <div>
                    <p className="text-xs text-white/45">Lokasi</p>
                    <p className="mt-1 text-sm font-medium">{contact.address || profile.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center">
        <p className="font-mono text-xs text-muted">© {new Date().getFullYear()} {profile.fullName}. Dibuat dengan Next.js.</p>
        <p className="mt-2 text-[10px] text-muted/60">
          Brand icons via <a href="https://iconify.design/" target="_blank" rel="noreferrer" className="underline">Iconify</a>.
        </p>
      </footer>
    </section>
  );
}
