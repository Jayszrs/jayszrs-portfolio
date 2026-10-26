const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

(async () => {
  const root = path.resolve(__dirname, '..');
  const source = await fs.readFile(path.join(root, 'app/icon.svg'));
  for (const [name, size] of [['favicon-32.png', 32], ['favicon-48.png', 48], ['favicon-192.png', 192], ['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    await sharp(source, { density: 600 }).resize(size, size).png().toFile(path.join(root, 'public', name));
  }
  const mask = await sharp(source, { density: 600 }).resize(384, 384).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#08080a' } }).composite([{ input: mask, left: 64, top: 64 }]).png().toFile(path.join(root, 'public/favicon-maskable-512.png'));

  // ICO directory entries can contain PNG images; keep real 16/32/48px frames.
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(source, { density: 600 }).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await fs.writeFile(path.join(root, 'app/favicon.ico'), Buffer.concat([header, ...images]));
  console.log('Exported matching SVG-derived browser, Google Search, Apple, PWA and maskable icons.');
})().catch(error => { console.error(error); process.exitCode = 1; });
