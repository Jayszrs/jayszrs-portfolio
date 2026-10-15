import { NextResponse } from "next/server";
import { readContent } from "@/backend/lib/content";
import { readGitHubSocial } from "@/backend/lib/github-social.cjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await readContent();
    const url = new URL(content.profile.socials.github);
    if (url.protocol !== "https:" || !["github.com", "www.github.com"].includes(url.hostname)) throw new Error("Invalid profile");
    const github = await readGitHubSocial(url.pathname.split("/").filter(Boolean)[0]);
    return NextResponse.json({ github }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ github: null, message: "Aktivitas GitHub belum dapat dimuat. Buka profil untuk melihat pembaruan." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
