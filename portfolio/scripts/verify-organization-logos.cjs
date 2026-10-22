const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const { resolveLogoAppearance } = require('../frontend/lib/logo-appearance.cjs');
const base = process.argv[2] || 'http://localhost:3109';
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.impeccable/review/logo-colors');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pixels = png => sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });

(async () => {
  fs.mkdirSync(output, { recursive: true });
  for (const file of ['etiqa.png', 'fazmastone.png', 'ppji-symbol.png', 'akademi-crypto-symbol.svg']) {
    const relative = `portfolio/public/organization-logos/${file}`;
    assert.equal(hash(fs.readFileSync(path.join(root, 'public/organization-logos', file))), hash(execFileSync('git', ['show', `HEAD:${relative}`], { cwd: root })));
  }
  assert.equal(resolveLogoAppearance('/organization-logos/etiqa.png'), 'lighten-dark');
  assert.equal(resolveLogoAppearance('/organization-logos/akademi-crypto-symbol.svg'), 'original');
  assert.equal(resolveLogoAppearance('/unknown-new-upload.png'), 'original', 'Unknown CMS uploads retain original colors');
  assert.equal(resolveLogoAppearance('/organization-logos/etiqa.png', 'original'), 'original');
  assert.equal(resolveLogoAppearance('/custom-logo.svg', 'white'), 'white', 'Explicit CMS appearance still works');
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], evidence = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/pengalaman`, { waitUntil: 'networkidle' });
    const img = page.getByAltText('Asuransi Etiqa Internasional Indonesia', { exact: true }).first();
    const mark = img.locator('xpath=ancestor::*[@data-organization-logo][1]');
    await mark.scrollIntoViewIfNeeded();
    await img.evaluate(node => node.decode());
    assert.equal(await mark.getAttribute('data-logo-appearance'), 'lighten-dark');
    const rendered = await mark.screenshot({ path: path.join(output, 'etiqa-white-yellow.png') });
    const originalFilter = await img.evaluate(node => { const value = node.style.filter; node.style.filter = 'none'; return value; });
    const original = await mark.screenshot();
    await img.evaluate((node, value) => { node.style.filter = value; }, originalFilter);
    const before = await pixels(original), after = await pixels(rendered);
    let yellow = 0, yellowDelta = 0, whiteBefore = 0, whiteAfter = 0;
    for (let i = 0; i < before.data.length; i += before.info.channels) {
      const a = before.data, b = after.data;
      if (a[i] > 170 && a[i+1] > 120 && a[i+2] < 90) {
        yellow++; yellowDelta += Math.abs(a[i]-b[i]) + Math.abs(a[i+1]-b[i+1]) + Math.abs(a[i+2]-b[i+2]);
      }
      if (a[i] > 220 && a[i+1] > 220 && a[i+2] > 220) whiteBefore++;
      if (b[i] > 220 && b[i+1] > 220 && b[i+2] > 220) whiteAfter++;
    }
    assert.ok(yellow > 100, 'Original Etiqa yellow smile remains visible');
    assert.ok(yellowDelta / yellow < 3, 'Yellow RGB values remain visually unchanged');
    assert.ok(whiteAfter - whiteBefore > 500, 'Only dark wordmark gains white ink');
    evidence.push({ name: 'Etiqa', yellowPixels: yellow, yellowMeanDelta: yellowDelta/yellow, newWhitePixels: whiteAfter-whiteBefore });

    for (const [name, color] of [['Akademi Crypto', 'purple'], ['Perkumpulan Penyelenggara Jasa Boga Indonesia', 'blue']]) {
      const image = page.getByAltText(name, { exact: true }).first();
      const logo = image.locator('xpath=ancestor::*[@data-organization-logo][1]');
      await logo.scrollIntoViewIfNeeded(); await image.evaluate(node => node.decode());
      assert.equal(await logo.getAttribute('data-logo-appearance'), 'original');
      assert.equal(await image.evaluate(node => node.style.filter), '', 'Original logos have no recoloring filter');
      const {data,info} = await pixels(await logo.screenshot({path:path.join(output, `${color}-original.png`)}));
      let colored=0;
      for(let i=0;i<data.length;i+=info.channels) if(color==='purple' ? data[i]>120 && data[i+2]>150 && data[i+1]<140 : data[i+2]>100 && data[i+2]>data[i]+25) colored++;
      assert.ok(colored>50, `${name}: original ${color} artwork must remain`);
      evidence.push({name, originalColorPixels:colored});
    }
    for(const route of ['/pendidikan','/pencapaian']) {
      await page.goto(`${base}${route}`, {waitUntil:'networkidle'});
      assert.ok(await page.locator('[data-organization-logo]').count()>0);
      assert.equal(await page.locator('[data-organization-logo]:not([data-logo-appearance="original"])').count(),0,'Unrelated issuer/institution logos retain original colors');
    }
    await page.goto(`${base}/pengalaman`, {waitUntil:'networkidle'});
    await page.getByAltText('Asuransi Etiqa Internasional Indonesia',{exact:true}).first().locator('xpath=ancestor::button[1]').click();
    await page.getByRole('button',{name:'Preview logo Asuransi Etiqa Internasional Indonesia',exact:true}).click();
    const preview=page.getByRole('dialog',{name:'Logo Asuransi Etiqa Internasional Indonesia',exact:true});
    await preview.waitFor(); assert.equal(await preview.locator('[data-organization-logo]').count(),0);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'PASS',evidence,unrelatedLogosOriginal:true,originalPreview:true,originalFilesUnchanged:true,pageErrors:errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
