// Prepare locally, or publish through the existing authenticated content API.
// node scripts/apply-drive-certificate-import.cjs [--publish https://deployment.vercel.app]
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");
const { applyCertificateImport } = require("../backend/lib/apply-certificate-import.cjs");
const root = path.resolve(__dirname, "..");
require("@next/env").loadEnvConfig(root);
const plan = require("../backend/data/drive-certificate-import.json");
const registry = require("../backend/data/drive-certificate-assets.json");
const publishIndex = process.argv.indexOf("--publish");
const publishOrigin = publishIndex < 0 ? null : process.argv[publishIndex + 1];

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Existing Supabase read credentials are required.");
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("portfolio_data").select("data").eq("id", 1).single();
  if (error || !data?.data) throw new Error(error?.message || "Current portfolio content is unavailable.");
  const current = data.data;
  const next = applyCertificateImport(current, plan);
  const backupDir = path.join(root, "..", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backup = path.join(backupDir, "content-before-drive-import-2026-10-15.json");
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, JSON.stringify(current, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "backend/data/content.json"), JSON.stringify(next, null, 2) + "\n");
  console.log(`Prepared ${next.certificates.length} certificates and ${next.achievements.length} achievements; previous content backed up locally.`);
  if (!publishOrigin) return;
  const origin = new URL(publishOrigin);
  if (origin.protocol !== "https:" || !(origin.hostname.endsWith(".vercel.app") || ["jayszrs.my.id", "www.jayszrs.my.id"].includes(origin.hostname))) throw new Error("Unexpected deployment origin.");
  const paths = [...new Set(registry.flatMap((asset) => [asset.url, asset.preview]))];
  let nextPath = 0;
  async function checkWorker() {
    while (nextPath < paths.length) {
      const resource = paths[nextPath++];
      const response = await fetch(new URL(resource, origin), { method: "HEAD", signal: AbortSignal.timeout(20000) });
      const type = response.headers.get("content-type") || "";
      if (!response.ok || !(type.startsWith("image/") || type.includes("application/pdf"))) throw new Error(`Deployed file is unavailable: ${resource} (${response.status})`);
    }
  }
  await Promise.all([checkWorker(), checkWorker(), checkWorker(), checkWorker()]);
  console.log(`Verified ${paths.length} deployed original files and previews before updating content.`);
  if (!process.env.ADMIN_PASSWORD) throw new Error("Existing admin password is required to publish content.");
  const login = await fetch(new URL("/api/auth/login", origin), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }), signal: AbortSignal.timeout(20000),
  });
  if (!login.ok) throw new Error(`Admin login failed (${login.status}); no content was published.`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("Admin session was not returned; no content was published.");
  const response = await fetch(new URL("/api/content", origin), {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(next), signal: AbortSignal.timeout(30000),
  });
  const saved = await response.json();
  if (!response.ok || !saved.success) throw new Error(saved.error || `Content save failed (${response.status}).`);
  fs.writeFileSync(path.join(backupDir, "content-after-drive-import-2026-10-15.json"), JSON.stringify(saved.content, null, 2) + "\n");
  console.log(`Published ${saved.content.certificates.length} certificates via the authenticated content API and revalidated public pages. Blob was not modified.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
