const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

(async () => {
  const root = path.resolve(__dirname, '..');
  const source = await fs.readFile(path.join(root, 'app/icon.svg'));
  for (const [name, size] of [['favicon-192.png', 192], ['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    await sharp(source, { density: 600 }).resize(size, size).png().toFile(path.join(root, 'public', name));
  }
  console.log('Exported the SVG brand to three matching black/white browser and PWA icons.');
})().catch(error => { console.error(error); process.exitCode = 1; });
