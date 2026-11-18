# Content schema and tab DSL

**Owner:** Solution Architect with Content Author · **Implemented in:** `src/content/types.ts`, `src/music/tab.ts`, `src/content/validate.ts`

## 1. Tab DSL

Exercises are written as a compact, space-separated string. Bars are separated by `|`, which is
purely visual but used for A–B loop ranges.

| Token            | Meaning                                                   | Example                    |
| ---------------- | --------------------------------------------------------- | -------------------------- |
| `S.F`            | Note on string S (1 = high e … 6 = low E), fret F         | `1.0`, `3.2`, `6.3`        |
| `Chord`          | Strummed chord from the chord library (case-sensitive id) | `Em`, `G`, `Fmaj7`         |
| `r`              | Rest                                                      | `r`                        |
| `*N` suffix      | Duration in beats (default 1, fractions allowed)          | `1.0*2`, `Em*4`, `2.1*0.5` |
| `v` / `^` suffix | Strum direction down or up (chords only, display only)    | `Em*0.5v`, `Em*0.5^`       |
| `                | `                                                         | Bar line                   | `1.0 1.1 1.3 1.1 | 1.0*4` |

Example (first phrase of "Ode to Joy", public domain): `1.0 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 1.0*1.5 2.3*0.5 2.3*2`

## 2. Types

```ts
type NoteTarget = { kind: 'note'; string: 1 | 2 | 3 | 4 | 5 | 6; fret: number; midi: number };
type ChordTarget = { kind: 'chord'; chord: ChordId; strum?: 'down' | 'up' };
type RestTarget = { kind: 'rest' };
interface Step {
  index: number;
  beat: number;
  beats: number;
  bar: number;
  target: NoteTarget | ChordTarget | RestTarget;
}

interface Exercise {
  tab: string;
  bpm: number;
  beatsPerBar: number;
} // authored
interface Lesson {
  id: string;
  unitId: string;
  title: string;
  summary: string;
  kind: 'notes' | 'chords' | 'strum' | 'changes';
  objectives: string[];
  tips: { title: string; body: string; chord?: ChordId }[];
  exercise: Exercise;
  defaultMode: 'wait' | 'play';
  defaultTempo: number;
  xp: number;
}
interface Unit {
  id: string;
  title: string;
  description: string;
  lessonIds: string[];
}
interface Song {
  id: string;
  title: string;
  credit: string;
  provenance: string;
  difficulty: 1 | 2 | 3;
  arrangements: { id: 'melody' | 'chords'; label: string; exercise: Exercise }[];
}
```

## 3. Validation rules (`validateContent()`)

- Every tab token parses. Strings are 1–6, frets 0–15, chords exist in the library, durations are greater than 0.
- Lesson and song ids are unique. Every `lessonIds` entry exists. Every lesson belongs to exactly one unit.
- `bpm` is 40–160 and `beatsPerBar` is 2–6. `defaultTempo` is in {0.5,…,1.0}.
- Songs have a non-empty `provenance` and at least 1 arrangement.
- Bar sums are checked: each complete bar's beats equal `beatsPerBar` (a final partial bar is allowed).
