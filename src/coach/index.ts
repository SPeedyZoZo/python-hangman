import type { CoachProvider } from './types.ts';

/** Placeholder until Sprint 4's RuleBasedCoach lands. */
export const coach: CoachProvider = {
  id: 'none',
  getTips: async () => [],
  ask: async () => ({ answer: 'The coach is coming soon.', source: 'fallback' }),
};
