'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { AspectRatio } from '@/types';
import InteractiveCanvasText from './InteractiveCanvasText';
import IdBadge from '@/components/ui/IdBadge';
import { effectRegistry, EffectRenderContext } from '@/services/effectEngine';

export default function PreviewCard() {
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
    setAspectRatio,
    volume,
    isMuted,
    toggleMute,
    seek,
  } = useEditor();

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);

  // Active clip based on currentTime
  const activeClipIndex = useMemo(() => {
    if (timelineClips.length === 0) return 0;
    const index = timelineClips.findIndex(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    return index !== -1 ? index : 0;
  }, [timelineClips, currentTime]);

  const activeClip = useMemo(() => {
    return timelineClips[activeClipIndex] || timelineClips[0] || null;
  }, [timelineClips, activeClipIndex]);

  // Transition cut overlap detection
  const activeTransition = useMemo(() => {
    return timelineTransitions.find((t) => {
      const half = t.duration / 2;
      return currentTime >= t.position - half && currentTime <= t.position + half;
    }) || null;
  }, [timelineTransitions, currentTime]);

  const prevTransitionClip = useMemo(() => {
    if (!activeTransition) return null;
    return timelineClips.find((c) => c.id === activeTransition.fromClipId) || timelineClips[0] || null;
  }, [activeTransition, timelineClips]);

  const nextTransitionClip = useMemo(() => {
    if (!activeTransition) return null;
    return timelineClips.find((c) => c.id === activeTransition.toClipId) || timelineClips[1] || timelineClips[0] || null;
  }, [activeTransition, timelineClips]);

  const transitionProgress = useMemo(() => {
    if (!activeTransition) return 0;
    const start = activeTransition.position - activeTransition.duration / 2;
    return Math.max(0, Math.min(1, (currentTime - start) / activeTransition.duration));
  }, [activeTransition, currentTime]);

  const activeAsset = useMemo(() => {
    if (previewAssetId) {
      const found = videos.find((v) => v.id === previewAssetId);
      if (found) return found;
    }
    return videos[0] || null;
  }, [videos, previewAssetId]);

  const activeVideoUrl = activeClip?.url || activeAsset?.url || '';
  const activeThumbnail = activeClip?.thumbnail || activeAsset?.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80';

  // Local clip time
  const targetClipTime = useMemo(() => {
    if (activeClip) {
      return Math.max(0, (currentTime - activeClip.start) * (activeClip.speed || 1.0) + (activeClip.clipIn || 0));
    }
    return currentTime % Math.max(activeAsset?.duration || 14, 0.1);
  }, [activeClip, activeAsset, currentTime]);

  // Reset error state when source changes
  useEffect(() => {
    setVideoError(false);
  }, [activeVideoUrl]);

  // Sync video play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoUrl) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.debug('Autoplay or user-gesture requirement notice:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, activeVideoUrl]);

  // Sync video time smoothly without frame hitching
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoUrl) return;
    const diff = Math.abs(video.currentTime - targetClipTime);
    if (!isPlaying || diff > 0.65) {
      try {
        video.currentTime = targetClipTime;
      } catch (e) {}
    }
  }, [targetClipTime, isPlaying, activeVideoUrl]);

  // Sync volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted || volume === 0;
    video.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume, isMuted]);

  // Active Clip Real-Time Progress with Smooth Boundary Continuous Curves
  const clipProgress = activeClip && activeClip.duration > 0
    ? Math.max(0, Math.min(1, (currentTime - activeClip.start) / activeClip.duration))
    : 0;

  // Before / After A/B Comparison Mode state (Raw vs Effected video)
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  // Exact Deterministic Effect Context
  const effectContext: EffectRenderContext = useMemo(() => ({
    currentTime,
    clipProgress,
    clipDuration: activeClip?.duration || 4.0,
    isPlaying,
    resolution: {
      width: aspectRatio === '16:9' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080,
      height: aspectRatio === '16:9' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920,
    },
    aspectRatio,
    seed: 42,
  }), [currentTime, clipProgress, activeClip?.duration, isPlaying, aspectRatio]);

  // Evaluate Active Effects using Central Deterministic Registry
  const evaluatedEffects = useMemo(() => {
    if (isComparisonMode) {
      return effectRegistry.evaluateClipEffects({}, effectContext);
    }
    return effectRegistry.evaluateClipEffects(activeClip?.effects, effectContext);
  }, [activeClip?.effects, effectContext, isComparisonMode]);

  // Synchronize Playback Rate (Speed multiplier + dynamic speed ramp) & Pitch Preservation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const baseSpeed = activeClip?.speed || 1.0;
    const effectiveRate = Math.max(0.1, Math.min(baseSpeed * evaluatedEffects.playbackRateMultiplier, 16.0));
    video.playbackRate = effectiveRate;
    const preserve = activeClip?.preservePitch ?? true;
    if ('preservesPitch' in video) (video as any).preservesPitch = preserve;
    if ('mozPreservesPitch' in video) (video as any).mozPreservesPitch = preserve;
    if ('webkitPreservesPitch' in video) (video as any).webkitPreservesPitch = preserve;
  }, [activeClip?.speed, evaluatedEffects.playbackRateMultiplier, activeClip?.preservePitch]);

  const formatTimecode = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * (totalDuration || 14));
  };

  const aspectOptions: { label: string; ratio: AspectRatio }[] = [
    { label: '9:16 (TikTok/Reels)', ratio: '9:16' },
    { label: '16:9 (YouTube)', ratio: '16:9' },
    { label: '1:1 (Square)', ratio: '1:1' },
    { label: '4:5 (Portrait)', ratio: '4:5' },
  ];

  // Active transition visual styles with C2 Continuous Smoothstep Hand-off
  const transType = (activeTransition?.type || '').toLowerCase();
  const transName = (activeTransition?.name || '').toLowerCase();
  const isFlash = transType.includes('flash') || transName.includes('flash') || transType.includes('light') || transType.includes('flare');
  const isZoom = transType.includes('zoom') || transName.includes('zoom');
  const isWhip = transType.includes('whip') || transType.includes('swipe') || transType.includes('push') || transType.includes('slide');
  const isSpin = transType.includes('spin') || transType.includes('rotate') || transType.includes('cube') || transType.includes('3d');
  const isGlitch = transType.includes('glitch') || transType.includes('pixel');
  const isBlur = transType.includes('blur') || transType.includes('defocus');

  // Smoothstep easing (0 to 1 with zero velocity at endpoints to prevent harsh jerks)
  const p = transitionProgress;
  const easeP = p * p * (3 - 2 * p);
  const sineBell = Math.sin(p * Math.PI);

  // Dynamic Outgoing / Incoming Layer Computations during Active Transitions
  let outgoingTransform = 'translate(0px, 0px) scale(1)';
  let incomingTransform = 'translate(0px, 0px) scale(1)';
  let outgoingOpacity = 1;
  let incomingOpacity = 1;
  let outgoingFilter = '';
  let incomingFilter = '';

  if (activeTransition) {
    if (isWhip) {
      const dir = activeTransition.direction || (transName.includes('right') ? 'right' : transName.includes('up') ? 'up' : transName.includes('down') ? 'down' : 'left');
      if (dir === 'right') {
        outgoingTransform = `translateX(${(easeP * 100).toFixed(2)}%)`;
        incomingTransform = `translateX(${(-(1 - easeP) * 100).toFixed(2)}%)`;
      } else if (dir === 'up') {
        outgoingTransform = `translateY(${(-easeP * 100).toFixed(2)}%)`;
        incomingTransform = `translateY(${((1 - easeP) * 100).toFixed(2)}%)`;
      } else if (dir === 'down') {
        outgoingTransform = `translateY(${(easeP * 100).toFixed(2)}%)`;
        incomingTransform = `translateY(${(-(1 - easeP) * 100).toFixed(2)}%)`;
      } else {
        outgoingTransform = `translateX(${(-easeP * 100).toFixed(2)}%)`;
        incomingTransform = `translateX(${((1 - easeP) * 100).toFixed(2)}%)`;
      }
    } else if (isZoom) {
      const isZoomOut = transType.includes('out') || transName.includes('out');
      if (isZoomOut) {
        outgoingTransform = `scale(${(1 - easeP * 0.35).toFixed(3)})`;
        incomingTransform = `scale(${(1.35 - easeP * 0.35).toFixed(3)})`;
      } else {
        outgoingTransform = `scale(${(1 + easeP * 0.4).toFixed(3)})`;
        incomingTransform = `scale(${(0.7 + easeP * 0.3).toFixed(3)})`;
      }
      outgoingOpacity = Math.max(0, 1 - easeP);
      incomingOpacity = easeP;
      if (isBlur) {
        outgoingFilter = `blur(${(sineBell * 6).toFixed(1)}px)`;
        incomingFilter = `blur(${(sineBell * 6).toFixed(1)}px)`;
      }
    } else if (isSpin) {
      outgoingTransform = `rotate(${(easeP * 180).toFixed(1)}deg) scale(${(1 - easeP * 0.25).toFixed(3)})`;
      incomingTransform = `rotate(${((easeP - 1) * 180).toFixed(1)}deg) scale(${(0.75 + easeP * 0.25).toFixed(3)})`;
      outgoingOpacity = Math.max(0, 1 - easeP);
      incomingOpacity = easeP;
    } else if (isGlitch) {
      const glitchX = (sineBell * Math.sin(currentTime * 60) * 8).toFixed(1);
      const glitchY = (sineBell * Math.cos(currentTime * 50) * 4).toFixed(1);
      const glitchSkew = (sineBell * 4).toFixed(1);
      outgoingTransform = `translate(${glitchX}px, ${glitchY}px) skewX(${glitchSkew}deg)`;
      incomingTransform = `translate(${-glitchX}px, 0px)`;
      outgoingOpacity = Math.max(0, 1 - easeP);
      incomingOpacity = easeP;
    } else if (isBlur) {
      outgoingOpacity = Math.max(0, 1 - easeP);
      incomingOpacity = easeP;
      outgoingFilter = `blur(${(sineBell * 8).toFixed(1)}px)`;
      incomingFilter = `blur(${(sineBell * 8).toFixed(1)}px)`;
    } else {
      outgoingOpacity = Math.max(0, 1 - easeP);
      incomingOpacity = easeP;
    }
  }

  const flashOpacity = isFlash ? sineBell * 0.85 : 0;

  return (
    <div id="box-preview-card" className="bg-[#0E131F] border border-white/[0.08] rounded-2xl p-4 flex flex-col h-full select-none justify-between">
      {/* Top Header */}
      <div id="preview-card-header" className="flex items-center justify-between mb-3 relative">
        <div id="preview-title-group" className="flex items-center gap-2">
          <div id="preview-step-badge" className="w-5 h-5 rounded-md bg-[#7C3AED] flex items-center justify-center text-white text-[11px] font-bold">
            2.
          </div>
          <span id="preview-title-text" className="text-xs font-bold text-white tracking-wide">
            Preview
          </span>
          <IdBadge id="box-preview-card" />
        </div>

        {/* Right Header Actions: Before/After Comparison & Aspect Ratio Dropdown */}
        <div id="preview-header-actions-group" className="flex items-center gap-2">
          {/* Before / After FX Comparison Toggle */}
          <button
            id="btn-preview-before-after-toggle"
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            title={isComparisonMode ? 'Viewing Raw Video (Before) - Click to view with Effects (After)' : 'Viewing With Effects (After) - Click to view Raw Video (Before)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
              isComparisonMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm ring-1 ring-amber-500/40'
                : 'bg-[#080B11] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            {isComparisonMode ? (
              <>
                <EyeOff className="w-3 h-3 text-amber-400" />
                <span>Before (Raw)</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-[#5B8CFF]" />
                <span>After (FX)</span>
              </>
            )}
          </button>

          {/* Aspect Ratio Dropdown */}
          <div id="preview-aspect-ratio-selector" className="relative">
            <button
              id="btn-aspect-ratio-dropdown"
              onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#080B11] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <span>
                {aspectOptions.find((o) => o.ratio === aspectRatio)?.label || '9:16 (TikTok/Reels)'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {isRatioDropdownOpen && (
              <div id="preview-aspect-ratio-menu" className="absolute right-0 mt-1 w-44 bg-[#0E131F] border border-white/[0.12] rounded-xl shadow-2xl p-1 z-50">
              {aspectOptions.map((opt) => (
                <button
                  key={opt.ratio}
                  id={`btn-select-aspect-${opt.ratio.replace(':', '-')}`}
                  onClick={() => {
                    setAspectRatio(opt.ratio);
                    setIsRatioDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                    aspectRatio === opt.ratio
                      ? 'bg-[#3B82F6] text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Main Video Player Container (Inside Realistic Mobile Phone Frame) */}
      <div id="box-video-player-viewport" className="flex-1 flex items-center justify-center overflow-hidden min-h-0 py-1">
        {/* Realistic Mobile Device Frame */}
        <div
          id="box-mobile-device-chassis"
          className="relative h-full max-h-[460px] aspect-[9/18.5] rounded-[38px] bg-[#080B11] p-1.5 border-[4.5px] border-[#222838] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Status Bar & Dynamic Island */}
          <div className="absolute top-1.5 left-0 right-0 px-4 h-5 z-40 flex items-center justify-between text-[9px] font-mono font-medium text-white/85 pointer-events-none select-none">
            <span className="font-semibold tracking-tight text-[10px]">9:41</span>

            {/* Dynamic Island Capsule */}
            <div className="w-16 h-3.5 bg-black rounded-full border border-white/10 flex items-center justify-between px-2 shadow-sm">
              <span className="w-1 h-1 rounded-full bg-[#1E293B]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A] ring-1 ring-blue-500/40" />
            </div>

            {/* Signal & Battery Status */}
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold">5G</span>
              <div className="w-3.5 h-2 border border-white/70 rounded-[2px] p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-[0.5px]" />
              </div>
            </div>
          </div>

          {/* Inner Screen Canvas */}
          <div
            id="box-video-canvas-container"
            ref={videoContainerRef}
            onClick={togglePlay}
            className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex items-center justify-center cursor-pointer group select-none shadow-inner"
          >
            {/* Visual Media Layer with Real-Time Transition Shaders & Effects */}
            <div id="video-media-layer" className="absolute inset-0 overflow-hidden bg-black">
              {/* When Active Transition is in progress, render dual-layer seamless composite */}
              {activeTransition && prevTransitionClip && nextTransitionClip ? (
                <div id="video-transition-composite-container" className="w-full h-full relative overflow-hidden">
                  {/* Outgoing Clip Layer (Clip A) */}
                  <div
                    id="video-outgoing-clip-layer"
                    className="absolute inset-0 overflow-hidden will-change-transform"
                    style={{
                      transform: outgoingTransform,
                      opacity: outgoingOpacity,
                      filter: outgoingFilter || evaluatedEffects.filterString || undefined,
                    }}
                  >
                    <img
                      src={prevTransitionClip.thumbnail || activeThumbnail}
                      alt={prevTransitionClip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Incoming Clip Layer (Clip B) */}
                  <div
                    id="video-incoming-clip-layer"
                    className="absolute inset-0 overflow-hidden will-change-transform"
                    style={{
                      transform: incomingTransform,
                      opacity: incomingOpacity,
                      filter: incomingFilter || evaluatedEffects.filterString || undefined,
                    }}
                  >
                    <img
                      src={nextTransitionClip.thumbnail || activeThumbnail}
                      alt={nextTransitionClip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                /* Primary Single-Clip Feed */
                <div
                  id="video-primary-feed-container"
                  className="w-full h-full relative will-change-transform"
                  style={{
                    transform: evaluatedEffects.transformString,
                    filter: evaluatedEffects.filterString || undefined,
                  }}
                >
                  {activeVideoUrl && !videoError ? (
                    <video
                      id="html5-video-player-element"
                      ref={videoRef}
                      src={activeVideoUrl}
                      poster={activeThumbnail}
                      playsInline
                      preload="auto"
                      muted={isMuted || volume === 0}
                      className="w-full h-full object-cover"
                      onError={() => setVideoError(true)}
                    />
                  ) : (
                    <img
                      id="video-fallback-poster-img"
                      src={activeThumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {/* Transition: Light Flash Flare Overlay */}
              {flashOpacity > 0 && (
                <div
                  id="video-flash-overlay-layer"
                  className="absolute inset-0 bg-white pointer-events-none"
                  style={{ opacity: flashOpacity }}
                />
              )}

              {/* Dynamic Overlays from Deterministic Effect Engine */}
              {!isComparisonMode &&
                evaluatedEffects.overlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    id={`video-effect-overlay-${overlay.id}`}
                    className={`absolute inset-0 pointer-events-none ${
                      overlay.mixBlendMode === 'screen'
                        ? 'mix-blend-screen'
                        : overlay.mixBlendMode === 'overlay'
                        ? 'mix-blend-overlay'
                        : overlay.mixBlendMode === 'soft-light'
                        ? 'mix-blend-soft-light'
                        : ''
                    }`}
                    style={{
                      opacity: overlay.opacity,
                      ...overlay.cssStyle,
                    }}
                  >
                    {/* Dynamic Anamorphic Prism Flares */}
                    {overlay.type === 'light_leak' && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/40 via-purple-500/25 to-transparent blur-2xl" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-16 bg-gradient-to-r from-transparent via-cyan-400/35 via-blue-500/40 via-amber-300/30 to-transparent blur-md"
                          style={{
                            transform: `translateY(-50%) translateX(${(Math.sin(clipProgress * Math.PI) * 40 - 20).toFixed(1)}px)`,
                          }}
                        />
                      </div>
                    )}

                    {/* Diffusion Glow Bloom */}
                    {overlay.type === 'glow_bloom' && (
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,230,180,0.25)_0%,rgba(160,190,255,0.1)_55%,transparent_80%)] blur-sm" />
                    )}

                    {/* 4-Stop Cinema Vignette */}
                    {overlay.type === 'vignette' && (
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.5)_70%,rgba(0,0,0,0.88)_100%)]" />
                    )}

                    {/* Speed Ramp Kinetic Shutter Lines */}
                    {overlay.type === 'speed_ramp_lines' && (
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.5)_50%,transparent_100%)] bg-[length:14px_100%]" />
                    )}
                  </div>
                ))}

              {/* Subtle Player Depth Vignette */}
              <div id="video-player-subtle-vignette" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />
            </div>

            {/* Movable & Resizable Interactive Canvas Text Overlay */}
            <InteractiveCanvasText containerRef={videoContainerRef} />
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/60 rounded-full z-40 pointer-events-none" />
        </div>
      </div>

      {/* Bottom Player Controls Bar (Docked at the Bottom) */}
      <div
        id="box-player-controls-bar"
        onClick={(e) => e.stopPropagation()}
        className="mt-3 bg-[#080B11] border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl flex flex-col gap-2 select-none"
      >
        {/* Scrubber Progress Bar */}
        <div
          id="player-scrubber-track"
          onClick={handleScrubberClick}
          className="relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer group/scrubber flex items-center"
        >
          <div
            id="player-scrubber-fill"
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#3B82F6] rounded-full relative transition-all duration-75"
          >
            {/* Playhead Knob */}
            <div id="player-scrubber-knob" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md ring-2 ring-[#3B82F6] group-hover/scrubber:scale-125 transition-transform" />
          </div>
        </div>

        {/* Controls Row */}
        <div id="player-controls-buttons-row" className="flex items-center justify-between text-white text-xs font-mono">
          {/* Left: Play / Pause */}
          <button
            id="btn-player-play-pause"
            onClick={togglePlay}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center transition text-white active:scale-95 shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            )}
          </button>

          {/* Center: Timecode */}
          <span id="player-timecode-display" className="text-[11px] text-slate-300 font-medium tracking-wider">
            {formatTimecode(currentTime)} / {formatTimecode(totalDuration || 14)}
          </span>

          {/* Right: Volume & Fullscreen */}
          <div id="player-volume-fullscreen-group" className="flex items-center gap-1.5">
            <button
              id="btn-player-toggle-mute"
              onClick={toggleMute}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-slate-300 hover:text-white active:scale-95"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              id="btn-player-fullscreen"
              onClick={() => {
                const el = videoContainerRef.current;
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else if (el) {
                  el.requestFullscreen();
                }
              }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-slate-300 hover:text-white active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
