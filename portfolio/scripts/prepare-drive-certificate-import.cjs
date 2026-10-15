// Prepare a reviewable import from downloaded Drive files. No remote writes.
// node scripts/prepare-drive-certificate-import.cjs analysis.json current-content.json
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const analysis = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const current = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const assets = JSON.parse(fs.readFileSync(path.join(root, "backend/data/drive-certificate-assets.json"), "utf8"));
const byId = Object.fromEntries(assets.map((asset) => [asset.id, asset]));
const textById = Object.fromEntries(analysis.map((asset) => [asset.id, asset.text]));
const used = new Set();
const patches = [];
const additions = [];
const mediaAliases = {};

const rules = [
  ["CCNA - Introduction to Networks Certificate", "certificates-1783783587095-bdcy"],
  ["CCNA Switching Routing and Wireless Essentials", "certificates-1783838162234-xrpj"],
  ["Certificate C++ Essentials 1 International Cisco", "certificates-1783917379032-hefw"],
  ["Certificate Discovering Entrepreneurship", "certificates-1783918964891-9gdw"],
  ["Certificate IBM", "certificates-1783919531292-juj5"],
  ["Certificate ICT Programming", "certificates-1783919931539-n8cw"],
  ["Certificate Intro to Data Science", "certificates-1783920857190-favi"],
  ["Certificate Introduce Cyber Security", "certificates-1783921577654-dijp"],
  ["Certificate Introduction Internet of Things", "certificates-1783922538467-ss0v"],
  ["Certificate Introduction to Critical Infrastructure", "certificates-1783922775578-9xvz"],
  ["Certificate IT Essentials", "certificates-1784168775554-fplo"],
  ["Certificate Jaelani Surya Saputra DevNet", "certificates-1784169375330-v80v"],
  ["Certificate Networking Basics", "certificates-1784171707971-uryg"],
  ["Certificate of Competency With AI on Jetson", "certificates-1784172159674-jsfk"],
  ["Certificate Operating Systems Basics", "certificates-1784183695100-neye"],
  ["Certificate Oracle", "certificates-1784184040444-leqf"],
  ["Computer Hardware Basics", "certificates-1784184695972-658u"],
  ["Endpoint Security Certificate", "certificates-1784184891940-t21q"],
  ["Ethical Hacker Certificate", "certificates-1784185106020-44gn"],
];
function patchRecord(collection, id, ids, extra = {}) {
  const old = current[collection].find((item) => item.id === id);
  if (!old) throw new Error(`Unknown existing record ${id}`);
  const files = ids.map((fileId) => { used.add(fileId); if (!byId[fileId]) throw new Error(`Missing asset ${fileId}`); return byId[fileId]; });
  const pdfs = files.filter((file) => file.mimeType === "application/pdf");
  const images = files.filter((file) => file.mimeType.startsWith("image/"));
  const primary = pdfs[0] || images[0];
  if (!primary) throw new Error(`No document for ${id}`);
  const fields = {
    image: primary.preview,
    pdfUrl: pdfs[0]?.url || "",
    pdfUrls: pdfs.slice(1).map((file) => file.url),
    documents: images.map((file) => file.url),
    sourceDriveUrls: files.map((file) => file.driveUrl),
    ...extra,
  };
  const oldDocuments = [...new Set([old.pdfUrl, ...(old.pdfUrls || []), ...(old.documents || [])].filter(Boolean))];
  oldDocuments.forEach((url, index) => { mediaAliases[url] = (pdfs[index] || pdfs[0] || images[0]).url; });
  if (old.image) mediaAliases[old.image] = primary.preview;
  patches.push({ collection, id, fields, driveFileIds: ids });
}
for (const [folder, id] of rules) {
  const files = assets.filter((asset) => asset.folder.split("/").pop().startsWith(folder));
  patchRecord("certificates", id, files.map((asset) => asset.id), id === "certificates-1783918964891-9gdw" ? { issuer: "Cisco" } : id === "certificates-1784184040444-leqf" ? { issuer: "Oracle Academy" } : {});
}
patchRecord("certificates", "cert-1", ["1WDPWtdSMOb31biiXILWsl_eFoV4EfkSQ", "1J-LGZYmzgy6F48Vp-lM5uAOBQA-gujbd"]);
patchRecord("certificates", "certificates-1783783266030-2j48", ["1CRw5_HCoCUDE6OwxsAjM0LOvBviC_R_i", "1pvyBc8bfLwOokUpFZbmIrH-oaJEf7bA6"]);
const singles = [
  ["certificates-1784170037034-hn3t", "1KfCxagpBFC2jug6a0YBPYgii9BMn_7U9"],
  ["certificates-1784170956716-rk74", "1nBQ5evKRc1F6oCHuHiOyOaqIDAlu6qn6"],
  ["certificates-1784171205706-ruz5", "1A1G6fwp4wlOOpzSgcQynrtHuta8aY8zA"],
  ["certificates-1784171380810-rfk9", "1vKSBN6OeX1TxIG9NoaFhWH3NJgtBsunC"],
  ["certificates-1784171522450-pzok", "1bfscLiuSj5i8JeoyZTHVCl4js1hMoYT-"],
  ["certificates-1784185376492-0s00", "1no1jn13yVlx6iGlF6d4ZCb_GgynxUfgH"],
  ["certificates-1784280827454-0hx5", "14UBoYFgKBIn9qAYyK1NiIALi48HnbREW"],
  ["certificates-1784281014015-mqnc", "150VLpqOe_ryXyBSpUEspCvcIH7B7kKJb"],
  ["certificates-1784281230591-28en", "1r0yjK3ZmpDq_myrdDM1NfMZ_k8B_jODx"],
  ["certificates-1784281450543-r77k", "1QpT7DEVbD0AAh0vxEMBcFfQUeNWYHH8m"],
  ["certificates-1784281632063-igd8", "1hGDUK30LlcgcaNEkqDAULTbYPCll5-fn"],
  ["certificates-1784282781535-l3nl", "1Cxigk55lfWrgXsEFYRYRPBgjkIGuODzP"],
];
singles.forEach(([id, fileId]) => patchRecord("certificates", id, [fileId]));
patchRecord("achievements", "ach-1", ["1r5LFRkpy5JnaflByQICYBq486R3yFBeY"]);
patchRecord("achievements", "achievements-1783918071065-1iyi", ["1zn3ahUoCHkhnPiNJ9WjFYBtYZ9C_D0tu"]);
patchRecord("achievements", "achievements-1783918298191-fdhx", ["1PEYNNLhnZBkxLlo_EnB3AKQER1K40VNl"]);

function add(ids, data) {
  const files = ids.map((id) => { used.add(id); return byId[id]; });
  const pdfs = files.filter((file) => file.mimeType === "application/pdf");
  const images = files.filter((file) => file.mimeType.startsWith("image/"));
  additions.push({
    id: `drive-cert-${ids[0]}`, title: "", issuer: "", year: (data.issuedAt || "").match(/\d{4}/)?.[0] || "",
    logo: "", image: files[0].preview, credentialId: "", issuedAt: "", expiresAt: "", credentialUrl: "",
    pdfUrl: pdfs[0]?.url || "", pdfUrls: pdfs.slice(1).map((file) => file.url), documents: images.map((file) => file.url),
    sourceDriveUrls: files.map((file) => file.driveUrl), ...data,
  });
}
const classDescriptions = {
  "1BH6kRA6mPZFJUF2po8FF4y7oCDhPPwXF": "Menyelesaikan kelas deep learning yang membahas neural network dengan TensorFlow dan Keras, pemrosesan bahasa alami, time series, klasifikasi gambar, sistem rekomendasi, serta konversi dan deployment model.",
  "1qd3SEsyBqIMn2INj7I45_hrcNa9LFpic": "Menyelesaikan pelatihan alur data science menggunakan Microsoft Fabric, meliputi eksplorasi data melalui notebook, preprocessing dengan Data Wrangler, pelacakan eksperimen menggunakan MLflow, serta batch prediction dan pemantauan model.",
  "1SvjKjy0UT9PsPDY1Q03O1fkmE4gfoCuC": "Menyelesaikan kelas pemanfaatan AI untuk produktivitas yang mencakup penggunaan alat AI, prompt engineering, penggunaan AI secara etis dan bertanggung jawab, serta strategi adaptasi keterampilan di era AI.",
  "1oWqB85zhZjkCDagq7wjxjSUEhJEhjrDE": "Menyelesaikan kelas pengantar kecerdasan buatan dengan materi konsep dasar AI, peran data, machine learning, deep learning, dan contoh penerapannya dalam kehidupan sehari-hari.",
  "1ARsSX2CfUrncU7bv1gYXsqsygFWLm5k0": "Menyelesaikan pelatihan pemrosesan data menggunakan Python, termasuk praktik software engineering, repositori data, pipeline extract-transform-load, dan automasi. Evaluasi akhir berupa pembangunan ETL pipeline sederhana.",
  "11HUCTuD0RSVGeiD4lEXubSUG5comdJwV": "Menyelesaikan kelas dasar AWS Cloud dan generative AI yang membahas layanan komputasi, jaringan, penyimpanan, database, keamanan, pemantauan, serta pengelolaan biaya dan dukungan di lingkungan AWS.",
  "1EBqbEKA4c0BlNYKcyPdmlusi_L0gAOnP": "Menyelesaikan kelas Spec-Driven Development menggunakan Kiro, mulai dari perumusan requirements dan desain hingga implementasi task. Materi mencakup penyusunan spesifikasi, pengembangan aplikasi dengan bantuan AI, dan pemeliharaan kualitas kode.",
  "142DDeg7ewqnuZbx38HSg8Rv2tLHcBxxh": "Menyelesaikan kelas literasi finansial dalam program Coding Camp powered by DBS Foundation, dengan materi pengelolaan keuangan sehari-hari, perencanaan keuangan, pengenalan investasi, dan pengelolaan pinjaman secara bertanggung jawab.",
  "1ZVFiQyFz8RbqJKD15fXkwUPX-dV_jUj4": "Menyelesaikan kelas pengembangan aplikasi generative AI menggunakan Microsoft Azure AI Foundry. Materi meliputi pemilihan dan deployment model, SDK, Prompt Flow, RAG dengan data kustom, fine-tuning, serta evaluasi dan responsible AI.",
  "1DYmVRRH6aAiLbj0ii9rQkGoJKV4TMI88": "Menyelesaikan kelas dasar machine learning dengan fokus pada data tabular, klasifikasi, regresi, clustering, feature engineering, evaluasi, dan hyperparameter tuning. Proyek akhir mencakup pembangunan model supervised dan unsupervised learning.",
  "1RxN8TfVYtRr2YEIbglWEO_Ztf81aPSxj": "Menyelesaikan kelas strategi pengembangan diri yang membahas growth mindset, pengenalan potensi diri, pengelolaan waktu, kemampuan beradaptasi, dan refleksi. Evaluasi mencakup penyusunan personal development plan.",
  "13LX0J9-uxPQqL22TMA05L8z61C2RhBUT": "Menyelesaikan kelas dasar Python, termasuk tipe data, ekspresi, percabangan, perulangan, array, matriks, fungsi, object-oriented programming, style guide, unit testing, dan pengenalan library yang umum digunakan.",
};
for (const [id, description] of Object.entries(classDescriptions)) {
  const text = textById[id];
  const title = text.match(/Atas kelulusannya pada kelas\n([^\n]+)/)?.[1];
  const dates = [...text.matchAll(/\b\d{1,2} (?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember) \d{4}\b/g)].map((match) => match[0]);
  const credentialUrl = analysis.find((file) => file.id === id).links.find((link) => /dicoding.com\/certificates\//.test(link));
  if (!title || !dates.length || !credentialUrl) throw new Error(`Unverified class metadata ${id}`);
  add([id], { title, issuer: "Dicoding Indonesia", description, issuedAt: dates[0], expiresAt: dates[1] || "", credentialId: credentialUrl.split("/").pop(), credentialUrl });
}
const events = [
  ["1Vw1yRrBVhk7d2KRgrXRAmvzL2IGFxrRR", "DevCoach 233: DevOps - Code is Not Enough, Introduction to the Art of System Design", "Dicoding Event", "30 April 2026", "Mengikuti sesi DevCoach tentang pengantar system design dalam pengembangan perangkat lunak dan DevOps, untuk memperluas pemahaman perancangan sistem di luar penulisan kode."],
  ["1vJF41Aqt3JyonlnBqHWylfKPa3XSICgI", "DevCoach 238 - Mengenal RAG: Dari Konsep ke Implementasi Pertamamu", "Dicoding Event", "17 Juli 2026", "Mengikuti sesi pengenalan Retrieval Augmented Generation yang membahas konsep RAG dan langkah awal implementasinya dalam aplikasi berbasis AI."],
  ["1fDHv_N4yGrrQyTLtu3iYulL5v0DZck4-", "DevCoach 239: Hermes - Jangan Cuma Pakai Chatbot, Saatnya Punya Hermes Agent Sendiri!", "Dicoding Event", "31 Juli 2026", "Mengikuti sesi DevCoach mengenai Hermes dan pengenalan penggunaan AI agent, sebagai perluasan wawasan dari interaksi chatbot menuju alur kerja berbasis agent."],
  ["1ZrJSbQoI7sVXNJf9pVKKz7RwRdwU30Wc", "IDCamp Alumni Dialogue #2 - Effective Communication in a Hybrid & Digital World", "Indosat Ooredoo Hutchison Digital Camp", "29 April 2026", "Mengikuti dialog alumni IDCamp tentang komunikasi efektif dalam lingkungan kerja hybrid dan digital, dengan fokus pada pengembangan keterampilan komunikasi profesional."],
  ["1m4yANA8aJS-zFq2XfWK92Kj1j-QA7xIo", "METC Soft Skill Series #3 - Mindset on Point: Cara Berpikir yang Dicari di Dunia Kerja", "Microsoft Elevate Training Center", "5 Juni 2026", "Mengikuti sesi pengembangan soft skill tentang pola pikir yang dibutuhkan di dunia kerja dan kesiapan beradaptasi dalam lingkungan profesional."],
  ["1Aan-s86A2q22gIy0-mDStyWQLvB0CihW", "METC x Dicoding Live #2 - Future with AI: Tren dan Peluang di Era Transformasi Digital", "Microsoft Elevate Training Center", "25 Mei 2026", "Mengikuti sesi mengenai tren AI dan peluangnya dalam transformasi digital untuk memperluas wawasan mengenai perkembangan teknologi dan arah kebutuhan keterampilan."],
  ["14McvVNIyXVydeO9kgTjqsqVPrwDSC1Y-", "Sinergi Machine Learning dan Generative AI", "Microsoft Elevate Training Center", "28 April 2026", "Berpartisipasi dalam offline workshop training bertema sinergi machine learning dan generative AI yang diselenggarakan melalui Microsoft Elevate Training Center."],
  ["1vdUq9sG9fqCtYTLq9MrUa-fBhVS1TceW", "Virtual Roadshow METC x Startup Bandung - Menerapkan Data Science untuk Solusi Model AI secara End to End", "Microsoft Elevate Training Center", "29 Mei 2026", "Mengikuti virtual roadshow yang membahas penerapan data science untuk solusi model AI secara end to end, dari perspektif alur kerja pengembangan solusi berbasis data."],
];
for (const [id, title, issuer, issuedAt, description] of events) {
  const ids = id === "1vdUq9sG9fqCtYTLq9MrUa-fBhVS1TceW" ? [id, "1u4zFky_rQ-NYuFfW_fnGT0TzIjMhOcnh"] : [id];
  const credentialUrl = analysis.find((file) => file.id === id).links.find((link) => /dicoding.com\/elevate\/certificates\//.test(link)) || "";
  add(ids, { title, issuer, issuedAt, description, credentialUrl, credentialId: credentialUrl ? "elevate/certificate/2026/OFLK3X8V5P" : "" });
}
add(["1UQBjCN5jo7_WPeGo6xc6XfpysapG5hj8"], { title: "AWS AI Academy 2026 - Level Dasar & Pemula", issuer: "Dicoding Indonesia / AWS Training and Certification", issuedAt: "7 Agustus 2026", credentialId: "AWS2026/L1-AI-0003", description: "Menyelesaikan pelatihan level Dasar dan Pemula (Basic & Beginner) pada program AWS AI Academy 2026, sebagaimana tercantum pada sertifikat kelulusan yang diterbitkan Dicoding Indonesia." });
const seminars = [
  ["12og3KvCcXT8qi3Cp43qPlBu6VZOixYIO", "Content Creator - Make Money From Our Social Media", "Mengikuti seminar nasional Content Creator dalam BIGFAIR RISE 2025 dengan topik Make Money From Our Social Media bersama Tifani Hernang. Kegiatan memperluas wawasan mengenai pengembangan konten dan pemanfaatan media sosial."],
  ["1zrc9wzfruBDDTZnyS1PtmtN_GX6vzo-n", "Career Preparation - Get Ready for Career", "Mengikuti pelatihan Career Preparation dalam BIGFAIR RISE 2025 dengan tema Get Ready for Career bersama Vina Muliana, sebagai bagian dari persiapan memasuki dunia kerja."],
  ["1yr4iSk2KLk_Ie94IDCVeTO57GjGwZYVt", "Mahasiswa Prestasi - Persistence & Consistency Are Key", "Mengikuti seminar nasional Mahasiswa Prestasi dalam BIGFAIR RISE 2025 dengan topik Persistence & Consistency Are Key bersama M. Ficky Haris Ardiansyah, untuk memperluas wawasan mengenai ketekunan dan konsistensi dalam pengembangan prestasi."],
  ["1EXfedBFsVMiIgeZABhW-lHWAJSPbwWkS", "Entrepreneur - Zero Point to High Point", "Mengikuti pelatihan entrepreneurship dalam BIGFAIR RISE 2025 dengan tema Zero Point to High Point bersama Abi Atria, untuk memperluas wawasan dan motivasi dalam kewirausahaan."],
  ["18JazIBos86AuYlkn3uCrzW30bWqN6Zwj", "Personal Branding - Setup Our Personal Branding", "Mengikuti seminar nasional Personal Branding dalam BIGFAIR RISE 2025 dengan topik Setup Our Personal Branding bersama Verliza Tasha, sebagai pengembangan pemahaman mengenai citra diri profesional."],
  ["1FNXuq9r5z-cEL40pk4FLzp4j-xYCGScD", "Public Speaking - Dare to Speak to Get Attention", "Mengikuti pelatihan Public Speaking dalam BIGFAIR RISE 2025 dengan tema Dare to Speak to Get Attention bersama Savira Jasmine Sasongko untuk memperluas wawasan komunikasi dan berbicara di depan umum."],
];
for (const [id, title, description] of seminars) add([id], { title, issuer: "BIGFAIR RISE 2025", issuedAt: "2 Februari 2025", description });
add(["1vw8YlkKTh4t4-MPZeqTmIXMbAlzHnhyr"], { title: "International Youth Goals Singapore, Malaysia, and Thailand Batch #2 - Online Selection", issuer: "International Youth Goals / BIGFAIR", issuedAt: "April 2025", description: "Mendapatkan certificate of appreciation atas partisipasi dalam proses seleksi online International Youth Goals Singapore, Malaysia, and Thailand Batch #2 pada April 2025." });
add(["13Inyjv3i8DTKiWEjwg3GJrUWGe45Kcm5"], { title: "Web3 University Tour Jakarta", issuer: "Binance Academy / Tokocrypto / Coinvestasi", issuedAt: "25 November 2025", description: "Berpartisipasi sebagai peserta seminar edukatif Web3 University Tour Jakarta yang diselenggarakan oleh Binance Academy, Tokocrypto, dan Coinvestasi di Universitas Pancasila." });
add(["1MY-RH-jarWPKseXifDFBH9UQNonHlJHC"], { title: "Training Basic Video Editor", issuer: "HMTI Universitas Bani Saleh", issuedAt: "November 2025", description: "Mengikuti pelatihan offline Basic Video Editor sebagai peserta pada 17, 18, 24, dan 25 November 2025 yang diselenggarakan oleh HMTI Universitas Bani Saleh." });
add(["1Hz4XnfTdew8AYmcJVXW8pajlWGgUW42s"], { title: "Certificate of Apprenticeship - Video Editor", issuer: "PT Kawan Kerja Indonesia", issuedAt: "8 Mei 2025", credentialId: "0111/KKI/VE-ITS/V/2025", description: "Menyelesaikan program magang sebagai Video Editor di PT Kawan Kerja Indonesia pada 15 Maret sampai 1 Mei 2025. Sertifikat magang diterbitkan di Bandung pada 8 Mei 2025." });
add(["134fEE8LabVrPXB3D8murSc9v1DieafR5"], { title: "Webinar EIGRP Fundamentals - Cisco Enterprise Core Technologies", issuer: "ID-Networkers (IDN.ID)", issuedAt: "31 Juli 2026", credentialId: "WSIDN-4114.20398", description: "Menyelesaikan webinar EIGRP Fundamentals yang diselenggarakan ID-Networkers, dengan fokus pengenalan EIGRP untuk peserta yang mempersiapkan Cisco Enterprise Core Technologies." });
add(["1T3tIk0z2xr1VL2dF9EpVrpczqclSvnkj"], { title: "Workshop Data Engineer Fundamental - Panitia", issuer: "HMTI Universitas Bani Saleh", issuedAt: "13 Oktober 2024", description: "Berpartisipasi sebagai panitia Workshop Data Engineer Fundamental yang dilaksanakan pada 13 Oktober 2024 oleh HMTI Universitas Bani Saleh." });
add(["1eJO6Dl4tuSIXMM36VBKyt7fS6SLuizXb"], { title: "Training Organization HMTI 2024", issuer: "HMTI Universitas Bani Saleh", issuedAt: "5 Maret 2024", description: "Mengikuti Training Organization HMTI Universitas Bani Saleh sebagai peserta pada 23 sampai 25 Februari 2024 di Bogor, Jawa Barat. Sertifikat diterbitkan pada 5 Maret 2024." });
const unassigned = assets.filter((asset) => !used.has(asset.id));
if (unassigned.length) throw new Error(`Unassigned files: ${unassigned.map((file) => file.name).join(", ")}`);
if (patches.length !== 36 || additions.length !== 34) throw new Error(`Unexpected counts: ${patches.length} patches / ${additions.length} additions`);
const result = { sourceFolder: "https://drive.google.com/drive/folders/1vDrXGNt1n_gN5lWcN_89443zfC5-PxYW", importedOn: "2026-10-15", patches, additions, mediaAliases };
fs.writeFileSync(path.join(root, "backend/data/drive-certificate-import.json"), JSON.stringify(result, null, 2) + "\n");
fs.writeFileSync(path.join(root, "frontend/lib/certificate-media.json"), JSON.stringify(mediaAliases, null, 2) + "\n");
fs.writeFileSync(path.join(root, "frontend/lib/certificate-previews.json"), JSON.stringify(Object.fromEntries(assets.map((asset) => [asset.url, asset.preview])), null, 2) + "\n");
console.log(`Prepared ${patches.length} existing record updates and ${additions.length} new certificates using all ${used.size} Drive files.`);
