import recoveredMedia from "./recovered-media.json";
import organizationLogos from "./organization-logos.json";
import certificateMedia from "./certificate-media.json";
import certificatePreviews from "./certificate-previews.json";

export function mediaSource(src = "") {
  if (typeof src !== "string") return src;
  const value = src.trim();
  const resolved = certificateMedia[value] || recoveredMedia[value] || organizationLogos.sources[value] || value;
  return organizationLogos.displayVariants?.[resolved] || resolved;
}

export function certificatePreview(src = "") {
  return certificatePreviews[mediaSource(src)] || "";
}

export function isBlobSource(src = "") {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function serveImageDirectly(src = "") {
  return isBlobSource(src) || (typeof src === "string" && /\.(?:svg|webp)(?:[?#]|$)/i.test(src));
}
