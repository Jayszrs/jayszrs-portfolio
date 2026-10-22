const LOGO_APPEARANCES = new Set(["auto", "original", "white", "remove-white", "remove-black"]);

function normalizeLogoAppearance(value) {
  return LOGO_APPEARANCES.has(value) ? value : "auto";
}

// Inspect a small decoded thumbnail once; never rewrite the uploaded image.
function classifyLogoPixels(pixels, width, height) {
  if (!pixels?.length || width < 2 || height < 2) return "original";
  let transparent = 0;
  let border = 0;
  let lightBorder = 0;
  let darkBorder = 0;
  let opaque = 0, light = 0, dark = 0;
  const band = Math.max(1, Math.floor(Math.min(width, height) / 12));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (pixels[offset + 3] < 240) transparent += 1;
      else {
        opaque += 1;
        const luminance = (pixels[offset] * .2126 + pixels[offset + 1] * .7152 + pixels[offset + 2] * .0722) / 255;
        if (luminance > .88) light += 1;
        if (luminance < .3) dark += 1;
      }
      if (x >= band && x < width - band && y >= band && y < height - band) continue;
      border += 1;
      if (pixels[offset + 3] < 240) continue;
      const luminance = (pixels[offset] * .2126 + pixels[offset + 1] * .7152 + pixels[offset + 2] * .0722) / 255;
      if (luminance > .88) lightBorder += 1;
      if (luminance < .12) darkBorder += 1;
    }
  }
  if (transparent / (width * height) > .025) return light / opaque > .35 && dark / opaque > .1 ? "remove-white" : "white";
  if (lightBorder / border > .85) return "remove-white";
  if (darkBorder / border > .85) return "remove-black";
  return "original";
}

module.exports = { classifyLogoPixels, normalizeLogoAppearance };
