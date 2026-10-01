'use client';

import React, { useState } from 'react';
import { TimelineClip, TimelineTransition, TransitionItem } from '@/types';
import { useEditor } from '@/context/EditorContext';
import { calculateSafeDuration } from '@/services/transitionIntelligence';
import { Sparkles, Plus } from 'lucide-react';

interface TransitionDropZoneProps {
  fromClip: TimelineClip;
  toClip: TimelineClip;
  position: number;
  pixelPerSecond: number;
  existingTransition?: TimelineTransition | null;
}

export default function TransitionDropZone({
  fromClip,
  toClip,
  position,
  pixelPerSecond,
  existingTransition,
}: TransitionDropZoneProps) {
  const {
    timelineTransitions,
    setTimelineTransitions,
    setSelectedTransitionId,
    pushSnapshot,
    seek,
    setIsPlaying,
    selectedTemplate,
    selectedPlatform,
  } = useEditor();

  const [isDragOver, setIsDragOver] = useState(false);

  const leftPx = position * pixelPerSecond;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'TRANSITION' && data.transition) {
        const transItem: TransitionItem = data.transition;
        const variation: string | undefined = data.variation;

        pushSnapshot();

        const safeDur = calculateSafeDuration(
          fromClip,
          toClip,
          selectedTemplate,
          selectedPlatform
        );

        if (existingTransition) {
          // Update existing transition
          setTimelineTransitions((prev) =>
            prev.map((t) => {
              if (t.id === existingTransition.id) {
                return {
                  ...t,
                  name: variation || transItem.name,
                  type: transItem.type,
                  category: transItem.category,
                  duration: safeDur,
                  variationName: variation,
                  direction: transItem.defaultDirection || 'in',
                  easing: transItem.defaultEasing || 'ease_in_out',
                  zoomAmount: transItem.defaultZoom || 18,
                  motionBlurAmount: transItem.defaultMotionBlur || 20,
                  intensityPercent: transItem.defaultIntensity || 75,
                };
              }
              return t;
            })
          );
          setSelectedTransitionId(existingTransition.id);
        } else {
          // Insert new transition
          const newTransId = `trans-${Date.now()}`;
          const newTrans: TimelineTransition = {
            id: newTransId,
            fromClipId: fromClip.id,
            toClipId: toClip.id,
            position,
            name: variation || transItem.name,
            type: transItem.type,
            category: transItem.category,
            duration: safeDur,
            intensity: 'Medium',
            variationName: variation,
            direction: transItem.defaultDirection || 'in',
            easing: transItem.defaultEasing || 'ease_in_out',
            zoomAmount: transItem.defaultZoom || 18,
            motionBlurAmount: transItem.defaultMotionBlur || 20,
            intensityPercent: transItem.defaultIntensity || 75,
          };

          setTimelineTransitions((prev) => [...prev, newTrans]);
          setSelectedTransitionId(newTransId);
        }

        // Seek near cut and preview
        seek(Math.max(0, position - 0.5));
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error dropping transition:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        left: `${leftPx}px`,
      }}
      className={`absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center transition-all duration-200 z-25 pointer-events-auto ${
        isDragOver
          ? 'w-24 z-50'
          : 'w-6 hover:w-10'
      }`}
    >
      {isDragOver ? (
        <div className="h-full w-full bg-gradient-to-r from-[#2563EB]/90 to-[#7C3AED]/90 backdrop-blur-md rounded-xl border-2 border-white shadow-[0_0_24px_rgba(37,99,235,0.8)] flex flex-col items-center justify-center text-white text-[9px] font-bold animate-pulse px-1 select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span className="truncate">DROP HERE</span>
        </div>
      ) : (
        !existingTransition && (
          <div className="w-4 h-4 rounded-full bg-white/10 hover:bg-[#3B82F6] hover:scale-125 transition-all flex items-center justify-center text-white text-[9px] opacity-0 hover:opacity-100 shadow-md">
            <Plus className="w-2.5 h-2.5" />
          </div>
        )
      )}
    </div>
  );
}
