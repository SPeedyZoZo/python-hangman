import { describe, expect, it } from 'vitest';
import { RuleBasedCoach } from '../../src/coach/RuleBasedCoach.ts';
import { answerFromFaq, FAQ } from '../../src/coach/faq.ts';
import {
  fretSlip,
  lateChanges,
  missingTone,
  readyForMore,
  struggling,
  timing,
  tipsFor,
  tuning,
  wrongString,
} from '../../src/coach/rules.ts';
import type { SessionSummary } from '../../src/practice/scoring.ts';

function summary(over: Partial<SessionSummary> = {}): SessionSummary {
  return {
    mode: 'wait',
    tempo: 0.7,
    bpm: 70,
    passes: 1,
    totalSteps: 10,
    counts: { perfect: 0, good: 0, early: 0, late: 0, miss: 0, hit: 10 },
    accuracy: 0.8,
    stars: 2,
    meanDeltaMs: null,
    wrongAttempts: 0,
    wrongNotes: [],
    chordIssues: [],
    meanAbsCents: null,
    changeSteps: 0,
    changeProblems: 0,
    durationMs: 60000,
    ...over,
  };
}

describe('coaching rules (FR-RES-2)', () => {
  it('fret slip: one fret too high', () => {
    const t = fretSlip(
      summary({
        wrongNotes: [1, 2].map(() => ({ targetMidi: 64, heardMidi: 65, string: 1, fret: 0 })),
      }),
    );
    expect(t?.title).toBe('A fret too high.');
    expect(t?.body).toMatch(/F4 instead of E4/);
  });

  it('wrong string: same fret on a neighbouring string', () => {
    // target string 2 fret 1 (C4 = 60); heard string 1 fret 1 (F4 = 65)
    const t = wrongString(
      summary({
        wrongNotes: [1, 2].map(() => ({ targetMidi: 60, heardMidi: 65, string: 2, fret: 1 })),
      }),
    );
    expect(t?.body).toMatch(/string 1 \(e\) instead of string 2 \(B\)/);
  });

  it('timing: rushing and dragging only in play-along', () => {
    expect(timing(summary({ mode: 'play', meanDeltaMs: -90 }))?.id).toBe('rushing');
    expect(timing(summary({ mode: 'play', meanDeltaMs: 95 }))?.id).toBe('dragging');
    expect(timing(summary({ mode: 'play', meanDeltaMs: 20 }))).toBeNull();
    expect(timing(summary({ mode: 'wait', meanDeltaMs: -90 }))).toBeNull();
  });

  it('late chord changes', () => {
    expect(lateChanges(summary({ changeSteps: 4, changeProblems: 2 }))?.id).toBe('late-changes');
    expect(lateChanges(summary({ changeSteps: 4, changeProblems: 1 }))).toBeNull();
  });

  it('missing tone names the finger and fret', () => {
    const hint = { kind: 'missing' as const, pitchClass: 6, note: 'F♯', string: 1 as const };
    const t = missingTone(
      summary({
        chordIssues: [
          { chord: 'D', hints: [hint] },
          { chord: 'D', hints: [hint] },
        ],
      }),
    );
    expect(t?.title).toBe("In D, the F♯ isn't ringing.");
    expect(t?.body).toMatch(/second \(middle\) finger firmly at fret 2 on string 1/);
  });

  it('missing open string asks to arch fingers', () => {
    const hint = { kind: 'missing' as const, pitchClass: 7, note: 'G', string: 3 as const };
    const t = missingTone(
      summary({
        chordIssues: [
          { chord: 'C', hints: [hint] },
          { chord: 'C', hints: [hint] },
        ],
      }),
    );
    expect(t?.body).toMatch(/String 3 should ring open/);
  });

  it('progression nudges', () => {
    expect(readyForMore(summary({ accuracy: 0.97, mode: 'wait' }))?.id).toBe('try-play-along');
    expect(readyForMore(summary({ accuracy: 0.97, mode: 'play', tempo: 0.7 }))?.body).toMatch(
      /80% tempo/,
    );
    expect(struggling(summary({ accuracy: 0.4, mode: 'play', tempo: 0.8 }))?.body).toMatch(/60%/);
    expect(tuning(summary({ meanAbsCents: 28 }))?.id).toBe('tuning');
  });

  it('returns at most 3 tips, most important first', () => {
    const tips = tipsFor(
      summary({
        accuracy: 0.4,
        mode: 'play',
        meanDeltaMs: 100,
        meanAbsCents: 30,
        changeSteps: 4,
        changeProblems: 3,
      }),
    );
    expect(tips).toHaveLength(3);
    expect(tips.map((t) => t.id)).toEqual(['slow-down', 'late-changes', 'tuning']);
  });

  it('always has something to say', () => {
    expect(tipsFor(summary()).length).toBeGreaterThan(0);
  });
});

describe('Ask the coach FAQ (FR-RES-4)', () => {
  it.each([
    ['my fingers really hurt', 'sore-fingers'],
    ['why is there a buzzing sound', 'buzzing'],
    ['How do I tune?', 'tuning'],
    ['changing chords is so slow', 'chord-changes'],
    ['the app is not hearing me', 'not-hearing'],
    ["what's wait mode", 'modes'],
    ['I am left handed', 'left-handed'],
    ['F barre chord is impossible', 'f-chord'],
  ])('"%s" → %s', (q, id) => {
    expect(answerFromFaq(q).faqId).toBe(id);
  });

  it('falls back gracefully', async () => {
    const a = await new RuleBasedCoach().ask('what is the capital of France');
    expect(a.source).toBe('fallback');
  });

  it('has unique ids and non-empty answers', () => {
    expect(new Set(FAQ.map((f) => f.id)).size).toBe(FAQ.length);
    for (const f of FAQ) expect(f.answer.length).toBeGreaterThan(40);
  });
});
