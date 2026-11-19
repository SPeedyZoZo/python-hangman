import type { Page } from '@playwright/test';
import { expect, fakeMic, test } from './helpers.ts';

test.use(fakeMic('strum-em.wav'));

async function layout(page: Page) {
  return page.evaluate(() => {
    const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    return {
      vh: innerHeight,
      vw: innerWidth,
      scrollH: document.documentElement.scrollHeight,
      scrollW: document.documentElement.scrollWidth,
      highway: box('.highway-card'),
      feedback: box('.player-feedback-row'),
      dock: box('.player-dock'),
    };
  });
}

test.describe('player fits one phone screen (FR-MOB-3)', () => {
  for (const [name, viewport] of [
    ['small phone portrait', { width: 375, height: 667 }],
    ['phone landscape', { width: 852, height: 393 }],
  ] as const) {
    test(name, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/#/play/lesson/u4-four-chord');
      await page.getByRole('button', { name: "Let's play" }).click();
      await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
      const l = await layout(page);
      expect(l.scrollH).toBeLessThanOrEqual(l.vh + 1);
      expect(l.scrollW).toBeLessThanOrEqual(l.vw + 1);
      expect(l.dock.right).toBeLessThanOrEqual(l.vw + 1);
      for (const r of [l.highway, l.feedback, l.dock]) {
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.bottom).toBeLessThanOrEqual(l.vh + 1);
      }
      expect(l.highway.height).toBeGreaterThanOrEqual(170);
    });
  }
});

test.describe('on-screen guitar fits one phone screen too (FR-MOB-7)', () => {
  test.use({ settings: { virtualInput: true } });
  for (const [name, viewport] of [
    ['small phone portrait', { width: 375, height: 667 }],
    ['phone landscape', { width: 852, height: 393 }],
  ] as const) {
    for (const [lesson, control] of [
      ['u1-first-frets', 'String 1 (e), fret 3: G4'],
      ['u3-em-am', 'Strum Am'],
    ] as const) {
      test(`${name}: ${lesson}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/#/play/lesson/${lesson}`);
        await page.getByRole('button', { name: "Let's play" }).click();
        await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
        const l = await layout(page);
        expect(l.scrollH).toBeLessThanOrEqual(l.vh + 1);
        expect(l.scrollW).toBeLessThanOrEqual(l.vw + 1);
        expect(l.dock.right).toBeLessThanOrEqual(l.vw + 1);
        expect(l.highway.height).toBeGreaterThanOrEqual(140);
        expect(l.dock.bottom).toBeLessThanOrEqual(l.vh + 1);
        const box = await page.getByRole('button', { name: control }).boundingBox();
        expect(box, control).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(l.vh + 1);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
        for (const name of ['Listen', 'Loop', 'More']) {
          const b = await page.getByRole('button', { name, exact: true }).boundingBox();
          expect(b!.x + b!.width, name).toBeLessThanOrEqual(viewport.width + 1);
        }
      });
    }
  }
});
