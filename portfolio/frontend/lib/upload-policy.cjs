const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const UPLOAD_TYPES = Object.freeze({
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'application/pdf': 'pdf',
});

function validateUpload(file) {
  const { size, type } = file || {};
  if (typeof type !== 'string' || !Object.hasOwn(UPLOAD_TYPES, type)) return 'Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau PDF.';
  if (!Number.isSafeInteger(size) || size <= 0) return 'File kosong atau tidak valid.';
  if (size > MAX_UPLOAD_BYTES) return 'Ukuran file maksimal 10 MB.';
  return '';
}

function validUploadPath(pathname, type) {
  return typeof pathname === 'string'
    && /^cms\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|pdf)$/.test(pathname)
    && pathname.endsWith(`.${UPLOAD_TYPES[type]}`);
}

module.exports = { MAX_UPLOAD_BYTES, UPLOAD_TYPES, validateUpload, validUploadPath };
