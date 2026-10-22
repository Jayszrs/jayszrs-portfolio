# Monochrome lanyard, CMS journey and collaboration strip

Implemented locally on 22 October 2026. Production build: `.next-monochrome-journey-verified`; preview: http://localhost:3109. No deployment, push, real CMS save or storage upload was performed.

## Result

- Removed only the lanyard strap logo/wordmark. Both woven SVG strands and the buckle are black/white/silver, with a small white edge glow. Existing weighted rope, pinned upper anchors, direct drag tracking, touch interaction and portrait cycle remain.
- `/tentang` derives 15 chronological entries from current CMS education and experience. Explicit start dates take precedence; ongoing university education with no supplied start year stays at Present. The progress rail and bounded 12px parallax update on visible scroll events, without an idle animation loop.
- `/proyek` has a CMS-managed collaboration strip with six locally stored example SVG marks. All are visibly labeled Contoh/Sample; none is presented as a verified partnership. No scroll buttons or visible scrollbar. Supports mouse drag, ordinary wheel input and keyboard arrows. Auto motion pauses offscreen, while hidden, during page scroll/dialogs, on hover/focus/manual input, and under reduced motion.
- Etiqa lettering, Fazma and issuer/institution marks are white or bright on charcoal. Logo-only background treatment preserves original-color previews and original files. School crests retain grayscale detail; the recovered SMP shield uses a CSS mask to remove its outer white plate/black bars. Documentation photos continue through the unmodified photo renderer.
- Three exact selected TikTok posts display dated public play counts: 4,700,000; 1,200,000; 1,100,000. Metadata author and video IDs were checked. These are public observations from 22 October, not likes or a continuously synchronized feed. Each count shows its source/date. Authorized API counts or dated owner entries can override the snapshots. TikTok can still refuse an embed; the original-post link remains available.
- New interface text has explicit English/Japanese/French translations; brand names and numeric counts are preserved.

## CMS use

Edit Education and Experience normally; saving revalidates the About timeline. Education now has optional start/end date fields for ordering without guessing years. In Kolaborasi, upload a logo, set the name/website and select Contoh tampilan or Kolaborasi, then save. Appearance options allow original, white, or removal of a white/black plate. Removing every collaboration keeps the strip absent. TikTok observation rows are available under the profile's music/video settings.

## Verification

| Check | Observed result |
| --- | --- |
| Optimized Next 16.4.2 build | PASS; 19 static routes generated |
| Journey/data merge tests | PASS; source coverage, ordering, add/edit/remove, unknown start year, explicit empty collections, zero metrics |
| TikTok contract tests | PASS; real snapshots, source/date validation, exact curated order/account, owner/API precedence and unavailable fallback |
| Real pointer/touch test | PASS at 1440px, 390px and reduced motion; forward/reverse grab error below 0.7px, clasp error below 0.02px; no badge toolbar |
| Journey/strip browser tests | PASS at 1440px and 390px; 15 entries, bounded parallax, mouse drag/wheel/keys, hover/reduced-motion pause, six labeled examples, no horizontal page overflow |
| New language text | PASS in English, Japanese and French; brands unchanged |
| Logo browser tests | PASS for Etiqa, Fazma, Bani Saleh, SMA71, SMP135 and Dicoding; bright mark and dark corners; original previews and source hashes preserved |
| Actual Admin save flow against isolated fake Supabase | PASS; login, education creation, mocked upload UI, two actual content POSTs, public SSR journey/logo updates, delete-all remains empty; real storage writes 0, external requests 0, original CMS hash unchanged |
| Existing social/physics checks | PASS; GitHub profile/README only, selected IDs, source-photo hashes, physical settling and fixed timestep |

The isolated CMS proof used `.next-monochrome-journey`; subsequent production builds refined logo contrast only. Its fake backend and browser were stopped. Browser interaction screenshots are in `.impeccable/review/monochrome-journey/` and `.impeccable/review/pointer-interactions/`. Original recovery collections and source photographs were not rewritten.

REA controlled-browser evidence before: `ev_3aacdee57e1618c8d5fa898bc979bfff50ea3e5964f34bfd0bc9c8b2f923c420`. Journey after: `ev_2733c2aa68c139520168b658ad97648dffdee03cbc6d921637dc7705ec149c9b`. Monochrome hero: `ev_e94089a6650208d2f198865aea6d0619697b502e5da348196325fcbfd7a66c28`. These captures observed no browser page errors. Drag and wheel behavior were separately exercised with real Playwright mouse/touch input; screenshots alone are not treated as proof of interaction or whole-site performance.

Collaboration SVG provenance/license records are in `public/collaboration-logos/attribution.json`. Public TikTok observation provenance is in `backend/lib/tiktok-public-metrics.json`.

Final refined journey/logo capture on `.next-monochrome-journey-verified`: `ev_bc501c447a3723a3b689aa40e919d29b8eab433e69a888a82f81c42a047e819f`; complete, no page errors. Both school crests retain visible internal detail without rectangular plates.
