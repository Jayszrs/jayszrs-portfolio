import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readContent, writeContent } from "@/lib/content";

export async function GET() {
  const data = await readContent();
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const saved = await writeContent(body);
  return NextResponse.json(saved);
}
