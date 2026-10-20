import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/backend/lib/admin-session.cjs";

export async function GET() {
  const session = (await cookies()).get("jayszrs_admin");
  return NextResponse.json({ authenticated: verifyAdminSession(session?.value) }, { headers: { "Cache-Control": "no-store" } });
}
