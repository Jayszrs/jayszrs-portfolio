const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const base = process.env.TEST_BASE_URL || 'http://localhost:3109';
  const output = path.resolve('.impeccable/review/wealth');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: 'light' });
      const errors = [];
      const linkedinApiRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (request.url().includes('/api/social/linkedin')) linkedinApiRequests.push(request.url()); });
      await page.addInitScript(() => { if (window === window.top) localStorage.setItem('portfolio-theme', 'light'); });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('.lanyard-stage[data-physics]').waitFor();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'dark');
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(5, 5, 6)');
      assert.equal(await page.getByRole('button', { name: /tema/i }).count(), 0);
      assert.equal(await page.locator('[aria-label="Profil sosial"] a').first().getAttribute('aria-label'), 'Buka LinkedIn');
      if (width === 1440) {
        await page.getByRole('button', { name: 'Lihat CV', exact: true }).click();
        await page.locator('[role="dialog"]').waitFor();
        await page.waitForTimeout(250);
        const snapshot = () => page.locator('.lanyard-stage').evaluate(stage => ({ card: stage.querySelector('.lanyard-badge').style.transform, source: stage.querySelector('.lanyard-badge').dataset.sourcePhoto, typing: document.querySelector('#beranda .items-baseline')?.textContent }));
        const before = await snapshot();
        await page.waitForTimeout(3300);
        assert.deepEqual(await snapshot(), before, 'Background physics, photo cycle and typing must stop while a dialog is open');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('html').getAttribute('data-dialog-open'), null);
      }
      await page.mouse.move(5, 5);
      await page.screenshot({ path: path.join(output, `dark-${width}-hero.png`) });
      await page.locator('#sosial-media').scrollIntoViewIfNeeded();
      await page.getByRole('tab', { name: 'LinkedIn', exact: true }).waitFor();
      await page.getByText('Profil dan aktivitas profesional saya di LinkedIn.', { exact: true }).waitFor();
      assert.equal(await page.getByRole('tab').first().textContent(), 'LinkedIn');
      assert.equal(await page.getByRole('tab', { name: 'LinkedIn', exact: true }).getAttribute('aria-selected'), 'true');
      assert.equal(await page.getByRole('link', { name: 'Lihat aktivitas LinkedIn', exact: true }).getAttribute('href'), 'https://www.linkedin.com/in/jayszrs/recent-activity/all/');
      assert.equal(await page.getByText('Repost belum tersinkron', { exact: false }).count(), 0);
      await page.screenshot({ path: path.join(output, `dark-${width}-linkedin.png`) });
      await page.getByRole('tab', { name: 'GitHub', exact: true }).click();
      await page.getByText('README.md', { exact: true }).waitFor();
      await page.getByRole('tab', { name: 'Instagram', exact: true }).click();
      await page.locator('.instagram-photo-grid').waitFor();
      await page.screenshot({ path: path.join(output, `dark-${width}-instagram.png`) });
      await page.getByRole('tab', { name: 'LinkedIn', exact: true }).focus();
      await page.keyboard.press('End');
      assert.equal(await page.getByRole('tab', { name: 'TikTok', exact: true }).getAttribute('aria-selected'), 'true');
      await page.keyboard.press('Home');
      assert.equal(await page.getByRole('tab', { name: 'LinkedIn', exact: true }).getAttribute('aria-selected'), 'true');
      if (width === 390) {
        await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
        await page.getByRole('link', { name: 'Pendidikan', exact: true }).click();
        await page.waitForURL(`${base}/pendidikan`);
      }
      await page.locator('#pendidikan button').filter({ hasText: 'SMA' }).first().click();
      const dialog = page.locator('[role="dialog"]');
      await dialog.waitFor();
      assert.equal(await page.locator('.glass-scrim').evaluate(e => getComputedStyle(e).backdropFilter), 'none');
      await dialog.evaluate(e => e.scrollTo({ top: e.scrollHeight, behavior: 'instant' }));
      await dialog.locator('button.group').first().click();
      assert.equal(await page.locator('[role="dialog"]').count(), 2);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[role="dialog"]').count(), 1);
      assert.equal(await page.locator('html').getAttribute('data-dialog-open'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[role="dialog"]').count(), 0);
      assert.equal(await page.locator('html').getAttribute('data-dialog-open'), null);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      if (width === 390) {
        await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
        await page.getByRole('button', { name: 'Tutup menu', exact: true }).waitFor();
        await page.screenshot({ path: path.join(output, 'dark-mobile-navigation.png') });
        await page.keyboard.press('Escape');
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.screenshot({ path: path.join(output, `dark-${width}-admin.png`) });
      assert.deepEqual(errors, []);
      assert.deepEqual(linkedinApiRequests, [], 'LinkedIn profile must not request a removed automatic feed');
      console.log(`PASS ${width}px: dark despite saved light/system light, static LinkedIn profile/activity links with zero feed API requests, GitHub/Instagram/tab keys, nested media dialogs, native scroll and admin dark.`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
