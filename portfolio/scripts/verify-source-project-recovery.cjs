const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8").replace(/^\uFEFF/, ""));
function helper(name, dependencies) {
  const source = fs.readFileSync(path.join(root, "frontend/lib", name), "utf8");
  const names = [...source.matchAll(/export function (\w+)\(/g)].map((match) => match[1]);
  const code = source.replace(/^import .*;\r?\n/gm, "").replace(/export function /g, "function ")
    + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { ...dependencies, exports }, { filename: name });
  return exports;
}
const documentation = helper("documentation.js", {});
const registry = read("frontend/lib/recovered-project-media.json");
const { withRecoveredProjectMedia } = helper("project-media.js", { ...documentation, recoveredProjects: registry });
const content = read("../backups/content-2026-10-17.json");
const snapshot = JSON.stringify(content);
const item = content.gallery.find((project) => project.id === "proj-1784794090796-xcsa");
const recovered = registry[item.id];
assert.equal(recovered.pages.length, 19);
assert.equal(recovered.legacyMedia.length, 20);
const display = withRecoveredProjectMedia(item);
assert.equal(display.image, recovered.pages[0].url);
assert.equal(documentation.documentationImages(display).length, 18);
assert.equal(display.link, item.link);
for (const page of recovered.pages) {
  const bytes = fs.readFileSync(path.join(root, "public", page.url));
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), page.sha256);
  assert.equal(crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), page.gitSha);
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
}
for (const changes of [
  { image: "/new-cover.png" }, { documentationImages: ["/new-documentation.png"] },
  { documentationImage: "/new-legacy-documentation.png" }, { link: "https://example.com/new-source" },
]) {
  const edited = { ...item, ...changes };
  assert.equal(withRecoveredProjectMedia(edited), edited, "Later admin media/link edit must win");
}
assert.equal(JSON.stringify(content), snapshot);
console.log("PASS: 19 original repository PNG checksums and Git identities, 20 preserved Blob references, Gallery collection, unchanged CMS and precedence of later admin edits.");
