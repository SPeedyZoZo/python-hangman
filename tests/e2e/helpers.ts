import { resolve } from 'node:path';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

/** Seeds settings so tests skip onboarding (unless they opt out with `fresh: true`). */
export const test = base.extend<{ fresh: boolean; settings: Record<string, unknown> }>({
  fresh: [false, { option: true }],
  settings: [{}, { option: true }],
  page: async ({ page, fresh, settings }, provide) => {
    if (!fresh) {
      await page.addInitScript((extra) => {
        if (!localStorage.getItem('strumly.settings')) {
          localStorage.setItem(
            'strumly.settings',
            JSON.stringify({ state: { onboarded: true, ...extra }, version: 1 }),
          );
        }
      }, settings);
    }
    await provide(page);
  },
});

/** Chromium flags that replace the microphone with a looping WAV fixture. */
export function fakeMic(fixture: string) {
  return {
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        `--use-file-for-fake-audio-capture=${resolve('tests/fixtures/generated', fixture)}`,
        '--autoplay-policy=no-user-gesture-required',
      ],
    },
    permissions: ['microphone'],
  };
}
