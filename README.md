# Strumly 🎸

**Learn guitar with a practice partner that listens.**

Strumly is a free, private, offline-capable web app (PWA) for beginner guitarists. It hears you
play through your device's microphone, **waits for you** on every note in Wait Mode, scores your
timing in **Play-along**, and coaches you through a 21-lesson curriculum and a library of
public-domain songs. Audio is analysed on your device and never leaves it.

**▶ Try it:** https://speedyzozo.github.io/python-hangman/. Best on a phone: open it, allow the
microphone, then _Add to Home Screen_ or _Install app_.

> This repository was formerly an empty placeholder named `python-hangman`. It now hosts Strumly.
> Renaming the GitHub repository to `strumly` is recommended.

## Features

|                            |                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎧 **Listens as you play** | Single notes (McLeod pitch detection) and strummed chords (harmonic-aware chroma verification), with the onset of each pluck and strum                        |
| ⏸️ **Wait Mode**           | The tab highway stops at each note or chord until you play it                                                                                                 |
| ⏱️ **Play-along**          | Timing judged as perfect, good, early, late or miss, with tempo 50–100%, an A–B bar loop, a metronome and a count-in                                          |
| 🔊 **Listen first**        | A synthesised reference performance with the highway animating along                                                                                          |
| 🧭 **Learning path**       | 5 units and 21 lessons, from the open high e to Em, Am, D, G, C, E, A and a mini F, plus strumming and chord changes                                          |
| 🎵 **Songs**               | 9 public-domain tunes (melody and/or chords), including Ode to Joy, Amazing Grace and Greensleeves                                                            |
| 🧑‍🏫 **Coach**               | Specific tips after each session ("In D, the F♯ isn't ringing: press your middle finger at fret 2…") and an offline "Ask the coach"                           |
| 🎼 **Tools**               | Chromatic and guitar tuner with reference tones, chord library with live "Check my chord"                                                                     |
| ⭐ **Progress**            | Stars, XP, daily streak and unlocks, stored locally                                                                                                           |
| ♿ **Inclusive**           | WCAG 2.2 AA checked with axe, left-handed mode, light and dark themes, feedback never shown by colour alone                                                   |
| 📱 **Mobile-first**        | One-screen player in portrait and landscape, thumb-reach controls, screen stays awake, auto-pause when the phone locks, home-screen install with proper icons |
| 📴 **Works offline**       | Installable PWA. An on-screen guitar lets you try it without an instrument                                                                                    |

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 (the microphone needs localhost or HTTPS)
```

| Command         | What it does                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| `npm run check` | typecheck, lint, unit and accuracy tests, production build                    |
| `npm test`      | unit tests plus detector accuracy benchmarks on synthetic guitar audio        |
| `npm run e2e`   | builds, generates WAV fixtures and runs Playwright with a **fake microphone** |
| `npm run build` | production build in `dist/` (set `BASE_PATH=/sub/path/` for sub-path hosting) |

## How the listening works

Strumly always knows what you're _supposed_ to play, so it **verifies** the expected note or chord
instead of guessing from scratch. That makes it more reliable and lets it say _what_ is wrong. See
[`docs/04-architecture/audio-engine-spec.md`](docs/04-architecture/audio-engine-spec.md).

| Benchmark (synthetic guitar audio)                                                 | Result              | Target |
| ---------------------------------------------------------------------------------- | ------------------- | ------ |
| Single notes, strings 1–6 × frets 0–12, 7 variants (noise, detune, soft or bright) | 100%                | ≥95%   |
| Neighbouring-semitone false accepts                                                | 0%                  | <5%    |
| Chords accepted (down, up, noisy)                                                  | 100% / 100% / 91.7% | ≥90%   |
| Wrong-chord false accepts (132 pairs)                                              | 2.3%                | <5%    |
| Analysis cost per frame                                                            | ≈0.5 ms             | <3 ms  |

⚠️ These figures come from synthetic audio. Please test with a real guitar in a real room. The
Settings screen has a detection sensitivity option and a timing calibration for that.

## Project documentation

This project was planned and built by one agent switching between 18 project roles (Product
Owner, Business Analyst, Delivery Lead, Architect, UX, Guitar Educator, DSP Engineer, QA,
Accessibility, Security, Legal, DevOps, Tech Writer and others). The full playbook is in
[`docs/README.md`](docs/README.md): charter, research, PRD, backlog, design system, ADRs,
curriculum, test strategy, traceability matrix, RACI, RAID log, sprint and QA reports, and the
[MVP acceptance review](docs/07-delivery/mvp-acceptance.md). The [user guide](docs/user-guide.md)
explains the app for learners.

## Tech

React 19 · TypeScript (strict) · Vite 7 · vite-plugin-pwa · zustand · pitchy · idb-keyval ·
Vitest · Playwright · axe-core. No backend.

## Licence

Code: [MIT](LICENSE). Songs are public-domain melodies and chord charts arranged in-house (see
[licensing](docs/05-content/licensing.md)). Strumly is an original app and is not affiliated with
any other music-learning product.
