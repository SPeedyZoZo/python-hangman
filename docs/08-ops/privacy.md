# Privacy notice and privacy-by-design record

**Owner:** Security and Privacy Officer

## Plain-language notice (shown in Settings → About and Privacy)

- Strumly uses your microphone **only while you're on a practice, tuner or chord-check screen**, to hear what you play.
- **Audio is analysed on your device and is never recorded, stored or sent anywhere.**
- Your progress (stars, XP, streak) and settings are stored **only in this browser**. Clearing site data deletes them, and so does Settings → Reset progress.
- No accounts, ads, analytics or third-party trackers.

## Design record

| Data                            | Where                                    | Retention                       | Leaves device? |
| ------------------------------- | ---------------------------------------- | ------------------------------- | -------------- |
| Raw audio samples               | In-memory analyser buffer (about 170 ms) | Overwritten continuously        | **Never**      |
| Analysis frames (pitch, chroma) | Memory during a session                  | Discarded at session end        | Never          |
| Session summary                 | Memory, then aggregated into progress    | Aggregates only                 | Never (MVP)    |
| Progress and settings           | IndexedDB (or localStorage)              | Until the user resets or clears | Never          |

Future Claude coach (ADR-0006): would send only a text session summary and the user's question,
with explicit opt-in and an updated notice. Never audio.

## Mic lifecycle

The mic is acquired on entering a listening screen. All tracks are stopped (`track.stop()`) on
leaving it, so the browser's recording indicator turns off.
