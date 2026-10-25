import { createClient } from '@supabase/supabase-js';

export const uploadProvider = () => process.env.CMS_UPLOAD_STORAGE || 'blob';

export function supabaseUploads() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase storage is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    .storage.from(process.env.CMS_UPLOAD_BUCKET || 'portfolio-media');
}

export async function signedSupabaseUpload(pathname) {
  const storage = supabaseUploads();
  const { data, error } = await storage.createSignedUploadUrl(pathname, { upsert: false });
  if (error) throw error;
  return { provider: 'supabase', uploadUrl: data.signedUrl, url: storage.getPublicUrl(pathname).data.publicUrl };
}

export async function storeSupabaseUpload(pathname, file) {
  const storage = supabaseUploads();
  const { error } = await storage.upload(pathname, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return storage.getPublicUrl(pathname).data.publicUrl;
}
