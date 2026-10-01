'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Undo2,
  Redo2,
  Scissors,
  Trash2,
  Copy,
  Search,
  Maximize2,
} from 'lucide-react';
import IdBadge from '@/components/ui/IdBadge';

export default function TimelineToolbar() {
  const {
    timelineZoom,
    setTimelineZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelectedElement,
    duplicateSelectedElement,
    splitClip,
    selectedClipId,
    timelineClips,
    currentTime,
  } = useEditor();

  const activeTargetClipId = selectedClipId || (timelineClips[0]?.id ?? null);

  const handleSplit = () => {
    if (activeTargetClipId) {
      splitClip(activeTargetClipId, currentTime);
    }
  };

  const zoomPercent = Math.round(timelineZoom * 100);

  return (
    <div id="box-timeline-toolbar" className="h-10 bg-[#080B11] border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left Action Buttons: [ Undo ] [ Redo ] [ Split ] [ Delete ] [ Duplicate ] */}
      <div id="timeline-actions-group" className="flex items-center gap-1 sm:gap-2">
        <IdBadge id="box-timeline-panel" className="mr-1 hidden sm:inline-flex" />

        {/* Undo Button */}
        <button
          id="btn-timeline-undo"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z / Cmd+Z)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            canUndo
              ? 'text-white hover:bg-white/10 active:scale-95 text-slate-200'
              : 'text-slate-600 opacity-50 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        {/* Redo Button */}
        <button
          id="btn-timeline-redo"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Cmd+Shift+Z)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            canRedo
              ? 'text-white hover:bg-white/10 active:scale-95 text-slate-200'
              : 'text-slate-600 opacity-50 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>Redo</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Split Button */}
        <button
          id="btn-timeline-split"
          onClick={handleSplit}
          title="Split Clip at Playhead (S)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition"
        >
          <Scissors className="w-3.5 h-3.5 text-[#60A5FA]" />
          <span>Split</span>
        </button>

        {/* Delete Button */}
        <button
          id="btn-timeline-delete"
          onClick={deleteSelectedElement}
          title="Delete Selected Clip / Text / Transition (Delete)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>Delete</span>
        </button>

        {/* Duplicate Button */}
        <button
          id="btn-timeline-duplicate"
          onClick={duplicateSelectedElement}
          title="Duplicate Selected Element (Ctrl+D)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition"
        >
          <Copy className="w-3.5 h-3.5 text-emerald-400" />
          <span>Duplicate</span>
        </button>
      </div>

      {/* Right: Zoom Slider & Fit */}
      <div id="timeline-zoom-controls-group" className="flex items-center gap-2.5">
        <button
          id="btn-timeline-zoom-out"
          onClick={() => setTimelineZoom(Math.max(0.5, parseFloat((timelineZoom - 0.25).toFixed(2))))}
          className="text-slate-400 hover:text-white transition p-1"
          title="Zoom Out"
        >
          <Search className="w-3.5 h-3.5 -scale-x-100" />
        </button>

        {/* Zoom Slider */}
        <input
          id="timeline-zoom-slider"
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={timelineZoom}
          onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
          className="w-24 h-1 bg-[#1E293B] accent-[#7C3AED] rounded-lg appearance-none cursor-pointer"
        />

        <button
          id="btn-timeline-zoom-in"
          onClick={() => setTimelineZoom(Math.min(2.5, parseFloat((timelineZoom + 0.25).toFixed(2))))}
          className="text-slate-400 hover:text-white transition p-1"
          title="Zoom In"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <span id="timeline-zoom-percent-display" className="font-mono text-[10px] text-slate-400 min-w-[36px] text-center">
          {zoomPercent}%
        </span>

        {/* Fit Button */}
        <button
          id="btn-timeline-fit-view"
          onClick={() => setTimelineZoom(1)}
          className="px-3 py-1 rounded-lg bg-[#0E131F] border border-white/10 hover:border-white/20 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1"
        >
          <Maximize2 className="w-3 h-3 text-[#60A5FA]" />
          <span>Fit</span>
        </button>
      </div>
    </div>
  );
}
