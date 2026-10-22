const API = "https://open.tiktokapis.com/v2";

function viewCount(value) {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+$/.test(value.trim()))) return null;
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

function snapshotMetrics(rows, kind) {
  const result = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const id = String(row?.videoId || "");
    const count = viewCount(row?.viewCount);
    const timestamp = typeof row?.capturedAt === "string" ? Date.parse(row.capturedAt) : NaN;
    if (!/^\d{17,20}$/.test(id) || count === null || !Number.isFinite(timestamp) || timestamp > Date.now() + 60000) continue;
    const capturedAt = new Date(timestamp).toISOString();
    const previous = result.get(id);
    if (previous && previous.viewCountCapturedAt >= capturedAt) continue;
    result.set(id, { viewCount: count, viewCountSource: kind, viewCountCapturedAt: capturedAt, viewCountSourceLabel: String(row.source || "").slice(0, 120) });
  }
  return result;
}

function videoFromUrl(value, username) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["tiktok.com", "www.tiktok.com"].includes(url.hostname)) return null;
    const match = /^\/@([\w.]+)\/video\/(\d{17,20})\/?$/.exec(url.pathname);
    return match && match[1].toLowerCase() === username.toLowerCase() ? { id: match[2], url: `https://www.tiktok.com/@${username}/video/${match[2]}` } : null;
  } catch { return null; }
}

async function readTikTokSocial(username, { token = process.env.TIKTOK_ACCESS_TOKEN, curated = [], metrics = [], publicSnapshots = null, fetcher = fetch } = {}) {
  if (!/^[\w.]{1,32}$/.test(username)) throw new Error("Invalid TikTok account");
  const budget = AbortSignal.timeout(18000);
  const publicMetrics = snapshotMetrics(publicSnapshots?.username?.toLowerCase() === username.toLowerCase() ? publicSnapshots.videos : [], "public-snapshot");
  const ownerMetrics = snapshotMetrics(metrics, "owner-snapshot");
  const seenSelection = new Set();
  const selection = (Array.isArray(curated) ? curated : []).flatMap((value) => {
      const video = videoFromUrl(typeof value === "string" ? value : value?.url, username);
      if (!video || seenSelection.has(video.id)) return [];
      seenSelection.add(video.id);
      return [{ ...video, title: "Video pilihan", viewCount: null, ...(ownerMetrics.get(video.id) || publicMetrics.get(video.id) || {}) }];
    }).slice(0, 3);
  if (!token) {
    return { username, videos: selection, ranking: "curated", status: selection.length ? "ready" : "unavailable", complete: false };
  }
  const request = async (path, body) => {
    const response = await fetcher(`${API}${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: budget, cache: "no-store",
    });
    if (!response.ok) throw new Error("TikTok request unavailable");
    const result = await response.json();
    if (result.error?.code && result.error.code !== "ok") throw new Error("TikTok authorization unavailable");
    return result.data;
  };
  // Never display another account's videos if a server token is configured incorrectly.
  const identity = await request("/user/info/?fields=username");
  if (identity?.user?.username?.toLowerCase() !== username.toLowerCase()) throw new Error("TikTok account mismatch");
  if (selection.length) {
    // Query only the owner's exact choices. This endpoint also verifies video ownership.
    const data = await request("/video/query/?fields=id,title,video_description,view_count", { filters: { video_ids: selection.map((video) => video.id) } });
    const byId = new Map((Array.isArray(data?.videos) ? data.videos : []).map((video) => [String(video.id), video]));
    const capturedAt = new Date().toISOString();
    const videos = selection.map((video) => {
      const live = byId.get(video.id);
      const count = viewCount(live?.view_count);
      return count === null ? video : { ...video, title: String(live.title || live.video_description || video.title).slice(0, 250), viewCount: count, viewCountSource: "tiktok-api", viewCountCapturedAt: capturedAt, viewCountSourceLabel: "TikTok Display API" };
    });
    return { username, videos, ranking: "curated", status: "ready", complete: videos.every((video) => video.viewCountSource === "tiktok-api") };
  }
  let cursor;
  let complete = false;
  const seen = new Set();
  const videos = [];
  for (let page = 0; page < 50; page += 1) {
    const data = await request("/video/list/?fields=id,title,video_description,share_url,cover_image_url,view_count", { max_count: 20, ...(cursor ? { cursor } : {}) });
    for (const video of data?.videos || []) {
      if (!/^\d{17,20}$/.test(video.id) || seen.has(video.id)) continue;
      seen.add(video.id);
      videos.push({ id: video.id, url: `https://www.tiktok.com/@${username}/video/${video.id}`, title: String(video.title || video.video_description || "Video TikTok").slice(0, 250), cover: video.cover_image_url || "", viewCount: Number.isFinite(video.view_count) && video.view_count >= 0 ? video.view_count : null });
    }
    if (!data?.has_more) { complete = true; break; }
    if (!data.cursor || data.cursor === cursor) break;
    cursor = data.cursor;
  }
  return { username, videos: videos.filter((video) => video.viewCount !== null).sort((a, b) => b.viewCount - a.viewCount || a.id.localeCompare(b.id)).slice(0, 3), ranking: "views", status: "ready", complete, scanned: videos.length };
}

module.exports = { videoFromUrl, readTikTokSocial, viewCount };
