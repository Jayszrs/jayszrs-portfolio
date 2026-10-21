# Lanyard reference and verification

The owner explicitly identified https://djazuli.my.id/ as the interaction reference. REA inspected its public inline JavaScript (`inline-3.js`): Canvas 2D renders a segmented Verlet rope, a weighted card, pointer dragging, and release inertia. This is static source evidence, not a successful interactive test of the reference lanyard. The reference homepage opened in an isolated browser; a later focused `#lanyard` click timed out.

Static REA evidence: `ev_b2220e4406319a904f328a3bb439572ac1edf075ec4939b8e65397bb1398d0a6`. Public captured artifacts remain in the ignored `backups/djazuli-reference-2026-10-21/` directory. Third-party artwork and source were not incorporated into the application.

## Implementation

- Independently authored fixed-step rope constraints and weighted card in `frontend/lib/lanyard-physics.cjs`.
- SVG fabric band follows the simulated rope; the accessible DOM badge preserves real text, translations, the owner's portraits, and original-photo preview.
- Mouse drag, horizontal touch drag with vertical page scrolling preserved, release inertia, arrow-key impulses, and Home/reset controls.
- No React render per animation frame. Animation sleeps after settling and pauses offscreen or when hidden. Reduced motion keeps the badge static. Three-second photo cycling retains its interaction and visibility pauses.
- Unchanged ResizeObserver measurements do not restart a settled or reset card.
- No new runtime dependency, CMS mutation, or Blob/Supabase write.

## Verification

- Production build: Next.js 16.4.2, isolated `.next-rope-review`, successful compilation and all generated routes.
- Physics assertions: four viewport widths, fixed anchor, finite geometry, bent rope during drag, release inertia, settling, reset, keyboard impulses, and equivalent fixed-step timing at 30/60 fps.
- Existing locale, portrait/icon checksum and delivery, runtime/authentication, and archive-preservation checks passed.
- REA-controlled Chrome at 1440 × 1000: Home reset remains stationary after waiting, ArrowRight produces a changed angle and swinging state, reset button returns to the identical resting pose and remains there. Zero captured JavaScript page errors. Evidence: `ev_b52ae429c4280a17bf6649da430b869b33d39711da31e097e759197486f86717`.
- REA-controlled Chrome at 390 × 844 with reduced motion: page, static badge, keyboard reset, and scrolling steps completed; screenshot inspected, zero captured JavaScript page errors. Evidence: `ev_370a9c40d68056816f283d4a272513c7668dd6d69fb325f9ea98dfe0bd0aa328`.
- Pointer dragging is covered by the physics assertions and code review; it was not directly performed in the browser because the scenario tool exposes no drag action. Mobile touch gestures remain unverified in a physical browser.
- Initial HTML script resources: 10 files, 694,174 raw bytes / 213,818 gzip bytes. Earlier badge build: 211,350 gzip bytes, a 2,468-byte increase. Measurement excludes lazy chunks and third-party embeds.

Local production preview: http://localhost:3109. Not deployed by this task. Media recovery status is unchanged; this interaction refinement does not claim to recover previously unavailable files.
