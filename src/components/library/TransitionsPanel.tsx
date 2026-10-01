'use client';

import React, { useState, useMemo } from 'react';
import { useEditor } from '@/context/EditorContext';
import TransitionPreviewCard from './TransitionPreviewCard';
import CreateCustomTransitionModal from './CreateCustomTransitionModal';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import EvidenceModal from '@/components/recommendations/EvidenceModal';
import BestCombinationModal from '@/components/recommendations/BestCombinationModal';
import { TransitionItem, TransitionCategory, TimelineTransition, TimelineClip, RecommendationEvidence } from '@/types';
import { calculateSafeDuration } from '@/services/transitionIntelligence';
import {
  Search,
  Sparkles,
  Zap,
  Plus,
  Heart,
  Clock,
  Wand2,
  Filter,
  CheckCircle2,
  Layers,
  RefreshCw,
  Info,
} from 'lucide-react';

const CATEGORIES: TransitionCategory[] = [
  'All',
  'Favorites',
  'Recently Used',
  'Smooth',
  'Cinematic',
  'Dynamic',
  'Motion',
  'Zoom',
  'Camera',
  'Swipe',
  'Push',
  'Spin',
  'Blur',
  'Flash',
  'Glitch',
  'Light',
  'Distortion',
  'Speed',
  'Mask',
  '3D',
  'Advanced',
  'Custom',
];

export default function TransitionsPanel() {
  const {
    allTransitionsList,
    timelineClips,
    setTimelineClips,
    currentTime,
    timelineTransitions,
    setTimelineTransitions,
    selectedTransitionId,
    setSelectedTransitionId,
    updateTransition,
    favoriteTransitionIds,
    recentTransitionIds,
    optimizeAllTransitions,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
    pushSnapshot,
    seek,
    setIsPlaying,
    selectedTemplate,
    selectedPlatform,
    evaluateTransition,
    optimizationSettings,
    videoAnalysisMetrics,
    reanalyzeVideo,
    overallEditingScore,
    bestRecommendationPackage,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransitionCategory>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'highest' | 'lowest' | 'name'>('recommended');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isOptimizingToast, setIsOptimizingToast] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBestComboOpen, setIsBestComboOpen] = useState(false);

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

  // Calculate scores for all transitions
  const scoredTransitions = useMemo(() => {
    return allTransitionsList.map((t) => {
      const evaluation = evaluateTransition(t);
      return {
        transition: t,
        evaluation,
        score: evaluation.score,
      };
    });
  }, [allTransitionsList, evaluateTransition]);

  // Top 3 Recommendations
  const top3Transitions = useMemo(() => {
    return [...scoredTransitions]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [scoredTransitions]);

  // Filter & Sort transitions
  const filteredTransitions = useMemo(() => {
    let list = scoredTransitions.filter(({ transition: t }) => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favoriteTransitionIds.includes(t.id)) return false;
      } else if (selectedCategory === 'Recently Used') {
        if (!recentTransitionIds.includes(t.type) && !recentTransitionIds.includes(t.id)) return false;
      } else if (selectedCategory === 'Custom') {
        if (!t.isCustom) return false;
      } else if (selectedCategory !== 'All') {
        if (
          t.category.toLowerCase() !== selectedCategory.toLowerCase() &&
          !t.name.toLowerCase().includes(selectedCategory.toLowerCase())
        ) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesVar = t.variations?.some((v) => v.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesDesc && !matchesVar) return false;
      }

      return true;
    });

    if (sortBy === 'recommended' || sortBy === 'highest') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.score - b.score);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.transition.name.localeCompare(b.transition.name));
    }

    return list.map((item) => item.transition);
  }, [
    scoredTransitions,
    selectedCategory,
    searchQuery,
    favoriteTransitionIds,
    recentTransitionIds,
    sortBy,
  ]);

  const handleApplyToActiveCut = (transition: TransitionItem, variation?: string) => {
    pushSnapshot();

    if (timelineClips.length === 0) return;

    // CASE 1: Single Clip -> Automatically split clip at playhead/midpoint to create a real cut point!
    if (timelineClips.length === 1) {
      const singleClip = timelineClips[0];
      const clipDuration = singleClip.duration;

      // Determine split point (inside clip margin or exact middle)
      let splitAt = currentTime;
      if (splitAt <= singleClip.start + 0.4 || splitAt >= singleClip.end - 0.4) {
        splitAt = parseFloat((singleClip.start + clipDuration / 2).toFixed(2));
      }

      const speed = singleClip.speed || 1.0;
      const firstDuration = parseFloat((splitAt - singleClip.start).toFixed(2));
      const secondDuration = parseFloat((singleClip.end - splitAt).toFixed(2));

      const sourceFirst = parseFloat((firstDuration * speed).toFixed(3));
      const sourceSecond = parseFloat((secondDuration * speed).toFixed(3));

      const firstPartId = singleClip.id;
      const secondPartId = `tclip-${Date.now()}`;

      const firstPart: TimelineClip = {
        ...singleClip,
        id: firstPartId,
        duration: firstDuration,
        end: splitAt,
        clipOut: singleClip.clipIn + sourceFirst,
        sourceDuration: sourceFirst,
      };

      const secondPart: TimelineClip = {
        ...singleClip,
        id: secondPartId,
        name: `${singleClip.name} (Part 2)`,
        start: splitAt,
        end: singleClip.end,
        duration: secondDuration,
        clipIn: singleClip.clipIn + sourceFirst,
        clipOut: singleClip.clipOut,
        sourceDuration: sourceSecond,
      };

      const safeDur = calculateSafeDuration(firstPart, secondPart, selectedTemplate, selectedPlatform);
      const newTransId = `trans-${Date.now()}`;
      const newTrans: TimelineTransition = {
        id: newTransId,
        fromClipId: firstPart.id,
        toClipId: secondPart.id,
        position: splitAt,
        name: variation || transition.name,
        type: transition.type,
        category: transition.category,
        duration: safeDur,
        intensity: 'Medium',
        variationName: variation,
        direction: transition.defaultDirection || 'in',
        easing: transition.defaultEasing || 'ease_in_out',
        zoomAmount: transition.defaultZoom || 18,
        motionBlurAmount: transition.defaultMotionBlur || 20,
        intensityPercent: transition.defaultIntensity || 75,
      };

      setTimelineClips([firstPart, secondPart]);
      setTimelineTransitions([newTrans]);
      setSelectedTransitionId(newTransId);
      seek(Math.max(0, splitAt - 0.6));
      setIsPlaying(true);
      return;
    }

    // CASE 2: Multi-Clip Timeline -> Find closest cut point or selected transition
    let bestCutIndex = 0;
    let minDistance = Infinity;

    if (selectedTransitionId) {
      const selectedTrans = timelineTransitions.find((t) => t.id === selectedTransitionId);
      if (selectedTrans) {
        const foundIdx = timelineClips.findIndex((c) => c.id === selectedTrans.fromClipId);
        if (foundIdx !== -1 && foundIdx < timelineClips.length - 1) {
          bestCutIndex = foundIdx;
          minDistance = 0;
        }
      }
    }

    if (minDistance === Infinity) {
      for (let i = 0; i < timelineClips.length - 1; i++) {
        const cutPos = timelineClips[i].end;
        const dist = Math.abs(currentTime - cutPos);
        if (dist < minDistance) {
          minDistance = dist;
          bestCutIndex = i;
        }
      }
    }

    const fromClip = timelineClips[bestCutIndex];
    const toClip = timelineClips[bestCutIndex + 1];
    if (!fromClip || !toClip) return;

    const cutPosition = fromClip.end;
    const safeDur = calculateSafeDuration(fromClip, toClip, selectedTemplate, selectedPlatform);

    const existingTransAtCut = timelineTransitions.find(
      (t) =>
        (t.fromClipId === fromClip.id && t.toClipId === toClip.id) ||
        Math.abs(t.position - cutPosition) < 0.4
    );

    if (existingTransAtCut) {
      // Update existing transition
      setTimelineTransitions((prev) =>
        prev.map((t) =>
          t.id === existingTransAtCut.id
            ? {
                ...t,
                fromClipId: fromClip.id,
                toClipId: toClip.id,
                position: cutPosition,
                name: variation || transition.name,
                type: transition.type,
                category: transition.category,
                duration: safeDur,
                variationName: variation,
                direction: transition.defaultDirection || 'in',
                easing: transition.defaultEasing || 'ease_in_out',
                zoomAmount: transition.defaultZoom || 18,
                motionBlurAmount: transition.defaultMotionBlur || 20,
                intensityPercent: transition.defaultIntensity || 75,
              }
            : t
        )
      );
      setSelectedTransitionId(existingTransAtCut.id);
    } else {
      // Add new transition at this cut point
      const newTransId = `trans-${Date.now()}`;
      const newTrans: TimelineTransition = {
        id: newTransId,
        fromClipId: fromClip.id,
        toClipId: toClip.id,
        position: cutPosition,
        name: variation || transition.name,
        type: transition.type,
        category: transition.category,
        duration: safeDur,
        intensity: 'Medium',
        variationName: variation,
        direction: transition.defaultDirection || 'in',
        easing: transition.defaultEasing || 'ease_in_out',
        zoomAmount: transition.defaultZoom || 18,
        motionBlurAmount: transition.defaultMotionBlur || 20,
        intensityPercent: transition.defaultIntensity || 75,
      };

      setTimelineTransitions((prev) => {
        const validPrev = prev.filter((t) => {
          const f = timelineClips.find((c) => c.id === t.fromClipId);
          const to = timelineClips.find((c) => c.id === t.toClipId);
          return Boolean(f && to);
        });
        return [...validPrev, newTrans];
      });
      setSelectedTransitionId(newTransId);
    }

    seek(Math.max(0, cutPosition - 0.6));
    setIsPlaying(true);
  };

  const handleApplyToAllCuts = (transition: TransitionItem) => {
    pushSnapshot();
    if (timelineClips.length < 2) {
      handleApplyToActiveCut(transition);
      return;
    }

    const newTransitions: TimelineTransition[] = [];
    for (let i = 0; i < timelineClips.length - 1; i++) {
      const fromClip = timelineClips[i];
      const toClip = timelineClips[i + 1];
      const safeDur = calculateSafeDuration(fromClip, toClip, selectedTemplate, selectedPlatform);
      newTransitions.push({
        id: `trans-${Date.now()}-${i}`,
        fromClipId: fromClip.id,
        toClipId: toClip.id,
        position: fromClip.end,
        name: transition.name,
        type: transition.type,
        category: transition.category,
        duration: safeDur,
        intensity: 'Medium',
        direction: transition.defaultDirection || 'in',
        easing: transition.defaultEasing || 'ease_in_out',
        zoomAmount: transition.defaultZoom || 18,
        motionBlurAmount: transition.defaultMotionBlur || 20,
        intensityPercent: transition.defaultIntensity || 75,
      });
    }
    setTimelineTransitions(newTransitions);
    if (newTransitions.length > 0) {
      setSelectedTransitionId(newTransitions[0].id);
      seek(Math.max(0, (newTransitions[0].position || 2) - 0.6));
      setIsPlaying(true);
    }
  };

  const handleBulkOptimize = () => {
    optimizeAllTransitions();
    setIsOptimizingToast(true);
    setTimeout(() => setIsOptimizingToast(false), 2000);
  };

  const handleManualAnalyze = () => {
    setIsAnalyzing(true);
    reanalyzeVideo();
    setTimeout(() => setIsAnalyzing(false), 600);
  };

  const handleOpenEvidence = (transition: TransitionItem, evidence: RecommendationEvidence) => {
    setEvidenceModalData({
      isOpen: true,
      title: `${transition.name} — Transition Compatibility Evidence`,
      evidence,
    });
  };

  return (
    <div id="box-tab-transitions-panel" className="h-full flex flex-col p-4 space-y-3.5 overflow-y-auto select-none">
      {/* Header & Quick Optimization Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Transition Engine</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30 font-bold">
              {allTransitionsList.length} Styles
            </span>
          </h2>
          <p className="text-[11px] text-[#667085]">
            Dynamic clip-aware blending with live compatibility scoring
          </p>
        </div>

        {/* Create Custom Transition Preset */}
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#11141A] hover:bg-white/10 text-white text-xs font-semibold border border-white/[0.1] transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>Custom Preset</span>
        </button>
      </div>

      {/* Dynamic Red Diagnostic Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* AI Recommendation Banner & Score Fit */}
      {(optimizationSettings.engineEnabled ?? optimizationSettings.isRecommendationEngineEnabled) && (optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1A1429] via-[#0E0F17] to-[#121324] border border-[#7C5CFF]/35 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Transition Compatibility Fit</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-bold">
                    {overallEditingScore.transitionScore}% Transition Match
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                  Analyzing {timelineClips.length} clips • Short clip protection active (&gt;0.3s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleManualAnalyze}
                disabled={isAnalyzing}
                title="Re-analyze consecutive video cuts"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#7C5CFF] ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </button>

              <button
                onClick={() => setIsBestComboOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/25 transition flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Best Combo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk 1-Click Optimization Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#7C5CFF]/15 via-[#5B8CFF]/10 to-transparent border border-[#7C5CFF]/35 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Intelligent Cut Optimization</span>
              {isOptimizingToast && (
                <span className="text-[10px] text-[#22C55E] flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Optimized All!
                </span>
              )}
            </h4>
            <p className="text-[10px] text-[#9CA3AF] leading-tight">
              Automatically calculates safe duration and compatibility for all cuts
            </p>
          </div>
        </div>

        <button
          onClick={handleBulkOptimize}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/30 hover:brightness-110 active:scale-95 transition shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimize All</span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transitions by name, category, or variation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] transition placeholder-[#667085]"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] focus:border-[#7C5CFF] rounded-lg px-2.5 py-2 text-xs text-[#CBD5E1] outline-none cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="highest">Highest Match</option>
            <option value="lowest">Lowest Match</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills (Scrollable Row) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#7C5CFF] text-white font-bold shadow-md shadow-[#7C5CFF]/20'
                  : 'bg-[#11141A] text-[#9CA3AF] hover:text-white border border-white/[0.06] hover:bg-white/5'
              }`}
            >
              {cat === 'Favorites' && <Heart className="w-3 h-3 text-[#EF4444] fill-current" />}
              {cat === 'Recently Used' && <Clock className="w-3 h-3 text-[#5B8CFF]" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* TOP 3 RECOMMENDED SECTION (If not searching) */}
      {!searchQuery && selectedCategory === 'All' && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Recommended For This Video</span>
            </h3>
            <span className="text-[10px] text-[#94A3B8]">Top 3 Transitions</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {top3Transitions.map(({ transition, evaluation }) => (
              <div
                key={`top-trans-${transition.id}`}
                onClick={() => handleApplyToActiveCut(transition)}
                className="p-2.5 rounded-xl bg-gradient-to-b from-[#1C162E] to-[#0D0B14] border border-[#7C5CFF]/40 hover:border-[#7C5CFF] cursor-pointer transition flex flex-col justify-between group shadow-md"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-white truncate">{transition.name}</span>
                  <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.2 rounded border border-[#22C55E]/30">
                    {evaluation.score}%
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-[#94A3B8]">
                  <span>{transition.category}</span>
                  <span className="text-[#7C5CFF] group-hover:underline">Apply</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transition Cards Grid */}
      <div className="flex-1">
        {filteredTransitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
            {filteredTransitions.map((transition) => (
              <TransitionPreviewCard
                key={transition.id}
                transition={transition}
                onApplyToActiveCut={handleApplyToActiveCut}
                onApplyToAllCuts={handleApplyToAllCuts}
                onOpenEvidence={handleOpenEvidence}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 text-center space-y-3 px-4 rounded-xl border border-white/[0.05] bg-[#0D0F14]/50">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-[#667085]">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">No transitions found</h4>
              <p className="text-[11px] text-[#667085] mt-1 max-w-[220px] mx-auto">
                No transition matches &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#7C5CFF]/20 hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white text-xs font-bold border border-[#7C5CFF]/40 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Custom Transition Modal */}
      <CreateCustomTransitionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData({ ...evidenceModalData, isOpen: false })}
        title={evidenceModalData.title}
        itemType="Transition"
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
