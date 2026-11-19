import { expect, test } from './helpers.ts';

/** Mobile-first requirements (FR-MOB-*). The default project already emulates a Pixel 7. */

test.describe('screen wake lock and auto-pause (FR-MOB-1, FR-MOB-2)', () => {
  test.use({ settings: { virtualInput: true } });
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __locks: { requested: number; released: number } };
      w.__locks = { requested: 0, released: 0 };
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: async () => {
            w.__locks.requested++;
            return { released: false, release: async () => void w.__locks.released++ };
          },
        },
      });
    });
  });

  test('keeps the screen awake while practising and lets go afterwards', async ({ page }) => {
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __locks: { requested: number } }).__locks.requested,
        ),
      )
      .toBeGreaterThan(0);
    await page.getByRole('link', { name: 'Back' }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __locks: { released: number } }).__locks.released,
        ),
      )
      .toBeGreaterThan(0);
  });

  test('pauses practice when the phone locks or the app is switched', async ({ page }) => {
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByText('Paused while the screen was away')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume' }).first()).toBeVisible();
  });
});

test('installable on phones: PNG icons and iOS home-screen icon (FR-MOB-4)', async ({
  page,
  request,
}) => {
  const m = await (await request.get('/manifest.webmanifest')).json();
  const sizes = m.icons
    .filter((i: { type: string }) => i.type === 'image/png')
    .map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(m.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true);
  await page.goto('/');
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(apple).toMatch(/apple-touch-icon\.png$/);
  expect((await request.get(apple!)).headers()['content-type']).toContain('image/png');
});

test.describe('touch targets (NFR-A11Y-1, FR-MOB-3)', () => {
  test.use({ settings: { virtualInput: true } });
  test('fretboard cells and dock controls are at least 44 px', async ({ page }) => {
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    const cell = await page.getByRole('button', { name: 'String 1 (e), open: E4' }).boundingBox();
    expect(cell!.height).toBeGreaterThanOrEqual(44);
    expect(cell!.width).toBeGreaterThanOrEqual(44);
    for (const name of ['Listen', 'Loop', 'More', 'Slower', 'Faster']) {
      const b = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(b!.height, name).toBeGreaterThanOrEqual(44);
    }
  });
});

test('keyboard shortcuts: W switches mode, arrows change tempo', async ({ page }) => {
  await page.goto('/#/play/song/ode-to-joy/melody');
  await expect(page.getByRole('toolbar', { name: 'Practice controls' })).toBeVisible();
  await page.waitForTimeout(200); // let the shortcut listener attach after first paint
  await page.keyboard.press('w');
  await expect(page.getByRole('radio', { name: 'Play-along' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('group', { name: 'Tempo' })).toContainText('80%');
});

test.describe('fullscreen and haptics (FR-MOB-8, FR-MOB-9)', () => {
  test.use({ settings: { virtualInput: true } });
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __vibrations: unknown[]; __fullscreen: number };
      w.__vibrations = [];
      w.__fullscreen = 0;
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: (p: unknown) => {
          w.__vibrations.push(p);
          return true;
        },
      });
      Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => true });
      Element.prototype.requestFullscreen = async function () {
        w.__fullscreen++;
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: () => document.documentElement,
        });
        document.dispatchEvent(new Event('fullscreenchange'));
      };
    });
  });

  test('tapping the on-screen guitar gives a short vibration', async ({ page }) => {
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await page.getByRole('button', { name: 'String 1 (e), open: E4' }).click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __vibrations: unknown[] }).__vibrations.length),
      )
      .toBeGreaterThan(0);
  });

  test('no vibration when haptics are switched off', async ({ page }) => {
    await page.goto('/#/settings');
    await page.getByRole('switch', { name: /Vibrate on taps/ }).uncheck();
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await page.getByRole('button', { name: 'String 1 (e), open: E4' }).click();
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(
        () => (window as unknown as { __vibrations: unknown[] }).__vibrations.length,
      ),
    ).toBe(0);
  });

  test('Full screen button enters fullscreen and shows its pressed state', async ({ page }) => {
    await page.goto('/#/play/song/ode-to-joy/melody');
    const btn = page.getByRole('button', { name: 'Full screen' });
    await btn.click();
    expect(
      await page.evaluate(() => (window as unknown as { __fullscreen: number }).__fullscreen),
    ).toBe(1);
    await expect(page.getByRole('button', { name: 'Exit full screen' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
