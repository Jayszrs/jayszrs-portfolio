// Recover exact URL matches from Next.js 14's local image cache. No network/storage calls.
// Usage: node scripts/recover-media-cache.cjs content.json [cache-directory]
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const contentPath = process.argv[2];
if (!contentPath) throw new Error("Pass a portfolio content JSON file.");
const cache = path.resolve(process.argv[3] || path.join(root, ".next/cache/images"));
const output = path.join(root, "public/recovered-media");
const manifestPath = path.join(root, "frontend/lib/recovered-media.json");
const urls = new Set();
function collect(value) {
  if (typeof value === "string" && /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(value)) urls.add(value);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
collect(JSON.parse(fs.readFileSync(contentPath, "utf8").replace(/^\uFEFF/, "")));
const directories = new Set(fs.readdirSync(cache));
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
fs.mkdirSync(output, { recursive: true });
let recovered = 0;
for (const href of urls) {
  let best;
  for (const width of [48, 64, 80, 96, 128, 192, 256, 320, 360, 384, 420, 640, 750, 768, 828, 1024, 1080, 1200, 1280, 1536, 1920, 2048, 3840]) {
    for (const quality of [70, 75, 76, 80, 85, 90, 100]) {
      for (const mimeType of ["image/webp", "image/avif", ""]) {
        const key = crypto.createHash("sha256").update("3").update(href).update(String(width)).update(String(quality)).update(mimeType).digest("base64").replace(/\//g, "-");
        if (!directories.has(key) || (best && best.width >= width)) continue;
        const file = fs.readdirSync(path.join(cache, key)).find((name) => /\.(webp|avif|png|jpe?g|gif)$/.test(name));
        if (file) best = { width, file: path.join(cache, key, file) };
      }
    }
  }
  if (!best) continue;
  const name = crypto.createHash("sha256").update(href).digest("hex").slice(0, 20) + path.extname(best.file);
  fs.copyFileSync(best.file, path.join(output, name));
  manifest[href] = `/recovered-media/${name}`;
  recovered += 1;
}
fs.writeFileSync(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + "\n");
console.log(`Recovered ${recovered} exact URL matches from ${urls.size} Blob URLs. Original files and content are unchanged.`);
