const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { createHash, randomBytes } = require("node:crypto");
const { chromium } = require("C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const source = path.resolve(root, process.argv[2] || ".next-monochrome-journey");
const destination = path.resolve(root, `.next-cms-proof-${Date.now()}-${randomBytes(3).toString("hex")}`);
const localFile = path.join(root, "backend/data/content.json");
const base = "http://localhost:3115";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

function insideApp(target) {
  const relative = path.relative(root, target);
  assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "Test paths must stay inside the app workspace");
  return relative;
}

function environmentEntries(raw) {
  return [...raw.matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/gm)].map((match) => {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    return [match[1], value];
  });
}

async function ready(child) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Isolated Next server exited before readiness");
    try {
      if ((await fetch(`${base}/api/auth/session`, { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch { /* The owned server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Isolated Next server did not become ready");
}

async function verify() {
  const original = await fs.readFile(localFile);
  const fingerprint = hash(original);
  let fake;
  let next;
  let browser;
  let blockedOutbound = 0;
  let postedRows = 0;
  let readRows = 0;
  let uploadMockCalls = 0;
  let startupLog = "";
  let result;
  try {
    insideApp(source);
    insideApp(destination);
    assert.match(path.basename(source), /^\.next(?:-|$)/, "Only an explicit Next build directory may be copied");
    await fs.access(path.join(source, "BUILD_ID"));
    await fs.cp(source, destination, { recursive: true, errorOnExist: true, force: false, filter: (entry) => !path.relative(source, entry).split(path.sep).includes("cache") });

    const envText = await fs.readFile(path.join(root, ".env.local"), "utf8").catch(() => "");
    const entries = environmentEntries(envText);
    const password = entries.find(([key]) => key === "ADMIN_PASSWORD")?.[1] || process.env.ADMIN_PASSWORD;
    assert.ok(password, "A configured local admin password is required; its value is never printed");
    const env = {};
    for (const key of ["SystemRoot", "SYSTEMROOT", "WINDIR", "PATH", "Path", "PATHEXT", "COMSPEC", "TEMP", "TMP", "USERPROFILE", "HOME", "APPDATA", "LOCALAPPDATA"]) if (process.env[key]) env[key] = process.env[key];
    // Block Next's dotenv loader from restoring any real service credentials.
    for (const [key] of entries) env[key] = "";
    Object.assign(env, {
      NEXT_DIST_DIR: path.basename(destination), NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "preview",
      ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: randomBytes(32).toString("hex"),
      SUPABASE_URL: "http://127.0.0.1:3114", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3114",
      SUPABASE_SECRET_KEY: "test-key", SUPABASE_SERVICE_ROLE_KEY: "test-key", SUPABASE_ANON_KEY: "test-key", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
      TIKTOK_ACCESS_TOKEN: "", BLOB_READ_WRITE_TOKEN: "", GITHUB_TOKEN: "", LINKEDIN_ACCESS_TOKEN: "", NEXT_TELEMETRY_DISABLED: "1",
    });
    const guard = path.join(destination, "cms-proof-network-guard.cjs");
    await fs.writeFile(guard, `
const http = require('node:http'), https = require('node:https');
function allow(input, options) {
  let url;
  try { url = typeof input === 'string' || input instanceof URL ? new URL(input) : input?.url ? new URL(input.url) : new URL((input?.protocol || options?.protocol || 'http:') + '//' + (input?.hostname || input?.host || options?.hostname || options?.host || 'localhost') + ':' + (input?.port || options?.port || '80')); } catch { url = null; }
  if (!url || !['localhost','127.0.0.1','[::1]'].includes(url.hostname) || !['3114','3115'].includes(url.port)) { process.stderr.write('CMS_PROOF_BLOCKED_OUTBOUND\\n'); throw new Error('External network is disabled in isolated CMS verification'); }
}
const fetchOriginal = globalThis.fetch;
globalThis.fetch = function(input, init) { allow(input); return fetchOriginal.call(this, input, init); };
for (const transport of [http,https]) for (const key of ['request','get']) { const original = transport[key]; transport[key] = function(...args) { allow(args[0],args[1]); return original.apply(this,args); }; }
`);
    env.NODE_OPTIONS = `--require="${guard.replace(/\\/g, "/")}"`;

    let fixture = JSON.parse(original);
    fixture.collaborations = [{ id: "cms-proof-existing", name: "Existing CMS fixture", logo: "/organization-logos/etiqa.png", url: "", status: "collaboration", appearance: "white" }];
    fake = http.createServer(async (request, response) => {
      response.setHeader("Content-Type", "application/json");
      if (new URL(request.url, "http://127.0.0.1:3114").pathname !== "/rest/v1/portfolio_data") { response.writeHead(404); response.end("{}"); return; }
      if (request.method === "GET") { readRows += 1; response.end(JSON.stringify({ data: fixture })); return; }
      if (request.method === "POST") {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        let row = JSON.parse(Buffer.concat(chunks).toString());
        if (Array.isArray(row)) row = row[0];
        assert.equal(row.id, 1);
        assert.ok(row.data && typeof row.data === "object");
        fixture = row.data;
        postedRows += 1;
        response.writeHead(201); response.end("null"); return;
      }
      response.writeHead(405); response.end("{}");
    });
    await new Promise((resolve, reject) => { fake.once("error", reject); fake.listen(3114, "127.0.0.1", resolve); });
    next = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "localhost", "--port", "3115"], { cwd: root, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    const captureLog = (chunk) => { startupLog = (startupLog + chunk.toString()).slice(-16000); };
    next.stderr.on("data", (chunk) => { captureLog(chunk); blockedOutbound += (chunk.toString().match(/CMS_PROOF_BLOCKED_OUTBOUND/g) || []).length; });
    next.stdout.on("data", captureLog);
    try { await ready(next); } catch (error) {
      let diagnostic = startupLog.split(/\r?\n/).filter((line) => /Error|Cannot find|Could not find|ENOENT|bad option|NODE_OPTIONS|EADDRINUSE|permission|invalid/i.test(line)).slice(0, 3).join(" ");
      for (const value of [...entries.map(([, value]) => value), ...Object.values(env)]) if (value && value.length >= 4) diagnostic = diagnostic.split(value).join("[redacted]");
      throw new Error(`${error.message}${diagnostic ? `: ${diagnostic}` : ""}`);
    }
    browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) { await route.abort(); return; }
      if (url.pathname === "/api/upload") {
        assert.equal(route.request().method(), "POST");
        assert.match(route.request().headers()["content-type"], /multipart\/form-data/);
        uploadMockCalls += 1;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "/organization-logos/etiqa.png" }) });
        return;
      }
      await route.continue();
    });
    await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
    await page.getByLabel("Password admin", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await page.getByRole("tab", { name: "Pendidikan", exact: true }).waitFor();
    await page.getByRole('tab', { name: 'Profil', exact: true }).click();
    await page.getByLabel('Link website Wasla Informatika', { exact: true }).fill('https://example.com/wasla-cms-proof');
    await page.getByRole("tab", { name: "Pendidikan", exact: true }).click();
    await page.getByRole("button", { name: "Tambah pendidikan", exact: true }).click();
    await page.getByLabel("Nama sekolah / kampus", { exact: true }).last().fill("CMS Proof Academy");
    await page.getByLabel("Jurusan / gelar", { exact: true }).last().fill("CMS Proof Journey 2027");
    await page.getByLabel("Periode pendidikan", { exact: true }).last().fill("Januari 2027 - Juli 2027");
    await page.getByLabel("Ringkasan pendidikan", { exact: true }).last().fill("Proof that a CMS education save updates the public journey.");
    await page.getByRole("tab", { name: "Kolaborasi", exact: true }).click();
    await page.getByRole("button", { name: "Tambah logo kolaborasi", exact: true }).click();
    await page.getByLabel("Nama merek / organisasi", { exact: true }).last().fill("CMS Proof Collaboration");
    await page.getByLabel("Tipe logo", { exact: true }).last().selectOption("collaboration");
    await page.getByLabel("Tampilan logo", { exact: true }).last().selectOption("white");
    await page.locator('input[type="file"]').last().setInputFiles({ name: "proof-logo.png", mimeType: "image/png", buffer: await fs.readFile(path.join(root, "public/organization-logos/etiqa.png")) });
    await page.getByText("Upload masuk ke form. Klik Simpan supaya tampil di halaman utama.", { exact: true }).waitFor();
    async function save() {
      const pending = page.waitForResponse((response) => response.url() === `${base}/api/content` && response.request().method() === "POST");
      await page.getByRole("button", { name: "Simpan", exact: true }).first().click();
      const response = await pending;
      assert.equal(response.status(), 200);
      assert.equal((await response.json()).success, true);
    }
    await save();
    assert.equal(uploadMockCalls, 1);
    const addedEducation = fixture.education.find((item) => item.degree === "CMS Proof Journey 2027");
    const addedLogo = fixture.collaborations.find((item) => item.name === "CMS Proof Collaboration");
    assert.ok(addedEducation && addedLogo, "Browser save must reach the in-memory Supabase upsert");
    assert.equal(addedLogo.logo, "/organization-logos/etiqa.png");
    assert.equal(addedLogo.status, "collaboration");
    const about = await (await context.request.get(`${base}/tentang`)).text();
    assert.ok(about.includes(`data-journey-id="education:${addedEducation.id}"`), "Saved education appears as a public SSR timeline entry");
    const projects = await (await context.request.get(`${base}/proyek`)).text();
    assert.ok(projects.includes('href="https://example.com/wasla-cms-proof"'), 'Saved Wasla link appears in public SSR');
    assert.ok(projects.includes('alt="Logo CMS Proof Collaboration"') && projects.includes('id="collaborations-heading"'), "Saved uploaded collaboration is rendered by the public project page");
    while (await page.getByRole("button", { name: /^Hapus (?:CMS Proof Collaboration|Existing CMS fixture)$/ }).count()) await page.getByRole("button", { name: /^Hapus (?:CMS Proof Collaboration|Existing CMS fixture)$/ }).first().click();
    await save();
    assert.deepEqual(fixture.collaborations, [], "Deleting all collaboration rows saves an explicit empty collection");
    const emptyProjects = await (await context.request.get(`${base}/proyek`)).text();
    assert.ok(!emptyProjects.includes('id="collaborations-heading"'), "An explicit empty collection removes the strip instead of restoring demo defaults");
    assert.equal(pageErrors.length, 0, "Admin interaction must not emit browser errors");
    assert.ok(readRows > 0 && postedRows === 2, "The fake backend must receive reads and both browser saves");
    result = { status: "PASS", isolatedFakeSupabase: true, browserAdminLogin: true, browserUploadUI: true, uploadStorageMocked: true, browserSaveRequests: postedRows, publicSSRJourneyUpdated: true, publicSSRUploadedCollaborationUpdated: true, explicitEmptyCollaborationsPreserved: true, realStorageWrites: 0, externalRequestsBlocked: blockedOutbound, originalCMSUnchanged: true };
  } finally {
    if (browser) await browser.close();
    if (next && next.exitCode === null) {
      next.kill();
      await new Promise((resolve) => { next.once("exit", resolve); setTimeout(resolve, 5000).unref(); });
    }
    if (fake?.listening) { fake.closeAllConnections(); await new Promise((resolve) => fake.close(resolve)); }
    assert.equal(hash(await fs.readFile(localFile)), fingerprint, "The original CMS JSON must remain byte-identical, including on failure");
  }
  console.log(JSON.stringify(result, null, 2));
}

verify().catch((error) => { console.error(error.message); process.exitCode = 1; });
