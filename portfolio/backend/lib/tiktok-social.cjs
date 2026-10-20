const API = "https://open.tiktokapis.com/v2";

function videoFromUrl(value, username) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["tiktok.com", "www.tiktok.com"].includes(url.hostname)) return null;
    const match = /^\/@([\w.]+)\/video\/(\d{17,20})\/?$/.exec(url.pathname);
    return match && match[1].toLowerCase() === username.toLowerCase() ? { id: match[2], url: `https://www.tiktok.com/@${username}/video/${match[2]}` } : null;
  } catch { return null; }
}

async function readTikTokSocial(username, { token = process.env.TIKTOK_ACCESS_TOKEN, curated = [], fetcher = fetch } = {}) {
  if (!/^[\w.]{1,32}$/.test(username)) throw new Error("Invalid TikTok account");
  const budget = AbortSignal.timeout(18000);
  if (!token) {
    const seen = new Set();
    const videos = curated.flatMap((value) => {
      const video = videoFromUrl(typeof value === "string" ? value : value.url, username);
      if (!video || seen.has(video.id)) return [];
      seen.add(video.id);
      return [{ ...video, title: "Video pilihan", viewCount: null }];
    }).slice(0, 5);
    return { username, videos, ranking: "curated", status: videos.length ? "ready" : "unavailable", complete: false };
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
  return { username, videos: videos.filter((video) => video.viewCount !== null).sort((a, b) => b.viewCount - a.viewCount || a.id.localeCompare(b.id)).slice(0, 5), ranking: "views", status: "ready", complete, scanned: videos.length };
}

module.exports = { videoFromUrl, readTikTokSocial };
