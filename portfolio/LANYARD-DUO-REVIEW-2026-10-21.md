# Lanyard refinement

Owner request: improve the strap, retain the companion identified by the owner as Pak Narendra Wicaksono in the thumbs-up photo, and remove the entire badge control bar.

- Added `public/portraits/conference-duo-cutout.png` using the built-in imagegen edit tool with a transparent background. Both foreground people, glasses, clothing and thumbs-up poses remain in the display composition. This is an AI-assisted display edit, not a recovered original photograph.
- Original retained: `public/recovered-media/c9a1652c943e238bad62.webp`, SHA-256 `335c24d1aa32a66a71e46516aeeb4b2c41e40bf7cd6eb307fe38e4e5441be306`. Earlier single-person cutout remains intact too.
- New PNG: 1086 × 1448, alpha range 0–255, SHA-256 `0e637d605a07d94266c351c54e2b342c00adae114afe8199d081a66182fd0d30`.
- Strap: 28px woven fabric pattern, stitched edges, Kali mark and JAYSZRS lettering, longer hanging section and a restrained directional shadow. Existing rope physics and keyboard arrows/Home retained.
- Removed previous/next buttons, slide count, pause button, photo-preview button and reset button. Automatic three-second cycling retains focus/hover/drag/visibility/reduced-motion pauses.
- Build `.next-lanyard-duo` passed. Physics assertions passed at four widths. Original image hashes and all three optimized transparent portraits passed; combined optimized display images at 320px total 59,604 bytes.
- REA Chrome observed the automatic transition to the two-person photograph, then Home focus/reset held it for visual review at 1440 × 1000 and 390 × 844. Both people and hands are visible; no badge toolbar exists; no captured JavaScript page errors. Evidence: `ev_0d89a1af41031141cc9670b0af3a951d874400b9a0cd51e5f1aae52719bd0280`, `ev_194f4adc858973efc887dbe9ccb4efd0ee9b32c9cfc2316bd9adf1cf3baad0df`.
- Local preview: http://localhost:3109. Not deployed. No CMS, Blob or Supabase writes.

## Final image edit prompt

Edit target: the supplied original photograph of TWO MEN standing side by side and giving thumbs up. Background extraction only, for a personal portfolio ID badge. Keep BOTH foreground men, the younger man on the left wearing glasses, a dark blazer and light polo, AND the older man on the right wearing glasses and a gold/black batik shirt. Preserve their real facial identities, expressions, exact clothing, body proportions, original positions, thumbs-up hands and fingers, and relationship to each other. Remove only the hall, room, furniture, walls, lights and all background bystanders. Keep the two foreground men together as one realistic photo cutout. Do NOT isolate just the left man. Do not add people, invent poses, stylize, retouch faces, add text, cast shadows, or decorative elements. Output a tightly framed actual transparent alpha PNG, both men's heads, both hands and all originally visible lower bodies retained, with clean natural edges. Preserve original photograph detail faithfully.
