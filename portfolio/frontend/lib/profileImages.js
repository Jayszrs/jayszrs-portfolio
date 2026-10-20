import { compactUrls } from "@/frontend/lib/documentation";
import unavailableLegacy from "./profile-unavailable-legacy.json";
import { mediaSource } from "./media";

export function profileDisplayImages(profile = {}) {
  // Keep unavailable originals in the editor. A later recovery alias brings them back automatically.
  return profileHeroImages(profile).filter((url) => !unavailableLegacy.includes(url) || mediaSource(url) !== url);
}

export function profileHeroImages(profile = {}) {
  return compactUrls([
    ...(Array.isArray(profile.heroImages) ? profile.heroImages : []),
    profile.heroImage,
    profile.heroImage2,
    profile.heroImage3,
    profile.heroImage4,
  ]);
}

export function withProfileHeroImages(profile = {}, images = []) {
  const heroImages = compactUrls(images);

  return {
    ...profile,
    heroImages,
    heroImage: heroImages[0] || "",
    heroImage2: heroImages[1] || "",
    heroImage3: heroImages[2] || "",
    heroImage4: heroImages[3] || "",
  };
}
