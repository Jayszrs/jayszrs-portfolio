const assert = require("node:assert/strict");
const { readTikTokSocial, viewCount } = require("../backend/lib/tiktok-social.cjs");
const curation = require("../frontend/lib/social-curation.json");
const publicSnapshots = require("../backend/lib/tiktok-public-metrics.json");

async function main() {
  const username = curation.tiktokHandle;
  const curated = curation.tiktokVideos;
  const ids = curated.map((url) => url.split("/").at(-1));
  const baseline = await readTikTokSocial(username, { token: "", curated, publicSnapshots });
  assert.deepEqual(baseline.videos.map((video) => video.id), ids);
  assert.deepEqual(baseline.videos.map((video) => video.viewCount), [4700000, 1200000, 1100000]);
  assert.ok(baseline.videos.every((video) => video.viewCountSource === "public-snapshot" && Number.isFinite(Date.parse(video.viewCountCapturedAt))));
  assert.equal(publicSnapshots.field, "webapp.video-detail.itemInfo.itemStruct.stats.playCount");
  assert.ok(publicSnapshots.videos.every((row) => row.url === curated[ids.indexOf(row.videoId)]));
  for (const invalid of [null, undefined, true, false, "", "1.2M", "-1", -1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.equal(viewCount(invalid), null);
  assert.equal(viewCount("0"), 0);
  assert.equal(viewCount(0), 0);

  const metrics = [
    { videoId: ids[0], viewCount: "0", capturedAt: "2020-01-02T00:00:00Z" },
    { videoId: ids[0], viewCount: "9", capturedAt: "2020-01-01T00:00:00Z" },
    { videoId: ids[1], viewCount: "-5", capturedAt: "2020-01-02T00:00:00Z" },
    { videoId: ids[2], viewCount: 10, capturedAt: "not-a-date" },
    { videoId: "7000000000000000000", viewCount: 500, capturedAt: "2020-01-02T00:00:00Z" },
    null,
  ];
  const manual = await readTikTokSocial(username, { token: "", curated, metrics, publicSnapshots });
  assert.equal(manual.videos[0].viewCount, 0, "An explicit zero from the owner must override a public snapshot");
  assert.equal(manual.videos[0].viewCountSource, "owner-snapshot");
  assert.equal(manual.videos[1].viewCount, 1200000, "An invalid manual count must fall back to the verified snapshot");
  assert.equal(manual.videos[2].viewCount, 1100000, "Undated manual counts must not look live");
  const anotherOwner = await readTikTokSocial("another", { token: "", curated: curated.map((url) => url.replace(`@${username}`, "@another")), publicSnapshots });
  assert.ok(anotherOwner.videos.every((video) => video.viewCount === null), "Snapshots must stay bound to their verified account");
  const unavailable = await readTikTokSocial(username, { token: "", curated: [null, ...curated] });
  assert.ok(unavailable.videos.every((video) => video.viewCount === null));

  const requests = [];
  const fetcher = async (input, init) => {
    requests.push(input);
    assert.ok(init.headers.Authorization.startsWith("Bearer "));
    if (input.includes("/user/info/")) return Response.json({ data: { user: { username } }, error: { code: "ok" } });
    assert.ok(input.includes("/video/query/"), "An authorized token must query only the curated IDs");
    assert.deepEqual(JSON.parse(init.body).filters.video_ids, ids);
    return Response.json({ data: { videos: [{ id: ids[1], view_count: "0", title: "Verified zero" }, { id: ids[0], view_count: 4800001 }, { id: "7000000000000000000", view_count: 99999999 }] }, error: { code: "ok" } });
  };
  const api = await readTikTokSocial(username, { token: "test-only", curated, metrics, publicSnapshots, fetcher });
  assert.deepEqual(api.videos.map((video) => video.id), ids, "Live metrics must never replace or reorder the exact three owner selections");
  assert.deepEqual(api.videos.map((video) => video.viewCount), [4800001, 0, 1100000]);
  assert.equal(api.videos[0].viewCountSource, "tiktok-api");
  assert.equal(api.videos[1].viewCountSource, "tiktok-api");
  assert.equal(api.videos[2].viewCountSource, "public-snapshot", "Unavailable live counts keep their dated public fallback");
  assert.equal(api.complete, false);
  assert.equal(requests.length, 2);

  let mismatchedRequests = 0;
  await assert.rejects(readTikTokSocial(username, { token: "test-only", curated, fetcher: async () => { mismatchedRequests += 1; return Response.json({ data: { user: { username: "someone-else" } }, error: { code: "ok" } }); } }), /mismatch/);
  assert.equal(mismatchedRequests, 1, "An identity mismatch must stop before querying videos");
  await assert.rejects(readTikTokSocial(username, { token: "test-only", curated, fetcher: async () => new Response("Unavailable", { status: 401 }) }), /unavailable/);
  console.log("PASS: authentic dated TikTok snapshots, manual/live precedence, zero counts, exact curated order, account ownership, malformed counts/dates, and unavailable fallback.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
