# Wireframes and screen flows

**Owner:** UX/UI Designer · Phone-first (360×780 reference). Desktop centres the content at a max width of 960 px.

## Flow

```
First launch → Onboarding (Welcome → Level → Guitar → Hand → Mic check → Tune?) → Home
Home ─┬─ Lesson intro → Player → Results → (Next | Retry | Home)
      ├─ Songs → Song detail (arrangement) → Player → Results
      ├─ Chords → Chord detail (Listen | Check my chord)
      ├─ Tuner
      ├─ Settings
      └─ Ask the coach (sheet)
```

## Home (Learn)

```
┌──────────────────────────────┐
│ Strumly        🔥 3   ⭐ 240 XP│
│ ┌──────────────────────────┐ │
│ │ CONTINUE                 │ │
│ │ Lesson 6 · First tune    │ │
│ │ [ ▶ Start ]              │ │
│ └──────────────────────────┘ │
│ Unit 1 · Meet your guitar ✓  │
│  ● L1 ★★★  ● L2 ★★☆  ...      │
│ Unit 2 · First melodies      │
│  ● L5 ★☆☆  ◐ L6   🔒 L7       │
│                [? Ask coach] │
├──────────────────────────────┤
│ Learn  Songs  Chords Tuner ⚙ │
└──────────────────────────────┘
```

## Player

```
┌──────────────────────────────┐
│ ← Ode to Joy        ⏸  ↺      │
│ Heard: E4 · string 1 open  ▮▮▯│
│ ┌──────────────────────────┐ │
│ │e ─|──(0)───(1)──(3)──────│ │
│ │B ─|──────────────────(3)─│ │
│ │G ─|──────────────────────│ │
│ │D ─|──  hit line          │ │
│ │A ─|──                    │ │
│ │E ─|──                    │ │
│ └──────────────────────────┘ │
│ Next chord: [diagram]        │
│ [Wait|Play]  Tempo 70% −  +  │
│ [🔁 Loop bars 2–3] [♪ Listen] │
│ [🥁 Metronome]                │
│ (on-screen fretboard, opt.)  │
└──────────────────────────────┘
```

## Results

```
┌──────────────────────────────┐
│         ★ ★ ☆                │
│   Accuracy 86% · +40 XP      │
│ Perfect 9 Good 3 Late 2 Miss 1│
│ Coach:                       │
│ • Late into Am, so start     │
│   moving on beat 4.          │
│ • Try 80% tempo next.        │
│ [Retry] [Retry at 80%] [Next]│
└──────────────────────────────┘
```

## Tuner

A big note letter in the centre with a needle dial from -50 to +50 cents, plus six string buttons
(E A D G B e) that play reference tones. The "In tune ✓" state is shown with text and an icon.

## Chord detail

The diagram with its name and notes (for example "D: D A D F♯"), a **Listen** button, and a
**Check my chord** button that leads to the live result ("✓ Sounds like D!" or "Almost: F♯ is quiet").
