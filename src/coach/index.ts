import { RuleBasedCoach } from './RuleBasedCoach.ts';
import type { CoachProvider } from './types.ts';

/**
 * The active coach. To plug in a Claude-powered coach later (ADR-0006), implement
 * `CoachProvider` (calling a server-side proxy, never shipping an API key) and swap it here,
 * falling back to RuleBasedCoach when offline.
 */
export const coach: CoachProvider = new RuleBasedCoach();
