import type { ChordId } from '../music/chords.ts';

export type PracticeMode = 'wait' | 'play';

export interface Exercise {
  /** Tab DSL, see docs/04-architecture/content-schema.md */
  tab: string;
  bpm: number;
  beatsPerBar: number;
}

export interface Tip {
  title: string;
  body: string;
  chord?: ChordId;
}

export type LessonKind = 'notes' | 'chords' | 'strum' | 'changes';

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  summary: string;
  kind: LessonKind;
  objectives: string[];
  tips: Tip[];
  exercise: Exercise;
  defaultMode: PracticeMode;
  defaultTempo: number;
  xp: number;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessonIds: string[];
}

export interface SongArrangement {
  id: 'melody' | 'chords';
  label: string;
  exercise: Exercise;
}

export interface Song {
  id: string;
  title: string;
  /** Composer or origin, shown in the library. */
  credit: string;
  /** Public-domain provenance (see docs/05-content/licensing.md). */
  provenance: string;
  difficulty: 1 | 2 | 3;
  arrangements: SongArrangement[];
}

/** Anything the player can play. */
export interface Playable {
  kind: 'lesson' | 'song';
  id: string;
  arrangementId?: SongArrangement['id'];
  title: string;
  subtitle: string;
  exercise: Exercise;
  defaultMode: PracticeMode;
  defaultTempo: number;
  xp: number;
  tips: Tip[];
}
