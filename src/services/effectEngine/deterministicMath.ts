/**
 * DETERMINISTIC MATH & PRNG SUITE FOR VIDEO EFFECT ENGINE
 * Guarantees frame-accurate, reproducible output without Math.random() jitter
 */

/**
 * 32-bit FNV-1a Hash of string to uint32 seed
 */
export function hashStringToSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 Deterministic Seeded PRNG
 * Produces high-quality uniform pseudo-random floats in [0, 1)
 */
export function createDeterministicPRNG(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample deterministic noise at a discrete time/frame coordinate
 */
export function deterministicNoise1D(seed: number, coord: number): number {
  const s = ((seed ^ Math.imul(Math.floor(coord * 1000), 2654435761)) >>> 0);
  const prng = createDeterministicPRNG(s);
  return prng();
}

/**
 * Hermite Smoothstep: S-curve with zero first-derivative at endpoints
 * Guarantees zero velocity discontinuity at boundaries
 */
export function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Sinusoidal Bell Curve: Starts at 0, smoothly reaches 1 at t=0.5, returns smoothly to 0 at t=1.0
 */
export function sineBell(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return Math.sin(x * Math.PI);
}

/**
 * Quadratic Ease-In-Out with continuous velocity
 */
export function easeInOutQuad(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/**
 * Exponential Decay: Rapid impact spike with smooth natural tail
 */
export function exponentialDecay(progress: number, decayRate: number = 6): number {
  const x = Math.max(0, Math.min(1, progress));
  return Math.exp(-x * decayRate);
}

/**
 * Linear clamp
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculates required overscan multiplier to prevent black edge exposure during transforms.
 * Takes translation and rotation into account.
 */
export function calculateRequiredOverscan(
  translateX: number,
  translateY: number,
  rotateDegrees: number,
  canvasW: number = 1080,
  canvasH: number = 1920
): number {
  // Max pixel offset ratio
  const xOffsetRatio = Math.abs(translateX) / (canvasW / 2);
  const yOffsetRatio = Math.abs(translateY) / (canvasH / 2);
  const translationBuffer = Math.max(xOffsetRatio, yOffsetRatio);

  // Rotation expansion factor
  const rad = (Math.abs(rotateDegrees) * Math.PI) / 180;
  const rotationBuffer = Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad)) - 1.0;

  // Total required overscan (minimum 1.0)
  return 1.0 + Math.max(0, translationBuffer) + Math.max(0, rotationBuffer);
}
