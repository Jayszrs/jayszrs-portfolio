const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const base = process.argv[2] || 'http://localhost:3109';
const output = path.resolve(__dirname, '../.impeccable/review/services-seo');

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], canonicals = [], layouts = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/tentang', '/pendidikan', '/keahlian', '/pengalaman', '/proyek', '/pencapaian', '/kontak']) {
      const response = await page.request.get(`${base}${route}`, { headers: { 'User-Agent': 'Googlebot' } });
      assert.equal(response.status(), 200);
      const html = await response.text();
      const head = html.split('</head>')[0];
      assert.ok(head.includes('name="description"') && head.includes('Jaelani Surya Saputra'));
      assert.ok(head.includes('rel="canonical"'), 'Canonical must be in initial HTML');
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      assert.equal(new URL(canonical).pathname, route, `${route} has its own canonical`);
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical);
      assert.equal(await page.locator('.site-footer').count(), 1);
      assert.equal(await page.locator('.footer-wordmark').textContent(), 'Jay Szrs');
      assert.equal(await page.locator('.footer-wordmark').getAttribute('aria-hidden'), 'true');
      canonicals.push(canonical);
      if (['/', '/proyek'].includes(route)) {
        const rendered = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
        assert.ok(rendered.includes('id="jasa-website"') && rendered.includes('Wasla Informatika'), 'Service content must be visible without client JS');
        const href = await page.locator('#jasa-website a').getAttribute('href');
        assert.ok(href === '/kontak' || /^https?:\/\//.test(href));
      }
      if (route === '/') {
        const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
        const graph = blocks.flatMap(text => JSON.parse(text));
        const person = graph.find(node => node['@type'] === 'Person');
        assert.equal(person.name, 'Jaelani Surya Saputra');
        assert.ok(person.alternateName.includes('Jay Szrs') && person.alternateName.includes('Jaelani'));
        assert.equal(new URL(person.image).hostname, new URL(canonical).hostname);
        assert.ok(graph.some(node => node['@type'] === 'Service' && node.provider['@id'] === person['@id']));
      }
    }
    assert.equal(new Set(canonicals).size, 8);
    await page.goto(`${base}/admin`);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text();
    assert.equal((sitemap.match(/<loc>/g) || []).length, 8);
    assert.ok(!sitemap.includes('/admin') && !sitemap.includes('<lastmod>'));
    const png = Buffer.from(await (await page.request.get(`${base}/opengraph-image`)).body());
    const meta = await sharp(png).metadata();
    assert.equal(meta.width, 1200); assert.equal(meta.height, 630);
    await fs.writeFile(path.join(output, 'opengraph.png'), png);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['/', '/proyek']) {
        await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
        await page.locator('#jasa-website').scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
        const card = await page.locator('.web-services-card').boundingBox();
        assert.ok(card.x >= 0 && card.x + card.width <= width + 1);
        await page.screenshot({ path: path.join(output, `service-${route === '/' ? 'home' : 'projects'}-${width}.png`) });
        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const wordmark = await page.locator('.footer-wordmark').boundingBox();
        assert.ok(wordmark.x >= 0 && wordmark.x + wordmark.width <= width + 1, 'Large footer lettering fits');
        await page.screenshot({ path: path.join(output, `footer-${width}.png`) });
        layouts.push(`${route}:${width}`);
      }
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'PASS', canonicalRoutes: canonicals.length, crawlerSSR: true, serviceSchema: true, realPersonImage: true, adminNoindex: true, ogImage: [meta.width,meta.height], layouts, footerCount: 1, pageErrors: errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
