/** In-place iterative radix-2 FFT with cached twiddles and a cached Hann window. */

interface FftPlan {
  size: number;
  cos: Float64Array;
  sin: Float64Array;
  rev: Uint32Array;
}

const plans = new Map<number, FftPlan>();
const hannCache = new Map<number, Float32Array>();

function plan(size: number): FftPlan {
  const cached = plans.get(size);
  if (cached) return cached;
  if ((size & (size - 1)) !== 0 || size < 2)
    throw new Error(`FFT size must be a power of 2: ${size}`);
  const cos = new Float64Array(size / 2);
  const sin = new Float64Array(size / 2);
  for (let i = 0; i < size / 2; i++) {
    cos[i] = Math.cos((-2 * Math.PI * i) / size);
    sin[i] = Math.sin((-2 * Math.PI * i) / size);
  }
  const bits = Math.log2(size);
  const rev = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    let r = 0;
    for (let b = 0; b < bits; b++) r |= ((i >>> b) & 1) << (bits - 1 - b);
    rev[i] = r;
  }
  const p = { size, cos, sin, rev };
  plans.set(size, p);
  return p;
}

export function hann(size: number): Float32Array {
  const cached = hannCache.get(size);
  if (cached) return cached;
  const w = new Float32Array(size);
  for (let i = 0; i < size; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  hannCache.set(size, w);
  return w;
}

export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  const { cos, sin, rev } = plan(n);
  for (let i = 0; i < n; i++) {
    const j = rev[i]!;
    if (j > i) {
      const tr = re[i]!;
      re[i] = re[j]!;
      re[j] = tr;
      const ti = im[i]!;
      im[i] = im[j]!;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >>> 1;
    const step = n / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const wr = cos[k * step]!;
        const wi = sin[k * step]!;
        const a = i + k;
        const b = a + half;
        const xr = re[b]! * wr - im[b]! * wi;
        const xi = re[b]! * wi + im[b]! * wr;
        re[b] = re[a]! - xr;
        im[b] = im[a]! - xi;
        re[a] = re[a]! + xr;
        im[a] = im[a]! + xi;
      }
    }
  }
}

/**
 * Magnitude spectrum (bins 0..size/2) of the last `size` samples of `input`, Hann-windowed.
 * Reuses scratch buffers between calls of the same size.
 */
const scratch = new Map<number, { re: Float64Array; im: Float64Array; mag: Float32Array }>();
export function magnitudeSpectrum(input: Float32Array, size: number): Float32Array {
  let s = scratch.get(size);
  if (!s) {
    s = {
      re: new Float64Array(size),
      im: new Float64Array(size),
      mag: new Float32Array(size / 2 + 1),
    };
    scratch.set(size, s);
  }
  const { re, im, mag } = s;
  const w = hann(size);
  const offset = input.length - size;
  for (let i = 0; i < size; i++) {
    const x = offset + i >= 0 ? input[offset + i]! : 0;
    re[i] = x * w[i]!;
    im[i] = 0;
  }
  fft(re, im);
  for (let k = 0; k <= size / 2; k++) mag[k] = Math.hypot(re[k]!, im[k]!);
  return mag;
}
