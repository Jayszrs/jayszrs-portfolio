const assert = require("node:assert/strict");
const base = process.argv[2] || "http://localhost:3109";

async function main() {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = await response.text();
  const rendered = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  assert.ok(/<img\b[^>]*src="\/icon\.svg"/.test(rendered), "Navbar/badge must use the local Kali asset");
  assert.ok(rendered.includes("lanyard-stage"));
  assert.ok(rendered.includes("/recovered-media/72f2512d2ad69885bd85.webp"), "Recovered profile photograph missing from rendered card");
  assert.ok(rendered.includes("README.md"));
  assert.ok(rendered.includes("I’m currently working"));
  assert.ok(rendered.includes('role="tablist"'));
  assert.ok(rendered.includes('aria-labelledby="social-tab-github"'));
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
  assert.ok(value.videos.length >= 1 && value.videos.length <= 5);
  assert.ok(value.videos.every((video) => /^\d{17,20}$/.test(video.id)));
  assert.ok(value.ranking === "views" || value.videos.every((video) => video.viewCount === null));
  console.log(JSON.stringify({ status: "PASS", renderedLocalLogo: true, recoveredPhotoInLanyard: true, profileAndReadmeOnly: true, liveGithubReadme: true, tiktokPosts: value.videos.length, ranking: value.ranking, browserInteractionVerified: false, remoteMutations: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
