# Soft graphite glass

## Current direction, supersedes the earlier brief below

### Refinement requested on 21 October 2026

The owner supplied the white hanging ID badge as the lanyard reference and explicitly requested 3D skill symbols with shining card edges. Keep the existing gray/white world. Use local brand SVG geometry with CSS extrusion, a small plinth, and restrained perspective. Use a static silver highlight at opposite card edges, strengthening only for hover/focus; there is no repeating card-glow animation. The owner-requested repeated edge treatment supersedes the default cap on glow accents.

The lanyard is the main authored motion: a narrow fabric strap, metal clasp, white printed plastic badge, isolated portrait, and identity typography on the same face. Portrait display edits have separate files and provenance; all original photographs remain accessible through the original-photo preview. Preserve three-second cycling and reduced-motion/offscreen/visibility/focus pauses. Original CMS values remain untouched.

The owner clarified the runtime reference as https://djazuli.my.id/ on 21 October. Its public inline script was inspected through REA: a segmented rope and weighted card respond to dragging, gravity, and release inertia. Implement that behavior independently using an SVG rope and accessible DOM badge, replacing the earlier bounded CSS tilt. Keep reset and arrow/Home keyboard controls. Stop frame work when settled, offscreen, hidden, or reduced motion is selected. Reference artwork is not part of the portfolio.

Inner-page headings sit directly on the page above a divider rather than in an oversized introductory card. Public content cards share the restrained edge treatment. Skills use readable two-column mobile cards and actual icons rather than letter placeholders. No WebGL engine or new animation dependency is needed.

The owner explicitly changed the palette to gray and white glass on 20 October 2026. Public portfolio: Experience; admin: Operate. ENERGY 2 / RHYTHM 2 / MOTION 2. The single authored motion is the hanging photo badge; other surfaces use quiet state transitions and respect reduced motion.

- Light: paper #f1f2f4, surface #ffffff, ink #30343b, muted #626872, line #d3d7dd, accent #626b78, accent-soft #e8eaee, accent-deep #4a525e.
- Dark: paper #181a1e, surface #25282e, ink #f0f1f3, muted #b0b6c0, line #454b55, accent #b1b8c3, accent-soft #343941, accent-deep #d2d7df.
- Legacy emerald token names are compatibility aliases to neutral values. Keep Plus Jakarta Sans and the red Kali mark. Actual photos, organization logos, README badges, and platform embeds retain original colors.
- Remove the grid and colored haze. White translucent surfaces, subtle upper highlights, and soft downward shadows establish depth. Floating navigation/dialogs use real blur; form fields remain legible.
- Hero: fabric strap, metal clip, actual portrait, printed name/role. Keep all original CMS photo URLs; do not present a missing-photo placeholder as recovered media.
- GitHub: actual account profile and rendered README only. No contribution calendar, repository ranking, or activity statistics.
- TikTok: official per-post player, one active video, controls, muted autoplay when visible, and a five-video selection when verified data is available. No sample videos or made-up metrics.
- Instagram: actual public profile preview and owner-confirmed GODS track. Music is curated by the owner, not a live Instagram music API feed.
- Preserve admin fields, upload/save endpoints, recovery previews, and source values. Keep mobile scrolling, keyboard focus, and loading/error states.

## Earlier brief and verification history (historical, not current palette guidance)

User direction: improve public pages and the admin CMS with glassmorphism, keep the existing colors, preserve content, and continue recovering original media. Antislop mode: DURING, explicitly selected for this session.

## Existing identity

- Keep the current emerald, paper, ink, muted, line, gold, and dark-theme color values unchanged.
- Keep Plus Jakarta Sans, the red jayszrs brand mark, existing page structure, real content, and official logos.
- ENERGY 2 / RHYTHM 2 / MOTION 1: visible material depth, clear separation of sections, and restrained interaction feedback.
- Retain the existing faint technical grid as part of the established portfolio background. Do not introduce new background colors or decorative artwork.

## Material and hierarchy

- Public cards use translucent surfaces, a light upper edge, and shallow inset highlights. Readable text and photographs remain the focal points.
- Real backdrop blur belongs to floating navigation and modal overlays. Ordinary content cards use the same glass surface without repeated expensive blur layers.
- The admin header and section navigation form the control layer. Form cards remain visually quiet, with solid enough fields for long editing sessions.
- Use the existing emerald for selection, keyboard focus, and primary actions. Keep secondary controls neutral. Preserve the existing icon family because its functional navigation and file-management glyphs already match the site.
- Hover feedback changes borders and elevation subtly. Reduced-motion and reduced-transparency preferences receive static, opaque alternatives.

## Admin workflow

- Keep all existing tabs, fields, upload endpoints, save payloads, and authentication behavior.
- Use a section rail on desktop and a horizontal section list on narrow screens. The selected section and save state must remain clear.
- Show genuinely recovered media using the same display resolvers as public pages. Recovered previews must not replace original CMS values or silently remove unavailable files.
- Keep save and theme controls apart, associate form labels with inputs, and provide useful loading and login-error feedback.

## Verification boundaries

Check the production build, real media checksums, recovery precedence, CMS preservation, compiled admin styles, contrast, and served routes. Record browser checks separately; an unavailable browser is not a visual or interaction-test pass. Never count placeholders or unverified substitutes as recovered images.

## Verification, 20 October 2026

- Isolated production build `.next-glass-review` passed compilation, lint/type checks, and all 20 generated pages.
- Local production preview: `http://localhost:3109`. All nine public/admin routes returned HTTP 200. Generated CSS contains the new glass materials, admin layout, recovery panel, and admin-only utilities.
- Read-only session/content checks passed. Content still contains 67 certificates and three achievements. A certificate PDF and an original school photo were served successfully by the new build.
- Recovery checks passed: nine collections, 25 collection images, 19 original project PNGs, and 91 certificate-source files. The new admin resolver exposed 172 media entries across the actual collections without mutating CMS values; later admin changes still take precedence.
- Calculated text contrast against the defined surfaces: light muted 4.69:1, light selected 4.83:1, dark muted 8.01:1, dark selected 8.78:1. This is a token-level check, not a screenshot audit.
- Production recovery audit: 372/372 assets verified; 68 unresolved image URLs and zero unresolved Blob PDF URLs. Earlier full PDF audit today: 86 files, 234 parsed pages, all passing. One fresh HEAD request for an unresolved original still returned 403. No remote data/storage mutations.
- Browser inspection and interactive login/tab/save/mobile checks remain unverified: Computer Use reported no available browsers, and the in-app browser was unavailable. The UI changes are local and have not been deployed by this task.
