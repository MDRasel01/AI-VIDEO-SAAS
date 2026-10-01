'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useEditor } from '@/context/EditorContext';
import SafeZoneOverlay from './SafeZoneOverlay';
import InteractiveCanvasText from './InteractiveCanvasText';
import { Play, Sparkles, Wand2, Type, Volume2, VolumeX, Maximize2, AlertCircle } from 'lucide-react';
import { TimelineClip } from '@/types';

export default function VideoPreview() {
  const {
    videos,
    previewAssetId,
    timelineClips,
    timelineTransitions,
    timelineText,
    currentTime,
    totalDuration,
    isPlaying,
    togglePlay,
    aspectRatio,
    selectedTemplate,
    volume,
    isMuted,
    toggleMute,
    isAutoComposed,
  } = useEditor();

  const videoRef = useRef<HTMLVideoElement>(null);
  const monitorContainerRef = useRef<HTMLDivElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Find the clip currently active on timeline, or fallback to selected/first video asset
  const activeTimelineClip = useMemo<TimelineClip | null>(() => {
    if (timelineClips.length > 0) {
      const match = timelineClips.find(
        (c) => currentTime >= c.start && currentTime <= c.end
      );
      return match || timelineClips[0];
    }
    return null;
  }, [timelineClips, currentTime]);

  // Active video asset when timeline is not auto-composed
  const activePreviewAsset = useMemo(() => {
    if (previewAssetId) {
      const found = videos.find((v) => v.id === previewAssetId);
      if (found) return found;
    }
    return videos[0] || null;
  }, [videos, previewAssetId]);

  // Determine active video source URL and thumbnail
  const activeVideoUrl = useMemo(() => {
    if (activeTimelineClip) {
      if (activeTimelineClip.url) return activeTimelineClip.url;
      const matchingAsset = videos.find((v) => v.id === activeTimelineClip.assetId);
      return matchingAsset?.url || '';
    }
    return activePreviewAsset?.url || '';
  }, [activeTimelineClip, activePreviewAsset, videos]);

  const previewThumbnail = activeTimelineClip
    ? activeTimelineClip.thumbnail
    : activePreviewAsset?.thumbnail || '';

  const previewName = activeTimelineClip
    ? activeTimelineClip.name
    : activePreviewAsset?.name || 'Preview';

  const previewColor = activeTimelineClip
    ? activeTimelineClip.accentColor
    : activePreviewAsset?.accentColor || '#7C5CFF';

  // Calculate target playback timestamp for the current active clip
  const targetClipTime = useMemo(() => {
    if (activeTimelineClip) {
      const localTime =
        (currentTime - activeTimelineClip.start) * (activeTimelineClip.speed || 1.0) +
        (activeTimelineClip.clipIn || 0);
      return Math.max(0, localTime);
    }
    if (activePreviewAsset) {
      return currentTime % Math.max(activePreviewAsset.duration || 5, 0.1);
    }
    return 0;
  }, [activeTimelineClip, activePreviewAsset, currentTime]);

  // Synchronize Play/Pause with HTML5 Video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoUrl) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy or interruption fallback
          console.debug('Video playback notice:', err);
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, activeVideoUrl]);

  // Synchronize video currentTime when scrubbing or advancing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoUrl) return;

    const diff = Math.abs(video.currentTime - targetClipTime);
    // If drift is noticeable (> 0.3s) or video paused, sync frame
    if (diff > 0.35 || !isPlaying) {
      try {
        video.currentTime = targetClipTime;
      } catch (e) {
        // Ignored if video not ready
      }
    }
  }, [targetClipTime, isPlaying, activeVideoUrl]);

  // Synchronize Volume & Mute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted || volume === 0;
    video.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume, isMuted]);

  // Synchronize Playback Rate / Speed Ramp & Pitch Preservation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const speed = activeTimelineClip?.speed || 1.0;
    video.playbackRate = Math.max(0.0625, Math.min(speed, 16.0));
    const preserve = activeTimelineClip?.preservePitch ?? true;
    if ('preservesPitch' in video) (video as any).preservesPitch = preserve;
    if ('mozPreservesPitch' in video) (video as any).mozPreservesPitch = preserve;
    if ('webkitPreservesPitch' in video) (video as any).webkitPreservesPitch = preserve;
  }, [activeTimelineClip?.speed, activeTimelineClip?.preservePitch]);

  // Reset error state when source changes
  useEffect(() => {
    setVideoError(false);
    setIsVideoLoaded(false);
  }, [activeVideoUrl]);

  // Check if we are currently inside a transition window
  const activeTransition = useMemo(() => {
    if (timelineTransitions.length === 0) return null;
    return (
      timelineTransitions.find(
        (t) =>
          currentTime >= t.position - t.duration / 2 &&
          currentTime <= t.position + t.duration / 2
      ) || null
    );
  }, [timelineTransitions, currentTime]);

  // Check if text overlay is active at current time
  const isTextActive = useMemo(() => {
    if (!timelineText) return false;
    return currentTime >= timelineText.start && currentTime <= timelineText.end;
  }, [timelineText, currentTime]);

  // Compute aspect ratio container classes
  const aspectClass = useMemo(() => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[58vh] max-w-[340px]';
      case '16:9':
        return 'aspect-[16/9] max-h-[55vh] max-w-[640px]';
      case '1:1':
        return 'aspect-square max-h-[55vh] max-w-[420px]';
      case '4:5':
        return 'aspect-[4/5] max-h-[58vh] max-w-[380px]';
      default:
        return 'aspect-[9/16] max-h-[58vh] max-w-[340px]';
    }
  }, [aspectRatio]);

  // Calculate Ken Burns / Slow Zoom animation factor
  const zoomFactor = useMemo(() => {
    if (!isPlaying || !activeTimelineClip?.effects?.slowZoom) return 1.0;
    const clipProgress =
      (currentTime - (activeTimelineClip.start || 0)) / (activeTimelineClip.duration || 4);
    return 1.0 + Math.min(Math.max(clipProgress * 0.1, 0), 0.12);
  }, [isPlaying, currentTime, activeTimelineClip]);

  const hasMedia = !!activeVideoUrl || !!previewThumbnail;

  const formatTimecode = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div
      id="preview-canvas-container"
      className="relative flex-1 flex flex-col items-center justify-center p-4 bg-[#050609] overflow-hidden select-none"
    >
      {/* Background Ambient Canvas Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div
          className="w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000"
          style={{
            backgroundColor: previewColor,
          }}
        />
      </div>

      {/* Main Video Monitor Frame */}
      <div
        ref={monitorContainerRef}
        onClick={togglePlay}
        className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden bg-[#0D0F14] border border-white/[0.12] shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 cursor-pointer group`}
      >
        {hasMedia ? (
          <>
            {/* Visual Media Layer: Real HTML5 Video Player */}
            <div
              className={`w-full h-full relative overflow-hidden transition-transform duration-300 ease-out ${
                activeTimelineClip?.effects?.shake && isPlaying ? 'animate-bounce' : ''
              }`}
              style={{
                transform: `scale(${zoomFactor})`,
              }}
            >
              {activeVideoUrl && !videoError ? (
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  poster={previewThumbnail}
                  playsInline
                  preload="auto"
                  muted={isMuted || volume === 0}
                  className={`w-full h-full ${
                    activeTimelineClip?.fit === 'contain' ? 'object-contain' : 'object-cover'
                  } transition-opacity duration-200`}
                  onLoadedData={() => setIsVideoLoaded(true)}
                  onError={() => {
                    console.warn('Video element playback fallback to thumbnail');
                    setVideoError(true);
                  }}
                />
              ) : (
                <img
                  src={previewThumbnail}
                  alt={previewName}
                  className={`w-full h-full ${
                    activeTimelineClip?.fit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                />
              )}

              {/* Dynamic Film Grain Effect Overlay */}
              {activeTimelineClip?.effects?.filmGrain && (
                <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
              )}

              {/* Vignette Effect */}
              {activeTimelineClip?.effects?.vignette && (
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />
              )}

              {/* Anamorphic Flare Streak */}
              {activeTimelineClip?.effects?.lightLeak && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-[#7C5CFF]/20 to-transparent mix-blend-screen" />
              )}

              {/* Soft Glow */}
              {activeTimelineClip?.effects?.glow && (
                <div className="absolute inset-0 pointer-events-none backdrop-brightness-110 backdrop-contrast-105" />
              )}
            </div>

            {/* Top Status & Timecode Overlay Bar */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'
                  }`}
                />
                <span className="text-white font-bold">{isPlaying ? 'LIVE' : 'PAUSE'}</span>
                <span className="text-[#9CA3AF]">•</span>
                <span className="text-[#9CA3AF]">{aspectRatio}</span>
              </div>

              <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#F5F7FA]">
                {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
              </div>
            </div>

            {/* Simulated Dynamic Transition Shutter / FX Overlays */}
            {activeTransition && (
              <div
                className={`absolute inset-0 pointer-events-none z-10 transition-all duration-150 flex items-center justify-center ${
                  activeTransition.type === 'light_flash'
                    ? 'bg-white/85 animate-pulse mix-blend-screen'
                    : activeTransition.type === 'glitch' || activeTransition.type === 'pixel_sorter'
                    ? 'bg-[#7C5CFF]/35 mix-blend-color-dodge backdrop-invert-30'
                    : activeTransition.type === 'anamorphic_flare'
                    ? 'bg-gradient-to-r from-transparent via-[#F59E0B]/40 to-transparent mix-blend-screen animate-pulse'
                    : activeTransition.type === 'spin_blur' || activeTransition.type === 'spin_zoom_vortex'
                    ? 'backdrop-blur-sm backdrop-brightness-125'
                    : activeTransition.type === 'whip_pan' || activeTransition.type === 'motion_blur_swipe'
                    ? 'backdrop-blur-xs bg-black/30'
                    : 'bg-black/40 backdrop-blur-xs'
                }`}
              >
                {/* Live Transition Cut HUD Tag during playback transition window */}
                <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#7C5CFF]/50 text-white shadow-2xl flex items-center gap-1.5 animate-in zoom-in-90 duration-150">
                  <Sparkles className="w-3 h-3 text-[#7C5CFF]" />
                  <span className="text-[10px] font-bold tracking-tight">
                    {activeTransition.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#22C55E] font-extrabold bg-[#22C55E]/15 px-1 py-0.2 rounded border border-[#22C55E]/30">
                    {activeTransition.compatibilityScore || 94}% Fit
                  </span>
                </div>
              </div>
            )}

            {/* Movable & Resizable Interactive Canvas Text Layer */}
            <InteractiveCanvasText containerRef={monitorContainerRef} />

            {/* Safe Zone Grid Overlay (TikTok / Reels bounds) */}
            <SafeZoneOverlay />

            {/* Play/Pause Hover Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Preview State */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#667085]">
            <Wand2 className="w-10 h-10 mb-2 text-[#7C5CFF] opacity-60" />
            <p className="text-xs font-semibold text-white">Preview Canvas</p>
            <p className="text-[11px] text-[#667085] mt-1 max-w-[200px]">
              Upload clips and select a template to preview automated playback
            </p>
          </div>
        )}
      </div>

      {/* Clip Name Bar below Monitor */}
      {hasMedia && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: previewColor }} />
          <span className="font-medium text-white max-w-[280px] truncate">{previewName}</span>
          {!isAutoComposed && (
            <span className="text-[10px] text-[#7C5CFF] bg-[#7C5CFF]/15 px-1.5 py-0.2 rounded border border-[#7C5CFF]/30">
              Raw Clip Preview
            </span>
          )}
        </div>
      )}
    </div>
  );
}

