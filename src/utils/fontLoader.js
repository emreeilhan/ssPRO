const BASELINE_FONTS = new Set(['IBM Plex Sans', 'IBM Plex Mono']);
const requestedFonts = new Set();

function toGoogleFamilyName(fontFamily) {
  return String(fontFamily || '')
    .trim()
    .split(/\s+/)
    .join('+');
}

export function loadGoogleFontOnDemand(fontFamily) {
  if (!fontFamily || BASELINE_FONTS.has(fontFamily) || requestedFonts.has(fontFamily)) {
    return;
  }

  requestedFonts.add(fontFamily);

  const family = toGoogleFamilyName(fontFamily);
  const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-font-family', fontFamily);
  document.head.appendChild(link);

  if (document.fonts?.load) {
    document.fonts.load(`400 16px "${fontFamily}"`).catch(() => {});
  }
}
