import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { readContent, writeContent } from "@/backend/lib/content";

export const dynamic = "force-dynamic";

function jsonNoStore(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function revalidatePublicPages() {
  ["/", "/tentang", "/pendidikan", "/keahlian", "/pengalaman", "/proyek", "/pencapaian", "/kontak"].forEach((path) => {
    revalidatePath(path);
  });
}

function isManagedBlobUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function collectBlobUrls(value, urls = new Set()) {
  if (!value) return urls;

  if (typeof value === "string") {
    if (isManagedBlobUrl(value)) urls.add(value);
    return urls;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectBlobUrls(item, urls));
    return urls;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectBlobUrls(item, urls));
  }

  return urls;
}

async function cleanupRemovedBlobUrls(previousContent, nextContent) {
  const previousUrls = collectBlobUrls(previousContent);
  const nextUrls = collectBlobUrls(nextContent);
  const removedUrls = [...previousUrls].filter((url) => !nextUrls.has(url));

  if (!removedUrls.length) return;

  const results = await Promise.allSettled(removedUrls.map((url) => del(url)));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn("Blob cleanup skipped:", removedUrls[index], result.reason?.message || result.reason);
    }
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
    const previousContent = await readContent({ fresh: true });
    const content = await writeContent(body);
    await cleanupRemovedBlobUrls(previousContent, content);
    revalidatePublicPages();
    return jsonNoStore({ success: true, content });
  } catch (err) {
    console.error("API Route Error:", err);
    return jsonNoStore({ error: err.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
