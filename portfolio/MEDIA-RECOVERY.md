# Media recovery: 15 October 2026

Recovery is incomplete. 208 distinct media URLs in the current content still have no accessible replacement.

## Verified storage state

Read-only inspection with the existing Vercel CLI credentials returned:

- Store: `jayszrs-blob`, ID `store_LBWD86fIVkbbINEd`.
- Status: `limits-exceeded-suspended`.
- Billing state: `suspended`; `usageQuotaExceeded: true`.
- 369 listed objects, total size 280,164,989 bytes.
- All 215 initially unresolved URLs were present in that listing.
- Public download and authenticated SDK `get()` both returned HTTP 403. A listed object does not establish that its bytes can currently be downloaded or verified.

Dashboard: https://vercel.com/jaelanisuryasaputra-2719s-projects/~/stores/blob/store_LBWD86fIVkbbINEd

Vercel documents that Hobby Blob access stops when usage limits are exceeded and requires waiting 30 days. No exact reset date was returned by the store metadata. No plan upgrade, payment, trial, token rotation, permission change, upload, or deletion was performed during this recovery.

Documentation: https://vercel.com/docs/vercel-blob/usage-and-pricing#hobby

## Recovery performed

- Two Selected Design posters were obtained from the exact Drive source links already attached to those records. Complete original PNGs were preserved under `../backups/recovered-originals-2026-10-15/`. WebP display copies keep the full poster composition. These are original design sources, not byte-identical copies of the smaller Blob uploads.
- Five experience logos were sourced from their official organization websites: Etiqa, Kawan Kerja, Fazmastone, FKG UI, and PT Karya Intertek Kencana. They replace blocked organization logos, not personal documentation photos.
- Source links and checksums are recorded in `backend/data/media-recovery-sources.json`.
- The admin experience header now resolves recovered media in the same way as the public website. The form no longer claims a failed preview is ready.
- Profile, education, experience, projects, Selected Design, and ratings data were compared against the pre-repair snapshot and are exactly unchanged. Original Blob references remain in the CMS.
- The earlier certificate import remains intact: 91 original files, 67 certificates and 3 achievements.

## Searches completed

- Existing Next.js image cache: 14 exact URL matches had already been recovered.
- 2,168 image/PDF files across Downloads, OneDrive, Documents, Desktop, Pictures and Videos: no additional exact original for the 215 unresolved URLs.
- 8,044 Chrome/Edge cache entries: no matching original URL or recoverable payload.
- Git history, local ZIP archives, Temp and Recycle Bin: no additional exact original for the unresolved URLs. Size and MD5/Blob ETag comparisons were used where possible.
- Four existing Canva presentation links returned HTTP 403. No presentation screenshots were invented or substituted.

## Preserved evidence and next step

- `../backups/blob-object-inventory-2026-10-15.json`: metadata for all 369 listed objects; no credentials.
- `../backups/unresolved-media-2026-10-15.json`: the remaining 208 URLs and their content fields.
- `../backups/content-2026-10-15.json`: pre-repair content snapshot.
- `scripts/backup-blob-readonly.cjs`: uses only the SDK's read operations. Lists by default; `--download` backs up original bytes locally with size/ETag integrity checks, resumes existing valid files, and stops at the first storage-block response.

The remaining CMS-only originals require the provider to restore read access or supply an export. Changing frontend fallbacks cannot retrieve bytes from a suspended store. The store and original references must be retained.

After access is restored:

```bash
node scripts/backup-blob-readonly.cjs --download
```

Review and map verified originals to website assets before publishing. This command only backs up files; it does not change the site or storage.

## Validation

- Production Next.js build passed.
- Certificate integrity/import verification passed for all 91 original files and 70 records.
- All seven additional source mappings point to existing, decodable local images.
- Production deployment `dpl_JDhZRH8Y4ZzvLRw4DVr3yQyexGgJ` was promoted to `jayszrs.my.id`. All seven images returned HTTP 200 with matching SHA-256 checksums; its client bundle includes all seven mappings. Actual SelectedDesigns and Experience component server rendering resolves those mappings.
- The public API still returns 67 certificates and 3 achievements; the Ethical Hacker PDF returns HTTP 200 with the original checksum. The six unrelated content sections remain unchanged after deployment.
- Browser interaction testing is unavailable because no browser is connected.
