import {
  EffectDefinition,
  EffectCategory,
  EffectRenderContext,
  EffectCompositionResult,
  ValidationResult,
  EffectOverlay,
} from './types';
import { SlowZoomEffect } from './definitions/slowZoom';
import { DynamicPanEffect } from './definitions/dynamicPan';
import { ShakeImpactEffect } from './definitions/shakeImpact';
import { FilmGrainEffect } from './definitions/filmGrain';
import { AnamorphicFlareEffect } from './definitions/anamorphicFlare';
import { SoftGlowEffect } from './definitions/softGlow';
import { MotionBlurEffect } from './definitions/motionBlur';
import { SpeedRampEffect } from './definitions/speedRamp';
import { VignetteEffect } from './definitions/vignette';
import { RgbSplitEffect } from './definitions/rgbSplit';
import { CinematicGradeEffect } from './definitions/cinematicGrade';
import { LightFlashEffect } from './definitions/lightFlash';

export class EffectRegistry {
  private effects: Map<string, EffectDefinition> = new Map();
  private keyToIdMap: Map<string, string> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(SlowZoomEffect);
    this.register(DynamicPanEffect);
    this.register(ShakeImpactEffect);
    this.register(FilmGrainEffect);
    this.register(AnamorphicFlareEffect);
    this.register(SoftGlowEffect);
    this.register(MotionBlurEffect);
    this.register(SpeedRampEffect);
    this.register(VignetteEffect);
    this.register(RgbSplitEffect);
    this.register(CinematicGradeEffect);
    this.register(LightFlashEffect);
  }

  public register(effect: EffectDefinition) {
    this.effects.set(effect.id, effect);
    this.keyToIdMap.set(effect.key, effect.id);
    // Also map common aliases
    if (effect.id.startsWith('eff_')) {
      this.keyToIdMap.set(effect.id.replace('eff_', ''), effect.id);
    }
  }

  public get(id: string): EffectDefinition | undefined {
    return this.effects.get(id);
  }

  public getByKey(key: string): EffectDefinition | undefined {
    const id = this.keyToIdMap.get(key) || key;
    return this.effects.get(id);
  }

  public getAll(): EffectDefinition[] {
    return Array.from(this.effects.values());
  }

  public getByCategory(category: EffectCategory | 'All'): EffectDefinition[] {
    if (category === 'All') return this.getAll();
    return this.getAll().filter((e) => e.category === category);
  }

  /**
   * Deterministic Central Compositor
   * Evaluates all active effects on a clip and produces a unified transform, filter, and overlay stack
   */
  public evaluateClipEffects(
    effectsConfig: Record<string, boolean | number | Record<string, unknown> | undefined> | undefined,
    context: EffectRenderContext
  ): EffectCompositionResult {
    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;
    let rotate = 0;
    let originX = '50%';
    let originY = '50%';
    let maxOverscan = 1.0;

    let blur = 0;
    let brightness = 100;
    let contrast = 100;
    let saturate = 100;
    let sepia = 0;
    let hueRotate = 0;
    const dropShadows: string[] = [];

    const overlays: EffectOverlay[] = [];
    let playbackRateMultiplier = 1.0;

    if (effectsConfig) {
      for (const [key, value] of Object.entries(effectsConfig)) {
        if (!value) continue;

        const effect = this.getByKey(key);
        if (!effect) continue;

        const params: Record<string, unknown> =
          typeof value === 'object' && value !== null
            ? (value as Record<string, unknown>)
            : { intensity: effect.defaultIntensity };

        const output = effect.evaluate(params, context);

        // 1. Transform Composition
        if (output.transform) {
          scale *= output.transform.scale;
          translateX += output.transform.translateX;
          translateY += output.transform.translateY;
          rotate += output.transform.rotate;
          if (output.transform.originX) originX = output.transform.originX;
          if (output.transform.originY) originY = output.transform.originY;
          if (output.transform.overscanScale) {
            maxOverscan = Math.max(maxOverscan, output.transform.overscanScale);
          }
        }

        // 2. Filters Composition
        if (output.filters) {
          if (output.filters.blur) blur += output.filters.blur;
          if (output.filters.brightness) brightness = (brightness * output.filters.brightness) / 100;
          if (output.filters.contrast) contrast = (contrast * output.filters.contrast) / 100;
          if (output.filters.saturate) saturate = (saturate * output.filters.saturate) / 100;
          if (output.filters.sepia) sepia = Math.min(100, sepia + output.filters.sepia);
          if (output.filters.hueRotate) hueRotate += output.filters.hueRotate;
          if (output.filters.dropShadow) dropShadows.push(output.filters.dropShadow);
        }

        // 3. Overlays Stack
        if (output.overlays && output.overlays.length > 0) {
          overlays.push(...output.overlays);
        }

        // 4. Playback Rate Multiplier
        if (output.playbackRateMultiplier !== undefined) {
          playbackRateMultiplier *= output.playbackRateMultiplier;
        }
      }
    }

    // Compose final CSS Transform String (Deterministic Precision to 3 decimals)
    const transformParts: string[] = [];
    if (scale !== 1.0) transformParts.push(`scale(${scale.toFixed(3)})`);
    if (translateX !== 0 || translateY !== 0) {
      transformParts.push(`translate(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px)`);
    }
    if (rotate !== 0) transformParts.push(`rotate(${rotate.toFixed(2)}deg)`);
    const transformString = transformParts.length > 0 ? transformParts.join(' ') : 'translate(0px, 0px) scale(1)';

    // Compose final CSS Filter String
    const filterParts: string[] = [];
    if (blur > 0) filterParts.push(`blur(${blur.toFixed(1)}px)`);
    if (brightness !== 100) filterParts.push(`brightness(${brightness.toFixed(0)}%)`);
    if (contrast !== 100) filterParts.push(`contrast(${contrast.toFixed(0)}%)`);
    if (saturate !== 100) filterParts.push(`saturate(${saturate.toFixed(0)}%)`);
    if (sepia > 0) filterParts.push(`sepia(${sepia.toFixed(0)}%)`);
    if (hueRotate !== 0) filterParts.push(`hue-rotate(${hueRotate.toFixed(0)}deg)`);
    if (dropShadows.length > 0) filterParts.push(...dropShadows);
    const filterString = filterParts.join(' ');

    return {
      transformString,
      filterString,
      overlays,
      playbackRateMultiplier,
      scale,
      translateX,
      translateY,
      rotate,
      isBoundarySafe: scale >= maxOverscan,
    };
  }

  /**
   * Automated Effect Validation Test Runner
   */
  public validateEffect(id: string): ValidationResult {
    const effect = this.get(id);
    if (!effect) {
      return {
        isValid: false,
        effectId: id,
        errors: [`Effect with ID ${id} is not registered`],
        warnings: [],
        testedFramesCount: 0,
        isDeterministic: false,
        isBoundarySafe: false,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const testPoints = [0.0, 0.25, 0.5, 0.75, 1.0];
    let isDeterministic = true;
    let isBoundarySafe = true;

    for (const p of testPoints) {
      const ctxA: EffectRenderContext = {
        currentTime: p * 4.0,
        clipProgress: p,
        clipDuration: 4.0,
        isPlaying: true,
        resolution: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        seed: 42,
      };

      const ctxB: EffectRenderContext = { ...ctxA };

      const outA = effect.evaluate({}, ctxA);
      const outB = effect.evaluate({}, ctxB);

      // Check NaN or Infinity
      if (
        isNaN(outA.transform.scale) ||
        isNaN(outA.transform.translateX) ||
        isNaN(outA.transform.translateY) ||
        !isFinite(outA.transform.scale)
      ) {
        errors.push(`Non-finite transform at progress ${p}`);
      }

      // Check Determinism (A === B)
      if (
        outA.transform.scale !== outB.transform.scale ||
        outA.transform.translateX !== outB.transform.translateX ||
        outA.transform.translateY !== outB.transform.translateY
      ) {
        isDeterministic = false;
        errors.push(`Non-deterministic output detected at progress ${p}`);
      }

      // Check boundary safety
      if (outA.transform.scale < (outA.transform.overscanScale || 1.0) - 0.001) {
        isBoundarySafe = false;
        warnings.push(`Potential black edge exposure at progress ${p}`);
      }
    }

    return {
      isValid: errors.length === 0,
      effectId: id,
      errors,
      warnings,
      testedFramesCount: testPoints.length,
      isDeterministic,
      isBoundarySafe,
    };
  }

  public validateAll(): ValidationResult[] {
    return this.getAll().map((e) => this.validateEffect(e.id));
  }
}

// Global Central Singleton Instance
export const effectRegistry = new EffectRegistry();
