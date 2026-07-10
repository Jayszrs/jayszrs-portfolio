import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readContent, writeContent } from "@/backend/lib/content";

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 80);
    const role = cleanText(body.role, 100);
    const comment = cleanText(body.comment, 900);
    const stars = Math.max(1, Math.min(5, Number(body.stars) || 5));

    if (!name || !comment) {
      return NextResponse.json({ error: "Nama dan masukan wajib diisi." }, { status: 400 });
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
