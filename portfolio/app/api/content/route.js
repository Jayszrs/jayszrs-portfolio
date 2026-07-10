import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readContent, writeContent } from "@/backend/lib/content";

export async function GET() {
  try {
    return NextResponse.json(await readContent());
  } catch (err) {
    console.error("Read Content Error:", err);
    return NextResponse.json({ error: "Konten gagal dimuat" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await writeContent(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
