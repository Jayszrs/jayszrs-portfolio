# Lanyard flexibility correction

The previous physical containment and responsive angle limit kept the badge visible but restricted dragging too much, particularly at mobile widths. Those limits are removed.

## Behavior

- A longer 120–185px rope uses ten simulated segments. The card can translate, rotate, lift into a slack rope, reverse direction, and swing after release.
- The exact local point picked up on the card is constrained to the pointer. Rotation no longer slides that point away from the cursor.
- An adaptive, pointer-anchored view fits the rope/card into the stage. It changes presentation rather than locking the physical card. Framing eases back after release. The upper fabric endpoint stays visually pinned; the lower endpoint and metal clasp share the -48px attachment point.
- Mouse, two-axis touch input, reduced-motion manual dragging, keyboard reset, automatic three-second photographs and visibility pauses remain. The owner-requested absence of the control bar remains.
- Photographs, media recovery sources, CMS data, storage and social components were not modified.

## Verification

- Production build `.next-flexible-final` passed. Local preview: http://localhost:3109. Not deployed.
- Physics checks passed at four widths: pinned simulated anchor, freely translated centre grab, off-centre grab while rotating, whole-scene view fitting, release movement, settling/sleep, keyboard impulses, and equivalent fixed-step timing at 30/60fps.
- Isolated Chrome mouse checks now measure the actual picked point on the rendered card, using a temporary test marker. Normal desktop forward/reverse error: 0.48/0.69px; reduced-motion desktop: 0.48/0.69px; 390px mobile viewport: 0.50/0.63px. The rope endpoint/clasp attachment error stayed at 0–0.01px. All remained within the viewport in these scenarios.
- Native browser touch dragging passed. Existing project drag/wheel/click behavior and decorative asset loading also passed. No captured JavaScript page errors. Screenshots of both drag directions at desktop/mobile widths were visually inspected in `.impeccable/review/pointer-interactions/`.
- Scope of verification: the described automated input paths, not every possible gesture or physical device. Reduced motion retains an immediate reset on release rather than incidental inertia animation.
