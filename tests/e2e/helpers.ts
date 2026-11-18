import { resolve } from 'node:path';

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
