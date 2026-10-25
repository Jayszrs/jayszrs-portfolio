import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { randomUUID } from 'node:crypto';
import { verifyAdminSession } from '@/backend/lib/admin-session.cjs';
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES, validateUpload, validUploadPath } from '@/frontend/lib/upload-policy.cjs';
import { uploadProvider, signedSupabaseUpload, storeSupabaseUpload } from '@/backend/lib/cms-upload-storage';

export const runtime = 'nodejs';
const failure = (error, status) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const session = (await cookies()).get('jayszrs_admin');
  if (!verifyAdminSession(session?.value)) return failure('Sesi admin habis. Silakan login ulang.', 401);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return failure('Asal permintaan tidak diizinkan.', 403);
  const provider = uploadProvider();
  if (provider !== 'supabase' && !process.env.BLOB_READ_WRITE_TOKEN) return failure('Storage upload belum terhubung di server. Periksa konfigurasi storage pada environment Production.', 503);

  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      if (Number(request.headers.get('content-length')) > 8192) return failure('Permintaan izin upload terlalu besar.', 413);
      let body;
      try { body = await request.json(); } catch { return failure('Permintaan izin upload tidak valid.', 400); }
      if (body?.type !== 'blob.generate-client-token') return failure('Jenis permintaan upload tidak didukung.', 400);
      let metadata;
      try { metadata = JSON.parse(body.payload?.clientPayload); } catch { return failure('Informasi file tidak valid.', 400); }
      const invalid = validateUpload(metadata);
      if (invalid) return failure(invalid, 400);
      if (!validUploadPath(body.payload?.pathname, metadata.type)) return failure('Nama file upload tidak valid.', 400);
      if (provider === 'supabase') return NextResponse.json(await signedSupabaseUpload(body.payload.pathname), { headers: { 'Cache-Control': 'no-store' } });
      const result = await handleUpload({
        request, body,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: [metadata.type], maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + 5 * 60 * 1000, addRandomSuffix: true, allowOverwrite: false,
        }),
      });
      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Small uploads from an already-open older CMS remain supported during rollout.
    // New CMS code sends bytes straight to Blob, outside the Function body limit.
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) return failure('Format permintaan upload tidak didukung.', 400);
    if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) return failure('Muat ulang CMS untuk mengunggah file besar, lalu pilih ulang file.', 413);
    let form;
    try { form = await request.formData(); } catch { return failure('Data upload tidak bisa dibaca.', 400); }
    const file = form.get('file');
    if (!file || typeof file === 'string') return failure('Tidak ada file yang dipilih.', 400);
    const invalid = validateUpload(file);
    if (invalid) return failure(invalid, 400);
    const pathname = `cms/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${UPLOAD_TYPES[file.type]}`;
    if (provider === 'supabase') return NextResponse.json({ url: await storeSupabaseUpload(pathname, file) });
    const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true, allowOverwrite: false });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[upload] Storage request failed', { name: error.name, code: error.code });
    if (/suspend/i.test(error.message)) return failure('Storage Vercel Blob sedang dinonaktifkan (suspended). Aktifkan kembali store sebelum mengunggah.', 503);
    return failure('Storage menolak upload. Periksa koneksi store, token, dan kuota Vercel Blob, lalu coba lagi.', 502);
  }
}
