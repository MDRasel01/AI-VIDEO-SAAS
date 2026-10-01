'use client';

import React from 'react';
import { TimelineText } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Sliders,
  MoveVertical,
  MoveHorizontal,
  RotateCw,
  Bold,
  Italic,
  Palette,
  Layers,
  LayoutGrid,
  Wand2,
} from 'lucide-react';

interface TextInspectorProps {
  textData: TimelineText;
}

export default function TextInspector({ textData }: TextInspectorProps) {
  const { updateText, textTemplates, applyTextTemplate } = useEditor();

  const animationPresets = [
    { id: 'slide_up', label: 'Smooth Slide Up' },
    { id: 'minimal_kinetic', label: 'Minimal Kinetic' },
    { id: 'glow_pulse', label: 'Neon Glow Pulse' },
    { id: 'typewriter', label: 'Tech Typewriter' },
    { id: 'fade_in', label: 'Cinema Fade In' },
  ];

  const fonts = [
    'Inter',
    'Outfit',
    'Cinzel',
    'Montserrat',
    'Space Grotesk',
    'Syne',
    'Cabinet Grotesk',
    'Bebas Neue',
    'Playfair Display',
    'Geist',
    'Geist Mono',
  ];

  const colorPresets = [
    '#FFFFFF',
    '#FBBF24',
    '#3B82F6',
    '#22C55E',
    '#EC4899',
    '#A855F7',
    '#06B6D4',
    '#F97316',
    '#000000',
  ];

  const bgPresets = [
    { label: 'None', value: '' },
    { label: 'Dark Glass', value: 'rgba(0,0,0,0.75)' },
    { label: 'Neon Blue', value: 'rgba(37,99,235,0.85)' },
    { label: 'Emerald', value: 'rgba(16,185,129,0.85)' },
    { label: 'Crimson', value: 'rgba(225,29,72,0.85)' },
    { label: 'Amber', value: 'rgba(217,119,6,0.85)' },
  ];

  const currentX = textData.positionX ?? 50;
  const currentY = textData.positionY ?? 50;
  const currentRotation = textData.rotation ?? 0;

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Text &amp; Transform System
          </h3>
        </div>
        {textData.stylePresetName && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-[#60A5FA] border border-blue-500/20">
            {textData.stylePresetName}
          </span>
        )}
      </div>

      {/* Main Title Content */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF]">
          Main Title Content
        </label>
        <input
          type="text"
          value={textData.text}
          onChange={(e) => updateText({ text: e.target.value })}
          placeholder="Enter title..."
          className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs p-2.5 rounded-xl outline-none focus:border-[#3B82F6] font-medium"
        />
      </div>

      {/* Subtitle / Subtext Content */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF]">
          Subtitle Content (Optional)
        </label>
        <input
          type="text"
          value={textData.subText || ''}
          onChange={(e) => updateText({ subText: e.target.value })}
          placeholder="Enter subtitle (e.g. 50% OFF TODAY)..."
          className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs p-2 rounded-xl outline-none focus:border-[#3B82F6] font-medium"
        />
      </div>

      {/* Quick Library Style Switcher */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Apply Text Library Style</span>
          </span>
          <span className="text-[10px] text-slate-500">Preserves content</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1 bg-black/40 rounded-xl border border-white/[0.06]">
          {(textTemplates || []).slice(0, 8).map((tmpl) => {
            const isCurrent =
              textData.styleId === tmpl.id || textData.stylePresetName === tmpl.name;
            return (
              <button
                key={tmpl.id}
                onClick={() => applyTextTemplate(tmpl, true)}
                className={`text-left p-1.5 rounded-lg text-[10px] font-bold border transition-all truncate ${
                  isCurrent
                    ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]'
                    : 'bg-[#11141A] text-slate-300 hover:text-white border-white/[0.05] hover:border-white/[0.2]'
                }`}
              >
                <div className="truncate">{tmpl.name}</div>
                <div className="text-[8px] font-mono text-slate-500 truncate">{tmpl.font}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] text-[#667085]">Font Family</label>
          <select
            value={textData.font}
            onChange={(e) => updateText({ font: e.target.value })}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs p-2 rounded-xl outline-none focus:border-[#3B82F6]"
          >
            {fonts.map((f) => (
              <option key={f} value={f} className="bg-[#11141A]">
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#667085]">
            <span>Font Size</span>
            <span className="font-mono text-white">{textData.size || 72}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="160"
            value={textData.size || 72}
            onChange={(e) => updateText({ size: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer mt-2"
          />
        </div>
      </div>

      {/* Typography Style Toggles & Alignment */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] text-[#667085]">Style Format</label>
          <div className="flex items-center gap-1 bg-[#0D0F14] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() =>
                updateText({
                  weight: textData.weight === '800' || textData.isBold ? '600' : '800',
                  isBold: !textData.isBold,
                })
              }
              title="Toggle Bold"
              className={`flex-1 p-1 rounded-lg flex items-center justify-center transition ${
                textData.weight === '800' || textData.isBold
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText({ isItalic: !textData.isItalic })}
              title="Toggle Italic"
              className={`flex-1 p-1 rounded-lg flex items-center justify-center transition ${
                textData.isItalic
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-[#667085]">Alignment</label>
          <div className="flex items-center gap-1 bg-[#0D0F14] p-1 rounded-xl border border-white/[0.08]">
            {(['left', 'center', 'right'] as const).map((align) => {
              const Icon =
                align === 'left'
                  ? AlignLeft
                  : align === 'center'
                  ? AlignCenter
                  : AlignRight;
              return (
                <button
                  key={align}
                  onClick={() => updateText({ alignment: align })}
                  className={`flex-1 p-1 rounded-lg flex items-center justify-center transition ${
                    textData.alignment === align
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Text Color</span>
          </span>
          <span className="font-mono text-white text-[10px]">{textData.color || '#FFFFFF'}</span>
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {colorPresets.map((c) => (
            <button
              key={c}
              onClick={() => updateText({ color: c })}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border transition-all ${
                textData.color === c
                  ? 'ring-2 ring-[#3B82F6] scale-110 border-white'
                  : 'border-white/20 hover:scale-105'
              }`}
            />
          ))}
          <input
            type="color"
            value={textData.color || '#FFFFFF'}
            onChange={(e) => updateText({ color: e.target.value })}
            className="w-6 h-6 rounded-md bg-transparent cursor-pointer border-0"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Background Badge Pill */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#9CA3AF]">
          Background Pill Style
        </label>
        <div className="grid grid-cols-3 gap-1">
          {bgPresets.map((bg) => (
            <button
              key={bg.label}
              onClick={() => updateText({ backgroundColor: bg.value || undefined })}
              className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition ${
                (textData.backgroundColor || '') === bg.value
                  ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]'
                  : 'bg-[#0D0F14] text-slate-400 border-white/[0.06] hover:text-white'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSFORM POSITION X & POSITION Y */}
      <div className="space-y-2 pt-2 border-t border-white/[0.07]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Transform &amp; Position</span>
          </span>
          {/* Snap to Center */}
          <button
            onClick={() => updateText({ positionX: 50, positionY: 50 })}
            className="text-[10px] font-mono text-[#60A5FA] hover:underline"
          >
            Snap Center (50%, 50%)
          </button>
        </div>

        {/* Position X Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3 text-[#60A5FA]" />
              Horizontal X
            </span>
            <span className="font-mono text-white">{currentX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentX}
            onChange={(e) => updateText({ positionX: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer"
          />
        </div>

        {/* Position Y Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <MoveVertical className="w-3 h-3 text-[#60A5FA]" />
              Vertical Y
            </span>
            <span className="font-mono text-white">{currentY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentY}
            onChange={(e) => updateText({ positionY: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer"
          />
        </div>

        {/* Rotation Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-[#60A5FA]" />
              Rotation
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white">{currentRotation}°</span>
              {currentRotation !== 0 && (
                <button
                  onClick={() => updateText({ rotation: 0 })}
                  className="text-[9px] text-[#60A5FA] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={currentRotation}
            onChange={(e) => updateText({ rotation: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer"
          />
        </div>

        {/* Text Box Width (Line Wrapping Control) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span>Box Width (Wrap)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white">
                {textData.width ? `${textData.width}px` : 'Auto Fit'}
              </span>
              {textData.width && (
                <button
                  onClick={() => updateText({ width: undefined })}
                  className="text-[9px] text-[#60A5FA] hover:underline"
                >
                  Reset Auto
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="60"
            max="600"
            value={textData.width || 300}
            onChange={(e) => updateText({ width: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer"
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span>Letter Spacing</span>
            <span className="font-mono text-white">{textData.letterSpacing || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={textData.letterSpacing || 0}
            onChange={(e) => updateText({ letterSpacing: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 accent-[#3B82F6] rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Animation Selector */}
      <div className="space-y-1.5 pt-2 border-t border-white/[0.07]">
        <label className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Motion Animation</span>
        </label>
        <select
          value={textData.animation}
          onChange={(e) => updateText({ animation: e.target.value as any })}
          className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs p-2 rounded-xl outline-none focus:border-[#3B82F6]"
        >
          {animationPresets.map((preset) => (
            <option key={preset.id} value={preset.id} className="bg-[#11141A]">
              {preset.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
