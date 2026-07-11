"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut, Plus, Trash2, Save, Loader2, ImagePlus, Lock,
  ExternalLink, LayoutDashboard, CheckCircle2, AlertCircle, UploadCloud, XCircle, Download,
} from "lucide-react";
import { DEFAULT_CONTENT, mergeContent } from "@/backend/lib/content-defaults";
import { documentationImages, withDocumentationImages } from "@/frontend/lib/documentation";
import { profileHeroImages, withProfileHeroImages } from "@/frontend/lib/profileImages";

const TABS = [
  "Profil", "Teks Section", "Tentang", "Pendidikan", "Software", "Programming", "Sistem Operasi",
  "Pengalaman", "Galeri", "Selected Design", "Rating", "Pencapaian", "Sertifikat", "Kontak",
];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload gagal");
  if (!data.url) throw new Error("Upload berhasil, tapi URL file tidak diterima");
  return data.url;
}

function FileField({ label, value, onChange, accept = "application/pdf", buttonLabel = "Upload file" }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const acceptsImages = accept.includes("image");
  const acceptsPdf = accept.includes("pdf");

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      onChange(await uploadFile(file));
      setStatus("File masuk ke form. Klik Simpan supaya tampil di halaman utama.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-line bg-paper/45 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-xs font-semibold text-ink/70">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setStatus("File dihapus dari form. Klik Simpan untuk menyimpan perubahan.");
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
          >
            <XCircle size={13} /> Hapus
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 lg:flex-row">
        <input
          className="field min-w-0 flex-1"
          value={value || ""}
          onChange={(event) => {
            onChange(event.target.value);
            setStatus("");
          }}
          placeholder="URL file atau upload"
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-emerald-soft">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {busy ? "Uploading" : buttonLabel}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {value && (
          <>
            <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink transition hover:border-emerald/30 hover:text-emerald-deep">
              Preview <ExternalLink size={13} />
            </a>
            <a href={value} download className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-paper transition hover:bg-emerald hover:text-white">
              Download <Download size={13} />
            </a>
          </>
        )}
        <p className={`text-xs ${status.includes("gagal") || status.includes("tidak") ? "text-red-500" : "text-muted"}`}>
          {status || `Upload ${acceptsImages && acceptsPdf ? "gambar/PDF" : acceptsImages ? "gambar" : "PDF"} maksimal 10 MB, lalu klik Simpan.`}
        </p>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange, showRemove = true, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [previewBroken, setPreviewBroken] = useState(false);

  useEffect(() => {
    setPreviewBroken(false);
  }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      const url = await uploadFile(file);
      onChange(url);
      setStatus("Upload masuk ke form. Klik Simpan supaya tampil di halaman utama.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className={`min-w-0 rounded-xl border border-line ${compact ? "bg-surface p-2" : "bg-paper/45 p-3"}`}>
      {(label || (showRemove && value)) && (
        <div className="mb-2 flex items-center justify-between gap-3">
          {label && <label className="block text-xs font-semibold text-ink/70">{label}</label>}
          {showRemove && value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setStatus("Gambar dihapus dari form. Klik Simpan untuk menyimpan perubahan.");
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
            >
              <XCircle size={13} /> Hapus
            </button>
          )}
        </div>
      )}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-[72px_1fr]" : "sm:grid-cols-[88px_1fr]"} sm:items-center`}>
        <div className={`flex ${compact ? "h-[72px] min-h-[72px] sm:w-[72px]" : "h-[88px] min-h-[88px] sm:w-[88px]"} w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-surface`}>
          {value && !previewBroken ? (
            <img src={value} alt="" className="h-full w-full object-contain p-2" onError={() => setPreviewBroken(true)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-emerald-soft">
              <ImagePlus size={compact ? 18 : 20} className="text-emerald-deep" />
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-col gap-2 lg:flex-row">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => {
                onChange(e.target.value);
                setStatus("");
              }}
              placeholder="URL gambar, atau upload dari perangkat"
              className="field min-w-0 flex-1"
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-emerald/30 hover:bg-emerald-soft">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {busy ? "Uploading" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <p className={`text-xs ${status.includes("gagal") || status.includes("tidak") ? "text-red-500" : "text-muted"}`}>
            {status || (value ? "Preview siap. Klik Simpan setelah mengubah gambar." : "JPG, PNG, WebP, atau GIF. Maksimal 10 MB.")}
          </p>
          {previewBroken && value && <p className="text-xs text-red-500">Preview gagal dimuat. Cek kembali URL gambarnya.</p>}
        </div>
      </div>
    </div>
  );
}

function MultiImageField({
  label,
  values = [],
  onChange,
  addLabel = "Tambah gambar",
  description = "Tambah gambar sebanyak yang dibutuhkan, lalu klik Simpan.",
  itemLabel = "Gambar",
}) {
  const [rows, setRows] = useState(() => documentationImages({ documentationImages: values }));

  useEffect(() => {
    setRows(documentationImages({ documentationImages: values }));
  }, [values]);

  const updateImage = (index, value) => {
    const next = [...rows];
    next[index] = value;
    setRows(next);
    onChange(next);
  };

  const removeImage = (index) => {
    const next = rows.filter((_, imageIndex) => imageIndex !== index);
    setRows(next);
    onChange(next);
  };

  const filledCount = documentationImages({ documentationImages: rows }).length;

  return (
    <div className="space-y-3 rounded-xl border border-line bg-paper/45 p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="block text-xs font-semibold text-ink/70">{label}</label>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <span className="w-fit rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{filledCount} gambar</span>
      </div>

      {rows.length > 0 && (
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((src, imageIndex) => (
            <div key={`${src}-${imageIndex}`} className="grid gap-3 p-3 lg:grid-cols-[112px_1fr_auto] lg:items-center">
              <div>
                <p className="font-mono text-xs font-semibold text-muted">#{imageIndex + 1}</p>
                <p className="mt-1 text-xs font-semibold text-ink">{itemLabel}</p>
              </div>
              <ImageField
                label=""
                value={src}
                onChange={(value) => updateImage(imageIndex, value)}
                showRemove={false}
                compact
              />
              <button
                type="button"
                onClick={() => removeImage(imageIndex)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-100 px-3 text-xs font-semibold text-red-500 transition hover:bg-red-50 lg:w-10 lg:px-0"
                title={`Hapus ${itemLabel.toLowerCase()} ${imageIndex + 1}`}
                aria-label={`Hapus ${itemLabel.toLowerCase()} ${imageIndex + 1}`}
              >
                <Trash2 size={14} />
                <span className="lg:hidden">Hapus</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setRows([...rows, ""])}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald-soft px-4 py-2.5 text-xs font-semibold text-emerald-deep transition hover:border-emerald/40"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

function TextField({ label, value = "", onChange, textarea, mono, type = "text", placeholder = "", rows = 3 }) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>}
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`field resize-y ${mono ? "font-mono" : ""}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          inputMode={type === "tel" ? "tel" : undefined}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`field ${mono ? "font-mono" : ""}`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)} className="field">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
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

  const updateDocumentationImages = (index, value) => {
    const next = [...items];
    next[index] = withDocumentationImages(next[index], value);
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
            <button type="button" aria-label="Hapus item" className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const fieldValue = field.kind === "images" ? documentationImages(item) : item[field.key] || "";
              const content = field.kind === "select" ? (
                <SelectField label={field.label} value={fieldValue} options={field.options} onChange={(value) => updateItem(index, field.key, value)} />
              ) : field.kind === "image" ? (
                <ImageField label={field.label} value={fieldValue} onChange={(value) => updateItem(index, field.key, value)} />
              ) : field.kind === "images" ? (
                <MultiImageField label={field.label} values={fieldValue} onChange={(value) => updateDocumentationImages(index, value)} addLabel={field.addLabel} />
              ) : field.kind === "file" ? (
                <FileField label={field.label} value={fieldValue} onChange={(value) => updateItem(index, field.key, value)} accept={field.accept} buttonLabel={field.buttonLabel} />
              ) : (
                <TextField label={field.label} value={fieldValue} textarea={field.kind === "textarea"} mono={field.mono} placeholder={field.placeholder} onChange={(value) => updateItem(index, field.key, value)} />
              );
              return <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>{content}</div>;
            })}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, createItem()])} className="inline-flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald-soft px-4 py-2.5 text-sm font-semibold text-emerald-deep transition hover:border-emerald/40">
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

function setNestedValue(source, path, value) {
  const [key, ...rest] = path;
  if (!key) return value;

  return {
    ...(source || {}),
    [key]: rest.length ? setNestedValue(source?.[key], rest, value) : value,
  };
}

function SectionTextsEditor({ content, setContent }) {
  const update = (path, value) => setContent(setNestedValue(content, path, value));
  const updateList = (path, value) => update(path, value.split(",").map((item) => item.trim()).filter(Boolean));

  const renderFields = (title, fields) => (
    <div className="glass space-y-4 rounded-2xl p-5">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className={field.wide ? "sm:col-span-2" : ""}>
            {field.kind === "select" ? (
              <SelectField
                label={field.label}
                value={field.value}
                options={field.options}
                onChange={(value) => update(field.path, value)}
              />
            ) : (
              <TextField
                label={field.label}
                value={field.value}
                textarea={field.textarea}
                placeholder={field.placeholder}
                onChange={(value) => field.list ? updateList(field.path, value) : update(field.path, value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const sections = content.sections || DEFAULT_CONTENT.sections;
  const pageHeroes = content.pageHeroes || DEFAULT_CONTENT.pageHeroes;

  return (
    <div className="space-y-5">
      {renderFields("Beranda", [
        { label: "Strip teks tambahan (pisahkan koma)", value: (sections.signalStrip?.extras || []).join(", "), path: ["sections", "signalStrip", "extras"], list: true, wide: true },
        { label: "Eyebrow Tentang", value: sections.about?.eyebrow, path: ["sections", "about", "eyebrow"] },
        { label: "Label kartu skill", value: sections.about?.skillsEyebrow, path: ["sections", "about", "skillsEyebrow"] },
        { label: "Eyebrow Proyek", value: sections.gallery?.eyebrow, path: ["sections", "gallery", "eyebrow"] },
        { label: "Judul Proyek", value: sections.gallery?.title, path: ["sections", "gallery", "title"] },
        { label: "Eyebrow Selected Design", value: sections.selectedDesigns?.eyebrow, path: ["sections", "selectedDesigns", "eyebrow"] },
        { label: "Judul Selected Design", value: sections.selectedDesigns?.title, path: ["sections", "selectedDesigns", "title"] },
        { label: "Deskripsi Selected Design", value: sections.selectedDesigns?.description, path: ["sections", "selectedDesigns", "description"], textarea: true, wide: true },
        { label: "Eyebrow Rating", value: sections.ratings?.eyebrow, path: ["sections", "ratings", "eyebrow"] },
        { label: "Judul Rating", value: sections.ratings?.title, path: ["sections", "ratings", "title"] },
        { label: "Deskripsi Rating", value: sections.ratings?.description, path: ["sections", "ratings", "description"], textarea: true, wide: true },
      ])}

      {renderFields("Pendidikan & Keahlian", [
        { label: "Eyebrow Pendidikan", value: sections.education?.eyebrow, path: ["sections", "education", "eyebrow"] },
        { label: "Judul Pendidikan", value: sections.education?.title, path: ["sections", "education", "title"] },
        { label: "Eyebrow modal pendidikan", value: sections.education?.detailEyebrow, path: ["sections", "education", "detailEyebrow"] },
        { label: "Eyebrow Keahlian", value: sections.capabilities?.eyebrow, path: ["sections", "capabilities", "eyebrow"] },
        { label: "Judul Keahlian", value: sections.capabilities?.title, path: ["sections", "capabilities", "title"] },
        { label: "Deskripsi Keahlian", value: sections.capabilities?.description, path: ["sections", "capabilities", "description"], textarea: true, wide: true },
        { label: "Judul Software", value: sections.capabilities?.groups?.editingSoftware?.title, path: ["sections", "capabilities", "groups", "editingSoftware", "title"] },
        { label: "Deskripsi Software", value: sections.capabilities?.groups?.editingSoftware?.description, path: ["sections", "capabilities", "groups", "editingSoftware", "description"], textarea: true },
        { label: "Judul Programming", value: sections.capabilities?.groups?.programming?.title, path: ["sections", "capabilities", "groups", "programming", "title"] },
        { label: "Deskripsi Programming", value: sections.capabilities?.groups?.programming?.description, path: ["sections", "capabilities", "groups", "programming", "description"], textarea: true },
        { label: "Judul OS", value: sections.capabilities?.groups?.operatingSystems?.title, path: ["sections", "capabilities", "groups", "operatingSystems", "title"] },
        { label: "Deskripsi OS", value: sections.capabilities?.groups?.operatingSystems?.description, path: ["sections", "capabilities", "groups", "operatingSystems", "description"], textarea: true },
      ])}

      {renderFields("Pengalaman, Pencapaian, Kontak", [
        { label: "Eyebrow Pengalaman", value: sections.experience?.eyebrow, path: ["sections", "experience", "eyebrow"] },
        { label: "Judul Pengalaman", value: sections.experience?.title, path: ["sections", "experience", "title"] },
        { label: "Deskripsi Pengalaman", value: sections.experience?.description, path: ["sections", "experience", "description"], textarea: true, wide: true },
        { label: "Eyebrow Pencapaian", value: sections.achievements?.eyebrow, path: ["sections", "achievements", "eyebrow"] },
        { label: "Judul Pencapaian", value: sections.achievements?.title, path: ["sections", "achievements", "title"] },
        { label: "Label list pencapaian", value: sections.achievements?.achievementsLabel, path: ["sections", "achievements", "achievementsLabel"] },
        { label: "Label list sertifikat", value: sections.achievements?.certificatesLabel, path: ["sections", "achievements", "certificatesLabel"] },
        { label: "Eyebrow Kontak", value: sections.contact?.eyebrow, path: ["sections", "contact", "eyebrow"] },
        { label: "Judul detail kontak", value: sections.contact?.detailsTitle, path: ["sections", "contact", "detailsTitle"] },
        { label: "Teks tombol email", value: sections.contact?.emailButton, path: ["sections", "contact", "emailButton"] },
        { label: "Teks tombol WhatsApp", value: sections.contact?.whatsappButton, path: ["sections", "contact", "whatsappButton"] },
      ])}

      {Object.entries(pageHeroes).map(([key, hero]) => renderFields(`Hero halaman ${key}`, [
        { label: "Eyebrow", value: hero.eyebrow, path: ["pageHeroes", key, "eyebrow"] },
        { label: "Accent", value: hero.accent, path: ["pageHeroes", key, "accent"], kind: "select", options: ["emerald", "gold", "ink"] },
        { label: "Judul", value: hero.title, path: ["pageHeroes", key, "title"], wide: true },
        { label: "Deskripsi", value: hero.description, path: ["pageHeroes", key, "description"], textarea: true, wide: true },
      ]))}
    </div>
  );
}

export default function AdminPageClient() {
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
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);

    fetch("/api/auth/session", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setAuthed(d.authenticated))
      .catch(() => setAuthed(false))
      .finally(() => window.clearTimeout(timer));

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (authed) {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 10000);
      setContentError("");

      fetch("/api/content", { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw new Error("Konten tidak dapat dimuat");
          return r.json();
        })
        .then((data) => setContent(mergeContent(data)))
        .catch(() => setContentError("Konten admin gagal dimuat. Coba muat ulang halaman."))
        .finally(() => window.clearTimeout(timer));

      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }
    return undefined;
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan");
      }
      if (data.content) {
        setContent(mergeContent(data.content));
      }
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!authed) {
    return (
      <div className="admin-login-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10">
        <form onSubmit={handleLogin} className="admin-login-card relative w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-glass-lg sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-paper">
              <Lock size={18} />
            </div>
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-2 text-xs font-semibold text-muted transition hover:text-ink">
              Portfolio <ExternalLink size={13} />
            </Link>
          </div>
          <p className="eyebrow mb-2">Content studio</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Masuk admin.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">Kelola konten portfolio, upload gambar, dan update resume dari satu panel.</p>

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
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-paper transition hover:bg-emerald hover:text-white"
          >
            Masuk <ExternalLink size={14} />
          </button>
        </form>
      </div>
    );
  }

  if (!content) {
    if (contentError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-4">
          <div className="glass-strong w-full max-w-md rounded-2xl p-7 text-center">
            <p className="font-display text-xl font-semibold text-ink">Admin gagal dimuat</p>
            <p className="mt-2 text-sm text-muted">{contentError}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
              Muat ulang
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-emerald" />
      </div>
    );
  }

  const stats = [
    ["Proyek", (content.gallery || []).length],
    ["Pengalaman", (content.experience || []).length],
    ["Pencapaian", (content.achievements || []).length + (content.certificates || []).length],
  ];
  const tabDescriptions = {
    Profil: "Identitas utama, hero, foto profil, CV, dan tautan sosial.",
    "Teks Section": "Copywriting judul, deskripsi section, dan hero tiap halaman.",
    Tentang: "Narasi tentang diri, paragraf profil, dan daftar skill ringkas.",
    Pendidikan: "Riwayat pendidikan, logo kampus/sekolah, fokus, dan aktivitas.",
    Software: "Tools editing atau software yang ditampilkan di halaman kemampuan.",
    Programming: "Bahasa dan framework pemrograman yang ditampilkan di halaman kemampuan.",
    "Sistem Operasi": "Daftar OS dan skill environment yang kamu kuasai.",
    Pengalaman: "Posisi, organisasi, periode, logo/dokumentasi, dan detail kontribusi.",
    Galeri: "Proyek lengkap, gambar preview, dokumentasi, proses, dan hasil.",
    "Selected Design": "Kurasi desain pilihan yang muncul sebagai highlight visual.",
    Rating: "Nama, asal, bintang, masukan, dan status tampil di homepage.",
    Pencapaian: "Achievement non-sertifikat beserta logo atau bukti pendukung.",
    Sertifikat: "Sertifikat, penerbit, credential, PDF, logo, dan badge.",
    Kontak: "Email, WhatsApp, alamat, dan link sosial media.",
  };
  const saveStatus = saveError
    ? saveError
    : savedAt
      ? `Tersimpan ${savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      : "Perubahan belum disimpan";
  const saveStatusClass = saveError
    ? "border-red-200 bg-red-50 text-red-700"
    : savedAt
      ? "border-emerald/20 bg-emerald-soft text-emerald-deep"
      : "border-line bg-surface text-muted";

  return (
    <div className="min-h-screen bg-paper pb-36">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
              <LayoutDashboard size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ink sm:text-lg">Content Studio</p>
              <p className="text-xs text-muted">Kelola portofolio jayszrs.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {(savedAt || saveError) && (
              <div className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${saveStatusClass}`}>
                {saveError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span className="max-w-[14rem] truncate sm:max-w-none">
                  {saveStatus}
                </span>
              </div>
            )}
            <Link
              href="/"
              target="_blank"
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface/70 px-3 text-sm font-semibold text-ink transition hover:border-emerald/30"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink transition hover:bg-surface"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-line bg-surface/80 p-4 shadow-glass">
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
              <p className="mt-1 truncate text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-2xl border border-line bg-surface/80 p-3 shadow-glass">
          <div className="mb-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-xl font-semibold text-ink">{tab}</p>
              <p className="text-sm text-muted">{tabDescriptions[tab]}</p>
            </div>
            <p className="text-xs font-semibold text-emerald-deep">Upload gambar lalu klik Simpan.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === t ? "bg-ink text-paper shadow-glass" : "bg-paper text-ink/70 hover:bg-emerald-soft hover:text-emerald-deep"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "Profil" && (
          <div className="glass grid grid-cols-1 gap-5 rounded-2xl p-6 sm:grid-cols-2">
            <TextField label="Nama brand (pojok kiri navbar)" value={content.profile?.brandName} onChange={(v) => setContent({ ...content, profile: { ...content.profile, brandName: v } })} />
            <TextField label="Nama lengkap" value={content.profile?.fullName} onChange={(v) => setContent({ ...content, profile: { ...content.profile, fullName: v } })} />
            <TextField label="Label sapaan" value={content.profile?.greeting} onChange={(v) => setContent({ ...content, profile: { ...content.profile, greeting: v } })} />
            <TextField label="Role label ('Seorang')" value={content.profile?.roleLabel} onChange={(v) => setContent({ ...content, profile: { ...content.profile, roleLabel: v } })} />
            <TextField label="Role / Jabatan" value={content.profile?.role} onChange={(v) => setContent({ ...content, profile: { ...content.profile, role: v } })} />
            <div className="sm:col-span-2">
              <TextField
                label="Teks intro bergantian (pisahkan dengan koma)"
                value={(content.profile?.roles || []).join(", ")}
                placeholder="Web Developer, AI Engineer, Video Editor"
                onChange={(v) => setContent({
                  ...content,
                  profile: {
                    ...content.profile,
                    roles: v.split(",").map((role) => role.trim()).filter(Boolean),
                  },
                })}
              />
            </div>
            <TextField label="Handle (mis. @jayszrs)" value={content.profile?.handle} onChange={(v) => setContent({ ...content, profile: { ...content.profile, handle: v } })} />
            <TextField label="Status" value={content.profile?.status} onChange={(v) => setContent({ ...content, profile: { ...content.profile, status: v } })} />
            <TextField label="Lokasi" value={content.profile?.location} onChange={(v) => setContent({ ...content, profile: { ...content.profile, location: v } })} />
            <div className="sm:col-span-2">
              <TextField label="Tagline" value={content.profile?.tagline} onChange={(v) => setContent({ ...content, profile: { ...content.profile, tagline: v } })} textarea />
            </div>
            <div className="sm:col-span-2">
              <MultiImageField
                label="Foto Hero / carousel"
                values={profileHeroImages(content.profile)}
                addLabel="Tambah foto hero"
                itemLabel="Foto hero"
                description="Foto pertama jadi cover utama. Tambah sebanyak yang kamu mau untuk carousel."
                onChange={(v) => setContent({
                  ...content,
                  profile: withProfileHeroImages(content.profile, v),
                })}
              />
            </div>
            <div className="sm:col-span-2">
              <FileField label="Resume / CV PDF" value={content.profile?.cvUrl} accept="application/pdf" buttonLabel="Upload resume" onChange={(v) => setContent({ ...content, profile: { ...content.profile, cvUrl: v } })} />
            </div>
            <TextField label="GitHub URL" value={content.profile?.socials?.github} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, github: v } } })} />
            <TextField label="LinkedIn URL" value={content.profile?.socials?.linkedin} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, linkedin: v } } })} />
            <TextField label="Instagram URL" value={content.profile?.socials?.instagram} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...content.profile.socials, instagram: v } } })} />
            <TextField label="TikTok URL" value={content.profile?.socials?.tiktok} onChange={(v) => setContent({ ...content, profile: { ...content.profile, socials: { ...(content.profile.socials || {}), tiktok: v } } })} />
          </div>
        )}

        {tab === "Teks Section" && (
          <SectionTextsEditor content={content} setContent={setContent} />
        )}

        {tab === "Tentang" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface/85 p-5 shadow-glass">
              <TextField label="Judul section Tentang" value={content.about?.heading} onChange={(v) => setContent({ ...content, about: { ...content.about, heading: v } })} />
            </div>

            <div className="rounded-2xl border border-line bg-surface/85 p-5 shadow-glass">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">Paragraf Tentang</p>
                  <p className="text-sm text-muted">Tulis narasi panjang di area yang lebar, tidak kepotong kecil lagi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContent({ ...content, about: { ...content.about, paragraphs: [...(content.about?.paragraphs || []), ""] } })}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald-soft px-4 py-2 text-sm font-semibold text-emerald-deep transition hover:border-emerald/40"
                >
                  <Plus size={14} /> Tambah paragraf
                </button>
              </div>
              <div className="space-y-4">
                {(content.about?.paragraphs || []).map((p, i) => (
                  <div key={i} className="rounded-xl border border-line bg-paper/45 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-ink/70">Paragraf {i + 1}</p>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50" onClick={() => {
                        const next = content.about.paragraphs.filter((_, idx) => idx !== i);
                        setContent({ ...content, about: { ...content.about, paragraphs: next } });
                      }}><Trash2 size={13} /> Hapus</button>
                    </div>
                    <TextField label="" value={p} textarea rows={8} onChange={(v) => {
                      const next = [...content.about.paragraphs];
                      next[i] = v;
                      setContent({ ...content, about: { ...content.about, paragraphs: next } });
                    }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface/85 p-5 shadow-glass">
              <label className="mb-1.5 block text-xs font-semibold text-ink/70">Skill (pisahkan dengan koma)</label>
              <input
                type="text"
                value={(content.about?.skills || []).join(", ")}
                onChange={(e) => setContent({ ...content, about: { ...content.about, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                className="field"
              />
            </div>
          </div>
        )}

        {tab === "Pendidikan" && (
          <CollectionEditor
            items={content.education || []}
            onChange={(items) => setContent({ ...content, education: items })}
            fields={[
              { key: "institution", label: "Nama sekolah / kampus" },
              { key: "degree", label: "Jurusan / gelar" },
              { key: "period", label: "Periode pendidikan" },
              { key: "location", label: "Lokasi" },
              { key: "grade", label: "Nilai / IPK" },
              { key: "gradeScale", label: "Skala / keterangan nilai" },
              { key: "description", label: "Ringkasan pendidikan", kind: "textarea", wide: true },
              { key: "focus", label: "Fokus pembelajaran", kind: "textarea", wide: true },
              { key: "activities", label: "Aktivitas & pencapaian", kind: "textarea", wide: true },
              { key: "logo", label: "Logo sekolah / kampus", kind: "image", wide: true },
              { key: "documentationImages", label: "Gambar dokumentasi pendidikan", kind: "images", addLabel: "Tambah dokumentasi pendidikan", wide: true },
              { key: "documentationFile", label: "File dokumentasi pendidikan", kind: "file", accept: "image/*,application/pdf", buttonLabel: "Upload dokumen", wide: true },
              { key: "link", label: "Link institusi (opsional)", wide: true },
            ]}
            createItem={() => ({
              id: uid("edu"), institution: "", degree: "", period: "", location: "", description: "", focus: "", activities: "",
              grade: "", gradeScale: "", logo: "", documentationImages: [], documentationImage: "", documentationImage2: "", documentationImage3: "", documentationFile: "", link: "",
            })}
            addLabel="Tambah pendidikan"
          />
        )}

        {[
          ["Software", "editingSoftware", "software"],
          ["Programming", "programming", "skill"],
          ["Sistem Operasi", "operatingSystems", "os"],
        ].map(([tabName, key, prefix]) => tab === tabName && (
          <CollectionEditor
            key={key}
            items={content.capabilities?.[key] || []}
            onChange={(items) => setContent({
              ...content,
              capabilities: { ...(content.capabilities || {}), [key]: items },
            })}
            fields={[
              { key: "name", label: "Nama" },
              { key: "since", label: "Mulai digunakan sejak" },
              { key: "level", label: "Level", kind: "select", options: ["Dasar", "Menengah", "Mahir"] },
              { key: "usage", label: "Dipakai untuk apa", kind: "textarea", wide: true },
            ]}
            createItem={() => ({ id: uid(prefix), name: "", since: "", level: "Menengah", usage: "" })}
            addLabel={`Tambah ${tabName.toLowerCase()}`}
          />
        ))}

        {tab === "Pengalaman" && (
          <div className="space-y-4">
            {(content.experience || []).map((item, i) => (
              <div key={item.id} className="glass space-y-4 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <ImagePlus size={17} className="text-emerald-deep" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-xs text-muted">#{i + 1} {item.type || "Pengalaman"}</span>
                      <p className="truncate font-display text-base font-semibold text-ink">{item.title || "Judul / posisi belum diisi"}</p>
                      <p className="truncate text-sm text-muted">{item.org || "Organisasi belum diisi"}</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Hapus pengalaman" onClick={() => {
                    setContent({ ...content, experience: content.experience.filter((_, idx) => idx !== i) });
                  }}><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SelectField label="Kategori" value={item.type} options={["Proyek", "Magang", "Kerja", "Volunteer", "Organisasi"]} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, type: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Periode" value={item.period} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, period: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Mulai" value={item.startDate} placeholder="Contoh: Januari 2024" onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, startDate: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Selesai" value={item.endDate} placeholder="Kosongkan jika masih berjalan" onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, endDate: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Judul / Posisi" value={item.title} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, title: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Organisasi" value={item.org} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, org: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Lokasi" value={item.location} placeholder="Bekasi, Indonesia" onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, location: v }; setContent({ ...content, experience: next });
                  }} />
                  <TextField label="Unit kerja / divisi" value={item.workingUnit} onChange={(v) => {
                    const next = [...content.experience]; next[i] = { ...item, workingUnit: v }; setContent({ ...content, experience: next });
                  }} />
                </div>
                <TextField label="Ringkasan singkat (tampil di kartu)" value={item.description} textarea onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, description: v }; setContent({ ...content, experience: next });
                }} />
                <TextField label="Latar belakang organisasi / proyek" value={item.companyBackground} textarea onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, companyBackground: v }; setContent({ ...content, experience: next });
                }} />
                <TextField label="Peran & kontribusi lengkap" value={item.responsibilities} textarea onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, responsibilities: v }; setContent({ ...content, experience: next });
                }} />
                <TextField label="Tools & skills (pisahkan dengan koma)" value={item.tools} placeholder="Next.js, Figma, Cisco" onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, tools: v }; setContent({ ...content, experience: next });
                }} />
                <ImageField label="Logo organisasi / gambar pengalaman" value={item.image} onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, image: v }; setContent({ ...content, experience: next });
                }} />
                <FileField label="Upload dokumentasi pengalaman" value={item.documentationFile || item.link} accept="image/*,application/pdf" buttonLabel="Upload dokumen" onChange={(v) => {
                  const next = [...content.experience]; next[i] = { ...item, documentationFile: v, link: "" }; setContent({ ...content, experience: next });
                }} />
                <MultiImageField label="Gambar dokumentasi pengalaman" values={documentationImages(item)} addLabel="Tambah dokumentasi pengalaman" onChange={(v) => {
                  const next = [...content.experience]; next[i] = withDocumentationImages(item, v); setContent({ ...content, experience: next });
                }} />
              </div>
            ))}
            <button
              onClick={() => setContent({
                ...content, experience: [...(content.experience || []), {
                  id: uid("exp"), type: "Proyek", title: "", org: "", period: "", startDate: "", endDate: "",
                  location: "", workingUnit: "", description: "", companyBackground: "", responsibilities: "",
                  tools: "", link: "", image: "", documentationFile: "", documentationImages: [], documentationImage: "", documentationImage2: "", documentationImage3: "",
                }]
              })}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
            ><Plus size={14} /> Tambah pengalaman</button>
          </div>
        )}

        {tab === "Galeri" && (
          <div className="space-y-4">
            {(content.gallery || []).map((item, i) => (
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TextField label="Peran kamu" value={item.role} onChange={(v) => {
                    const next = [...content.gallery]; next[i] = { ...item, role: v }; setContent({ ...content, gallery: next });
                  }} />
                  <TextField label="Periode" value={item.period} onChange={(v) => {
                    const next = [...content.gallery]; next[i] = { ...item, period: v }; setContent({ ...content, gallery: next });
                  }} />
                  <TextField label="Tech stack" value={item.techStack} onChange={(v) => {
                    const next = [...content.gallery]; next[i] = { ...item, techStack: v }; setContent({ ...content, gallery: next });
                  }} />
                </div>
                <TextField label="Latar belakang proyek" value={item.background} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, background: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Kontribusi kamu" value={item.contribution} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, contribution: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Problem / masalah yang diselesaikan" value={item.problem} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, problem: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Apa yang dibuat" value={item.whatBuilt} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, whatBuilt: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Goals / tujuan proyek" value={item.goals} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, goals: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Roles and responsibilities" value={item.responsibilities} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, responsibilities: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Process and execution" value={item.process} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, process: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Results / hasil" value={item.results} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, results: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Impact / dampak" value={item.impact} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, impact: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Catatan bukti dokumentasi" value={item.documentation} textarea onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, documentation: v }; setContent({ ...content, gallery: next });
                }} />
                <TextField label="Link proyek (opsional)" value={item.link} onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, link: v }; setContent({ ...content, gallery: next });
                }} />
                <ImageField label="Gambar" value={item.image} onChange={(v) => {
                  const next = [...content.gallery]; next[i] = { ...item, image: v }; setContent({ ...content, gallery: next });
                }} />
                <MultiImageField label="Gambar dokumentasi / bukti" values={documentationImages(item)} addLabel="Tambah bukti dokumentasi" onChange={(v) => {
                  const next = [...content.gallery]; next[i] = withDocumentationImages(item, v); setContent({ ...content, gallery: next });
                }} />
              </div>
            ))}
            <button
              onClick={() => setContent({
                ...content, gallery: [...(content.gallery || []), {
                  id: uid("proj"), title: "", description: "", role: "", period: "", techStack: "",
                  background: "", contribution: "", problem: "", whatBuilt: "", goals: "", responsibilities: "",
                  process: "", results: "", impact: "", documentation: "", image: "", documentationImages: [], documentationImage: "", documentationImage2: "", documentationImage3: "", link: "",
                }]
              })}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
            ><Plus size={14} /> Tambah proyek</button>
          </div>
        )}

        {tab === "Selected Design" && (
          <CollectionEditor
            items={content.selectedDesigns || []}
            onChange={(items) => setContent({ ...content, selectedDesigns: items })}
            fields={[
              { key: "title", label: "Judul desain" },
              { key: "category", label: "Kategori" },
              { key: "year", label: "Tahun" },
              { key: "link", label: "Link karya (opsional)" },
              { key: "description", label: "Deskripsi", kind: "textarea", wide: true },
              { key: "image", label: "Gambar preview", kind: "image", wide: true },
            ]}
            createItem={() => ({ id: uid("design"), title: "", category: "", year: "", description: "", image: "", link: "" })}
            addLabel="Tambah selected design"
          />
        )}

        {tab === "Rating" && (
          <CollectionEditor
            items={content.ratings || []}
            onChange={(items) => setContent({ ...content, ratings: items })}
            fields={[
              { key: "name", label: "Nama pemberi rating" },
              { key: "role", label: "Role / asal" },
              { key: "stars", label: "Jumlah bintang", kind: "select", options: ["5", "4", "3", "2", "1"] },
              { key: "approved", label: "Tampilkan di homepage?", kind: "select", options: ["true", "false"] },
              { key: "date", label: "Tanggal" },
              { key: "comment", label: "Masukan, kritik, dan saran", kind: "textarea", wide: true },
            ]}
            createItem={() => ({ id: uid("rating"), name: "", role: "", stars: "5", approved: "true", date: "", comment: "" })}
            addLabel="Tambah rating"
          />
        )}

        {(tab === "Pencapaian" || tab === "Sertifikat") && (() => {
          const key = tab === "Pencapaian" ? "achievements" : "certificates";
          const list = content[key] || [];
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
                  {key === "certificates" && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextField label="Tanggal diterbitkan" value={item.issuedAt} placeholder="Contoh: 12 Januari 2025" onChange={(v) => {
                          const next = [...list]; next[i] = { ...item, issuedAt: v }; setContent({ ...content, [key]: next });
                        }} />
                        <TextField label="Tanggal kedaluwarsa" value={item.expiresAt} placeholder="Kosongkan jika tidak expired" onChange={(v) => {
                          const next = [...list]; next[i] = { ...item, expiresAt: v }; setContent({ ...content, [key]: next });
                        }} />
                        <TextField label="Credential ID" value={item.credentialId} mono onChange={(v) => {
                          const next = [...list]; next[i] = { ...item, credentialId: v }; setContent({ ...content, [key]: next });
                        }} />
                        <TextField label="Link Credly / credential" value={item.credentialUrl} onChange={(v) => {
                          const next = [...list]; next[i] = { ...item, credentialUrl: v }; setContent({ ...content, [key]: next });
                        }} />
                      </div>
                      <TextField label="Deskripsi sertifikat" value={item.description} textarea onChange={(v) => {
                        const next = [...list]; next[i] = { ...item, description: v }; setContent({ ...content, [key]: next });
                      }} />
                      <FileField label="Dokumentasi PDF" value={item.pdfUrl} accept="application/pdf" buttonLabel="Upload PDF" onChange={(v) => {
                        const next = [...list]; next[i] = { ...item, pdfUrl: v }; setContent({ ...content, [key]: next });
                      }} />
                    </>
                  )}
                  {key === "achievements" && (
                    <TextField label="Deskripsi pencapaian" value={item.description} textarea onChange={(v) => {
                      const next = [...list]; next[i] = { ...item, description: v }; setContent({ ...content, [key]: next });
                    }} />
                  )}
                  <ImageField label="Logo penerbit / organisasi" value={item.logo} onChange={(v) => {
                    const next = [...list]; next[i] = { ...item, logo: v }; setContent({ ...content, [key]: next });
                  }} />
                  <ImageField label="Gambar badge / bukti (opsional)" value={item.image} onChange={(v) => {
                    const next = [...list]; next[i] = { ...item, image: v }; setContent({ ...content, [key]: next });
                  }} />
                </div>
              ))}
              <button
                onClick={() => setContent({
                  ...content,
                  [key]: [...list, key === "certificates"
                    ? { id: uid(key), title: "", issuer: "", year: "", logo: "", image: "", credentialId: "", issuedAt: "", expiresAt: "", credentialUrl: "", pdfUrl: "", description: "" }
                    : { id: uid(key), title: "", issuer: "", year: "", logo: "", image: "", description: "" }],
                })}
                className="flex items-center gap-1 text-sm font-semibold text-emerald-deep"
              ><Plus size={14} /> Tambah {tab.toLowerCase()}</button>
            </div>
          );
        })()}

        {tab === "Kontak" && (
          <div className="glass space-y-5 rounded-2xl p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Judul" value={content.contact?.heading} onChange={(v) => setContent({ ...content, contact: { ...content.contact, heading: v } })} />
              <TextField label="Email" value={content.contact?.email} onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} />
              <TextField label="Nomor telepon" value={content.contact?.phone} type="tel" placeholder="+62..." onChange={(v) => setContent({ ...content, contact: { ...content.contact, phone: v } })} />
              <TextField label="Nomor WhatsApp" value={content.contact?.whatsapp} type="tel" placeholder="628..." onChange={(v) => setContent({ ...content, contact: { ...content.contact, whatsapp: v } })} />
              <TextField label="Lokasi / alamat" value={content.contact?.address} onChange={(v) => setContent({ ...content, contact: { ...content.contact, address: v } })} />
            </div>
            <TextField label="Subjudul" value={content.contact?.subheading} textarea onChange={(v) => setContent({ ...content, contact: { ...content.contact, subheading: v } })} />
            <div className="border-t border-line pt-5">
              <p className="mb-4 text-sm font-semibold text-ink">Sosial media</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {["github", "linkedin", "instagram", "tiktok", "youtube"].map((social) => (
                  <TextField
                    key={social}
                    label={`${social[0].toUpperCase()}${social.slice(1)} URL`}
                    value={content.contact?.socials?.[social]}
                    onChange={(v) => setContent({
                      ...content,
                      contact: {
                        ...content.contact,
                        socials: { ...(content.contact.socials || {}), [social]: v },
                      },
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-3 py-3 shadow-[0_-18px_48px_rgba(13,25,21,0.10)] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${saveStatusClass}`}>
            {saveError ? <AlertCircle size={15} /> : savedAt ? <CheckCircle2 size={15} /> : <Save size={15} />}
            <span className="truncate">{saveStatus}</span>
          </div>
          <div className="grid grid-cols-[1fr_1.4fr] gap-2 sm:flex sm:items-center sm:justify-end">
            <Link
              href="/"
              target="_blank"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-emerald/30"
            >
              <ExternalLink size={15} /> Preview
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald px-5 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Menyimpan..." : "Simpan sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
