import recoveredMedia from "./recovered-media.json";

export function mediaSource(src = "") {
  if (typeof src !== "string") return src;
  const value = src.trim();
  return recoveredMedia[value] || value;
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
  return isBlobSource(src) || (typeof src === "string" && src.startsWith("/recovered-media/"));
}
