"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "id", label: "ID", name: "Indonesia" },
  { code: "en", label: "EN", name: "English" },
  { code: "ja", label: "JP", name: "Japanese" },
  { code: "fr", label: "FR", name: "French" },
];

const DICTIONARY = {
  en: {
    "Beranda": "Home",
    "Tentang": "About",
    "Pendidikan": "Education",
    "Pengalaman": "Experience",
    "Proyek": "Projects",
    "Pencapaian": "Achievements",
    "Kontak": "Contact",
    "Hubungi": "Contact",
    "Hubungi saya": "Contact me",
    "Kontak Saya": "Contact Me",
    "Contact Me": "Contact Me",
    "Saat ini berfokus sebagai": "Currently focused as",
    "Assalammualaikum Temen - Temen": "Assalamualaikum friends",
    "Lihat Proyek": "View Projects",
    "Preview Resume": "Preview Resume",
    "Download Resume": "Download Resume",
    "Upload resume dari admin dulu": "Upload a resume from admin first",
    "Upload foto hero di admin": "Upload hero photo in admin",
    "Tampilkan foto hero": "Show hero photo",
    "Kembali ke beranda": "Back to home",
    "item": "items",
    "Buka detail": "Open detail",
    "Riwayat pendidikan": "Education history",
    "Fokus Pembelajaran": "Learning Focus",
    "Aktivitas & Pencapaian": "Activities & Achievements",
    "Dokumentasi Pendidikan": "Education Documentation",
    "Buka file dokumentasi": "Open documentation file",
    "Kunjungi institusi": "Visit institution",
    "Rekam Jejak": "Track Record",
    "Klik pengalaman untuk membuka cerita dan kontribusi lengkap.": "Click an experience to open the full story and contribution.",
    "Semua": "All",
    "Magang": "Internship",
    "Kerja": "Work",
    "Volunteer": "Volunteer",
    "Organisasi": "Organization",
    "Sekarang": "Now",
    "Latar Belakang": "Background",
    "Peran & Kontribusi": "Role & Contribution",
    "Deskripsi latar belakang belum ditambahkan.": "Background description has not been added yet.",
    "Detail kontribusi belum ditambahkan.": "Contribution details have not been added yet.",
    "Unit kerja:": "Work unit:",
    "Dokumentasi": "Documentation",
    "Proyek Terpilih": "Selected Projects",
    "Lihat detail": "View detail",
    "Project case study": "Project case study",
    "Bukti Dokumentasi": "Documentation Proof",
    "Buka proyek": "Open project",
    "Pencapaian & Sertifikat": "Achievements & Certificates",
    "Sertifikat": "Certificates",
    "Lihat credential": "View credential",
    "Dokumentasi PDF": "PDF Documentation",
    "Keahlian yang saya pakai.": "Skills I use.",
    "Bukan sekadar daftar nama - setiap item bisa dibuka untuk melihat sejak kapan dan bagaimana saya menggunakannya.": "Not just a list - each item opens to show when and how I use it.",
    "Sedang dipelajari": "Currently learning",
    "Mahir": "Advanced",
    "Menengah": "Intermediate",
    "Dasar": "Basic",
    "Fokus & Keahlian": "Focus & Skills",
    "Kontak": "Contact",
    "Kirim email": "Send email",
    "WhatsApp": "WhatsApp",
    "Detail kontak": "Contact details",
    "Mari Terhubung": "Let's Connect",
    "Terbuka untuk kolaborasi, riset, maupun proyek freelance.": "Open to collaboration, research, and freelance projects.",
    "Rating pengunjung": "Visitor ratings",
    "Bukti pengalaman orang yang pernah mampir.": "Proof from people who have visited.",
    "Bukti dokumentasi": "Documentation proof",
    "Lihat bukti": "View proof",
    "Beri rating": "Leave a rating",
    "Rating masuk sebagai pending dulu sebelum tampil.": "Ratings are pending before appearing.",
    "Mengirim...": "Sending...",
    "Kirim rating": "Send rating",
    "Rating terkirim. Nanti tampil setelah dicek admin.": "Rating sent. It will appear after admin review.",
    "Pilihan karya visual. Klik kartu untuk membuka preview dan detail desain.": "Selected visual works. Click a card to open the preview and design details.",
    "Upload preview dari admin": "Upload preview from admin",
    "Preview belum diunggah.": "Preview has not been uploaded.",
    "Buka karya": "Open work",
    "Tentang Saya": "About Me",
    "Di luar riset, saya membangun produk web dan antarmuka digital: dari company profile, sistem informasi kampus, hingga dashboard IoT.": "Outside research, I build web products and digital interfaces: from company profiles and campus information systems to IoT dashboards.",
    "Sedang ditempuh": "In progress",
    "Mendalami pengembangan perangkat lunak, jaringan komputer, keamanan siber, dan forensik jaringan.": "Studying software development, computer networks, cybersecurity, and network forensics.",
    "Terlibat dalam kegiatan organisasi mahasiswa, mendukung acara dan program kerja jurusan Teknik Informatika.": "Involved in student organization activities, supporting events and work programs for the Informatics department.",
    "Sertifikat kompetensi dan pembelajaran.": "Competency and learning certificate.",
    "Offline": "Offline",
  },
  ja: {
    "Beranda": "ホーム",
    "Tentang": "自己紹介",
    "Pendidikan": "学歴",
    "Pengalaman": "経験",
    "Proyek": "プロジェクト",
    "Pencapaian": "実績",
    "Kontak": "連絡先",
    "Hubungi": "連絡",
    "Hubungi saya": "連絡する",
    "Kontak Saya": "連絡する",
    "Contact Me": "連絡する",
    "Saat ini berfokus sebagai": "現在の専門分野",
    "Assalammualaikum Temen - Temen": "皆さん、こんにちは",
    "Lihat Proyek": "プロジェクトを見る",
    "Preview Resume": "履歴書プレビュー",
    "Download Resume": "履歴書をダウンロード",
    "Upload resume dari admin dulu": "先に管理画面から履歴書をアップロードしてください",
    "Upload foto hero di admin": "管理画面でヒーロー写真をアップロード",
    "Tampilkan foto hero": "ヒーロー写真を表示",
    "Kembali ke beranda": "ホームに戻る",
    "item": "件",
    "Buka detail": "詳細を見る",
    "Riwayat pendidikan": "学歴の詳細",
    "Fokus Pembelajaran": "学習分野",
    "Aktivitas & Pencapaian": "活動と実績",
    "Dokumentasi Pendidikan": "学歴ドキュメント",
    "Buka file dokumentasi": "ドキュメントを開く",
    "Kunjungi institusi": "学校サイトを見る",
    "Rekam Jejak": "歩み",
    "Klik pengalaman untuk membuka cerita dan kontribusi lengkap.": "経験をクリックすると詳しい内容と貢献を確認できます。",
    "Semua": "すべて",
    "Magang": "インターン",
    "Kerja": "仕事",
    "Volunteer": "ボランティア",
    "Organisasi": "組織",
    "Sekarang": "現在",
    "Latar Belakang": "背景",
    "Peran & Kontribusi": "役割と貢献",
    "Deskripsi latar belakang belum ditambahkan.": "背景説明はまだ追加されていません。",
    "Detail kontribusi belum ditambahkan.": "貢献の詳細はまだ追加されていません。",
    "Unit kerja:": "担当部署:",
    "Dokumentasi": "ドキュメント",
    "Proyek Terpilih": "主なプロジェクト",
    "Lihat detail": "詳細を見る",
    "Project case study": "プロジェクト事例",
    "Bukti Dokumentasi": "ドキュメント証跡",
    "Buka proyek": "プロジェクトを開く",
    "Pencapaian & Sertifikat": "実績と証明書",
    "Sertifikat": "証明書",
    "Lihat credential": "資格情報を見る",
    "Dokumentasi PDF": "PDF ドキュメント",
    "Keahlian yang saya pakai.": "使用しているスキル",
    "Bukan sekadar daftar nama - setiap item bisa dibuka untuk melihat sejak kapan dan bagaimana saya menggunakannya.": "単なるリストではなく、各項目を開くと使用時期と使い方を確認できます。",
    "Sedang dipelajari": "学習中",
    "Mahir": "上級",
    "Menengah": "中級",
    "Dasar": "基礎",
    "Fokus & Keahlian": "専門分野とスキル",
    "Kirim email": "メールを送る",
    "WhatsApp": "WhatsApp",
    "Detail kontak": "連絡先詳細",
    "Mari Terhubung": "つながりましょう",
    "Terbuka untuk kolaborasi, riset, maupun proyek freelance.": "コラボレーション、研究、フリーランス案件に対応できます。",
    "Rating pengunjung": "訪問者の評価",
    "Bukti pengalaman orang yang pernah mampir.": "訪問した人たちの体験の証拠。",
    "Bukti dokumentasi": "証拠ドキュメント",
    "Lihat bukti": "証拠を見る",
    "Beri rating": "評価する",
    "Rating masuk sebagai pending dulu sebelum tampil.": "評価は表示前に承認待ちになります。",
    "Mengirim...": "送信中...",
    "Kirim rating": "評価を送信",
    "Rating terkirim. Nanti tampil setelah dicek admin.": "評価を送信しました。管理者確認後に表示されます。",
    "Pilihan karya visual. Klik kartu untuk membuka preview dan detail desain.": "選ばれたビジュアル作品。カードをクリックしてプレビューと詳細を開けます。",
    "Upload preview dari admin": "管理画面からプレビューをアップロード",
    "Preview belum diunggah.": "プレビューはまだアップロードされていません。",
    "Buka karya": "作品を開く",
    "Tentang Saya": "私について",
    "Di luar riset, saya membangun produk web dan antarmuka digital: dari company profile, sistem informasi kampus, hingga dashboard IoT.": "研究以外では、会社プロフィール、キャンパス情報システム、IoTダッシュボードなどのWebプロダクトとデジタルUIを作っています。",
    "Sedang ditempuh": "在学中",
    "Mendalami pengembangan perangkat lunak, jaringan komputer, keamanan siber, dan forensik jaringan.": "ソフトウェア開発、コンピュータネットワーク、サイバーセキュリティ、ネットワークフォレンジックを学んでいます。",
    "Terlibat dalam kegiatan organisasi mahasiswa, mendukung acara dan program kerja jurusan Teknik Informatika.": "学生組織の活動に参加し、情報工学科のイベントやプログラムを支援しています。",
    "Sertifikat kompetensi dan pembelajaran.": "スキルと学習の証明書。",
    "Offline": "オフライン",
  },
  fr: {
    "Beranda": "Accueil",
    "Tentang": "A propos",
    "Pendidikan": "Education",
    "Pengalaman": "Experience",
    "Proyek": "Projets",
    "Pencapaian": "Realisations",
    "Kontak": "Contact",
    "Hubungi": "Contact",
    "Hubungi saya": "Me contacter",
    "Kontak Saya": "Me contacter",
    "Contact Me": "Me contacter",
    "Saat ini berfokus sebagai": "Actuellement axe sur",
    "Assalammualaikum Temen - Temen": "Bonjour a tous",
    "Lihat Proyek": "Voir les projets",
    "Preview Resume": "Voir le CV",
    "Download Resume": "Telecharger le CV",
    "Upload resume dari admin dulu": "Ajoutez d'abord le CV depuis l'admin",
    "Upload foto hero di admin": "Ajoutez la photo hero depuis l'admin",
    "Tampilkan foto hero": "Afficher la photo hero",
    "Kembali ke beranda": "Retour a l'accueil",
    "item": "elements",
    "Buka detail": "Ouvrir le detail",
    "Riwayat pendidikan": "Parcours education",
    "Fokus Pembelajaran": "Focus d'apprentissage",
    "Aktivitas & Pencapaian": "Activites et realisations",
    "Dokumentasi Pendidikan": "Documentation education",
    "Buka file dokumentasi": "Ouvrir le fichier",
    "Kunjungi institusi": "Visiter l'institution",
    "Rekam Jejak": "Parcours",
    "Klik pengalaman untuk membuka cerita dan kontribusi lengkap.": "Cliquez sur une experience pour ouvrir l'histoire et la contribution complete.",
    "Semua": "Tous",
    "Magang": "Stage",
    "Kerja": "Travail",
    "Volunteer": "Benevolat",
    "Organisasi": "Organisation",
    "Sekarang": "Maintenant",
    "Latar Belakang": "Contexte",
    "Peran & Kontribusi": "Role et contribution",
    "Deskripsi latar belakang belum ditambahkan.": "La description du contexte n'a pas encore ete ajoutee.",
    "Detail kontribusi belum ditambahkan.": "Les details de contribution n'ont pas encore ete ajoutes.",
    "Unit kerja:": "Unite de travail :",
    "Dokumentasi": "Documentation",
    "Proyek Terpilih": "Projets selectionnes",
    "Lihat detail": "Voir le detail",
    "Project case study": "Etude de cas projet",
    "Bukti Dokumentasi": "Preuve documentaire",
    "Buka proyek": "Ouvrir le projet",
    "Pencapaian & Sertifikat": "Realisations et certificats",
    "Sertifikat": "Certificats",
    "Lihat credential": "Voir l'identifiant",
    "Dokumentasi PDF": "Documentation PDF",
    "Keahlian yang saya pakai.": "Competences que j'utilise.",
    "Bukan sekadar daftar nama - setiap item bisa dibuka untuk melihat sejak kapan dan bagaimana saya menggunakannya.": "Ce n'est pas juste une liste : chaque element s'ouvre pour voir depuis quand et comment je l'utilise.",
    "Sedang dipelajari": "En apprentissage",
    "Mahir": "Avance",
    "Menengah": "Intermediaire",
    "Dasar": "Basique",
    "Fokus & Keahlian": "Focus et competences",
    "Kirim email": "Envoyer un email",
    "WhatsApp": "WhatsApp",
    "Detail kontak": "Details de contact",
    "Mari Terhubung": "Restons connectes",
    "Terbuka untuk kolaborasi, riset, maupun proyek freelance.": "Ouvert aux collaborations, recherches et projets freelance.",
    "Rating pengunjung": "Avis des visiteurs",
    "Bukti pengalaman orang yang pernah mampir.": "Preuves d'experience de personnes passees ici.",
    "Bukti dokumentasi": "Preuve documentaire",
    "Lihat bukti": "Voir la preuve",
    "Beri rating": "Donner un avis",
    "Rating masuk sebagai pending dulu sebelum tampil.": "Les avis sont en attente avant publication.",
    "Mengirim...": "Envoi...",
    "Kirim rating": "Envoyer l'avis",
    "Rating terkirim. Nanti tampil setelah dicek admin.": "Avis envoye. Il apparaitra apres verification admin.",
    "Pilihan karya visual. Klik kartu untuk membuka preview dan detail desain.": "Selection de travaux visuels. Cliquez sur une carte pour ouvrir l'apercu et les details.",
    "Upload preview dari admin": "Ajoutez l'apercu depuis l'admin",
    "Preview belum diunggah.": "L'apercu n'a pas encore ete ajoute.",
    "Buka karya": "Ouvrir le travail",
    "Tentang Saya": "A propos de moi",
    "Di luar riset, saya membangun produk web dan antarmuka digital: dari company profile, sistem informasi kampus, hingga dashboard IoT.": "En dehors de la recherche, je cree des produits web et interfaces digitales : profils d'entreprise, systemes campus et tableaux de bord IoT.",
    "Sedang ditempuh": "En cours",
    "Mendalami pengembangan perangkat lunak, jaringan komputer, keamanan siber, dan forensik jaringan.": "Etude du developpement logiciel, des reseaux, de la cybersecurite et de la forensique reseau.",
    "Terlibat dalam kegiatan organisasi mahasiswa, mendukung acara dan program kerja jurusan Teknik Informatika.": "Implique dans les activites d'organisation etudiante, en soutien aux evenements et programmes du departement informatique.",
    "Sertifikat kompetensi dan pembelajaran.": "Certificat de competences et d'apprentissage.",
    "Offline": "Hors ligne",
  },
};

const INLINE_REPLACEMENTS = {
  en: {
    "Februari": "February",
    "Januari": "January",
    "Kota Bekasi Jawa Barat Indonesia": "Bekasi City, West Java, Indonesia",
    "Bekasi, Indonesia": "Bekasi, Indonesia",
    "Teknik Informatika": "Informatics Engineering",
    "Himpunan Mahasiswa": "Student Association",
    "Publikasi Dekorasi & Dokumentasi": "Publication, Decoration & Documentation",
    "Sistem Operasi": "Operating Systems",
    "Teks Section": "Section Text",
    "Galeri": "Gallery",
    "Penerbit": "Issuer",
    "Deskripsi": "Description",
    "Judul": "Title",
    "Lokasi": "Location",
    "Periode": "Period",
    "Mulai": "Start",
    "Selesai": "End",
    "Ringkasan": "Summary",
    "Gambar": "Image",
    "Tambah": "Add",
    "Hapus": "Delete",
    "Simpan": "Save",
  },
  ja: {
    "Februari": "2月",
    "Januari": "1月",
    "Kota Bekasi Jawa Barat Indonesia": "インドネシア 西ジャワ州 ブカシ市",
    "Bekasi, Indonesia": "インドネシア・ブカシ",
    "Teknik Informatika": "情報工学",
    "Himpunan Mahasiswa": "学生会",
    "Publikasi Dekorasi & Dokumentasi": "広報・装飾・記録",
    "Sistem Operasi": "OS",
    "Teks Section": "セクション文言",
    "Galeri": "ギャラリー",
    "Penerbit": "発行者",
    "Deskripsi": "説明",
    "Judul": "タイトル",
    "Lokasi": "場所",
    "Periode": "期間",
    "Mulai": "開始",
    "Selesai": "終了",
    "Ringkasan": "概要",
    "Gambar": "画像",
    "Tambah": "追加",
    "Hapus": "削除",
    "Simpan": "保存",
  },
  fr: {
    "Februari": "fevrier",
    "Januari": "janvier",
    "Kota Bekasi Jawa Barat Indonesia": "Ville de Bekasi, Java occidental, Indonesie",
    "Bekasi, Indonesia": "Bekasi, Indonesie",
    "Teknik Informatika": "Ingenierie informatique",
    "Himpunan Mahasiswa": "Association etudiante",
    "Publikasi Dekorasi & Dokumentasi": "Publication, decoration et documentation",
    "Sistem Operasi": "Systemes d'exploitation",
    "Teks Section": "Textes de section",
    "Galeri": "Galerie",
    "Penerbit": "Emetteur",
    "Deskripsi": "Description",
    "Judul": "Titre",
    "Lokasi": "Lieu",
    "Periode": "Periode",
    "Mulai": "Debut",
    "Selesai": "Fin",
    "Ringkasan": "Resume",
    "Gambar": "Image",
    "Tambah": "Ajouter",
    "Hapus": "Supprimer",
    "Simpan": "Enregistrer",
  },
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE"]);
const ATTRIBUTES = ["title", "aria-label", "placeholder"];

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function withOriginalSpacing(original, translated) {
  const start = original.match(/^\s*/)?.[0] || "";
  const end = original.match(/\s*$/)?.[0] || "";
  return `${start}${translated}${end}`;
}

function translateText(text, language) {
  if (language === "id") return text;
  const trimmed = normalize(text);
  if (!trimmed) return text;

  const dictionary = DICTIONARY[language] || {};
  if (dictionary[trimmed]) return withOriginalSpacing(text, dictionary[trimmed]);

  const heroPhoto = trimmed.match(/^Tampilkan foto hero (\d+)$/);
  if (heroPhoto) {
    const base = dictionary["Tampilkan foto hero"] || "Show hero photo";
    return withOriginalSpacing(text, `${base} ${heroPhoto[1]}`);
  }

  const replacements = INLINE_REPLACEMENTS[language] || {};
  let translated = trimmed;
  Object.entries(replacements)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([source, target]) => {
      translated = translated.replaceAll(source, target);
    });

  return translated === trimmed ? text : withOriginalSpacing(text, translated);
}

function shouldSkipNode(node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return !element || SKIP_TAGS.has(element.tagName) || Boolean(element.closest("[data-no-translate]"));
}

function removeGoogleArtifacts() {
  document.querySelectorAll(".goog-te-banner-frame, .goog-te-menu-frame, #goog-gt-tt, iframe.skiptranslate, script[data-google-translate], #google_translate_element")
    .forEach((node) => node.remove());
  document.documentElement.style.marginTop = "0";
  document.body.style.top = "0";
  document.cookie = "googtrans=; Max-Age=0; path=/";
  document.cookie = "googtrans=; Max-Age=0; path=/; domain=.jayszrs.vercel.app";
}

function translateAttributes(root, language) {
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll("*")] : [];
  elements.forEach((element) => {
    if (shouldSkipNode(element)) return;
    ATTRIBUTES.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const originalKey = `i18nOriginal${attribute.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase())}`;
      if (!element.dataset[originalKey]) {
        element.dataset[originalKey] = element.getAttribute(attribute) || "";
      }
      element.setAttribute(attribute, translateText(element.dataset[originalKey], language));
    });
  });
}

function translateTree(root, language, originals) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!shouldSkipNode(node) && normalize(node.nodeValue || "")) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((node) => {
    if (!originals.has(node)) originals.set(node, node.nodeValue || "");
    node.nodeValue = translateText(originals.get(node), language);
  });

  translateAttributes(root, language);
}

export default function LanguageSwitcher() {
  const [active, setActive] = useState("id");
  const originals = useRef(new WeakMap());
  const applying = useRef(false);
  const activeRef = useRef("id");

  useEffect(() => {
    removeGoogleArtifacts();

    const saved = window.localStorage.getItem("portfolio-language") || "id";
    setActive(saved);
    activeRef.current = saved;
    document.documentElement.lang = saved;
    document.documentElement.dataset.language = saved;

    const applyLanguage = () => {
      applying.current = true;
      translateTree(document.body, activeRef.current, originals.current);
      applying.current = false;
    };

    applyLanguage();

    const observer = new MutationObserver((mutations) => {
      if (applying.current) return;
      let shouldApply = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          originals.current.delete(mutation.target);
          shouldApply = true;
        }
        if (mutation.type === "childList" && mutation.addedNodes.length) shouldApply = true;
      });
      if (shouldApply) window.requestAnimationFrame(applyLanguage);
    });

    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const chooseLanguage = (code) => {
    window.localStorage.setItem("portfolio-language", code);
    setActive(code);
    activeRef.current = code;
    document.documentElement.lang = code;
    document.documentElement.dataset.language = code;
    removeGoogleArtifacts();
    translateTree(document.body, code, originals.current);
  };

  return (
    <div data-no-translate className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] right-5 z-[90] sm:right-6">
      <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-glass-lg backdrop-blur-xl">
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink sm:flex">
          <Languages size={16} />
        </div>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => chooseLanguage(language.code)}
            aria-label={`Switch language to ${language.name}`}
            className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition ${
              active === language.code ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  );
}
