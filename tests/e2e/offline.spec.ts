import { expect, test } from './helpers.ts';

test('works offline after the first visit (NFR-OFF-1)', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Strumly/ })).toBeVisible();
  // Wait for the service worker to install and take control.
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        });
        reg.active?.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(resolve, 3000);
      });
    }
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Strumly/ })).toBeVisible();
  await page.getByRole('link', { name: 'Songs' }).click();
  await expect(page.getByRole('heading', { name: 'Ode to Joy' })).toBeVisible();
  await page.goto('/#/play/lesson/u1-open-e');
  await expect(page.getByRole('heading', { name: 'Open high e' })).toBeVisible();
  await context.setOffline(false);
});

test('manifest is valid for installation', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m).toMatchObject({
    name: 'Strumly: Learn Guitar',
    short_name: 'Strumly',
    display: 'standalone',
  });
  expect(m.icons.length).toBeGreaterThanOrEqual(2);
});
