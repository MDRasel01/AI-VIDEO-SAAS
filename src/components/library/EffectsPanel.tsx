'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { EFFECTS } from '@/data/mockData';
import { useEditor } from '@/context/EditorContext';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import EvidenceModal from '@/components/recommendations/EvidenceModal';
import BestCombinationModal from '@/components/recommendations/BestCombinationModal';
import {
  Wand2,
  Sparkles,
  Check,
  Search,
  GripVertical,
  Layers,
  Film,
  Sun,
  Flame,
  Wind,
  Vibrate,
  Gauge,
  CircleDot,
  Play,
  CheckCircle2,
  Filter,
  AlertTriangle,
  HelpCircle,
  Zap,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { EffectItem, TimelineClip, RecommendationEvidence } from '@/types';
import { effectRegistry, EffectRenderContext } from '@/services/effectEngine';

export default function EffectsPanel() {
  const {
    timelineClips,
    selectedClipId,
    setSelectedClipId,
    updateClip,
    currentTime,
    aspectRatio,
    pushSnapshot,
    seek,
    setIsPlaying,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
    evaluateEffect,
    optimizationSettings,
    videoAnalysisMetrics,
    reanalyzeVideo,
    overallEditingScore,
    bestRecommendationPackage,
  } = useEditor();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'highest' | 'lowest' | 'name'>('recommended');
  const [appliedToastId, setAppliedToastId] = useState<string | null>(null);
  const [hoveredEffectId, setHoveredEffectId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBestComboOpen, setIsBestComboOpen] = useState(false);
  const [previewTime, setPreviewTime] = useState<number>(0);

  // Live deterministic animation ticker for hovered effect cards
  useEffect(() => {
    if (!hoveredEffectId) return;
    let rafId: number;
    let start = performance.now();
    const tick = (now: number) => {
      setPreviewTime((now - start) / 1000);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hoveredEffectId]);

  // Evidence modal state
  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    title: string;
    evidence: RecommendationEvidence | null;
  }>({
    isOpen: false,
    title: '',
    evidence: null,
  });

  const categories = ['All', 'Motion', 'Cinematic', 'Light', 'Color'];

  // Identify active target clip (selected clip -> playhead clip -> first clip)
  const activeTargetClip = useMemo<TimelineClip | null>(() => {
    if (timelineClips.length === 0) return null;
    if (selectedClipId) {
      const found = timelineClips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    const atPlayhead = timelineClips.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    return atPlayhead || timelineClips[0];
  }, [timelineClips, selectedClipId, currentTime]);

  // Score all effects
  const scoredEffects = useMemo(() => {
    return EFFECTS.map((eff) => {
      const evaluation = evaluateEffect(eff);
      return {
        effect: eff,
        evaluation,
        score: evaluation.score,
      };
    });
  }, [evaluateEffect]);

  // Top 3 Recommended effects
  const top3Effects = useMemo(() => {
    return [...scoredEffects]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [scoredEffects]);

  // Filter & sort effects
  const filtered = useMemo(() => {
    let list = scoredEffects.filter(({ effect: e }) => {
      if (activeCategory !== 'All' && e.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = e.name.toLowerCase().includes(q);
        const matchesCat = e.category.toLowerCase().includes(q);
        const matchesDesc = e.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }
      return true;
    });

    if (sortBy === 'recommended' || sortBy === 'highest') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.score - b.score);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.effect.name.localeCompare(b.effect.name));
    }

    return list;
  }, [scoredEffects, activeCategory, searchQuery, sortBy]);

  const keyMap: Record<string, keyof TimelineClip['effects']> = {
    slow_zoom: 'slowZoom',
    film_grain: 'filmGrain',
    anamorphic_flare: 'lightLeak',
    soft_glow: 'glow',
    motion_blur: 'motionBlur',
    shake_impact: 'shake',
    vignette: 'vignette',
    dynamic_pan: 'pan',
    speed_ramp: 'speedRamp',
  };

  const handleUseThisEffect = (effect: EffectItem) => {
    if (!activeTargetClip) return;
    const targetKey = keyMap[effect.type] || (effect.type as any);
    if (!targetKey) return;

    pushSnapshot();
    const isCurrentlyActive = Boolean(activeTargetClip.effects?.[targetKey]);

    // Toggle or enable effect on target clip
    updateClip(activeTargetClip.id, {
      effects: {
        ...activeTargetClip.effects,
        [targetKey]: !isCurrentlyActive,
      },
    });

    setSelectedClipId(activeTargetClip.id);
    seek(activeTargetClip.start);
    setIsPlaying(true);

    setAppliedToastId(effect.id);
    setTimeout(() => setAppliedToastId(null), 1600);
  };

  const handleRemoveEffect = (effect: EffectItem) => {
    if (!activeTargetClip) return;
    const targetKey = keyMap[effect.type] || (effect.type as any);
    if (!targetKey) return;

    pushSnapshot();
    updateClip(activeTargetClip.id, {
      effects: {
        ...activeTargetClip.effects,
        [targetKey]: false,
      },
    });

    setAppliedToastId(`remove-${effect.id}`);
    setTimeout(() => setAppliedToastId(null), 1600);
  };

  const handleClearAllEffectsOnTarget = () => {
    if (!activeTargetClip) return;
    pushSnapshot();
    updateClip(activeTargetClip.id, {
      effects: {},
    });
    setAppliedToastId('clear-all');
    setTimeout(() => setAppliedToastId(null), 1600);
  };

  const handleApplyToAllClips = (effect: EffectItem) => {
    const targetKey = keyMap[effect.type] || (effect.type as any);
    if (!targetKey) return;

    pushSnapshot();
    timelineClips.forEach((c) => {
      updateClip(c.id, {
        effects: {
          ...c.effects,
          [targetKey]: true,
        },
      });
    });

    setIsPlaying(true);
    setAppliedToastId(`all-${effect.id}`);
    setTimeout(() => setAppliedToastId(null), 1600);
  };

  const handleRemoveFromAllClips = (effect: EffectItem) => {
    const targetKey = keyMap[effect.type] || (effect.type as any);
    if (!targetKey) return;

    pushSnapshot();
    timelineClips.forEach((c) => {
      updateClip(c.id, {
        effects: {
          ...c.effects,
          [targetKey]: false,
        },
      });
    });

    setAppliedToastId(`remove-all-${effect.id}`);
    setTimeout(() => setAppliedToastId(null), 1600);
  };

  const targetActiveEffectsCount = activeTargetClip
    ? Object.values(activeTargetClip.effects || {}).filter(Boolean).length
    : 0;

  const handleManualAnalyze = () => {
    setIsAnalyzing(true);
    reanalyzeVideo();
    setTimeout(() => setIsAnalyzing(false), 600);
  };

  const handleOpenEvidence = (effect: EffectItem, evidence: RecommendationEvidence) => {
    setEvidenceModalData({
      isOpen: true,
      title: `${effect.name} — Effect Compatibility Evidence`,
      evidence,
    });
  };

  // Compute aspect ratio CSS class for live preview frame
  const aspectClass = useMemo(() => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-44 max-w-[130px]';
      case '16:9':
        return 'aspect-[16/9] max-h-32 max-w-full';
      case '1:1':
        return 'aspect-square max-h-36 max-w-[140px]';
      case '4:5':
        return 'aspect-[4/5] max-h-40 max-w-[135px]';
      default:
        return 'aspect-[9/16] max-h-44 max-w-[130px]';
    }
  }, [aspectRatio]);

  // Icon mapping
  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'slow_zoom':
      case 'dynamic_pan':
        return Wand2;
      case 'film_grain':
        return Film;
      case 'anamorphic_flare':
        return Sun;
      case 'soft_glow':
        return Flame;
      case 'motion_blur':
        return Wind;
      case 'shake_impact':
        return Vibrate;
      case 'speed_ramp':
        return Gauge;
      case 'vignette':
        return CircleDot;
      default:
        return Sparkles;
    }
  };

  return (
    <div id="box-tab-effects-panel" className="h-full flex flex-col p-4 space-y-3.5 overflow-y-auto select-none">
      {/* Header & Ratio Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Visual Effects Engine</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#5B8CFF]/20 text-[#5B8CFF] border border-[#5B8CFF]/30 font-bold">
              {EFFECTS.length} FX
            </span>
          </h2>
          <p className="text-[11px] text-[#667085]">
            Drag and drop onto timeline clips or apply with 1-click
          </p>
        </div>

        {/* Target Clip Status Pill & Clear All FX */}
        {activeTargetClip && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-[#9CA3AF] max-w-[180px] truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="truncate">Target: {activeTargetClip.name}</span>
            </div>

            {targetActiveEffectsCount > 0 && (
              <button
                onClick={handleClearAllEffectsOnTarget}
                title="Remove all active visual effects from this target clip"
                className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-[10px] font-semibold flex items-center gap-1 transition shadow-sm"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear FX ({targetActiveEffectsCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Red Error / Warning Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* AI Recommendation Banner & Score Fit */}
      {(optimizationSettings.engineEnabled ?? optimizationSettings.isRecommendationEngineEnabled) && (optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#141E33] via-[#0E1320] to-[#0A101C] border border-[#5B8CFF]/35 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#5B8CFF]/20 text-[#5B8CFF] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-[#5B8CFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Effect Compatibility Fit</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-bold">
                    {overallEditingScore.effectScore}% FX Match
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                  Visual intensity and motion balance evaluated for {optimizationSettings.platform}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleManualAnalyze}
                disabled={isAnalyzing}
                title="Re-analyze visual effects"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#5B8CFF] ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </button>

              <button
                onClick={() => setIsBestComboOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Best Combo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search effects by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-lg outline-none focus:border-[#5B8CFF] transition placeholder-[#667085]"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] focus:border-[#5B8CFF] rounded-lg px-2.5 py-2 text-xs text-[#CBD5E1] outline-none cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="highest">Highest Match</option>
            <option value="lowest">Lowest Match</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#5B8CFF] text-white font-bold shadow-md shadow-[#5B8CFF]/20'
                  : 'bg-[#11141A] text-[#9CA3AF] hover:text-white border border-white/[0.06] hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* TOP 3 RECOMMENDED EFFECTS (If not searching) */}
      {!searchQuery && activeCategory === 'All' && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5B8CFF]" />
              <span>Recommended For This Video</span>
            </h3>
            <span className="text-[10px] text-[#94A3B8]">Top 3 FX</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {top3Effects.map(({ effect, evaluation }) => (
              <div
                key={`top-fx-${effect.id}`}
                onClick={() => handleUseThisEffect(effect)}
                className="p-2.5 rounded-xl bg-gradient-to-b from-[#141C2E] to-[#0A0F1A] border border-[#5B8CFF]/40 hover:border-[#5B8CFF] cursor-pointer transition flex flex-col justify-between group shadow-md"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-white truncate">{effect.name}</span>
                  <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.2 rounded border border-[#22C55E]/30">
                    {evaluation.score}%
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-[#94A3B8]">
                  <span>{effect.category}</span>
                  <span className="text-[#5B8CFF] group-hover:underline">Apply</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Effects Grid */}
      <div className="flex-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
            {filtered.map(({ effect: eff, evaluation }) => {
              const IconComp = getEffectIcon(eff.type);
              const targetKey = keyMap[eff.type] || (eff.type as any);
              const isEnabledOnTarget = Boolean(activeTargetClip?.effects?.[targetKey]);
              const isHovered = hoveredEffectId === eff.id;
              const isToastActive = appliedToastId === eff.id || appliedToastId === `all-${eff.id}`;

              const scoreColor =
                evaluation.score >= 90
                  ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
                  : evaluation.score >= 80
                  ? 'text-[#5B8CFF] bg-[#5B8CFF]/15 border-[#5B8CFF]/30'
                  : 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';

              const effectDef = effectRegistry.getByKey(targetKey);
              const cardPreviewOutput = isHovered && effectDef
                ? effectDef.evaluate(
                    { intensity: eff.intensity || 75 },
                    {
                      currentTime: previewTime,
                      clipProgress: (previewTime % 3) / 3,
                      clipDuration: 3,
                      isPlaying: true,
                      resolution: { width: 300, height: 400 },
                      aspectRatio: aspectRatio,
                      seed: 42,
                    }
                  )
                : null;

              return (
                <div
                  key={eff.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ type: 'EFFECT', effect: eff })
                    );
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onMouseEnter={() => setHoveredEffectId(eff.id)}
                  onMouseLeave={() => setHoveredEffectId(null)}
                  className={`group relative rounded-xl bg-[#11141A] hover:bg-[#151820] border p-3 flex flex-col justify-between space-y-2.5 transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                    isEnabledOnTarget
                      ? 'border-[#5B8CFF] shadow-[0_0_20px_rgba(91,140,255,0.25)] ring-1 ring-[#5B8CFF]/50'
                      : 'border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-[#9CA3AF] border border-white/[0.06]">
                        {eff.category}
                      </span>
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.03] text-[#667085] border border-white/[0.05]">
                        {aspectRatio} ✓
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isEnabledOnTarget && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          ACTIVE
                        </span>
                      )}
                      <div
                        title="Drag & Drop onto any timeline clip"
                        className="p-1 text-[#667085] group-hover:text-white transition cursor-grab"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Conflict Warning if present */}
                  {evaluation.conflictWarning && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 text-[10px] text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{evaluation.conflictWarning}</span>
                    </div>
                  )}

                  {/* Aspect-Ratio-Aware Live Effect Visual Preview Box */}
                  <div className="flex justify-center w-full py-1">
                    <div
                      onClick={() => handleUseThisEffect(eff)}
                      className={`relative ${aspectClass} w-full rounded-lg overflow-hidden bg-[#07080B] border border-white/[0.08] flex items-center justify-center cursor-pointer group/preview shadow-inner`}
                    >
                      {/* Media Background Simulation (Exact Effect Renderer) */}
                      <div
                        className="absolute inset-0 transition-transform duration-300 ease-out"
                        style={{
                          transform: isHovered && cardPreviewOutput?.transform
                            ? `scale(${cardPreviewOutput.transform.scale.toFixed(3)}) translate(${cardPreviewOutput.transform.translateX.toFixed(1)}px, ${cardPreviewOutput.transform.translateY.toFixed(1)}px)`
                            : 'scale(1) translate(0px, 0px)',
                          filter: isHovered && cardPreviewOutput?.filters
                            ? [
                                cardPreviewOutput.filters.blur ? `blur(${cardPreviewOutput.filters.blur}px)` : '',
                                cardPreviewOutput.filters.brightness ? `brightness(${cardPreviewOutput.filters.brightness}%)` : '',
                                cardPreviewOutput.filters.contrast ? `contrast(${cardPreviewOutput.filters.contrast}%)` : '',
                                cardPreviewOutput.filters.saturate ? `saturate(${cardPreviewOutput.filters.saturate}%)` : '',
                                cardPreviewOutput.filters.sepia ? `sepia(${cardPreviewOutput.filters.sepia}%)` : '',
                                cardPreviewOutput.filters.dropShadow || '',
                              ]
                                .filter(Boolean)
                                .join(' ') || undefined
                            : undefined,
                        }}
                      >
                        {activeTargetClip?.thumbnail ? (
                          <img
                            src={activeTargetClip.thumbnail}
                            alt={eff.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#1E293B] to-[#334155] flex items-center justify-center text-[10px] font-mono text-white/40 font-bold">
                            CANVAS
                          </div>
                        )}
                      </div>

                      {/* Live Effect Shader Simulations via effectRegistry overlays */}
                      {isHovered &&
                        cardPreviewOutput?.overlays.map((ov) => (
                          <div
                            key={ov.id}
                            className={`absolute inset-0 pointer-events-none ${
                              ov.mixBlendMode === 'screen'
                                ? 'mix-blend-screen'
                                : ov.mixBlendMode === 'overlay'
                                ? 'mix-blend-overlay'
                                : ''
                            }`}
                            style={{
                              opacity: ov.opacity,
                              ...ov.cssStyle,
                            }}
                          >
                            {ov.type === 'light_leak' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 via-blue-500/40 via-amber-300/30 to-transparent blur-xs" />
                            )}
                            {ov.type === 'glow_bloom' && (
                              <div className="absolute inset-0 bg-amber-400/20 mix-blend-screen blur-xs" />
                            )}
                            {ov.type === 'vignette' && (
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
                            )}
                          </div>
                        ))}

                      {/* Fallback Static Vignette for preview clarity */}
                      {!isHovered && eff.type === 'vignette' && (
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
                      )}

                      {/* Center Play Overlay on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                        <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                          <Play className="w-3 h-3 fill-white" />
                          <span>{isEnabledOnTarget ? 'Toggle Off' : 'Apply'}</span>
                        </div>
                      </div>

                      {/* Bottom Left Type & Intensity Badge */}
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-white flex items-center gap-1 text-[9px] font-mono">
                        <IconComp className="w-2.5 h-2.5 text-[#5B8CFF]" />
                        <span>{eff.intensity || 75}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Title, Compatibility Score & Why Button */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate" title={eff.name}>
                        {eff.name}
                      </h4>

                      <div className="flex items-center gap-1 shrink-0">
                        {(optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
                          <div
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${scoreColor}`}
                            title="Video Compatibility Score: Estimates visual characteristics and motion fit."
                          >
                            <span>{evaluation.score}%</span>
                            <span className="text-[8px] font-normal uppercase">{evaluation.grade}</span>
                          </div>
                        )}

                        {(optimizationSettings.showEvidence ?? true) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEvidence(eff, evaluation);
                            }}
                            className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/[0.08] text-[10px] font-medium flex items-center gap-0.5 transition"
                            title="Why am I seeing this recommendation? Open Evidence Analysis"
                          >
                            <HelpCircle className="w-3 h-3 text-[#5B8CFF]" />
                            <span>Why?</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-tight">
                      {eff.description}
                    </p>

                    {/* Breakdown Details */}
                    {(optimizationSettings.showDetails ?? optimizationSettings.showAnalysisDetails) && evaluation.breakdown && (
                      <div className="pt-0.5 flex items-center justify-between text-[9px] font-mono text-[#667085]">
                        <span>Visual: {evaluation.breakdown.visualFitScore}%</span>
                        <span>Intensity: {evaluation.breakdown.intensityScore}%</span>
                        <span>Motion: {evaluation.breakdown.motionScore}%</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Use This / Remove / All Clips */}
                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => handleUseThisEffect(eff)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm group/btn ${
                        isToastActive
                          ? 'bg-[#22C55E] text-white'
                          : isEnabledOnTarget
                          ? 'bg-[#5B8CFF]/20 hover:bg-red-500/20 text-[#5B8CFF] hover:text-red-400 border border-[#5B8CFF]/40 hover:border-red-500/40'
                          : 'bg-[#0D0F14] hover:bg-[#5B8CFF] text-[#5B8CFF] hover:text-white border border-[#5B8CFF]/35 hover:border-transparent'
                      }`}
                    >
                      {isToastActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Updated!</span>
                        </>
                      ) : isEnabledOnTarget ? (
                        <>
                          <Check className="w-3.5 h-3.5 group-hover/btn:hidden text-[#22C55E]" />
                          <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:inline text-red-400" />
                          <span className="group-hover/btn:hidden text-white">Active</span>
                          <span className="hidden group-hover/btn:inline text-red-400">Remove</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Use This</span>
                        </>
                      )}
                    </button>

                    {/* Dedicated 1-Click Delete Button when active */}
                    {isEnabledOnTarget && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEffect(eff);
                        }}
                        title="Delete this effect from the active clip"
                        className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEnabledOnTarget) {
                          handleRemoveFromAllClips(eff);
                        } else {
                          handleApplyToAllClips(eff);
                        }
                      }}
                      title={isEnabledOnTarget ? 'Remove this effect from all clips' : 'Enable this effect on all timeline clips'}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium transition ${
                        isEnabledOnTarget
                          ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300'
                          : 'bg-[#0D0F14] hover:bg-white/10 border-white/[0.08] text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {isEnabledOnTarget ? 'Clear All' : 'All Clips'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 text-center space-y-3 px-4 rounded-xl border border-white/[0.05] bg-[#0D0F14]/50">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-[#667085]">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">No effects found</h4>
              <p className="text-[11px] text-[#667085] mt-1 max-w-[220px] mx-auto">
                No effect matches &quot;{searchQuery}&quot; in category &quot;{activeCategory}&quot;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#5B8CFF]/20 hover:bg-[#5B8CFF] text-[#5B8CFF] hover:text-white text-xs font-bold border border-[#5B8CFF]/40 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData({ ...evidenceModalData, isOpen: false })}
        title={evidenceModalData.title}
        itemType="Visual Effect"
        evidence={evidenceModalData.evidence}
      />

      {/* 1-Click Best Combination Modal */}
      <BestCombinationModal
        isOpen={isBestComboOpen}
        onClose={() => setIsBestComboOpen(false)}
        bestText={bestRecommendationPackage.bestText}
        bestTransition={bestRecommendationPackage.bestTransition}
        bestEffect={bestRecommendationPackage.bestEffect}
        overallScore={bestRecommendationPackage.overallScore}
      />
    </div>
  );
}
