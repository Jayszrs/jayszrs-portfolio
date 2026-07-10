export function externalUrl(value = "") {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:|sms:|whatsapp:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("@")) return url;
  return `https://${url.replace(/^\/+/, "")}`;
}
