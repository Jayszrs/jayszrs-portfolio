import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = cookies().get("jayszrs_admin");
  return NextResponse.json({ authenticated: session?.value === "ok" });
}
