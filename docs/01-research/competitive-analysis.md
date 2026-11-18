# Competitive analysis

**Owner:** UX Researcher · **Inputs:** public app-store listings, vendor pages and third-party reviews (Nov 2026)

## 1. Reference product: Artie (piano, ArtMaster)

Artie is an AI piano-learning app for iPhone and iPad. It is free to download with a subscription for the full library.

| Capability       | What it does                                                                    | Implication for Strumly                                                                                            |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Listening input  | Hears the learner through the mic (or MIDI) and gives real-time feedback        | The core loop. We need reliable mic-based detection for guitar.                                                    |
| **Wait Mode**    | The music holds until the correct note is played                                | Reviewers' favourite feature, so it's a must-have for MVP.                                                         |
| Practice tools   | Loop tricky sections, slow down, tempo control, one-hand practice               | Tempo and A–B loop are must-haves. The guitar equivalent of "one hand" is a chord-only or melody-only arrangement. |
| Song library     | 150+ songs, three difficulty levels, falling-note lessons                       | We ship a smaller public-domain library at three difficulty levels and a scrolling "tab highway".                  |
| Session feedback | End-of-session feedback, spoken in places                                       | Results screen with coach tips.                                                                                    |
| "Ask Artie"      | Ask the tutor for tips when stuck                                               | Offline FAQ coach in MVP, a Claude-powered coach later.                                                            |
| Caveat           | Coverage notes that some "AI teacher" claims go beyond what has clearly shipped | We make only honest, testable claims.                                                                              |

## 2. Guitar competitors

| App              | Model                                                  | Strengths                             | Weaknesses we can exploit                                                 |
| ---------------- | ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| Yousician        | Game-like lanes, real-time detection, multi-instrument | Polished, big library                 | Detection complaints. Gamification can feel punishing. Heavily paywalled. |
| Simply Guitar    | Mic-based interactive lessons                          | Very beginner-friendly                | Reviewers report detection is sometimes inaccurate. Limited free tier.    |
| Fender Play      | Video lessons                                          | High-quality instruction and branding | **No live feedback** on your playing                                      |
| JustinGuitar app | Structured course, chord trainer                       | Respected pedagogy                    | Little real-time verification                                             |

**Cross-app pain point:** a user-review analysis (sponsored by a competitor, so treat with care)
reports that the most common 1–3★ complaint is that note or pitch detection fails to hear correct
playing (around 28% of negative reviews).

## 3. Strumly's positioning

1. **Trustworthy listening.** We verify the _expected_ note or chord instead of guessing from scratch, add per-chord "what's missing" hints, and offer a sensitivity setting.
2. **Patient by default.** Wait Mode is the default for new lessons, and play-along unlocks once you're ready.
3. **Free and private.** No account, offline-capable, and audio stays on the device.
4. **Works without a guitar** for demos and tryouts (on-screen fretboard), which lowers the barrier to trying it.

## 4. Usability heuristics to beat (from review themes)

- Never punish a correct note that the app failed to hear. Prefer lenient thresholds, and show what the app _heard_ so users can tell an app error from their own.
- Show the next chord _before_ it's needed, with time to move fingers.
- Keep sessions short (2–5 minutes) with a clear goal and a quick win.
