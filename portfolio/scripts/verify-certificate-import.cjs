const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { applyCertificateImport } = require("../backend/lib/apply-certificate-import.cjs");
const root = path.resolve(__dirname, "..");
const plan = require("../backend/data/drive-certificate-import.json");
const assets = require("../backend/data/drive-certificate-assets.json");
const before = JSON.parse(fs.readFileSync(path.join(root, "../backups/content-before-drive-import-2026-10-15.json"), "utf8"));
const after = applyCertificateImport(before, plan);
assert.equal(after.certificates.length, 67);
assert.equal(after.achievements.length, 3);
assert.deepEqual(applyCertificateImport(after, plan), after, "Import must be idempotent");
for (const key of Object.keys(before).filter((key) => !["certificates", "achievements"].includes(key))) {
  assert.deepEqual(after[key], before[key], `Unrelated section changed: ${key}`);
}
for (const item of [...after.certificates, ...after.achievements]) {
  const docs = [item.pdfUrl, ...(item.pdfUrls || []), ...(item.documents || [])].filter(Boolean);
  assert.ok(docs.length, `No document for ${item.title}`);
  assert.ok(docs.every((url) => url.startsWith("/certificates/")), `Certificate still uses blocked storage: ${item.title}`);
  for (const url of docs) assert.ok(fs.existsSync(path.join(root, "public", url)), `Missing document ${url}`);
}
assert.equal(new Set(after.certificates.map((item) => item.id)).size, 67, "Duplicate certificate IDs");
assert.ok(plan.additions.every((item) => item.description.trim() && item.title.trim() && item.issuedAt.trim()));
for (const asset of assets) {
  const bytes = fs.readFileSync(path.join(root, "public", asset.url));
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), asset.sha256, `Original bytes changed: ${asset.name}`);
  if (asset.mimeType === "application/pdf") assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.ok(fs.statSync(path.join(root, "public", asset.preview)).size > 0, `Missing preview ${asset.preview}`);
}
console.log("PASS: 91 original files verified; 70 records have local documents; 34 additions have descriptions; repeat import creates no duplicates; unrelated content preserved.");
