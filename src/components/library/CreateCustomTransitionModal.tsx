'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { TransitionItem, TransitionDirection, TransitionEasing, TransitionLayers } from '@/types';
import {
  Sparkles,
  X,
  Check,
  Plus,
  Sliders,
  Layers,
  MoveRight,
  Maximize2,
  Wind,
  Zap,
} from 'lucide-react';

interface CreateCustomTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCustomTransitionModal({
  isOpen,
  onClose,
}: CreateCustomTransitionModalProps) {
  const { addCustomTransition } = useEditor();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Custom');
  const [duration, setDuration] = useState(0.4);
  const [direction, setDirection] = useState<TransitionDirection>('in');
  const [zoom, setZoom] = useState(20);
  const [motionBlur, setMotionBlur] = useState(25);
  const [intensity, setIntensity] = useState(75);
  const [easing, setEasing] = useState<TransitionEasing>('ease_in_out');
  const [layers, setLayers] = useState<TransitionLayers>({
    scale: true,
    motionBlur: true,
    lightFlash: false,
    directional: true,
    rotation: false,
    colorDiffusion: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleToggleLayer = (key: keyof TransitionLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newTransition: TransitionItem = {
      id: `custom_trans_${Date.now()}`,
      name: name.trim(),
      type: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      category: category || 'Custom',
      duration,
      description: `Custom ${category} transition (${duration}s, ${easing}).`,
      iconName: 'Sparkle',
      previewAnimationType: zoom > 0 ? 'zoom_in' : 'swipe_right',
      variations: [name.trim(), `${name.trim()} Fast`, `${name.trim()} Deep`],
      supportedLayers: Object.keys(layers).filter((k) => (layers as any)[k]),
      defaultDirection: direction,
      defaultEasing: easing,
      defaultIntensity: intensity,
      defaultZoom: zoom,
      defaultMotionBlur: motionBlur,
      isCustom: true,
      isFavorite: true,
    };

    addCustomTransition(newTransition);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Custom Transition</h3>
              <p className="text-[11px] text-[#667085]">
                Configure multi-parameter dynamic transition preset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Transition Name & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#9CA3AF]">Transition Name</label>
              <input
                type="text"
                placeholder="e.g. Neon Warp Glitch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D0F14] border border-white/[0.1] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#9CA3AF]">Category Group</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0D0F14] border border-white/[0.1] text-[#9CA3AF] text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] cursor-pointer"
              >
                <option value="Custom">Custom</option>
                <option value="Cinematic">Cinematic</option>
                <option value="Dynamic">Dynamic</option>
                <option value="Zoom">Zoom</option>
                <option value="Motion">Motion</option>
                <option value="Glitch">Glitch</option>
                <option value="Flash">Flash</option>
                <option value="3D">3D</option>
              </select>
            </div>
          </div>

          {/* Duration & Intensity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF]">
                <span>Default Duration</span>
                <span className="font-mono text-white">{duration.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF]">
                <span>Intensity</span>
                <span className="font-mono text-white">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Direction & Easing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#9CA3AF]">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full bg-[#0D0F14] border border-white/[0.1] text-white text-xs px-3 py-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="in">Zoom In</option>
                <option value="out">Zoom Out</option>
                <option value="left">Left Push/Swipe</option>
                <option value="right">Right Push/Swipe</option>
                <option value="up">Vertical Up</option>
                <option value="down">Vertical Down</option>
                <option value="clockwise">Clockwise Spin</option>
                <option value="counterclockwise">Counter-Clockwise</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#9CA3AF]">Easing Curve</label>
              <select
                value={easing}
                onChange={(e) => setEasing(e.target.value as any)}
                className="w-full bg-[#0D0F14] border border-white/[0.1] text-white text-xs px-3 py-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="ease_in_out">Ease In Out</option>
                <option value="exponential">Exponential Snappy</option>
                <option value="cubic_in">Cubic In</option>
                <option value="spring">Spring Bounce</option>
                <option value="linear">Linear Uniform</option>
              </select>
            </div>
          </div>

          {/* Sliders: Zoom Scale & Motion Blur */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF]">
                <span>Zoom Scale</span>
                <span className="font-mono text-white">{zoom}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF]">
                <span>Motion Blur</span>
                <span className="font-mono text-white">{motionBlur}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                step="5"
                value={motionBlur}
                onChange={(e) => setMotionBlur(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 accent-[#7C5CFF] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Layer Stacking Checklist */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Layer Stacking Pipeline</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'scale', label: 'Scale Zoom Layer' },
                { key: 'motionBlur', label: 'Shutter Motion Blur' },
                { key: 'lightFlash', label: 'Light Flare Shutter' },
                { key: 'directional', label: 'Directional Drift' },
                { key: 'rotation', label: 'Rotational Vortex' },
                { key: 'colorDiffusion', label: 'Color Chromatic Diffusion' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggleLayer(item.key as any)}
                  className={`p-2 rounded-lg text-left flex items-center justify-between transition border ${
                    (layers as any)[item.key]
                      ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-white'
                      : 'bg-[#0D0F14] border-white/[0.05] text-[#667085]'
                  }`}
                >
                  <span className="text-[11px] font-medium">{item.label}</span>
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                      (layers as any)[item.key] ? 'bg-[#7C5CFF] text-white' : 'border border-white/20'
                    }`}
                  >
                    {(layers as any)[item.key] && <Check className="w-2.5 h-2.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-end gap-2 bg-[#0D0F14]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
              isSaved
                ? 'bg-[#22C55E] text-white'
                : 'bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white shadow-[#7C5CFF]/30 disabled:opacity-40'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to My Transitions!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Custom Preset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
