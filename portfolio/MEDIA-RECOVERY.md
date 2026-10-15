# Media recovery: 15 October 2026

Image recovery is incomplete. 128 distinct media URLs still have no accessible replacement. The 79 earlier website PDFs resolve to verified local copies; seven additional project PDFs are now available (two source report exports and five clearly labeled design previews). Seven project recovery records provide source media, documents or a recovered cover. The original bytes of 197 Blob objects still await download; those references have been preserved.

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
- `../backups/unresolved-media-2026-10-15.json`: the remaining 162 URLs without accessible replacement media.
- `../backups/blob-originals-not-yet-downloaded-2026-10-15.json`: 202 original Blob URLs still awaiting a download, including the project images now represented by Canva source previews.
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

## Fourth search: project documentation

- Checked 389 embedded images in 76 local Office documents and 1,228 embedded images in 226 PDFs. No additional byte-identical original matched the Blob inventory. Checked 41,346 image/PDF candidates in IDE and agent media directories, also with no exact original match.
- The documented Canva oEmbed endpoint returned the titles, authors and public embed links of four exact projects linked by the CMS. The normal embed page with a supported browser client header supplied its native page previews. Downloaded and visually inspected every preview: INSYFEST (9 pages), WINACTION (10), Prabangkara Harmoni (16), and SIEM analysis (10).
- These are provider-generated previews of the actual source designs, not copies of the inaccessible Blob image bytes. Native preview sizes are approximately 595 x 335; three final Prabangkara logo pages are square. No upscaling, image generation, invented documentation or replacement stock images were used. The public interface links to the original presentation for full resolution.
- `frontend/lib/recovered-project-media.json` preserves the original project link, all 40 legacy media URLs, source version, page order, dimensions and SHA-256 values. Exact downloaded files are served locally under `/recovered-media/canva/` and backed up under `../backups/recovered-canva-pages-2026-10-15/`.
- `withRecoveredProjectMedia` provides a display-only source collection for these four exact project IDs and their unchanged media/link snapshots. This preserves all CMS data, including the older 11-image Prabangkara selection; its current 16-page source deck is displayed separately. Any later admin media/link edits take precedence over the recovery snapshot.
- Figma public oEmbed metadata and overview thumbnails were obtained. They were not substituted for individual documentation screenshots; the generic Project IMK overview does not establish the correct BisKita prototype frame. A connected Figma account is still needed to inspect/export the appropriate frames. Canva and Figma plugins were suggested but no connection was confirmed.
- Browser control remains unavailable (`chrome` is not available). No account, Blob, billing, token or protection settings were changed.
- Verification passed for all 45 native preview checksums, actual Gallery cover rendering, preservation of CMS data, and precedence of later admin media/link edits.
- Published as deployment `dpl_7rFGGhSiVAdmNB46uPanD9ToV2TB` and promoted to `jayszrs.my.id`. Production GETs verified all 45 PNG files with matching SHA-256 checksums and the deployed project bundle contains all four source collections. All 12 non-rating CMS sections match the pre-release snapshot; 67 certificates and 3 achievements remain intact. Local and production builds passed. Release staging excluded backups, credentials and caches.
- Remaining 162 distinct URLs without an accessible replacement are grouped as: projects 93, profile 8, education 24, experience 36, and ratings 1. Original references remain preserved; the 40 older Canva Blob files are also retained separately in the 202-object original-download backlog.

## Deployment repair

- Git deployment for commit `ed57c45` failed in `next/font/google` while parsing a downloaded font URL (`Cannot read properties of null (reading '1')`).
- Bundled the official Plus Jakarta Sans variable font and its OFL license under `app/fonts/`; `app/layout.js` now uses `next/font/local` with the same CSS variable and 400–800 weight range. Builds no longer request Google Fonts for this font. Upstream version and SHA-256 are recorded beside the font.
- Clean local build passed. A production build with its cache disabled also passed, deployment `dpl_8w5kU464UJLGZxjh8UvhJWDgwzU3`, and was promoted to `jayszrs.my.id`. The homepage and emitted font return HTTP 200; the served font SHA-256 matches the original. All 12 non-rating CMS sections remain unchanged, including 67 certificates and 3 achievements. No Blob or billing settings changed. Source changes have not been committed or pushed to GitHub.

## Connected Google Drive recovery

- The connected Google Drive account became available. Located and downloaded the exact original four-page CV (711,860 bytes, MD5 `9236b360ac80cb529870f6cfddc18fac`). Its size and MD5 match the original Blob inventory. The original CMS URL is preserved; the public CV preview and download controls now resolve the local recovery mapping.
- Recovered four exact original school documentation photos: `IMG_4307.JPG`, `IMG_4306.JPG`, `IMG-20220804-WA0020.jpg`, and `IMG_4262.JPG`. Also found the exact ICT Programming certificate image `Jaelani Surya.jpg`.
- Paginated the accessible Drive image metadata before 18 July 2026: 27 provider pages, 1,727 image entries. A separate owned-file pass returned 376 entries. Seven file-size candidates were checked; two known-size candidates were not assumed to be matching originals. One additional source photo, `dji_mimo_20260609_152804_0_1780999896756_photo.jpg`, matched three Blob URLs, upgrading their earlier cached image variants to the original bytes.
- Seven exact source files cover nine original Blob references. SHA-256, provenance and local paths are recorded in `backend/data/media-recovery-sources.json`; display mappings are in `frontend/lib/recovered-media.json`. Every recovery required both size and MD5/ETag equality. A same-named `IMG_2307.JPG` did not establish content identity and was not substituted.
- Downloaded two source portfolio PDFs, the Kawan Kerja internship report, and a PDF export of the clipper account report into the private local recovery folder. Examined 250 embedded images in the first four PDFs and six in the account report; no byte-identical Blob original was found in those PDF images. These source documents and extracted images have not been published. `backups/connected-drive-recovery-*/` is excluded from Git and all backups are excluded from deployment.
- Verified all 78 certificate PDFs by production HTTP GET and SHA-256. Deployment `dpl_8ewJxZZE4FHjTxgXiE3wRKKHFnzR` restored the CV and four school photos. All 79 PDF references in current public content resolve to verified files, including the CV download link in homepage HTML. All 12 non-rating CMS sections are unchanged; 67 certificates and 3 achievements remain intact. Build and certificate integrity checks passed. Blob contents, settings, billing and tokens were not changed.
- Final deployment `dpl_x8ARPc6SzdG4AgA7eWxKmUpnVLDk` adds the full-resolution source photo. It passed the production build (20 seconds) and was promoted to `jayszrs.my.id`. Target: production; framework: Next.js 14.2.35; source: local recovery changes based on commit `8103a67`. Seven original files serve nine reference mappings, with 157 unrelated image URLs still unresolved. Browser interaction is unavailable; verification covers public file responses, checksums, download HTML, client mappings and content API readback.

## Project documents, issuer logos, and social media

- Found the original source Google Docs for the restaurant POS project (37-page PDF export) and BusKita (43-page PDF export). Their project titles, author and screenshots match the portfolio records. Published the complete exports and 37 embedded diagram/screenshot previews. Display images use WebP; the PDF exports and original extracted image files are preserved. These are source-document recoveries, not claims that their bytes equal the blocked Blob screenshots.
- Exported the BusKita and Budidaya Uang home screens from their Figma sources. The first image downloader rejected differing response sizes; subsequent exports hit the Figma Starter tool limit. No upgrade or billing change occurred. The two earlier export URLs were successfully downloaded and checked using Node fetch. Budidaya Uang uses the recovered cover while retaining its five unresolved documentation references. BusKita displays the older source-report screenshot collection. Downloaded 44 source-document inline images as an additional search; none matched Blob size and MD5 together.
- Added seven labeled PDF downloads/previews to project details: the two complete report exports, four PDFs compiled from recovered Canva preview pages, and a single-page PDF preview of the recovered Budidaya Uang home screen. Compiled previews are explicitly labeled as previews and link to the original designs.
- Added issuer logos for Dicoding, Microsoft, Indosat, ID-Networkers, BIGFAIR, International Youth Goals, the Web3 University partners, and HMTI. Logos come from official brand assets or unmodified logo regions extracted from original certificates. Added issuer-name resolution for imported certificates whose image fields previously showed tiny certificate thumbnails. Explicit CMS logo edits take precedence. Provenance and checksums: `backend/data/issuer-logo-recovery.json`.
- Added certificate search and issuer filtering. Fixed the certificate detail header to open the selected certificate document rather than falling back to the first certificate in the gallery.
- Fixed stale content caching: public rendering had 33 certificates while the fresh API returned 67. Read clients now specify a 60-second revalidation interval and a content tag; fresh reads bypass that cache. Saving CMS content invalidates the tag and public routes. The writer, CMS records, original media URLs and Blob settings are unchanged. Both local and production certificate page HTML now render 67 certificates with the new issuer logos.
- Added a social section directly below the homepage Hero, using the existing glass/emerald theme and keyboard-operable platform tabs. GitHub reads public contribution calendar data and repository contributor counts on the server; API responses are cached, request deadlines and unavailable states are handled, and no credentials are exposed. The ranked list states its repository scope. The Instagram tab embeds the configured profile when public embedding is permitted; the TikTok tab loads its official creator embed only when opened and provides an unavailable state/profile link.
- The user confirmed Instagram is a personal account. Instagram Story, Notes/music synchronization and TikTok repost synchronization are **not implemented**. The profile embeds do not provide those feeds, and no authentication or account-type changes were performed. TikTok's creator embed shows recent uploads, not a repost timeline.
- Calendar parser tests, invalid-username checks, project integrity checks, edit-precedence checks, the original certificate integrity check and production builds passed. Browser control returned no connected apps/browsers, so interactive browser and third-party embed playback remain unverified. Local HTTP checks covered UI HTML, the social API and 67-certificate rendering.
- Production deployment `dpl_8ojkjAFQnYjHyBQ45tNCUyxgFw1w` is **READY**, promoted to `https://jayszrs.my.id`; target production, Next.js 14.2.35, build duration 21 seconds, working changes based on `8103a67`. Production verification passed for 98 unique media/document/logo files with SHA-256 checksums, the rendered project covers, 67-certificate HTML, social tabs, and the live GitHub API (369 calendar days, 848 contributions at verification time, five ranked repositories). All 12 non-rating CMS sections compare equal to the pre-release snapshot. Evidence: `../backups/social-project-release-verification-2026-10-15.json`.
