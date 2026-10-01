'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import { Music, Sparkles, Volume2, Check } from 'lucide-react';
import { SAMPLE_AUDIO_TRACK } from '@/data/mockData';

export default function AudioPanel() {
  const { timelineAudio, selectedTemplate, currentTabIssues, handleQuickFix, dismissIssue } =
    useEditor();

  const tracks = [
    {
      title: 'Cinematic Pulse (Future Beats)',
      genre: 'Electro Cinematic',
      bpm: 118,
      duration: '0:18',
    },
    {
      title: 'Neon Drift (Phonk / Trap)',
      genre: 'Viral Phonk',
      bpm: 135,
      duration: '0:15',
    },
    {
      title: 'Ambient Precision (Lo-Fi)',
      genre: 'Tech Lo-Fi',
      bpm: 95,
      duration: '0:20',
    },
    {
      title: 'Midnight Velvet (Lounge)',
      genre: 'Deep Lounge',
      bpm: 88,
      duration: '0:25',
    },
  ];

  return (
    <div id="box-tab-audio-panel" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <span>Soundtrack & Beat Sync</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
            Automated
          </span>
        </h2>
        <p className="text-[11px] text-[#667085]">
          Music tracks synchronized to cut points and motion impacts
        </p>
      </div>

      {/* Dynamic Red Error / Warning Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* Active Track Card */}
      <div className="rounded-xl bg-[#11141A] border border-[#F59E0B]/40 p-3.5 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {selectedTemplate.musicStyle.title}
              </div>
              <div className="text-[10px] text-[#9CA3AF]">
                {selectedTemplate.musicStyle.genre} • {selectedTemplate.musicStyle.bpm} BPM
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Synced
          </span>
        </div>
      </div>

      {/* Library Tracks */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-[#9CA3AF]">
          Alternative Royalty-Free Soundtracks
        </label>

        {tracks.map((trk, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#11141A] hover:bg-[#151820] border border-white/[0.08] hover:border-white/[0.18] p-3 flex items-center justify-between transition"
          >
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">{trk.title}</h4>
              <div className="text-[10px] text-[#667085]">
                {trk.genre} • {trk.bpm} BPM • {trk.duration}
              </div>
            </div>

            <button
              className="px-2.5 py-1 rounded-lg bg-[#0D0F14] hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/30 text-[11px] font-semibold transition"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
