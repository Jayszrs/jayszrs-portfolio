"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut, Plus, Trash2, Save, Loader2, ImagePlus, Lock,
  ExternalLink, LayoutDashboard, CheckCircle2,
} from "lucide-react";

const TABS = ["Profil", "Tentang", "Pengalaman", "Galeri", "Pencapaian", "Sertifikat", "Kontak"];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload gagal");
  const data = await res.json();
  return data.url;
}

function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value ? (
          <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-soft">
            <ImagePlus size={18} className="text-emerald-deep" />
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL gambar (https://...)"
          className="field min-w-0 flex-1"
        />
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-emerald/30 hover:bg-emerald-soft">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, textarea, mono }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`field resize-y ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`field ${mono ? "font-mono" : ""}`}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [content, setContent] = useState(null);
  const [tab, setTab] = useState(TABS[0]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authenticated))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (authed) {
      fetch("/api/content").then((r) => r.json()).then(setContent);
    }
  }, [authed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setLoginError("Password salah. Coba lagi.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setContent(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-emerald" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald/15 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-[90px]" />
        <form onSubmit={handleLogin} className="glass-strong relative w-full max-w-md rounded-[2rem] p-7 sm:p-10">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-soft">
            <Lock size={18} className="text-emerald-deep" />
          </div>
          <p className="eyebrow mb-2">Content studio</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Selamat datang kembali.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">Masuk untuk memperbarui profil, proyek, dan pencapaian portofolio kamu.</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="field mt-7"
            autoFocus
          />
          {loginError && <p className="mt-2 text-xs text-red-500">{loginError}</p>}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-emerald"
          >
            Masuk
          </button>
          <Link href="/" className="mt-5 block text-center text-xs font-medium text-muted transition hover:text-emerald">
            ← Kembali ke portofolio
          </Link>
        </form>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
      <header className="glass sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-ink text-white sm:flex">
              <LayoutDashboard size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ink sm:text-lg">Content Studio</p>
              <p className="hidden text-xs text-muted sm:block">Kelola portofolio jayszrs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white/70 px-3 text-sm font-semibold text-ink transition hover:border-emerald/30"
            >
              <ExternalLink size={14} /> <span className="hidden sm:inline">Preview</span>
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-10 items-center gap-2 rounded-xl bg-emerald px-3.5 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60 sm:px-4"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Simpan
            </button>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink transition hover:bg-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {(savedAt || saveError) && (
          <div className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            saveError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald/20 bg-emerald-soft text-emerald-deep"
          }`}>
            {!saveError && <CheckCircle2 size={16} />}
            {saveError || `Perubahan tersimpan pukul ${savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`}
          </div>
        )}

        <div className="mb-7 grid grid-cols-3 gap-3">
          {[
            ["Proyek", content.gallery.length],
            ["Pengalaman", content.experience.length],
            ["Pencapaian", content.achievements.length + content.certificates.length],
          ].map(([label, value]) => (
            <div key={label} className="glass rounded-2xl p-4">
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
              <p className="mt-1 truncate text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t ? "bg-ink text-white" : "glass-pill text-ink/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Profil" && (
          <div className="glass grid grid-cols-1 gap-5 rounded-2xl p-6 sm:grid-cols-2">
            <TextField label="Nama brand (pojok kiri navbar)" value={content.profile.brandName} onChange={(v) => setContent({ ...content, profile: { ...content.profile, brandName: v } })} />
            <TextField label="Nama lengkap" value={content.profile.fullName} onChange={(v) => setContent({ ...content, profile: { ...content.profile, fullName: v } })} />
            <TextField label="Label sapaan" value={content.profile.greeting} onChange={(v) => setContent({ ...content, profile: { ...content.profile, greeting: v } })} />
            <TextField label="Role label ('Seorang')" value={content.profile.roleLabel} onChange={(v) => setContent({ ...content, profile: { ...content.profile, roleLabel: v } })} />
            <TextField label="Role / Jabatan" value={content.profile.role} onChange={(v) => setContent({ ...content, profile: { ...content.profile, role: v } })} />
            <TextField label="Handle (mis. @jayszrs)" value={content.profile.handle} onChange={(v) => setContent({ ...content, profile: { ...content.profile, handle: v } })} />
            <TextField label="Status" value={content.profile.status} onChange={(v) => setContent({ ...content, profile: { ...content.profile, status: v } })} />
            <TextField label="Lokasi" value={content.profile.location} onChange={(v) => setContent({ ...content, profile: { ...content.profile, location: v } })} />
            <div className="sm:col-span-2">
              <TextField label="Tagline" value={content.profile.tagline} onChange={(v) => setContent({ ...content, profile: { ...content.profile, tagline: v } })} textarea />
            </div>
            <div className="sm:col-span-2">
              <ImageField label="Foto Hero" value={content.profile.heroImage} onChange={(v) => setContent({ ...content, profile: { ...content.profile, heroImage: v } })} />
            </div>
            <TextField label="GitHub URL" value={content.profile.socials.github} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, github: v } } })} />
            <TextField label="LinkedIn URL" value={content.profile.socials.linkedin} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, linkedin: v } } })} />
            <TextField label="Instagram URL" value={content.profile.socials.instagram} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, instagram: v } } })} />
          </div>
        )}

        {tab === "Tentang" && (
          <div className="glass space-y-5 rounded-2xl p-6">
            <TextField label="Judul" value={content.about.heading} onChange={(v) => setContent({ ...content, about: { ...content.about, heading: v } })} />
            {content.about.paragraphs.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <TextField label={`Paragraf ${i + 1}`} value={p} textarea onChange={(v) => {
                    const next = [...content.about.paragraphs];
                    next[i] = v;
                    setContent({ ...content, about: { ...content.about, paragraphs: next } });
                  }} />
                </div>
                <button className="mt-6 text-red-400 hover:text-red-600" onClick={() => {
                  const next = content.about.paragraphs.filter((_, idx) => idx !== i);
                  setContent({ ...content, about: { ...content.about, paragraphs: next } });
                }}><Trash2 size={16} /></button>
              </div>
            ))}
            <button
              onClick={() => setContent({ ...content, about: { ...content.about, paragraphs: [...content.about.paragraphs, ""] } })}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
            ><Plus size={14} /> Tambah paragraf</button>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/70">Skill (pisahkan dengan koma)</label>
              <input
                type="text"
                value={content.about.skills.join(", ")}
                onChange={(e) => setContent({ ...content, about: { ...content.about, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                className="field"
              />
            </div>
          </div>
        )}

        {tab === "Pengalaman" && (
          <div className="space-y-4">
            {content.experience.map((item, i) => (
              <div key={item.id} className="glass space-y-3 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">#{i + 1}</span>
                  <button className="text-red-400 hover:text-red-600" onClick={() => {
                    setContent({ ...content, experience: content.experience.filter((_, idx) => idx !== i) });
                  }}><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="Tipe (Organisasi/Volunteer/Kerja)" value={item.type} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, type: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Periode" value={item.period} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, period: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Judul / Posisi" value={item.title} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, title: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Organisasi" value={item.org} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, org: v }; setContent({ ...content, experience: next });
                  }} />
                </div>
                <TextField label="Deskripsi" value={item.description} textarea onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, description: v }; setContent({ ...content, experience: next });
                }} />
              </div>
            ))}
            <button
              onClick={() => setContent({ ...content, experience: [...content.experience, { id: uid("exp"), type: "Organisasi", title: "", org: "", period: "", description: "" }] })}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
            ><Plus size={14} /> Tambah pengalaman</button>
          </div>
        )}

        {tab === "Galeri" && (
          <div className="space-y-4">
            {content.gallery.map((item, i) => (
              <div key={item.id} className="glass space-y-3 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">#{i + 1}</span>
                  <button className="text-red-400 hover:text-red-600" onClick={() => {
                    setContent({ ...content, gallery: content.gallery.filter((_, idx) => idx !== i) });
                  }}><Trash2 size={16} /></button>
                </div>
                <TextField label="Judul Proyek" value={item.title} onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, title: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Deskripsi" value={item.description} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, description: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Link proyek (opsional)" value={item.link} onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, link: v }; setContent({ ...content, gallery: next });
                }} />
                <ImageField label="Gambar" value={item.image} onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, image: v }; setContent({ ...content, gallery: next });
                }} />
              </div>
            ))}
            <button
              onClick={() => setContent({ ...content, gallery: [...content.gallery, { id: uid("proj"), title: "", description: "", image: "", link: "" }] })}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
            ><Plus size={14} /> Tambah proyek</button>
          </div>
        )}

        {(tab === "Pencapaian" || tab === "Sertifikat") && (() => {
          const key = tab === "Pencapaian" ? "achievements" : "certificates";
          const list = content[key];
          return (
            <div className="space-y-4">
              {list.map((item, i) => (
                <div key={item.id} className="glass space-y-3 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted">#{i + 1}</span>
                    <button className="text-red-400 hover:text-red-600" onClick={() => {
                      setContent({ ...content, [key]: list.filter((_, idx) => idx !== i) });
                    }}><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <TextField label="Judul" value={item.title} onChange={(v) => {
                      const next = [...list]; next[i] = { ...item, title: v }; setContent({ ...content, [key]: next });
                    }} />
                    <TextField label="Penerbit" value={item.issuer} onChange={(v) => {
                      const next = [...list]; next[i] = { ...item, issuer: v }; setContent({ ...content, [key]: next });
                    }} />
                    <TextField label="Tahun" value={item.year} onChange={(v) => {
                      const next = [...list]; next[i] = { ...item, year: v }; setContent({ ...content, [key]: next });
                    }} />
                  </div>
                  <ImageField label="Gambar (opsional)" value={item.image} onChange={(v) => {
                    const next = [...list]; next[i] = { ...item, image: v }; setContent({ ...content, [key]: next });
                  }} />
                </div>
              ))}
              <button
                onClick={() => setContent({ ...content, [key]: [...list, { id: uid(key), title: "", issuer: "", year: "", image: "" }] })}
                className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
              ><Plus size={14} /> Tambah {tab.toLowerCase()}</button>
            </div>
          );
        })()}

        {tab === "Kontak" && (
          <div className="glass space-y-4 rounded-2xl p-6">
            <TextField label="Judul" value={content.contact.heading} onChange={(v) => setContent({ ...content, contact: { ...content.contact, heading: v } })} />
            <TextField label="Subjudul" value={content.contact.subheading} textarea onChange={(v) => setContent({ ...content, contact: { ...content.contact, subheading: v } })} />
            <TextField label="Email" value={content.contact.email} onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} />
          </div>
        )}
      </div>
    </div>
  );
}
