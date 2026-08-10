import * as simpleIcons from 'simple-icons';

// Geometry reverse-engineered from live img.shields.io `for-the-badge` output.
// Verified against all ten badges this README uses: with a logo the text always
// starts at x=32 (9 pad + 14 logo + 9 gap); without one it starts at x=12. The
// trailing pad is 12 in both cases.
const HEIGHT = 28;
const LOGO_SIZE = 14;
const LOGO_X = 9;
const LOGO_GAP = 9;
const PAD = 12;
const FONT_SIZE = 10;

// shields sizes its text with Verdana metrics; we measure with DejaVu Sans Bold.
// 1.51px of inter-glyph spacing is the least-squares fit between the two across
// our label set, which keeps every badge within ~3px of its current width.
const LETTER_SPACING = 1.51;

/**
 * simple-icons dropped `oracle` and `linkedin` over trademark complaints, which
 * is why shields.io silently renders those two badges with no logo at all. The
 * README asks for both, so we supply the marks ourselves.
 */
const LOCAL_ICONS = {
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 ' +
    '2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 ' +
    '4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 ' +
    '2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 ' +
    '23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  // Oracle's mark is a wordmark we should not reproduce; this is its stadium outline.
  oracle: 'M7.5 6h9a6 6 0 0 1 0 12h-9a6 6 0 0 1 0-12zm0 3a3 3 0 0 0 0 6h9a3 3 0 0 0 0-6h-9z',
  // Carried over from the inline data-URI glyph the README already used.
  portfolio:
    'M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2.5c-3.34 0-10 1.67-10 ' +
    '5v2.5h20v-2.5c0-3.33-6.66-5-10-5z',
};

export function iconPath(slug) {
  if (LOCAL_ICONS[slug]) return LOCAL_ICONS[slug];
  const icon = simpleIcons['si' + slug.charAt(0).toUpperCase() + slug.slice(1)];
  if (!icon) throw new Error(`no icon available for "${slug}"`);
  return icon.path;
}

const round = (n) => Math.round(n * 100) / 100;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Render one `for-the-badge` style badge.
 *
 * No font is embedded, deliberately: `textLength` pins the text to an exact
 * width, so the badge measures the same everywhere regardless of which font the
 * viewer resolves. This is what shields.io itself relies on.
 */
export function badge({ label, slug, background, foreground, measure }) {
  const text = label.toUpperCase();
  const path = slug ? iconPath(slug) : null;

  const textLength = advanceWithSpacing(text, measure);
  const textStart = path ? LOGO_X + LOGO_SIZE + LOGO_GAP : PAD;
  const width = round(textStart + textLength + PAD);

  const logo = path
    ? `<svg x="${LOGO_X}" y="${(HEIGHT - LOGO_SIZE) / 2}" width="${LOGO_SIZE}" ` +
      `height="${LOGO_SIZE}" viewBox="0 0 24 24"><path fill="${foreground}" ` +
      `fill-rule="evenodd" d="${path}"/></svg>`
    : '';

  // Coordinates are 10x because the text group is drawn at font-size 100 and
  // scaled by .1 -- the trick shields uses to keep sub-pixel metrics exact.
  const textX = round((textStart + textLength / 2) * 10);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" ` +
    `role="img" aria-label="${esc(text)}">` +
    `<title>${esc(text)}</title>` +
    `<g shape-rendering="crispEdges">` +
    `<rect width="${width}" height="${HEIGHT}" fill="${background}"/>` +
    `</g>` +
    `<g fill="${foreground}" text-anchor="middle" ` +
    `font-family="Verdana,Geneva,DejaVu Sans,sans-serif" ` +
    `text-rendering="geometricPrecision" font-size="100">` +
    logo +
    `<text transform="scale(.1)" x="${textX}" y="175" ` +
    `textLength="${round(textLength * 10)}" font-weight="bold">${esc(text)}</text>` +
    `</g></svg>`
  );
}

function advanceWithSpacing(text, measure) {
  return measure(text, FONT_SIZE) + LETTER_SPACING * Math.max(text.length - 1, 0);
}
