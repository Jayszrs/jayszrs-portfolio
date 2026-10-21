# Interaction and 3D refinement

## Changes

- Removed lanyard-stage clipping, fitted card size and angle to available space, and added geometric containment of the whole rotated card. Initial automatic swing is smaller. Rope constraints and release inertia remain.
- Explicit pointer grabs work before visibility-observer delivery and during reduced motion. Reduced motion still disables incidental swing and release animation. Two-axis touch dragging uses pointer capture on the card; page scrolling remains available outside it. Window blur releases the grab.
- Project carousel supports mouse dragging and coarse vertical mouse-wheel conversion when horizontal space remains. Native horizontal trackpad input is unchanged. At track boundaries vertical scrolling is released to the page. A genuine drag suppresses the following click; an ordinary card click still opens detail.
- Reduced logo shadows, plinth shadow, and extrusion offset while retaining local official SVG geometry and perspective.
- Added `public/illustrations/graduation-cap-3d.png` via the built-in imagegen tool, plus a 256 × 171 alpha WebP display copy at `public/illustrations/graduation-cap-3d.webp` (10,210 bytes). The illustration is used in the education heading. The smaller display image is the requested 3D animation-style decorative asset, not a replacement institutional logo.

## Verification

- Production build `.next-pointer-final` passed compilation and all generated routes. Local preview: http://localhost:3109. Not deployed.
- `verify-lanyard-physics.cjs` passed at four widths, including new whole-card boundary assertions, pinned anchor, dragging, release inertia, settling, keyboard impulses, and fixed-step timing.
- `verify-pointer-interactions.cjs` uses isolated Chrome through the existing REA installation's Playwright core because the REA scenario tool does not expose a drag action. Actual browser mouse events passed at 1440 × 1000 with normal/reduced motion and 390 × 844. Card geometry moved, remained inside the viewport, and stopped dragging after release. Native browser touch input also passed vertical/diagonal dragging at mobile width.
- The same browser check passed project mouse drag, mouse-wheel movement, no modal after dragging, normal click opening detail, Escape close, and successful loading of the 3D illustration. Zero browser page errors. Screenshots were inspected for desktop/reduced/mobile dragging, touch dragging, reduced skill shadows, and the education illustration. Captures are retained in the ignored `.impeccable/review/pointer-interactions/` directory.
- Existing badge/icon checks passed: 25 skills, 26 verified local SVG assets, all original portrait hashes intact, three optimized transparent portraits, and no badge control bar. No CMS, Blob, Supabase, or original-photo writes.

## Final image generation prompt

Create one premium 3D animated-feature-style graduation cap icon for a warm-white personal portfolio website, friendly polished Disney-like object design, no character or face. A single sculpted mortarboard with softly rounded bevels and a padded cap underneath, viewed from an elevated three-quarter angle. Pearl ivory upper surfaces, slate charcoal cap underside, small restrained burnt-orange tassel hanging from the corner. Charming dimensional silhouette with believable materials, soft studio lighting, subtle highlights, very little shadow, no cast ground shadow, no pedestal, no floor, no text, no letters, no logos, no extra objects. The object should occupy about 82 percent of the image with generous clear transparent padding and a true transparent alpha background. Readable as a small 80px icon, crafted and elegant, not photorealistic, not a flat outline.
