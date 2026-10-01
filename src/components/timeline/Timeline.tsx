'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import TimelineToolbar from './TimelineToolbar';
import TimelineClip from './TimelineClip';
import TransitionMarker from './TransitionMarker';
import TransitionDropZone from './TransitionDropZone';
import TextTrack from './TextTrack';
import AudioTrack from './AudioTrack';
import {
  Film,
  Type,
  Music,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function Timeline() {
  const {
    timelineClips,
    timelineTransitions,
    timelineText,
    selectedClipId,
    setSelectedClipId,
    selectedTransitionId,
    setSelectedTransitionId,
    clearSelection,
    currentTime,
    totalDuration,
    seek,
    timelineZoom,
    isVideoTrackVisible,
    toggleVideoTrackVisible,
    isTextTrackVisible,
    toggleTextTrackVisible,
    isAudioTrackMuted,
    toggleAudioTrackMute,
    lockedTrackIds,
    toggleTrackLock,
  } = useEditor();

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Base scale: 60 pixels per second scaled by timelineZoom
  const pixelPerSecond = 60 * timelineZoom;
  const contentWidth = Math.max((totalDuration || 14) * pixelPerSecond + 120, 800);

  // Handle click on timeline background to seek
  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsScrubbing(true);
    handleSeekAtClientX(e.clientX);
  };

  const handleSeekAtClientX = (clientX: number) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left + timelineContainerRef.current.scrollLeft;
    const targetTime = Math.max(0, Math.min(clickX / pixelPerSecond, totalDuration || 14));
    seek(parseFloat(targetTime.toFixed(2)));
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isScrubbing) {
        handleSeekAtClientX(e.clientX);
      }
    };
    const handleGlobalPointerUp = () => {
      if (isScrubbing) setIsScrubbing(false);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isScrubbing, pixelPerSecond, totalDuration]);

  // Playhead position
  const playheadLeftPx = currentTime * pixelPerSecond;

  // Generate time ruler marks (0s, 2s, 4s, 6s, 8s, 10s, 12s, 14s...)
  const rulerMarks = [];
  const maxSeconds = Math.max(Math.ceil(totalDuration || 14) + 2, 16);
  for (let s = 0; s <= maxSeconds; s += 2) {
    rulerMarks.push({
      sec: s,
      label: `${s}s`,
      pos: s * pixelPerSecond,
    });
  }

  const isVideoLocked = lockedTrackIds.includes('video_track');
  const isTextLocked = lockedTrackIds.includes('text_track');
  const isAudioLocked = lockedTrackIds.includes('audio_track');

  return (
    <div id="box-timeline-panel" className="h-64 bg-[#080B11] border-t border-white/[0.08] flex flex-col shrink-0 select-none">
      {/* Top Toolbar */}
      <TimelineToolbar />

      {/* Main Tracks Workspace */}
      <div id="box-timeline-tracks-workspace" className="flex-1 flex overflow-hidden">
        {/* Left Track Header Column (Interactive Track Controls) */}
        <div id="box-timeline-track-headers" className="w-44 bg-[#080B11] border-r border-white/[0.08] flex flex-col justify-between py-1 shrink-0 z-20">
          {/* Ruler Spacer */}
          <div id="timeline-ruler-header-spacer" className="h-6 border-b border-white/[0.06] flex items-center justify-between px-3 text-[10px] font-mono text-slate-500">
            <span id="timeline-tracks-label">TRACKS</span>
            <span id="timeline-lockmute-label">LOCK / MUTE</span>
          </div>

          {/* Video Track Header */}
          <div id="track-header-video" className="h-16 flex items-center justify-between px-3 border-b border-white/[0.06] text-xs font-semibold text-white group">
            <div id="track-meta-video" className="flex items-center gap-2 overflow-hidden">
              <Film className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span id="track-title-video" className="truncate">Video Tracks</span>
                <span id="track-count-video" className="text-[9px] font-mono text-slate-400 font-normal">
                  {timelineClips.length} Clips
                </span>
              </div>
            </div>

            {/* Video Track Control Icons */}
            <div id="track-controls-video" className="flex items-center gap-1">
              <button
                id="btn-toggle-video-track-visibility"
                onClick={toggleVideoTrackVisible}
                title={isVideoTrackVisible ? 'Hide Video Track' : 'Show Video Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isVideoTrackVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
              </button>
              <button
                id="btn-toggle-video-track-lock"
                onClick={() => toggleTrackLock('video_track')}
                title={isVideoLocked ? 'Unlock Video Track' : 'Lock Video Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isVideoLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </div>
          </div>

          {/* Text Track Header */}
          <div id="track-header-text" className="h-11 flex items-center justify-between px-3 border-b border-white/[0.06] text-xs font-semibold text-white group">
            <div id="track-meta-text" className="flex items-center gap-2 overflow-hidden">
              <Type className="w-4 h-4 text-[#C084FC] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span id="track-title-text" className="truncate">Text Tracks</span>
                <span id="track-count-text" className="text-[9px] font-mono text-slate-400 font-normal">
                  {timelineText ? '1 Active' : '0 Text'}
                </span>
              </div>
            </div>

            {/* Text Track Control Icons */}
            <div id="track-controls-text" className="flex items-center gap-1">
              <button
                id="btn-toggle-text-track-visibility"
                onClick={toggleTextTrackVisible}
                title={isTextTrackVisible ? 'Hide Text Overlay Track' : 'Show Text Overlay Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isTextTrackVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
              </button>
              <button
                id="btn-toggle-text-track-lock"
                onClick={() => toggleTrackLock('text_track')}
                title={isTextLocked ? 'Unlock Text Track' : 'Lock Text Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isTextLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </div>
          </div>

          {/* Audio Track Header */}
          <div id="track-header-audio" className="h-11 flex items-center justify-between px-3 text-xs font-semibold text-white group">
            <div id="track-meta-audio" className="flex items-center gap-2 overflow-hidden">
              <Music className="w-4 h-4 text-[#34D399] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span id="track-title-audio" className="truncate">Audio Tracks</span>
                <span id="track-count-audio" className="text-[9px] font-mono text-slate-400 font-normal">
                  1 Track
                </span>
              </div>
            </div>

            {/* Audio Track Control Icons */}
            <div id="track-controls-audio" className="flex items-center gap-1">
              <button
                id="btn-toggle-audio-track-mute"
                onClick={toggleAudioTrackMute}
                title={isAudioTrackMuted ? 'Unmute Audio Track' : 'Mute Audio Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isAudioTrackMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                id="btn-toggle-audio-track-lock"
                onClick={() => toggleTrackLock('audio_track')}
                title={isAudioLocked ? 'Unlock Audio Track' : 'Lock Audio Track'}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                {isAudioLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Scrollable Timeline Canvas */}
        <div
          id="box-timeline-scrollable-canvas"
          ref={timelineContainerRef}
          onPointerDown={handleTimelinePointerDown}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#080B11] cursor-pointer custom-scrollbar"
        >
          {/* Tracks Canvas Container */}
          <div
            id="timeline-content-layer"
            style={{ width: `${contentWidth}px` }}
            className="h-full relative flex flex-col justify-between py-1"
          >
            {/* Time Ruler (0s, 2s, 4s, 6s, 8s, 10s, 12s, 14s) */}
            <div id="box-timeline-ruler" className="h-6 border-b border-white/[0.06] relative pointer-events-none">
              {rulerMarks.map((mark) => (
                <div
                  key={mark.sec}
                  id={`ruler-mark-${mark.sec}s`}
                  style={{ left: `${mark.pos}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-slate-400 -translate-x-1/2">
                    {mark.label}
                  </span>
                  <div className="w-[1px] h-1.5 bg-white/20" />
                </div>
              ))}
            </div>

            {/* Video Track (with inline clips, transition pills and drop zones) */}
            <div
              id="box-timeline-video-track"
              className={`h-16 relative border-b border-white/[0.06] bg-[#0E131F]/30 transition-opacity ${!isVideoTrackVisible ? 'opacity-30' : 'opacity-100'}`}
            >
              {timelineClips.map((clip) => (
                <TimelineClip
                  key={clip.id}
                  clip={clip}
                  isSelected={selectedClipId === clip.id}
                  onSelect={() => {
                    clearSelection();
                    setSelectedClipId(clip.id);
                  }}
                  pixelPerSecond={pixelPerSecond}
                />
              ))}

              {/* Interactive Transition Drop Zones between each adjacent clip */}
              {timelineClips.slice(0, -1).map((clip, idx) => {
                const nextClip = timelineClips[idx + 1];
                if (!nextClip) return null;
                const cutPos = clip.end;
                const existing = timelineTransitions.find(
                  (t) =>
                    (t.fromClipId === clip.id && t.toClipId === nextClip.id) ||
                    Math.abs(t.position - cutPos) < 0.4
                );
                return (
                  <TransitionDropZone
                    key={`dropzone-${clip.id}-${nextClip.id}`}
                    fromClip={clip}
                    toClip={nextClip}
                    position={cutPos}
                    pixelPerSecond={pixelPerSecond}
                    existingTransition={existing}
                  />
                );
              })}

              {/* Inline Transition Markers */}
              {timelineTransitions
                .filter((trans) => {
                  const hasFrom = timelineClips.some((c) => c.id === trans.fromClipId);
                  const hasTo = timelineClips.some((c) => c.id === trans.toClipId);
                  return Boolean(hasFrom && hasTo);
                })
                .map((trans) => (
                  <TransitionMarker
                    key={trans.id}
                    transition={trans}
                    isSelected={selectedTransitionId === trans.id}
                    onSelect={() => {
                      clearSelection();
                      setSelectedTransitionId(trans.id);
                    }}
                    pixelPerSecond={pixelPerSecond}
                  />
                ))}
            </div>

            {/* Text Track */}
            <div id="box-timeline-text-track" className="h-11 relative border-b border-white/[0.06] bg-[#0E131F]/20 px-1 flex items-center">
              <TextTrack pixelPerSecond={pixelPerSecond} />
            </div>

            {/* Audio Track */}
            <div id="box-timeline-audio-track" className="h-11 relative bg-[#0E131F]/30 px-1 flex items-center">
              <AudioTrack pixelPerSecond={pixelPerSecond} />
            </div>

            {/* Playhead Scrubber Line */}
            <div
              id="timeline-playhead-line"
              style={{ left: `${playheadLeftPx}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-[#3B82F6] z-30 pointer-events-none transition-all duration-75 shadow-[0_0_10px_#3B82F6]"
            >
              {/* Playhead Top Knob */}
              <div id="timeline-playhead-knob" className="w-3.5 h-3.5 bg-[#3B82F6] rounded-full -translate-x-[6px] -translate-y-0.5 shadow-md ring-2 ring-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
