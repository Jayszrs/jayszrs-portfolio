const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const root = path.resolve(__dirname,'..');
const base = process.argv[2] || 'http://localhost:3109';
const output = path.join(root,'.impeccable/review/logo-cutouts');
const manifest = require('../public/organization-logos/transparent-cutouts.json');
const variants = require('../frontend/lib/organization-logos.json').displayVariants;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

(async () => {
  fs.mkdirSync(output,{recursive:true});
  for (const asset of manifest.assets) {
    const source = path.join(root,'public',asset.source);
    assert.equal(hash(fs.readFileSync(source)), hash(execFileSync('git',['show',`HEAD:portfolio/public${asset.source}`],{cwd:root})), 'Original bytes retained');
    assert.equal(variants[asset.source],`/organization-logos/${asset.file}`);
    const {data,info} = await sharp(path.join(root,'public/organization-logos',asset.file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let empty=0,black=0,red=0,blue=0,yellow=0,white=0;
    for (let i=0;i<data.length;i+=4) {
      const [r,g,b,a]=data.subarray(i,i+4);
      if(a===0) empty++;
      if(a<240) continue;
      if(r<40&&g<40&&b<40) black++;
      if(r>170&&g<70&&b<70) red++;
      if(b>80&&b>r+30&&b>g) blue++;
      if(r>180&&g>160&&b<80) yellow++;
      if(r>235&&g>235&&b>235) white++;
    }
    assert.ok(empty>info.width*info.height*.2,'Actual alpha background, no rectangular white plate');
    for(const index of [3,info.width*4-1,(info.height-1)*info.width*4+3,data.length-1]) assert.ok(data[index]<=2,'Corners visually transparent (at most 2/255 alpha)');
    if(asset.file.startsWith('hmti')) assert.ok(black>10000&&red>5000&&white<100,'HMTI black fragments and red center retained');
    if(asset.file.startsWith('smpn')) assert.ok(blue>10000&&yellow>10000&&white>1000,'Shield colors and internal white lettering retained');
    if(asset.file.startsWith('bani')) assert.ok(blue>10000&&white<100,'Blue university mark without white plate');
    console.log('PASS',asset.file,{width:info.width,height:info.height,transparent:empty,black,red,blue,yellow,white});
  }
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    for(const [route,name,file,appearance] of [
      ['/pengalaman','HMTI — Himpunan Mahasiswa Teknik Informatika','hmti-symbol-transparent.png','lighten-dark'],
      ['/pendidikan','SMP Negeri 135 Jakarta','smpn-135-transparent.png','original'],
      ['/pendidikan','Universitas Bani Saleh','bani-saleh-transparent.png','original']
    ]) {
      await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
      const image=page.locator(`img[src*="${file}"]`).first();
      await image.scrollIntoViewIfNeeded(); await image.evaluate(node=>node.decode());
      assert.ok(decodeURIComponent(await image.getAttribute('src')).includes(file),'UI uses transparent sibling');
      const mark=image.locator('xpath=ancestor::*[@data-organization-logo][1]');
      assert.equal(await mark.getAttribute('data-logo-appearance'),appearance);
      await mark.screenshot({path:path.join(output,file)});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS All three cutouts render in real CMS-backed pages without page errors');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
