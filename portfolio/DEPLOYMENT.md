# Deployment Checklist

## Vercel Environment Variables

Set these in Vercel Dashboard > Project > Settings > Environment Variables.

```env
NEXT_PUBLIC_SITE_URL=https://www.jayszrs.my.id
ADMIN_PASSWORD=isi_password_admin
NEXT_PUBLIC_SUPABASE_URL=isi_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isi_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=isi_supabase_service_role_key
BLOB_READ_WRITE_TOKEN=isi_vercel_blob_read_write_token
GOOGLE_SITE_VERIFICATION=isi_kode_google_search_console
```

Redeploy after changing environment variables.

## Domain

Use `www.jayszrs.my.id` as the production domain.

- `www.jayszrs.my.id` connects to Production.
- `jayszrs.my.id` redirects permanently to `www.jayszrs.my.id`.

## Google Search Console

1. Add URL prefix property: `https://www.jayszrs.my.id`.
2. Choose HTML tag verification.
3. Copy only the `content` value into `GOOGLE_SITE_VERIFICATION`.
4. Redeploy in Vercel.
5. Click Verify in Google Search Console.
6. Submit sitemap: `https://www.jayszrs.my.id/sitemap.xml`.

## Local Check

```bash
npm run build
```
