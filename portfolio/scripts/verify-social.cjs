const assert = require("node:assert/strict");
const { parseContributionCalendar, readGitHubSocial } = require("../backend/lib/github-social.cjs");

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
readGitHubSocial("../other-host").then(() => { throw new Error("Invalid username accepted"); }, () => {
  console.log("PASS: calendar counts, zero counts, thousands, ordering, unknown markup and username validation.");
});
