'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { CaptionStylePreset } from '@/types';
import {
  Mic,
  Sparkles,
  Play,
  Pause,
  Trash2,
  Plus,
  Download,
  CheckCircle2,
  Globe,
  Layers,
  FileText,
  Clock,
  Volume2,
  RefreshCw,
  Sliders,
  Type,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect (Recommended)', flag: '🌐' },
  { code: 'en', label: 'English (US / UK)', flag: '🇺🇸' },
  { code: 'bn', label: 'Bengali (বাংলা)', flag: '🇧🇩' },
  { code: 'hi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', label: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', label: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'ja', label: 'Japanese (日本語)', flag: '🇯🇵' },
];

const STYLE_PRESETS: { id: CaptionStylePreset; name: string; desc: string; preview: string; bg: string }[] = [
  {
    id: 'viral_yellow',
    name: 'TikTok Viral',
    desc: 'High contrast yellow on black outline',
    preview: 'YELLOW POP',
    bg: 'bg-yellow-400 text-black font-extrabold',
  },
  {
    id: 'clean_minimal',
    name: 'Clean Minimal',
    desc: 'Sleek white sans-serif for sleek content',
    preview: 'Clean White',
    bg: 'bg-white text-black font-semibold',
  },
  {
    id: 'cinema_box',
    name: 'Cinema Badge',
    desc: 'Dark translucent backdrop pill',
    preview: 'Cinema Pill',
    bg: 'bg-black/90 text-white font-bold border border-white/20',
  },
  {
    id: 'neon_glow',
    name: 'Cyber Neon',
    desc: 'Cyan/Purple gradient neon glow',
    preview: 'Neon Glow',
    bg: 'bg-cyan-500 text-black font-extrabold shadow-[0_0_12px_#06B6D4]',
  },
];

export default function TranscriptPanel() {
  const {
    transcriptState,
    generateTranscript,
    updateTranscriptSegment,
    addTranscriptSegment,
    deleteTranscriptSegment,
    setTranscriptLanguage,
    setCaptionStyle,
    toggleAutoSyncTranscript,
    exportTranscriptAsSRT,
    exportTranscriptAsVTT,
    exportTranscriptAsTXT,
    applyTranscriptToTimeline,
    currentTime,
    seek,
    isPlaying,
    setIsPlaying,
    totalDuration,
  } = useEditor();

  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlaySegment = (start: number, end: number, segId: string) => {
    seek(start);
    setIsPlaying(true);
    setPlayingSegmentId(segId);

    const durMs = Math.max(500, (end - start) * 1000);
    setTimeout(() => {
      setPlayingSegmentId((current) => (current === segId ? null : current));
    }, durMs);
  };

  const isGenerating =
    transcriptState.status === 'extracting_audio' ||
    transcriptState.status === 'transcribing';

  return (
    <div id="box-tab-transcript-panel" className="p-4 space-y-5 text-[#F8FAFC]">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Voice Transcript</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
                AI Auto Captions
              </span>
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              Extract speech from video clips &amp; generate live subtitles
            </p>
          </div>
        </div>
      </div>

      {/* Control Box: Language & Generate */}
      <div className="p-3.5 rounded-2xl bg-[#090D16]/90 border border-white/[0.08] shadow-xl space-y-3.5">
        {/* Language Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Language Detection</span>
            </span>
            {transcriptState.detectedLanguage && (
              <span className="text-[10px] font-mono text-[#38BDF8]">
                Active: {transcriptState.detectedLanguage}
              </span>
            )}
          </label>
          <select
            value={transcriptState.language}
            onChange={(e) => setTranscriptLanguage(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-[#111624] border border-white/[0.12] text-white text-xs p-2.5 rounded-xl outline-none focus:border-[#3B82F6] font-medium"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#0E131F]">
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Caption Style Preset Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Caption Style Preset</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((preset) => {
              const isSelected = transcriptState.captionStyle === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setCaptionStyle(preset.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-500/15 border-[#3B82F6] ring-1 ring-[#3B82F6]'
                      : 'bg-[#111624] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-white truncate">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3 h-3 text-[#60A5FA] shrink-0" />
                    )}
                  </div>
                  <div
                    className={`text-[9px] px-2 py-0.5 rounded text-center truncate ${preset.bg}`}
                  >
                    {preset.preview}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button / Progress Bar */}
        {isGenerating ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#60A5FA]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {transcriptState.status === 'extracting_audio'
                  ? 'Extracting audio track from clips...'
                  : 'Whisper AI Speech Recognition...'}
              </span>
              <span>{transcriptState.progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${transcriptState.progress}%` }}
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] transition-all duration-300 rounded-full"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => generateTranscript()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Auto Transcript</span>
          </button>
        )}
      </div>

      {/* Auto-Sync Toggle Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#090D16]/60 border border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
          <span className="text-slate-300 font-medium">Live Canvas Sync</span>
        </div>
        <button
          onClick={toggleAutoSyncTranscript}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
            transcriptState.isAutoSyncedToTimeline
              ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40'
              : 'bg-white/10 text-slate-400'
          }`}
        >
          {transcriptState.isAutoSyncedToTimeline ? 'SYNC ON' : 'SYNC OFF'}
        </button>
      </div>

      {/* Timestamped Segments Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Dialogue Segments ({transcriptState.segments.length})</span>
          </span>
          <button
            onClick={() => addTranscriptSegment()}
            className="text-[11px] text-[#60A5FA] hover:text-white font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Segment</span>
          </button>
        </div>

        {/* Segments List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {transcriptState.segments.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] text-center space-y-2">
              <Mic className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
              <p className="text-xs text-slate-300 font-medium">No transcript generated yet</p>
              <p className="text-[10px] text-slate-500">
                Click &quot;Generate Auto Transcript&quot; above to convert video voice into captions.
              </p>
            </div>
          ) : (
            transcriptState.segments.map((seg, idx) => {
              const isCurrent =
                currentTime >= seg.start && currentTime <= seg.end;
              const isSegmentPlaying = playingSegmentId === seg.id;

              return (
                <div
                  key={seg.id}
                  className={`p-3 rounded-xl border transition-all duration-150 relative group ${
                    isCurrent
                      ? 'bg-blue-500/[0.12] border-[#3B82F6] ring-1 ring-[#3B82F6]/60 shadow-lg shadow-blue-500/10'
                      : 'bg-[#0E131F]/90 border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {/* Segment Header Bar */}
                  <div className="flex items-center justify-between mb-2">
                    {/* Clickable Timestamp */}
                    <button
                      onClick={() => seek(seg.start)}
                      title={`Jump playhead to ${seg.start.toFixed(1)}s`}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition ${
                        isCurrent
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-white/10 text-[#60A5FA] hover:bg-white/20'
                      }`}
                    >
                      <span>
                        {formatTimestamp(seg.start)} - {formatTimestamp(seg.end)}
                      </span>
                    </button>

                    {/* Controls: Play, Add below, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlaySegment(seg.start, seg.end, seg.id)}
                        title="Listen to this segment"
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      >
                        {isSegmentPlaying && isPlaying ? (
                          <Pause className="w-3 h-3 text-[#60A5FA]" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => addTranscriptSegment(seg.id)}
                        title="Insert segment below"
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => deleteTranscriptSegment(seg.id)}
                        title="Delete this segment"
                        className="p-1 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Transcript Textarea */}
                  <textarea
                    value={seg.text}
                    onChange={(e) =>
                      updateTranscriptSegment(seg.id, e.target.value)
                    }
                    rows={2}
                    placeholder="Enter spoken dialogue..."
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-[#3B82F6] text-white text-xs p-2 rounded-xl outline-none resize-none font-medium leading-relaxed"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Export & Actions Footer */}
      <div className="pt-2 border-t border-white/[0.08] space-y-2">
        <button
          onClick={applyTranscriptToTimeline}
          className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
          <span>Apply Active Caption to Video Canvas</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={exportTranscriptAsSRT}
            className="py-1.5 px-2 rounded-xl bg-[#0E131F] hover:bg-[#161D2E] border border-white/[0.08] text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3 h-3 text-[#60A5FA]" />
            <span>.SRT</span>
          </button>
          <button
            onClick={exportTranscriptAsVTT}
            className="py-1.5 px-2 rounded-xl bg-[#0E131F] hover:bg-[#161D2E] border border-white/[0.08] text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3 h-3 text-[#60A5FA]" />
            <span>.VTT</span>
          </button>
          <button
            onClick={exportTranscriptAsTXT}
            className="py-1.5 px-2 rounded-xl bg-[#0E131F] hover:bg-[#161D2E] border border-white/[0.08] text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3 h-3 text-[#60A5FA]" />
            <span>.TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
