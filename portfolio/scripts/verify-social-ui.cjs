const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { transform } = require("next/dist/build/swc");
const root = path.resolve(__dirname, "..");

async function main() {
  // Isolate this component's contract; shared image/icon rendering is verified by HTTP.
  let source = fs.readFileSync(path.join(root, "frontend/components/SocialHub.js"), "utf8")
    .replace('import SafeImage from "./SafeImage";', 'function SafeImage({ src, alt }) { return src ? <img src={src} alt={alt} /> : null; }')
    .replace('import TikTokIcon from "./TikTokIcon";', 'function TikTokIcon() { return <span aria-hidden="true" />; }')
    .replace('import githubSnapshot from "@/frontend/lib/github-profile-snapshot.json";', `const githubSnapshot = ${fs.readFileSync(path.join(root, "frontend/lib/github-profile-snapshot.json"), "utf8")};`);
  const { code } = await transform(source, { filename: "social-test.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, target: "es2022", transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
  const compiled = new Module(path.join(root, "social-test.cjs"), module);
  compiled.filename = path.join(root, "social-test.cjs");
  compiled.paths = Module._nodeModulePaths(root);
  compiled._compile(code, compiled.filename);
  const render = (socials) => renderToStaticMarkup(React.createElement(compiled.exports.default, { socials }));
  const github = render({ github: "https://github.com/Jayszrs" });
  assert(github.includes("README.md"));
  assert(github.includes("I’m currently working"));
  assert(github.includes("Tech stack dari README"));
  assert(github.includes('role="tablist"'));
  assert(github.includes('aria-labelledby="social-tab-github"'));
  const tiktok = render({ tiktok: "https://www.tiktok.com/@jayszrss" });
  assert(tiktok.includes("Jelajahi TikTok saya"));
  assert(tiktok.includes("https://tiktok.com/@jayszrss"));
  assert(!/<iframe|<script|tiktok-embed|overload-protect/i.test(tiktok), "TikTok must not load an opaque error iframe");
  const instagram = render({ instagram: "https://instagram.com/jayszrs" });
  assert(instagram.includes('src="https://instagram.com/jayszrs/embed/"'));
  assert(instagram.includes("Ikuti di Instagram"));
  assert(instagram.includes("Tutup pratinjau"));
  assert.equal(render({}), "");
  assert.equal(render({ github: "http://github.com/Jayszrs" }), "");
  assert.equal(render({ github: "https://github.com.evil.test/Jayszrs" }), "");
  assert(!render({ github: "https://github.com/AnotherUser" }).includes("I’m currently working"), "A different account must not inherit the owner's README snapshot");
  console.log("PASS: GitHub README rendering, account-specific fallback, tab semantics, Instagram preview/profile link, TikTok without error iframe, and URL validation.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
