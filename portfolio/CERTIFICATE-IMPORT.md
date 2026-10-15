# Certificate recovery and Drive import

Source: https://drive.google.com/drive/folders/1vDrXGNt1n_gN5lWcN_89443zfC5-PxYW

Imported on 15 October 2026 (Asia/Jakarta).

- 91 original files bundled: 78 PDFs and 13 images. Original bytes were preserved and verified with SHA-256.
- 33 existing certificate entries and 3 achievements received working documents.
- 34 new certificate entries were added, giving 67 certificates and 3 achievements.
- The two versions of the METC virtual roadshow remain documents of one certificate entry.
- Two existing certificates (ICT Programming Python and OPSWAT ICIP) are available as images in Drive and are shown as images.
- The Basic Video Editor training is recorded as participation; its filename says Speaker, but the certificate says participant.
- Existing profile, education, experience, projects, ratings, and contact data were preserved.
- Vercel Blob contents, permissions, tokens, and configuration were not changed.
- The CV is outside this certificate folder and was not replaced. Its original Blob URL remains unchanged.

## New certificates

| Title | Issuer | Issued |
| --- | --- | --- |
| Belajar Fundamental Deep Learning | Dicoding Indonesia | 24 Mei 2026 |
| Belajar Penerapan Data Science dengan Microsoft Fabric | Dicoding Indonesia | 21 Januari 2026 |
| AI Praktis untuk Produktivitas | Dicoding Indonesia | 09 Mei 2026 |
| Belajar Dasar AI | Dicoding Indonesia | 19 Maret 2026 |
| Belajar Fundamental Pemrosesan Data | Dicoding Indonesia | 29 Maret 2026 |
| Belajar Dasar Cloud dan Gen AI di AWS | Dicoding Indonesia | 04 April 2026 |
| Spec-Driven Development dengan Kiro | Dicoding Indonesia | 04 April 2026 |
| Introduction to Financial Literacy | Dicoding Indonesia | 17 Maret 2026 |
| Membangun Aplikasi Gen AI dengan Microsoft Azure | Dicoding Indonesia | 22 Januari 2026 |
| Belajar Machine Learning untuk Pemula | Dicoding Indonesia | 26 Maret 2026 |
| Belajar Strategi Pengembangan Diri | Dicoding Indonesia | 27 Maret 2026 |
| Memulai Pemrograman dengan Python | Dicoding Indonesia | 24 Januari 2026 |
| DevCoach 233: DevOps - Code is Not Enough, Introduction to the Art of System Design | Dicoding Event | 30 April 2026 |
| DevCoach 238 - Mengenal RAG: Dari Konsep ke Implementasi Pertamamu | Dicoding Event | 17 Juli 2026 |
| DevCoach 239: Hermes - Jangan Cuma Pakai Chatbot, Saatnya Punya Hermes Agent Sendiri! | Dicoding Event | 31 Juli 2026 |
| IDCamp Alumni Dialogue #2 - Effective Communication in a Hybrid & Digital World | Indosat Ooredoo Hutchison Digital Camp | 29 April 2026 |
| METC Soft Skill Series #3 - Mindset on Point: Cara Berpikir yang Dicari di Dunia Kerja | Microsoft Elevate Training Center | 5 Juni 2026 |
| METC x Dicoding Live #2 - Future with AI: Tren dan Peluang di Era Transformasi Digital | Microsoft Elevate Training Center | 25 Mei 2026 |
| Sinergi Machine Learning dan Generative AI | Microsoft Elevate Training Center | 28 April 2026 |
| Virtual Roadshow METC x Startup Bandung - Menerapkan Data Science untuk Solusi Model AI secara End to End | Microsoft Elevate Training Center | 29 Mei 2026 |
| AWS AI Academy 2026 - Level Dasar & Pemula | Dicoding Indonesia / AWS Training and Certification | 7 Agustus 2026 |
| Content Creator - Make Money From Our Social Media | BIGFAIR RISE 2025 | 2 Februari 2025 |
| Career Preparation - Get Ready for Career | BIGFAIR RISE 2025 | 2 Februari 2025 |
| Mahasiswa Prestasi - Persistence & Consistency Are Key | BIGFAIR RISE 2025 | 2 Februari 2025 |
| Entrepreneur - Zero Point to High Point | BIGFAIR RISE 2025 | 2 Februari 2025 |
| Personal Branding - Setup Our Personal Branding | BIGFAIR RISE 2025 | 2 Februari 2025 |
| Public Speaking - Dare to Speak to Get Attention | BIGFAIR RISE 2025 | 2 Februari 2025 |
| International Youth Goals Singapore, Malaysia, and Thailand Batch #2 - Online Selection | International Youth Goals / BIGFAIR | April 2025 |
| Web3 University Tour Jakarta | Binance Academy / Tokocrypto / Coinvestasi | 25 November 2025 |
| Training Basic Video Editor | HMTI Universitas Bani Saleh | November 2025 |
| Certificate of Apprenticeship - Video Editor | PT Kawan Kerja Indonesia | 8 Mei 2025 |
| Webinar EIGRP Fundamentals - Cisco Enterprise Core Technologies | ID-Networkers (IDN.ID) | 31 Juli 2026 |
| Workshop Data Engineer Fundamental - Panitia | HMTI Universitas Bani Saleh | 13 Oktober 2024 |
| Training Organization HMTI 2024 | HMTI Universitas Bani Saleh | 5 Maret 2024 |

## Local source and backups

- `backend/data/drive-certificate-assets.json`: source names, Drive links, checksums, original asset paths, and previews.
- `backend/data/drive-certificate-import.json`: reviewed media updates and new descriptions.
- `../backups/content-before-drive-import-2026-10-15.json`: original content before publishing.
- `../backups/content-after-drive-import-2026-10-15.json`: content returned by the authenticated save endpoint.

## Verification

- `node scripts/verify-certificate-import.cjs`: checks integrity, counts, document paths, idempotence, and preservation of unrelated content.
- All 78 PDFs were parsed with PDF.js 4.10.38, matching the mobile viewer.
- Production build and server rendering of certificate and media viewer components passed.
- Browser interaction testing was unavailable because no browser was connected.

## Reapplying the reviewed import

The preparation step reads the current Supabase content and writes a local content backup and updated fallback JSON:

```bash
node scripts/apply-drive-certificate-import.cjs
```

After the assets are deployed, the publish step first verifies every original file and preview on the destination, then logs into the existing admin endpoint using `ADMIN_PASSWORD` and saves through `/api/content`:

```bash
node scripts/apply-drive-certificate-import.cjs --publish https://jayszrs.my.id
```

Reapplying the import does not create duplicate records. Files are served from `/certificates/`; local first-page previews avoid downloading complete PDFs for thumbnail cards.
