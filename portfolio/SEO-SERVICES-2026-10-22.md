# SEO, service card and signature footer — 22 October 2026

The portfolio now explicitly connects Jaelani Surya Saputra, Jay Szrs and jayszrs with web development and IT in Jakarta/Bekasi through visible, server-rendered copy, page titles/descriptions and Person/WebSite/ProfilePage/Service structured data. All eight public pages have their own canonical and matching Open Graph URL; previously inner pages inherited the home canonical. A local 1200×630 Open Graph image replaces the square icon as the main sharing preview. The Person image resolves to the real recovered photograph on this site's origin. Admin is explicitly noindex. Sitemap contains only the eight public pages and does not fabricate per-request modification dates.

Home and Projects end with a Wasla Informatika service card. Set its external URL under Admin → Profil → Link website Wasla Informatika. The official URL has not yet been supplied, so the action currently leads to the working Contact page. Clearing the URL preserves that fallback. The card is server-rendered so it is readable without scrolling or running JavaScript from a crawler's perspective.

Every public page uses the new Jay Szrs footer. REA reference `ev_98d9ff3e93d79432dbc2878aa5f87074cddd0ad753701b001cdf7257a0ecd425` observed Wealth Club's large charcoal lettering. Independent local implementation after: `ev_0c241cce105ffc07095565d96d77f74a9b0c2eba0f9fdf74b38cd51c8165a7c1`, complete with no page errors. The oversized decorative wordmark is hidden from assistive technology; readable branding, working navigation and copyright remain above it. There is exactly one footer on each page, including Home and Contact.

## Validation

- Optimized Next.js 16.4.2 build passes; `.next-services-seo-final`.
- `verify-services-seo.cjs` passes: eight unique canonicals/OG URLs, initial crawler HTML, consistent person identity and same-origin real photo, Service provider linkage, admin noindex, sitemap and 1200×630 image.
- Home/Projects card and footer fit 320, 390, 768 and 1440px; no horizontal page overflow or browser errors. Rendered screenshots and OG image inspected in `.impeccable/review/services-seo/`.
- Isolated Admin proof passes with the new Wasla link field: actual login/form save through the real content endpoint to an in-memory fake Supabase; the saved destination appears in public SSR. No real content/storage writes; original CMS JSON unchanged. Existing journey/collaboration deletion checks still pass.
- Existing data merge unit check passes, including an explicitly cleared service URL overriding an older local URL.

## Installed globally

Cloudflare `security-audit` installed using Codex's skill installer into `C:/Users/jaela/.codex/skills/security-audit` from `cloudflare/security-audit-skill`, path `skills/security-audit`, revision `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`. SKILL.md and both zero-dependency record validators are present. It is available for requests in other projects from the next turn. This was installation, not a claim that a full vulnerability audit has run. Example prompt: "Audit keamanan project ini pakai security-audit."

## Search follow-through

After the changes are live, use the existing Search Console property for `https://www.jayszrs.my.id/`: submit `/sitemap.xml`, inspect Home and Projects, and request indexing. A successful live crawl test permits crawling; it does not prove that a URL is already indexed or ranks for every query. No Search Console submission or ranking result has been claimed here. Google determines indexing and ranking; common queries such as Jaelani or pengembang web are competitive.

Primary references: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [Cloudflare skill installation and usage](https://github.com/cloudflare/security-audit-skill).
