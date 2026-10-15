const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));

// Evaluate the actual small ESM helpers with their real JSON registries.
function loadHelper(name, dependencies) {
  const exports = {};
  const source = fs.readFileSync(path.join(root, "frontend/lib", name), "utf8");
  const names = [...source.matchAll(/export function (\w+)\(/g)].map((match) => match[1]);
  let code = source.replace(/^import .*;\r?\n/gm, "").replace(/export function /g, "function ");
  code += names.map((key) => `\nexports.${key} = ${key};`).join("");
  vm.runInNewContext(code, { ...dependencies, exports }, { filename: name });
  return exports;
}
const documentation = loadHelper("documentation.js", {});
const media = loadHelper("media.js", {
  recoveredMedia: read("frontend/lib/recovered-media.json"),
  organizationLogos: read("frontend/lib/organization-logos.json"),
  certificateMedia: read("frontend/lib/certificate-media.json"),
  certificatePreviews: read("frontend/lib/certificate-previews.json"),
  URL,
});
const registry = read("frontend/lib/recovered-documentation.json");
const { withRecoveredDocumentation } = loadHelper("recovered-documentation.js", {
  ...documentation, ...media, recoveredDocumentation: registry,
});
const { withRecoveredProjectMedia } = loadHelper("project-media.js", {
  ...documentation, recoveredProjects: read("frontend/lib/recovered-project-media.json"),
});
const source = JSON.parse(fs.readFileSync(path.join(process.env.TEMP, "jayszrs-all-media-current.json"), "utf8").replace(/^\uFEFF/, ""));
const original = JSON.stringify(source);
const paths = new Set();
let removedSlots = 0;
for (const [id, recovered] of Object.entries(registry)) {
  const item = source[recovered.section].find((x) => x.id === id);
  const display = withRecoveredDocumentation(item, recovered.section);
  assert.notEqual(display, item);
  assert.equal(display.title, item.title);
  assert.equal(display.description, item.description);
  const docs = documentation.documentationImages(display);
  for (const image of recovered.images) {
    assert(docs.includes(image.url));
    const bytes = fs.readFileSync(path.join(root, "public", image.url));
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), image.sha256);
    paths.add(image.url);
  }
  for (const url of recovered.unavailableDocumentation) assert(!docs.includes(url));
  removedSlots += recovered.unavailableDocumentation.length;
  const before = documentation.documentationImages(item);
  for (const url of before.filter((url) => !recovered.unavailableDocumentation.includes(url))) assert(docs.includes(url));
  // Each kind of later CMS edit must disable recovery rather than overwrite it.
  for (const key of ["image", "logo", "documentationImage", "documentationImages", "documentationFile", "orgLink", "link"]) {
    const edited = { ...item, [key]: key === "documentationImages" ? ["/new-admin-photo.jpg"] : "/new-admin-value" };
    assert.equal(withRecoveredDocumentation(edited, recovered.section), edited, key);
  }
  assert.equal(withRecoveredDocumentation(item, "other-section"), item);
}
assert.equal(JSON.stringify(source), original, "CMS snapshot must not be mutated");
assert.equal(paths.size, 23);
const laundry = source.gallery.find((item) => item.id === "proj-1784715069630-imjd");
const restoredLaundry = withRecoveredProjectMedia(laundry);
assert.equal(restoredLaundry.image, "/recovered-media/drive/laundryuk-dashboard-admin.png");
assert.deepEqual(restoredLaundry.documentationImages, laundry.documentationImages);
assert.equal(withRecoveredProjectMedia({ ...laundry, image: "/admin-new-cover.png" }).image, "/admin-new-cover.png");
const unresolved = read("../backups/unresolved-media-2026-10-15.json");
const stillVisible = new Set();
function collect(value) {
  if (typeof value === "string") {
    if (unresolved.some((entry) => entry.url === value) && media.mediaSource(value) === value) stillVisible.add(value);
  } else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
collect({ ...source,
  education: source.education.map((item) => withRecoveredDocumentation(item, "education")),
  experience: source.experience.map((item) => withRecoveredDocumentation(item, "experience")),
  gallery: source.gallery.map(withRecoveredProjectMedia),
});
if (process.argv.includes("--refresh-backlog")) {
  fs.writeFileSync(path.join(root, "../backups/unresolved-media-2026-10-15.json"), JSON.stringify(unresolved.filter((entry) => stillVisible.has(entry.url)), null, 2) + "\n");
}
console.log(JSON.stringify({ status: "PASS", collections: Object.keys(registry).length, uniqueImages: paths.size, laundryCoverRestored: true, unresolvedDocumentationSlotsReplacedBySourceCollections: removedSlots, remainingVisibleUnresolvedUrls: stillVisible.size, cmsUnchanged: true, laterAdminEditsWin: true }));
