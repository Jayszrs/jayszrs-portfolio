// Read-only verification of deployed recovery files and remaining CMS references.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const base = new URL(process.argv[2] || "https://jayszrs.my.id");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8").replace(/^\uFEFF/, ""));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
function helper(name, dependencies) {
  const source = fs.readFileSync(path.join(root, "frontend/lib", name), "utf8");
  const names = [...source.matchAll(/export function (\w+)\(/g)].map((match) => match[1]);
  const code = source.replace(/^import .*;\r?\n/gm, "").replace(/export function /g, "function ")
    + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { ...dependencies, exports }, { filename: name });
  return exports;
}
async function get(url) {
  const response = await fetch(new URL(url, base), { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
async function main() {
  const content = JSON.parse(await get("/api/content"));
  const documentation = helper("documentation.js", {});
  const media = helper("media.js", {
    recoveredMedia: read("frontend/lib/recovered-media.json"),
    organizationLogos: read("frontend/lib/organization-logos.json"),
    certificateMedia: read("frontend/lib/certificate-media.json"),
    certificatePreviews: read("frontend/lib/certificate-previews.json"), URL,
  });
  const projects = helper("project-media.js", {
    ...documentation, recoveredProjects: read("frontend/lib/recovered-project-media.json"),
  });
  const archives = helper("recovered-documentation.js", {
    ...documentation, ...media, recoveredDocumentation: read("frontend/lib/recovered-documentation.json"),
  });
  const display = { ...content,
    gallery: content.gallery.map(projects.withRecoveredProjectMedia),
    education: content.education.map((item) => archives.withRecoveredDocumentation(item, "education")),
    experience: content.experience.map((item) => archives.withRecoveredDocumentation(item, "experience")),
  };
  const unresolved = new Map();
  function collect(value, field = "") {
    if (typeof value === "string" && media.isBlobSource(value) && media.mediaSource(value) === value) {
      if (!unresolved.has(value)) unresolved.set(value, []);
      unresolved.get(value).push(field);
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) collect(item, field ? `${field}.${key}` : key);
    }
  }
  collect(display);
  const files = [];
  const excludedLocalSources = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && /\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(entry.name)) {
        const relative = path.relative(path.join(root, "public"), file).split(path.sep).join("/");
        // Extraction intermediates are excluded by .vercelignore; the site uses their WebP copies.
        if (/^recovered-media\/project-reports\/.*\.(png|jpeg)$/.test(relative)) excludedLocalSources.push(relative);
        else files.push(file);
      }
    }
  }
  for (const dir of ["certificates", "organization-logos", "project-documents", "recovered-media"]) {
    walk(path.join(root, "public", dir));
  }
  const results = [];
  let index = 0;
  async function worker() {
    while (index < files.length) {
      const file = files[index++];
      const url = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/");
      const localBytes = fs.readFileSync(file);
      const expected = hash(localBytes);
      try {
        const bytes = await get(url);
        const actual = hash(bytes);
        const textNewlinesOnly = file.endsWith(".svg") && actual !== expected &&
          localBytes.toString().replaceAll("\r\n", "\n") === bytes.toString().replaceAll("\r\n", "\n");
        results.push({ url, status: actual === expected || textNewlinesOnly ? "PASS" : "FAIL",
          bytes: bytes.length, sha256: actual, expected, ...(textNewlinesOnly ? { textNewlinesOnly: true } : {}) });
      } catch (error) {
        results.push({ url, status: "FAIL", error: error.message, expected });
      }
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  results.sort((a, b) => a.url.localeCompare(b.url));
  const projectHtml = (await get("/proyek")).toString();
  const baznasCover = "/recovered-media/github-baznas/final_running.png";
  const references = [...unresolved].map(([url, fields]) => ({ url, fields }));
  const failures = results.filter((item) => item.status !== "PASS");
  const report = {
    capturedAt: new Date().toISOString(), baseUrl: base.origin,
    recoveredFileCount: results.length, recoveredFilesVerified: results.length - failures.length,
    recoveredFilesFailed: failures.length,
    baznasCoverInProjectHtml: projectHtml.includes(baznasCover),
    unresolvedBlobImageUrls: references.filter((item) => !/\.pdf(?:[?#]|$)/i.test(item.url)).length,
    unresolvedBlobPdfUrls: references.filter((item) => /\.pdf(?:[?#]|$)/i.test(item.url)).length,
    unresolvedStatus: "Unmapped Blob references; blocked provider is not repeatedly requested",
    resolutionUsesLocalRegistry: true, excludedLocalSources, files: results, unresolvedReferences: references,
    remoteMutations: 0,
  };
  const destination = path.join(root, "../backups/deployed-recovery-assets-latest.json");
  fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ ...report, excludedLocalSources: undefined, files: undefined, unresolvedReferences: undefined }));
  if (failures.length) { console.log(JSON.stringify(failures)); process.exitCode = 1; }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
