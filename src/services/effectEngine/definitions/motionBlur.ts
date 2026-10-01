import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';

export const MotionBlurEffect: EffectDefinition = {
  id: 'eff_motion_blur',
  key: 'motionBlur',
  name: 'Directional Motion Blur',
  category: 'Motion',
  version: '2.0.0',
  iconName: 'Wind',
  description: '180-degree cinema shutter angle simulation providing natural optical trail blur on moving elements.',
  defaultIntensity: 70,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'shutterAngle',
      name: 'Shutter Angle (Blur px)',
      type: 'number',
      default: 1.4,
      min: 0.5,
      max: 4.0,
      step: 0.1,
      description: 'Shutter simulation radius in pixels',
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 70;
    const baseBlur = typeof params.shutterAngle === 'number' ? params.shutterAngle : 1.4;
    const effectiveBlur = (baseBlur * (intensity / 70));

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        rotate: 0,
      },
      filters: {
        blur: effectiveBlur,
        contrast: 108,
        saturate: 112,
      },
      overlays: [],
    };
  },
};
