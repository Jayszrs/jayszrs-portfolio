# Social interface and Brew reference

The owner asked for an Instagram presentation belonging to the portfolio, supplied three exact TikTok links, and selected https://brew.new/ as the style reference. The implementation preserves portfolio content, the local Kali mark, weighted lanyard, GitHub profile/README, and admin behavior.

## Reference evidence

REA opened Brew in isolated Chrome at 1440 × 1000. Warm near-white surfaces, fine outlines, open typography, compact navigation, and an orange primary action informed the styling. No Brew branding, artwork, or marketing copy was imported. Browser evidence: `ev_214f0353b1f8326713879c42dc63633feb5aa8b6a2e3c8237d64ed0e423098e2`.

The owner's public Instagram embed was inspected through REA (`ev_fca9f0c8e3ea6eb2759b305b6c8893dbacdfc764fd0a916a241111d9fc2c823d`). Seven original image responses were retained locally: one avatar and six photographs, 1,265,738 bytes total. `frontend/lib/instagram-gallery.json` records source, capture date, checksums, and meaningful descriptions. Next image optimization supplies responsive display sizes. This is a dated photographic selection, not live Instagram synchronization or a Story/Notes API.

## Result

- Warm white foundation, softer typography, fine neutral outlines, and a dimensional orange principal action; dark mode retained.
- Native Instagram gallery with one featured photograph, five supporting images, full-size preview, and a real profile link. The platform's profile chrome and iframe were removed.
- The owner-confirmed GODS track uses an optional Spotify player, loaded only after requesting it.
- Three TikTok portrait cards use IDs `7441934180482600210`, `7508283130906725649`, and `7469052987869007112`, in the supplied order. Owner selection takes precedence over popularity APIs. No invented titles, view counts, or ranking.
- Players load when visible. Playback control pauses other players and hidden/offscreen video; muted automatic playback respects reduced motion. An explicit Play request can proceed after the frame finishes loading, including with reduced motion enabled.
- Unavailable embeds retain the original posting link; the active selection advances to the next card. Frame load is recorded as `loaded`, not proof of playback readiness, so a late readiness event does not falsely turn a loaded player into a timeout error.

## Verification and limits

- Next.js production build `.next-social-complete` passed compilation and all 19 generation steps. Local preview: http://localhost:3109. No deployment performed.
- Social checks passed: exact three IDs/order, all seven original photo response hashes, deferred social loading, live GitHub README, and no contribution/repository widgets.
- Existing nine-route/runtime/authentication checks passed, including rejected forged sessions, rejected unauthorized writes, unchanged CMS content, and zero storage writes. Locale assertions passed for all 788 complete texts per language, with added social labels in English, Japanese, and French.
- REA visually checked desktop/mobile Instagram, full-size photo open and Escape close, dark theme, and Spotify player mounting. Zero captured JavaScript page errors. Mobile evidence: `ev_39ae0769deed39a035499450c414c236a848aa6b95517aa5e89fd102d5393ac3`; dark/music evidence: `ev_b02b05071c1c98db3f32855d7557f3416c08a0ba78c4fa5021e43bd84d4692eb`.
- Three TikTok cards and selection switching were observed in Chrome. The first official embed reports error `1001` and displays “Video currently unavailable” when opened directly on TikTok (`ev_452bfedd4b89a57e5954147997db704bb452ccc93d1b8114be990218e5617220`). Its original link remains available. The other two official frames loaded their account/video previews; full video playback and audio are not claimed as verified. Delayed frame-load regression evidence: `ev_3d3ec0d8856c8bbeaaf1d261df50558f3e9b076b8fc57d223d575d863f99b5f9`.
- Initial HTML scripts measured at 213,800 gzip bytes versus 213,818 before this social update, effectively unchanged. This excludes deferred social chunks, image responses, and third-party player resources.
- Original CMS URLs, PDFs, recovery registries, Blob, and Supabase were not changed. This work does not claim to recover the remaining unavailable legacy documentation images.
