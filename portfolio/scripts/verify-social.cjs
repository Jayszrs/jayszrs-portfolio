const assert = require("node:assert/strict");
const { parseProfileReadme, readGitHubSocial } = require("../backend/lib/github-social.cjs");
const { readTikTokSocial, videoFromUrl } = require("../backend/lib/tiktok-social.cjs");

async function verify() {
  const markdown = "# About Me\nI build.<br><br>I learn.\n# Tech Stack\n![React](https://img.shields.io/badge/react-blue)\n# GitHub Stats\nUnwanted stats\n### Top Contributed Repo\nUnwanted repositories";
  const parsed = parseProfileReadme(markdown, "TestUser");
  assert.ok(parsed.markdown.includes("I build.\n\nI learn."));
  assert.ok(!parsed.markdown.includes("Unwanted"));
  assert.deepEqual(parsed.technologies, ["React"]);
  await assert.rejects(readGitHubSocial("../other-host"));
  const original = global.fetch;
  const requests = [];
  let apiUnavailable = false;
  global.fetch = async (input) => {
    const url = new URL(input);
    requests.push(url);
    assert.ok(!/\/contributors|\/contributions|\/users\/[^/]+\/repos/.test(url.pathname), "Contribution/repository API should not be called");
    if (url.hostname === "raw.githubusercontent.com") return new Response(markdown);
    if (apiUnavailable) return new Response("Rate limited", { status: 403 });
    if (url.pathname.endsWith("/readme")) return Response.json({ encoding: "base64", content: Buffer.from(markdown).toString("base64") });
    return Response.json({ login: "TestUser", name: "Real owner", bio: "Owner bio", followers: 7 });
  };
  try {
    const data = await readGitHubSocial("TestUser");
    assert.equal(data.name, "Real owner");
    assert.equal(requests.length, 2);
    assert.equal(data.topRepositories, undefined);
    assert.equal(data.days, undefined);
    assert.equal(data.followers, undefined);
    apiUnavailable = true;
    assert.ok((await readGitHubSocial("TestUser")).readme.markdown.includes("I build."));
  } finally { global.fetch = original; }

  assert.equal(videoFromUrl("https://tiktok.com.evil.test/@owner/video/7000000000000000001", "owner"), null);
  assert.equal(videoFromUrl("https://www.tiktok.com/@someoneelse/video/7000000000000000001", "owner"), null);
  assert.equal((await readTikTokSocial("owner", { token: "", curated: [] })).videos.length, 0);
  const curated = await readTikTokSocial("owner", { token: "", curated: ["https://www.tiktok.com/@owner/video/7000000000000000001", "https://www.tiktok.com/@owner/video/7000000000000000001", "https://evil.test"] });
  assert.equal(curated.videos.length, 1);
  assert.equal(curated.videos[0].viewCount, null, "Curated links must not receive fabricated views");
  let page = 0;
  const fakeApi = async (input) => {
    if (input.includes("/user/info/")) return Response.json({ data: { user: { username: "owner" } }, error: { code: "ok" } });
    page += 1;
    return Response.json({ data: { videos: Array.from({ length: 4 }, (_, index) => ({ id: `700000000000000000${index + (page - 1) * 4}`, title: `Video ${index}`, view_count: index + page * 10 })), has_more: page === 1, cursor: 123 }, error: { code: "ok" } });
  };
  const ranked = await readTikTokSocial("owner", { token: "test-only", fetcher: fakeApi });
  assert.equal(ranked.videos.length, 3);
  assert.equal(ranked.scanned, 8);
  assert.ok(ranked.complete);
  assert.deepEqual(ranked.videos.map((video) => video.viewCount), [23, 22, 21]);
  await assert.rejects(readTikTokSocial("wrongaccount", { token: "test-only", fetcher: fakeApi }), /mismatch/);
  console.log("PASS: GitHub profile/README only, raw README fallback, TikTok ownership, pagination/top-three ranking, no fabricated videos/views, and URL validation.");
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
