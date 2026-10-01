import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { exponentialDecay, calculateRequiredOverscan } from '../deterministicMath';

export const ShakeImpactEffect: EffectDefinition = {
  id: 'eff_shake_impact',
  key: 'shake',
  name: 'Impact Shake',
  category: 'Motion',
  version: '2.0.0',
  iconName: 'Vibrate',
  description: 'Punchy cut-entry impact camera jolt decaying exponentially into subtle organic handheld breathing motion.',
  defaultIntensity: 80,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'impactForce',
      name: 'Impact Force (px)',
      type: 'number',
      default: 14,
      min: 4,
      max: 30,
      step: 1,
      description: 'Peak pixel displacement on cut entry',
    },
    {
      id: 'handheldMotion',
      name: 'Handheld Jitter',
      type: 'boolean',
      default: true,
      description: 'Maintain organic handheld motion throughout playback',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 80;
    const peakForce = (typeof params.impactForce === 'number' ? params.impactForce : 14) * (intensity / 80);
    const hasHandheld = params.handheldMotion !== false;

    // Exponential impact decay from clip start
    const impactEnvelope = exponentialDecay(context.clipProgress, 6.5) * peakForce;

    // Organic handheld continuous motion
    const handheldAmp = (hasHandheld && context.isPlaying) ? 2.2 * (intensity / 80) : 0;

    // Deterministic harmonic shake oscillators
    const t = context.currentTime;
    const impactX = Math.sin(t * 52) * impactEnvelope;
    const impactY = Math.cos(t * 46) * (impactEnvelope * 0.75);

    const handheldX = Math.sin(t * 14) * handheldAmp + Math.sin(t * 7.3) * (handheldAmp * 0.5);
    const handheldY = Math.cos(t * 12) * (handheldAmp * 0.7) + Math.cos(t * 5.1) * (handheldAmp * 0.4);

    const totalX = impactX + handheldX;
    const totalY = impactY + handheldY;

    const overscan = calculateRequiredOverscan(totalX, totalY, 0, context.resolution.width, context.resolution.height);

    return {
      transform: {
        translateX: totalX,
        translateY: totalY,
        scale: Math.max(1.06, overscan), // Ensure no edge exposure during violent shakes
        rotate: 0,
        originX: '50%',
        originY: '50%',
        overscanScale: overscan,
      },
      filters: {},
      overlays: [],
    };
  },
};
