# Project charter: Strumly

**Owner:** Product Owner · **Status:** Approved for MVP · **Last updated:** Sprint 0

## 1. Problem

Adult beginners quit guitar in the first few months. The usual reasons are that they can't tell
whether they're playing correctly, practice feels aimless, and sore fingers plus slow progress
sap motivation. Video-only courses give no feedback. Existing listening apps get many complaints
that the app "didn't hear" correct playing.

## 2. Vision

> _A patient practice partner in your pocket: it listens, waits for you, and tells you exactly what to fix._

Strumly brings the "listen-and-wait" learning loop popularised by AI piano tutors such as Artie to
the guitar, with its own product, brand, curriculum and content. The listening engine is built
around what the app **expects** you to play, which makes feedback more reliable than open-ended
recognition.

## 3. Goals (MVP)

| ID  | Goal                                                                                       | Measure of success                                                                                            |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| G1  | A beginner can go from unboxing to playing a first melody and a first chord in one session | Units 1 and 3 reachable within 30 minutes, all lessons passable                                               |
| G2  | Feedback is trustworthy                                                                    | Detection accuracy ≥95% on single notes and ≥90% on chords in the synthetic benchmark, with <5% false accepts |
| G3  | Practice is guided and motivating                                                          | Learning path, stars, XP, streaks and coach tips after every session                                          |
| G4  | Zero-friction access                                                                       | Runs in a browser, installs as a PWA, works offline, needs no account                                         |
| G5  | Private by design                                                                          | Audio never leaves the device                                                                                 |

## 4. Scope

**In scope (MVP):** mic input; tuner; single-note and chord verification; Wait Mode; play-along
with tempo (50–100%) and A–B loop; reference "listen" playback; metronome; curriculum of about 20
lessons; at least 6 public-domain songs; results with a rule-based coach and an offline "Ask the
coach" FAQ; local progress, XP and streaks; onboarding; left-handed mode; dark and light themes;
on-screen practice fretboard (works without a guitar); offline PWA.

**Out of scope (MVP), on the roadmap:** accounts and cloud sync; payments; a Claude-powered
conversational coach (the interface is ready, see ADR-0006); MIDI and USB guitar input; video
lessons; copyrighted songs (they need licensing); per-string polyphonic transcription; native
store apps; social features.

## 5. Constraints and assumptions

- Built and tested in a cloud container. Real-guitar accuracy is validated by the user on their own device.
- Browser audio processing differs between browsers (Safari may ignore requests to disable processing).
- The content team is the agent itself, so all melodies are public domain and transcribed in-house.

## 6. Stakeholders

The project sponsor (repository owner), learners (see personas), and the roles in
[roles-raci.md](07-delivery/roles-raci.md).

## 7. Milestones

Sprint 0 discovery and foundations → S1 audio core → S2 practice engine → S3 chords → S4
curriculum, progress and coach → S5 hardening and **MVP release**. Details are in the
[delivery plan](07-delivery/delivery-plan.md).
