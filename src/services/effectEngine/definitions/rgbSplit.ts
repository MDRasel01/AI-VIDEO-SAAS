import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';

export const RgbSplitEffect: EffectDefinition = {
  id: 'eff_rgb_split',
  key: 'rgbSplit',
  name: 'Chromatic RGB Split',
  category: 'Stylized',
  version: '2.0.0',
  iconName: 'Activity',
  description: 'Cyberpunk chromatic aberration split separating color channels with optical displacement artifacts.',
  defaultIntensity: 75,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'shiftPx',
      name: 'Color Separation (px)',
      type: 'number',
      default: 6,
      min: 1,
      max: 18,
      step: 1,
      description: 'Channel displacement distance',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 75;
    const shift = (typeof params.shiftPx === 'number' ? params.shiftPx : 6) * (intensity / 75);

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.02,
        rotate: 0,
      },
      filters: {
        contrast: 108,
        saturate: 120,
        dropShadow: `-${shift.toFixed(1)}px 0 0 rgba(255,0,0,0.5), ${shift.toFixed(1)}px 0 0 rgba(0,255,255,0.5)`,
      },
      overlays: [],
    };
  },
};
