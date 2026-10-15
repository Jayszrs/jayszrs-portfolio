// Read-only discovery of the configured portfolio database and Storage buckets.
// Only listing, select and download operations; never uploads, SQL writes or deletes.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");
const root = path.resolve(__dirname, "..");
require("@next/env").loadEnvConfig(root);
const destination = path.resolve(root, "../backups/storage-audit-2026-10-15");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Existing Supabase credentials are unavailable");
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
fs.mkdirSync(destination, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(destination, name), JSON.stringify(data, null, 2));
const redact = (value) => String(value || "").split(key).join("[redacted]").split(url).join("[configured-project]");
const report = { capturedAt: new Date().toISOString(), project: new URL(url).hostname.split(".")[0], serverCredentialConfigured: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY), buckets: [], tables: [], errors: [], remoteMutations: 0 };

async function main() {
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) report.errors.push({ operation: "listBuckets", message: redact(error.message) });
  for (const bucket of buckets || []) {
    const files = [];
    const queue = [""];
    while (queue.length) {
      const prefix = queue.shift();
      for (let offset = 0;; offset += 1000) {
        const page = await client.storage.from(bucket.name).list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
        if (page.error) { report.errors.push({ bucket: bucket.name, operation: "list", message: redact(page.error.message) }); break; }
        for (const entry of page.data || []) {
          const name = [prefix, entry.name].filter(Boolean).join("/");
          if (!entry.id && !entry.metadata) queue.push(name);
          else files.push({ ...entry, path: name });
        }
        if ((page.data || []).length < 1000) break;
      }
    }
    save(`bucket-${encodeURIComponent(bucket.id)}.json`, { bucket, files });
    report.buckets.push({ id: bucket.id, name: bucket.name, public: bucket.public, objects: files.length });
    const inventory = JSON.parse(fs.readFileSync(path.resolve(root, "../backups/blob-object-inventory-2026-10-15.json"))).blobs;
    const candidates = files.filter((file) => inventory.some((blob) => blob.pathname === file.path || path.basename(blob.pathname) === path.basename(file.path) || blob.size === Number(file.metadata?.size)));
    for (const file of candidates) {
      const result = await client.storage.from(bucket.name).download(file.path);
      if (result.error) { report.errors.push({ operation: "downloadCandidate", path: file.path, message: redact(result.error.message) }); continue; }
      const bytes = Buffer.from(await result.data.arrayBuffer());
      const md5 = crypto.createHash("md5").update(bytes).digest("hex");
      const matches = inventory.filter((blob) => blob.size === bytes.length && String(blob.etag || "").replaceAll('"', "") === md5);
      const target = path.resolve(destination, "files", bucket.id, file.path);
      if (!target.startsWith(path.join(destination, "files") + path.sep)) throw new Error("Invalid storage object path");
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes);
      report.downloads ||= [];
      report.downloads.push({ bucket: bucket.id, path: file.path, bytes: bytes.length, md5, sha256: crypto.createHash("sha256").update(bytes).digest("hex"), matchingOriginalUrls: matches.map((blob) => blob.url) });
    }
  }

  const schema = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/openapi+json" }, signal: AbortSignal.timeout(20000) });
  if (schema.ok) {
    const data = await schema.json();
    const names = Object.keys(data.paths || {}).filter((p) => /^\/[^/]+$/.test(p) && p !== "/").map((p) => p.slice(1));
    report.publicTableNames = names;
    for (const name of names.filter((name) => /portfolio|media|asset|upload|content|backup|history|revision/i.test(name))) {
      if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Unsupported table name in backup filename");
      const rows = [];
      for (let offset = 0;; offset += 500) {
        const result = await client.from(name).select("*").range(offset, offset + 499);
        if (result.error) { report.errors.push({ operation: "select", table: name, message: redact(result.error.message) }); break; }
        rows.push(...result.data);
        if (result.data.length < 500) break;
      }
      save(`table-${name}.json`, rows);
      const text = JSON.stringify(rows);
      report.tables.push({ name, rows: rows.length, blobUrlReferences: [...new Set(text.match(/https:\/\/[^"\s]+\.public\.blob\.vercel-storage\.com\/[^"\s\\]+/g) || [])].length, embeddedBase64Values: (text.match(/data:(?:image\/|application\/pdf)/g) || []).length });
    }
  } else report.errors.push({ operation: "readPublicSchema", status: schema.status });
  save("report.json", report);
  console.log(JSON.stringify(report));
}
main().catch((error) => { report.errors.push({ operation: "audit", message: redact(error.message) }); save("report.json", report); console.error(redact(error.message)); process.exitCode = 1; });
