# CMS media uploads

The admin requests a signed, file-specific upload URL from `/api/upload`, then sends file bytes directly to storage. Only a small JSON request crosses Vercel Functions. This avoids the platform's 4.5 MB request-body limit while retaining the CMS's 10 MB file limit. Admin session and same-origin checks run before signing; supported formats are JPEG, PNG, WebP, GIF and PDF. Original filenames are replaced by unique paths and overwrites are disabled.

Production uses `CMS_UPLOAD_STORAGE=supabase` and the existing Supabase project. The public `portfolio-media` bucket enforces a 10 MB maximum and the supported MIME types. No anonymous INSERT/UPDATE policies are added; uploads require a signed URL issued by the authenticated admin endpoint. Signed upload URLs expire after two hours, as defined by Supabase. The service key stays on the server. Public media URLs go into the editor and are persisted only when the owner saves the form.

Configuration:

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`).
- `CMS_UPLOAD_STORAGE=supabase` and optional `CMS_UPLOAD_BUCKET=portfolio-media`.
- Before enabling this backend, run `node scripts/prepare-cms-storage.cjs`. It creates a missing bucket with the restrictions above, tests a signed upload and public read, and removes only its temporary test object.
- `CMS_UPLOAD_STORAGE=blob` selects the retained Vercel Blob backend and requires `BLOB_READ_WRITE_TOKEN`. Its client tokens expire after five minutes, restrict the exact path/MIME and 10 MB maximum, and disallow overwrite.

On 25 October 2026, the connected Vercel Blob store reported `billingState: suspended`, `usageQuotaExceeded: true`, `status: limits-exceeded-suspended`. Uploads returned “This store has been suspended.” This is separate from the server-upload body limit. New uploads now use Supabase; existing Blob objects and stored URLs are preserved. Old Blob URLs can still return 403 until the owner's Blob quota/suspension is resolved with Vercel. No billing plan or spending limit was changed.

Verification: `node scripts/verify-cms-upload.cjs http://localhost:3118` (or the production origin). This uses real admin authentication, uploads a temporary 6 MB image and PDF through the browser, verifies public retrieval and form URLs, checks invalid/oversized/unauthenticated requests, and deletes its own temporary objects. It blocks CMS content POSTs, so it never saves or replaces the owner's profile or records. Credentials and signed URLs are not printed.
