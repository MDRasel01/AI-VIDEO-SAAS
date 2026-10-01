'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  X,
  Sparkles,
  Check,
  Type,
  Shuffle,
  Wand2,
  Play,
  ArrowRight,
} from 'lucide-react';
import { TextTemplate, TransitionItem, EffectItem } from '@/types';

interface BestCombinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestText: { template: TextTemplate; score: number } | null;
  bestTransition: { transition: TransitionItem; score: number } | null;
  bestEffect: { effect: EffectItem; score: number } | null;
  overallScore: number;
}

export default function BestCombinationModal({
  isOpen,
  onClose,
  bestText,
  bestTransition,
  bestEffect,
  overallScore,
}: BestCombinationModalProps) {
  const {
    applyTextTemplate,
    timelineTransitions,
    updateTransition,
    timelineClips,
    updateClip,
    pushSnapshot,
    seek,
    setIsPlaying,
  } = useEditor();

  const [isApplied, setIsApplied] = useState(false);

  if (!isOpen) return null;

  const handleApplyAll = () => {
    pushSnapshot();

    // 1. Apply Best Text Template
    if (bestText) {
      applyTextTemplate(bestText.template, true);
    }

    // 2. Apply Best Transition
    if (bestTransition) {
      if (timelineTransitions.length > 0) {
        timelineTransitions.forEach((t) => {
          updateTransition(t.id, {
            name: bestTransition.transition.name,
            type: bestTransition.transition.type,
            category: bestTransition.transition.category,
            duration: bestTransition.transition.duration || 0.4,
          });
        });
      }
    }

    // 3. Apply Best Effect
    if (bestEffect && timelineClips.length > 0) {
      const keyMap: Record<string, keyof (typeof timelineClips)[0]['effects']> = {
        slow_zoom: 'slowZoom',
        film_grain: 'filmGrain',
        anamorphic_flare: 'lightLeak',
        soft_glow: 'glow',
        motion_blur: 'motionBlur',
        shake_impact: 'shake',
        vignette: 'vignette',
        dynamic_pan: 'pan',
        speed_ramp: 'speedRamp',
      };
      const targetKey = keyMap[bestEffect.effect.type];
      if (targetKey) {
        timelineClips.forEach((c) => {
          updateClip(c.id, {
            effects: {
              ...c.effects,
              [targetKey]: true,
            },
          });
        });
      }
    }

    setIsApplied(true);
    seek(0);
    setIsPlaying(true);
    setTimeout(() => {
      setIsApplied(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F14]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="text-sm font-bold text-white">Apply Best Combination Package</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#7C5CFF]/15 via-[#5B8CFF]/10 to-transparent border border-[#7C5CFF]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase">
                Estimated Overall Editing Fit
              </span>
              <h4 className="text-xl font-black text-white">{overallScore}% Optimal</h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-bold">
              AI Optimized
            </span>
          </div>

          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            The engine has selected the top-rated text style, transition blend, and visual effect tuned for your current video canvas and pacing:
          </p>

          <div className="space-y-2.5">
            {/* Best Text */}
            {bestText && (
              <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center shrink-0">
                    <Type className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block">Text Style</span>
                    <span className="text-xs font-bold text-white">{bestText.template.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                  {bestText.score}%
                </span>
              </div>
            )}

            {/* Best Transition */}
            {bestTransition && (
              <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#5B8CFF]/20 text-[#5B8CFF] flex items-center justify-center shrink-0">
                    <Shuffle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block">Transition</span>
                    <span className="text-xs font-bold text-white">{bestTransition.transition.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                  {bestTransition.score}%
                </span>
              </div>
            )}

            {/* Best Effect */}
            {bestEffect && (
              <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block">Visual Effect</span>
                    <span className="text-xs font-bold text-white">{bestEffect.effect.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                  {bestEffect.score}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-5 border-t border-white/[0.08] flex items-center justify-between bg-[#0D0F14]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyAll}
            disabled={isApplied}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/30 hover:brightness-110 transition flex items-center gap-1.5"
          >
            {isApplied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Applied to Timeline!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Confirm & Apply Combination</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
