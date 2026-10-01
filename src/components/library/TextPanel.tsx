'use client';

import React, { useState, useMemo } from 'react';
import { useEditor } from '@/context/EditorContext';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import EvidenceModal from '@/components/recommendations/EvidenceModal';
import BestCombinationModal from '@/components/recommendations/BestCombinationModal';
import {
  Type,
  Sparkles,
  Plus,
  Check,
  Search,
  Layers,
  Wand2,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  MonitorPlay,
  Smartphone,
  LayoutGrid,
  ShieldCheck,
  ArrowUpDown,
  Zap,
  Info,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { TextTemplate, AspectRatio, RecommendationEvidence } from '@/types';

export default function TextPanel() {
  const {
    timelineText,
    setTimelineText,
    totalDuration,
    setSelectedTextId,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
    textTemplates,
    applyTextTemplate,
    aspectRatio,
    activeClip,
    videos,
    optimizationSettings,
    videoAnalysisMetrics,
    reanalyzeVideo,
    evaluateTextTemplate,
    overallEditingScore,
    bestRecommendationPackage,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState<'ratio' | 'compact'>('ratio');
  const [sortBy, setSortBy] = useState<'recommended' | 'highest' | 'lowest' | 'name'>('recommended');
  
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

  // Best combination modal state
  const [isBestComboOpen, setIsBestComboOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'modern', label: 'Modern' },
    { id: 'bold', label: 'Bold' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'social', label: 'Social / Viral' },
    { id: 'tech', label: 'Tech / Mono' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'retro', label: 'Retro / Neon' },
  ];

  // Active video thumbnail for realistic video preview background
  const activeThumbnail =
    activeClip?.thumbnail ||
    videos[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80';

  // Helper for responsive aspect-ratio sizing
  const getAspectRatioClasses = (ratio: string) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16] h-48 max-w-[124px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-h-36';
      case '1:1':
        return 'aspect-square h-40 max-w-[160px]';
      case '4:5':
        return 'aspect-[4/5] h-44 max-w-[140px]';
      case '21:9':
        return 'aspect-[21/9] w-full max-h-32';
      default:
        return 'aspect-[9/16] h-48 max-w-[124px]';
    }
  };

  // Map each text template with its calculated compatibility score & evaluation
  const scoredTemplates = useMemo(() => {
    return (textTemplates || []).map((tmpl) => {
      const evaluation = evaluateTextTemplate(tmpl);
      return {
        template: tmpl,
        evaluation,
        score: evaluation.score,
      };
    });
  }, [textTemplates, evaluateTextTemplate]);

  // Top 3 recommendations for this video
  const top3Templates = useMemo(() => {
    return [...scoredTemplates]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [scoredTemplates]);

  // Filter & sort templates
  const processedTemplates = useMemo(() => {
    let list = scoredTemplates.filter(({ template }) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        template.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.font.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.tags && template.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'recommended' || sortBy === 'highest') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.score - b.score);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.template.name.localeCompare(b.template.name));
    }

    return list;
  }, [scoredTemplates, selectedCategory, searchQuery, sortBy]);

  // Handle "+ Add New Text Overlay"
  const handleAddNewText = () => {
    const defaultTemplate = textTemplates[0] || {
      id: 'tmpl-modern-minimal',
      name: 'Modern Minimal',
      category: 'modern',
      font: 'Inter',
      weight: '700',
      color: '#FFFFFF',
      animation: 'slide_up',
      sampleText: 'EXPLORE',
      sampleSubText: 'THE WORLD',
    };
    applyTextTemplate(defaultTemplate, false);
    setSelectedTextId('text-1');
  };

  // Trigger manual video re-analysis
  const handleManualAnalyze = () => {
    setIsAnalyzing(true);
    reanalyzeVideo();
    setTimeout(() => setIsAnalyzing(false), 600);
  };

  // Open evidence modal for a template
  const handleOpenEvidence = (template: TextTemplate, evidence: RecommendationEvidence) => {
    setEvidenceModalData({
      isOpen: true,
      title: `${template.name} — Text Compatibility Evidence`,
      evidence,
    });
  };

  // Live text for preview cards: User's actual project text or template default
  const activeUserTitle = timelineText?.text || 'SUMMER SALE';
  const activeUserSubtitle = timelineText?.subText || '50% OFF TODAY';

  return (
    <div id="box-tab-text-panel" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar select-none">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Dynamic Text Library</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
              {textTemplates?.length || 0} Templates
            </span>
          </h2>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            AI-powered video compatibility scoring &amp; readability intelligence
          </p>
        </div>

        {/* Add New Text Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNewText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Text</span>
          </button>
        </div>
      </div>

      {/* Dynamic Red Error / Warning Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* Video Compatibility & 1-Click Package Banner */}
      {(optimizationSettings.engineEnabled ?? optimizationSettings.isRecommendationEngineEnabled) && (optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#131B2E] border border-[#3B82F6]/30 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-[#60A5FA]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Video Compatibility Fit</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-bold">
                    {overallEditingScore.textScore}% Text Match
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                  Based on: {optimizationSettings.platform} guidance + Frame analysis ({videoAnalysisMetrics.darkBackgroundAvailable || videoAnalysisMetrics.isDarkBackground ? 'Dark' : 'Light'} backdrop, {videoAnalysisMetrics.subjectLocation || 'Center'} subject)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleManualAnalyze}
                disabled={isAnalyzing}
                title="Re-analyze currently active video frames"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#60A5FA] ${isAnalyzing ? 'animate-spin' : ''}`} />
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

          {/* Background Contrast & Readability Tip */}
          <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-[11px] text-[#CBD5E1]">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
              <span>
                {videoAnalysisMetrics.darkBackgroundAvailable || videoAnalysisMetrics.isDarkBackground
                  ? 'Dark background detected: White / Yellow / Gold text gives 98% WCAG contrast.'
                  : 'Bright background detected: High-weight text with dark container or shadow recommended.'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 font-medium">
              Profile: {optimizationSettings.platform}
            </span>
          </div>
        </div>
      )}

      {/* Ratio Sync Banner */}
      <div className="p-2.5 rounded-xl bg-[#131B2E] border border-[#3B82F6]/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 text-[#60A5FA]">
            <MonitorPlay className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#93C5FD] font-mono uppercase tracking-wider flex items-center gap-1">
              <span>Ratio Synced:</span>
              <span className="text-white font-bold">{aspectRatio}</span>
              <span className="text-slate-400 font-normal">
                ({aspectRatio === '9:16' ? 'Reels/TikTok/Shorts' : aspectRatio === '16:9' ? 'YouTube/Landscape' : 'Square'})
              </span>
            </div>
            <div className="text-[10px] text-slate-300 truncate font-medium">
              Target Text: &quot;{activeUserTitle}&quot;
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <button
          onClick={() => setPreviewMode(previewMode === 'ratio' ? 'compact' : 'ratio')}
          title="Toggle between Video Ratio Frame and Compact Preview"
          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 transition"
        >
          {previewMode === 'ratio' ? (
            <>
              <Smartphone className="w-3 h-3 text-[#60A5FA]" />
              <span>Ratio View</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3 h-3 text-[#60A5FA]" />
              <span>Compact</span>
            </>
          )}
        </button>
      </div>

      {/* Search & Sort Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search styles (Modern, Bold, Neon, Cinematic...)"
            className="w-full bg-[#0D111A] border border-white/[0.08] focus:border-[#3B82F6] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#667085] outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#9CA3AF] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#0D111A] border border-white/[0.08] focus:border-[#3B82F6] rounded-xl px-2.5 py-1.5 text-xs text-[#CBD5E1] outline-none cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="highest">Highest Match</option>
            <option value="lowest">Lowest Match</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'bg-[#11141A] text-[#9CA3AF] hover:bg-white/[0.06] hover:text-white border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* TOP 3 RECOMMENDED SECTION (If not filtering by search) */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Recommended For This Video</span>
            </h3>
            <span className="text-[10px] text-[#94A3B8]">Top 3 Matches</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {top3Templates.map(({ template, evaluation }) => (
              <div
                key={`top-${template.id}`}
                onClick={() => applyTextTemplate(template, true)}
                className="p-2.5 rounded-xl bg-gradient-to-b from-[#131B2E] to-[#0A0E17] border border-[#3B82F6]/40 hover:border-[#3B82F6] cursor-pointer transition flex flex-col justify-between group shadow-md"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-white truncate">{template.name}</span>
                  <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.2 rounded border border-[#22C55E]/30">
                    {evaluation.score}%
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-[#94A3B8]">
                  <span>{template.font}</span>
                  <span className="text-[#60A5FA] group-hover:underline">Apply</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid List */}
      <div className="space-y-3">
        {processedTemplates.length === 0 ? (
          <div className="text-center py-8 text-[#667085] text-xs">
            No text templates found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          processedTemplates.map(({ template, evaluation }) => {
            const isCurrent =
              timelineText?.styleId === template.id ||
              timelineText?.stylePresetName === template.name;

            const scoreColor =
              evaluation.score >= 90
                ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
                : evaluation.score >= 80
                ? 'text-[#60A5FA] bg-[#60A5FA]/15 border-[#60A5FA]/30'
                : 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';

            return (
              <div
                key={template.id}
                className={`rounded-xl bg-[#0D111A] hover:bg-[#121722] border p-3 space-y-2.5 transition-all group ${
                  isCurrent
                    ? 'border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-[#3B82F6]'
                    : 'border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                {/* Card Top: Name, Font, Compatibility Score & Why Button */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: template.color || '#3B82F6' }}
                    />
                    <h4 className="text-xs font-bold text-white group-hover:text-[#60A5FA] transition truncate">
                      {template.name}
                    </h4>
                  </div>

                  {/* Compatibility Score & Why Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(optimizationSettings.showScores ?? optimizationSettings.showCompatibilityScore) && (
                      <div
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${scoreColor}`}
                        title="Video Compatibility Score: Estimates visual readability and composition fit for this video."
                      >
                        <span>{evaluation.score}% Match</span>
                      </div>
                    )}

                    {(optimizationSettings.showEvidence ?? true) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEvidence(template, evaluation);
                        }}
                        className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/[0.08] text-[10px] font-medium flex items-center gap-0.5 transition"
                        title="Why am I seeing this recommendation? Open Analysis Evidence & Verified Sources"
                      >
                        <HelpCircle className="w-3 h-3 text-[#60A5FA]" />
                        <span>Why?</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Second Row: Font, Category Tag, Confidence */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#9CA3AF] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                      {template.font}
                    </span>
                    <span className="font-mono text-[#60A5FA] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 capitalize">
                      {template.category}
                    </span>
                  </div>

                  {(optimizationSettings.showConfidence ?? true) && (
                    <span className="font-mono text-[9px] text-[#94A3B8]">
                      {evaluation.confidence} Confidence ({evaluation.confidenceScore}%)
                    </span>
                  )}
                </div>

                {/* LIVE DYNAMIC VISUAL PREVIEW BOX: Scaled to project video aspect ratio */}
                {previewMode === 'ratio' ? (
                  <div
                    onClick={() => applyTextTemplate(template, true)}
                    className="cursor-pointer bg-[#05060A] rounded-xl p-2.5 text-center border border-white/[0.06] hover:border-blue-500/40 transition-all flex flex-col items-center justify-center relative overflow-hidden group/box"
                  >
                    {/* Miniature Video Canvas Frame Matching Project Aspect Ratio */}
                    <div
                      className={`relative rounded-lg overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center mx-auto transition-transform group-hover/box:scale-[1.03] ${getAspectRatioClasses(
                        aspectRatio
                      )}`}
                    >
                      {/* Video Thumbnail Background */}
                      <img
                        src={activeThumbnail}
                        alt="Video Preview Backdrop"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-75 transition-opacity group-hover/box:opacity-75"
                      />

                      {/* Cinematic Dark Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40 pointer-events-none" />

                      {/* Styled Text Overlay on Video Canvas */}
                      <div className="relative z-10 w-full px-2 flex flex-col items-center justify-center text-center">
                        <div
                          style={{
                            backgroundColor: template.backgroundColor || 'transparent',
                            padding: template.backgroundColor ? '3px 8px' : '0',
                            borderRadius: template.backgroundColor ? '9999px' : '0',
                          }}
                          className="flex flex-col items-center justify-center max-w-[95%]"
                        >
                          {/* Main Title */}
                          <span
                            style={{
                              fontFamily: `${template.font}, sans-serif`,
                              color: template.color || '#FFFFFF',
                              fontWeight:
                                template.weight === '800' || template.weight === '900'
                                  ? 800
                                  : template.isBold
                                  ? 700
                                  : 600,
                              fontStyle: template.isItalic ? 'italic' : 'normal',
                              letterSpacing: template.letterSpacing
                                ? `${Math.min(2, template.letterSpacing * 0.5)}px`
                                : 'normal',
                              textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.85)',
                            }}
                            className="text-xs leading-tight line-clamp-2 uppercase"
                          >
                            {activeUserTitle}
                          </span>

                          {/* Subtitle */}
                          {(template.sampleSubText || activeUserSubtitle) && (
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                letterSpacing: '0.2em',
                                color: template.backgroundColor ? '#F1F5F9' : '#E2E8F0',
                                textShadow: '0 1px 6px rgba(0,0,0,0.95)',
                              }}
                              className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 line-clamp-1"
                            >
                              {activeUserSubtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aspect Ratio Badge */}
                      <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-black/70 backdrop-blur-xs text-[7px] font-mono text-white/80 border border-white/10">
                        {aspectRatio}
                      </div>
                    </div>

                    {/* Preview Click Hint */}
                    <span className="text-[9px] font-mono text-[#60A5FA] opacity-0 group-hover/box:opacity-100 transition mt-1.5 flex items-center gap-1">
                      <Wand2 className="w-2.5 h-2.5" />
                      <span>Click to apply to video</span>
                    </span>
                  </div>
                ) : (
                  /* Compact Strip Preview */
                  <div
                    onClick={() => applyTextTemplate(template, true)}
                    className="cursor-pointer bg-[#05060A] rounded-xl p-3 text-center border border-white/[0.06] hover:border-blue-500/40 transition-all flex flex-col items-center justify-center min-h-[64px] relative overflow-hidden group/box"
                  >
                    <div
                      style={{
                        backgroundColor: template.backgroundColor || 'transparent',
                        padding: template.backgroundColor ? '3px 10px' : '0',
                        borderRadius: template.backgroundColor ? '9999px' : '0',
                      }}
                      className="relative flex flex-col items-center justify-center"
                    >
                      <span
                        style={{
                          fontFamily: `${template.font}, sans-serif`,
                          color: template.color || '#FFFFFF',
                          fontWeight:
                            template.weight === '800' || template.weight === '900'
                              ? 800
                              : template.isBold
                              ? 700
                              : 600,
                          fontStyle: template.isItalic ? 'italic' : 'normal',
                          textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                        }}
                        className="text-xs line-clamp-1 uppercase leading-tight"
                      >
                        {activeUserTitle}
                      </span>
                      {(template.sampleSubText || activeUserSubtitle) && (
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: '0.2em',
                            color: template.backgroundColor ? '#E2E8F0' : '#94A3B8',
                          }}
                          className="text-[8px] font-bold uppercase tracking-widest mt-0.5 line-clamp-1"
                        >
                          {activeUserSubtitle}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Breakdown & Position Recommendation */}
                {(optimizationSettings.showDetails ?? optimizationSettings.showAnalysisDetails) && evaluation.breakdown && (
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                      <span>Readability: {evaluation.breakdown.readabilityScore}%</span>
                      <span>Contrast: {evaluation.breakdown.contrastScore}%</span>
                      <span>Safe Area: {evaluation.breakdown.safeAreaScore ?? 95}%</span>
                    </div>
                    {evaluation.recommendedPosition && (
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#60A5FA] pt-0.5">
                        <span>Rec. Position: X {evaluation.recommendedPosition.x}%, Y {evaluation.recommendedPosition.y}%</span>
                        <span className="text-[#22C55E]">Safe Area ✓</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Animation & Alignment Info */}
                <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-[#60A5FA]" />
                    {template.animation.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {template.alignment || 'center'}
                  </span>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => applyTextTemplate(template, true)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/50 shadow-sm'
                      : 'bg-[#151922] hover:bg-[#2563EB] text-white border border-white/[0.08] hover:border-[#2563EB] shadow-md active:scale-98'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#60A5FA]" />
                      <span>Active Overlay Style</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Apply Style to Text</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData({ ...evidenceModalData, isOpen: false })}
        title={evidenceModalData.title}
        itemType="Text Style"
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
