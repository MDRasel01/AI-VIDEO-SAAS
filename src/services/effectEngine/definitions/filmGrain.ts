import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { clamp } from '../deterministicMath';

export const FilmGrainEffect: EffectDefinition = {
  id: 'eff_film_grain',
  key: 'filmGrain',
  name: '35mm Film Grain',
  category: 'Cinematic',
  version: '2.0.0',
  iconName: 'Sparkles',
  description: 'Authentic analog 35mm optical grain texture with micro-jitter noise, organic contrast grading, and subtle warm cinema tones.',
  defaultIntensity: 45,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'grainAmount',
      name: 'Grain Opacity',
      type: 'number',
      default: 32,
      min: 10,
      max: 60,
      step: 1,
      description: 'Visibility of 35mm physical film grain',
    },
    {
      id: 'colorGrade',
      name: 'Warm Cinema Grade',
      type: 'boolean',
      default: true,
      description: 'Apply subtle 35mm Kodak film tone curve',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 45;
    const grainPercent = typeof params.grainAmount === 'number' ? params.grainAmount : 32;
    const normalizedGrain = (grainPercent / 100) * (intensity / 45);

    const hasGrade = params.colorGrade !== false;

    // Seeded micro-jitter calculation (deterministic across frames)
    const t = context.currentTime;
    const jitterX = context.isPlaying ? Math.sin(t * 36) * 2.0 : 0;
    const jitterY = context.isPlaying ? Math.cos(t * 36) * 2.0 : 0;

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: hasGrade
        ? {
            sepia: 6,
            contrast: 110,
            brightness: 96,
            saturate: 104,
          }
        : {
            contrast: 106,
          },
      overlays: [
        {
          id: 'overlay_35mm_grain',
          type: 'film_grain',
          mixBlendMode: 'overlay',
          opacity: clamp(normalizedGrain, 0.1, 0.6),
          cssStyle: {
            backgroundImage: `radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
            transform: `translate(${jitterX.toFixed(1)}px, ${jitterY.toFixed(1)}px)`,
          },
          canvasDraw: (ctx, width, height) => {
            ctx.save();
            ctx.fillStyle = `rgba(255,255,255,${(normalizedGrain * 0.18).toFixed(3)})`;
            // Deterministic pseudo-random grain matrix
            const count = 350;
            for (let i = 0; i < count; i++) {
              const gx = (Math.abs(Math.sin(i * 12.9898 + t * 4)) * width);
              const gy = (Math.abs(Math.cos(i * 78.233 + t * 4)) * height);
              ctx.fillRect(gx, gy, 2, 2);
            }
            ctx.restore();
          },
        },
      ],
    };
  },
};
