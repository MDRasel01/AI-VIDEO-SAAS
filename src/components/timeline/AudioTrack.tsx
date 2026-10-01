'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface AudioTrackProps {
  pixelPerSecond: number;
}

export default function AudioTrack({ pixelPerSecond }: AudioTrackProps) {
  const {
    timelineAudio,
    totalDuration,
    isAudioTrackMuted,
    toggleAudioTrackMute,
    seek,
  } = useEditor();

  const widthPx = Math.max((timelineAudio.duration || totalDuration || 14) * pixelPerSecond, 300);

  return (
    <div className="relative h-10 w-full overflow-hidden select-none">
      <div
        onClick={() => seek(0)}
        style={{ width: `${widthPx}px` }}
        className={`h-full rounded-xl border px-3 py-1 flex items-center gap-3 relative cursor-pointer shadow-md overflow-hidden transition-all ${
          isAudioTrackMuted
            ? 'bg-[#1E293B] border-white/10 opacity-60'
            : 'bg-gradient-to-r from-[#065F46] via-[#047857] to-[#059669] border-[#10B981]/50 hover:border-[#10B981]'
        }`}
      >
        {/* Track Label Badge & Quick Mute */}
        <div className="flex items-center gap-2 text-white font-medium text-xs shrink-0 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAudioTrackMute();
            }}
            title={isAudioTrackMuted ? 'Unmute Audio Track' : 'Mute Audio Track'}
            className="p-1 rounded-lg hover:bg-black/30 text-white transition"
          >
            {isAudioTrackMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-tight truncate max-w-[140px]">
              {timelineAudio.title || 'Background Music.mp3'}
            </span>
            <span className="text-[8px] font-mono text-emerald-200">
              {timelineAudio.bpm || 120} BPM • {timelineAudio.volume ?? 80}% Vol
            </span>
          </div>
        </div>

        {/* Dynamic Waveform Visualization Lines */}
        <div className="flex-1 h-full flex items-center gap-[2px] opacity-85 overflow-hidden">
          {Array.from({ length: 180 }).map((_, idx) => {
            const height =
              timelineAudio.waveformData[idx % timelineAudio.waveformData.length] ||
              Math.sin(idx * 0.2) * 35 + 45;
            return (
              <div
                key={idx}
                className={`w-1 rounded-full shrink-0 transition-all ${
                  isAudioTrackMuted ? 'bg-slate-500/50' : 'bg-white/90'
                }`}
                style={{
                  height: `${isAudioTrackMuted ? 4 : Math.max((height / 100) * 22, 3)}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
