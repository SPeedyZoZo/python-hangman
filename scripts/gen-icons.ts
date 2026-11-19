/**
 * Renders the SVG app icons to the PNG sizes phones need (iOS ignores SVG home-screen icons).
 * Dev-time only; outputs are committed to public/. Run: node --experimental-strip-types scripts/gen-icons.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const jobs: [src: string, out: string, size: number][] = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512],
  ['icon-maskable.svg', 'apple-touch-icon.png', 180],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, size] of jobs) {
  const svg = readFileSync(join(pub, src), 'utf8');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`,
  );
  await page.screenshot({
    path: join(pub, out),
    omitBackground: true,
    clip: { x: 0, y: 0, width: size, height: size },
  });
  console.log(`wrote public/${out}`);
}
await browser.close();
