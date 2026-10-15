// Lists or downloads originals to local backups. Never changes remote storage.
// node scripts/backup-blob-readonly.cjs [--download]
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { list, get } = require("@vercel/blob");

const root = path.resolve(__dirname, "..");
require("@next/env").loadEnvConfig(root);
const output = path.resolve(root, "../backups/blob-originals");
const inventoryPath = path.join(output, "inventory.json");
const download = process.argv.includes("--download");
const token = process.env.BLOB_READ_WRITE_TOKEN;

function destination(blob) {
  const target = path.resolve(output, "files", blob.pathname);
  const parent = path.join(output, "files") + path.sep;
  if (!target.startsWith(parent)) throw new Error("Invalid object pathname.");
  return target;
}

function verify(bytes, blob) {
  if (bytes.length !== blob.size) return false;
  const etag = (blob.etag || "").replaceAll('"', "");
  return !/^[a-f0-9]{32}$/i.test(etag) || crypto.createHash("md5").update(bytes).digest("hex") === etag;
}

async function main() {
  if (!token) throw new Error("The existing BLOB_READ_WRITE_TOKEN is required.");
  fs.mkdirSync(output, { recursive: true });
  const blobs = [];
  let cursor;
  do {
    const page = await list({ token, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  fs.writeFileSync(inventoryPath, JSON.stringify({ capturedAt: new Date().toISOString(), blobs }, null, 2) + "\n");
  console.log(`Saved an inventory of ${blobs.length} objects. No remote objects were changed.`);
  if (!download) return;
  let saved = 0;
  for (const blob of blobs) {
    const file = destination(blob);
    if (fs.existsSync(file) && verify(fs.readFileSync(file), blob)) {
      saved += 1;
      continue;
    }
    let response;
    try {
      response = await get(blob.url, { token, access: "public", useCache: false, abortSignal: AbortSignal.timeout(60000) });
    } catch (error) {
      if (/403|blocked|suspend/i.test(error.message)) {
        console.error(`Download stopped: storage is blocked (403). ${saved}/${blobs.length} originals backed up. Inventory and existing backups retained.`);
        process.exitCode = 2;
        return;
      }
      throw error;
    }
    if (!response || response.statusCode !== 200) throw new Error(`Original unavailable: ${blob.pathname}`);
    const bytes = Buffer.from(await new Response(response.stream).arrayBuffer());
    if (!verify(bytes, blob)) throw new Error(`Integrity check failed: ${blob.pathname}`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
    saved += 1;
    console.log(`Backed up ${saved}/${blobs.length}: ${blob.pathname}`);
  }
  console.log(`All ${saved} original objects verified and saved locally. Remote storage was not changed.`);
}

main().catch((error) => {
  console.error(token ? String(error.message).split(token).join("[redacted]") : error.message);
  process.exitCode = 1;
});
