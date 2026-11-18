import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './helpers.ts';

/** NFR-A11Y-1: no serious or critical axe violations on any screen, in both themes. */
async function scan(page: Page, label: string) {
  const results = await new AxeBuilder({
    page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'],
  })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const report = bad.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} → ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 3)
        .join(' | ')}`,
  );
  expect(report, `${label}\n${report.join('\n')}`).toEqual([]);
}

const ROUTES = [
  ['home', '/#/'],
  ['songs', '/#/songs'],
  ['chords', '/#/chords'],
  ['chord detail', '/#/chords/D'],
  ['tuner', '/#/tuner'],
  ['settings', '/#/settings'],
  ['coach', '/#/coach'],
  ['lesson intro', '/#/play/lesson/u3-em'],
  ['player', '/#/play/song/ode-to-joy/melody'],
] as const;

for (const scheme of ['dark', 'light'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });
    for (const [label, path] of ROUTES) {
      test(`${label} has no serious a11y violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForTimeout(300);
        await scan(page, `${scheme} ${label}`);
      });
    }
  });
}

test.describe('fresh user', () => {
  test.use({ fresh: true });
  test('onboarding has no serious a11y violations', async ({ page }) => {
    await page.goto('/');
    await scan(page, 'welcome');
    await page.getByRole('button', { name: 'Get started' }).click();
    await scan(page, 'level step');
  });
});
