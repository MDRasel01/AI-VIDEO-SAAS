'use client';

import React from 'react';
import { TimelineTransition } from '@/types';
import { useEditor } from '@/context/EditorContext';
import { Trash2, Sparkles, Plus, Minus } from 'lucide-react';

interface TransitionMarkerProps {
  transition: TimelineTransition;
  isSelected: boolean;
  onSelect: () => void;
  pixelPerSecond: number;
}

export default function TransitionMarker({
  transition,
  isSelected,
  onSelect,
  pixelPerSecond,
}: TransitionMarkerProps) {
  const {
    seek,
    setSelectedTransitionId,
    deleteTransition,
    updateTransition,
    lockedTrackIds,
  } = useEditor();

  const isLocked = lockedTrackIds.includes('video_track');
  const leftPx = transition.position * pixelPerSecond;
  const widthPx = Math.max(transition.duration * pixelPerSecond * 2, 52);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setSelectedTransitionId(transition.id);
    seek(transition.position);
  };

  const handleStepDuration = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (isLocked) return;
    const newDur = Math.max(0.1, Math.min(2.0, parseFloat((transition.duration + delta).toFixed(1))));
    updateTransition(transition.id, { duration: newDur });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      className="absolute top-1 bottom-1 -translate-x-1/2 flex items-center justify-center cursor-pointer z-20 group select-none"
    >
      <div
        className={`h-full w-full rounded-xl px-1.5 flex flex-col items-center justify-between py-1 transition-all duration-150 shadow-md relative ${
          isSelected
            ? 'bg-[#818CF8] text-white ring-2 ring-white shadow-lg shadow-indigo-500/50 z-30'
            : 'bg-[#1E293B]/90 hover:bg-[#818CF8]/80 text-slate-200 border border-white/20 hover:border-white/50'
        }`}
      >
        {/* Quick Delete Hover Button */}
        {!isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTransition(transition.id);
            }}
            title="Delete Transition"
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 shadow-md hover:scale-110 transition-all z-40"
          >
            ×
          </button>
        )}

        <div className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
          <span className="text-[10px] font-bold tracking-tight capitalize truncate max-w-[48px]">
            {transition.name}
          </span>
        </div>

        {/* Duration with quick + / - adjustment on hover */}
        <div className="flex items-center gap-0.5 font-mono text-[9px] opacity-90">
          <button
            onClick={(e) => handleStepDuration(e, -0.1)}
            title="Decrease duration (-0.1s)"
            className="w-3 h-3 rounded bg-black/40 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            -
          </button>
          <span>{transition.duration.toFixed(1)}s</span>
          <button
            onClick={(e) => handleStepDuration(e, 0.1)}
            title="Increase duration (+0.1s)"
            className="w-3 h-3 rounded bg-black/40 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
