import { describe, expect, it } from 'vitest';
import { analyzeSignal } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { renderExercise, renderStep } from '../../src/audio/synth/render.ts';
import { mixInto } from '../../src/audio/synth/karplusStrong.ts';
import { parseTab } from '../../src/music/tab.ts';
import { PracticeSession } from '../../src/practice/session.ts';
import { SR, withNoise } from './helpers.ts';

/** Full pipeline in Node: synthetic guitar audio → FrameAnalyzer → PracticeSession. */
describe('audio → session integration', () => {
  const tab = '1.0 1.1 1.3 1.1 | 1.0 2.3 2.1*2 | 3.0 3.2 2.0 2.1 | 2.3*4';

  it('play-along: on-time playing grades every step perfect/good', () => {
    const parsed = parseTab(tab, 4);
    const session = new PracticeSession({
      ...parsed,
      bpm: 80,
      beatsPerBar: 4,
      mode: 'play',
      tempo: 1,
    });
    // Session starts at t=0 with a 4-beat count-in; render audio with the same lead-in.
    const audio = withNoise(
      renderExercise(parsed.steps, { sampleRate: SR, msPerBeat: 750, leadInBeats: 4 }),
      25,
    );
    session.start(0);
    for (const f of analyzeSignal(audio, SR)) session.tick(f.t, f);
    const grades = session.results().map((r) => r.grade);
    console.log('[pipeline:play]', grades.join(' '));
    expect(grades).toHaveLength(parsed.steps.length);
    expect(grades.every((g) => g === 'perfect' || g === 'good')).toBe(true);
  });

  it('wait mode: a slow, irregular player still completes every step first try', () => {
    const parsed = parseTab(tab, 4);
    const session = new PracticeSession({
      ...parsed,
      bpm: 80,
      beatsPerBar: 4,
      mode: 'wait',
      tempo: 1,
    });
    const gaps = [1.1, 1.6, 0.9, 1.4, 1.2, 2.0, 1.0, 1.3, 1.5, 0.95, 1.25, 1.7];
    const audio = new Float32Array(SR * 20);
    let t = 2.5;
    parsed.steps.forEach((s, i) => {
      mixInto(audio, renderStep(s, SR, 1.5, i + 1), Math.floor(t * SR));
      t += gaps[i % gaps.length]!;
    });
    session.start(0);
    for (const f of analyzeSignal(withNoise(audio, 25), SR)) session.tick(f.t, f);
    const res = session.results();
    console.log(
      '[pipeline:wait]',
      res.map((r) => `${r.grade}${r.wrongAttempts ? '×' + r.wrongAttempts : ''}`).join(' '),
    );
    expect(res).toHaveLength(parsed.steps.length);
    expect(res.every((r) => r.wrongAttempts === 0)).toBe(true);
  });

  it('wait mode: wrong notes are counted and do not advance', () => {
    const parsed = parseTab('1.3', 4);
    const session = new PracticeSession({
      ...parsed,
      bpm: 80,
      beatsPerBar: 4,
      mode: 'wait',
      tempo: 1,
    });
    const audio = new Float32Array(SR * 6);
    // Two wrong notes (F4 then E4), then the right one (G4).
    mixInto(audio, renderStep(parseTab('1.1', 4).steps[0]!, SR, 1.2, 1), Math.floor(1.5 * SR));
    mixInto(audio, renderStep(parseTab('1.0', 4).steps[0]!, SR, 1.2, 2), Math.floor(2.8 * SR));
    mixInto(audio, renderStep(parsed.steps[0]!, SR, 1.2, 3), Math.floor(4.1 * SR));
    session.start(0);
    for (const f of analyzeSignal(audio, SR)) session.tick(f.t, f);
    const r = session.results()[0]!;
    expect(r.grade).toBe('hit');
    expect(r.wrongAttempts).toBe(2);
    expect(r.wrongHeard).toEqual([65, 64]);
  });

  it('chord changes (G – C – D – Em) in play-along are all on time', () => {
    const parsed = parseTab('G*2 C*2 | D*2 Em*2 | G*4', 4);
    const session = new PracticeSession({
      ...parsed,
      bpm: 80,
      beatsPerBar: 4,
      mode: 'play',
      tempo: 1,
    });
    const audio = withNoise(
      renderExercise(parsed.steps, { sampleRate: SR, msPerBeat: 750, leadInBeats: 4 }),
      25,
    );
    session.start(0);
    for (const f of analyzeSignal(audio, SR, { chroma: true })) session.tick(f.t, f);
    const grades = session.results().map((r) => r.grade);
    console.log('[pipeline:chords-play]', grades.join(' '));
    expect(grades.every((g) => g === 'perfect' || g === 'good')).toBe(true);
  });

  it('a chord lesson in Wait Mode rejects the wrong chord and accepts the right one', () => {
    const parsed = parseTab('Em*4', 4);
    const session = new PracticeSession({
      ...parsed,
      bpm: 60,
      beatsPerBar: 4,
      mode: 'wait',
      tempo: 1,
    });
    const audio = new Float32Array(SR * 7);
    const am = parseTab('Am', 4).steps[0]!;
    mixInto(audio, renderStep(am, SR, 1.4, 1), Math.floor(2.5 * SR));
    mixInto(audio, renderStep(parsed.steps[0]!, SR, 1.5, 2), Math.floor(4.2 * SR));
    session.start(0);
    for (const f of analyzeSignal(audio, SR, { chroma: true })) session.tick(f.t, f);
    const r = session.results()[0]!;
    expect(r.grade).toBe('hit');
    expect(r.wrongAttempts).toBe(1);
  });
});
