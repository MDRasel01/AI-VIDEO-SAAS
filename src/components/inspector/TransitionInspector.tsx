'use client';

import React, { useState, useMemo } from 'react';
import { TimelineTransition, TransitionDirection, TransitionEasing, TransitionLayers } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  calculateTransitionCompatibility,
  getTransitionRecommendations,
  calculateSafeDuration,
} from '@/services/transitionIntelligence';
import {
  Shuffle,
  Clock,
  Zap,
  Play,
  Wand2,
  Sparkles,
  Layers,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Wind,
  Compass,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface TransitionInspectorProps {
  transition: TimelineTransition;
}

export default function TransitionInspector({ transition }: TransitionInspectorProps) {
  const {
    timelineClips,
    allTransitionsList,
    updateTransition,
    autoAdjustSingleTransition,
    selectedTemplate,
    selectedPlatform,
    seek,
    setIsPlaying,
  } = useEditor();

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [autoAdjustToast, setAutoAdjustToast] = useState(false);

  // Find the two adjacent clips for this cut
  const prevClip = useMemo(() => {
    return timelineClips.find((c) => c.id === transition.fromClipId) || null;
  }, [timelineClips, transition.fromClipId]);

  const nextClip = useMemo(() => {
    return timelineClips.find((c) => c.id === transition.toClipId) || null;
  }, [timelineClips, transition.toClipId]);

  // Safe duration threshold for these two clips
  const safeDuration = useMemo(() => {
    return calculateSafeDuration(prevClip, nextClip, selectedTemplate, selectedPlatform);
  }, [prevClip, nextClip, selectedTemplate, selectedPlatform]);

  // Live dynamic compatibility evaluation
  const compatibility = useMemo(() => {
    return calculateTransitionCompatibility(
      prevClip,
      nextClip,
      transition,
      selectedTemplate,
      selectedPlatform,
      transition.duration,
      transition.intensityPercent || 75
    );
  }, [prevClip, nextClip, transition, selectedTemplate, selectedPlatform]);

  // Top 4 recommended transitions for this cut pair
  const recommendations = useMemo(() => {
    return getTransitionRecommendations(
      prevClip,
      nextClip,
      allTransitionsList,
      selectedTemplate,
      selectedPlatform
    ).slice(0, 4);
  }, [prevClip, nextClip, allTransitionsList, selectedTemplate, selectedPlatform]);

  const handleAutoAdjust = () => {
    autoAdjustSingleTransition(transition.id);
    setAutoAdjustToast(true);
    setTimeout(() => setAutoAdjustToast(false), 1800);
  };

  const handlePreviewCut = () => {
    seek(Math.max(0, transition.position - 0.4));
    setIsPlaying(true);
  };

  const handleToggleLayer = (layerKey: keyof TransitionLayers) => {
    const currentLayers = transition.layers || {
      scale: true,
      motionBlur: true,
      lightFlash: false,
      directional: true,
      rotation: false,
      colorDiffusion: true,
    };
    updateTransition(transition.id, {
      layers: {
        ...currentLayers,
        [layerKey]: !currentLayers[layerKey],
      },
    });
  };

  const scoreColor =
    compatibility.score >= 90
      ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
      : compatibility.score >= 80
      ? 'text-[#5B8CFF] bg-[#5B8CFF]/15 border-[#5B8CFF]/30'
      : 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Header with Preview Button */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center">
            <Shuffle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Transition Properties
            </h3>
            <p className="text-[10px] text-[#667085] font-mono">
              Cut at {transition.position.toFixed(2)}s
            </p>
          </div>
        </div>

        <button
          onClick={handlePreviewCut}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#7C5CFF]/20 hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white text-[11px] font-bold border border-[#7C5CFF]/40 transition shadow-xs"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Preview</span>
        </button>
      </div>

      {/* 1. COMPATIBILITY MATCH SCORE GAUGE & AUTO ADJUST CTA */}
      <div className="p-3.5 rounded-xl bg-[#11141A] border border-white/[0.08] space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Transition Fit Score
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-mono font-black text-white">
                {compatibility.score}%
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${scoreColor}`}>
                {compatibility.grade}
              </span>
            </div>
          </div>

          {/* 1-Click Auto Adjust Button */}
          <button
            onClick={handleAutoAdjust}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
              autoAdjustToast
                ? 'bg-[#22C55E] text-white'
                : 'bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white shadow-[#7C5CFF]/25 hover:brightness-110 active:scale-95'
            }`}
          >
            {autoAdjustToast ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto Adjusted!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>AUTO ADJUST</span>
              </>
            )}
          </button>
        </div>

        {/* Explanation Tooltip Notice */}
        <p className="text-[11px] text-[#9CA3AF] leading-snug">
          {compatibility.reason}
        </p>

        {/* Expandable Breakdown Accordion */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-[10px] font-semibold text-[#667085] hover:text-white transition"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#7C5CFF]" />
              <span>Compatibility Factor Breakdown</span>
            </span>
            {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-1.5 bg-[#0D0F14] p-2.5 rounded-lg border border-white/[0.05] text-[10px] animate-in fade-in">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Timing & Safe Overlap</span>
                <span className="font-mono text-white font-bold">
                  {compatibility.breakdown.timingScore}%
                </span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Motion & Direction Flow</span>
                <span className="font-mono text-white font-bold">
                  {compatibility.breakdown.motionScore}%
                </span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Composition & Canvas Fit</span>
                <span className="font-mono text-white font-bold">
                  {compatibility.breakdown.compositionScore}%
                </span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Template & Rhythm Harmony</span>
                <span className="font-mono text-white font-bold">
                  {compatibility.breakdown.pacingScore}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. BEST MATCHES RECOMMENDATIONS */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Recommended Transitions for this Cut</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {recommendations.map((rec) => {
            const isSelected = transition.name === rec.transition.name;
            return (
              <button
                key={rec.transition.id}
                onClick={() => {
                  updateTransition(transition.id, {
                    name: rec.transition.name,
                    type: rec.transition.type,
                    category: rec.transition.category,
                    duration: rec.adjustedDuration,
                  });
                }}
                className={`p-2 rounded-xl text-left transition border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#7C5CFF]/20 border-[#7C5CFF] text-white shadow-sm'
                    : 'bg-[#11141A] border-white/[0.06] hover:border-white/[0.18] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold truncate text-[11px]">{rec.transition.name}</span>
                  <span className="text-[10px] font-mono text-[#22C55E] font-bold">
                    {rec.score}%
                  </span>
                </div>
                <div className="text-[9px] text-[#667085] mt-0.5">{rec.transition.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DURATION & SAFE OVERLAP SLIDER */}
      <div className="space-y-1.5 bg-[#11141A] p-3 rounded-xl border border-white/[0.08]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF]">
          <span className="flex items-center gap-1.5 text-white">
            <Clock className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span>Cut Duration</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#667085]">Safe: {safeDuration}s</span>
            <span className="font-mono text-white font-bold bg-[#0D0F14] px-1.5 py-0.5 rounded border border-white/[0.08]">
              {transition.duration.toFixed(2)}s
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.02"
          value={transition.duration}
          onChange={(e) => updateTransition(transition.id, { duration: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
        />
      </div>

      {/* 4. MOTION INTENSITY */}
      <div className="space-y-2 bg-[#11141A] p-3 rounded-xl border border-white/[0.08]">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Motion Intensity</span>
          </span>
          <span className="font-mono text-white font-bold">
            {transition.intensityPercent || 75}% ({transition.intensity || 'Medium'})
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={transition.intensityPercent || 75}
          onChange={(e) => {
            const val = Number(e.target.value);
            const lvl = val > 75 ? 'High' : val > 45 ? 'Medium' : 'Low';
            updateTransition(transition.id, {
              intensityPercent: val,
              intensity: lvl,
            });
          }}
          className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
        />
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {(['Low', 'Medium', 'High'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                const p = lvl === 'High' ? 90 : lvl === 'Medium' ? 65 : 35;
                updateTransition(transition.id, { intensity: lvl, intensityPercent: p });
              }}
              className={`py-1 rounded-lg text-xs font-medium transition ${
                transition.intensity === lvl
                  ? 'bg-[#7C5CFF] text-white font-bold'
                  : 'bg-[#0D0F14] text-[#9CA3AF] hover:text-white border border-white/[0.06]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 5. DIRECTION & EASING */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1 bg-[#11141A] p-2.5 rounded-xl border border-white/[0.08]">
          <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Direction</label>
          <select
            value={transition.direction || 'in'}
            onChange={(e) =>
              updateTransition(transition.id, { direction: e.target.value as TransitionDirection })
            }
            className="w-full bg-[#0D0F14] border border-white/[0.1] text-white text-[11px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="in">Inward Zoom</option>
            <option value="out">Outward Pull</option>
            <option value="left">Left Push</option>
            <option value="right">Right Push</option>
            <option value="up">Swipe Up</option>
            <option value="down">Swipe Down</option>
            <option value="clockwise">Clockwise</option>
            <option value="counterclockwise">Counter-CW</option>
          </select>
        </div>

        <div className="space-y-1 bg-[#11141A] p-2.5 rounded-xl border border-white/[0.08]">
          <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Easing</label>
          <select
            value={transition.easing || 'ease_in_out'}
            onChange={(e) =>
              updateTransition(transition.id, { easing: e.target.value as TransitionEasing })
            }
            className="w-full bg-[#0D0F14] border border-white/[0.1] text-white text-[11px] px-2 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="ease_in_out">Ease In Out</option>
            <option value="exponential">Exponential</option>
            <option value="cubic_in">Cubic In</option>
            <option value="spring">Spring Dampened</option>
            <option value="linear">Linear</option>
          </select>
        </div>
      </div>

      {/* 6. LAYER STACKING CHECKLIST */}
      <div className="space-y-2 bg-[#11141A] p-3 rounded-xl border border-white/[0.08]">
        <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Transition Layer Stacking</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: 'scale', label: 'Scale Zoom' },
            { key: 'motionBlur', label: 'Motion Blur' },
            { key: 'lightFlash', label: 'Light Flash' },
            { key: 'directional', label: 'Directional' },
            { key: 'rotation', label: 'Rotation' },
            { key: 'colorDiffusion', label: 'Color Diffuse' },
          ].map((item) => {
            const isEnabled = (transition.layers as any)?.[item.key] ?? true;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleLayer(item.key as any)}
                className={`px-2 py-1.5 rounded-lg text-left text-[10px] flex items-center justify-between transition border ${
                  isEnabled
                    ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-white font-medium'
                    : 'bg-[#0D0F14] border-white/[0.05] text-[#667085]'
                }`}
              >
                <span>{item.label}</span>
                <span className={isEnabled ? 'text-[#7C5CFF]' : 'text-transparent'}>✓</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
