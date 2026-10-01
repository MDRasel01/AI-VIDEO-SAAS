import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { sineBell } from '../deterministicMath';

export const AnamorphicFlareEffect: EffectDefinition = {
  id: 'eff_anamorphic_flare',
  key: 'lightLeak',
  name: 'Anamorphic Lens Flare',
  category: 'Light',
  version: '2.0.0',
  iconName: 'Sun',
  description: 'High-end cinema horizontal cyan-blue-amber prism streak with organic golden corner lens leaks that sweep across the frame.',
  defaultIntensity: 65,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'flareColor',
      name: 'Flare Color Spectrum',
      type: 'select',
      default: 'cinema_prism',
      options: [
        { label: 'Cyan & Gold Prism', value: 'cinema_prism' },
        { label: 'Warm Golden Hour', value: 'golden' },
        { label: 'Sci-Fi Blue Streak', value: 'blue_streak' },
      ],
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 65;
    const progressSweep = (sineBell(context.clipProgress) * 40 - 20).toFixed(1);

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: {
        contrast: 106,
        saturate: 112,
      },
      overlays: [
        {
          id: 'overlay_anamorphic_prism',
          type: 'light_leak',
          mixBlendMode: 'screen',
          opacity: (intensity / 100) * 0.9,
          canvasDraw: (ctx, width, height) => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            // Horizontal anamorphic flare bar
            const midY = height / 2;
            const streakGradient = ctx.createLinearGradient(0, midY, width, midY);
            streakGradient.addColorStop(0, 'rgba(0,0,0,0)');
            streakGradient.addColorStop(0.3, 'rgba(56,189,248,0.25)');
            streakGradient.addColorStop(0.5, 'rgba(129,140,248,0.35)');
            streakGradient.addColorStop(0.7, 'rgba(251,191,36,0.25)');
            streakGradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = streakGradient;
            ctx.fillRect(0, midY - 30, width, 60);

            // Top-right corner golden sun leak
            const leakGradient = ctx.createRadialGradient(width * 0.9, 0, 10, width * 0.9, 0, width * 0.5);
            leakGradient.addColorStop(0, 'rgba(251,191,36,0.35)');
            leakGradient.addColorStop(0.5, 'rgba(192,132,252,0.15)');
            leakGradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = leakGradient;
            ctx.fillRect(width * 0.4, 0, width * 0.6, height * 0.5);
            ctx.restore();
          },
        },
      ],
    };
  },
};
