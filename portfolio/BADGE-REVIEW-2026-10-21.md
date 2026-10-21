# Reference badge and local 3D symbols

Implemented locally against the owner's screenshots: real skill symbols with CSS depth, silver edge highlights across public content cards, a slimmer inner-page heading, and a hanging printed identity badge with three transparent portrait display edits.

## Changes and preservation

- Cached 26 existing brand SVGs; all 25 skills in the current CMS have a matching symbol. This removes the failing runtime dependency on `api.iconify.design`. Source geometry, checksums, attribution, and licenses are recorded in `public/skill-icons/attribution.json`.
- CSS creates shape extrusion, perspective, and a small base. Card-edge highlights are static and intensify on hover/focus. The skill cards use a readable two-column mobile grid, always-visible detail action, keyboard-operable category tabs, and a visible focus outline.
- Rebuilt the lanyard around the third reference: fabric strap, drawn metal clasp, white plastic face, portrait without its venue background, subtle printed traces, signature/name/role on the badge, and controls below the card. It retains three-second photo cycling, pause/previous/next, bounded drag, visibility pauses, and reduced motion.
- Imagegen produced three separate background-removal display variants. The original photos remain unchanged and accessible via “Lihat foto asli”. New admin photos fall back to the normal photo layout instead of using an unrelated cutout. The source/variant hashes are retained in `backups/portrait-display-variants-2026-10-21.json` at repository root. These edits are not additional recovered original files.
- Flattened the oversized page-intro panel into a page heading and divider. Applied the shared edge treatment to skills, projects, education, experience, achievements, certificates, design selections, and testimonial cards.
- No Blob/Supabase writes, new framework/animation dependencies, source-photo deletion, or deployment.

## REA evidence

REA analyzed six selected JavaScript chunks from the existing shipped `.next-next16-review/static/chunks` artifact before the changes. Its retained parent Evidence is `ev_0f683e3a988cb7bac999fe9ee9c48bfee4393a930184718333f535de37a1b49f`; artifact digest is `5ae4416f79fd7290b5294a13cebcdcf553b396bca436a30432a68010d1b4aacb`. The summary is saved in `backups/rea-design-audit-2026-10-21.json` at repository root.

This was inert bundle inspection, not browser execution. It has partial semantic coverage, 36 unselected source files, and explicit unknowns. The external-icon failure was also independently reproduced with an HTTP 403 and identified in the original BrandIcon component. Visual decisions follow the owner's supplied screenshots; REA is not claimed to have verified design quality.

## Verification

- Next.js 16.4.2 Turbopack production build `.next-badge-review`: passed. Preview: http://localhost:3109.
- HTTP checks: all nine public/admin routes and their referenced JavaScript chunks returned 200. Configured login passed. Forged sessions and unauthorized writes were rejected; the CMS fingerprint remained unchanged.
- All 26 served SVGs matched their source hashes; all 25 current skills were mapped. Active skill-panel markup contains local symbols and tab semantics, with no external Iconify API dependency.
- All three original-photo hashes were preserved. All three generated variants have alpha channels. Their 320px-wide WebP delivery preserves alpha and totals 47,742 bytes across all three portraits.
- All 375 existing recovery/display asset files passed checksum delivery checks, including the project cover. Existing archive checks passed for nine collections, 25 recovered collection images, 172 admin preview entries, 68 preserved unresolved image references, and zero unresolved PDF URLs.
- Japanese/French full-paragraph and language-switch regression tests passed, with 788 complete catalog entries per language.
- Initial HTML-script gzip total is 211,350 B versus 210,507 B before this refinement: an increase of 843 B, with no 3D runtime library. This is an artifact comparison, not a real-user performance claim.
- `git diff --check` passed.

The three edited portrait assets were visually inspected. Browser connection inventory is empty, so the rendered desktop/mobile layout, drag, clicks, category switching, and three-second animation still require browser review; no interactive visual pass is claimed. The previous PDF audit remains valid because no PDF file or reference was edited.
