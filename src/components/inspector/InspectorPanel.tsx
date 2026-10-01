'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Type,
  ArrowLeftRight,
  Sparkles,
  Headphones,
  Sliders,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Download,
  BookmarkPlus,
  Ban,
  Check,
  Layers,
} from 'lucide-react';
import TransitionInspector from './TransitionInspector';
import ClipInspector from './ClipInspector';
import CompositionInspector from './CompositionInspector';
import TextInspector from './TextInspector';
import IdBadge from '@/components/ui/IdBadge';

export default function InspectorPanel() {
  const {
    timelineText,
    updateText,
    setIsExportOpen,
    setIsSaveTemplateOpen,
    selectedClipId,
    selectedTransitionId,
    timelineClips,
    timelineTransitions,
    selectedTemplate,
    selectedPlatform,
    saveCustomTemplate,
  } = useEditor();

  const [activeInspectorTab, setActiveInspectorTab] = useState<'text' | 'transition' | 'effects' | 'audio' | 'overview'>('text');
  const [templateNameInput, setTemplateNameInput] = useState('My Custom Template');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportRes, setExportRes] = useState('1080 x 1920 (Full HD)');
  const [exportFormat, setExportFormat] = useState('MP4');

  // Text formatting states
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [bgType, setBgType] = useState<'none' | 'box' | 'glass'>('none');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState('72');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [textAnimation, setTextAnimation] = useState('Slide Up');

  // Bidirectional synchronization with canvas text state
  React.useEffect(() => {
    if (timelineText) {
      if (timelineText.size) setFontSize(timelineText.size.toString());
      if (timelineText.color) setTextColor(timelineText.color);
      if (timelineText.font) setFontFamily(timelineText.font);
      if (timelineText.alignment) setTextAlign(timelineText.alignment);
    }
  }, [timelineText?.size, timelineText?.color, timelineText?.font, timelineText?.alignment]);

  // Seamless auto-switch to corresponding inspector when an element is clicked on timeline
  React.useEffect(() => {
    if (selectedClipId) {
      setActiveInspectorTab('effects');
    }
  }, [selectedClipId]);

  React.useEffect(() => {
    if (selectedTransitionId) {
      setActiveInspectorTab('transition');
    }
  }, [selectedTransitionId]);

  const selectedClip = timelineClips.find((c) => c.id === selectedClipId) || timelineClips[0];
  const selectedTransition = timelineTransitions.find((t) => t.id === selectedTransitionId) || timelineTransitions[0];

  const handleSaveTemplate = () => {
    const activeTransitions = Array.from(
      new Set(
        timelineTransitions.length > 0
          ? timelineTransitions.map((t) => t.name)
          : selectedTemplate.transitions
      )
    );

    saveCustomTemplate({
      name: templateNameInput.trim() || 'My Custom Template',
      subtitle: 'Custom Composition • Reusable',
      category: 'Universal' as any,
      format: selectedPlatform.format as any,
      recommendedDuration: '10–20 sec',
      description: 'Custom configuration with personalized typography and transitions.',
      transitions: activeTransitions.length > 0 ? activeTransitions : ['Smooth Zoom In', 'Cross Dissolve'],
      effects: ['Slow Zoom', 'Film Grain'],
      textStyle: {
        preset: timelineText?.text || 'Explore',
        sampleText: timelineText?.text || 'Explore',
        animation: 'slide_up',
        fontFamily: fontFamily || 'Poppins',
      },
      musicStyle: selectedTemplate.musicStyle || {
        title: 'Background Music.mp3',
        bpm: 118,
        genre: 'Cinematic Ambient',
      },
      colorTheme: '#2563EB',
      thumbnail: timelineClips[0]?.thumbnail || selectedTemplate.thumbnail,
      pacingProfile: selectedTemplate.pacingProfile || 'Smooth Flow',
      isCustom: true,
    } as any);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  return (
    <aside id="box-inspector-panel" className="w-80 bg-[#080B11] border-l border-white/[0.08] flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {/* Panel Header */}
      <div id="inspector-header" className="p-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center justify-between gap-2">
          <h2 id="inspector-title-label" className="text-sm font-bold text-white tracking-wide font-poppins">
            Edit &amp; Customize
          </h2>
          <IdBadge id="box-inspector-panel" />
        </div>

        {/* 4 Tabs Row (+ Overview option) */}
        <div id="inspector-tabs-nav" className="grid grid-cols-5 gap-1.5 mt-3 bg-[#0E131F] p-1.5 rounded-xl border border-white/[0.06]">
          {/* Text Tab */}
          <button
            id="btn-inspector-tab-text"
            onClick={() => setActiveInspectorTab('text')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              activeInspectorTab === 'text'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold">Text</span>
          </button>

          {/* Transition Tab */}
          <button
            id="btn-inspector-tab-transition"
            onClick={() => setActiveInspectorTab('transition')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              activeInspectorTab === 'transition'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold">Transition</span>
          </button>

          {/* Effects Tab */}
          <button
            id="btn-inspector-tab-effects"
            onClick={() => setActiveInspectorTab('effects')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              activeInspectorTab === 'effects'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold">Clip/Speed</span>
          </button>

          {/* Audio Tab */}
          <button
            id="btn-inspector-tab-audio"
            onClick={() => setActiveInspectorTab('audio')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              activeInspectorTab === 'audio'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Headphones className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold">Audio</span>
          </button>

          {/* Composition Overview Tab */}
          <button
            id="btn-inspector-tab-overview"
            onClick={() => setActiveInspectorTab('overview')}
            title="Composition Overview"
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              activeInspectorTab === 'overview'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-semibold">Overview</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div id="box-inspector-body-content" className="p-4 space-y-4 flex-1">
        {activeInspectorTab === 'text' && (
          <>
            {/* Section 1: Text Inspector & Transform Controls */}
            <div id="box-inspector-text-section" className="bg-[#0E131F] p-3.5 rounded-2xl border border-white/[0.06]">
              <TextInspector
                textData={
                  timelineText || {
                    id: 'text-1',
                    text: 'Explore',
                    subText: 'THE WORLD',
                    start: 0.5,
                    end: 6,
                    duration: 5.5,
                    font: 'Inter',
                    size: 72,
                    weight: '700',
                    color: '#FFFFFF',
                    alignment: 'center',
                    positionY: 80,
                    animation: 'slide_up',
                    opacity: 100,
                    letterSpacing: 2,
                  }
                }
              />
            </div>

            {/* Section 2: Save as Template */}
            <div id="box-inspector-save-template-section" className="space-y-2.5 bg-[#0E131F] p-3.5 rounded-2xl border border-white/[0.06]">
              <label id="label-save-template" className="text-xs font-bold text-white">
                Save as Template
              </label>
              <input
                id="input-template-name"
                type="text"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                placeholder="Template name..."
                className="w-full bg-[#080B11] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[#3B82F6]"
              />
              <button
                id="btn-save-template-action"
                onClick={handleSaveTemplate}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Template</span>
                )}
              </button>
            </div>

            {/* Section 3: Export Video */}
            <div id="box-inspector-export-section" className="space-y-2.5 bg-[#0E131F] p-3.5 rounded-2xl border border-white/[0.06]">
              <label id="label-export-video" className="text-xs font-bold text-white">Export Video</label>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Resolution</span>
                <div className="relative">
                  <select
                    id="select-export-resolution"
                    value={exportRes}
                    onChange={(e) => setExportRes(e.target.value)}
                    className="w-full appearance-none bg-[#080B11] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    <option value="1080 x 1920 (Full HD)">1080 x 1920 (Full HD)</option>
                    <option value="2160 x 3840 (4K Ultra HD)">2160 x 3840 (4K Ultra HD)</option>
                    <option value="720 x 1280 (HD)">720 x 1280 (HD)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Format</span>
                <div className="relative">
                  <select
                    id="select-export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full appearance-none bg-[#080B11] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    <option value="MP4">MP4</option>
                    <option value="MOV">MOV (ProRes)</option>
                    <option value="WEBM">WEBM</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-inspector-export-video"
                onClick={handleExport}
                className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 mt-1"
              >
                <Download className="w-4 h-4" />
                <span>Export Video</span>
              </button>
            </div>
          </>
        )}

        {/* Transition Inspector View */}
        {activeInspectorTab === 'transition' && (
          <div id="box-inspector-transition-section" className="space-y-3">
            {selectedTransition ? (
              <TransitionInspector transition={selectedTransition} />
            ) : (
              <div id="empty-transition-hint" className="p-4 rounded-xl bg-[#0E131F] text-xs text-slate-400 text-center">
                Select a transition from the timeline below to inspect and customize parameters.
              </div>
            )}
          </div>
        )}

        {/* Effects Inspector View */}
        {activeInspectorTab === 'effects' && (
          <div id="box-inspector-clip-effects-section" className="space-y-3">
            {selectedClip ? (
              <ClipInspector clip={selectedClip} />
            ) : (
              <div id="empty-clip-hint" className="p-4 rounded-xl bg-[#0E131F] text-xs text-slate-400 text-center">
                Select a video clip from the timeline to adjust visual effects and color grading.
              </div>
            )}
          </div>
        )}

        {/* Audio Inspector View */}
        {activeInspectorTab === 'audio' && (
          <div id="box-inspector-audio-section" className="space-y-3 bg-[#0E131F] p-4 rounded-2xl border border-white/[0.06]">
            <div id="audio-inspector-header" className="flex items-center gap-2 mb-2">
              <Headphones className="w-4 h-4 text-[#3B82F6]" />
              <span id="audio-inspector-title" className="text-xs font-bold text-white">Background Audio</span>
            </div>
            <div id="audio-inspector-track-card" className="p-3 rounded-xl bg-[#080B11] border border-white/10">
              <p id="audio-track-title" className="text-xs font-semibold text-white">Background Music.mp3</p>
              <p id="audio-track-bpm" className="text-[11px] text-[#94A3B8]">118 BPM • Cinematic Ambient</p>
            </div>
          </div>
        )}

        {/* Composition Overview View (Kept as explicitly requested by the user!) */}
        {activeInspectorTab === 'overview' && (
          <div id="box-inspector-overview-section" className="space-y-3">
            <CompositionInspector />
          </div>
        )}
      </div>
    </aside>
  );
}
