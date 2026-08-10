import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';

// Resolved against this module, not the working directory, so the generator
// runs the same from anywhere.
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const MARTIAN_MONO = join(ROOT, 'tools/vendor/MartianMono-StdRg.ttf');
export const DEJAVU_SANS_BOLD = join(ROOT, 'tools/vendor/DejaVuSans-Bold.ttf');

export function openFont(path) {
  return fontkit.openSync(path);
}

/** Advance width of `text` in px when set at `sizePx`. */
export function advance(font, text, sizePx) {
  return (font.layout(text).advanceWidth / font.unitsPerEm) * sizePx;
}

/**
 * Subset `path` down to just the glyphs `text` needs and return an @font-face
 * rule with the result inlined as a base64 data URI.
 *
 * TrueType rather than WOFF2: this is the format the SVGs we are replacing used,
 * so it is the one already proven to work inside GitHub's image sandbox. The
 * subsets are only a few KB, so the size win from Brotli is not worth the risk.
 */
export async function embedFace(path, text, family) {
  const chars = [...new Set(text)].sort().join('');
  const subset = await subsetFont(await readFile(path), chars, { targetFormat: 'truetype' });
  return {
    css:
      `@font-face{font-family:'${family}';font-style:normal;font-weight:400;` +
      `font-stretch:normal;font-display:block;` +
      `src:url(data:font/truetype;base64,${subset.toString('base64')}) format('truetype');}`,
    bytes: subset.length,
  };
}
