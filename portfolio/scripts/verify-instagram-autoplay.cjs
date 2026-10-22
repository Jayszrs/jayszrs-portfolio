const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const base = process.argv[2] || 'http://localhost:3109';
const output = path.resolve(__dirname, '../.impeccable/review/instagram-autoplay');
const apiUrl = 'https://open.spotify.com/embed/iframe-api/v1';

// The contract test controls Spotify events; it does not claim audible real-service playback.
const sdk = `window.spotifyCalls = [];
window.onSpotifyIframeApiReady({createController(target, options, callback) {
  const events = {}, index = window.spotifyCalls.length;
  const calls = {play:0,pause:0,destroy:0,options}; window.spotifyCalls.push(calls);
  const frame = document.createElement('iframe'); target.replaceWith(frame);
  const emit = (name, data) => events[name]?.({data});
  window.spotifyEmit = emit;
  callback({
    addListener(name, fn) { events[name] = fn; },
    play() { calls.play++; if (!window.blockSpotifyPlayback) setTimeout(() => emit('playback_started'), 30); },
    pause() { calls.pause++; emit('playback_update', {isPaused:true}); },
    destroy() { calls.destroy++; frame.remove(); }
  });
  setTimeout(() => emit('ready'), 20);
}});`;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({viewport:{width,height:1000}, reducedMotion:'reduce'});
      const errors = []; let scripts = 0;
      page.on('pageerror', error => errors.push(error.message));
      await page.route(apiUrl, route => { scripts++; return route.fulfill({contentType:'application/javascript',body:sdk}); });
      await page.goto(base, {waitUntil:'networkidle'});
      await page.locator('#sosial-media').scrollIntoViewIfNeeded();
      await page.getByRole('tab',{name:'LinkedIn',exact:true}).waitFor();
      assert.equal(scripts,0,'No Spotify requests before Instagram opens');
      await page.getByRole('tab',{name:'Instagram',exact:true}).click();
      const music = page.locator('[data-music-state]');
      await page.waitForFunction(() => document.querySelector('[data-music-state]')?.dataset.musicState === 'playing');
      assert.equal(await page.evaluate(() => spotifyCalls[0].play),1,'Ready attempts autoplay without an extra play click');
      assert.equal(await music.locator('iframe').getAttribute('title'),'GODS — NewJeans · League of Legends');
      assert.match(await music.locator('iframe').getAttribute('allow'),/autoplay/);
      await page.getByRole('button',{name:'Jeda musik',exact:true}).click();
      await page.waitForFunction(() => document.querySelector('[data-music-state]')?.dataset.musicState === 'paused');
      await page.getByRole('button',{name:'Putar musik',exact:true}).click();
      await page.waitForFunction(() => document.querySelector('[data-music-state]')?.dataset.musicState === 'playing');
      await music.screenshot({path:path.join(output,`music-${width}.png`)});
      await page.getByRole('tab',{name:'LinkedIn',exact:true}).click();
      assert.equal(await page.evaluate(() => spotifyCalls[0].destroy),1,'Switching platform destroys the embed');
      assert.ok(await page.evaluate(() => spotifyCalls[0].pause>=2),'Switching platform pauses playback');
      await page.evaluate(() => { window.blockSpotifyPlayback = true; });
      await page.getByRole('tab',{name:'Instagram',exact:true}).click();
      await page.waitForFunction(() => spotifyCalls.length===2 && spotifyCalls[1].play===1);
      assert.notEqual(await music.getAttribute('data-music-state'),'playing','A play request alone must not claim audible playback');
      await page.waitForFunction(() => document.querySelector('[data-music-state]')?.dataset.musicState === 'paused',{},{timeout:7000});
      await page.getByRole('button',{name:'Putar musik',exact:true}).waitFor();
      assert.equal(scripts,1,'Remount reuses SDK, with a fresh controller');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth+1));
      assert.deepEqual(errors,[]);
      await page.close();
      console.log('PASS',width,'Instagram lazy SDK, autoplay, playback acknowledgement, manual controls, tab cleanup and blocked-play fallback');
    }
    const page = await browser.newPage();
    await page.route(apiUrl, route => route.abort());
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('#sosial-media').scrollIntoViewIfNeeded();
    await page.getByRole('tab',{name:'Instagram',exact:true}).click();
    await page.getByText('Musik belum bisa dimuat.',{exact:true}).waitFor();
    assert.equal(await page.getByRole('link',{name:'Buka di Spotify'}).getAttribute('href'),'https://open.spotify.com/track/210JJAa9nJOgNa0YNrsT5g');
    console.log('PASS Spotify load failure retains the real track link');
    await page.close();
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
