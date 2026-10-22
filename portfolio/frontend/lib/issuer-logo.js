import { mediaSource } from "./media";

const logos = {
  "dicoding indonesia": "dicoding.png",
  "dicoding event": "dicoding.png",
  "dicoding indonesia / aws training and certification": "dicoding.png",
  "microsoft elevate training center": "microsoft.png",
  "indosat ooredoo hutchison digital camp": "indosat.svg",
  "bigfair rise 2025": "bigfair.png",
  "international youth goals / bigfair": "international-youth-goals.png",
  "binance academy / tokocrypto / coinvestasi": "web3-university.png",
  "hmti universitas bani saleh": "hmti-bani-saleh.png",
  "pt kawan kerja indonesia": "kawan-kerja.png",
  "id-networkers (idn.id)": "id-networkers.png",
};

export function issuerLogo(item = {}) {
  if (item.logo) return mediaSource(item.logo);
  const key = String(item.issuer || "").trim().toLowerCase();
  return logos[key] ? `/organization-logos/${logos[key]}` : mediaSource(item.image || "");
}

export function issuerLogoAppearance(item = {}) {
  const key = String(item.issuer || "").trim().toLowerCase();
  return item.logo || logos[key] ? "auto" : "original";
}
