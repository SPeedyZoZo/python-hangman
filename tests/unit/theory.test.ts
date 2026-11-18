import { describe, expect, it } from 'vitest';
import {
  centsFrom,
  fretToMidi,
  hzToMidi,
  midiToHz,
  nearestOpenString,
  noteName,
  pitchClass,
  positionsForMidi,
  STANDARD_TUNING,
  STRINGS,
} from '../../src/music/theory.ts';

describe('music theory', () => {
  it('converts A4 and E2 correctly', () => {
    expect(midiToHz(69)).toBeCloseTo(440, 6);
    expect(midiToHz(40)).toBeCloseTo(82.407, 2);
    expect(hzToMidi(440)).toBe(69);
    expect(hzToMidi(82.41)).toBe(40);
  });

  it('round-trips every playable note on strings 1–6, frets 0–24', () => {
    for (const s of STRINGS) {
      for (let f = 0; f <= 24; f++) {
        const m = fretToMidi(s, f);
        expect(m).toBe(STANDARD_TUNING[s] + f);
        expect(hzToMidi(midiToHz(m))).toBe(m);
        expect(Math.abs(centsFrom(midiToHz(m), m))).toBeLessThan(1e-6);
      }
    }
  });

  it('names notes with octaves', () => {
    expect(noteName(40)).toBe('E2');
    expect(noteName(60)).toBe('C4');
    expect(noteName(66)).toBe('F♯4');
    expect(noteName(64, false)).toBe('E');
    expect(pitchClass(-1)).toBe(11);
  });

  it('measures cents (sharp is positive)', () => {
    expect(centsFrom(midiToHz(69) * 2 ** (10 / 1200), 69)).toBeCloseTo(10, 6);
  });

  it('finds the nearest open string for the tuner', () => {
    expect(nearestOpenString(82.4).string).toBe(6);
    expect(nearestOpenString(110).string).toBe(5);
    expect(nearestOpenString(196).string).toBe(3);
    expect(nearestOpenString(330).string).toBe(1);
    expect(nearestOpenString(midiToHz(59) * 2 ** (-20 / 1200)).cents).toBeCloseTo(-20, 3);
  });

  it('lists positions for a pitch', () => {
    // E4 can be played on string 1 open, string 2 fret 5, string 3 fret 9, string 4 fret 14 (>12)
    expect(positionsForMidi(64)).toEqual([
      { string: 1, fret: 0 },
      { string: 2, fret: 5 },
      { string: 3, fret: 9 },
    ]);
  });
});
