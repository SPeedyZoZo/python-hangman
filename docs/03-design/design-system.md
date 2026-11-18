# Strumly design system

**Owner:** UX/UI and Brand Designer · **Implemented in:** `src/styles/tokens.css`, `src/ui/*`

## 1. Brand

- **Name:** Strumly. **Personality:** warm, patient, encouraging, a practice buddy rather than a drill sergeant.
- **Logo:** a rounded guitar-pick shape holding three sound-wave arcs (`public/icon.svg`). Original artwork.
- **Voice:** short and second person, with fixes named concretely. ✓ "One fret too high, try fret 2." ✗ "Wrong!"

## 2. Colour tokens

Dark is the default (good for low-light practice). Light theme is via `[data-theme="light"]` or the system preference.

| Token          | Dark      | Light     | Use                                        |
| -------------- | --------- | --------- | ------------------------------------------ |
| `--bg`         | `#14110f` | `#fbf7f2` | App background                             |
| `--surface`    | `#201b18` | `#ffffff` | Cards and panels                           |
| `--surface-2`  | `#2b2420` | `#f1ebe4` | Raised and inset areas, lanes              |
| `--text`       | `#f6efe8` | `#1d1713` | Body text                                  |
| `--text-muted` | `#b9ada3` | `#5f554d` | Secondary text (≥4.5:1 on surface)         |
| `--primary`    | `#ff8a3d` | `#c2510b` | Brand, primary buttons, hit line           |
| `--on-primary` | `#1d1209` | `#ffffff` | Text on primary                            |
| `--accent`     | `#4cc9f0` | `#0a6c8f` | Links, focus ring, info                    |
| `--good`       | `#3ddc97` | `#137a4b` | ✓ hits (always with ✓ icon and text)       |
| `--bad`        | `#ff6b81` | `#b3213a` | ✗ misses (always with ✗ icon and text)     |
| `--warn`       | `#ffd166` | `#8a5a00` | ◷ early or late (with clock icon and text) |

**String lane colours** (from the Okabe-Ito colour-blind-safe palette, always paired with a lane label):
1 e `#E69F00` · 2 B `#56B4E9` · 3 G `#009E73` · 4 D `#F0E442` · 5 A `#CC79A7` · 6 E `#D55E00`.

## 3. Typography

System font stack (`system-ui, -apple-system, "Segoe UI", Roboto, …`), so there are no web-font downloads and it works offline.
Scale: 12 / 14 / 16 (body) / 20 / 24 / 32 / 40. Weights 400, 600 and 800. Fret numbers use tabular numerals.

## 4. Spacing, shape and motion

- Spacing on a 4 px grid: `--s1` 4 … `--s8` 48.
- Radius: 10 px for controls, 16 px for cards, full for pills and gems.
- Touch targets are at least 44×44 px.
- Motion: 150–250 ms ease-out. Under `prefers-reduced-motion` hit animations become static colour, icon and text, and the highway still moves because that conveys time.

## 5. Components

| Component        | Notes                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | Primary, secondary, ghost and icon variants. Visible focus ring (`--accent`, 3 px)                                                                                                              |
| `Card`           | Surface plus radius plus subtle border                                                                                                                                                          |
| `TabHighway`     | SVG with 6 lanes (string 1 on top, as in tab). Gems carry fret numbers. Chord bars span all lanes and carry the chord name and strum arrow. Hit line at 22% width. Results show as ✓/✗/◷ glyphs |
| `ChordDiagram`   | SVG with 6 strings × 4–5 frets, finger dots with numbers, ○ for open and × for muted, mirrored in left-handed mode                                                                              |
| `Fretboard`      | Interactive on-screen fretboard (frets 0–12), mirrored in left-handed mode                                                                                                                      |
| `TunerDial`      | Needle at ±50 cents, centre zone at ±5 cents, note plus string label                                                                                                                            |
| `LevelMeter`     | Mic input level bar with an `aria-valuenow` meter role                                                                                                                                          |
| `Stars`          | 0–3 stars with a text alternative ("2 of 3 stars")                                                                                                                                              |
| `BottomNav`      | Learn · Songs · Chords · Tuner · Settings                                                                                                                                                       |
| `HeardIndicator` | "Heard: G3 (string 3, open)" or "Heard: Em ✓" live text (aria-live polite, throttled)                                                                                                           |
