'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Settings,
  Sliders,
  Sparkles,
  ShieldCheck,
  Eye,
  Check,
  Layers,
  HelpCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { OptimizationSettings } from '@/types';

export default function SettingsPanel() {
  const {
    optimizationSettings,
    setOptimizationSettings,
    reanalyzeVideo,
    videoAnalysisMetrics,
  } = useEditor();

  const handleUpdate = (updates: Partial<OptimizationSettings>) => {
    setOptimizationSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div id="box-tab-settings-panel" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Editor & Optimization Settings</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30 font-bold">
              AI v1.4
            </span>
          </h2>
          <p className="text-[11px] text-[#667085]">
            Configure platform guidelines, analysis models, and evidence transparency
          </p>
        </div>

        <button
          onClick={reanalyzeVideo}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#11141A] hover:bg-white/10 text-white text-xs font-semibold border border-white/[0.1] transition"
          title="Re-run video frame analysis"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Re-Analyze</span>
        </button>
      </div>

      {/* SECTION 1: Content Optimization Profile */}
      <div className="p-4 rounded-xl bg-[#11141A] border border-white/[0.08] space-y-3.5">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
          <Sliders className="w-4 h-4 text-[#7C5CFF]" />
          <div>
            <h3 className="text-xs font-bold text-white">Content Optimization Profile</h3>
            <p className="text-[10px] text-[#667085]">
              Tailors compatibility weighting to platform specifications
            </p>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#9CA3AF]">Target Platform</label>
          <select
            value={optimizationSettings.platform}
            onChange={(e) => handleUpdate({ platform: e.target.value as any })}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] cursor-pointer"
          >
            <option value="youtube">YouTube (Widescreen & Standard Guidelines)</option>
            <option value="youtube_shorts">YouTube Shorts (Vertical 9:16 Retention)</option>
            <option value="instagram_reels">Instagram Reels (Feed Clearances)</option>
            <option value="tiktok">TikTok (Fast Pacing & Viral Clearances)</option>
            <option value="facebook">Facebook Video</option>
          </select>
        </div>

        {/* Analysis Mode */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#9CA3AF]">Analysis Mode</label>
          <select
            value={optimizationSettings.analysisMode}
            onChange={(e) => handleUpdate({ analysisMode: e.target.value as any })}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] cursor-pointer"
          >
            <option value="video_compatibility">Video Compatibility (Canvas & Subject Fit)</option>
            <option value="high_engagement">High Engagement (Punchy Pacing & Strong Contrast)</option>
            <option value="cinematic_balanced">Cinematic Balanced (Organic Blends & Ambient Text)</option>
          </select>
        </div>

        {/* Analysis Target Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-[#9CA3AF]">Analyze Target Assets</label>
          <div className="grid grid-cols-4 gap-2">
            {(['all', 'text', 'transitions', 'effects'] as const).map((target) => {
              const isSelected = optimizationSettings.analysisTarget === target;
              return (
                <button
                  key={target}
                  onClick={() => handleUpdate({ analysisTarget: target })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition ${
                    isSelected
                      ? 'bg-[#7C5CFF] text-white font-bold shadow-md shadow-[#7C5CFF]/20'
                      : 'bg-[#0D0F14] text-[#9CA3AF] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {target}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: Engine & Evidence Toggles */}
      <div className="p-4 rounded-xl bg-[#11141A] border border-white/[0.08] space-y-3.5">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <div>
            <h3 className="text-xs font-bold text-white">Recommendation & Evidence Controls</h3>
            <p className="text-[10px] text-[#667085]">
              Toggle score cards, source citations, and confidence badges
            </p>
          </div>
        </div>

        {/* Toggle Rows */}
        <div className="space-y-2.5">
          {/* Recommendation Engine Enabled */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-white block">
                AI Recommendation Engine
              </span>
              <span className="text-[10px] text-[#667085]">
                Calculates live video-aware match percentages
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({
                  isRecommendationEngineEnabled: !optimizationSettings.isRecommendationEngineEnabled,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                optimizationSettings.isRecommendationEngineEnabled ? 'bg-[#7C5CFF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  optimizationSettings.isRecommendationEngineEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto Recommendation */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-white block">
                Auto Recommendation on Media Change
              </span>
              <span className="text-[10px] text-[#667085]">
                Recomputes metrics automatically when video is scrubbed
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({
                  isAutoRecommendationEnabled: !optimizationSettings.isAutoRecommendationEnabled,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                optimizationSettings.isAutoRecommendationEnabled ? 'bg-[#7C5CFF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  optimizationSettings.isAutoRecommendationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Compatibility Score */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-white block">
                Show Compatibility Score Badge
              </span>
              <span className="text-[10px] text-[#667085]">
                Displays percentage badges on library cards
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({
                  showCompatibilityScore: !optimizationSettings.showCompatibilityScore,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                optimizationSettings.showCompatibilityScore ? 'bg-[#7C5CFF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  optimizationSettings.showCompatibilityScore ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Evidence Sources & Why button */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-white block">
                Show Evidence &amp; Citations (&quot;Why?&quot; Button)
              </span>
              <span className="text-[10px] text-[#667085]">
                Transparently explains reasons and citations
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({
                  showEvidence: !optimizationSettings.showEvidence,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                optimizationSettings.showEvidence ? 'bg-[#7C5CFF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  optimizationSettings.showEvidence ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Confidence Rating */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-white block">
                Show Analysis Confidence Rating
              </span>
              <span className="text-[10px] text-[#667085]">
                Distinguishes high-evidence predictions from low-certainty
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({
                  showConfidence: !optimizationSettings.showConfidence,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                optimizationSettings.showConfidence ? 'bg-[#7C5CFF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  optimizationSettings.showConfidence ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Live Video Computer-Vision Diagnostics */}
      {videoAnalysisMetrics && (
        <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/[0.08] space-y-2.5">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span>Active Video Frame Analysis Diagnostics</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Luminance / Brightness</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.brightness}% ({videoAnalysisMetrics.brightness > 55 ? 'High Key' : 'Dark Background'})</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Color Temperature</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.colorTemperature}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Contrast Ratio</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.contrastRatio}:1</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Subject Location</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.subjectLocation}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Motion Dynamics</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.motionDynamics}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#667085] block">Negative Space</span>
              <span className="font-mono font-bold text-white">{videoAnalysisMetrics.negativeSpaceZone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
