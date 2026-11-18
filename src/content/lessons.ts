import type { Lesson, Unit } from './types.ts';

/**
 * "Strumly Foundations" curriculum. See docs/05-content/curriculum.md.
 * Exercises are original unless marked PD (public-domain melody, no lyrics).
 */

export const UNITS: Unit[] = [
  {
    id: 'u1',
    title: 'Meet your guitar',
    description: 'Hold the guitar, find the strings, and play your first notes.',
    lessonIds: ['u1-open-e', 'u1-b-and-e', 'u1-six-strings', 'u1-first-frets'],
  },
  {
    id: 'u2',
    title: 'First melodies',
    description: 'Play real tunes on the top strings.',
    lessonIds: ['u2-three-notes', 'u2-little-lamb', 'u2-crossing', 'u2-ode'],
  },
  {
    id: 'u3',
    title: 'First chords',
    description: 'Em, Am, D, G and C: the chords behind thousands of songs.',
    lessonIds: ['u3-em', 'u3-am', 'u3-em-am', 'u3-d', 'u3-g', 'u3-c'],
  },
  {
    id: 'u4',
    title: 'Strum and change',
    description: 'Keep a steady strum and switch chords in time.',
    lessonIds: ['u4-down-strums', 'u4-g-c-d', 'u4-down-up', 'u4-four-chord'],
  },
  {
    id: 'u5',
    title: 'Bigger sounds',
    description: 'E and A majors, three-chord rock and your first F.',
    lessonIds: ['u5-e-a', 'u5-rock', 'u5-mini-f'],
  },
];

export const LESSONS: Lesson[] = [
  // ── Unit 1 ───────────────────────────────────────────────────────────────
  {
    id: 'u1-open-e',
    unitId: 'u1',
    title: 'Open high e',
    summary: 'Pick the thinnest string, nice and even.',
    kind: 'notes',
    objectives: ['Pick string 1 (high e) cleanly', 'Read a note on the tab highway'],
    tips: [
      {
        title: 'Strings are numbered from the floor up',
        body: 'String 1 is the thinnest one, nearest the floor. On the highway it is the top lane, just like guitar tab.',
      },
      {
        title: 'Zero means open',
        body: 'A 0 on a note means play the string without pressing any fret. Pick down, then let it ring.',
      },
    ],
    exercise: {
      tab: '1.0*2 1.0*2 | 1.0 1.0 1.0 1.0 | 1.0*2 1.0*2 | 1.0*4',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 30,
  },
  {
    id: 'u1-b-and-e',
    unitId: 'u1',
    title: 'B and e',
    summary: 'Hop between the top two strings.',
    kind: 'notes',
    objectives: ['Find string 2 (B)', 'Alternate between strings 2 and 1'],
    tips: [
      {
        title: 'Small movements',
        body: 'Keep your picking hand close to the strings. Moving from B to e is a tiny step, not a jump.',
      },
    ],
    exercise: {
      tab: '2.0*2 1.0*2 | 2.0 2.0 1.0 1.0 | 2.0 1.0 2.0 1.0 | 2.0*2 1.0*2',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 30,
  },
  {
    id: 'u1-six-strings',
    unitId: 'u1',
    title: 'All six strings',
    summary: 'Walk from the low E to the high e and back.',
    kind: 'notes',
    objectives: ['Name all six open strings', 'Pick each string without looking'],
    tips: [
      {
        title: 'Eddie Ate Dynamite, Good Bye Eddie',
        body: 'The open strings from thickest to thinnest are E A D G B e. Say the phrase as you play each one.',
      },
    ],
    exercise: {
      tab: '6.0*2 5.0*2 | 4.0*2 3.0*2 | 2.0*2 1.0*2 | 1.0*2 2.0*2 | 3.0*2 4.0*2 | 5.0*2 6.0*2',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 35,
  },
  {
    id: 'u1-first-frets',
    unitId: 'u1',
    title: 'Your first frets',
    summary: 'Press frets 1 and 3 on the top two strings.',
    kind: 'notes',
    objectives: [
      'Fret a note just behind the metal fret wire',
      'Use finger 1 for fret 1 and finger 3 for fret 3',
    ],
    tips: [
      {
        title: 'Press just behind the fret',
        body: 'Press with your fingertip right next to the fret wire, not on top of it. You need less pressure there and get less buzz.',
      },
      {
        title: 'One finger per fret',
        body: 'Index finger plays fret 1, ring finger plays fret 3. Keep your thumb behind the neck.',
      },
    ],
    exercise: {
      tab: '1.0 1.1 1.3 1.1 | 1.0*2 r*2 | 2.0 2.1 2.3 2.1 | 2.0*2 r*2 | 2.1 2.3 1.0 1.1 | 1.3*4',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 40,
  },
  // ── Unit 2 ───────────────────────────────────────────────────────────────
  {
    id: 'u2-three-notes',
    unitId: 'u2',
    title: 'Three-note tune',
    summary: 'B, C and D on the B string ("Hot Cross Buns", traditional).',
    kind: 'notes',
    objectives: ['Play a stepwise tune on one string', 'Keep fingers hovering near the frets'],
    tips: [
      {
        title: 'Down the staircase',
        body: 'Fret 3, fret 1, open. Lift each finger just enough to let the next note sound.',
      },
    ],
    exercise: {
      tab: '2.3 2.1 2.0*2 | 2.3 2.1 2.0*2 | 2.0*0.5 2.0*0.5 2.0*0.5 2.0*0.5 2.1*0.5 2.1*0.5 2.1*0.5 2.1*0.5 | 2.3 2.1 2.0*2',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 40,
  },
  {
    id: 'u2-little-lamb',
    unitId: 'u2',
    title: 'Little lamb',
    summary: 'Your first full melody across two strings (traditional).',
    kind: 'notes',
    objectives: ['Cross between strings 1 and 2 smoothly', 'Play a full 8-bar melody'],
    tips: [
      {
        title: 'Same note, two places',
        body: 'This tune moves between E (open high e) and D (fret 3 on the B string). Keep your ring finger ready over fret 3.',
      },
    ],
    exercise: {
      tab: '1.0 2.3 2.1 2.3 | 1.0 1.0 1.0*2 | 2.3 2.3 2.3*2 | 1.0 1.3 1.3*2 | 1.0 2.3 2.1 2.3 | 1.0 1.0 1.0 1.0 | 2.3 2.3 1.0 2.3 | 2.1*4',
      bpm: 80,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 45,
  },
  {
    id: 'u2-crossing',
    unitId: 'u2',
    title: 'Crossing strings',
    summary: 'Climb from the G string onto the B string.',
    kind: 'notes',
    objectives: ['Play fret 2 on the G string with finger 2', 'Move across strings without a gap'],
    tips: [
      {
        title: 'Plan the move',
        body: 'Before each string change, look at the next gem. Your picking hand moves one string; your fretting hand stays in the same spot.',
      },
    ],
    exercise: {
      tab: '3.0 3.2 2.0 2.1 | 2.3*2 2.1 2.0 | 3.2 3.0 3.2 2.0 | 2.1*4 | 3.0 3.2 2.0 2.1 | 2.3 2.1 2.0 3.2 | 3.0*4',
      bpm: 75,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 45,
  },
  {
    id: 'u2-ode',
    unitId: 'u2',
    title: 'Ode to Joy',
    summary: "Beethoven's famous theme (public domain).",
    kind: 'notes',
    objectives: [
      'Play a famous melody from start to finish',
      'Try it in Play-along once Wait Mode feels easy',
    ],
    tips: [
      {
        title: 'Four notes do most of the work',
        body: 'E (open e), F (e string fret 1), G (e string fret 3) and D (B string fret 3), with C (B string fret 1) at the end of phrases.',
      },
      {
        title: 'Dotted rhythm',
        body: 'Near the end of each line one note is long and the next is short. Listen first to hear how it goes.',
      },
    ],
    exercise: {
      tab: '1.0 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 1.0*1.5 2.3*0.5 2.3*2 | 1.0 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 2.3*1.5 2.1*0.5 2.1*2',
      bpm: 90,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 60,
  },
  // ── Unit 3 ───────────────────────────────────────────────────────────────
  {
    id: 'u3-em',
    unitId: 'u3',
    title: 'E minor',
    summary: 'Your first chord: two fingers, six strings.',
    kind: 'chords',
    objectives: ['Fret Em with fingers 2 and 3', 'Strum all six strings so every note rings'],
    tips: [
      {
        title: 'The Em shape',
        body: 'Middle finger on the A string, fret 2. Ring finger on the D string, fret 2.',
        chord: 'Em',
      },
      {
        title: 'Check each string',
        body: 'Pick the strings one at a time. If one sounds dull, arch your fingers so they do not touch the strings below.',
      },
    ],
    exercise: { tab: 'Em*4 | Em*4 | Em*2 Em*2 | Em*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 50,
  },
  {
    id: 'u3-am',
    unitId: 'u3',
    title: 'A minor',
    summary: 'Same shape as Em, one string over, plus finger 1.',
    kind: 'chords',
    objectives: ['Fret Am', 'Start the strum from the A string'],
    tips: [
      {
        title: 'The Am shape',
        body: 'Fingers 2 and 3 on fret 2 of the D and G strings, finger 1 on fret 1 of the B string.',
        chord: 'Am',
      },
    ],
    exercise: { tab: 'Am*4 | Am*4 | Am*2 Am*2 | Am*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 50,
  },
  {
    id: 'u3-em-am',
    unitId: 'u3',
    title: 'Em ↔ Am',
    summary: 'Your first chord change.',
    kind: 'changes',
    objectives: ['Change between Em and Am', 'Move fingers 2 and 3 together as one unit'],
    tips: [
      {
        title: 'Move as a block',
        body: 'Fingers 2 and 3 keep the same shape and just shift across one string. Then add finger 1 for Am.',
        chord: 'Am',
      },
    ],
    exercise: {
      tab: 'Em*4 | Am*4 | Em*4 | Am*4 | Em*2 Am*2 | Em*2 Am*2 | Em*4',
      bpm: 60,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 60,
  },
  {
    id: 'u3-d',
    unitId: 'u3',
    title: 'D major',
    summary: 'A bright triangle on the top strings.',
    kind: 'chords',
    objectives: ['Fret D', 'Strum only the top four strings'],
    tips: [
      {
        title: 'The D shape',
        body: 'Finger 1 on the G string fret 2, finger 3 on the B string fret 3, finger 2 on the high e fret 2.',
        chord: 'D',
      },
      {
        title: 'Skip the bass',
        body: 'Start the strum on the D string (the 4th string). Low E and A stay silent.',
      },
    ],
    exercise: { tab: 'D*4 | D*4 | D*2 D*2 | D*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 50,
  },
  {
    id: 'u3-g',
    unitId: 'u3',
    title: 'G major',
    summary: 'A big, full chord with a stretch.',
    kind: 'chords',
    objectives: ['Fret G', 'Strum all six strings'],
    tips: [
      {
        title: 'The G shape',
        body: 'Finger 2 on the low E fret 3, finger 1 on the A string fret 2, finger 3 on the high e fret 3.',
        chord: 'G',
      },
    ],
    exercise: { tab: 'G*4 | G*4 | G*2 G*2 | G*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 50,
  },
  {
    id: 'u3-c',
    unitId: 'u3',
    title: 'C major',
    summary: 'The staircase shape.',
    kind: 'chords',
    objectives: ['Fret C', 'Keep the open G string ringing'],
    tips: [
      {
        title: 'The C shape',
        body: 'Finger 3 on the A string fret 3, finger 2 on the D string fret 2, finger 1 on the B string fret 1.',
        chord: 'C',
      },
      {
        title: 'Arch!',
        body: 'Curl your fingers so the open G and high e strings are free to ring.',
      },
    ],
    exercise: { tab: 'C*4 | C*4 | C*2 C*2 | C*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 50,
  },
  // ── Unit 4 ───────────────────────────────────────────────────────────────
  {
    id: 'u4-down-strums',
    unitId: 'u4',
    title: 'Steady down-strums',
    summary: 'One strum per beat on G and D.',
    kind: 'strum',
    objectives: ['Strum down on every beat', 'Keep going even if a strum is not perfect'],
    tips: [
      {
        title: 'The beat is the boss',
        body: 'Count 1 2 3 4 out loud and strum on every number. A steady beat matters more than perfect chords.',
      },
    ],
    exercise: {
      tab: 'G G G G | G G G G | D D D D | D D D D | G G G G | D D D D | G*4',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'play',
    defaultTempo: 0.7,
    xp: 60,
  },
  {
    id: 'u4-g-c-d',
    unitId: 'u4',
    title: 'G – C – D',
    summary: 'Three chords, endless songs.',
    kind: 'changes',
    objectives: ['Change G → C → D in time', 'Start moving on the last beat of each chord'],
    tips: [
      {
        title: 'Anchor finger',
        body: 'Going from C to D, your first finger only slides from the B string to the G string.',
      },
      {
        title: 'Move early',
        body: 'Start lifting your fingers on beat 4 so the new chord lands on beat 1.',
      },
    ],
    exercise: {
      tab: 'G*4 | G*4 | C*4 | C*4 | D*4 | D*4 | G*4 | G*2 C*2 | D*2 G*2',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 70,
  },
  {
    id: 'u4-down-up',
    unitId: 'u4',
    title: 'Down and up',
    summary: 'The classic ↓ ↓↑ ↑↓↑ strum on Em.',
    kind: 'strum',
    objectives: [
      'Play the down, down-up, up-down-up pattern',
      'Keep your hand moving down and up all the time',
    ],
    tips: [
      {
        title: 'Never stop the pendulum',
        body: 'Your hand swings down on the beats and up in between, even when it misses the strings. The pattern is in the arrows: ↓ ↓↑ ↑↓↑.',
      },
    ],
    exercise: {
      tab: 'Emv Em*0.5v Em*0.5^ r*0.5 Em*0.5^ Em*0.5v Em*0.5^ | Emv Em*0.5v Em*0.5^ r*0.5 Em*0.5^ Em*0.5v Em*0.5^ | Emv Em*0.5v Em*0.5^ r*0.5 Em*0.5^ Em*0.5v Em*0.5^ | Em*4',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'play',
    defaultTempo: 0.6,
    xp: 70,
  },
  {
    id: 'u4-four-chord',
    unitId: 'u4',
    title: 'The four-chord loop',
    summary: 'G – D – Em – C, the backbone of countless songs.',
    kind: 'changes',
    objectives: ['Play G, D, Em and C in a loop', 'Keep the strum going through the changes'],
    tips: [
      {
        title: 'Shortcut',
        body: 'From G to D, keep your ring finger near fret 3. It lands on the B string for D.',
      },
    ],
    exercise: {
      tab: 'G*4 | D*4 | Em*4 | C*4 | G*4 | D*4 | Em*4 | C*4 | G*4',
      bpm: 70,
      beatsPerBar: 4,
    },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 80,
  },
  // ── Unit 5 ───────────────────────────────────────────────────────────────
  {
    id: 'u5-e-a',
    unitId: 'u5',
    title: 'E and A majors',
    summary: 'Two bright major chords.',
    kind: 'chords',
    objectives: ['Fret E and A', 'Change between them'],
    tips: [
      {
        title: 'E is Em plus one',
        body: 'Play Em and add your first finger on the G string, fret 1.',
        chord: 'E',
      },
      {
        title: 'A in a row',
        body: 'Fingers 1, 2 and 3 squeeze into fret 2 on the D, G and B strings.',
        chord: 'A',
      },
    ],
    exercise: { tab: 'E*4 | E*4 | A*4 | A*4 | E*2 A*2 | E*2 A*2 | E*4', bpm: 70, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 70,
  },
  {
    id: 'u5-rock',
    unitId: 'u5',
    title: 'Three-chord rock',
    summary: 'A – D – E, the three chords of a classic twelve-bar feel.',
    kind: 'changes',
    objectives: ['Change between A, D and E in time'],
    tips: [
      {
        title: 'Lean into it',
        body: 'Strum with energy. Rock rhythm is all about a confident, even beat.',
      },
    ],
    exercise: {
      tab: 'A*4 | A*4 | D*4 | D*4 | E*4 | D*4 | A*4 | E*4 | A*4',
      bpm: 80,
      beatsPerBar: 4,
    },
    defaultMode: 'play',
    defaultTempo: 0.7,
    xp: 80,
  },
  {
    id: 'u5-mini-f',
    unitId: 'u5',
    title: 'Mini F',
    summary: 'A small F shape on the top four strings.',
    kind: 'changes',
    objectives: ['Fret the small F (xx3211)', 'Change between C and F'],
    tips: [
      {
        title: 'A mini barre',
        body: 'Your first finger lies flat across the B and high e strings at fret 1. Roll it slightly onto its bony edge.',
        chord: 'F',
      },
    ],
    exercise: { tab: 'C*4 | F*4 | C*4 | F*4 | C*2 F*2 | C*2 F*2 | C*4', bpm: 60, beatsPerBar: 4 },
    defaultMode: 'wait',
    defaultTempo: 0.7,
    xp: 90,
  },
];
