import type { Page } from '@playwright/test';
import { expect, fakeMic, test } from './helpers.ts';

test.use(fakeMic('strum-em.wav'));

async function layout(page: Page) {
  return page.evaluate(() => {
    const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    return {
      vh: innerHeight,
      scrollH: document.documentElement.scrollHeight,
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
      for (const r of [l.highway, l.feedback, l.dock]) {
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.bottom).toBeLessThanOrEqual(l.vh + 1);
      }
      expect(l.highway.height).toBeGreaterThanOrEqual(170);
    });
  }
});
