import { expect, fakeMic, test } from './helpers.ts';

test.use({ ...fakeMic('pluck-e4.wav'), fresh: true });

test('first launch walks through onboarding and lands on Home (FR-ONB-1…3)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#\/welcome/);
  await page.getByRole('button', { name: 'Get started' }).click();
  await page.getByRole('radio', { name: /Returning player/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /Electric/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /Left hand/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Allow microphone' }).click();
  await expect(page.getByText('Microphone working')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByRole('heading', { name: /Strumly/ })).toBeVisible();
  // Returning players get every lesson unlocked.
  await expect(page.getByRole('link', { name: /Mini F/ })).toBeVisible();
  // Settings persisted.
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('radio', { name: 'Left (mirrored)' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});
