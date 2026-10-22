const MONTHS = ['januari|january|jan', 'februari|february|feb', 'maret|march|mar', 'april|apr', 'mei|may', 'juni|june|jun', 'juli|july|jul', 'agustus|august|aug', 'september|sep', 'oktober|october|oct', 'november|nov', 'desember|december|dec'];

function journeyDate(value) {
  const text = String(value || '').trim();
  const iso = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(text);
  if (iso && +iso[2] >= 1 && +iso[2] <= 12) return { year: +iso[1], order: +iso[1] * 10000 + +iso[2] * 100 + +(iso[3] || 1) };
  const year = /\b(?:19|20)\d{2}\b/.exec(text);
  if (!year) return null;
  const month = MONTHS.findIndex(pattern => new RegExp(`\\b(?:${pattern})\\b`, 'i').test(text));
  const day = /^\s*(\d{1,2})\s/.exec(text);
  return { year: +year[0], order: +year[0] * 10000 + Math.max(month + 1, 1) * 100 + (day ? +day[1] : 1) };
}

function buildJourney(education = [], experience = []) {
  const rows = [
    ...education.map((item, index) => {
      const date = journeyDate(item.startDate) || journeyDate(item.period) || journeyDate(item.year);
      return { id: `education:${item.id || index}`, kind: 'education', label: 'Pendidikan', title: item.degree || item.institution, organization: item.institution, description: item.description || '', logo: item.logo || item.institutionLogo || item.schoolLogo || item.campusLogo || '', dateLabel: item.period || [item.startDate, item.endDate || 'Sekarang'].filter(Boolean).join(' - '), date, href: '/pendidikan' };
    }),
    ...experience.map((item, index) => ({ id: `experience:${item.id || index}`, kind: 'experience', label: item.type || 'Pengalaman', title: item.title, organization: item.org, description: item.description || '', logo: item.image || item.logo || '', dateLabel: item.startDate ? [item.startDate, item.endDate || 'Sekarang'].join(' - ') : item.period || '', date: journeyDate(item.startDate) || journeyDate(item.period), href: '/pengalaman' })),
  ];
  return rows.filter(row => row.title || row.organization).sort((a, b) => (a.date?.order ?? Infinity) - (b.date?.order ?? Infinity) || a.id.localeCompare(b.id));
}

module.exports = { journeyDate, buildJourney };
