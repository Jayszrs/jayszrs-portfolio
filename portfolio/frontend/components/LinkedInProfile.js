import { ArrowUpRight, Linkedin, MapPin } from "lucide-react";
import SafeImage from "./SafeImage";

export default function LinkedInProfile({ profile, identity = {} }) {
  return <div className="linkedin-layout">
    <aside className="linkedin-identity">
      <Linkedin size={23} aria-hidden="true" />
      {identity.photo && <SafeImage src={identity.photo} alt={`Foto ${identity.name || profile.handle}`} sizes="112px" className="mt-7 h-28 w-28 rounded-2xl border border-line" imgClassName="object-cover object-top" />}
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">{identity.name || profile.handle}</h3>
      {identity.role && <p className="mt-3 text-sm leading-7 text-muted">{identity.role}</p>}
      {identity.location && <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-muted"><MapPin size={14} className="mt-1 shrink-0" />{identity.location}</p>}
      <a href={profile.url} target="_blank" rel="noreferrer" className="action-button mt-6">Buka profil LinkedIn<ArrowUpRight size={15} /></a>
    </aside>
    <div className="min-w-0">
      <div className="linkedin-feed-heading"><h3>Catatan & perspektif.</h3></div>
      <div className="linkedin-activity">
        <p className="max-w-md text-sm leading-7 text-muted">Profil dan aktivitas profesional saya di LinkedIn.</p>
        <a href={`${profile.url}/recent-activity/all/`} target="_blank" rel="noreferrer" className="action-button mt-6">Lihat aktivitas LinkedIn<ArrowUpRight size={15} /></a>
      </div>
    </div>
  </div>;
}
