const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const gallery = require("../frontend/lib/instagram-gallery.json");
const base = process.argv[2] || "http://localhost:3109";

async function main() {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = await response.text();
  const rendered = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  assert.ok(/<img\b[^>]*src="\/icon\.svg"/.test(rendered), "Navbar/badge must use the local Kali asset");
  assert.ok(rendered.includes("lanyard-stage"));
  assert.ok(rendered.includes("/recovered-media/72f2512d2ad69885bd85.webp"), "Recovered profile photograph missing from rendered card");
  assert.ok(rendered.includes("Di luar portofolio."));
  assert.ok(!rendered.includes("README.md"), "Below-fold README should load only when the social section approaches the viewport");
  for (const unwanted of ["Kontribusi setahun", "Setahun membangun", "Top kontribusi commit", "Top Contributed Repo", "GitHub Stats"]) assert.ok(!rendered.includes(unwanted), unwanted);
  const logo = await fetch(`${base}/icon.svg`);
  assert.equal(logo.status, 200);
  assert.ok((await logo.text()).includes("<path"));
  const social = await fetch(`${base}/api/social`);
  assert.equal(social.status, 200);
  const { github } = await social.json();
  assert.equal(github.username.toLowerCase(), "jayszrs");
  assert.ok(github.readme.markdown.includes("About Me"));
  assert.equal(github.days, undefined);
  assert.equal(github.topRepositories, undefined);
  const tiktok = await fetch(`${base}/api/social/tiktok`);
  assert.equal(tiktok.status, 200);
  const value = (await tiktok.json()).tiktok;
  assert.equal(value.username, "jayszrss");
  assert.deepEqual(value.videos.map((video) => video.id), ["7441934180482600210", "7508283130906725649", "7469052987869007112"], "Keep the owner's exact three selections and order");
  assert.ok(value.videos.every((video) => /^\d{17,20}$/.test(video.id)));
  assert.equal(value.ranking, "curated", "The owner-selected videos must keep their original order");
  assert.ok(value.videos.every((video) => video.viewCount === null || (Number.isSafeInteger(video.viewCount) && video.viewCount >= 0 && ["tiktok-api", "owner-snapshot", "public-snapshot"].includes(video.viewCountSource) && Number.isFinite(Date.parse(video.viewCountCapturedAt)))), "Every count must identify its real source and observation date");
  assert.equal(gallery.photos.length, 6);
  await Promise.all([gallery.avatar, ...gallery.photos].map(async (photo) => {
    const response = await fetch(`${base}${photo.src}`);
    assert.equal(response.status, 200, photo.src);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(createHash("sha256").update(bytes).digest("hex"), photo.sha256, "Public profile photo bytes must remain authentic");
  }));
  console.log(JSON.stringify({ status: "PASS", renderedLocalLogo: true, recoveredPhotoInLanyard: true, socialDeferred: true, profileAndReadmeOnly: true, liveGithubReadme: true, tiktokPosts: value.videos.length, ranking: value.ranking, browserInteractionVerified: false, remoteMutations: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
