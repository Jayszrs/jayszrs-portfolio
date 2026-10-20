"use client";

import { useEffect, useState } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, BookOpen, Building2, Github, MapPin, RefreshCw } from "lucide-react";
import SafeImage from "./SafeImage";
import snapshot from "@/frontend/lib/github-profile-snapshot.json";

export default function GitHubProfile({ profile }) {
  const fallback = profile.handle.toLowerCase() === snapshot.username.toLowerCase() ? snapshot : { username: profile.handle };
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);
    let active = true;
    setStatus("loading");
    fetch("/api/social", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const { github } = await response.json();
      if (github?.username?.toLowerCase() !== profile.handle.toLowerCase()) throw new Error("Profile mismatch");
      if (active) { setData({ ...fallback, ...Object.fromEntries(Object.entries(github).filter(([, value]) => value !== null && value !== undefined)) }); setStatus("ready"); }
    }).catch(() => { if (active) setStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  // The verified snapshot belongs only to this account.
  }, [attempt, profile.handle]);

  const markdown = data.readme?.markdown || data.readme?.blocks?.map((block) => block.body).join("\n\n") || "";
  return (
    <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
      <aside className="min-w-0 lg:sticky lg:top-28">
        <SafeImage src={data.avatar} alt={`Avatar GitHub ${profile.handle}`} unoptimized className="h-28 w-28 rounded-full border border-line sm:h-36 sm:w-36 lg:h-48 lg:w-48" imgClassName="object-cover" fallback={<Github className="h-full w-full p-8 text-muted" />} sizes="192px" />
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{data.name || profile.handle}</h3>
        <p className="mt-1 text-base text-muted">{profile.handle}</p>
        {data.bio && <p className="mt-4 text-sm leading-7 text-ink/85">{data.bio}</p>}
        <div className="mt-5 space-y-3 text-xs leading-6 text-muted">
          {data.company && <p className="flex gap-2"><Building2 size={15} className="mt-1 shrink-0" />{data.company}</p>}
          {data.location && <p className="flex gap-2"><MapPin size={15} className="mt-1 shrink-0" />{data.location}</p>}
        </div>
        <a href={profile.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-emerald-deep">Buka profil GitHub<ArrowUpRight size={15} /></a>
      </aside>
      <div className="min-w-0 rounded-2xl border border-line bg-surface/60">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
          <span className="flex min-w-0 items-center gap-2 text-xs text-muted"><BookOpen size={15} /><span className="truncate">{profile.handle} / <strong className="font-semibold text-ink">README.md</strong></span></span>
          <a href={data.readme?.sourceUrl || `${profile.url}/${profile.handle}#readme`} target="_blank" rel="noreferrer" aria-label="Buka README asli di GitHub" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink"><ArrowUpRight size={17} /></a>
        </div>
        <div className="readme-content p-5 sm:p-7">
          {markdown ? <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={(value, key) => {
            const safe = defaultUrlTransform(value);
            if (!safe || /^(?:https?:|mailto:)/i.test(safe)) return safe;
            if (safe.startsWith('#')) return `${data.readme?.sourceUrl || profile.url}${safe}`;
            return new URL(safe, key === 'src' ? `https://raw.githubusercontent.com/${profile.handle}/${profile.handle}/HEAD/` : `${profile.url}/${profile.handle}/blob/HEAD/`).href;
          }} components={{
            h1: ({ children }) => <h3>{children}</h3>, h2: ({ children }) => <h4>{children}</h4>, h3: ({ children }) => <h5>{children}</h5>,
            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
            img: ({ node, src, alt, ...props }) => src ? <img {...props} src={src} alt={alt || "Gambar dari README GitHub"} loading="lazy" decoding="async" /> : null,
          }}>{markdown}</ReactMarkdown> : <p>README belum bisa dimuat. Buka profil GitHub untuk melihat versi lengkap.</p>}
        </div>
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs leading-6 text-muted sm:px-7">
          <span>{status === "loading" ? "Memperbarui profil dan README…" : status === "ready" ? "README diperbarui dari GitHub." : "Menampilkan arsip README terakhir."}</span>
          {status === "error" && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink"><RefreshCw size={14} />Coba lagi</button>}
        </div>
      </div>
    </div>
  );
}
