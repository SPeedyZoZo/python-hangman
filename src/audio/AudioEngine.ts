/**
 * Browser audio engine: owns the AudioContext, the microphone and the analysis tap.
 *
 *   mic ──► inputGain ─┐
 *                      ├─► analyser (fftSize 8192)      ← FrameAnalyzer reads time-domain data
 *   inject (synthetic)─┘
 *   inject/reference ──► out ──► speakers
 *
 * The mic is reference-counted: it is only open while a listening screen is mounted.
 */

export type EngineMode = 'mic' | 'virtual';
export type MicFailure = 'denied' | 'unavailable' | 'insecure' | 'unsupported';

export class MicError extends Error {
  readonly reason: MicFailure;
  constructor(reason: MicFailure, message?: string) {
    super(message ?? reason);
    this.reason = reason;
    this.name = 'MicError';
  }
}

export const ANALYSIS_BUFFER = 8192;

export interface PlaybackHandle {
  stop(): void;
  done: Promise<void>;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private inputGain: GainNode | null = null;
  private injectGain: GainNode | null = null;
  private out: GainNode | null = null;
  private stream: MediaStream | null = null;
  private micNode: MediaStreamAudioSourceNode | null = null;
  private users = 0;
  private readonly buf = new Float32Array(ANALYSIS_BUFFER);
  private active = new Set<AudioBufferSourceNode>();
  mode: EngineMode | null = null;

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 48000;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  /** Create (or resume) the AudioContext. Call from a user gesture on iOS. */
  async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) throw new MicError('unsupported', 'Web Audio is not supported in this browser');
      const ctx = new Ctor({ latencyHint: 'interactive' });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = ANALYSIS_BUFFER;
      analyser.smoothingTimeConstant = 0;
      const inputGain = ctx.createGain();
      const injectGain = ctx.createGain();
      const out = ctx.createGain();
      inputGain.connect(analyser);
      injectGain.connect(analyser);
      out.connect(ctx.destination);
      Object.assign(this, { ctx, analyser, inputGain, injectGain, out });
    }
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  }

  /**
   * Start listening. With `virtual` the mic is not opened and only synthetic input
   * (on-screen fretboard) reaches the analyser.
   */
  async acquire(preferred: EngineMode): Promise<EngineMode> {
    await this.ensureContext();
    this.users++;
    if (preferred === 'virtual') {
      this.mode ??= 'virtual';
      return 'virtual';
    }
    if (this.stream) {
      this.mode = 'mic';
      return 'mic';
    }
    try {
      await this.openMic();
      this.mode = 'mic';
      return 'mic';
    } catch (e) {
      this.users--;
      throw e;
    }
  }

  release(): void {
    this.users = Math.max(0, this.users - 1);
    if (this.users === 0) {
      this.closeMic();
      this.mode = null;
      this.stopAll();
    }
  }

  private async openMic(): Promise<void> {
    if (!window.isSecureContext) throw new MicError('insecure', 'The microphone needs HTTPS');
    if (!navigator.mediaDevices?.getUserMedia) throw new MicError('unsupported');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') throw new MicError('denied');
      throw new MicError('unavailable', String(e));
    }
    this.micNode = this.ctx!.createMediaStreamSource(this.stream);
    this.micNode.connect(this.inputGain!);
  }

  private closeMic(): void {
    this.micNode?.disconnect();
    this.micNode = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  /** Newest ANALYSIS_BUFFER time-domain samples. */
  readSamples(): Float32Array {
    this.analyser?.getFloatTimeDomainData(this.buf);
    return this.buf;
  }

  private play(samples: Float32Array, dest: AudioNode[], when = 0): PlaybackHandle {
    const ctx = this.ctx;
    if (!ctx) return { stop() {}, done: Promise.resolve() };
    const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    dest.forEach((d) => src.connect(d));
    this.active.add(src);
    const done = new Promise<void>((resolve) => {
      src.onended = () => {
        this.active.delete(src);
        src.disconnect();
        resolve();
      };
    });
    src.start(when);
    return {
      stop: () => {
        try {
          src.stop();
        } catch {
          /* already stopped */
        }
      },
      done,
    };
  }

  /** Feed synthetic audio into the analyser (virtual guitar) and optionally the speakers. */
  inject(samples: Float32Array, monitor = true): PlaybackHandle {
    const dest: AudioNode[] = [this.injectGain!];
    if (monitor) dest.push(this.out!);
    return this.play(samples, dest);
  }

  /** Play audio to the speakers only (reference "Listen", metronome). */
  playOut(samples: Float32Array, when = 0): PlaybackHandle {
    return this.play(samples, [this.out!], when);
  }

  stopAll(): void {
    this.active.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* noop */
      }
    });
    this.active.clear();
  }

  /** Map AudioContext time (s) to performance.now() (ms). */
  ctxToPerf(ctxTime: number): number {
    const ctx = this.ctx;
    if (!ctx) return performance.now();
    const ts = ctx.getOutputTimestamp?.();
    if (
      ts?.contextTime !== undefined &&
      ts.performanceTime !== undefined &&
      ts.performanceTime > 0
    ) {
      return ts.performanceTime + (ctxTime - ts.contextTime) * 1000;
    }
    return performance.now() + (ctxTime - ctx.currentTime) * 1000;
  }

  perfToCtx(perfMs: number): number {
    const ctx = this.ctx;
    if (!ctx) return 0;
    return ctx.currentTime + (perfMs - this.ctxToPerf(ctx.currentTime)) / 1000;
  }
}

export const audioEngine = new AudioEngine();
