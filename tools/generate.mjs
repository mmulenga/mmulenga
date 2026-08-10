#!/usr/bin/env node
/**
 * Builds every image the README needs into assets/.
 *
 * Run with `npm run build`. Nothing here runs at page-render time -- the output
 * is committed, and the README references it by relative path, so the rendered
 * profile depends on no external host.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { badge } from './lib/badge.mjs';
import { header, title } from './lib/typing.mjs';
import { advance, openFont, DEJAVU_SANS_BOLD, ROOT } from './lib/font.mjs';

const OUT = join(ROOT, 'assets');

// Palette lifted verbatim from the README the generator replaces.
const ACCENT = { light: '#2688A8', dark: '#D97757' };
const CHIP = {
  light: { background: '#1A1A1A', foreground: '#FFFFFF' },
  dark: { background: '#EDE6DC', foreground: '#1A1A1A' },
};

const HEADER_LINES = ['Matthew Mulenga', 'Software Engineer', 'Go enthusiast', 'Tinkering...'];

const TITLES = [
  { name: 'tech', text: 'Tech ', emoji: '1f6e0', width: 145 },
  { name: 'stats', text: 'Stats ', emoji: '1f4ca', width: 145 },
  { name: 'connect', text: 'Connect ', emoji: '1f91d', width: 180 },
];

const TECH = [
  { name: 'java', label: 'Java', slug: 'openjdk' },
  { name: 'python', label: 'Python', slug: 'python' },
  { name: 'go', label: 'Go', slug: 'go' },
  { name: 'postgresql', label: 'PostgreSQL', slug: 'postgresql' },
  { name: 'oracle', label: 'Oracle SQL', slug: 'oracle' },
  { name: 'git', label: 'Git', slug: 'git' },
  { name: 'docker', label: 'Docker', slug: 'docker' },
  { name: 'rabbitmq', label: 'RabbitMQ', slug: 'rabbitmq' },
];

const SOCIAL = [
  { name: 'linkedin', label: 'LinkedIn', slug: 'linkedin', background: '#0A66C2' },
  { name: 'portfolio', label: 'Portfolio', slug: 'portfolio', background: '#2B59FF' },
];

const written = [];
async function emit(name, svg) {
  await writeFile(`${OUT}/${name}`, svg);
  written.push({ name, bytes: Buffer.byteLength(svg) });
}

await mkdir(OUT, { recursive: true });

const dejavu = openFont(DEJAVU_SANS_BOLD);
const measure = (text, size) => advance(dejavu, text, size);

for (const theme of ['light', 'dark']) {
  const { svg } = await header({ lines: HEADER_LINES, color: ACCENT[theme] });
  await emit(`header-${theme}.svg`, svg);

  for (const t of TITLES) {
    const { svg } = await title({ ...t, color: ACCENT[theme] });
    await emit(`title-${t.name}-${theme}.svg`, svg);
  }

  for (const t of TECH) {
    await emit(`badge-${t.name}-${theme}.svg`, badge({ ...t, ...CHIP[theme], measure }));
  }
}

// Social badges carry fixed brand colours, so they need only one variant.
for (const s of SOCIAL) {
  await emit(`badge-${s.name}.svg`, badge({ ...s, foreground: '#FFFFFF', measure }));
}

const total = written.reduce((n, f) => n + f.bytes, 0);
for (const f of written.sort((a, b) => b.bytes - a.bytes)) {
  console.log(String(f.bytes).padStart(7), f.name);
}
console.log(`\n${written.length} files, ${(total / 1024).toFixed(1)} KB total`);
