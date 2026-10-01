import {
  TimelineClip,
  TimelineTransition,
  TransitionItem,
  Template,
  PlatformConfig,
  TransitionRecommendation,
  TransitionDirection,
  TransitionEasing,
  TransitionSpeed,
  TransitionLayers,
} from '@/types';

/**
 * Dynamic calculation of safe transition overlap duration.
 * Ensures the transition never exceeds safe cut boundaries or destroys clip content.
 */
export function calculateSafeDuration(
  prevClip?: TimelineClip | null,
  nextClip?: TimelineClip | null,
  template?: Template | null,
  platform?: PlatformConfig | null
): number {
  if (!prevClip || !nextClip) return 0.4;

  const minClipDuration = Math.min(prevClip.duration || 4, nextClip.duration || 4);
  const maxSafeCutThreshold = minClipDuration * 0.4;

  let baseDuration = 0.4;

  // Clip duration-aware pacing bands
  if (minClipDuration < 1.8) {
    // Very short clips (0.15s - 0.35s)
    baseDuration = Math.min(0.25, maxSafeCutThreshold);
  } else if (minClipDuration < 4.5) {
    // Normal clips (0.30s - 0.55s)
    baseDuration = 0.4;
  } else {
    // Long cinematic clips (0.50s - 0.85s)
    baseDuration = 0.6;
  }

  // Template pacing adjustments
  if (template?.pacingProfile === 'Fast & Punchy' || template?.pacingProfile === 'Beat-Synced') {
    baseDuration *= 0.85;
  } else if (template?.pacingProfile === 'Cinematic Slow') {
    baseDuration *= 1.25;
  }

  // Platform style adjustments
  if (platform?.id === 'tiktok' || platform?.id === 'shorts') {
    baseDuration = Math.min(baseDuration, 0.45);
  } else if (platform?.id === 'youtube') {
    baseDuration = Math.max(baseDuration, 0.35);
  }

  // Strictly clamp within safe physical limits
  const clamped = Math.max(0.15, Math.min(baseDuration, maxSafeCutThreshold, 1.0));
  return Number(clamped.toFixed(2));
}

/**
 * Calculates dynamic Transition Compatibility Score (0 - 100%).
 * Dynamically re-evaluates when user modifies duration, intensity, or direction.
 */
export function calculateTransitionCompatibility(
  prevClip?: TimelineClip | null,
  nextClip?: TimelineClip | null,
  transition?: TransitionItem | TimelineTransition | null,
  template?: Template | null,
  platform?: PlatformConfig | null,
  overrideDuration?: number,
  overrideIntensity?: number
): {
  score: number;
  grade: 'Optimal' | 'High' | 'Compatible' | 'Moderate';
  breakdown: {
    timingScore: number;
    motionScore: number;
    compositionScore: number;
    pacingScore: number;
  };
  reason: string;
} {
  if (!transition) {
    return {
      score: 85,
      grade: 'High',
      breakdown: { timingScore: 85, motionScore: 85, compositionScore: 85, pacingScore: 85 },
      reason: 'Standard baseline transition match.',
    };
  }

  const prevDur = prevClip?.duration || 4.0;
  const nextDur = nextClip?.duration || 4.0;
  const shortestClip = Math.min(prevDur, nextDur);

  const activeDuration = overrideDuration ?? transition.duration ?? 0.4;
  const safeTargetDuration = calculateSafeDuration(prevClip, nextClip, template, platform);

  // 1. TIMING & DURATION SCORE (Weight: 30%)
  // Penalizes transitions that are too long for short clips or too abrupt for long clips
  const durationDiff = Math.abs(activeDuration - safeTargetDuration);
  let timingScore = 95 - durationDiff * 50;
  if (activeDuration > shortestClip * 0.45) {
    // Excessive overlap penalty
    timingScore -= 35;
  }
  timingScore = Math.max(40, Math.min(99, timingScore));

  // 2. MOTION & DIRECTION CONTINUITY (Weight: 25%)
  let motionScore = 88;
  const transName = (transition.name || '').toLowerCase();
  const transType = (transition.type || '').toLowerCase();

  const prevHasSlowZoom = prevClip?.effects?.slowZoom;
  const nextHasSlowZoom = nextClip?.effects?.slowZoom;

  if (transName.includes('zoom')) {
    motionScore = prevHasSlowZoom || nextHasSlowZoom ? 96 : 90;
  } else if (transName.includes('pan') || transName.includes('whip') || transName.includes('swipe')) {
    motionScore = shortestClip < 2.5 ? 95 : 84;
  } else if (transName.includes('glitch') || transName.includes('flash')) {
    motionScore = template?.pacingProfile === 'Beat-Synced' || template?.pacingProfile === 'Fast & Punchy' ? 96 : 76;
  } else if (transName.includes('dissolve') || transName.includes('fade')) {
    motionScore = shortestClip > 3.0 ? 95 : 86;
  }

  // 3. COMPOSITION & CANVAS MATCH (Weight: 20%)
  let compositionScore = 92;
  if (platform?.format === '9:16' && (transName.includes('swipe') || transName.includes('push') || transName.includes('zoom'))) {
    compositionScore = 95;
  }

  // 4. TEMPLATE & PACING HARMONY (Weight: 25%)
  let pacingScore = 80;
  if (template) {
    const isPreferred = template.transitions.some(
      (t) => t.toLowerCase() === transName || transName.includes(t.toLowerCase()) || transType.includes(t.toLowerCase().replace(/\s+/g, '_'))
    );
    if (isPreferred) {
      pacingScore = 98;
    } else if (template.pacingProfile === 'Cinematic Slow' && (transName.includes('dissolve') || transName.includes('zoom'))) {
      pacingScore = 94;
    } else if (template.pacingProfile === 'Fast & Punchy' && (transName.includes('whip') || transName.includes('glitch') || transName.includes('flash'))) {
      pacingScore = 95;
    } else {
      pacingScore = 82;
    }
  }

  // Intensity modifier
  const activeIntensity = overrideIntensity ?? 65;
  if (shortestClip < 1.5 && activeIntensity > 85) {
    motionScore -= 6;
  }

  // Weighted total score
  const totalScore = Math.round(
    timingScore * 0.3 + motionScore * 0.25 + compositionScore * 0.2 + pacingScore * 0.25
  );
  const finalScore = Math.max(50, Math.min(99, totalScore));

  let grade: 'Optimal' | 'High' | 'Compatible' | 'Moderate' = 'Compatible';
  if (finalScore >= 92) grade = 'Optimal';
  else if (finalScore >= 85) grade = 'High';
  else if (finalScore >= 75) grade = 'Compatible';
  else grade = 'Moderate';

  let reason = `High motion alignment with safe ${activeDuration.toFixed(2)}s cut overlap.`;
  if (finalScore >= 92) {
    reason = `Optimal blend: Matches ${template?.name || 'project'} pacing rules with flawless scene continuity.`;
  } else if (activeDuration > shortestClip * 0.4) {
    reason = `Cut warning: Transition duration (${activeDuration.toFixed(2)}s) approaches the safe boundary of adjacent clip.`;
  } else if (finalScore < 80) {
    reason = `Moderate match: High contrast in cut energy. Consider auto-adjusting duration or switching to a smoother transition.`;
  }

  return {
    score: finalScore,
    grade,
    breakdown: {
      timingScore: Math.round(timingScore),
      motionScore: Math.round(motionScore),
      compositionScore: Math.round(compositionScore),
      pacingScore: Math.round(pacingScore),
    },
    reason,
  };
}

/**
 * Intelligent 1-Click Auto Adjust for a specific transition cut point.
 * Computes optimal duration, intensity, direction, blur, and easing.
 */
export function autoAdjustTransition(
  prevClip: TimelineClip | null | undefined,
  nextClip: TimelineClip | null | undefined,
  transition: TransitionItem | TimelineTransition,
  template?: Template | null,
  platform?: PlatformConfig | null
): {
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  intensityPercent: number;
  direction: TransitionDirection;
  speed: TransitionSpeed;
  zoomAmount: number;
  blurAmount: number;
  motionBlurAmount: number;
  easing: TransitionEasing;
  layers: TransitionLayers;
  compatibilityScore: number;
} {
  const safeDuration = calculateSafeDuration(prevClip, nextClip, template, platform);
  const shortestClip = Math.min(prevClip?.duration || 4, nextClip?.duration || 4);

  let intensityPercent = 65;
  let intensityLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  let direction: TransitionDirection = (transition as any).defaultDirection || 'in';
  let speed: TransitionSpeed = 'medium';
  let zoomAmount = 18;
  let blurAmount = 25;
  let motionBlurAmount = 15;
  let easing: TransitionEasing = (transition as any).defaultEasing || 'ease_in_out';

  const layers: TransitionLayers = {
    scale: true,
    motionBlur: true,
    lightFlash: false,
    directional: true,
    rotation: false,
    colorDiffusion: true,
  };

  const name = (transition.name || '').toLowerCase();

  if (name.includes('zoom')) {
    direction = 'in';
    zoomAmount = shortestClip < 2.5 ? 24 : 16;
    motionBlurAmount = 20;
    layers.scale = true;
    layers.motionBlur = true;
  } else if (name.includes('whip') || name.includes('swipe')) {
    direction = 'right';
    motionBlurAmount = 35;
    speed = shortestClip < 2.0 ? 'fast' : 'medium';
    layers.directional = true;
    layers.motionBlur = true;
  } else if (name.includes('flash') || name.includes('light')) {
    layers.lightFlash = true;
    intensityPercent = 75;
    intensityLevel = 'High';
  } else if (name.includes('spin')) {
    direction = 'clockwise';
    layers.rotation = true;
    layers.motionBlur = true;
  } else if (name.includes('glitch')) {
    speed = 'fast';
    intensityPercent = 80;
    intensityLevel = 'High';
  }

  // Adjust intensity based on template
  if (template?.pacingProfile === 'Fast & Punchy') {
    intensityPercent = Math.min(90, intensityPercent + 15);
    intensityLevel = 'High';
    speed = 'fast';
  } else if (template?.pacingProfile === 'Cinematic Slow') {
    intensityPercent = Math.max(40, intensityPercent - 15);
    intensityLevel = 'Low';
    speed = 'slow';
    easing = 'ease_in_out';
  }

  const { score } = calculateTransitionCompatibility(
    prevClip,
    nextClip,
    transition,
    template,
    platform,
    safeDuration,
    intensityPercent
  );

  return {
    duration: safeDuration,
    intensity: intensityLevel,
    intensityPercent,
    direction,
    speed,
    zoomAmount,
    blurAmount,
    motionBlurAmount,
    easing,
    layers,
    compatibilityScore: score,
  };
}

/**
 * Returns Top Ranked Recommended Transitions for an adjacent clip pair.
 */
export function getTransitionRecommendations(
  prevClip: TimelineClip | null | undefined,
  nextClip: TimelineClip | null | undefined,
  allTransitions: TransitionItem[],
  template?: Template | null,
  platform?: PlatformConfig | null
): TransitionRecommendation[] {
  const recommendations: TransitionRecommendation[] = [];

  allTransitions.forEach((t) => {
    const safeDur = calculateSafeDuration(prevClip, nextClip, template, platform);
    const evaluation = calculateTransitionCompatibility(
      prevClip,
      nextClip,
      t,
      template,
      platform,
      safeDur
    );

    recommendations.push({
      transition: t,
      score: evaluation.score,
      reason: evaluation.reason,
      adjustedDuration: safeDur,
      adjustedIntensity: t.defaultIntensity || 65,
      matchGrade: evaluation.grade,
    });
  });

  // Sort descending by compatibility score
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * Bulk Optimization: Evaluates and adjusts every transition cut in the project independently.
 */
export function optimizeAllProjectTransitions(
  clips: TimelineClip[],
  currentTransitions: TimelineTransition[],
  allTransitions: TransitionItem[],
  template?: Template | null,
  platform?: PlatformConfig | null
): TimelineTransition[] {
  return currentTransitions.map((t, idx) => {
    const prevClip = clips.find((c) => c.id === t.fromClipId) || clips[idx];
    const nextClip = clips.find((c) => c.id === t.toClipId) || clips[idx + 1];

    // Find best transition candidate from library or keep preferred
    const recommendations = getTransitionRecommendations(
      prevClip,
      nextClip,
      allTransitions,
      template,
      platform
    );

    const bestMatch = recommendations[0] || {
      transition: {
        id: 'trans_cross_dissolve',
        name: 'Cross Dissolve',
        type: 'cross_dissolve',
        category: 'Smooth',
        duration: 0.4,
        description: 'Smooth optical blend',
        iconName: 'Blend',
      },
      score: 92,
      adjustedDuration: 0.4,
    };

    const adjusted = autoAdjustTransition(
      prevClip,
      nextClip,
      bestMatch.transition,
      template,
      platform
    );

    return {
      ...t,
      name: bestMatch.transition.name,
      type: bestMatch.transition.type,
      category: bestMatch.transition.category,
      duration: adjusted.duration,
      intensity: adjusted.intensity,
      intensityPercent: adjusted.intensityPercent,
      compatibilityScore: adjusted.compatibilityScore,
      direction: adjusted.direction,
      speed: adjusted.speed,
      zoomAmount: adjusted.zoomAmount,
      blurAmount: adjusted.blurAmount,
      motionBlurAmount: adjusted.motionBlurAmount,
      easing: adjusted.easing,
      layers: adjusted.layers,
      status: 'optimized',
    };
  });
}
