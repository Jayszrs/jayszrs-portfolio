import { documentationImages } from "./documentation";
import { mediaSource } from "./media";
import { withRecoveredDocumentation } from "./recovered-documentation";
import { withRecoveredProjectMedia } from "./project-media";

// Read-only view of the same recovery used by public pages. Never write it into CMS fields.
export function adminRecoveredMedia(item = {}, section) {
  const display = section === "gallery"
    ? withRecoveredProjectMedia(item)
    : withRecoveredDocumentation(item, section);
  const candidates = [
    display.image,
    display.logo,
    ...documentationImages(display),
    display.documentationFile,
    ...(display.recoveredDocuments || []).map((document) => document.url),
  ];
  const seen = new Set();
  return candidates.flatMap((value) => {
    const src = mediaSource(value || "");
    if (!/^\/(?:recovered-media|organization-logos|certificates|project-documents)\//.test(src) || seen.has(src)) return [];
    seen.add(src);
    return [{ src, kind: /\.pdf(?:[?#]|$)/i.test(src) ? "pdf" : "image" }];
  });
}
