'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Type, Plus, GripVertical } from 'lucide-react';

interface TextTrackProps {
  pixelPerSecond: number;
}

export default function TextTrack({ pixelPerSecond }: TextTrackProps) {
  const {
    timelineText,
    updateText,
    trimText,
    moveText,
    selectedTextId,
    setSelectedTextId,
    clearSelection,
    seek,
    totalDuration,
    applyTextTemplate,
    textTemplates,
    isTextTrackVisible,
    lockedTrackIds,
  } = useEditor();

  const isLocked = lockedTrackIds.includes('text_track');
  const isSelected = selectedTextId === 'text-1' || selectedTextId === timelineText?.id;

  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Drag / Trim State Tracking Ref
  const dragRef = useRef<{
    mode: 'move' | 'trim-left' | 'trim-right' | null;
    startX: number;
    initialStart: number;
    initialEnd: number;
    initialDuration: number;
  }>({
    mode: null,
    startX: 0,
    initialStart: 0,
    initialEnd: 6,
    initialDuration: 5.5,
  });

  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'trim-left' | 'trim-right'
  ) => {
    if (isLocked) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    setSelectedTextId('text-1');
    const start = timelineText?.start ?? 0.5;
    const duration = timelineText?.duration ?? 5.5;
    const end = timelineText?.end ?? start + duration;

    dragRef.current = {
      mode,
      startX: e.clientX,
      initialStart: start,
      initialEnd: end,
      initialDuration: duration,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current.mode) return;
      const deltaPx = e.clientX - dragRef.current.startX;
      const deltaSec = deltaPx / pixelPerSecond;

      const maxSec = totalDuration || 14;

      if (dragRef.current.mode === 'move') {
        const newStart = Math.max(
          0,
          Math.min(
            maxSec - dragRef.current.initialDuration,
            dragRef.current.initialStart + deltaSec
          )
        );
        moveText(parseFloat(newStart.toFixed(2)));
      } else if (dragRef.current.mode === 'trim-left') {
        const newStart = Math.max(
          0,
          Math.min(
            dragRef.current.initialEnd - 0.3,
            dragRef.current.initialStart + deltaSec
          )
        );
        trimText(parseFloat(newStart.toFixed(2)), dragRef.current.initialEnd);
      } else if (dragRef.current.mode === 'trim-right') {
        const newEnd = Math.max(
          dragRef.current.initialStart + 0.3,
          Math.min(maxSec, dragRef.current.initialEnd + deltaSec)
        );
        trimText(dragRef.current.initialStart, parseFloat(newEnd.toFixed(2)));
      }
    };

    const handlePointerUp = () => {
      dragRef.current.mode = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [pixelPerSecond, totalDuration, moveText, trimText]);

  if (!isTextTrackVisible) {
    return (
      <div className="h-full w-full flex items-center px-4 text-[11px] text-slate-500 italic">
        Text Track Hidden
      </div>
    );
  }

  if (!timelineText) {
    return (
      <div className="relative h-10 w-full flex items-center">
        <button
          onClick={() => {
            const def = textTemplates[0] || {
              id: 'tmpl-modern',
              name: 'Modern Minimal',
              category: 'modern',
              font: 'Inter',
              weight: '700',
              color: '#FFFFFF',
              animation: 'slide_up',
              sampleText: 'EXPLORE',
              sampleSubText: 'THE WORLD',
            };
            applyTextTemplate(def, false);
            setSelectedTextId('text-1');
          }}
          className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>+ Add Text Overlay</span>
        </button>
      </div>
    );
  }

  const startSec = timelineText.start ?? 0.5;
  const durationSec = timelineText.duration ?? 5.5;
  const leftPx = startSec * pixelPerSecond;
  const widthPx = Math.max(durationSec * pixelPerSecond, 70);

  return (
    <div ref={trackRef} className="relative h-10 w-full select-none">
      {/* Dynamic Text Overlay Block */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          clearSelection();
          setSelectedTextId('text-1');
          seek(startSec);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          left: `${leftPx}px`,
          width: `${widthPx}px`,
        }}
        className={`absolute top-0.5 bottom-0.5 rounded-xl border px-2 flex items-center justify-between cursor-pointer transition-all shadow-md group ${
          isSelected
            ? 'bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] border-white ring-2 ring-[#7C3AED] shadow-lg shadow-purple-500/30 z-20'
            : 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] border-white/20 hover:border-white/40 z-10'
        }`}
      >
        {/* Left Trim Handle */}
        {!isLocked && (isSelected || isHovered) && (
          <div
            onPointerDown={(e) => handlePointerDown(e, 'trim-left')}
            title="Drag to trim start time"
            className="absolute left-0 top-0 bottom-0 w-3 rounded-l-xl bg-black/50 hover:bg-[#3B82F6] flex items-center justify-center cursor-ew-resize transition-colors z-30"
          >
            <div className="w-0.5 h-3 bg-white/80 rounded" />
          </div>
        )}

        {/* Text Content Block (Draggable body) */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'move')}
          className="flex-1 flex items-center gap-2 overflow-hidden px-1.5 cursor-grab active:cursor-grabbing"
        >
          <Type className="w-3.5 h-3.5 text-white shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {timelineText.text || 'Explore'}
            </span>
            {timelineText.subText && (
              <span className="text-[8px] font-mono text-purple-200 uppercase tracking-widest truncate">
                {timelineText.subText}
              </span>
            )}
          </div>
        </div>

        {/* Time duration readout */}
        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/40 text-white/90 shrink-0 mr-1">
          {durationSec.toFixed(1)}s
        </span>

        {/* Right Trim Handle */}
        {!isLocked && (isSelected || isHovered) && (
          <div
            onPointerDown={(e) => handlePointerDown(e, 'trim-right')}
            title="Drag to trim end time"
            className="absolute right-0 top-0 bottom-0 w-3 rounded-r-xl bg-black/50 hover:bg-[#3B82F6] flex items-center justify-center cursor-ew-resize transition-colors z-30"
          >
            <div className="w-0.5 h-3 bg-white/80 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}
