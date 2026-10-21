const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || path.join(process.env.LOCALAPPDATA, "Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core"));
const base = process.argv[2] || "http://127.0.0.1:3109";
const review = path.resolve(__dirname, "../.impeccable/review/pointer-interactions");
fs.mkdirSync(review, { recursive: true });

async function verify() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const errors = [];
  try {
    for (const [name, width, height, reducedMotion] of [["desktop", 1440, 1000, "no-preference"], ["reduced-motion", 1440, 1000, "reduce"], ["mobile-width", 390, 844, "no-preference"]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion, hasTouch: width < 500 });
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(base);
      const card = page.locator(".lanyard-badge");
      await page.locator(".lanyard-stage[data-physics]").waitFor();
      await card.evaluate(node => node.scrollIntoView({ behavior: "instant", block: "center" }));
      await card.focus();
      await card.press("Home");
      await page.waitForTimeout(100);
      await card.evaluate(node => node.scrollIntoView({ behavior: "instant", block: "center" }));
      const before = await card.boundingBox();
      const x = before.x + before.width * .5;
      const y = before.y + before.height * .4;
      assert.ok(y > 0 && y < height, "Test pointer must start inside the viewport");
      await page.evaluate(() => {
        window.pointerTrace = [];
        for (const type of ["pointerdown", "pointerup", "pointercancel", "lostpointercapture", "dragstart"]) window.addEventListener(type, event => window.pointerTrace.push({ type, target: event.target.tagName, className: event.target.getAttribute("class"), primary: event.isPrimary, button: event.button, x: event.clientX, y: event.clientY }), true);
      });
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + (width < 500 ? 35 : 85), y - 55, { steps: 20 });
      await page.waitForTimeout(150);
      if (await page.locator(".lanyard-stage").getAttribute("data-physics") !== "dragging") console.log(JSON.stringify(await page.evaluate(({ x, y }) => ({ events: window.pointerTrace, hit: document.elementFromPoint(x, y)?.outerHTML.slice(0,300), visibility: document.visibilityState, stage: document.querySelector(".lanyard-stage").getBoundingClientRect().toJSON() }), { x, y })));
      assert.equal(await page.locator(".lanyard-stage").getAttribute("data-physics"), "dragging", `${name}: real mouse drag must reach the simulation`);
      const dragged = await card.boundingBox();
      assert.ok(Math.hypot(dragged.x - before.x, dragged.y - before.y) > 5, `${name}: pointer movement must move the card`);
      assert.ok(dragged.x >= 0 && dragged.x + dragged.width <= width, `${name}: the full rotated card must fit horizontally`);
      await page.screenshot({ path: path.join(review, `${name}-drag.png`) });
      await page.mouse.up();
      await page.waitForTimeout(120);
      assert.notEqual(await page.locator(".lanyard-stage").getAttribute("data-physics"), "dragging");
      assert.equal(await page.locator(".lanyard-stage button").count(), 0);
      if (width < 500) {
        await card.press("Home");
        await card.evaluate(node => node.scrollIntoView({ behavior: "instant", block: "center" }));
        const box = await card.boundingBox();
        const touchX = box.x + box.width / 2, touchY = box.y + box.height * .4;
        const session = await page.context().newCDPSession(page);
        await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: touchX, y: touchY }] });
        for (let step = 1; step <= 12; step++) {
          await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: touchX + step, y: touchY - step * 4 }] });
          await page.waitForTimeout(16);
        }
        assert.equal(await page.locator(".lanyard-stage").getAttribute("data-physics"), "dragging", "Vertical touch gestures on the badge must drag it, not scroll the page");
        await page.screenshot({ path: path.join(review, "mobile-touch-drag.png") });
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await session.detach();
      }
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/proyek`);
    const track = page.locator(".mouse-scroll-track");
    await track.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    await page.mouse.move(box.x + box.width * .6, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .6 - 270, box.y + 100, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterDrag = await track.evaluate(node => node.scrollLeft);
    assert.ok(afterDrag > 200, "Dragging project cards with a real mouse must scroll the carousel");
    assert.equal(await page.locator('[role="dialog"]').count(), 0, "Releasing a drag must not open project detail");
    await track.evaluate(node => { node.style.scrollBehavior = "auto"; node.scrollLeft = 0; });
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(250);
    assert.ok(await track.evaluate(node => node.scrollLeft) > 100, "Mouse wheel must move the project carousel horizontally");
    await page.waitForTimeout(300);
    await track.locator("button").nth(1).click();
    await page.locator('[role="dialog"]').waitFor();
    await page.keyboard.press("Escape");
    await page.locator('[role="dialog"]').waitFor({ state: "detached" });
    await page.screenshot({ path: path.join(review, "project-carousel.png") });
    await page.goto(`${base}/keahlian`);
    await page.locator(".brand-object--large").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(review, "skill-symbols.png") });
    await page.goto(`${base}/pendidikan`);
    const cap = page.locator('img[src*="graduation-cap-3d"]');
    await cap.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const image = document.querySelector('img[src*="graduation-cap-3d"]'); return image?.complete && image.naturalWidth > 0; });
    await page.screenshot({ path: path.join(review, "education-3d.png") });
    assert.deepEqual(errors, [], "No browser page errors");
    console.log(JSON.stringify({ status: "PASS", realMouseLanyard: 3, reducedMotionStillDraggable: true, mobileTouchDrag: true, rotatedCardsWithinViewport: true, projectMouseDrag: true, mouseWheel: true, noDetailOnDrag: true, ordinaryClickStillOpensDetail: true, local3dIllustrationLoaded: true, errors }));
  } finally { await browser.close(); }
}
verify().catch(error => { console.error(error); process.exitCode = 1; });
