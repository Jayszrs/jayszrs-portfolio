const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const sharp = require("sharp");
const { chromium } = require("C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core");
const base = process.argv[2] || "http://127.0.0.1:3109";
const root = path.resolve(__dirname, "..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function verify() {
  for (const file of ["etiqa.png", "fazmastone.png", "dicoding.png"]) {
    const relative = `portfolio/public/organization-logos/${file}`;
    const original = execFileSync("git", ["show", `HEAD:${relative}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(hash(fs.readFileSync(path.join(root, "public/organization-logos", file))), hash(original), `Original ${file} remains byte-identical`);
  }
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const errors = [];
  const evidence = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [route, names] of [
      ["/pengalaman", ["Asuransi Etiqa Internasional Indonesia", "Fazma Stone"]],
      ["/pendidikan", ["Logo Universitas Bani Saleh", "Logo SMA Negeri 71 Jakarta", "Logo SMP Negeri 135 Jakarta"]],
      ["/pencapaian", ["Logo Dicoding Indonesia"]],
    ]) {
      await page.goto(new URL(route, base).href, { waitUntil: "networkidle", timeout: 120000 });
      for (const name of names) {
        const img = page.getByAltText(name, { exact: true }).first();
        const mark = img.locator("xpath=ancestor::*[@data-organization-logo][1]");
        await mark.scrollIntoViewIfNeeded();
        await page.waitForFunction((node) => node.dataset.logoAppearance !== "original", await mark.elementHandle());
        const png = await mark.screenshot();
        const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let white = 0, bright = 0;
        let dark = 0;
        for (let offset = 0; offset < data.length; offset += info.channels) {
          if (data[offset] > 220 && data[offset + 1] > 220 && data[offset + 2] > 220) white += 1;
          if (data[offset] > 150 && data[offset + 1] > 150 && data[offset + 2] > 150) bright += 1;
          if (data[offset] < 70 && data[offset + 1] < 70 && data[offset + 2] < 70) dark += 1;
        }
        assert.ok(bright > 15, `${name}: a visible bright mark must remain with contrast above 6:1 against the charcoal panel`);
        let darkCorners = 0, cornerPixels = 0;
        for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
          if (!((x < 3 || x >= info.width - 3) && (y < 3 || y >= info.height - 3))) continue;
          const offset = (y * info.width + x) * info.channels;
          cornerPixels++;
          if (data[offset] < 70 && data[offset + 1] < 70 && data[offset + 2] < 70) darkCorners++;
        }
        assert.ok(darkCorners / cornerPixels > .7, `${name}: the image's white rectangular plate must not remain at the corners`);
        evidence.push({ name, appearance: await mark.getAttribute("data-logo-appearance"), whitePixels: white, brightPixels: bright, darkPixels: dark });
      }
      assert.equal(await page.locator('[data-organization-logo] img[alt^="Dokumentasi"]').count(), 0, "Documentation photographs are never recolored as logos");
    }
    await page.goto(new URL("/pengalaman", base).href, { waitUntil: "networkidle" });
    await page.getByAltText("Asuransi Etiqa Internasional Indonesia", { exact: true }).locator("xpath=ancestor::button[1]").click();
    await page.getByRole("button", { name: "Preview logo Asuransi Etiqa Internasional Indonesia", exact: true }).click();
    const preview = page.getByRole("dialog", { name: "Logo Asuransi Etiqa Internasional Indonesia", exact: true });
    await preview.waitFor();
    assert.equal(await preview.locator("[data-organization-logo]").count(), 0, "Preview retains original logo colors");
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log(JSON.stringify({ status: "PASS", evidence, originalLogoPreview: true, sourceFilesUnchanged: true, pageErrors: errors }, null, 2));
  } finally {
    await browser.close();
  }
}

verify().catch((error) => { console.error(error); process.exitCode = 1; });
