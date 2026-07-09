# Portofolio — Jaelani Surya Saputra (jayszrs)

Website portofolio dibangun dengan **Next.js 14 (App Router)**, **Tailwind CSS**, dan **Framer Motion**.
Tema: latar putih, gaya *liquid glass*, dengan animasi parallax saat scroll.

## Fitur

- Hero dengan kartu foto bergaya liquid glass (mirip referensi desain kamu, tapi tema terang)
- Animasi parallax pada background saat scroll (blob warna bergerak mengikuti posisi scroll)
- Section: Beranda, Tentang, Pengalaman & Volunteer (timeline), Proyek (galeri yang auto-slide), Pencapaian, Sertifikat, Kontak
- **Panel admin** di `/admin` untuk mengganti foto, teks, dan menambah/menghapus pengalaman, proyek, pencapaian, dan sertifikat — tanpa perlu edit kode
- Upload gambar langsung dari panel admin (tersimpan di `public/uploads`) atau isi lewat URL gambar

## Menjalankan di Lokal

```bash
npm install
cp .env.example .env.local   # lalu ubah ADMIN_PASSWORD
npm run dev
```

Buka `http://localhost:3000` untuk halaman utama, dan `http://localhost:3000/admin` untuk panel admin.

Kalau port `3000` sedang dipakai (misalnya oleh project lain), jalankan:

```bash
npm run dev:alt
```

Lalu buka `http://localhost:3001` dan `http://localhost:3001/admin`. Tersedia juga `npm run dev:admin` untuk menjalankan aplikasi di port `3002`.

Password admin default (jika `.env.local` belum diisi): `jayszrs123` — **segera ganti** lewat `.env.local`.

## Struktur Konten

Semua teks dan gambar diambil dari `data/content.json`. Panel admin membaca dan menulis file ini lewat API route (`/api/content`), jadi perubahan dari `/admin` langsung tersimpan di file tersebut.

## Catatan Penting soal Deploy

- **Vercel / hosting serverless**: filesystem bersifat read-only saat runtime, jadi tombol "Simpan" dan "Upload" di `/admin` **tidak akan bekerja** di Vercel kecuali kamu memindahkan penyimpanan ke database atau storage eksternal (misalnya Supabase, Cloudinary, atau Vercel Blob). Ini best next step yang bisa aku bantu kalau kamu mau lanjut.
- **VPS / self-hosted / `npm run start` di server sendiri**: semuanya bekerja normal karena filesystem bisa ditulis.
- Untuk sekarang (versi sederhana), ini paling cocok dijalankan lokal atau di VPS.

## Struktur Folder

```
app/
  layout.js, page.js, globals.css
  admin/page.js         # panel admin
  api/content/route.js  # baca/tulis data/content.json
  api/upload/route.js   # upload gambar
  api/auth/*            # login/logout admin sederhana
components/              # semua section (Hero, About, Gallery, dll)
data/content.json        # sumber semua konten
public/uploads/           # hasil upload gambar dari admin
```

## Kustomisasi Warna & Font

Warna dan font diatur di `tailwind.config.js` (token `emerald`, `gold`, `paper`, `ink`) dan `app/layout.js` (font Space Grotesk, Inter, JetBrains Mono).
