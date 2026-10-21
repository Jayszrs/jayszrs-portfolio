const assert = require("node:assert/strict");
const fs = require("node:fs");
const { createHash } = require("node:crypto");
const base = process.argv[2] || "http://127.0.0.1:3109";
try { process.loadEnvFile(".env.local"); } catch { /* CI can provide environment variables directly. */ }
const request = (path, options = {}) => fetch(new URL(path, base), { ...options, signal: AbortSignal.timeout(45000) });
async function main() {
  const routes = ["/", "/tentang", "/pendidikan", "/keahlian", "/pengalaman", "/proyek", "/pencapaian", "/kontak", "/admin"];
  for (const path of routes) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(!html.includes('id="__next_error__"'), path);
    for (const src of new Set([...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1]))) assert.equal((await request(src)).status, 200, `Chunk in ${path}`);
  }
  const before = await (await request("/api/content")).json();
  const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  for (const file of ["ppji-symbol.png", "kik-symbol.png", "akademi-crypto-symbol.svg"]) {
    const response = await request(`/organization-logos/${file}`);
    assert.equal(response.status, 200, file);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.compare(fs.readFileSync(`public/organization-logos/${file}`)), 0, "Original display variant delivery");
  }
  for (const file of ["ppji-symbol.png", "kik-symbol.png"]) {
    const response = await request(`/_next/image?url=${encodeURIComponent(`/organization-logos/${file}`)}&w=256&q=70`, { headers: { Accept: "image/webp" } });
    assert.equal(response.status, 200, `Next 16 optimized ${file}`);
    assert.match(response.headers.get("content-type"), /^image\//);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.ok(bytes.length < fs.statSync(`public/organization-logos/${file}`).size, "Card delivery should be smaller than its full preview source");
  }
  const forged = await (await request("/api/auth/session", { headers: { Cookie: "jayszrs_admin=1" } })).json();
  assert.equal(forged.authenticated, false);
  for (const path of ["/api/content", "/api/upload"]) {
    const response = await request(path, { method: "POST", headers: { "Content-Type": "application/json", Cookie: "jayszrs_admin=1" }, body: "{}" });
    assert.equal(response.status, 401, "Invalid sessions must be rejected before any storage write");
  }
  let loginVerified = false;
  if (process.env.ADMIN_PASSWORD) {
    const login = await request("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const session = await (await request("/api/auth/session", { headers: { Cookie: cookie } })).json();
    assert.equal(session.authenticated, true);
    loginVerified = true;
  }
  const after = await (await request("/api/content")).json();
  assert.equal(fingerprint(before), fingerprint(after), "Read-only verification must preserve all CMS content");
  console.log(JSON.stringify({ status: "PASS", routes: routes.length, referencedJavaScriptChunks: "200", transparentLogoVariants: 3, optimizedRasterLogos: 2, forgedSessionRejected: true, unauthorizedWritesRejected: true, configuredLoginVerified: loginVerified, cmsUnchanged: true, storageWrites: 0, browserInteractionVerified: false }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
