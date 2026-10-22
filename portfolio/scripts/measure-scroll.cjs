const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const label = process.argv[2] || 'review';
  const cpuSlowdown = Number(process.env.SCROLL_CPU_RATE || 4);
  const dir = path.resolve('.impeccable/review/wealth');
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { if (window === window.top) localStorage.setItem('portfolio-theme', 'dark'); });
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3109', { waitUntil: 'networkidle' });
    await page.locator('.lanyard-stage[data-physics]').waitFor();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuSlowdown });
    async function measure(selector) {
      await page.evaluate(() => {
        window.scrollSamples = []; window.sampleActive = true;
        let last = performance.now();
        const tick = time => { window.scrollSamples.push(time - last); last = time; if (window.sampleActive) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
      const before = await cdp.send('Performance.getMetrics');
      for (let i = 0; i < 18; i++) {
        await page.mouse.wheel(0, i < 9 ? 155 : -155);
        await page.waitForTimeout(35);
      }
      await page.waitForTimeout(300);
      const after = await cdp.send('Performance.getMetrics');
      return page.evaluate(({ before, after, selector }) => {
        window.sampleActive = false;
        const samples = window.scrollSamples.slice(2).sort((a, b) => a - b);
        const metrics = Object.fromEntries(after.metrics.map(m => [m.name, m.value - (before.metrics.find(b => b.name === m.name)?.value || 0)]));
        const node = document.querySelector(selector);
        return { frames: samples.length, p95ms: samples[Math.floor(samples.length * .95)], over33ms: samples.filter(n => n > 33.5).length, layoutMs: metrics.LayoutDuration * 1000, styleMs: metrics.RecalcStyleDuration * 1000, taskMs: metrics.TaskDuration * 1000, backdrop: getComputedStyle(node).backdropFilter };
      }, { before, after, selector });
    }
    await page.mouse.move(300, 500);
    const pageScroll = await measure('.site-nav');
    await page.waitForTimeout(600);
    const settledPageScroll = await measure('.site-nav');
    await page.locator('#pendidikan button').filter({ hasText: 'SMA' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor();
    await page.waitForTimeout(1200);
    const box = await dialog.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const modalScroll = await measure('.glass-scrim');
    await dialog.evaluate(e => e.scrollTo({ top: e.scrollHeight, behavior: 'instant' }));
    await page.screenshot({ path: path.join(dir, `${label}-modal.png`) });
    const result = { label, viewport: '1440x1000', cpuSlowdown, pageScroll, settledPageScroll, modalScroll, errors };
    await fs.writeFile(path.join(dir, `${label}-scroll.json`), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
