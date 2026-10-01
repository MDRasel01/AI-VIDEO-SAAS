'use client';

import React from 'react';
import { Template } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Sparkles,
  Shuffle,
  Wand2,
  Type,
  Music,
  Clock,
  Smartphone,
  Check,
  Zap,
} from 'lucide-react';

interface TemplateDetailsProps {
  template: Template;
  onClose?: () => void;
}

export default function TemplateDetails({ template, onClose }: TemplateDetailsProps) {
  const { setSelectedTemplate, runAutoCompose, videos } = useEditor();

  const handleUseTemplate = () => {
    setSelectedTemplate(template);
    if (videos.length > 0) {
      runAutoCompose();
    }
  };

  return (
    <div className="rounded-xl bg-[#11141A] border border-[#7C5CFF]/30 p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{template.name}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
              {template.format}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">{template.description}</p>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-[#0D0F14] border border-white/[0.06] space-y-1">
          <div className="flex items-center gap-1.5 text-[#667085] text-[11px]">
            <Clock className="w-3 h-3 text-[#5B8CFF]" />
            <span>Target Duration</span>
          </div>
          <div className="font-semibold text-white">{template.recommendedDuration}</div>
        </div>

        <div className="p-2 rounded-lg bg-[#0D0F14] border border-white/[0.06] space-y-1">
          <div className="flex items-center gap-1.5 text-[#667085] text-[11px]">
            <Zap className="w-3 h-3 text-[#22C55E]" />
            <span>Pacing Rhythm</span>
          </div>
          <div className="font-semibold text-white">{template.pacingProfile}</div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2.5 text-xs">
        {/* Transitions */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9CA3AF]">
            <Shuffle className="w-3 h-3 text-[#7C5CFF]" />
            <span>Automated Transitions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.transitions.map((t, idx) => (
              <span
                key={idx}
                className="bg-white/[0.04] text-[#F5F7FA] border border-white/[0.08] px-2 py-0.5 rounded-md text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9CA3AF]">
            <Wand2 className="w-3 h-3 text-[#5B8CFF]" />
            <span>Visual Effects</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.effects.map((e, idx) => (
              <span
                key={idx}
                className="bg-white/[0.04] text-[#F5F7FA] border border-white/[0.08] px-2 py-0.5 rounded-md text-[11px]"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Text Style */}
        <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-[#22C55E]" />
            <div>
              <div className="text-[11px] text-[#667085]">Text Preset</div>
              <div className="font-semibold text-white text-xs">
                {template.textStyle.preset}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[#9CA3AF] bg-white/[0.06] px-2 py-0.5 rounded font-mono">
            {template.textStyle.animation}
          </span>
        </div>

        {/* Music */}
        <div className="p-2.5 rounded-lg bg-[#0D0F14] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-[#F59E0B]" />
            <div>
              <div className="text-[11px] text-[#667085]">Soundtrack</div>
              <div className="font-semibold text-white text-xs">
                {template.musicStyle.title}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded font-mono">
            {template.musicStyle.bpm} BPM
          </span>
        </div>
      </div>

      {/* CTA: USE TEMPLATE */}
      <button
        onClick={handleUseTemplate}
        className="w-full h-10 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/30 hover:brightness-110 active:scale-[0.98] transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>USE THIS TEMPLATE</span>
      </button>
    </div>
  );
}
