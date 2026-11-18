# Curriculum: "Strumly Foundations"

**Owner:** Guitar Educator · **Authored by:** Content Author in `src/content/lessons.ts`

Design rules: one objective per lesson; 2–5 minutes; new material defaults to Wait Mode at 70%
tempo; chord lessons give at least 2 beats per change at first; each unit ends with a "put it
together" lesson. All exercises are **original** unless marked PD (public-domain melody, no lyrics).

| Unit                     | #   | Lesson               | Objective                                                      | Kind    |
| ------------------------ | --- | -------------------- | -------------------------------------------------------------- | ------- |
| **1 · Meet your guitar** | 1   | Open high e          | Pick string 1 cleanly, 8 times                                 | notes   |
|                          | 2   | B and e              | Alternate strings 2 and 1                                      | notes   |
|                          | 3   | All six open strings | Find strings 6→1 and back                                      | notes   |
|                          | 4   | Your first frets     | Fret 1 and 3 on strings 1–2 (E F G, B C D)                     | notes   |
| **2 · First melodies**   | 5   | Three-note tune      | B–C–D on string 2 ("Hot Cross Buns", PD)                       | notes   |
|                          | 6   | Little lamb          | E–D–C melody across strings 1–2 ("Mary Had a Little Lamb", PD) | notes   |
|                          | 7   | Crossing strings     | G–A on string 3 to B–C–D on string 2                           | notes   |
|                          | 8   | Ode to Joy, phrase 1 | Stepwise melody across strings 1–2 (Beethoven, PD)             | notes   |
| **3 · First chords**     | 9   | E minor              | Em: two fingers, all six strings                               | chords  |
|                          | 10  | A minor              | Am: skip the low E                                             | chords  |
|                          | 11  | Em ↔ Am              | Change every 4 beats                                           | changes |
|                          | 12  | D major              | D: top four strings only                                       | chords  |
|                          | 13  | G major              | G: the big stretch                                             | chords  |
|                          | 14  | C major              | C: avoid the low E                                             | chords  |
| **4 · Strum and change** | 15  | Steady down-strums   | G and D, quarter notes                                         | strum   |
|                          | 16  | G – C – D            | Three-chord changes every 2 bars                               | changes |
|                          | 17  | Down and up          | ↓ ↓↑ ↑↓↑ pattern on Em                                         | strum   |
|                          | 18  | The four-chord loop  | G – D – Em – C                                                 | changes |
| **5 · Bigger sounds**    | 19  | E and A majors       | E, A shapes                                                    | chords  |
|                          | 20  | Three-chord rock     | A – D – E changes                                              | changes |
|                          | 21  | Mini F               | xx3211 small F shape, C ↔ F                                    | changes |

## Song library (public domain, melody and chords only, no lyrics)

| Song                                         | Difficulty | Arrangements   |
| -------------------------------------------- | ---------- | -------------- |
| Hot Cross Buns (traditional)                 | 1          | melody         |
| Mary Had a Little Lamb (traditional)         | 1          | melody, chords |
| Ode to Joy (Beethoven)                       | 1          | melody, chords |
| Twinkle, Twinkle (traditional French melody) | 1          | melody, chords |
| Frère Jacques (traditional)                  | 2          | melody         |
| When the Saints Go Marching In (traditional) | 2          | melody, chords |
| Oh! Susanna (Stephen Foster)                 | 2          | chords         |
| Amazing Grace ("New Britain")                | 3          | melody, chords |
| Greensleeves (traditional)                   | 3          | chords         |

## Chord library (MVP)

Em, Am, D, G, C, E, A, Dm, Fmini (xx3211), G7, plus E7 and A7 for the "rock" unit if time allows.

## Coaching rules (Educator → AI/Coaching Engineer handoff)

| Rule               | Trigger                                                           | Tip                                                                       |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Fret slip          | Most wrong attempts sit 1 semitone from target on the same string | "One fret too high or low: press just behind fret N."                     |
| Wrong string       | Wrong attempts match the fret on an adjacent string               | "Right fret, wrong string: you hit string X instead of Y."                |
| Rushing / dragging | Mean Δt below −60 ms or above +60 ms in play-along                | "You're ahead of / behind the beat: count with the metronome."            |
| Late changes       | Chord misses cluster on the first beat of a new chord             | "Start moving to the next chord on the last beat."                        |
| Missing tone       | A chord tone flagged weak in at least 40% of chord attempts       | "In D, the F♯ on the high e string isn't ringing: arch your ring finger." |
| Ready for more     | Accuracy ≥95% at tempo <100%                                      | "Nailed it! Try X% tempo."                                                |
| Struggling         | Accuracy <60%                                                     | "Switch to Wait Mode or drop the tempo to Y%."                            |
| Tuning drift       | Mean                                                              | cents                                                                     | >20 on hits | "Your guitar may be out of tune: visit the tuner." |
| Encourage          | Default                                                           | A rotating, specific encouragement line                                   |
