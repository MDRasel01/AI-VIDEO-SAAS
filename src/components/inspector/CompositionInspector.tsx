'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Layers,
  LayoutTemplate,
  Clock,
  Film,
  Shuffle,
  Wand2,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function CompositionInspector() {
  const {
    selectedTemplate,
    selectedPlatform,
    totalDuration,
    videos,
    timelineClips,
    timelineTransitions,
    runAutoCompose,
    isAutoComposed,
  } = useEditor();

  const totalEffectsCount =
    selectedTemplate.effects.length +
    timelineClips.reduce(
      (acc, c) => acc + Object.values(c.effects).filter(Boolean).length,
      0
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#7C5CFF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Composition Overview
          </h3>
        </div>
        <p className="text-[11px] text-[#667085] mt-0.5">
          Global template rules and project parameters
        </p>
      </div>

      {/* Primary Specs Card */}
      <div className="rounded-xl bg-[#0D0F14] border border-white/[0.07] p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9CA3AF] flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-[#7C5CFF]" />
            Template
          </span>
          <span className="font-semibold text-white">{selectedTemplate.name}</span>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-white/[0.05] pt-2">
          <span className="text-[#9CA3AF] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#5B8CFF]" />
            Aspect Ratio
          </span>
          <span className="font-mono text-white bg-white/[0.06] px-1.5 py-0.2 rounded">
            {selectedPlatform.format} ({selectedPlatform.badge})
          </span>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-white/[0.05] pt-2">
          <span className="text-[#9CA3AF] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
            Total Duration
          </span>
          <span className="font-mono text-white font-bold">
            {totalDuration.toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-white/[0.05] pt-2">
          <span className="text-[#9CA3AF] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            Pacing Profile
          </span>
          <span className="text-[#F59E0B] font-medium">
            {selectedTemplate.pacingProfile}
          </span>
        </div>
      </div>

      {/* Assembly Stats Counter */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[#0D0F14] border border-white/[0.06] p-2 text-center">
          <div className="text-[10px] text-[#667085] flex items-center justify-center gap-1">
            <Film className="w-3 h-3 text-[#5B8CFF]" />
            Clips
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {timelineClips.length || videos.length}
          </div>
        </div>

        <div className="rounded-lg bg-[#0D0F14] border border-white/[0.06] p-2 text-center">
          <div className="text-[10px] text-[#667085] flex items-center justify-center gap-1">
            <Shuffle className="w-3 h-3 text-[#7C5CFF]" />
            Transitions
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {timelineTransitions.length || selectedTemplate.transitions.length}
          </div>
        </div>

        <div className="rounded-lg bg-[#0D0F14] border border-white/[0.06] p-2 text-center">
          <div className="text-[10px] text-[#667085] flex items-center justify-center gap-1">
            <Wand2 className="w-3 h-3 text-[#22C55E]" />
            Effects
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {totalEffectsCount}
          </div>
        </div>
      </div>

      {/* Automated Rules Summary */}
      <div className="rounded-xl bg-[#0D0F14] border border-white/[0.07] p-3 space-y-2">
        <div className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#7C5CFF]" />
          <span>Active Automated Rules</span>
        </div>

        <ul className="text-[11px] text-[#9CA3AF] space-y-1.5 pl-3 list-disc">
          <li>Automated beat-matched duration cuts (2.5s - 4.5s)</li>
          <li>Smart {selectedTemplate.transitions[0]} injected at cuts</li>
          <li>Auto Ken Burns slow zoom scale drift enabled</li>
          <li>Synchronized soundtrack: {selectedTemplate.musicStyle.title}</li>
        </ul>
      </div>

      {/* Auto Compose Re-run Button */}
      <button
        onClick={runAutoCompose}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/20 hover:brightness-110 transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>RE-COMPOSE TIMELINE</span>
      </button>
    </div>
  );
}
