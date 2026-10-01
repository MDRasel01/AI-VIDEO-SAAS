'use client';

import React from 'react';
import { TimelineClip } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Film,
  Scissors,
  Volume2,
  Gauge,
  Maximize2,
  ZoomIn,
  Sparkles,
  Sun,
  Flame,
  Wind,
  Trash2,
  Copy,
  CircleDot,
  MoveHorizontal,
  Vibrate,
} from 'lucide-react';

interface ClipInspectorProps {
  clip: TimelineClip;
}

export default function ClipInspector({ clip }: ClipInspectorProps) {
  const { updateClip, deleteClip, duplicateClip, splitClip, currentTime } = useEditor();

  const handleSpeedChange = (speed: number) => {
    updateClip(clip.id, { speed });
  };

  const currentSpeed = clip.speed || 1.0;
  const [speedInputValue, setSpeedInputValue] = React.useState(currentSpeed.toFixed(2));
  const [isEditingInput, setIsEditingInput] = React.useState(false);

  React.useEffect(() => {
    if (!isEditingInput) {
      setSpeedInputValue(currentSpeed.toFixed(2));
    }
  }, [currentSpeed, isEditingInput]);

  const sourceDuration =
    clip.sourceDuration ??
    (clip.clipOut > clip.clipIn ? clip.clipOut - clip.clipIn : clip.duration * currentSpeed);

  const presets = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];
  const matchingPreset = presets.find((p) => Math.abs(p - currentSpeed) < 0.01);

  const applySpeed = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    const clamped = Math.max(0.1, Math.min(10.0, parseFloat(val.toFixed(2))));
    updateClip(clip.id, { speed: clamped });
    setSpeedInputValue(clamped.toFixed(2));
  };

  const handleInputCommit = () => {
    setIsEditingInput(false);
    const cleaned = speedInputValue.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      applySpeed(parsed);
    } else {
      setSpeedInputValue(currentSpeed.toFixed(2));
    }
  };

  const handleStep = (delta: number) => {
    const nextVal = parseFloat((currentSpeed + delta).toFixed(2));
    applySpeed(nextVal);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep(e.shiftKey ? -0.25 : -0.05);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep(e.shiftKey ? 0.25 : 0.05);
    }
  };

  const handleResetSpeed = () => {
    applySpeed(1.0);
  };

  const togglePreservePitch = () => {
    const next = !(clip.preservePitch ?? true);
    updateClip(clip.id, { preservePitch: next });
  };

  const handleFitChange = (fit: 'cover' | 'contain') => {
    updateClip(clip.id, { fit });
  };

  const toggleEffect = (effectKey: keyof TimelineClip['effects']) => {
    updateClip(clip.id, {
      effects: {
        ...clip.effects,
        [effectKey]: !clip.effects[effectKey],
      },
    });
  };

  const effectToggles = [
    { key: 'slowZoom' as const, label: 'Slow Zoom (Ken Burns)', icon: ZoomIn },
    { key: 'pan' as const, label: 'Dynamic Pan', icon: MoveHorizontal },
    { key: 'lightLeak' as const, label: 'Anamorphic Lens Flare', icon: Sun },
    { key: 'filmGrain' as const, label: '35mm Film Grain', icon: Sparkles },
    { key: 'vignette' as const, label: 'Cinema Vignette', icon: CircleDot },
    { key: 'glow' as const, label: 'Diffusion Glow', icon: Flame },
    { key: 'motionBlur' as const, label: 'Motion Blur', icon: Wind },
    { key: 'shake' as const, label: 'Impact Shake', icon: Vibrate },
    { key: 'speedRamp' as const, label: 'Dynamic Speed Ramp', icon: Gauge },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2 min-w-0">
          <Film className="w-4 h-4 text-[#7C5CFF] shrink-0" />
          <h3 className="text-xs font-bold text-white truncate">
            {clip.name}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded shrink-0">
          {clip.duration.toFixed(1)}s
        </span>
      </div>

      {/* Trim Time Range */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center justify-between">
          <span>Clip Timing</span>
          <span className="text-[10px] text-[#667085] font-mono">
            {clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0D0F14] border border-white/[0.07] p-2 rounded-lg">
            <span className="text-[10px] text-[#667085] block">Start Time</span>
            <span className="text-xs font-mono font-semibold text-white">
              {clip.start.toFixed(2)}s
            </span>
          </div>
          <div className="bg-[#0D0F14] border border-white/[0.07] p-2 rounded-lg">
            <span className="text-[10px] text-[#667085] block">End Time</span>
            <span className="text-xs font-mono font-semibold text-white">
              {clip.end.toFixed(2)}s
            </span>
          </div>
        </div>
      </div>

      {/* Production-Grade Video Speed Control Card */}
      <div className="space-y-3 bg-[#0D0F14] border border-white/[0.08] p-3 rounded-xl shadow-lg">
        {/* Speed Header & Real-time Indicator */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Video Speed</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-all ${
                currentSpeed === 1.0
                  ? 'bg-white/10 text-slate-300'
                  : currentSpeed > 1.0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentSpeed.toFixed(2)}x {currentSpeed > 1.0 ? '⚡ Fast' : currentSpeed < 1.0 ? '🐢 Slow' : 'Normal'}
            </span>
            {currentSpeed !== 1.0 && (
              <button
                onClick={handleResetSpeed}
                title="Reset to 1.00x normal playback"
                className="text-[10px] text-[#60A5FA] hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-1.5 py-0.5 rounded transition flex items-center gap-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Source vs Effective Duration Readout */}
        <div className="text-[10px] text-[#94A3B8] bg-black/40 px-2 py-1.5 rounded-lg border border-white/[0.04] flex items-center justify-between font-mono">
          <span>Source: <strong className="text-slate-200">{sourceDuration.toFixed(2)}s</strong></span>
          <span className="text-slate-500">→</span>
          <span>Timeline: <strong className="text-[#38BDF8]">{clip.duration.toFixed(2)}s</strong></span>
        </div>

        {/* Precision Speed Slider (0.25x - 4.00x) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#64748B] font-mono font-medium">
            <span>0.25x</span>
            <span>1.00x</span>
            <span>2.00x</span>
            <span>4.00x</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="4.00"
            step="0.05"
            value={Math.min(4.0, Math.max(0.25, currentSpeed))}
            onChange={(e) => applySpeed(parseFloat(e.target.value))}
            onKeyDown={handleSliderKeyDown}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3B82F6] hover:accent-[#60A5FA] transition"
          />
        </div>

        {/* Stepper Buttons & Numeric Input Control */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Decrement Stepper */}
          <button
            onClick={() => handleStep(-0.1)}
            disabled={currentSpeed <= 0.15}
            title="Decrease speed by 0.1x (or Arrow Down)"
            className="w-9 h-8 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white font-bold flex items-center justify-center transition"
          >
            -
          </button>

          {/* Direct Numeric Input with Validation */}
          <div className="relative flex-1">
            <input
              type="text"
              value={isEditingInput ? speedInputValue : `${currentSpeed.toFixed(2)}x`}
              onFocus={() => {
                setIsEditingInput(true);
                setSpeedInputValue(currentSpeed.toFixed(2));
              }}
              onChange={(e) => setSpeedInputValue(e.target.value)}
              onBlur={handleInputCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  setIsEditingInput(false);
                  setSpeedInputValue(currentSpeed.toFixed(2));
                }
              }}
              placeholder="1.00x"
              className="w-full bg-[#080B11] border border-white/10 focus:border-[#3B82F6] rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-white outline-none transition"
            />
          </div>

          {/* Increment Stepper */}
          <button
            onClick={() => handleStep(0.1)}
            disabled={currentSpeed >= 10.0}
            title="Increase speed by 0.1x (or Arrow Up)"
            className="w-9 h-8 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white font-bold flex items-center justify-center transition"
          >
            +
          </button>
        </div>

        {/* Speed Presets Grid */}
        <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#94A3B8]">Presets</span>
            {!matchingPreset && (
              <span className="text-[10px] font-mono text-[#38BDF8]">
                Custom — {currentSpeed.toFixed(2)}x
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {presets.map((spd) => {
              const isActive = matchingPreset === spd;
              return (
                <button
                  key={spd}
                  onClick={() => applySpeed(spd)}
                  className={`py-1 rounded-md text-[11px] font-mono font-medium transition ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/40 ring-1 ring-blue-400 font-bold'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
                  }`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Behavior: Pitch Correction Toggle */}
        <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Preserve Audio Pitch</span>
          </span>
          <button
            onClick={togglePreservePitch}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition ${
              (clip.preservePitch ?? true)
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-500 border border-white/10'
            }`}
          >
            {(clip.preservePitch ?? true) ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Frame Fit Mode */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Frame Scaling</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleFitChange('cover')}
            className={`py-1.5 rounded-lg text-xs font-medium transition ${
              clip.fit === 'cover'
                ? 'bg-[#7C5CFF] text-white'
                : 'bg-[#0D0F14] text-[#9CA3AF] hover:text-white border border-white/[0.06]'
            }`}
          >
            Cover (Fill)
          </button>
          <button
            onClick={() => handleFitChange('contain')}
            className={`py-1.5 rounded-lg text-xs font-medium transition ${
              clip.fit === 'contain'
                ? 'bg-[#7C5CFF] text-white'
                : 'bg-[#0D0F14] text-[#9CA3AF] hover:text-white border border-white/[0.06]'
            }`}
          >
            Contain (Fit)
          </button>
        </div>
      </div>

      {/* Audio Volume */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" />
            Clip Audio
          </span>
          <span className="font-mono text-white">{clip.volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={clip.volume}
          onChange={(e) => updateClip(clip.id, { volume: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
        />
      </div>

      {/* Effects Toggles */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Active Visual Effects</span>
        </label>
        <div className="space-y-1.5">
          {effectToggles.map((eff) => {
            const Icon = eff.icon;
            const isActive = !!clip.effects[eff.key];
            return (
              <button
                key={eff.key}
                onClick={() => toggleEffect(eff.key)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                  isActive
                    ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white font-medium'
                    : 'bg-[#0D0F14] border border-white/[0.05] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-[#7C5CFF]' : 'text-[#667085]'}`}
                  />
                  <span>{eff.label}</span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive ? 'bg-[#7C5CFF]' : 'border border-white/20'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions: Split / Duplicate / Delete */}
      <div className="pt-2 border-t border-white/[0.07] grid grid-cols-3 gap-1.5">
        <button
          onClick={() => splitClip(clip.id)}
          className="p-2 rounded-lg bg-[#0D0F14] hover:bg-white/5 border border-white/[0.06] text-xs text-[#9CA3AF] hover:text-white flex flex-col items-center gap-1 transition"
        >
          <Scissors className="w-3.5 h-3.5 text-[#5B8CFF]" />
          <span className="text-[10px]">Split</span>
        </button>

        <button
          onClick={() => duplicateClip(clip.id)}
          className="p-2 rounded-lg bg-[#0D0F14] hover:bg-white/5 border border-white/[0.06] text-xs text-[#9CA3AF] hover:text-white flex flex-col items-center gap-1 transition"
        >
          <Copy className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="text-[10px]">Duplicate</span>
        </button>

        <button
          onClick={() => deleteClip(clip.id)}
          className="p-2 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-xs text-[#EF4444] flex flex-col items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[10px]">Delete</span>
        </button>
      </div>
    </div>
  );
}
