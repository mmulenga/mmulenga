import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { advance, embedFace, openFont, MARTIAN_MONO, ROOT } from './font.mjs';

const FAMILY = 'Martian Mono';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The typing effect works by setting the text along a horizontal <path> and
 * animating that path's length. Text on a path only renders as far as the path
 * runs, so growing it from 0 to the full width reveals the line character by
 * character -- no clipping mask required.
 *
 * Each line's animation is chained off the previous one's `end`, and the first
 * is additionally triggered by the last one ending, which is what makes the
 * sequence loop forever.
 */
export async function header({ lines, color, width = 440, height = 50, fontSize = 20 }) {
  const { css, bytes } = await embedFace(MARTIAN_MONO, lines.join(''), FAMILY);
  const midline = height / 2;

  const body = lines
    .map((line, i) => {
      const begin = i === 0 ? `0s;d${lines.length - 1}.end` : `d${i - 1}.end`;
      return (
        `<path id="p${i}">` +
        `<animate id="d${i}" attributeName="d" begin="${begin}" dur="6000ms" fill="remove" ` +
        `values="m0,${midline} h0;m0,${midline} h${width};m0,${midline} h${width};m0,${midline} h0" ` +
        `keyTimes="0;0.66666666666667;0.83333333333333;1"/>` +
        `</path>` +
        `<text font-family="'${FAMILY}',monospace" fill="${color}" font-size="${fontSize}" ` +
        `dominant-baseline="middle" text-anchor="start" letter-spacing="normal">` +
        `<textPath href="#p${i}">${esc(line)}</textPath>` +
        `</text>`
      );
    })
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}" role="img" aria-label="${esc(lines.join(', '))}">` +
    `<title>${esc(lines.join(', '))}</title>` +
    `<style>${css}</style>` +
    body +
    `</svg>`;

  return { svg, fontBytes: bytes };
}

/**
 * A section heading: one static line of Martian Mono followed by an emoji.
 *
 * The originals leaned on the viewer's system emoji font, so the glyph changed
 * shape between platforms. Inlining Twemoji pins it.
 */
export async function title({ text, emoji, color, width, height = 40, fontSize = 20 }) {
  const { css, bytes } = await embedFace(MARTIAN_MONO, text, FAMILY);
  const textWidth = advance(openFont(MARTIAN_MONO), text, fontSize);

  const glyph = await readFile(join(ROOT, `node_modules/@twemoji/svg/${emoji}.svg`), 'utf8');
  const inner = glyph.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const emojiSize = fontSize;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}" role="img" aria-label="${esc(text.trim())}">` +
    `<title>${esc(text.trim())}</title>` +
    `<style>${css}</style>` +
    `<text font-family="'${FAMILY}',monospace" fill="${color}" font-size="${fontSize}" ` +
    `x="0" y="${height / 2}" dominant-baseline="middle" text-anchor="start">${esc(text)}</text>` +
    `<svg x="${round(textWidth)}" y="${round((height - emojiSize) / 2)}" ` +
    `width="${emojiSize}" height="${emojiSize}" viewBox="0 0 36 36">${inner}</svg>` +
    `</svg>`;

  return { svg, fontBytes: bytes };
}

const round = (n) => Math.round(n * 100) / 100;
