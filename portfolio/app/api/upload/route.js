import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob"; // Import fungsi put

export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
  }

  const allowedTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
  };

  const ext = allowedTypes[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 10 MB" }, { status: 400 });
  }

  // Generate nama file unik
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Upload langsung ke Vercel Blob
  const blob = await put(safeName, file, {
    access: 'private',
  });

  // blob.url berisi link URL permanen dari Vercel
  return NextResponse.json({ url: blob.url });
}