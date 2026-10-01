'use client';

import React, { useState, useMemo } from 'react';
import { TransitionItem, TimelineTransition, RecommendationEvidence } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Heart,
  Play,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
  MoveRight,
  RotateCw,
  Zap,
  Activity,
  Sun,
  Wind,
  Box,
  CircleDot,
  Gauge,
  Layers,
  Shuffle,
  Info,
  GripVertical,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface TransitionPreviewCardProps {
  transition: TransitionItem;
  onApplyToActiveCut: (transition: TransitionItem, variation?: string) => void;
  onApplyToAllCuts: (transition: TransitionItem) => void;
  onOpenEvidence?: (transition: TransitionItem, evidence: RecommendationEvidence) => void;
}

export default function TransitionPreviewCard({
  transition,
  onApplyToActiveCut,
  onApplyToAllCuts,
  onOpenEvidence,
}: TransitionPreviewCardProps) {
  const {
    timelineClips,
    timelineTransitions,
    selectedTransitionId,
    favoriteTransitionIds,
    toggleFavoriteTransition,
    selectedTemplate,
    selectedPlatform,
    aspectRatio,
    seek,
    setIsPlaying,
    evaluateTransition,
    optimizationSettings,
  } = useEditor();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>(
    transition.variations?.[0] || transition.name
  );
  const [isAppliedToast, setIsAppliedToast] = useState(false);

  const isFavorite = favoriteTransitionIds.includes(transition.id);

  // Find currently active or selected transition on timeline
  const targetTimelineTransition = useMemo<TimelineTransition | null>(() => {
    if (selectedTransitionId) {
      return timelineTransitions.find((t) => t.id === selectedTransitionId) || null;
    }
    return timelineTransitions[0] || null;
  }, [selectedTransitionId, timelineTransitions]);

  const prevClip = useMemo(() => {
    if (!targetTimelineTransition) return timelineClips[0] || null;
    return (
      timelineClips.find((c) => c.id === targetTimelineTransition.fromClipId) ||
      timelineClips[0] ||
      null
    );
  }, [targetTimelineTransition, timelineClips]);

  const nextClip = useMemo(() => {
    if (!targetTimelineTransition) return timelineClips[1] || null;
    return (
      timelineClips.find((c) => c.id === targetTimelineTransition.toClipId) ||
      timelineClips[1] ||
      null
    );
  }, [targetTimelineTransition, timelineClips]);

  // Dynamically calculate live compatibility evaluation for this transition
  const evaluation = useMemo(() => {
    return evaluateTransition(transition);
  }, [evaluateTransition, transition]);

  const handlePreviewAnimation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (targetTimelineTransition) {
      seek(Math.max(0, targetTimelineTransition.position - 0.5));
      setIsPlaying(true);
    } else if (timelineClips.length >= 2) {
      seek(Math.max(0, (timelineClips[0].end || 2) - 0.5));
      setIsPlaying(true);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApplyToActiveCut(transition, selectedVariation);
    setIsAppliedToast(true);
    setTimeout(() => setIsAppliedToast(false), 1600);
  };

  // Drag Start Handler
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'TRANSITION',
        transition,
        variation: selectedVariation,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Get icon by transition type
  const getIcon = () => {
    const name = transition.name.toLowerCase();
    if (name.includes('zoom')) return Maximize2;
    if (name.includes('swipe') || name.includes('push')) return MoveRight;
    if (name.includes('spin')) return RotateCw;
    if (name.includes('flash') || name.includes('shutter')) return Zap;
    if (name.includes('glitch') || name.includes('pixel')) return Activity;
    if (name.includes('flare') || name.includes('light')) return Sun;
    if (name.includes('blur')) return Wind;
    if (name.includes('3d') || name.includes('cube')) return Box;
    if (name.includes('mask') || name.includes('iris')) return CircleDot;
    if (name.includes('speed')) return Gauge;
    return Shuffle;
  };

  const IconComponent = getIcon();

  // Aspect ratio class calculation for live preview frame
  const aspectClass = useMemo(() => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-44 max-w-[130px]';
      case '16:9':
        return 'aspect-[16/9] max-h-32 max-w-full';
      case '1:1':
        return 'aspect-square max-h-36 max-w-[140px]';
      case '4:5':
        return 'aspect-[4/5] max-h-40 max-w-[135px]';
      default:
        return 'aspect-[9/16] max-h-44 max-w-[130px]';
    }
  }, [aspectRatio]);

  // Color badge for compatibility score
  const scoreColor =
    evaluation.score >= 90
      ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
      : evaluation.score >= 80
      ? 'text-[#5B8CFF] bg-[#5B8CFF]/15 border-[#5B8CFF]/30'
      : 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';

  const isSelectedOnTimeline = targetTimelineTransition?.name === transition.name;

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-xl bg-[#11141A] hover:bg-[#151820] border p-3 flex flex-col justify-between space-y-2.5 transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
        isSelectedOnTimeline
          ? 'border-[#7C5CFF] shadow-[0_0_20px_rgba(124,92,255,0.25)] ring-1 ring-[#7C5CFF]/50'
          : 'border-white/[0.08] hover:border-white/[0.2]'
      }`}
    >
      {/* Top Header Row: Category Badge, Aspect Indicator, Favorite Button & Drag Handle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-[#9CA3AF] border border-white/[0.06]">
            {transition.category}
          </span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.03] text-[#667085] border border-white/[0.05]">
            {aspectRatio} ✓
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteTransition(transition.id);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1 rounded-lg transition ${
              isFavorite
                ? 'text-[#EF4444] hover:scale-110'
                : 'text-[#667085] hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div
            title="Drag & Drop onto any timeline cut"
            className="p-1 text-[#667085] group-hover:text-white transition cursor-grab"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Aspect-Ratio-Aware Visual Interactive Live Preview Box */}
      <div className="flex justify-center w-full py-1">
        <div
          onClick={handlePreviewAnimation}
          className={`relative ${aspectClass} w-full rounded-lg overflow-hidden bg-[#07080B] border border-white/[0.08] flex items-center justify-center cursor-pointer group/preview shadow-inner`}
        >
          {/* Animated Visual Canvas simulation */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Scene A Background */}
            <div
              className={`absolute inset-0 transition-all duration-700 ${
                isHovered
                  ? transition.previewAnimationType === 'zoom_in'
                    ? 'scale-150 opacity-0 blur-xs'
                    : transition.previewAnimationType === 'zoom_out'
                    ? 'scale-75 opacity-0'
                    : transition.previewAnimationType === 'swipe_right'
                    ? '-translate-x-full opacity-30'
                    : transition.previewAnimationType === 'whip_pan'
                    ? '-translate-x-full blur-sm'
                    : transition.previewAnimationType === 'spin_cw'
                    ? 'rotate-180 scale-50 opacity-0'
                    : transition.previewAnimationType === 'light_flash'
                    ? 'brightness-200'
                    : transition.previewAnimationType === 'glitch'
                    ? 'translate-x-2 skew-x-12 opacity-50'
                    : 'opacity-20'
                  : 'opacity-90 scale-100'
              }`}
            >
              {prevClip?.thumbnail ? (
                <img
                  src={prevClip.thumbnail}
                  alt="Scene A"
                  className="w-full h-full object-cover brightness-85"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#1E293B] to-[#334155] flex items-center justify-center text-[10px] font-mono text-white/40 font-bold">
                  SCENE A
                </div>
              )}
            </div>

            {/* Scene B (Incoming) */}
            <div
              className={`absolute inset-0 transition-all duration-700 flex items-center justify-center overflow-hidden ${
                isHovered
                  ? 'opacity-100 scale-100 translate-x-0'
                  : transition.previewAnimationType === 'swipe_right'
                  ? 'translate-x-full opacity-0'
                  : transition.previewAnimationType === 'zoom_in'
                  ? 'scale-50 opacity-0'
                  : 'opacity-0'
              }`}
            >
              {nextClip?.thumbnail ? (
                <img
                  src={nextClip.thumbnail}
                  alt="Scene B"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#7C5CFF]/40 via-[#5B8CFF]/30 to-[#0F172A] flex items-center justify-center">
                  <div className="text-[10px] font-mono text-white font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#7C5CFF]" />
                    <span>SCENE B</span>
                  </div>
                </div>
              )}
            </div>

            {/* Glitch / Flash Simulated Overlay on Hover */}
            {isHovered && transition.previewAnimationType === 'light_flash' && (
              <div className="absolute inset-0 bg-white/80 animate-pulse pointer-events-none" />
            )}
            {isHovered && transition.previewAnimationType === 'glitch' && (
              <div className="absolute inset-0 bg-[#7C5CFF]/30 mix-blend-color-dodge pointer-events-none" />
            )}
          </div>

          {/* Center Play Demo Pill */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Play className="w-3 h-3 fill-white" />
              <span>Preview</span>
            </div>
          </div>

          {/* Bottom Left Type & Duration Badge */}
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-white flex items-center gap-1 text-[9px] font-mono">
            <IconComponent className="w-2.5 h-2.5 text-[#7C5CFF]" />
            <span>{transition.duration}s</span>
          </div>
        </div>
      </div>

      {/* Info & Dynamic Compatibility Match */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-white truncate" title={transition.name}>
            {transition.name}
          </h4>

          {/* Live Dynamic Compatibility Score Pill & Why Button */}
          <div className="flex items-center gap-1 shrink-0">
            {(optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
              <div
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${scoreColor}`}
                title="Video Compatibility Score: Estimates motion continuity and timing compatibility for consecutive cuts."
              >
                <span>{evaluation.score}%</span>
                <span className="text-[8px] font-normal uppercase">{evaluation.grade}</span>
              </div>
            )}

            {(optimizationSettings.showEvidence ?? true) && onOpenEvidence && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEvidence(transition, evaluation);
                }}
                className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/[0.08] text-[10px] font-medium flex items-center gap-0.5 transition"
                title="Why am I seeing this recommendation? Open Evidence Analysis"
              >
                <HelpCircle className="w-3 h-3 text-[#7C5CFF]" />
                <span>Why?</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-tight">
          {transition.description}
        </p>

        {/* Breakdown Row */}
        {(optimizationSettings.showDetails ?? optimizationSettings.showAnalysisDetails) && evaluation.breakdown && (
          <div className="pt-0.5 flex items-center justify-between text-[9px] font-mono text-[#667085]">
            <span>Motion: {evaluation.breakdown.motionScore}%</span>
            <span>Duration: {evaluation.breakdown.durationScore}%</span>
            <span>Contrast: {evaluation.breakdown.contrastScore}%</span>
          </div>
        )}
      </div>

      {/* Variations Selector (if available) */}
      {transition.variations && transition.variations.length > 1 && (
        <div className="pt-0.5">
          <select
            value={selectedVariation}
            onChange={(e) => setSelectedVariation(e.target.value)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-[#9CA3AF] text-[10px] px-2 py-1 rounded-md outline-none focus:border-[#7C5CFF] cursor-pointer"
          >
            {transition.variations.map((v) => (
              <option key={v} value={v}>
                Variation: {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons: Use / Apply to Cut */}
      <div className="pt-1 flex items-center gap-1.5">
        <button
          onClick={handleApply}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${
            isAppliedToast
              ? 'bg-[#22C55E] text-white'
              : 'bg-[#0D0F14] hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/35 hover:border-transparent'
          }`}
        >
          {isAppliedToast ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Applied!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use This</span>
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onApplyToAllCuts(transition);
          }}
          title="Apply this transition style across all cuts in the project"
          className="px-2 py-1.5 rounded-lg bg-[#0D0F14] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/[0.08] text-[10px] font-medium transition"
        >
          All Cuts
        </button>
      </div>
    </div>
  );
}
