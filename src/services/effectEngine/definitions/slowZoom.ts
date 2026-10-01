import { EffectDefinition, EffectOutput, EffectRenderContext } from '../types';
import { sineBell, clamp } from '../deterministicMath';

export const SlowZoomEffect: EffectDefinition = {
  id: 'eff_slow_zoom',
  key: 'slowZoom',
  name: 'Slow Zoom (Ken Burns)',
  category: 'Motion',
  version: '2.0.0',
  iconName: 'ZoomIn',
  description: 'Continuous smooth sinusoidal scale drift (1.0x to 1.15x) breathing life into static or slow shots with zero boundary jerks.',
  defaultIntensity: 75,
  supportsGPU: true,
  supportsPreview: true,
  supportsExport: true,
  deterministic: true,
  parameters: [
    {
      id: 'zoomAmount',
      name: 'Zoom Depth',
      type: 'number',
      default: 12,
      min: 2,
      max: 30,
      step: 1,
      description: 'Maximum percentage zoom at midpoint of clip',
    },
    {
      id: 'origin',
      name: 'Zoom Center',
      type: 'select',
      default: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top Focus', value: 'top' },
        { label: 'Bottom Focus', value: 'bottom' },
      ],
    },
  ],
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext): EffectOutput => {
    const intensity = typeof params.intensity === 'number' ? params.intensity : 75;
    const maxZoomPercent = typeof params.zoomAmount === 'number' ? params.zoomAmount : 12;
    const normalizedZoom = (maxZoomPercent / 100) * (intensity / 75);

    // Smooth sinusoidal breathing scale: starts at 1.0, peaks at middle, returns smoothly to 1.0 at clip cut
    const zoomMultiplier = 1.0 + sineBell(context.clipProgress) * normalizedZoom;

    const origin = (params.origin as string) || 'center';
    let originX = '50%';
    let originY = '50%';
    if (origin === 'top') originY = '25%';
    if (origin === 'bottom') originY = '75%';

    return {
      transform: {
        translateX: 0,
        translateY: 0,
        scale: clamp(zoomMultiplier, 1.0, 1.5),
        rotate: 0,
        originX,
        originY,
        overscanScale: 1.0,
      },
      filters: {},
      overlays: [],
    };
  },
};
