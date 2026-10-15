# Media recovery: 15 October 2026

Recovery is incomplete. 202 distinct media URLs in the current content still have no accessible replacement.

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
- `../backups/unresolved-media-2026-10-15.json`: the remaining 202 URLs and their content fields.
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

## Second search, 15 October 2026

- Found the byte-identical Fulday logo in `C:/xampp/htdocs/Pemograman Web/Portofolio Jay Szrs/image/Logo Fulday.PNG`. Both size and MD5 match the listed Blob object `1783777091436-jax0ww.png`.
- Found the existing Akademi Crypto and SMPN 135 logos in that same original portfolio. These provide alternate logo sources for three additional blocked URLs; they are not claimed to be identical to the inaccessible Blob versions.
- Inspected additional roots under XAMPP, C:/src, public folders, application data, CapCut, Windows app packages and editor caches. Evidence and per-root counts are saved in `../backups/second-media-search-2026-10-15.json`.
- Checked Next.js image caches in the Fazma Stone and MahameruBaja projects: no additional exact URL matches.
- Checked all current image/PDF entries and commit history of the four GitHub repositories linked by the portfolio. No matching original Blob file size was present. A deleted 7 MB Laundryuk submission ZIP was recovered from its initial commit and checked: 79 entries, 7 image/PDF files, no exact originals matching the Blob inventory.
- Examined available Windows thumbnail caches: nine extracted thumbnails, none of the missing documentation photos.
- Internet Archive returned no captures of the Blob URLs. Historical deployment pages redirected to Vercel authentication; protection settings were not changed.
- The official Vercel CLI download operation also returned 403. No storage, token or billing changes were performed.
- Original CMS data was compared against the previous snapshot again: the six unrelated sections are unchanged; 67 certificates and 3 achievements remain present.
- Published as deployment `dpl_4kCBNypcg6Kph9UgaMUvtaasG1Rq` and promoted to `jayszrs.my.id`. All three newly restored image files return HTTP 200 with matching SHA-256 checksums; the deployed client bundle contains all four source mappings. Actual Experience and Education components render the recovered sources. Production build and certificate integrity checks passed. The release was staged from individually reviewed source files, excluding backups, credentials and caches.

## Third search, 15 October 2026

- Browser download-history metadata identified 55 size-matched candidate downloads, including 24 direct Google Photos downloads, public documentation images, LinkedIn media and expired image-conversion downloads. File-size matches alone were treated as candidates, not restored originals.
- Recovered two exact original WebP photos of the IPNU/IPPNU inauguration and work meeting from their public NU source URLs. Their bytes match both the size and MD5/ETag in the Blob inventory. They restore `experience.1.documentationImages.0` and `.1`, including their legacy fields. Original files were preserved in the local backup folder; CMS data was not changed.
- Identified 29 distinct Google Photos viewer links, including some original versions before image conversion/compression. Saved a private local link list under `../backups/photo-source-links-2026-10-15.html`; it is excluded from Git and deployment. No credentials or cookies were extracted. Direct Google Photos requests redirect to `accounts.google.com` and require the owner's login.
- Expired LinkedIn CDN URLs return 403; the public profile request returns 999. Expired image-conversion downloads return 400. These responses were not treated as recovered media.
- Inspected 54,525 additional browser storage/cache entries, including service-worker caches, browser file-system data and blob storage across Chrome profiles and Edge. Checked image/PDF payloads against the known Blob size/ETag values and inspected ZIP payloads where present. No additional matching original was found.
- Browser automation has no connected browser. Windows Computer Use initialization could load its package, but listing apps failed because its native pipe is unavailable. No authentication dialogs were automated and no account or browser settings were changed. The user was given the local source-link list and asked to log in manually or supply recovered original files.
- Both documentation photos were published in deployment `dpl_btct4Dzf4wYv5twgz5QgTh2WSDwK` and promoted to `jayszrs.my.id`. Production HTTP GETs return 200 with the exact original SHA-256 values; the deployed client bundle contains both recovery mappings. The actual Experience component renders the photos. Production build and all 91 original certificate integrity checks passed; six unrelated content sections and certificate counts remain unchanged.
