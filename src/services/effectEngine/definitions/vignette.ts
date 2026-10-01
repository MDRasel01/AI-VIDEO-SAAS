import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';

export const VignetteEffect: EffectDefinition = {
  id: 'eff_vignette',
  key: 'vignette',
  name: 'Cinema Vignette',
  category: 'Color',
  version: '2.0.0',
  iconName: 'CircleDot',
  description: '4-Stop cinema elliptical shadow drawing viewer focus to center-frame with high peripheral contrast.',
  defaultIntensity: 55,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'darkness',
      name: 'Shadow Depth (%)',
      type: 'number',
      default: 88,
      min: 40,
      max: 100,
      step: 2,
      description: 'Maximum edge darkening opacity',
    },
    {
      id: 'radius',
      name: 'Center Clearance (%)',
      type: 'number',
      default: 35,
      min: 15,
      max: 60,
      step: 1,
      description: 'Clear center radius before falloff begins',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 55;
    const maxAlpha = ((typeof params.darkness === 'number' ? params.darkness : 88) / 100) * (intensity / 55);
    const innerRadiusPercent = typeof params.radius === 'number' ? params.radius : 35;

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: {},
      overlays: [
        {
          id: 'overlay_cinema_vignette',
          type: 'vignette',
          mixBlendMode: 'normal',
          opacity: 1.0,
          canvasDraw: (ctx, width, height) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(
              width / 2,
              height / 2,
              (width / 2) * (innerRadiusPercent / 100),
              width / 2,
              height / 2,
              Math.max(width, height) * 0.75
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.65, `rgba(0,0,0,${(maxAlpha * 0.55).toFixed(2)})`);
            gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.98, maxAlpha).toFixed(2)})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          },
        },
      ],
    };
  },
};
