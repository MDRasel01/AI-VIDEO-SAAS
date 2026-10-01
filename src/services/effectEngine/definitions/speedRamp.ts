import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';

export const SpeedRampEffect: EffectDefinition = {
  id: 'eff_speed_ramp',
  key: 'speedRamp',
  name: 'Dynamic Speed Ramp',
  category: 'Cinematic',
  version: '2.0.0',
  iconName: 'Gauge',
  description: 'Automated 1.8x acceleration into smooth 0.6x slow-motion dramatic freeze and 1.2x recovery.',
  defaultIntensity: 85,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'fastSpeed',
      name: 'Acceleration Peak',
      type: 'number',
      default: 1.8,
      min: 1.2,
      max: 3.5,
      step: 0.1,
      description: 'Initial fast action speed multiplier',
    },
    {
      id: 'slowSpeed',
      name: 'Slow Motion Dip',
      type: 'number',
      default: 0.6,
      min: 0.2,
      max: 0.9,
      step: 0.05,
      description: 'Dramatic midpoint slow-motion multiplier',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const fast = typeof params.fastSpeed === 'number' ? params.fastSpeed : 1.8;
    const slow = typeof params.slowSpeed === 'number' ? params.slowSpeed : 0.6;
    const p = context.clipProgress;

    // Piecewise smooth ramp curve
    let rate = 1.0;
    if (p < 0.35) {
      rate = fast;
    } else if (p < 0.75) {
      rate = slow;
    } else {
      rate = 1.2;
    }

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: p < 0.35 ? { contrast: 108 } : {},
      overlays: [
        {
          id: 'overlay_speed_ramp_lines',
          type: 'speed_ramp_lines',
          mixBlendMode: 'screen',
          opacity: p < 0.35 && context.isPlaying ? 0.22 : 0,
          canvasDraw: (ctx, width, height) => {
            if (p < 0.35) {
              ctx.save();
              ctx.fillStyle = 'rgba(255,255,255,0.15)';
              for (let i = 0; i < width; i += 24) {
                ctx.fillRect(i, 0, 2, height);
              }
              ctx.restore();
            }
          },
        },
      ],
      playbackRateMultiplier: rate,
    };
  },
};
