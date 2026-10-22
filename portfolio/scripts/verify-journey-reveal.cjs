const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const base = process.argv[2] || 'http://localhost:3109';
const output = path.resolve(__dirname, '../.impeccable/review/journey-reveal');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], results = [];
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/tentang`, { waitUntil: 'networkidle' });
      await page.locator('.journey[data-reveal-ready="true"]').waitFor();
      const rows = page.locator('[data-journey-id]'), first = rows.first(), last = rows.last();
      assert.ok(await rows.count() > 2);
      assert.equal(await last.evaluate(node => getComputedStyle(node).opacity), '0', 'Future journey entries start hidden');
      const top = await first.evaluate(node => node.getBoundingClientRect().top + scrollY);
      await page.evaluate(top => scrollTo({ top: Math.max(0, top - innerHeight * .99), behavior: 'instant' }), top);
      await page.waitForTimeout(600);
      assert.equal(await first.evaluate(node => getComputedStyle(node).opacity), '0', 'Entry stays hidden below its viewport trigger');
      await page.mouse.move(5, 500); await page.mouse.wheel(0, 320);
      await page.waitForFunction(node => node.dataset.revealed === 'true', await first.elementHandle());
      await page.waitForTimeout(650);
      assert.equal(await first.evaluate(node => getComputedStyle(node).opacity), '1', 'Scrolling into view reveals the first entry');
      assert.equal(await last.evaluate(node => getComputedStyle(node).opacity), '0', 'Revealing one entry does not reveal every entry');
      await page.screenshot({ path: path.join(output, `revealed-first-${width}.png`) });
      const second = rows.nth(1);
      await second.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForFunction(node => node.dataset.revealed === 'true', await second.elementHandle());
      await page.waitForTimeout(650);
      assert.equal(await second.evaluate(node => getComputedStyle(node).opacity), '1');
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      assert.equal(await first.getAttribute('data-revealed'), 'true', 'Revealed entries remain revealed when scrolling back');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.ok(await rows.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1' && getComputedStyle(node).transform === 'none')), 'Reduced motion shows everything without an entrance');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.emulateMedia({ media: 'print' });
      assert.ok(await rows.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1')), 'Printing includes every entry');
      results.push({ width, revealOnScroll: true, futureEntriesHidden: true, revealOnce: true, reducedMotion: true, print: true });
      await page.close();
    }
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto(`${base}/tentang`);
    assert.ok(await page.locator('[data-journey-id]').evaluateAll(nodes => nodes.length > 2 && nodes.every(node => getComputedStyle(node).opacity === '1')), 'Server HTML remains readable without JavaScript');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'PASS', results, noJavaScriptReadable: true, pageErrors: errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
