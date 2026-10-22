"use client";

import { useState } from "react";
import { ArrowUpRight, Expand, Instagram, Music2, Play } from "lucide-react";
import SafeImage from "./SafeImage";
import MediaPreview from "./MediaPreview";
import gallery from "@/frontend/lib/instagram-gallery.json";

export default function InstagramGallery({ profile, music }) {
  const [preview, setPreview] = useState(-1);
  const [listen, setListen] = useState(false);
  const ownsGallery = profile.handle.toLowerCase() === gallery.handle;
  const photos = ownsGallery ? [gallery.photos[1], gallery.photos[0], ...gallery.photos.slice(2)] : [];
  let trackId = "";
  try {
    const url = new URL(music?.spotifyUrl);
    if (url.protocol === "https:" && url.hostname === "open.spotify.com") trackId = /^\/track\/([a-zA-Z0-9]{22})\/?$/.exec(url.pathname)?.[1] || "";
  } catch { /* Only a valid Spotify track may be embedded. */ }

  return <div className="instagram-editorial">
    <div className="instagram-story">
      <a className="social-account" href={profile.url} target="_blank" rel="noreferrer">
        {ownsGallery ? <SafeImage src={gallery.avatar.src} alt="" sizes="44px" className="h-11 w-11 shrink-0 rounded-xl" imgClassName="object-cover" /> : <Instagram size={24} />}
        <span>@{profile.handle}</span><ArrowUpRight size={15} />
      </a>
      <h3>Di balik keseharian.</h3>
      <p className="instagram-intro">Momen, pertemuan, dan cerita yang saya bagikan di Instagram.</p>
      <a href={profile.url} target="_blank" rel="noreferrer" className="action-button mt-6">Jelajahi Instagram<ArrowUpRight size={16} /></a>
      {music?.title && <section className="profile-record" aria-label="Musik pilihan profil Instagram">
        <div className="record-disc" aria-hidden="true"><Music2 size={19} /></div>
        <div className="min-w-0"><p className="text-xs text-muted">Musik di profil saya</p><p className="mt-1 font-semibold text-ink" data-no-translate>{music.title}</p><p className="mt-1 text-xs leading-5 text-muted" data-no-translate>{music.artist}</p></div>
        {trackId && <button type="button" className="record-play" aria-label={listen ? "Tutup pemutar musik" : "Dengarkan musik"} aria-expanded={listen} aria-controls="instagram-music" onClick={() => setListen(!listen)}><Play size={17} fill="currentColor" /></button>}
        {trackId && listen && <iframe id="instagram-music" src={`https://open.spotify.com/embed/track/${trackId}?theme=0`} title={`${music.title} — ${music.artist}`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" className="col-span-3 mt-3 w-full rounded-xl border-0" />}
      </section>}
      <p className="instagram-footnote">Story dan Notes bisa dilihat langsung di Instagram.</p>
    </div>
    <div className="min-w-0">
      {photos.length ? <>
        <div className="instagram-photo-grid" aria-label="Galeri foto Instagram">
          {photos.map((photo, index) => <button type="button" key={photo.src} onClick={() => setPreview(index)} className={`instagram-photo ${index === 0 ? "instagram-photo-featured" : ""}`} aria-label={`Lihat foto: ${photo.alt}`}>
            <SafeImage src={photo.src} alt={photo.alt} sizes={index === 0 ? "(max-width: 640px) 60vw, (max-width: 1024px) 60vw, 420px" : "(max-width: 640px) 30vw, 200px"} className="absolute inset-0 h-full w-full" imgClassName="object-cover" />
            <span className="photo-expand" aria-hidden="true"><Expand size={15} /></span>
          </button>)}
        </div>
        <div className="instagram-gallery-footer"><span>Pilihan foto dari Instagram saya.</span><a href={profile.url} target="_blank" rel="noreferrer">Lihat postingan<ArrowUpRight size={14} /></a></div>
      </> : <a href={profile.url} target="_blank" rel="noreferrer" className="instagram-no-gallery"><Instagram size={32} /><span>Buka Instagram<ArrowUpRight size={16} /></span></a>}
    </div>
    <MediaPreview items={preview >= 0 ? photos.map((photo) => ({ src: photo.src, title: photo.alt })) : []} initialIndex={Math.max(preview, 0)} title="Galeri foto Instagram" onClose={() => setPreview(-1)} />
  </div>;
}
