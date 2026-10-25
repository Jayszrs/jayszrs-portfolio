# CMS media uploads

The admin requests a signed, file-specific upload URL from `/api/upload`, then sends file bytes directly to storage. Only a small JSON request crosses Vercel Functions, avoiding the platform's request-body limit. The CMS sets no maximum MB or minimum MB; empty/invalid files are rejected. Admin session and same-origin checks run before signing; supported inputs are JPEG, PNG, WebP, GIF, HEIC, HEIF and PDF. Original filenames are replaced by unique paths and overwrites are disabled.

Production uses `CMS_UPLOAD_STORAGE=supabase` and the existing Supabase project. The public `portfolio-media` bucket restricts MIME types but has no custom file-size cap (`file_size_limit: null`). Project/provider limits and quotas still apply: Supabase Free supports up to 50 MB per file; paid plans permit higher global limits. The CMS does not claim unlimited provider capacity, and shows a specific storage-limit error if a transfer exceeds it. Uploads have progress reporting and no arbitrary two-minute client timeout.

HEIC/HEIF input is recognized by MIME or filename (including an empty MIME from Windows). The admin lazily loads the CSP-safe `heic-to` decoder only for those files and converts the primary image to JPEG at original dimensions, quality 0.94, before upload. The UI explains that HEIC becomes JPG. Ordinary uploads and public portfolio pages do not load the decoder. Corrupt HEIC files fail before any transfer. Notices and replacement-source information are under `public/third-party/heic-to/`.

No anonymous INSERT/UPDATE policies are added; uploads require a signed URL issued by the authenticated admin endpoint. Signed upload URLs expire after two hours, as defined by Supabase. The service key stays on the server. Public media URLs go into the editor and are persisted only when the owner saves the form.

Configuration:

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`).
- `CMS_UPLOAD_STORAGE=supabase` and optional `CMS_UPLOAD_BUCKET=portfolio-media`.
- Before enabling this backend, run `node scripts/prepare-cms-storage.cjs`. It creates a missing bucket or removes a previous CMS bucket cap while preserving public access and MIME restrictions, tests a signed upload and public read, and removes only its temporary test object. It never changes a private bucket to public automatically.
- `CMS_UPLOAD_STORAGE=blob` selects the retained Vercel Blob backend and requires `BLOB_READ_WRITE_TOKEN`. Its client tokens expire after five minutes, restrict the exact path/MIME and disallow overwrite; no CMS maximum size is added.

On 25 October 2026, the connected Vercel Blob store reported `billingState: suspended`, `usageQuotaExceeded: true`, `status: limits-exceeded-suspended`. Uploads returned “This store has been suspended.” This is separate from the server-upload body limit. New uploads now use Supabase; existing Blob objects and stored URLs are preserved. Old Blob URLs can still return 403 until the owner's Blob quota/suspension is resolved with Vercel. No billing plan or spending limit was changed.

Verification: `node scripts/verify-cms-upload.cjs http://localhost:3119` (or the production origin). This uses real admin authentication, uploads a temporary 13 MB image, a converted real HEIC and a PDF through the browser, verifies public retrieval and form URLs, checks corrupt/empty/unauthenticated requests, and deletes its own temporary objects. It blocks CMS content POSTs, so it never saves or replaces the owner's profile or records. Credentials and signed URLs are not printed. The HEIC fixture is the upstream libheif example at `https://raw.githubusercontent.com/strukturag/libheif/master/examples/example.heic`, stored only in the ignored review directory.
