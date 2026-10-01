'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Smartphone,
  Tv,
  Square,
  Sparkles,
} from 'lucide-react';
import { AspectRatio } from '@/types';

export default function PreviewControls() {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    totalDuration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    timelineClips,
    aspectRatio,
    setAspectRatio,
  } = useEditor();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handlePrevClip = () => {
    if (timelineClips.length === 0) {
      seek(0);
      return;
    }
    const currentClip = timelineClips.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    if (!currentClip) {
      seek(0);
      return;
    }
    const curIdx = timelineClips.indexOf(currentClip);
    if (curIdx > 0) {
      seek(timelineClips[curIdx - 1].start);
    } else {
      seek(0);
    }
  };

  const handleNextClip = () => {
    if (timelineClips.length === 0) return;
    const currentClip = timelineClips.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    if (!currentClip) return;
    const curIdx = timelineClips.indexOf(currentClip);
    if (curIdx < timelineClips.length - 1) {
      seek(timelineClips[curIdx + 1].start);
    } else {
      seek(totalDuration);
    }
  };

  const aspectRatios: { id: AspectRatio; label: string; icon: React.ElementType }[] = [
    { id: '9:16', label: '9:16', icon: Smartphone },
    { id: '16:9', label: '16:9', icon: Tv },
    { id: '1:1', label: '1:1', icon: Square },
    { id: '4:5', label: '4:5', icon: Smartphone },
  ];

  return (
    <div className="w-full bg-[#0D0F14] border-t border-white/[0.07] px-4 py-2.5 flex flex-col gap-2 shrink-0 select-none">
      {/* Scrubber Progress Bar */}
      <div className="w-full flex items-center gap-3">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            seek(clickRatio * totalDuration);
          }}
          className="relative flex-1 h-1.5 hover:h-2.5 bg-white/[0.08] rounded-full cursor-pointer transition-all duration-150 group"
        >
          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] rounded-full relative"
            style={{
              width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
            }}
          >
            {/* Scrubber Knob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#7C5CFF] opacity-0 group-hover:opacity-100 transition" />
          </div>

          {/* Clip Split Markers on Scrubber */}
          {timelineClips.map((clip, idx) => {
            if (idx === 0) return null;
            const posPercent = (clip.start / totalDuration) * 100;
            return (
              <div
                key={clip.id}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40 pointer-events-none"
                style={{ left: `${posPercent}%` }}
              />
            );
          })}
        </div>

        {/* Timecode */}
        <div className="font-mono text-xs text-[#F5F7FA] font-medium shrink-0 bg-[#11141A] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
          <span className="text-[#7C5CFF] font-bold">{formatTime(currentTime)}</span>
          <span className="text-[#667085] mx-1">/</span>
          <span className="text-[#9CA3AF]">{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between">
        {/* Left: Aspect Ratio Selector */}
        <div className="flex items-center gap-1 bg-[#11141A] p-0.5 rounded-lg border border-white/[0.06]">
          {aspectRatios.map((item) => {
            const Icon = item.icon;
            const isSelected = aspectRatio === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
                  isSelected
                    ? 'bg-[#7C5CFF] text-white shadow-sm'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Play / Pause & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevClip}
            title="Previous Clip"
            className="p-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white flex items-center justify-center shadow-lg shadow-[#7C5CFF]/30 hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNextClip}
            title="Next Clip"
            className="p-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => seek(0)}
            title="Restart playback"
            className="p-2 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Audio Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={toggleMute}
              className="p-1.5 text-[#9CA3AF] hover:text-white transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#EF4444]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) toggleMute();
              }}
              className="w-16 h-1 bg-white/20 accent-[#7C5CFF] rounded-lg cursor-pointer opacity-70 group-hover:opacity-100 transition"
            />
          </div>

          {/* Fullscreen simulation */}
          <button
            onClick={() => {
              const el = document.getElementById('preview-canvas-container');
              if (el) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  el.requestFullscreen();
                }
              }
            }}
            title="Fullscreen Preview"
            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
