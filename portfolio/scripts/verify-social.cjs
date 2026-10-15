const assert = require("node:assert/strict");
const { parseContributionCalendar, parseProfileReadme, readGitHubSocial } = require("../backend/lib/github-social.cjs");

const html = `
<td id="c" data-level="4" data-date="2026-10-03"></td>
<td data-date="2026-10-01" id="a" data-level="0"></td>
<td data-date="2026-10-02" data-level="2" id="b"></td>
<td data-date="2026-10-04" id="missing" data-level="0"></td>
<tool-tip for="a">No contributions on October 1st.</tool-tip>
<tool-tip for="b">1 contribution on October 2nd.</tool-tip>
<tool-tip for="c">1,234 contributions on October 3rd.</tool-tip>
<tool-tip for="missing">Markup changed; count is unknown.</tool-tip>`;
assert.deepEqual(parseContributionCalendar(html), [
  { date: "2026-10-01", count: 0, level: 0 },
  { date: "2026-10-02", count: 1, level: 2 },
  { date: "2026-10-03", count: 1234, level: 4 },
]);
assert.deepEqual(parseContributionCalendar("<html>Service unavailable</html>"), []);
const markdown = `# About Me
I build web projects.<br><br>I collaborate.<br><br>I explore.<br><br>I learn.<br><br>Ask me.<br><br>Fun fact.
## Socials
[Profile](https://github.com/TestUser)
# Tech Stack:
![JavaScript](https://img.shields.io/badge/js-yellow) ![JavaScript](https://img.shields.io/badge/js-black) ![React](https://img.shields.io/badge/react-blue)
# GitHub Stats
![Not a technology](https://img.shields.io/badge/stats-green)`;
const parsed = parseProfileReadme(markdown, "TestUser");
assert.equal(parsed.blocks.length, 6);
assert.equal(parsed.blocks[0].body, "I build web projects.");
assert.deepEqual(parsed.technologies, ["JavaScript", "React"]);
assert.equal(parsed.sourceUrl, "https://github.com/TestUser/TestUser#readme");
assert.equal(parseProfileReadme("", "TestUser").blocks.length, 0);
assert(!parseProfileReadme("# About Me\n<img src=x onerror=alert(1)>Hello", "TestUser").blocks[0].body.includes("<img"));

async function verify() {
  await assert.rejects(readGitHubSocial("../other-host"));
  const originalFetch = global.fetch;
  let contributorError = false;
  global.fetch = async (input) => {
    const url = new URL(input);
    if (url.pathname.endsWith("/contributions")) return new Response("Unavailable", { status: 503 });
    if (url.pathname.endsWith("/readme")) return Response.json({ encoding: "base64", content: Buffer.from(markdown).toString("base64") });
    if (url.pathname.endsWith("/contributors")) return contributorError ? new Response("Rate limited", { status: 403 }) : Response.json([{ login: "TESTUSER", contributions: url.pathname.includes("older") ? 12 : 3 }]);
    if (url.pathname.endsWith("/repos")) return Response.json([
      { name: "newer", html_url: "https://github.com/TestUser/newer", owner: { login: "TestUser" }, pushed_at: "2026-10-10", stargazers_count: 0 },
      { name: "older", html_url: "https://github.com/TestUser/older", owner: { login: "TestUser" }, pushed_at: "2026-09-10", stargazers_count: 0 },
      { name: "fork", fork: true, owner: { login: "TestUser" } },
      { name: "foreign", owner: { login: "SomeoneElse" } },
    ]);
    return Response.json({ login: "TestUser", followers: 0, public_repos: 4 });
  };
  try {
    const data = await readGitHubSocial("TestUser");
    assert.equal(data.followers, 0);
    assert.equal(data.rankedRepositoryCount, 2);
    assert.equal(data.verifiedRepositoryCount, 2);
    assert.equal(data.topRepositories[0].name, "older");
    assert.equal(data.rankingKind, "owner-commits");
    assert.equal(data.totalContributions, null, "Unavailable calendar must not become a fabricated zero");
    assert.equal(data.readme.blocks.length, 6);
    contributorError = true;
    const fallback = await readGitHubSocial("TestUser");
    assert.equal(fallback.rankingKind, "recent-repositories");
    assert.equal(fallback.topRepositories[0].name, "newer");
    assert.equal(fallback.verifiedRepositoryCount, 0);
  } finally { global.fetch = originalFetch; }
  console.log("PASS: calendar parsing, README content and tech stack, username validation, repository scope, verified commit ranking, rate-limit fallback and unknown totals.");
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
