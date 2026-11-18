# Product requirements document (PRD): Strumly MVP

**Owner:** Business Analyst (with Product Owner) · **Status:** Baseline v1.0 (Sprint 0)

Requirement IDs are referenced by stories in the [backlog](backlog.md) and by tests in the
[traceability matrix](../06-quality/traceability-matrix.md). Priority uses MoSCoW.

## 1. Functional requirements

### FR-ONB: Onboarding

| ID       | Requirement                                                                                                                                  | Priority |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-ONB-1 | First launch shows a short welcome and collects experience level, guitar type and handedness                                                 | M        |
| FR-ONB-2 | Request microphone permission with a plain-language explanation of why and the privacy promise. Show a live input meter ("pluck any string") | M        |
| FR-ONB-3 | Offer a tuning check (link to the tuner) that can be skipped                                                                                 | S        |
| FR-ONB-4 | Offer "Practice without a guitar" (on-screen fretboard) if the mic is denied or unavailable                                                  | M        |

### FR-TUN: Tuner

| ID       | Requirement                                                                               | Priority |
| -------- | ----------------------------------------------------------------------------------------- | -------- |
| FR-TUN-1 | Show the detected note, nearest standard-tuning string and cents offset (±50 cents range) | M        |
| FR-TUN-2 | Show "in tune" when within ±5 cents, held for 0.5 s                                       | M        |
| FR-TUN-3 | Play a reference tone for each string on request                                          | S        |

### FR-LRN: Learning path and lessons

| ID       | Requirement                                                                                                                       | Priority |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-LRN-1 | Home shows units and lessons in order, with stars earned and a "Continue" card for the next lesson                                | M        |
| FR-LRN-2 | Each lesson has a title, objectives, 1–3 tip cards and one exercise                                                               | M        |
| FR-LRN-3 | The next lesson unlocks when the previous one earns at least 1 star. The first lesson is always unlocked                          | M        |
| FR-LRN-4 | The curriculum covers orientation, single-note melodies, Em/Am/D/G/C/E/A, down and down-up strumming, chord changes, and a mini F | M        |

### FR-PLY: Practice player

| ID        | Requirement                                                                                                                                 | Priority |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-PLY-1  | A tab highway shows six string lanes (string 1 on top) with notes as fret-numbered gems and chords as labelled bars scrolling to a hit line | M        |
| FR-PLY-2  | **Wait Mode:** the highway stops at each target until it is played correctly                                                                | M        |
| FR-PLY-3  | **Play-along mode:** the highway moves at tempo and hits are judged on timing (perfect, good, early, late, miss)                            | M        |
| FR-PLY-4  | Tempo control 50–100% in 10% steps                                                                                                          | M        |
| FR-PLY-5  | A–B loop over a bar range                                                                                                                   | M        |
| FR-PLY-6  | "Listen" plays a synthesised reference of the exercise. Detection pauses while it plays                                                     | M        |
| FR-PLY-7  | Metronome click toggle with a count-in bar in play-along                                                                                    | S        |
| FR-PLY-8  | Live "heard" indicator showing the detected note or chord and input level                                                                   | M        |
| FR-PLY-9  | Upcoming-chord diagram shown before each chord change                                                                                       | M        |
| FR-PLY-10 | Pause, resume and restart                                                                                                                   | M        |

### FR-DET: Detection

| ID       | Requirement                                                                  | Priority |
| -------- | ---------------------------------------------------------------------------- | -------- |
| FR-DET-1 | Single-note detection across strings 1–6, frets 0–12                         | M        |
| FR-DET-2 | Chord verification for every chord in the chord library                      | M        |
| FR-DET-3 | A repeated note or chord needs a new pluck or strum (onset) to count         | M        |
| FR-DET-4 | Chord feedback names missing chord tones (and the string, where unambiguous) | S        |
| FR-DET-5 | Sensitivity setting (easy, normal, strict) and latency calibration offset    | S        |

### FR-RES: Results and coach

| ID       | Requirement                                                                                                | Priority |
| -------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| FR-RES-1 | Results screen: stars (1–3), accuracy %, timing breakdown (play-along) or wrong attempts (wait), XP earned | M        |
| FR-RES-2 | 1–3 rule-based coach tips based on what happened in the session                                            | M        |
| FR-RES-3 | Actions: retry, retry slower or faster, next lesson                                                        | M        |
| FR-RES-4 | "Ask the coach": offline FAQ answers to common beginner questions                                          | S        |

### FR-SNG: Songs

| ID       | Requirement                                                                               | Priority |
| -------- | ----------------------------------------------------------------------------------------- | -------- |
| FR-SNG-1 | Song library of at least 6 public-domain or traditional songs, tagged by difficulty (1–3) | M        |
| FR-SNG-2 | Songs offer a melody arrangement and/or a chord arrangement                               | M        |
| FR-SNG-3 | Songs record best stars and accuracy                                                      | S        |

### FR-CHD: Chord library

| ID       | Requirement                                                                                    | Priority |
| -------- | ---------------------------------------------------------------------------------------------- | -------- |
| FR-CHD-1 | Grid of chord diagrams (fingers, open and muted strings)                                       | M        |
| FR-CHD-2 | Chord detail screen: "Listen" and "Check my chord" (live verification with missing-note hints) | M        |

### FR-PRG: Progress

| ID       | Requirement                                                                                | Priority |
| -------- | ------------------------------------------------------------------------------------------ | -------- |
| FR-PRG-1 | Persist per-lesson best stars and accuracy, total XP, practice minutes and streak, locally | M        |
| FR-PRG-2 | Daily streak counts consecutive days with at least one completed exercise                  | M        |
| FR-PRG-3 | Reset progress from Settings, with confirmation                                            | S        |

### FR-SET: Settings

| ID       | Requirement                                                                  | Priority |
| -------- | ---------------------------------------------------------------------------- | -------- |
| FR-SET-1 | Handedness (mirrors diagrams and the fretboard), theme (system, dark, light) | M        |
| FR-SET-2 | Note labels on gems: fret numbers or note names                              | C        |
| FR-SET-3 | On-screen practice fretboard toggle                                          | M        |

### FR-MOB: Mobile-first (added in Sprint 6 at the sponsor's request: "optimise for mobile over computers")

| ID       | Requirement                                                                                                                                                                                                 | Priority |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-MOB-1 | Keep the screen awake while practising, listening or tuning (Screen Wake Lock), and release it afterwards                                                                                                   | M        |
| FR-MOB-2 | Pause practice automatically when the page is hidden (phone locked, app switched) and say why                                                                                                               | M        |
| FR-MOB-3 | Player fits one phone screen in portrait and landscape: highway, feedback, chords and a thumb-reach control dock, with no page scroll in mic mode. Highway lanes grow with free space. Touch targets ≥44 px | M        |
| FR-MOB-4 | Proper home-screen install: PNG icons (192, 512, maskable) and an iOS apple-touch-icon, iOS standalone meta tags, theme-coloured status bar                                                                 | M        |
| FR-MOB-5 | Touch behaviour: no double-tap zoom, no text selection or long-press menus on playing surfaces, no pull-to-refresh, safe-area insets respected                                                              | S        |
| FR-MOB-6 | iOS: request the `play-and-record` audio session so mic and playback work together                                                                                                                          | S        |

## 2. Non-functional requirements

| ID          | Requirement                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-PERF-1  | Analysis loop runs at ≥30 fps on a mid-range phone. Feedback latency is ≤150 ms after onset (excluding device input latency)                                        |
| NFR-PERF-2  | Initial JS bundle ≤250 KB gzip. Interactive within 3 s on a 4G mid-range phone                                                                                      |
| NFR-ACC-1   | Detection benchmark: ≥95% single-note correctness (strings 1–6, frets 0–12, with noise and detune). ≥90% chord verification. <5% false accepts on confusable chords |
| NFR-A11Y-1  | WCAG 2.2 AA: contrast, keyboard operability, focus visibility, labels. No axe "serious" or "critical" violations                                                    |
| NFR-A11Y-2  | Feedback is conveyed by colour **and** icon or shape **and** text. Respects `prefers-reduced-motion`                                                                |
| NFR-PRIV-1  | No audio or analysis data leaves the device. No third-party trackers                                                                                                |
| NFR-SEC-1   | Strict Content Security Policy. No `eval`. Dependencies are audited and production has no high or critical advisories                                               |
| NFR-OFF-1   | Installable PWA that works fully offline after the first load                                                                                                       |
| NFR-RESP-1  | Phone-first layout from 320 px wide up to desktop                                                                                                                   |
| NFR-COMP-1  | Latest Chrome, Edge, Firefox and Safari (desktop and iOS 17+)                                                                                                       |
| NFR-LEGAL-1 | Content is public domain, traditional or original, with provenance recorded. Dependencies use permissive licences                                                   |
