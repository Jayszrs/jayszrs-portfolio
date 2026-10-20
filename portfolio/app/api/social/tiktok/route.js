import { NextResponse } from "next/server";
import { readContent } from "@/backend/lib/content";
import { readTikTokSocial } from "@/backend/lib/tiktok-social.cjs";
import curation from "@/frontend/lib/social-curation.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await readContent();
    const url = new URL(content.profile.socials.tiktok);
    if (url.protocol !== "https:" || !["www.tiktok.com", "tiktok.com"].includes(url.hostname)) throw new Error("Invalid account");
    const username = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    const curated = content.profile.socialHighlights?.tiktokVideos || (username?.toLowerCase() === curation.tiktokHandle ? curation.tiktokVideos : []);
    let tiktok;
    try { tiktok = await readTikTokSocial(username, { curated }); }
    catch { tiktok = await readTikTokSocial(username, { curated, token: "" }); }
    return NextResponse.json({ tiktok }, { headers: { "Cache-Control": tiktok.status === "ready" ? "public, s-maxage=1800, stale-while-revalidate=3600" : "no-store" } });
  } catch {
    return NextResponse.json({ tiktok: null, message: "Video TikTok belum bisa dimuat." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
