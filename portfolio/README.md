# Jay Szrs — Portfolio

Website pribadi Jaelani Surya Saputra: proyek, pendidikan, pengalaman, dokumentasi, sertifikat, dan aktivitas sosial.

**Website:** https://jayszrs.my.id · **CMS:** https://jayszrs.my.id/admin · **GitHub:** https://github.com/Jayszrs

Dibangun dengan Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion, Supabase, dan Vercel. Tema terang, gelap, serta mengikuti sistem tersedia melalui pengaturan tampilan. Font Plus Jakarta Sans disertakan secara lokal.

## Menjalankan aplikasi

Dari folder `portfolio`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Di PowerShell, gunakan `Copy-Item .env.example .env.local`. Isi konfigurasi yang sesuai dengan proyek sendiri. Aplikasi lokal berjalan di http://localhost:3000; admin tersedia di `/admin`. Gunakan `npm run dev:alt` untuk port 3001 atau `npm run dev:admin` untuk port 3002.

Produksi menggunakan Node.js 24. Untuk membangun dan menjalankan hasil produksi:

```bash
npm run build
npm start
```

## Konten dan penyimpanan

- Konten CMS disimpan di Supabase, tabel `portfolio_data`, baris `id = 1`, kolom JSON `data`. Pembacaan memiliki cache 60 detik; penyimpanan admin menghapus cache konten dan halaman terkait.
- `backend/data/content.json` menyediakan data dasar dan fallback lokal. Saat Supabase dikonfigurasi, penyimpanan admin memakai database; filesystem Vercel tidak dijadikan penyimpanan CMS.
- Upload admin menggunakan Vercel Blob. Format yang didukung: JPG, PNG, WebP, GIF, serta PDF, maksimal 10 MB per file.
- `ADMIN_PASSWORD` dan kunci server disimpan di environment. Jangan masukkan `.env.local` atau kunci server ke Git maupun kode browser. Nama variabel dan contoh nilainya tersedia di `.env.example`.
- Root Directory proyek Vercel adalah **portfolio**. Backend dan frontend berjalan dalam satu aplikasi Next.js.

## Sosial media di beranda

Akun diambil dari `profile.socials` pada CMS. Tab mendukung keyboard: panah kiri/kanan, Home, dan End.

**GitHub** menampilkan profil, About Me dan tech stack dari README repositori profil, kalender kontribusi, dan peringkat commit pemilik di maksimal 30 repositori publik miliknya yang terakhir aktif. Data diperbarui berkala melalui `/api/social`; setiap pembacaan memiliki batas waktu dan hasil yang tidak diketahui tidak diubah menjadi angka nol. Jika jumlah commit tidak tersedia, daftar berubah menjadi repositori terbaru dengan label yang sesuai. Snapshot README publik yang sudah diverifikasi tetap tersedia saat API tidak bisa dibaca. Isi README diproses sebagai teks dan label; HTML dari README tidak dijalankan.

**Instagram** menampilkan kartu profil dan pratinjau postingan publik dengan tombol buka/tutup. Tautan profil tetap tersedia bila pratinjau dibatasi Instagram. Story, Notes, dan musik dibuka langsung di Instagram; belum ada sinkronisasi fitur tersebut ke website.

**TikTok** menggunakan kartu profil dan tautan unggahan/repost yang membuka profil TikTok. Embed lama yang menampilkan `overload-protect triggered` telah dilepas. Ini bukan feed otomatis maupun sinkronisasi repost. Ikon TikTok disimpan secara lokal; sumber SVG: [Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/tiktok.svg).

README sumber: [Jayszrs/Jayszrs](https://github.com/Jayszrs/Jayszrs#readme). Widget statistik pihak ketiga pada README tidak dipakai sebagai sumber angka website; cakupan kontribusi dijelaskan di panel GitHub.

## Pemulihan media

Lihat [MEDIA-RECOVERY.md](MEDIA-RECOVERY.md) untuk sumber file, checksum, hasil pencarian, dan keterbatasan pemulihan.

- File yang berhasil dipulihkan disajikan dari `/recovered-media`, `/certificates`, `/organization-logos`, dan `/project-documents`.
- URL upload asli tetap dipertahankan di CMS. Resolver media dan koleksi arsip hanya mengubah tampilan. Edit media baru dari admin diprioritaskan.
- Koleksi dari PDF portofolio dan pratinjau desain diberi keterangan sumber; tidak diklaim sebagai salinan biner identik dari Blob.
- Audit storage bersifat baca saja. Tidak ada penghapusan, perubahan paket, rotasi token, atau perubahan izin selama pemulihan.

## Pemeriksaan

```bash
node scripts/verify-social.cjs
node scripts/verify-certificate-import.cjs
npm run build
```

`verify-archive-recovery.cjs` dan `verify-archive-release.py` memerlukan snapshot pemulihan lokal. `restore-portfolio-archive.py` juga memerlukan PDF asli dan gambar ekstraknya di folder backup privat. Backup, kredensial, serta cache tidak disertakan dalam deployment.

## Struktur

```text
app/                 Halaman, layout, dan API routes Next.js
frontend/components/ Tampilan dan interaksi
frontend/lib/        Resolver media, registry pemulihan, helper frontend
backend/lib/         Pembacaan konten dan integrasi GitHub
backend/data/        Konten dasar dan provenance pemulihan
public/              Aset yang disajikan website
scripts/             Impor, audit baca saja, dan verifikasi
```
