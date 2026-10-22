const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { ribbonPath } = require('../frontend/lib/lanyard-physics.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const svg = await fs.readFile(path.join(root, 'app/icon.svg'), 'utf8');
  assert.ok(svg.includes('fill="#08080a"') && svg.includes('fill="#ffffff"'));
  assert.ok(!svg.includes('#ef3340'));
  for (const [name, size] of [['favicon-192.png', 192], ['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const file = path.join(root, 'public', name);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let redPixels = 0, whitePixels = 0, blackPixels = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (!data[i + 3]) continue;
      if (data[i] > data[i + 1] + 70 && data[i] > data[i + 2] + 70) redPixels++;
      if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) whitePixels++;
      if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) blackPixels++;
    }
    assert.equal(redPixels, 0, `${name} must no longer contain the old red mark`);
    assert.ok(whitePixels > 30 && blackPixels > 1000);
  }
  const points = [{ x: 100, y: 0 }, { x: 110, y: 40 }, { x: 155, y: 75 }, { x: 170, y: 120 }];
  for (const scale of [.5, 1, 1.2]) for (const side of [-1, 1]) {
    const curve = ribbonPath(points, side, scale);
    assert.ok(curve.startsWith(`M${(100 - side * 18 / scale).toFixed(2)},0.00`));
    assert.ok(curve.endsWith('L170.00,120.00'), 'Both visible straps must meet the real physics attachment');
    assert.ok(!/NaN|Infinity/.test(curve));
  }
  console.log('PASS: two resolution-independent fabric paths, fixed upper anchors, shared lower attachment, SVG black/white mark and all three matching PNG exports.');
})().catch(error => { console.error(error); process.exitCode = 1; });
