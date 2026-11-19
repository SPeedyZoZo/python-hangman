import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sensitivity } from '../audio/analysis/sensitivity.ts';

export type Handedness = 'right' | 'left';
export type Theme = 'system' | 'dark' | 'light';
export type NoteLabels = 'fret' | 'note';
export type Level = 'new' | 'some' | 'returning';
export type GuitarType = 'acoustic' | 'electric' | 'classical';

export interface SettingsState {
  onboarded: boolean;
  level: Level;
  guitarType: GuitarType;
  handedness: Handedness;
  theme: Theme;
  labels: NoteLabels;
  sensitivity: Sensitivity;
  /** Added to detected onset times (ms): positive if the device input is late. */
  latencyMs: number;
  /** Use the on-screen fretboard instead of the microphone. */
  virtualInput: boolean;
  /** Show the on-screen fretboard in the player even when the mic is on. */
  showFretboard: boolean;
  metronome: boolean;
  /** Returning players can open every lesson. */
  unlockAll: boolean;
  /** Vibrate on on-screen-guitar taps and wrong attempts (never in microphone mode). */
  haptics: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set' | 'reset'>>) => void;
  reset: () => void;
}

export const DEFAULT_SETTINGS = {
  onboarded: false,
  level: 'new' as Level,
  guitarType: 'acoustic' as GuitarType,
  handedness: 'right' as Handedness,
  theme: 'system' as Theme,
  labels: 'fret' as NoteLabels,
  sensitivity: 'normal' as Sensitivity,
  latencyMs: 0,
  virtualInput: false,
  showFretboard: false,
  metronome: true,
  unlockAll: false,
  haptics: true,
};

/** Settings are small and needed synchronously at startup, so they use localStorage (ADR-0005). */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => set(patch),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    { name: 'strumly.settings', version: 1 },
  ),
);
