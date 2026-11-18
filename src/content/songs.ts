import type { Song } from './types.ts';

/**
 * Public-domain / traditional song library: melody and chord charts only, NO lyrics.
 * Every entry must also be listed in docs/05-content/licensing.md.
 * Tabs are in-house first-position transcriptions.
 */
export const SONGS: Song[] = [
  {
    id: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    credit: 'Traditional (English)',
    provenance: 'Traditional English street cry, 18th century. Public domain.',
    difficulty: 1,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: '2.3 2.1 2.0*2 | 2.3 2.1 2.0*2 | 2.0*0.5 2.0*0.5 2.0*0.5 2.0*0.5 2.1*0.5 2.1*0.5 2.1*0.5 2.1*0.5 | 2.3 2.1 2.0*2',
          bpm: 90,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    credit: 'Traditional (American)',
    provenance: 'Traditional American melody, 1830s. Public domain.',
    difficulty: 1,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: '1.0 2.3 2.1 2.3 | 1.0 1.0 1.0*2 | 2.3 2.3 2.3*2 | 1.0 1.3 1.3*2 | 1.0 2.3 2.1 2.3 | 1.0 1.0 1.0 1.0 | 2.3 2.3 1.0 2.3 | 2.1*4',
          bpm: 100,
          beatsPerBar: 4,
        },
      },
      {
        id: 'chords',
        label: 'Chords (C, G)',
        exercise: { tab: 'C*4 | C*4 | G*4 | C*4 | C*4 | C*4 | G*4 | C*4', bpm: 80, beatsPerBar: 4 },
      },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    credit: 'Ludwig van Beethoven',
    provenance: 'Theme from Symphony No. 9, 1824. Public domain.',
    difficulty: 1,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: '1.0 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 1.0*1.5 2.3*0.5 2.3*2 | 1.0 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 2.3*1.5 2.1*0.5 2.1*2',
          bpm: 100,
          beatsPerBar: 4,
        },
      },
      {
        id: 'chords',
        label: 'Chords (C, G)',
        exercise: {
          tab: 'C*4 | G*4 | C*4 | G*4 | C*4 | G*4 | C*4 | G*2 C*2',
          bpm: 80,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    credit: 'Traditional (French melody)',
    provenance: 'Melody of "Ah! vous dirai-je, maman", published 1761. Public domain.',
    difficulty: 1,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: '2.1 2.1 1.3 1.3 | 1.5 1.5 1.3*2 | 1.1 1.1 1.0 1.0 | 2.3 2.3 2.1*2 | 1.3 1.3 1.1 1.1 | 1.0 1.0 2.3*2 | 1.3 1.3 1.1 1.1 | 1.0 1.0 2.3*2 | 2.1 2.1 1.3 1.3 | 1.5 1.5 1.3*2 | 1.1 1.1 1.0 1.0 | 2.3 2.3 2.1*2',
          bpm: 100,
          beatsPerBar: 4,
        },
      },
      {
        id: 'chords',
        label: 'Chords (C, F, G)',
        exercise: {
          tab: 'C*4 | F*2 C*2 | F*2 C*2 | G*2 C*2 | C*2 F*2 | C*2 G*2 | C*2 F*2 | C*2 G*2 | C*4 | F*2 C*2 | F*2 C*2 | G*2 C*2',
          bpm: 80,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    credit: 'Traditional (French)',
    provenance: 'Traditional French round, 18th century. Public domain.',
    difficulty: 2,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: '2.1 2.3 1.0 2.1 | 2.1 2.3 1.0 2.1 | 1.0 1.1 1.3*2 | 1.0 1.1 1.3*2 | 1.3*0.5 1.5*0.5 1.3*0.5 1.1*0.5 1.0 2.1 | 1.3*0.5 1.5*0.5 1.3*0.5 1.1*0.5 1.0 2.1 | 2.1 3.0 2.1*2 | 2.1 3.0 2.1*2',
          bpm: 100,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'saints',
    title: 'When the Saints Go Marching In',
    credit: 'Traditional (American spiritual)',
    provenance: 'Traditional American spiritual. Public domain.',
    difficulty: 2,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody',
        exercise: {
          tab: 'r 2.1 1.0 1.1 | 1.3*4 | r 2.1 1.0 1.1 | 1.3*4 | r 2.1 1.0 1.1 | 1.3*2 1.0*2 | 2.1*2 1.0*2 | 2.3*4 | r 1.0 1.0 2.3 | 2.1*3 2.1 | 1.0*2 1.3 1.3 | 1.1*4 | 1.0 1.1 1.3*2 | 1.0*2 2.1*2 | 2.3*4 | 2.1*4',
          bpm: 110,
          beatsPerBar: 4,
        },
      },
      {
        id: 'chords',
        label: 'Chords (C, F, G)',
        exercise: {
          tab: 'C*4 | C*4 | C*4 | C*4 | C*4 | C*4 | C*4 | G*4 | C*4 | C*4 | C*4 | F*4 | C*4 | C*4 | G*4 | C*4',
          bpm: 100,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'oh-susanna',
    title: 'Oh! Susanna',
    credit: 'Stephen Foster',
    provenance: 'Stephen Foster, 1848. Public domain.',
    difficulty: 2,
    arrangements: [
      {
        id: 'chords',
        label: 'Chords (G, C, D)',
        exercise: {
          tab: 'G*4 | G*4 | G*4 | D*4 | G*4 | G*4 | D*4 | G*4 | C*4 | C*4 | G*4 | D*4 | G*4 | G*4 | D*4 | G*4',
          bpm: 90,
          beatsPerBar: 4,
        },
      },
    ],
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    credit: 'Traditional (tune "New Britain")',
    provenance: 'American folk tune "New Britain", 1829–1835. Public domain.',
    difficulty: 3,
    arrangements: [
      {
        id: 'melody',
        label: 'Melody (low)',
        exercise: {
          tab: '4.0 | 3.0*2 2.0*0.5 3.0*0.5 | 2.0*2 3.2 | 3.0*2 4.2 | 4.0*2 4.0 | 3.0*2 2.0*0.5 3.0*0.5 | 2.0*2 3.2 | 2.3*3 | 2.3*2 2.0 | 2.3*2 2.0*0.5 2.3*0.5 | 2.0*2 3.0 | 4.0*2 4.2*0.5 3.0*0.5 | 3.0*2 4.2 | 4.0*2 4.0 | 3.0*2 2.0*0.5 3.0*0.5 | 2.0*2 3.2 | 3.0*3',
          bpm: 80,
          beatsPerBar: 3,
        },
      },
      {
        id: 'chords',
        label: 'Chords (G, C, D)',
        exercise: {
          tab: 'r | G*3 | G*3 | C*3 | G*3 | G*3 | G*3 | D*3 | G*3 | G*3 | G*3 | G*3 | C*3 | G*3 | G*3 | D*3 | G*3',
          bpm: 80,
          beatsPerBar: 3,
        },
      },
    ],
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    credit: 'Traditional (English)',
    provenance: 'Traditional English, 16th century. Public domain.',
    difficulty: 3,
    arrangements: [
      {
        id: 'chords',
        label: 'Chords (Am, G, C, E)',
        exercise: {
          tab: 'Am*3 | G*3 | Am*3 | E*3 | Am*3 | G*3 | Am*3 | E*3 | C*3 | G*3 | Am*3 | E*3 | C*3 | G*3 | E*3 | Am*3',
          bpm: 90,
          beatsPerBar: 3,
        },
      },
    ],
  },
];
