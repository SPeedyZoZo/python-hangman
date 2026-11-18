import type { SessionSummary } from '../practice/scoring.ts';
import { answerFromFaq } from './faq.ts';
import { tipsFor } from './rules.ts';
import type { CoachAnswer, CoachProvider, CoachTip } from './types.ts';

/** MVP coach: deterministic rules plus an offline FAQ (ADR-0006). No network, no data leaves the device. */
export class RuleBasedCoach implements CoachProvider {
  readonly id = 'rules-v1';

  async getTips(summary: SessionSummary): Promise<CoachTip[]> {
    return tipsFor(summary);
  }

  async ask(question: string): Promise<CoachAnswer> {
    return answerFromFaq(question);
  }
}
