import type { CoachAnswer } from './types.ts';

/** Offline "Ask the coach" knowledge base (FR-RES-4). Original text. */
export interface FaqEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  links?: { label: string; to: string }[];
}

export const FAQ: FaqEntry[] = [
  {
    id: 'sore-fingers',
    question: 'My fingertips hurt. Is that normal?',
    keywords: [
      'hurt',
      'sore',
      'pain',
      'fingertip',
      'fingertips',
      'fingers',
      'ouch',
      'callus',
      'calluses',
      'blister',
    ],
    answer:
      'Yes. Sore fingertips are normal for the first two to three weeks while calluses form. Practise in short bursts (5–10 minutes), stop if it becomes sharp pain, and press only as hard as you need to: just behind the fret, not on top of it. Lighter strings or a lower action also help.',
  },
  {
    id: 'buzzing',
    question: 'Why does my note buzz?',
    keywords: ['buzz', 'buzzing', 'buzzes', 'rattle', 'dead', 'muted', 'muffled', 'dull', 'clean'],
    answer:
      'Buzzing usually means your finger is too far from the fret wire or not pressing firmly enough. Move your fingertip right up behind the fret and use the very tip. A dull, muted sound means another finger is touching the string, so arch your fingers more.',
  },
  {
    id: 'tuning',
    question: 'How do I tune my guitar?',
    keywords: ['tune', 'tuning', 'tuner', 'tuned', 'pitch', 'sharp', 'flat', 'out'],
    answer:
      'Open the Tuner tab and pluck one string at a time. Turn the peg until the needle sits in the green zone and the tuner says "In tune". Standard tuning from thickest to thinnest is E A D G B e. Tune up to the note (from slightly flat) so it stays in tune longer.',
    links: [{ label: 'Open the tuner', to: '/tuner' }],
  },
  {
    id: 'practice-time',
    question: 'How long should I practise?',
    keywords: [
      'long',
      'often',
      'practice',
      'practise',
      'daily',
      'minutes',
      'routine',
      'schedule',
      'time',
      'hours',
    ],
    answer:
      'Aim for 10–20 focused minutes a day rather than one long weekend session. A good routine: 2 minutes tuning and warm-up, 10 minutes on your current lesson, then 5 minutes playing a song you enjoy. Your streak rewards little-and-often.',
  },
  {
    id: 'chord-changes',
    question: 'My chord changes are too slow. What can I do?',
    keywords: [
      'change',
      'changes',
      'changing',
      'switch',
      'switching',
      'slow',
      'transition',
      'between',
      'fast',
      'faster',
      'quick',
    ],
    answer:
      'Practise the change on its own: switch between two chords for one minute and count how many changes you make, then try to beat it tomorrow. Look for "anchor" fingers that stay put or slide, and move all fingers together as one shape. In Play-along, start moving on the last beat.',
  },
  {
    id: 'reading-tab',
    question: 'How do I read the tab highway?',
    keywords: ['tab', 'read', 'reading', 'highway', 'numbers', 'lanes', 'gems', 'lines', 'mean'],
    answer:
      'Each lane is a string. The top lane is string 1 (thinnest, high e), like guitar tab. The number on a gem is the fret to press, and 0 means play the string open. Play the note when it reaches the orange line. Chords are tall bars with the chord name and a strum arrow.',
  },
  {
    id: 'holding-pick',
    question: 'How should I hold the pick?',
    keywords: ['pick', 'plectrum', 'hold', 'holding', 'grip', 'thumb', 'fingers'],
    answer:
      'Hold the pick between the pad of your thumb and the side of your index finger, with just the tip showing. Keep the grip relaxed. For strumming, let your wrist swing loosely like shaking water off your hand. No pick? Use the side of your thumb or the nail of your index finger.',
  },
  {
    id: 'not-hearing',
    question: 'The app is not hearing my notes.',
    keywords: [
      'hear',
      'hearing',
      'detect',
      'detecting',
      'detection',
      'microphone',
      'mic',
      'recognise',
      'recognize',
      'wrong',
      'not',
      'working',
      'listen',
    ],
    answer:
      'Put your phone or laptop close to the guitar (about 30–60 cm), in a quiet room, and check the input meter moves when you play. Tune your guitar first. If notes still go unheard, open Settings and set Detection sensitivity to "Easy". For electric guitars, play through an amp or speaker near the mic.',
    links: [
      { label: 'Settings', to: '/settings' },
      { label: 'Tuner', to: '/tuner' },
    ],
  },
  {
    id: 'modes',
    question: "What's the difference between Wait Mode and Play-along?",
    keywords: ['wait', 'mode', 'modes', 'play-along', 'playalong', 'along', 'difference', 'timing'],
    answer:
      'Wait Mode stops the music at every note or chord until you play it, which is perfect for learning shapes. Play-along keeps the music moving at the chosen tempo and scores your timing (perfect, good, early or late). Learn in Wait Mode, then prove it in Play-along.',
  },
  {
    id: 'f-chord',
    question: 'The F chord is impossible!',
    keywords: ['f', 'barre', 'bar', 'impossible', 'hard', 'difficult', 'index', 'flat'],
    answer:
      "Everyone finds F hard at first. Start with the mini F (xx3211) in Unit 5. Your first finger lies across the top two strings at fret 1. Roll the finger slightly onto its bony edge and keep your thumb low behind the neck. Full barre chords come later, so don't rush them.",
  },
  {
    id: 'strumming',
    question: 'How do I strum better?',
    keywords: [
      'strum',
      'strumming',
      'rhythm',
      'pattern',
      'up',
      'down',
      'downstroke',
      'upstroke',
      'beat',
    ],
    answer:
      'Keep your strumming hand moving down and up like a pendulum all the time: down on the beats, up in between. Hit the strings only where the pattern says so. Strum from the wrist, not the elbow, and aim for the right strings (start from the root string of the chord).',
    links: [{ label: 'Down and up lesson', to: '/play/lesson/u4-down-up' }],
  },
  {
    id: 'left-handed',
    question: "I'm left-handed. Can I use Strumly?",
    keywords: ['left', 'lefty', 'left-handed', 'handed', 'mirror', 'mirrored'],
    answer:
      'Yes. Turn on Left-handed in Settings and chord diagrams and the on-screen guitar are mirrored. The tab highway stays the same, because tab reads the same for everyone.',
    links: [{ label: 'Settings', to: '/settings' }],
  },
  {
    id: 'posture',
    question: 'How should I sit with the guitar?',
    keywords: ['sit', 'sitting', 'posture', 'stand', 'position', 'hold', 'back', 'wrist', 'neck'],
    answer:
      'Sit upright on a chair without arms, with the guitar body resting on your right leg (left leg for left-handers) and the neck angled slightly up. Keep your fretting wrist relaxed and your thumb behind the neck. Take a short break if anything aches.',
  },
  {
    id: 'no-guitar',
    question: "I don't have my guitar with me.",
    keywords: ['without', 'no', 'guitar', 'screen', 'virtual', 'demo', 'try'],
    answer:
      'You can still practise reading and timing: turn on "On-screen guitar" in the player (or "Use on-screen guitar" in Settings) and tap the frets. It uses the same scoring as the real thing.',
  },
];

const STOP = new Set([
  'i',
  'my',
  'the',
  'a',
  'an',
  'is',
  'it',
  'to',
  'do',
  'how',
  'what',
  'why',
  'can',
  'me',
  'of',
  'and',
  'in',
  'on',
  'so',
  'be',
  'are',
  'that',
  'this',
  'with',
  'for',
  'should',
  'does',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}

/** Keyword-overlap matcher. Returns the best entry, or a fallback listing topics. */
export function answerFromFaq(question: string): CoachAnswer & { faqId?: string } {
  const words = tokenize(question);
  let best: { entry: FaqEntry; score: number } | null = null;
  for (const entry of FAQ) {
    let score = 0;
    for (const w of words) {
      if (entry.keywords.includes(w)) score += 2;
      else if (
        entry.keywords.some(
          (k) => k.length > 3 && (w.startsWith(k) || k.startsWith(w)) && w.length > 3,
        )
      )
        score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  if (!best || best.score < 2) {
    return {
      source: 'fallback',
      answer:
        "I'm an offline coach with answers to common beginner questions, and I didn't catch that one. Try asking about sore fingers, buzzing notes, tuning, chord changes, strumming, reading tab, or the app not hearing you.",
    };
  }
  return {
    source: 'faq',
    faqId: best.entry.id,
    answer: best.entry.answer,
    links: best.entry.links,
  };
}
