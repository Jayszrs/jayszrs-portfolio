"use client";

import { useEffect, useState } from "react";
import {
  LogOut, Plus, Trash2, Save, Loader2, ImagePlus, Lock,
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
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <div className="flex items-center gap-3">
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
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
        <label className="cursor-pointer rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-emerald-soft">
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
          className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
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
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setSavedAt(new Date());
    } catch (err) {
      alert(err.message);
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
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <form onSubmit={handleLogin} className="glass-strong w-full max-w-sm rounded-2xl p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-soft">
            <Lock size={18} className="text-emerald-deep" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Admin jayszrs.</h1>
          <p className="mt-1 text-sm text-muted">Masuk untuk mengelola konten portofolio.</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="mt-6 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm"
            autoFocus
          />
          {loginError && <p className="mt-2 text-xs text-red-500">{loginError}</p>}

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-emerald py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
          >
            Masuk
          </button>
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
      <header className="glass sticky top-0 z-40 flex items-center justify-between px-6 py-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Admin Panel</p>
          <p className="text-xs text-muted">Kelola konten portofolio jayszrs.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-emerald-deep">Tersimpan {savedAt.toLocaleTimeString()}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-deep disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Simpan
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-white"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
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
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
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
