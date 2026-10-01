'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Heart, MessageCircle, Bookmark, Share2, Music2, Plus } from 'lucide-react';

export default function SafeZoneOverlay() {
  const { selectedPlatform, showSafeZones } = useEditor();

  if (!showSafeZones) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
      {/* Top Safe Area (Header / Sound Title) */}
      <div className="flex items-center justify-between opacity-80">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white border border-white/10">
          <Music2 className="w-3 h-3 text-[#7C5CFF]" />
          <span>Original Audio - Trending Sound</span>
        </div>
        <div className="text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded">
          {selectedPlatform.badge} UI Zone
        </div>
      </div>

      {/* Center Safe Guideline Box */}
      <div className="absolute inset-x-8 top-16 bottom-28 border border-dashed border-[#7C5CFF]/60 rounded-xl flex items-center justify-center">
        <span className="text-[10px] font-medium text-[#7C5CFF] bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
          Safe Visual Content Zone
        </span>
      </div>

      {/* Right Social Action Icons Simulation (TikTok / Reels) */}
      {selectedPlatform.format === '9:16' && (
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white opacity-85">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#EF4444] flex items-center justify-center text-[10px] font-bold">
              +
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Heart className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-medium">124k</span>
          </div>

          <div className="flex flex-col items-center">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-medium">1.8k</span>
          </div>

          <div className="flex flex-col items-center">
            <Bookmark className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-medium">8.2k</span>
          </div>

          <div className="flex flex-col items-center">
            <Share2 className="w-5 h-5 fill-white" />
            <span className="text-[9px] font-medium">Share</span>
          </div>
        </div>
      )}

      {/* Bottom Profile & Caption UI Zone */}
      <div className="space-y-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 rounded-b-xl opacity-90 max-w-[80%]">
        <div className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>@brand_official</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]" />
        </div>
        <p className="text-[11px] text-white/90 line-clamp-2 leading-tight">
          Automated video showcase created with FrameFlow Engine #viral #product
        </p>
      </div>
    </div>
  );
}
