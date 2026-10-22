const LOGO_APPEARANCES = new Set(['auto', 'original', 'white', 'remove-white', 'remove-black', 'lighten-dark']);
const DARK_WORDMARKS = new Set([
  '/organization-logos/etiqa.png',
  '/organization-logos/fazmastone.png',
  '/organization-logos/fkg-ui.png',
  '/organization-logos/hmti-symbol-transparent.png',
]);

function normalizeLogoAppearance(value) {
  return LOGO_APPEARANCES.has(value) ? value : 'auto';
}

function resolveLogoAppearance(source, appearance = 'auto') {
  const requested = normalizeLogoAppearance(appearance);
  return requested === 'auto' ? (DARK_WORDMARKS.has(source) ? 'lighten-dark' : 'original') : requested;
}

module.exports = { normalizeLogoAppearance, resolveLogoAppearance };
