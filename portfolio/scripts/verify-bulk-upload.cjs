const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { randomBytes, createHash } = require('node:crypto');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');

const root = path.resolve(__dirname, '..');
const base = 'http://localhost:3135';
const review = path.join(root, '.impeccable/review/bulk-upload');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=', 'base64');
const image = (name) => ({ name, mimeType: 'image/png', buffer: png });
const pdf = { name: 'proof.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') };
const fingerprint = (data) => createHash('sha256').update(data).digest('hex');

async function verify() {
  const localPath = path.join(root, 'backend/data/content.json');
  const original = await fs.readFile(localPath);
  let fixture = JSON.parse(original);
  let server, next, browser;
  let signed = 0, transfers = 0, saves = 0;
  let rejectTransfer = 2;
  const errors = [];
  await fs.mkdir(review, { recursive: true });
  const guard = path.join(review, 'network-guard.cjs');
  await fs.writeFile(guard, `
const http = require('node:http'), https = require('node:https');
function allow(input) {
  const url = typeof input === 'string' || input instanceof URL ? new URL(input) : new URL(input.url || ('http://' + (input.hostname || input.host || 'localhost') + ':' + (input.port || '80')));
  if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname) || !['3134','3135'].includes(url.port)) throw new Error('External network disabled during bulk-upload verification');
}
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => { allow(input); return originalFetch(input, init); };
for (const transport of [http, https]) for (const key of ['request', 'get']) {
  const original = transport[key]; transport[key] = function(...args) { allow(args[0]); return original.apply(this, args); };
}
`);
  const env = { ...process.env };
  for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    const raw = await fs.readFile(path.join(root, file), 'utf8').catch(() => '');
    for (const match of raw.matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)) env[match[1]] = '';
  }
  Object.assign(env, {
    NEXT_DIST_DIR: process.argv[2] || '.next-bulk-upload', NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
    ADMIN_PASSWORD: randomBytes(24).toString('hex'), ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'),
    SUPABASE_URL: 'http://127.0.0.1:3134', SUPABASE_SECRET_KEY: 'isolated-test-key',
    NODE_OPTIONS: `--require="${guard.replace(/\\/g, '/')}"`,
  });
  try {
    server = http.createServer(async (request, response) => {
      response.setHeader('Content-Type', 'application/json');
      if (!request.url.startsWith('/rest/v1/portfolio_data')) { response.writeHead(404); response.end('{}'); return; }
      if (request.method === 'GET') { response.end(JSON.stringify({ data: fixture })); return; }
      if (request.method === 'POST') {
        const chunks = []; for await (const chunk of request) chunks.push(chunk);
        let row = JSON.parse(Buffer.concat(chunks).toString()); if (Array.isArray(row)) row = row[0];
        fixture = row.data; saves += 1; response.writeHead(201); response.end('null'); return;
      }
      response.writeHead(405); response.end('{}');
    });
    await new Promise((resolve) => server.listen(3134, '127.0.0.1', resolve));
    next = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--hostname', 'localhost', '--port', '3135'], { cwd: root, env, windowsHide: true, stdio: 'ignore' });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch(`${base}/api/auth/session`)).ok) { ready = true; break; } } catch {}
      if (next.exitCode !== null) throw new Error('Isolated Next server exited');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.ok(ready, 'Isolated server starts');
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === '/api/upload') {
        const body = route.request().postDataJSON();
        const type = JSON.parse(body.payload.clientPayload).type;
        const index = ++signed;
        await new Promise((resolve) => setTimeout(resolve, 200));
        return route.fulfill({ json: { provider: 'supabase', uploadUrl: `${base}/bulk-transfer/${index}`, url: `${base}/bulk-file/${index}.${type === 'application/pdf' ? 'pdf' : 'png'}` } });
      }
      if (url.pathname.startsWith('/bulk-transfer/')) {
        transfers += 1;
        const rejected = Number(url.pathname.split('/').pop()) === rejectTransfer;
        return route.fulfill({ status: rejected ? 500 : 200, json: {} });
      }
      if (url.pathname.startsWith('/bulk-file/')) return route.fulfill({ contentType: url.pathname.endsWith('.pdf') ? 'application/pdf' : 'image/png', body: url.pathname.endsWith('.pdf') ? pdf.buffer : png });
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    assert.equal((await context.request.post(`${base}/api/auth/login`, { data: { password: env.ADMIN_PASSWORD } })).status(), 200);
    await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
    const tab = (name) => page.getByRole('tab', { name, exact: true });
    const bulk = () => page.getByLabel('Upload banyak file', { exact: true }).first();
    const urls = async () => bulk().locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').locator('input:not([type=file])').evaluateAll((inputs) => inputs.map((input) => input.value).filter(Boolean));
    async function save() {
      const response = page.waitForResponse((response) => response.url() === `${base}/api/content` && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Simpan', exact: true }).first().click();
      assert.equal((await response).status(), 200);
    }
    await tab('Pengalaman').click();
    const legacy = await urls();
    await bulk().setInputFiles([image('photo-a.png'), pdf, image('photo-b.png'), { name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) }, { name: 'unsupported.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') }]);
    assert.ok(await tab('Pendidikan').isDisabled(), 'Tab switching is locked during upload');
    assert.ok(await page.getByRole('button', { name: 'Simpan', exact: true }).first().isDisabled(), 'Saving is locked during upload');
    await page.getByRole('button', { name: 'Coba lagi 3 file gagal', exact: true }).waitFor();
    assert.equal(signed, 3, 'Invalid and empty files never reach signing');
    const partial = await urls(); assert.equal(partial.length, legacy.length + 2);
    assert.deepEqual(partial.slice(0, legacy.length), legacy, 'Existing URLs are preserved');
    await page.getByRole('button', { name: 'Coba lagi 3 file gagal', exact: true }).click();
    await page.getByRole('button', { name: 'Coba lagi 2 file gagal', exact: true }).waitFor();
    const retried = await urls(); assert.equal(retried.length, legacy.length + 3);
    assert.equal(new Set(retried).size, retried.length, 'Retry never duplicates successful files');
    await page.setViewportSize({ width: 390, height: 844 });
    await bulk().locator('..').screenshot({ path: path.join(review, 'mobile-upload.png') });
    await page.screenshot({ path: path.join(review, 'mobile-admin.png') });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile admin has no horizontal overflow');
    await save();
    const experience = fixture.experience[0];
    assert.deepEqual(experience.documentationFiles, retried);
    assert.equal(experience.documentationFile, retried[0], 'Legacy primary file remains compatible');
    await page.reload({ waitUntil: 'networkidle' }); await tab('Pengalaman').click();
    assert.deepEqual(await urls(), retried, 'All saved attachments survive reload');
    const finalDocument = bulk().locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').locator(':scope > div.space-y-3 > div').last();
    await finalDocument.getByRole('button', { name: 'Hapus', exact: true }).first().click();
    assert.equal((await urls()).length, retried.length - 1);
    await save();
    assert.equal(fixture.experience[0].documentationFiles.length, retried.length - 1, 'Removing one attachment persists');
    rejectTransfer = -1;
    for (const name of ['Pendidikan', 'Galeri', 'Selected Design', 'Pencapaian', 'Sertifikat']) {
      await tab(name).click();
      const input = page.getByLabel('Upload banyak file', { exact: true }).last();
      const before = signed;
      await input.setInputFiles([pdf, image(`proof-${name}.png`)]);
      await page.getByText('2 file masuk ke form. Klik Simpan untuk menampilkan perubahan.', { exact: true }).last().waitFor();
      assert.equal(signed, before + 2, `${name} accepts mixed PDF/image batches`);
      await save();
    }
    await tab('Profil').click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload banyak gambar', exact: true }).first().focus();
    await page.keyboard.press('Enter');
    await (await chooser).setFiles([image('hero-a.png'), image('hero-b.png'), pdf]);
    await page.getByRole('button', { name: 'Coba lagi 1 file gagal', exact: true }).waitFor();
    assert.ok((await page.getByRole('alert').allTextContents()).some((message) => message.includes('Pilih gambar')), 'Image-only batches reject PDFs');
    await save();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(review, 'desktop-admin.png') });
    for (const [url, heading, title] of [['/pengalaman', 'Dokumentasi pengalaman', fixture.experience[0].title], ['/pendidikan', 'Dokumentasi pendidikan', fixture.education.at(-1).institution], ['/proyek', 'Dokumentasi proyek', fixture.gallery.at(-1).title], ['/proyek', 'File desain', fixture.selectedDesigns.at(-1).title]]) {
      await page.goto(`${base}${url}`, { waitUntil: 'networkidle' });
      await page.getByRole('button').filter({ hasText: title }).first().click();
      await page.getByRole('button', { name: `${heading} 1`, exact: true }).last().waitFor();
      const count = await page.getByRole('button', { name: new RegExp(`^${heading} \\d+$`) }).count();
      assert.ok(count >= 2, `${url} exposes all saved attachments`);
      await page.getByRole('button', { name: `${heading} 2`, exact: true }).last().click();
      await page.getByRole('dialog', { name: `${heading} 2`, exact: true }).waitFor();
      console.log(`PASS ${url}: ${heading} attachments and selected preview`);
    }
    for (const item of [fixture.achievements.at(-1), fixture.certificates.at(-1)]) {
      await page.goto(`${base}/pencapaian`, { waitUntil: 'networkidle' });
      await page.getByRole('button').filter({ hasText: item.title }).first().click();
      const attachmentTitle = `Lampiran ${item.title} 2`;
      await page.getByRole('dialog').getByRole('button').filter({ hasText: attachmentTitle }).first().click();
      await page.getByRole('dialog', { name: attachmentTitle, exact: true }).waitFor();
    }
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log(JSON.stringify({ status: 'PASS', signed, transfers, saves, mixedBatches: true, retryWithoutDuplicates: true, preservedLegacyFiles: true, reloadAndDelete: true, imageOnlyValidation: true, mobileNoOverflow: true, publicPreviews: true, realStorageWrites: 0, originalContentUnchanged: true }, null, 2));
  } finally {
    if (browser) await browser.close();
    if (next && next.exitCode === null) { next.kill(); await new Promise((resolve) => { next.once('exit', resolve); setTimeout(resolve, 5000).unref(); }); }
    if (server?.listening) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
    assert.equal(fingerprint(await fs.readFile(localPath)), fingerprint(original), 'Original CMS JSON remains byte-identical');
  }
}

verify().catch((error) => { console.error(error.stack); process.exitCode = 1; });
