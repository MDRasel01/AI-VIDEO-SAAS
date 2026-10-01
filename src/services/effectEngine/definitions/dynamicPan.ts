import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { sineBell, calculateRequiredOverscan } from '../deterministicMath';

export const DynamicPanEffect: EffectDefinition = {
  id: 'eff_dynamic_pan',
  key: 'pan',
  name: 'Dynamic Pan',
  category: 'Motion',
  version: '2.0.0',
  iconName: 'MoveHorizontal',
  description: 'Gentle cinematic virtual dolly drift horizontally across the canvas with automatic overscan protection against black borders.',
  defaultIntensity: 60,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'panDistance',
      name: 'Pan Distance (px)',
      type: 'number',
      default: 24,
      min: 5,
      max: 60,
      step: 1,
      description: 'Maximum horizontal translation excursion in pixels',
    },
    {
      id: 'direction',
      name: 'Pan Direction',
      type: 'select',
      default: 'horizontal',
      options: [
        { label: 'Left to Right', value: 'horizontal' },
        { label: 'Right to Left', value: 'reverse_horizontal' },
        { label: 'Vertical Dolly', value: 'vertical' },
      ],
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 60;
    const baseDistance = typeof params.panDistance === 'number' ? params.panDistance : 24;
    const maxPx = baseDistance * (intensity / 60);

    const dir = (params.direction as string) || 'horizontal';
    const progressFactor = sineBell(context.clipProgress);

    let translateX = 0;
    let translateY = 0;

    if (dir === 'horizontal') {
      translateX = progressFactor * maxPx;
    } else if (dir === 'reverse_horizontal') {
      translateX = -progressFactor * maxPx;
    } else if (dir === 'vertical') {
      translateY = progressFactor * maxPx * 0.75;
    }

    const overscan = calculateRequiredOverscan(translateX, translateY, 0, context.resolution.width, context.resolution.height);

    return {
      transform: {
        translateX,
        translateY,
        scale: Math.max(1.05, overscan), // Auto overscan buffer to prevent edge gaps
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
