/**
 * Generates loop-safe WAV fixtures for the fake-microphone e2e tests.
 * Run with: npm run fixtures   (Node type-stripping; imports must use .ts extensions)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mixInto, renderPluck, renderStrum } from '../src/audio/synth/karplusStrong.ts';
import { encodeWav } from '../src/audio/synth/wav.ts';
import { midiToHz } from '../src/music/theory.ts';

const SR = 48000;
const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'tests',
  'fixtures',
  'generated',
);
mkdirSync(outDir, { recursive: true });

/** Repeating plucks of one pitch: `count` plucks every `everySec`. */
function pluckLoop(midi: number, everySec: number, count: number): Float32Array {
  const sig = new Float32Array(Math.floor(SR * everySec * count));
  for (let i = 0; i < count; i++) {
    mixInto(
      sig,
      renderPluck(midiToHz(midi), {
        sampleRate: SR,
        durationSec: everySec,
        decay: 0.998,
        seed: i + 1,
      }),
      Math.floor(i * everySec * SR),
    );
  }
  return sig;
}

/** Repeating strums of a voicing (MIDI notes low→high). */
function strumLoop(midis: number[], everySec: number, count: number): Float32Array {
  const sig = new Float32Array(Math.floor(SR * everySec * count));
  for (let i = 0; i < count; i++) {
    mixInto(
      sig,
      renderStrum(
        midis.map((m) => midiToHz(m)),
        { sampleRate: SR, durationSec: everySec, seed: i + 3 },
      ),
      Math.floor(i * everySec * SR),
    );
  }
  return sig;
}

const fixtures: Record<string, Float32Array> = {
  'tuner-e2.wav': pluckLoop(40, 1.5, 4),
  'pluck-e4.wav': pluckLoop(64, 0.7, 6),
  'strum-em.wav': strumLoop([40, 47, 52, 55, 59, 64], 1.2, 4),
  'strum-am.wav': strumLoop([45, 52, 57, 60, 64], 1.2, 4),
};

for (const [name, samples] of Object.entries(fixtures)) {
  writeFileSync(join(outDir, name), encodeWav(samples, SR));
  console.log(`wrote ${name} (${(samples.length / SR).toFixed(1)} s)`);
}
