import type { SessionSummary } from '../practice/scoring.ts';

export interface CoachTip {
  id: string;
  title: string;
  body: string;
}

export interface CoachAnswer {
  answer: string;
  /** Ids of related lessons or screens the UI can link to. */
  links?: { label: string; to: string }[];
  source: 'faq' | 'llm' | 'fallback';
}

/** ADR-0006: the UI depends only on this interface, so a Claude-powered coach can plug in later. */
export interface CoachProvider {
  id: string;
  getTips(summary: SessionSummary): Promise<CoachTip[]>;
  ask(question: string): Promise<CoachAnswer>;
}
