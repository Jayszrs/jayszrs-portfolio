export const COLLABORATION_EXAMPLES = [
  ['nvidia', 'NVIDIA'], ['samsung', 'Samsung'], ['xiaomi', 'Xiaomi'], ['lenovo', 'Lenovo'], ['rog', 'ROG'], ['byd', 'BYD'],
].map(([id, name]) => ({ id: `example-${id}`, name, logo: `/collaboration-logos/${id}.svg`, url: '', appearance: 'white', status: 'example' }));

export const DEFAULT_CONTENT = {
  profile: {
    brandName: "",
    fullName: "",
    greeting: "",
    roleLabel: "",
    role: "",
    roles: [],
    handle: "",
    status: "",
    location: "",
    tagline: "",
    webServices: { enabled: true, url: '' },
    heroImage: "",
    heroImage2: "",
    heroImage3: "",
    heroImage4: "",
    heroImages: [],
    cvUrl: "",
    socials: {
      github: "",
      linkedin: "",
      instagram: "",
      tiktok: "",
    },
  },
  about: {
    heading: "",
    paragraphs: [],
    skills: [],
  },
  sections: {
    signalStrip: {
      extras: ["Available for collaboration", "Bekasi - Indonesia"],
    },
    about: {
      eyebrow: "Tentang",
      skillsEyebrow: "Fokus & Keahlian",
    },
    education: {
      eyebrow: "Academic journey",
      title: "Pendidikan",
      detailEyebrow: "Riwayat pendidikan",
    },
    capabilities: {
      eyebrow: "Toolbox & workflow",
      title: "Keahlian yang saya pakai.",
      description:
        "Bukan sekadar daftar nama - setiap item bisa dibuka untuk melihat sejak kapan dan bagaimana saya menggunakannya.",
      groups: {
        editingSoftware: {
          eyebrow: "Creative toolkit",
          title: "Software Editing",
          shortTitle: "Software",
          description: "Perangkat yang saya gunakan untuk desain, video, dan motion.",
        },
        programming: {
          eyebrow: "Development",
          title: "Programming Skill",
          shortTitle: "Programming",
          description: "Bahasa dan framework yang saya gunakan untuk membangun produk.",
        },
        operatingSystems: {
          eyebrow: "Daily environment",
          title: "Operating System",
          shortTitle: "Operating System",
          description: "Sistem operasi yang terbiasa saya gunakan dan kelola.",
        },
      },
    },
    experience: {
      eyebrow: "Rekam Jejak",
      title: "Pengalaman",
      description: "Klik pengalaman untuk membuka cerita dan kontribusi lengkap.",
    },
    gallery: {
      eyebrow: "Portofolio",
      title: "Proyek Terpilih",
      detailEyebrow: "Project case study",
    },
    selectedDesigns: {
      eyebrow: "Visual archive",
      title: "Selected Design",
      description: "Pilihan karya visual. Klik kartu untuk membuka preview dan detail desain.",
    },
    ratings: {
      eyebrow: "Rating pengunjung",
      title: "Bukti pengalaman orang yang pernah mampir.",
      description: "Kumpulan rating, cerita singkat, dan dokumentasi dari orang yang pernah melihat karya saya.",
    },
    achievements: {
      eyebrow: "Pengakuan",
      title: "Pencapaian & Sertifikat",
      achievementsLabel: "Pencapaian",
      certificatesLabel: "Sertifikat",
    },
    contact: {
      eyebrow: "Kontak",
      detailsTitle: "Detail kontak",
      emailButton: "Kirim email",
      whatsappButton: "WhatsApp",
      footerSuffix: "",
    },
  },
  pageHeroes: {
    tentang: {
      eyebrow: "Lebih dekat",
      title: "Teknologi yang rapi, aman, dan benar-benar berguna.",
      description:
        "Kenali cara saya berpikir, bidang yang saya pelajari, serta kemampuan yang saya bawa ke setiap proyek.",
      accent: "emerald",
    },
    pengalaman: {
      eyebrow: "Perjalanan",
      title: "Belajar lewat kerja nyata dan kolaborasi.",
      description:
        "Catatan pengalaman profesional, organisasi, dan volunteer yang membentuk cara saya bekerja hari ini.",
      accent: "ink",
    },
    proyek: {
      eyebrow: "Selected work",
      title: "Dari ide, jadi produk yang bisa dipakai.",
      description:
        "Pilihan proyek yang mencakup pengembangan web, sistem informasi, desain produk, dan eksperimen IoT.",
      accent: "gold",
    },
    pencapaian: {
      eyebrow: "Milestone",
      title: "Bukti kecil dari proses yang terus berjalan.",
      description:
        "Kumpulan pencapaian, sertifikasi, dan pengakuan yang menjadi penanda perjalanan belajar saya.",
      accent: "gold",
    },
    kontak: {
      eyebrow: "Mari bicara",
      title: "Punya ide menarik? Saya siap mendengarkan.",
      description:
        "Ceritakan kebutuhan, tantangan, atau peluang kolaborasinya. Kita bisa mulai dari percakapan sederhana.",
      accent: "emerald",
    },
  },
  education: [],
  capabilities: {
    editingSoftware: [],
    programming: [],
    operatingSystems: [],
  },
  experience: [],
  gallery: [],
  selectedDesigns: [],
  collaborations: COLLABORATION_EXAMPLES,
  ratings: [],
  achievements: [],
  certificates: [],
  contact: {
    heading: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    subheading: "",
    socials: {},
  },
};

function mergeObject(defaultValue, value) {
  return { ...defaultValue, ...(value || {}) };
}

function mergeNested(defaultValue, value) {
  const merged = mergeObject(defaultValue, value);
  for (const key of Object.keys(defaultValue)) {
    if (
      defaultValue[key] &&
      typeof defaultValue[key] === "object" &&
      !Array.isArray(defaultValue[key])
    ) {
      merged[key] = mergeNested(defaultValue[key], value?.[key]);
    }
  }
  return merged;
}

function arrayOrDefault(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

export function mergeContent(data = {}) {
  const sections = mergeNested(DEFAULT_CONTENT.sections, data.sections);

  return {
    profile: {
      ...mergeObject(DEFAULT_CONTENT.profile, data.profile),
      socials: mergeObject(DEFAULT_CONTENT.profile.socials, data.profile?.socials),
      roles: arrayOrDefault(data.profile?.roles, DEFAULT_CONTENT.profile.roles),
      heroImages: arrayOrDefault(data.profile?.heroImages, DEFAULT_CONTENT.profile.heroImages),
    },
    about: {
      ...mergeObject(DEFAULT_CONTENT.about, data.about),
      paragraphs: arrayOrDefault(data.about?.paragraphs, DEFAULT_CONTENT.about.paragraphs),
      skills: arrayOrDefault(data.about?.skills, DEFAULT_CONTENT.about.skills),
    },
    sections: {
      ...sections,
      contact: {
        ...sections.contact,
        footerSuffix: "",
      },
    },
    pageHeroes: mergeNested(DEFAULT_CONTENT.pageHeroes, data.pageHeroes),
    education: arrayOrDefault(data.education, DEFAULT_CONTENT.education),
    capabilities: {
      ...mergeObject(DEFAULT_CONTENT.capabilities, data.capabilities),
      editingSoftware: arrayOrDefault(data.capabilities?.editingSoftware, DEFAULT_CONTENT.capabilities.editingSoftware),
      programming: arrayOrDefault(data.capabilities?.programming, DEFAULT_CONTENT.capabilities.programming),
      operatingSystems: arrayOrDefault(data.capabilities?.operatingSystems, DEFAULT_CONTENT.capabilities.operatingSystems),
    },
    experience: arrayOrDefault(data.experience, DEFAULT_CONTENT.experience),
    gallery: arrayOrDefault(data.gallery, DEFAULT_CONTENT.gallery),
    selectedDesigns: arrayOrDefault(data.selectedDesigns, DEFAULT_CONTENT.selectedDesigns),
    collaborations: arrayOrDefault(data.collaborations, DEFAULT_CONTENT.collaborations),
    ratings: arrayOrDefault(data.ratings, DEFAULT_CONTENT.ratings),
    achievements: arrayOrDefault(data.achievements, DEFAULT_CONTENT.achievements),
    certificates: arrayOrDefault(data.certificates, DEFAULT_CONTENT.certificates),
    contact: {
      ...mergeObject(DEFAULT_CONTENT.contact, data.contact),
      socials: mergeObject(DEFAULT_CONTENT.contact.socials, data.contact?.socials),
    },
  };
}

export function withLocalFallback(localData, remoteData = {}) {
  const local = mergeContent(localData);
  const remote = mergeContent(remoteData || {});
  function pick(localValue, remoteValue) {
    if (Array.isArray(localValue) || Array.isArray(remoteValue)) return Array.isArray(remoteValue) && remoteValue.length > 0 ? remoteValue : localValue;
    if (localValue && remoteValue && typeof localValue === 'object' && typeof remoteValue === 'object') {
      return [...new Set([...Object.keys(localValue), ...Object.keys(remoteValue)])].reduce((next, key) => ({ ...next, [key]: pick(localValue[key], remoteValue[key]) }), {});
    }
    if (typeof remoteValue === 'string') return remoteValue.trim() ? remoteValue : localValue;
    return remoteValue ?? localValue;
  }
  const merged = pick(local, remote);
  // Explicit empty new collections must stay empty when the owner removes their rows.
  merged.collaborations = Array.isArray(remoteData?.collaborations) ? remoteData.collaborations : local.collaborations;
  const services = remoteData?.profile?.webServices;
  if (services && typeof services === 'object' && !Array.isArray(services)) merged.profile.webServices = { ...local.profile.webServices, ...services };
  const metrics = remoteData?.profile?.socialHighlights?.tiktokVideoMetrics;
  if (Array.isArray(metrics)) merged.profile.socialHighlights = { ...merged.profile.socialHighlights, tiktokVideoMetrics: metrics };
  return mergeContent(merged);
}
