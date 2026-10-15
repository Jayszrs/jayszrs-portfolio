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

## Admin portal

- Production: `https://jayszrs.my.id/admin` (or `/admin` on the `www` domain).
- Local: `http://localhost:3000/admin`.
- Use the password configured as `ADMIN_PASSWORD` for the deployed project. Local `.env.local` may have a different password.
- Saving content updates the database without deleting any original Blob files. Uploads still use the existing Blob upload route.

## Media recovery without changing Blob Storage

Direct requests to sampled production image/PDF URLs returned HTTP 403; the sampled PDF response body was `Your store is blocked`. This confirms a storage access block, but does not verify whether each original file still exists. A frontend change cannot restore access to those originals. No Blob settings, tokens, permissions, or stored files were changed during this repair.

A public content snapshot and 48 unique PDF URL references were saved under the repository's `backups/` directory. These preserve content and file references only, not PDF bytes. Keep them until the originals can be downloaded after access is restored.

Fourteen exact image URL matches were recovered from the local Next.js image cache into `public/recovered-media/`. `frontend/lib/recovered-media.json` maps the original URLs to these bundled copies, which are also used in admin previews. These are cached image versions, not full-resolution original files; some logos are only 128 pixels wide. Keep these assets tracked so Vercel includes them in the next deployment.

To recover additional exact matches from another existing Next.js 14 image cache, use a content JSON export containing the original URLs:

```bash
node scripts/recover-media-cache.cjs path/to/content-export.json path/to/.next/cache/images
```

The recovery script only reads local files and copies matching cache entries into the project. It never calls Blob APIs or updates content records. Media without a recovered copy still requires an accessible original or a matching backup. Do not replace missing documentation with unrelated images.

Blob images are served directly to avoid routing failed downloads through `/_next/image`. Other remote images retry their original URL once if optimization fails. The media viewer shows an unavailable message for failed images and checks Blob PDF availability before embedding them.

The manifest uses a relative `start_url` so the app stays on the origin where it was opened, including localhost and preview deployments.
