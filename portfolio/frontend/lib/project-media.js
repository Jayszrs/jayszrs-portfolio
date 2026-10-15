import recoveredProjects from "./recovered-project-media.json";
import { documentationImages, withDocumentationImages } from "./documentation";

export function withRecoveredProjectMedia(item = {}) {
  const recovered = recoveredProjects[item.id];
  if (!recovered || item.link !== recovered.originalLink) return item;

  const originals = [item.image, ...documentationImages(item)].filter(Boolean);
  // An admin's later media edits take precedence over this recovery snapshot.
  if (originals.length !== recovered.legacyMedia.length ||
      originals.some((url, index) => url !== recovered.legacyMedia[index])) return item;

  const images = recovered.pages.map((page) => page.url);
  return {
    ...withDocumentationImages(item, images.slice(1)),
    image: images[0],
    recoveredMediaSource: recovered.sourceUrl,
  };
}
