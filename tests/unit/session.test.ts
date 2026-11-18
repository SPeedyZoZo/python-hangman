import { describe, expect, it } from 'vitest';
import { parseTab } from '../../src/music/tab.ts';
import {
  PracticeSession,
  type SessionConfig,
  type SessionEvent,
} from '../../src/practice/session.ts';
import { chord, drive, note, silence } from './frames.ts';

function cfg(tab: string, over: Partial<SessionConfig> = {}): SessionConfig {
  const p = parseTab(tab, 4);
  return { ...p, bpm: 60, beatsPerBar: 4, mode: 'wait', tempo: 1, ...over };
}
const results = (ev: unknown[]) => (ev as SessionEvent[]).filter((e) => e.type === 'result');

describe('Wait Mode (FR-PLY-2)', () => {
  it('halts at the first note until it is played, then moves on', () => {
    const s = new PracticeSession(cfg('1.0 1.3 | 1.0*2'));
    s.start(0);
    // lead-in of 2 beats at 60 bpm = 2000 ms; then wait.
    drive(s, 0, 4000, silence);
    expect(s.state).toBe('waiting');
    expect(s.position(4000)).toBe(0);
    const ev = drive(s, 4016, 4100, (t) => note(t, 64, t === 4016));
    expect(results(ev)).toHaveLength(1);
    expect(s.state).toBe('running');
    expect(s.statusOf(0)).toBe('hit');
    expect(s.statusOf(1)).toBe('active');
  });

  it('needs a fresh pluck for a repeated note', () => {
    const s = new PracticeSession(cfg('1.0 1.0'));
    s.start(0);
    drive(s, 0, 2100, silence);
    drive(s, 2116, 2200, (t) => note(t, 64, t === 2116));
    expect(s.statusOf(0)).toBe('hit');
    // Still ringing, no new onset: second note must not count.
    drive(s, 2216, 4000, (t) => note(t, 64, false));
    expect(s.statusOf(1)).toBe('active');
    drive(s, 4016, 4100, (t) => note(t, 64, t === 4016));
    expect(s.statusOf(1)).toBe('hit');
  });

  it('ignores plucks for notes that are still far from the hit line', () => {
    const s = new PracticeSession(cfg('1.0*4 | 1.3'));
    s.start(0);
    drive(s, 0, 2100, silence);
    drive(s, 2116, 2200, (t) => note(t, 64, t === 2116));
    // Step 1 is 4 beats away: a G now is too early and must not count.
    drive(s, 2216, 2600, (t) => note(t, 67, t === 2216));
    expect(s.statusOf(1)).toBe('active');
    expect(s.results()).toHaveLength(1);
  });

  it('counts a wrong attempt once per pluck and records what was heard', () => {
    const s = new PracticeSession(cfg('1.0'));
    s.start(0);
    drive(s, 0, 2100, silence);
    const wrong = drive(s, 2116, 2700, (t) => note(t, 65, t === 2116));
    expect((wrong as SessionEvent[]).filter((e) => e.type === 'wrong')).toHaveLength(1);
    drive(s, 2716, 2800, (t) => note(t, 64, t === 2716));
    const r = s.results()[0]!;
    expect(r.wrongAttempts).toBe(1);
    expect(r.wrongHeard).toEqual([65]);
  });

  it('finishes after the last step and the remaining beats', () => {
    const s = new PracticeSession(cfg('1.0'));
    s.start(0);
    drive(s, 0, 2100, silence);
    drive(s, 2116, 2200, (t) => note(t, 64, t === 2116));
    const ev = drive(s, 2216, 3400, silence);
    expect((ev as SessionEvent[]).some((e) => e.type === 'finished')).toBe(true);
  });

  it('verifies chords in Wait Mode', () => {
    const s = new PracticeSession(cfg('Em*2 Am*2'));
    s.start(0);
    drive(s, 0, 2100, silence);
    drive(s, 2116, 2300, (t) => chord(t, 'Em', t === 2116));
    expect(s.statusOf(0)).toBe('hit');
    // Step 1 (beat 2) starts listening one beat ahead, i.e. ~1 s after the Em hit.
    drive(s, 2316, 3300, (t) => chord(t, 'Em', t === 2316)); // too early: ignored
    expect(s.results()).toHaveLength(1);
    drive(s, 3316, 4000, (t) => chord(t, 'Em', t === 3316)); // wrong chord strummed
    expect(s.statusOf(1)).toBe('active');
    drive(s, 4016, 4300, (t) => chord(t, 'Am', t === 4016));
    expect(s.statusOf(1)).toBe('hit');
    expect(s.results()[1]!.wrongAttempts).toBe(1);
  });
});

describe('Play-along (FR-PLY-3)', () => {
  // 60 bpm → 1000 ms per beat; count-in 4 beats → step 0 at 4000 ms, step 1 at 5000, step 2 at 6000.
  it('grades timing: perfect, late and miss', () => {
    const s = new PracticeSession(cfg('1.0 1.3 2.1', { mode: 'play' }));
    s.start(0);
    const play = (t: number) => {
      if (t >= 4000 && t < 4200) return note(t, 64, t === 4000); // on time (onsetT = 3990)
      if (t >= 5200 && t < 5400) return note(t, 67, t === 5200); // 190 ms late
      return silence(t);
    };
    drive(s, 0, 8000, play);
    const grades = s.results().map((r) => r.grade);
    expect(grades).toEqual(['perfect', 'late', 'miss']);
    expect(s.state).toBe('finished');
  });

  it('flags early hits', () => {
    const s = new PracticeSession(cfg('1.0', { mode: 'play' }));
    s.start(0);
    drive(s, 0, 6000, (t) => (t >= 3776 && t < 3900 ? note(t, 64, t === 3776) : silence(t)));
    expect(s.results()[0]!.grade).toBe('early');
    expect(s.results()[0]!.deltaMs).toBeLessThan(-160);
  });

  it('applies latency calibration', () => {
    const s = new PracticeSession(cfg('1.0', { mode: 'play', latencyMs: 200 }));
    s.start(0);
    drive(s, 0, 6000, (t) => (t >= 4208 && t < 4400 ? note(t, 64, t === 4208) : silence(t)));
    expect(s.results()[0]!.grade).toBe('perfect');
  });
});

describe('tempo and loop (FR-PLY-4, FR-PLY-5)', () => {
  it('tempo scales the beat length', () => {
    const s = new PracticeSession(cfg('1.0', { mode: 'play', tempo: 0.5 }));
    expect(s.beatMs).toBe(2000);
    s.start(0);
    expect(s.position(2000)).toBe(-3);
    s.setTempo(1, 2000);
    expect(s.position(3000)).toBe(-2);
  });

  it('loops a bar range until stopped', () => {
    const s = new PracticeSession(
      cfg('1.0*4 | 1.3*4 | 2.1*4', { mode: 'demo', loop: { startBar: 1, endBar: 1 } }),
    );
    expect(s.active.map((x) => x.index)).toEqual([1]);
    s.start(0);
    const ev = drive(s, 0, 20000, silence) as SessionEvent[];
    expect(ev.filter((e) => e.type === 'loop').length).toBeGreaterThanOrEqual(2);
    expect(s.state).toBe('running');
  });

  it('pause freezes the position', () => {
    const s = new PracticeSession(cfg('1.0', { mode: 'play' }));
    s.start(0);
    s.pause(1000);
    expect(s.position(5000)).toBe(-3);
    s.resume(5000);
    expect(s.position(6000)).toBe(-2);
  });
});
