'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Sparkles,
  CheckCircle,
  Loader2,
  Layers,
  Wand2,
  Film,
  Type,
  Shuffle,
} from 'lucide-react';

export default function AutoComposeModal() {
  const {
    isAutoComposeModalOpen,
    autoComposeStep,
    autoComposeProgress,
    selectedTemplate,
    videos,
  } = useEditor();

  if (!isAutoComposeModalOpen) return null;

  const steps = [
    { label: 'Preparing & indexing media clips', threshold: 20, icon: Film },
    { label: 'Analyzing clip pacing & rhythm', threshold: 40, icon: Layers },
    { label: 'Generating sequenced timeline tracks', threshold: 60, icon: Wand2 },
    {
      label: `Injecting template transitions (${selectedTemplate.transitions.slice(0, 2).join(', ')})`,
      threshold: 75,
      icon: Shuffle,
    },
    {
      label: `Applying effects (${selectedTemplate.effects.slice(0, 2).join(', ')})`,
      threshold: 90,
      icon: Sparkles,
    },
    {
      label: `Formatting kinetic typography & music sync`,
      threshold: 98,
      icon: Type,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#11141A] border border-[#7C5CFF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(124,92,255,0.25)] relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#7C5CFF]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#5B8CFF] flex items-center justify-center mx-auto shadow-lg shadow-[#7C5CFF]/30">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Auto Composing Video
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Merging {videos.length} clips with &quot;{selectedTemplate.name}&quot; rules
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#F5F7FA] truncate max-w-[260px]">
              {autoComposeStep}
            </span>
            <span className="font-mono text-[#7C5CFF] font-bold">
              {autoComposeProgress}%
            </span>
          </div>

          <div className="h-2 w-full bg-[#151820] rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-[#7C5CFF] via-[#5B8CFF] to-[#22C55E] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${autoComposeProgress}%` }}
            />
          </div>
        </div>

        {/* Pipeline Step List */}
        <div className="space-y-2.5 bg-[#0D0F14] rounded-xl p-3.5 border border-white/[0.06]">
          {steps.map((step, idx) => {
            const isCompleted = autoComposeProgress >= step.threshold;
            const isCurrent =
              autoComposeProgress < step.threshold &&
              (idx === 0 || autoComposeProgress >= steps[idx - 1].threshold);
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between text-xs transition-opacity duration-200 ${
                  isCompleted
                    ? 'text-[#F5F7FA]'
                    : isCurrent
                    ? 'text-[#7C5CFF] font-medium'
                    : 'text-[#667085] opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <StepIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{step.label}</span>
                </div>

                <div className="shrink-0 ml-2">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#7C5CFF] animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-[#667085]">
            Rendering transitions, beat synchronization & automated cuts
          </span>
        </div>
      </div>
    </div>
  );
}
