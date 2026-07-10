"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut, Plus, Trash2, Save, Loader2, ImagePlus, Lock,
  ExternalLink, LayoutDashboard, CheckCircle2,
} from "lucide-react";

// Template data default agar tidak ada field undefined yang bikin crash
const DEFAULT_CONTENT = {
  profile: { brandName: "", fullName: "", greeting: "", roleLabel: "", role: "", roles: [], handle: "", status: "", location: "", tagline: "", heroImage: "", socials: {} },
  about: { heading: "", paragraphs: [], skills: [] },
  education: [],
  capabilities: { editingSoftware: [], programming: [], operatingSystems: [] },
  experience: [],
  gallery: [],
  selectedDesigns: [],
  achievements: [],
  certificates: [],
  contact: { heading: "", email: "", phone: "", whatsapp: "", address: "", subheading: "", socials: {} }
};

const TABS = [
  "Profil", "Tentang", "Pendidikan", "Software", "Programming", "Sistem Operasi",
  "Pengalaman", "Galeri", "Selected Design", "Pencapaian", "Sertifikat", "Kontak",
];

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

function FileField({ label, value, onChange, accept = "application/pdf", buttonLabel = "Upload file" }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadFile(file)); } catch (error) { alert(error.message); } finally { setBusy(false); }
  };
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className="field min-w-0 flex-1" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL file" />
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-emerald-soft">
          {busy ? <Loader2 size={14} className="animate-spin" /> : buttonLabel}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} />
        </label>
      </div>
      {value && <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-emerald-deep">Buka file saat ini →</a>}
    </div>
  );
}

function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { const url = await uploadFile(file); onChange(url); } catch (err) { alert(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value ? <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-soft"><ImagePlus size={18} className="text-emerald-deep" /></div>}
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL gambar" className="field min-w-0 flex-1" />
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-emerald/30 hover:bg-emerald-soft">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

function TextField({ label, value = "", onChange, textarea, mono, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      {textarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className={`field resize-y ${mono ? "font-mono" : ""}`} placeholder={placeholder} />
      ) : (
        <input type="text" inputMode={type === "tel" ? "tel" : undefined} value={value || ""} onChange={(e) => onChange(e.target.value)} className={`field ${mono ? "font-mono" : ""}`} placeholder={placeholder} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CollectionEditor({ items = [], onChange, fields, createItem, addLabel }) {
  const updateItem = (index, key, value) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="glass space-y-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-muted">#{index + 1}</span>
              <p className="mt-1 font-display text-sm font-semibold text-ink">{item.name || item.title || "Item baru"}</p>
            </div>
            <button type="button" className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => onChange(items.filter((_, idx) => idx !== index))}><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const fieldValue = item[field.key] || "";
              const content = field.kind === "select" ? <SelectField label={field.label} value={fieldValue} options={field.options} onChange={(v) => updateItem(index, field.key, v)} /> : field.kind === "image" ? <ImageField label={field.label} value={fieldValue} onChange={(v) => updateItem(index, field.key, v)} /> : field.kind === "file" ? <FileField label={field.label} value={fieldValue} onChange={(v) => updateItem(index, field.key, v)} accept={field.accept} buttonLabel={field.buttonLabel} /> : <TextField label={field.label} value={fieldValue} textarea={field.kind === "textarea"} mono={field.mono} placeholder={field.placeholder} onChange={(v) => updateItem(index, field.key, v)} />;
              return <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>{content}</div>;
            })}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, createItem()])} className="inline-flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald-soft px-4 py-2.5 text-sm font-semibold text-emerald-deep transition hover:border-emerald/40"><Plus size={15} /> {addLabel}</button>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState(null);
  const [contentError, setContentError] = useState("");
  const [tab, setTab] = useState(TABS[0]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => setAuthed(d.authenticated)).catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) {
      fetch("/api/content")
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((data) => {
          // Gabungkan data dari DB dengan template agar tidak ada field undefined
          setContent({ ...DEFAULT_CONTENT, ...data });
        })
        .catch(() => setContentError("Gagal memuat konten"));
    }
  }, [authed]);

  const handleLogin = async (e) => { e.preventDefault(); const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); if (res.ok) setAuthed(true); else setLoginError("Password salah"); };
  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthed(false); setContent(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setSavedAt(new Date());
    } catch (err) { setSaveError(err.message); } finally { setSaving(false); }
  };

  if (!authed) return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4">
      <form onSubmit={handleLogin} className="glass-strong relative w-full max-w-md rounded-[2rem] p-7">
        <h1 className="font-display text-2xl font-semibold mb-5">Login Admin</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="field w-full mb-4" autoFocus />
        {loginError && <p className="text-red-500 text-xs mb-4">{loginError}</p>}
        <button type="submit" className="w-full bg-ink text-paper py-3 rounded-xl font-semibold">Masuk</button>
      </form>
    </div>
  );

  if (!content) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald" /></div>;

  return (
    <div className="min-h-screen bg-paper pb-24">
      <header className="glass sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="font-bold">Content Studio</p>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-emerald text-white px-4 py-2 rounded-xl text-sm font-semibold">{saving ? "Menyimpan..." : "Simpan"}</button>
            <button onClick={handleLogout} className="border p-2 rounded-xl"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6">
        {/* Stats Section dengan pengecekan array aman */}
        <div className="mb-7 grid grid-cols-3 gap-3">
          {[
            ["Proyek", (content.gallery || []).length],
            ["Pengalaman", (content.experience || []).length],
            ["Pencapaian", (content.achievements || []).length + (content.certificates || []).length],
          ].map(([label, value]) => (
            <div key={label} className="glass rounded-2xl p-4">
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
              <p className="mt-1 truncate text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Form Editor... (Gunakan pola (content.properti || []) untuk setiap akses array agar tidak error) */}
        {/* Sisa kode editor kamu tetap sama seperti yang asli... */}
      </div>
    </div>
  );
}