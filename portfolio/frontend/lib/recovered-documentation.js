import recoveredDocumentation from "./recovered-documentation.json";
import { documentationImages, withDocumentationImages } from "./documentation";
import { mediaSource } from "./media";

export function withRecoveredDocumentation(item = {}, section) {
  const recovered = recoveredDocumentation[item.id];
  if (!recovered || recovered.section !== section) return item;

  // Later CMS edits always win. The recovery only applies to the preserved upload snapshot.
  if (Object.entries(recovered.snapshot).some(([key, value]) =>
    JSON.stringify(item[key] ?? (Array.isArray(value) ? [] : "")) !== JSON.stringify(value)
  )) return item;

  const unavailable = new Set(recovered.unavailableDocumentation);
  const seen = new Set();
  const retained = documentationImages(item).filter((url) => !unavailable.has(url));
  const restored = recovered.images.map((image) => image.url);
  const images = (recovered.prependImages ? [...restored, ...retained] : [...retained, ...restored]).filter((url) => {
    const resolved = mediaSource(url);
    if (seen.has(resolved)) return false;
    seen.add(resolved);
    return true;
  });

  return {
    ...withDocumentationImages(item, images),
    documentationFile: unavailable.has(item.documentationFile) ? "" : item.documentationFile,
    recoveredDocumentationLabel: `${recovered.sourceKind} · ${recovered.sourceLabel}`,
  };
}
