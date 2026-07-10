import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readContent, writeContent } from "@/backend/lib/content";

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanUrl(value) {
  const text = cleanText(value, 500);
  if (!text) return "";

  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 80);
    const role = cleanText(body.role, 100);
    const comment = cleanText(body.comment, 900);
    const proofText = cleanText(body.proofText, 500);
    const proofUrl = cleanUrl(body.proofUrl);
    const stars = Math.max(1, Math.min(5, Number(body.stars) || 5));

    if (!name || !comment) {
      return NextResponse.json({ error: "Nama dan deskripsi rating wajib diisi." }, { status: 400 });
    }

    const content = await readContent();
    const rating = {
      id: `rating-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      role,
      stars: String(stars),
      date: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
      comment,
      proofText,
      proofUrl,
      image: "",
      approved: "true",
    };

    await writeContent({
      ...content,
      ratings: [rating, ...(content.ratings || [])],
    });
    revalidatePath("/");

    return NextResponse.json({ ok: true, approved: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Rating gagal dikirim." }, { status: 500 });
  }
}
