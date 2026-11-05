"use client";

import { createContext, useContext, useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { uploadFile } from "@/frontend/lib/upload";
import { uploadType } from "@/frontend/lib/upload-policy.cjs";

export const UploadActivityContext = createContext(null);

export default function BulkUploadButton({ accept, onUploaded, label = "Upload banyak file" }) {
  const input = useRef(null);
  const running = useRef(false);
  const activity = useContext(UploadActivityContext);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [failures, setFailures] = useState([]);

  const upload = async (files) => {
    if (!files.length || running.current) return;
    running.current = true;
    setBusy(true);
    setFailures([]);
    activity?.(1);
    const urls = [];
    const failed = [];
    try {
      for (const [index, file] of files.entries()) {
        const prefix = `${index + 1}/${files.length}: ${file.name}`;
        setStatus(`${prefix}, menyiapkan upload…`);
        try {
          const type = uploadType(file);
          const allowed = accept.split(",").some((entry) => entry.trim() === type
            || (entry.trim().endsWith("/*") && type?.startsWith(entry.trim().slice(0, -1)))
            || (entry.trim().startsWith(".") && file.name.toLowerCase().endsWith(entry.trim().toLowerCase())));
          if (!allowed) throw new Error(accept.includes("pdf") ? "Pilih file dengan format yang didukung kolom ini." : "Pilih gambar JPG, PNG, WebP, GIF, HEIC, atau HEIF.");
          const url = await uploadFile(file, (progress, message) => {
            setStatus(`${prefix}, ${message || `${progress}%`}`);
          });
          urls.push(url);
        } catch (error) {
          failed.push({ file, message: error.message });
        }
      }
      if (urls.length) onUploaded(urls);
      setFailures(failed);
      setStatus(`${urls.length} file masuk ke form${failed.length ? `, ${failed.length} gagal` : ""}. ${urls.length ? "Klik Simpan untuk menampilkan perubahan." : "Periksa file atau koneksi, lalu coba lagi."}`);
    } finally {
      running.current = false;
      setBusy(false);
      activity?.(-1);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={input} type="file" multiple accept={accept} disabled={busy} className="hidden" aria-label={label}
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          void upload(files);
        }} />
      <button type="button" disabled={busy} onClick={() => input.current?.click()}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink transition hover:bg-emerald-soft disabled:cursor-wait disabled:opacity-60">
        {busy ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
        {busy ? "Mengunggah file…" : label}
      </button>
      <p className="break-words text-xs leading-5 text-muted" role="status">{status || "Pilih beberapa file sekaligus. File baru ditambahkan ke daftar yang sudah ada."}</p>
      {failures.length > 0 && <div className="space-y-2">
        <ul role="alert" className="space-y-1 text-xs leading-5 text-red-600">
          {failures.map(({ file, message }, index) => <li key={index} className="break-words">{file.name}: {message}</li>)}
        </ul>
        <button type="button" disabled={busy} onClick={() => void upload(failures.map(({ file }) => file))}
          className="min-h-11 rounded-xl border border-line px-3 text-xs font-semibold text-ink disabled:opacity-60">
          Coba lagi {failures.length} file gagal
        </button>
      </div>}
    </div>
  );
}
