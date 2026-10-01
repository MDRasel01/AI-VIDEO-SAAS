import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { exponentialDecay } from '../deterministicMath';

export const LightFlashEffect: EffectDefinition = {
  id: 'eff_light_flash',
  key: 'lightFlash',
  name: 'Exposure Pulse',
  category: 'Light',
  version: '2.0.0',
  iconName: 'Zap',
  description: 'Instant optical shutter flash burst on cut entry decaying smoothly into full scene illumination.',
  defaultIntensity: 75,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const flashAlpha = exponentialDecay(context.clipProgress, 8) * 0.85;

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: {
        brightness: 100 + flashAlpha * 40,
      },
      overlays: [
        {
          id: 'overlay_light_flash',
          type: 'custom',
          mixBlendMode: 'screen',
          opacity: flashAlpha,
          canvasDraw: (ctx, width, height) => {
            if (flashAlpha > 0.01) {
              ctx.save();
              ctx.fillStyle = `rgba(255,255,255,${flashAlpha.toFixed(2)})`;
              ctx.fillRect(0, 0, width, height);
              ctx.restore();
            }
          },
        },
      ],
    };
  },
};
