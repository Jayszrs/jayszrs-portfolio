const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const sharp = require("sharp");
const icons = require("../frontend/lib/skill-icons.json");
const attribution = require("../public/skill-icons/attribution.json");
const portraits = require("../frontend/lib/lanyard-portraits.json");
const evidence = require("../../backups/portrait-display-variants-2026-10-21.json");
const root = path.resolve(__dirname, "..");
const base = process.argv[2] || "http://127.0.0.1:3109";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const get = (url, options) => fetch(new URL(url, base), { ...options, signal: AbortSignal.timeout(30000) });
async function verify() {
  const content = await (await get("/api/content")).json();
  const names = Object.values(content.capabilities).flat().map((item) => item.name);
  assert.ok(names.every((name) => icons[name]), "Every current skill needs its actual local symbol");
  for (const [name, entry] of Object.entries(icons)) {
    assert.match(entry.src, /^\/skill-icons\/[a-z0-9-]+\.svg$/);
    const bytes = fs.readFileSync(path.join(root, "public", entry.src));
    assert.equal(hash(bytes), attribution[name].sha256);
    assert.ok(attribution[name].license?.spdx);
    const response = await get(entry.src);
    assert.equal(response.status, 200, name);
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), attribution[name].sha256);
    assert.match(bytes.toString(), /<svg\b[^>]*viewBox=/);
    assert.ok(!/<script|foreignObject|\bon\w+=|(?:href|src)=["']https?:/i.test(bytes.toString()), "Symbols must be inert local SVG geometry");
  }
  const skills = await (await get("/keahlian")).text();
  const rendered = skills.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  assert.ok(!rendered.includes("api.iconify.design"));
  assert.equal((rendered.match(/class="brand-object brand-object--large/g) || []).length, content.capabilities.editingSoftware.length);
  assert.ok(rendered.includes('role="tablist"') && rendered.includes('role="tabpanel"'));
  assert.ok(rendered.includes('id="capability-tab-programming"'));
  const home = await (await get("/")).text();
  const markup = home.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  assert.ok(markup.includes("badge-identity") && markup.includes("lanyard-clasp"));
  assert.ok(markup.includes("Lihat foto asli") && markup.includes("Jeda pergantian foto otomatis"));
  assert.ok(markup.includes(encodeURIComponent("/portraits/congress-cutout.png")));
  let optimizedPortraitBytes = 0;
  for (const [original, variant] of Object.entries(portraits)) {
    const item = evidence.find((item) => item.original === original);
    assert.ok(item);
    const originalBytes = fs.readFileSync(path.join(root, "public", original));
    const variantBytes = fs.readFileSync(path.join(root, "public", variant));
    assert.equal(hash(originalBytes), item.originalSha256, "Original photographs must remain intact");
    assert.equal(hash(variantBytes), item.variantSha256);
    assert.ok((await sharp(variantBytes).metadata()).hasAlpha);
    const response = await get(`/_next/image?url=${encodeURIComponent(variant)}&w=320&q=70`, { headers: { Accept: "image/webp" } });
    assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    assert.ok(metadata.hasAlpha, "Badge portrait optimization must preserve transparent edges");
    assert.equal(metadata.width, 320);
    assert.ok(bytes.length < variantBytes.length);
    optimizedPortraitBytes += bytes.length;
  }
  console.log(JSON.stringify({ status: "PASS", currentSkillsCovered: names.length, localSvgAssets: Object.keys(icons).length, servedSymbolsMatchSources: true, originalPortraitsPreserved: 3, optimizedTransparentPortraits: 3, optimizedPortraitBytes, independentOriginalPreview: true, browserInteractionVerified: false }));
}
verify().catch((error) => { console.error(error.message); process.exitCode = 1; });
