const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const { buildJourney } = require('../frontend/lib/journey.cjs');
const base = process.argv[2] || 'http://localhost:3109';
const output = path.resolve(__dirname, '../.impeccable/review/monochrome-journey');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], results = [];
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/tentang`, { waitUntil: 'networkidle' });
      const json = await (await page.request.get(`${base}/api/content`)).json();
      const content = json.content || json;
      const expected = buildJourney(content.education, content.experience).map(row => row.id);
      const observed = await page.locator('[data-journey-id]').evaluateAll(nodes => nodes.map(node => node.dataset.journeyId));
      assert.deepEqual(observed, expected, 'Public journey uses current CMS records in chronological order');
      await page.locator('#journey-heading').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const before = await page.locator('.journey').evaluate(node => node.style.getPropertyValue('--journey-progress'));
      await page.mouse.move(5, 500);
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(300);
      const after = await page.locator('.journey').evaluate(node => node.style.getPropertyValue('--journey-progress'));
      assert.ok(+after > +before, 'Scroll advances journey progress');
      const offsets = await page.locator('[data-journey-card]').evaluateAll(nodes => nodes.map(node => parseFloat(node.style.getPropertyValue('--journey-offset'))));
      assert.ok(offsets.some(value => Math.abs(value) > 0) && offsets.every(value => Math.abs(value) <= 12), 'Parallax stays within its small bound');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(output, `journey-${width}.png`) });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      assert.ok(await page.locator('[data-journey-card]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).transform === 'none')));

      await page.goto(`${base}/proyek`, { waitUntil: 'networkidle' });
      const section = page.locator('.collaborations'), track = section.locator('.collaboration-track');
      await track.scrollIntoViewIfNeeded();
      await page.mouse.move(5, 5);
      await page.waitForTimeout(400);
      assert.equal(await section.locator('button').count(), 0);
      assert.equal(await section.locator('.collaboration-group:not([aria-hidden]) img').count(), 6);
      assert.equal(await section.locator('.collaboration-group:not([aria-hidden]) .collaboration-example').count(), 6);
      assert.equal(await track.evaluate(node => getComputedStyle(node).scrollbarWidth), 'none');
      const box = await track.boundingBox(), x = box.x + box.width * .65, y = box.y + box.height / 2;
      const initial = await track.evaluate(node => node.scrollLeft);
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x - 180, y, { steps: 14 }); await page.mouse.up();
      const dragged = await track.evaluate(node => node.scrollLeft);
      assert.ok(dragged > initial + 140, 'Real mouse drag scrolls the logo strip');
      await page.mouse.wheel(0, 180); await page.waitForTimeout(100);
      const wheeled = await track.evaluate(node => node.scrollLeft);
      assert.ok(wheeled > dragged + 100, 'Ordinary mouse wheel scrolls horizontally');
      await track.focus(); await track.press('ArrowRight');
      assert.ok(await track.evaluate(node => node.scrollLeft) > wheeled + 150, 'Keyboard arrow works');
      await track.evaluate(node => node.blur());
      await page.mouse.move(5, 5);
      await page.waitForTimeout(1900);
      const reduced = await track.evaluate(node => node.scrollLeft);
      await page.waitForTimeout(300);
      assert.equal(await track.evaluate(node => node.scrollLeft), reduced, 'Reduced motion stops autoplay');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForTimeout(150);
      const playing = await track.evaluate(node => node.scrollLeft);
      await page.waitForTimeout(500);
      assert.ok(Math.abs(await track.evaluate(node => node.scrollLeft) - playing) > 5, 'Visible idle strip advances');
      await page.mouse.move(x, y);
      await page.waitForTimeout(100);
      const hover = await track.evaluate(node => node.scrollLeft);
      await page.waitForTimeout(250);
      assert.equal(await track.evaluate(node => node.scrollLeft), hover, 'Hover pauses strip');
      await page.screenshot({ path: path.join(output, `collaborations-${width}.png`) });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      results.push({ width, journeyEntries: observed.length, mouseDrag: true, mouseWheel: true, keyboard: true, reducedMotion: true, hoverPause: true, labeledSampleLogos: 6 });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.lanyard-stage[data-physics]').waitFor();
    assert.equal(await page.locator('.lanyard-rope image, .lanyard-rope text').count(), 0, 'No strap branding');
    await page.getByRole('tab', { name: 'TikTok', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-count-source="public-snapshot"]').length === 3);
    assert.deepEqual(await page.locator('[data-view-count]').evaluateAll(nodes => nodes.map(node => +node.dataset.viewCount)), [4700000, 1200000, 1100000]);
    assert.equal(await page.locator('[data-view-count] time').count(), 3);
    await page.locator('[data-view-count]').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(output, 'tiktok-view-counts.png') });
    for (const [language, journey, collaboration, sample] of [
      ['ja', 'これまでの歩み。', 'コラボレーションの可能性。', 'サンプル'],
      ['fr', 'Mon parcours.', 'Place aux collaborations.', 'Exemple'],
      ['en', 'My journey.', 'Room for collaboration.', 'Sample'],
    ]) {
      await page.evaluate(value => localStorage.setItem('portfolio-language', value), language);
      await page.goto(`${base}/tentang`);
      await page.waitForFunction(text => document.querySelector('#journey-heading')?.textContent === text, journey);
      await page.goto(`${base}/proyek`);
      await page.waitForFunction(text => document.querySelector('#collaborations-heading')?.textContent === text, collaboration);
      assert.equal(await page.locator('.collaboration-group:not([aria-hidden]) .collaboration-example').first().textContent(), sample);
      assert.equal(await page.locator('.collaboration-group:not([aria-hidden]) .collaboration-caption').first().textContent(), 'NVIDIA');
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'PASS', results, exactDatedTikTokCounts: true, strapBrandRemoved: true, pageErrors: errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
