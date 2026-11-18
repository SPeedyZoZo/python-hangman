import { computeChroma } from './chroma.ts';
import { diffRms, OnsetDetector, rms } from './onset.ts';
import { PitchTracker, type PitchReading } from './pitch.ts';
import { SENSITIVITY, type Sensitivity } from './sensitivity.ts';

export interface AudioFrame {
  /** Time of the newest sample, in ms (caller's clock). */
  t: number;
  rms: number;
  onset: boolean;
  /** Best estimate of when the onset happened (ms), if `onset`. */
  onsetT: number | null;
  pitch: PitchReading | null;
  chroma: Float32Array | null;
}

export interface AnalyzeOptions {
  /** Compute chroma (costs one 8192-point FFT). Only needed when a chord is expected. */
  chroma?: boolean;
}

/** Composes onset, pitch and chroma analysis into one frame. Pure: no browser APIs. */
export class FrameAnalyzer {
  readonly sampleRate: number;
  sensitivity: Sensitivity;
  private readonly pitch = new PitchTracker();
  private readonly onsets = new OnsetDetector();

  constructor(sampleRate: number, sensitivity: Sensitivity = 'normal') {
    this.sampleRate = sampleRate;
    this.sensitivity = sensitivity;
  }

  reset(): void {
    this.pitch.reset();
    this.onsets.reset();
  }

  analyze(samples: Float32Array, tMs: number, opts: AnalyzeOptions = {}): AudioFrame {
    const p = SENSITIVITY[this.sensitivity];
    const level = rms(samples);
    const feature = diffRms(samples);
    const onset = this.onsets.process(feature, level, tMs, p.noiseFloor);
    // The onset window is the newest 1024 samples; place the onset at its centre.
    const onsetT = onset ? tMs - (512 / this.sampleRate) * 1000 : null;
    const pitch =
      level >= p.noiseFloor * 0.5 ? this.pitch.detect(samples, this.sampleRate, p.clarity) : null;
    if (!pitch && level < p.noiseFloor * 0.5) this.pitch.reset();
    const chroma =
      opts.chroma && level >= p.noiseFloor * 0.5 ? computeChroma(samples, this.sampleRate) : null;
    return { t: tMs, rms: level, onset, onsetT, pitch, chroma };
  }
}

/**
 * Test/offline helper: slide a real-time-like window over a signal and analyse each frame.
 * `fps` mimics requestAnimationFrame; frame time = time of the newest sample.
 */
export function analyzeSignal(
  signal: Float32Array,
  sampleRate: number,
  opts: { fps?: number; sensitivity?: Sensitivity; chroma?: boolean; bufferSize?: number } = {},
): AudioFrame[] {
  const fps = opts.fps ?? 60;
  const bufferSize = opts.bufferSize ?? 8192;
  const hop = Math.round(sampleRate / fps);
  const analyzer = new FrameAnalyzer(sampleRate, opts.sensitivity ?? 'normal');
  const frames: AudioFrame[] = [];
  const buf = new Float32Array(bufferSize);
  for (let end = hop; end <= signal.length; end += hop) {
    const start = end - bufferSize;
    if (start >= 0) buf.set(signal.subarray(start, end));
    else {
      buf.fill(0, 0, -start);
      buf.set(signal.subarray(0, end), -start);
    }
    frames.push(analyzer.analyze(buf, (end / sampleRate) * 1000, { chroma: opts.chroma }));
  }
  return frames;
}
