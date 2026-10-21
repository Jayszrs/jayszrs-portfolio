const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");
const base = process.argv[2] || "http://localhost:3109";
(async () => {
  const local = fs.existsSync(base);
  let html;
  if (local) html = fs.readFileSync(path.join(base, "server/app/index.html"), "utf8");
  else {
    const response = await fetch(base);
    if (!response.ok) throw new Error(`HTML ${response.status}`);
    html = await response.text();
  }
  const urls = [...new Set([...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1]))];
  let rawBytes = 0;
  let gzipBytes = 0;
  for (const url of urls) {
    let bytes;
    if (local) bytes = fs.readFileSync(path.join(base, "static", new URL(url, "https://local.test").pathname.replace(/^\/_next\/static\//, "")));
    else {
      const asset = await fetch(new URL(url, base));
      if (!asset.ok) throw new Error(`Script ${asset.status}: ${url}`);
      bytes = Buffer.from(await asset.arrayBuffer());
    }
    rawBytes += bytes.length;
    gzipBytes += zlib.gzipSync(bytes).length;
  }
  console.log(JSON.stringify({ base, scriptCount: urls.length, rawBytes, gzipBytes, method: "unique initial HTML script resources, gzip level 6; excludes lazy chunks and third-party embeds" }));
})().catch((error) => { console.error(error); process.exitCode = 1; });
