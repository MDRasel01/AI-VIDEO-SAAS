'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Sparkles, Film, LayoutTemplate, Layers, CheckCircle2 } from 'lucide-react';

export default function AutoComposeHero() {
  const {
    videos,
    selectedTemplate,
    selectedPlatform,
    runAutoCompose,
    isAutoComposed,
    setActiveTab,
  } = useEditor();

  if (videos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl my-3 p-4 rounded-xl bg-[#11141A]/90 border border-dashed border-white/[0.12] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Start with your video clips</h4>
            <p className="text-xs text-[#9CA3AF]">
              Upload 2 or more short clips to unlock one-click automated composition.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('media')}
          className="px-3.5 py-2 rounded-lg bg-[#151820] hover:bg-[#7C5CFF] text-white text-xs font-semibold border border-white/[0.12] hover:border-[#7C5CFF] transition shadow-md"
        >
          + Upload Clips
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#11141A] via-[#151820] to-[#11141A] border border-[#7C5CFF]/40 shadow-[0_4px_30px_rgba(124,92,255,0.15)] p-4 sm:p-5 my-2.5 transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-64 h-24 bg-[#7C5CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-24 bg-[#5B8CFF]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-[#7C5CFF] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {isAutoComposed ? 'Composition Ready & Synced' : 'Ready to create your video'}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-[#F5F7FA] font-medium pt-0.5">
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <Film className="w-3.5 h-3.5 text-[#5B8CFF]" />
              {videos.length} {videos.length === 1 ? 'video clip' : 'video clips'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <LayoutTemplate className="w-3.5 h-3.5 text-[#7C5CFF]" />
              {selectedTemplate.name} template
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
              {selectedPlatform.format} ({selectedPlatform.badge})
            </span>
          </div>

          <p className="text-xs text-[#9CA3AF]">
            Automatically merge clips, apply transitions, visual pacing, effects & kinetic text.
          </p>
        </div>

        {/* Right HERO Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={runAutoCompose}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] via-[#6B46FF] to-[#5B8CFF] text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(124,92,255,0.45)] hover:shadow-[0_0_35px_rgba(124,92,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform duration-300" />
            <span>⚡ AUTO COMPOSE</span>
            {isAutoComposed && <CheckCircle2 className="w-4 h-4 text-white ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
