import { UPLOAD_TYPES, uploadType, validateUpload } from './upload-policy.cjs';

async function browserImage(file, onProgress) {
  if (!/^image\/(heic|heif)(-sequence)?$/.test(uploadType(file))) return file;
  onProgress?.(0, 'Menyiapkan foto HEIC/HEIF…');
  try {
    const { heicTo } = await import('heic-to/csp');
    const jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: .94 });
    if (!jpeg?.size) throw new Error('Empty image');
    return new File([jpeg], file.name.replace(/\.(heic|heif)$/i, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    throw new Error('Foto HEIC/HEIF tidak bisa dibaca. Pastikan file tidak rusak, atau ekspor sebagai JPG lalu unggah ulang.');
  }
}

export async function uploadFile(file, onProgress) {
  const invalid = validateUpload(file);
  if (invalid) throw new Error(invalid);
  file = await browserImage(file, onProgress);
  onProgress?.(0);
  const pathname = `cms/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${UPLOAD_TYPES[file.type]}`;
  let response;
  try {
    response = await fetch('/api/upload', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'blob.generate-client-token', payload: { pathname, multipart: false, clientPayload: JSON.stringify({ size: file.size, type: file.type }) } }),
    });
  } catch { throw new Error('Tidak bisa menghubungi server upload. Periksa koneksi lalu coba lagi.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || (response.status === 401 ? 'Sesi admin habis. Silakan login ulang.' : 'Izin upload gagal. Coba lagi.'));
  if (data.provider === 'supabase' && data.uploadUrl && data.url) {
    await new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('PUT', data.uploadUrl);
      request.setRequestHeader('Content-Type', file.type);
      request.setRequestHeader('cache-control', '3600');
      request.upload.onprogress = event => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100)); };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) { resolve(); return; }
        let result; try { result = JSON.parse(request.responseText); } catch { result = {}; }
        const exceedsStorage = request.status === 413 || /size|large|maximum|limit/i.test(result.message || result.error || '');
        reject(new Error(exceedsStorage ? 'File melampaui batas storage Supabase saat ini. CMS tidak menetapkan batas MB; periksa pengaturan atau paket storage.' : 'Storage menolak file. Periksa format file dan kuota storage, lalu coba lagi.'));
      };
      request.onerror = () => reject(new Error('Koneksi ke storage terputus. Coba unggah ulang.'));
      request.ontimeout = () => reject(new Error('Upload terlalu lama. Periksa koneksi lalu coba lagi.'));
      request.timeout = 0;
      request.send(file);
    });
    return data.url;
  }
  if (!data.clientToken) throw new Error('Izin upload tidak diterima. Muat ulang CMS lalu coba lagi.');
  try {
    const { put } = await import('@vercel/blob/client');
    const blob = await put(pathname, file, {
      access: 'public', token: data.clientToken, contentType: file.type,
      onUploadProgress: event => onProgress?.(Math.round(event.percentage)),
    });
    if (!blob.url) throw new Error('Missing upload URL');
    return blob.url;
  } catch (error) {
    if (/suspend/i.test(error.message)) throw new Error('Storage Vercel Blob sedang dinonaktifkan (suspended). Aktifkan kembali store sebelum mengunggah.');
    throw new Error('File gagal dikirim ke storage. Periksa koneksi atau kuota Vercel Blob, lalu coba lagi.');
  }
}
