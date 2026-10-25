const UPLOAD_TYPES = Object.freeze({
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'application/pdf': 'pdf',
  'image/heic': 'heic', 'image/heif': 'heif',
  'image/heic-sequence': 'heic', 'image/heif-sequence': 'heif',
});
const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';

function uploadType(file) {
  if (/\.heic$/i.test(file?.name || '')) return 'image/heic';
  if (/\.heif$/i.test(file?.name || '')) return 'image/heif';
  return file?.type;
}

function validateUpload(file) {
  const { size } = file || {};
  const type = uploadType(file);
  if (typeof type !== 'string' || !Object.hasOwn(UPLOAD_TYPES, type)) return 'Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, HEIC, HEIF, atau PDF.';
  if (!Number.isSafeInteger(size) || size <= 0) return 'File kosong atau tidak valid.';
  return '';
}

function validUploadPath(pathname, type) {
  return typeof pathname === 'string'
    && /^cms\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|heic|heif|pdf)$/.test(pathname)
    && pathname.endsWith(`.${UPLOAD_TYPES[type]}`);
}

module.exports = { UPLOAD_TYPES, IMAGE_UPLOAD_ACCEPT, uploadType, validateUpload, validUploadPath };
