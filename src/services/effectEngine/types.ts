export type EffectCategory =
  | 'Motion'
  | 'Camera'
  | 'Optical'
  | 'Light'
  | 'Color'
  | 'Distortion'
  | 'Stylized'
  | 'Atmospheric'
  | 'Cinematic';

export interface EffectParameter {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'select' | 'color' | 'point';
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string | number }[];
  description?: string;
}

export interface EffectRenderContext {
  currentTime: number; // Global timeline timestamp in seconds
  clipProgress: number; // Normalized 0.0 to 1.0 progress inside clip
  clipDuration: number; // Effective clip duration in seconds
  isPlaying: boolean; // Whether active playback is running
  resolution: {
    width: number;
    height: number;
  };
  aspectRatio: string; // e.g. '9:16', '16:9', '1:1', '4:5'
  seed?: number; // Deterministic seed for reproducible noise/jitter
}

export interface EffectTransform {
  translateX: number; // Translation in pixels
  translateY: number; // Translation in pixels
  scale: number; // Scale multiplier (1.0 = normal)
  rotate: number; // Rotation in degrees (0 = normal)
  skewX?: number; // Skew in degrees
  skewY?: number; // Skew in degrees
  originX?: string; // CSS transform-origin X (e.g. '50%')
  originY?: string; // CSS transform-origin Y (e.g. '50%')
  overscanScale?: number; // Required buffer scale to prevent black edge exposure
}

export interface EffectFilters {
  blur?: number; // blur radius in px
  brightness?: number; // percentage (100 = default)
  contrast?: number; // percentage (100 = default)
  saturate?: number; // percentage (100 = default)
  sepia?: number; // percentage (0 = default)
  hueRotate?: number; // degrees (0 = default)
  dropShadow?: string; // CSS drop shadow string
  opacity?: number; // 0.0 to 1.0 (1.0 = default)
}

export interface EffectOverlay {
  id: string;
  type: 'film_grain' | 'light_leak' | 'glow_bloom' | 'vignette' | 'speed_ramp_lines' | 'rgb_split' | 'custom';
  mixBlendMode: 'screen' | 'overlay' | 'soft-light' | 'multiply' | 'normal' | 'color-dodge';
  opacity: number;
  cssStyle?: React.CSSProperties;
  canvasDraw?: (ctx: CanvasRenderingContext2D, width: number, height: number, context: EffectRenderContext) => void;
}

export interface EffectOutput {
  transform: EffectTransform;
  filters: EffectFilters;
  overlays: EffectOverlay[];
  playbackRateMultiplier?: number;
}

export interface ValidationResult {
  isValid: boolean;
  effectId: string;
  errors: string[];
  warnings: string[];
  testedFramesCount: number;
  isDeterministic: boolean;
  isBoundarySafe: boolean;
}

export interface EffectDefinition {
  id: string; // e.g. 'slow_zoom', 'dynamic_pan'
  key: string; // key in TimelineClip['effects'], e.g. 'slowZoom', 'pan'
  name: string;
  category: EffectCategory;
  version: string;
  iconName: string;
  description: string;
  defaultIntensity: number; // 0 to 100
  parameters: EffectParameter[];
  supportsGPU: boolean;
  supportsPreview: boolean;
  supportsExport: boolean;
  deterministic: boolean;

  /**
   * Pure deterministic computation function.
   * Given time, parameters, and resolution context, returns the exact transform, filter, and overlays.
   */
  evaluate: (params: Record<string, unknown>, context: EffectRenderContext) => EffectOutput;

  /**
   * Automated verification test runner for this specific effect
   */
  validate?: () => ValidationResult;
}

export interface EffectCompositionResult {
  transformString: string;
  filterString: string;
  overlays: EffectOverlay[];
  playbackRateMultiplier: number;
  scale: number;
  translateX: number;
  translateY: number;
  rotate: number;
  isBoundarySafe: boolean;
}
