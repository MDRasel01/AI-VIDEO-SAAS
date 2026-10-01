'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip as ITimelineClip, EffectItem } from '@/types';
import { useEditor } from '@/context/EditorContext';
import { MoreVertical, GripVertical, Trash2, Wand2, Sparkles } from 'lucide-react';

interface TimelineClipProps {
  clip: ITimelineClip;
  isSelected: boolean;
  onSelect: () => void;
  pixelPerSecond: number;
}

export default function TimelineClip({
  clip,
  isSelected,
  onSelect,
  pixelPerSecond,
}: TimelineClipProps) {
  const { seek, trimClip, deleteClip, updateClip, pushSnapshot, lockedTrackIds } = useEditor();
  const isLocked = lockedTrackIds.includes('video_track');

  const [isHovered, setIsHovered] = useState(false);
  const [isEffectDragOver, setIsEffectDragOver] = useState(false);
  const widthPx = Math.max(clip.duration * pixelPerSecond, 70);
  const leftPx = clip.start * pixelPerSecond;

  // Trim Drag Tracking Ref
  const trimRef = useRef<{
    mode: 'trim-left' | 'trim-right' | null;
    startX: number;
    initialStart: number;
    initialEnd: number;
    initialDuration: number;
  }>({
    mode: null,
    startX: 0,
    initialStart: 0,
    initialEnd: 0,
    initialDuration: 0,
  });

  const handleTrimStart = (e: React.PointerEvent, mode: 'trim-left' | 'trim-right') => {
    if (isLocked) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    onSelect();
    trimRef.current = {
      mode,
      startX: e.clientX,
      initialStart: clip.start,
      initialEnd: clip.end,
      initialDuration: clip.duration,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!trimRef.current.mode) return;
      const deltaPx = e.clientX - trimRef.current.startX;
      const deltaSec = deltaPx / pixelPerSecond;

      if (trimRef.current.mode === 'trim-left') {
        const newStart = Math.max(
          0,
          Math.min(
            trimRef.current.initialEnd - 0.4,
            trimRef.current.initialStart + deltaSec
          )
        );
        trimClip(clip.id, parseFloat(newStart.toFixed(2)), trimRef.current.initialEnd);
      } else if (trimRef.current.mode === 'trim-right') {
        const newEnd = Math.max(
          trimRef.current.initialStart + 0.4,
          trimRef.current.initialEnd + deltaSec
        );
        trimClip(clip.id, trimRef.current.initialStart, parseFloat(newEnd.toFixed(2)));
      }
    };

    const handlePointerUp = () => {
      trimRef.current.mode = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [clip.id, pixelPerSecond, trimClip]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    seek(clip.start);
  };

  // Effect Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isEffectDragOver) setIsEffectDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEffectDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEffectDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'EFFECT' && data.effect) {
        const eff: EffectItem = data.effect;
        const keyMap: Record<string, keyof ITimelineClip['effects']> = {
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

        const targetKey = keyMap[eff.type] || (eff.type as any);
        if (targetKey) {
          pushSnapshot();
          updateClip(clip.id, {
            effects: {
              ...clip.effects,
              [targetKey]: true,
            },
          });
          onSelect();
          seek(clip.start);
        }
      }
    } catch (err) {
      console.error('Error dropping effect on clip:', err);
    }
  };

  // Active effect list
  const activeEffectsList = Object.entries(clip.effects || {})
    .filter(([_, val]) => Boolean(val))
    .map(([key]) => key);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      className={`absolute top-1 bottom-1 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 select-none group border ${
        isEffectDragOver
          ? 'ring-2 ring-[#10B981] border-[#10B981] shadow-[0_0_24px_rgba(16,185,129,0.8)] z-30 scale-[1.02]'
          : isSelected
          ? 'ring-2 ring-[#3B82F6] border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.45)] z-20'
          : 'border-white/15 hover:border-white/35 bg-[#0E131F] z-10'
      }`}
    >
      {/* Background Media Thumbnail */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={clip.thumbnail}
          alt={clip.name}
          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-300"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {isEffectDragOver && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 text-[10px] font-bold animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin mb-0.5" />
            <span>APPLY EFFECT</span>
          </div>
        )}
      </div>

      {/* Left Trim Handle */}
      {!isLocked && (isSelected || isHovered) && (
        <div
          onPointerDown={(e) => handleTrimStart(e, 'trim-left')}
          title="Drag to trim clip start"
          className="absolute left-0 top-0 bottom-0 w-3 rounded-l-xl bg-black/60 hover:bg-[#3B82F6] flex items-center justify-center cursor-ew-resize transition-colors z-30"
        >
          <div className="w-0.5 h-4 bg-white/90 rounded" />
        </div>
      )}

      {/* Top/Bottom Details Row */}
      <div className="relative z-10 p-2 flex flex-col justify-between h-full text-white pointer-events-none">
        {/* Header with name, effect badges and quick delete */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs font-bold truncate drop-shadow-md">
              {clip.name}
            </span>
            {activeEffectsList.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  updateClip(clip.id, { effects: {} });
                }}
                title="Click to remove all effects from this clip"
                className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-red-500/20 text-emerald-300 hover:text-red-300 border border-emerald-500/30 hover:border-red-500/40 shrink-0 flex items-center gap-1 transition pointer-events-auto cursor-pointer group/fxbadge"
              >
                <Wand2 className="w-2.5 h-2.5 text-emerald-400 group-hover/fxbadge:hidden" />
                <Trash2 className="w-2.5 h-2.5 text-red-400 hidden group-hover/fxbadge:inline" />
                <span>{activeEffectsList.length} fx</span>
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteClip(clip.id);
            }}
            title="Delete Clip"
            className="text-white/60 hover:text-red-400 p-0.5 rounded hover:bg-black/40 transition pointer-events-auto opacity-0 group-hover:opacity-100 shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom details row: Speed badge + Active Effect names with delete button + Duration */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-hidden">
            {clip.speed !== 1.0 && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 ${
                  clip.speed > 1.0
                    ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300/50'
                    : 'bg-emerald-400 text-slate-950 ring-1 ring-emerald-300/50'
                }`}
              >
                ⚡ {clip.speed.toFixed(2).replace(/\.00$/, '')}x
              </span>
            )}
            {activeEffectsList.map((effKey) => (
              <span
                key={effKey}
                className="text-[8px] font-mono px-1 py-0.5 rounded bg-black/75 text-slate-200 border border-white/15 flex items-center gap-1 pointer-events-auto shadow-sm"
              >
                <span className="truncate max-w-[50px]">{effKey}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateClip(clip.id, {
                      effects: {
                        ...clip.effects,
                        [effKey]: false,
                      },
                    });
                  }}
                  title={`Remove ${effKey} from this clip`}
                  className="w-3 h-3 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center text-[8px] transition font-bold leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white shrink-0">
            {clip.duration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Right Trim Handle */}
      {!isLocked && (isSelected || isHovered) && (
        <div
          onPointerDown={(e) => handleTrimStart(e, 'trim-right')}
          title="Drag to trim clip end"
          className="absolute right-0 top-0 bottom-0 w-3 rounded-r-xl bg-black/60 hover:bg-[#3B82F6] flex items-center justify-center cursor-ew-resize transition-colors z-30"
        >
          <div className="w-0.5 h-4 bg-white/90 rounded" />
        </div>
      )}
    </div>
  );
}
