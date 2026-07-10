import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { readContent, writeContent } from "@/backend/lib/content";

export const dynamic = "force-dynamic";

function jsonNoStore(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function revalidatePublicPages() {
  ["/", "/tentang", "/pengalaman", "/proyek", "/pencapaian", "/kontak"].forEach((path) => {
    revalidatePath(path);
  });
}

export async function GET() {
  try {
    return jsonNoStore(await readContent({ fresh: true }));
  } catch (err) {
    console.error("Read Content Error:", err);
    return jsonNoStore({ error: "Konten gagal dimuat" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = await writeContent(body);
    revalidatePublicPages();
    return jsonNoStore({ success: true, content });
  } catch (err) {
    console.error("API Route Error:", err);
    return jsonNoStore({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
