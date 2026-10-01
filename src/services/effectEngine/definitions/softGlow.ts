import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';

export const SoftGlowEffect: EffectDefinition = {
  id: 'eff_soft_glow',
  key: 'glow',
  name: 'Diffusion Glow',
  category: 'Light',
  version: '2.0.0',
  iconName: 'Flame',
  description: 'Dreamy Pro-Mist diffusion halation around specular highlights, creating soft cinematic skin tones and glowing atmosphere.',
  defaultIntensity: 50,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'bloomRadius',
      name: 'Bloom Radius (px)',
      type: 'number',
      default: 14,
      min: 4,
      max: 30,
      step: 1,
      description: 'Spread of the specular highlight diffusion',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 50;
    const radius = typeof params.bloomRadius === 'number' ? params.bloomRadius : 14;

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: {
        brightness: 112,
        contrast: 104,
        saturate: 118,
        dropShadow: `0 0 ${radius}px rgba(255,230,190,${(intensity / 100 * 0.65).toFixed(2)})`,
      },
      overlays: [
        {
          id: 'overlay_diffusion_glow',
          type: 'glow_bloom',
          mixBlendMode: 'screen',
          opacity: (intensity / 100) * 0.7,
          canvasDraw: (ctx, width, height) => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const gradient = ctx.createRadialGradient(
              width / 2,
              height / 2,
              width * 0.1,
              width / 2,
              height / 2,
              width * 0.65
            );
            gradient.addColorStop(0, 'rgba(255,240,210,0.18)');
            gradient.addColorStop(0.5, 'rgba(180,210,255,0.08)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          },
        },
      ],
    };
  },
};
