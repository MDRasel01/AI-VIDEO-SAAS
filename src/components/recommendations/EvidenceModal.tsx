'use client';

import React from 'react';
import { RecommendationEvidence } from '@/types';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Eye,
  Layers,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemType: 'Text Style' | 'Transition' | 'Visual Effect' | 'Overall Project';
  evidence: RecommendationEvidence | null;
}

export default function EvidenceModal({
  isOpen,
  onClose,
  title,
  itemType,
  evidence,
}: EvidenceModalProps) {
  if (!isOpen || !evidence) return null;

  const scoreColor =
    evidence.score >= 90
      ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
      : evidence.score >= 80
      ? 'text-[#5B8CFF] bg-[#5B8CFF]/15 border-[#5B8CFF]/30'
      : 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';

  const confidenceColor =
    evidence.confidence === 'High'
      ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
      : evidence.confidence === 'Medium'
      ? 'text-[#5B8CFF] bg-[#5B8CFF]/15 border-[#5B8CFF]/30'
      : 'text-[#9CA3AF] bg-white/5 border-white/10';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0D0F14]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Evidence & Source Transparency</span>
                <span className="text-[10px] font-mono font-normal text-[#9CA3AF]">
                  ({itemType})
                </span>
              </h3>
              <p className="text-[10px] text-[#667085] truncate max-w-[280px]">
                {title}
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

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Top Score & Confidence Summary Card */}
          <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Video Compatibility Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white">{evidence.score}%</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
                  {evidence.grade} Match
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Analysis Confidence
              </span>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
                  {evidence.confidence} ({evidence.confidenceScore}%)
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Warning if present */}
          {evidence.conflictWarning && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">Conflict / Overload Warning</h4>
                <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                  {evidence.conflictWarning}
                </p>
              </div>
            </div>
          )}

          {/* Transparent Score Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Multi-Factor Score Breakdown</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(evidence.breakdown || {}).map(([key, val]) => {
                if (val === undefined) return null;
                const formattedName = key
                  .replace(/Score$/, '')
                  .replace(/([A-Z])/g, ' $1')
                  .trim();
                return (
                  <div
                    key={key}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <span className="text-[11px] text-[#9CA3AF] capitalize">{formattedName}</span>
                    <span className="text-xs font-mono font-bold text-white">{val}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why am I seeing this recommendation? */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Why 94%? (Analysis Evidence)</span>
            </h4>
            <ul className="space-y-1.5">
              {evidence.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="text-[11px] text-[#D1D5DB] bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg flex items-start gap-2 leading-relaxed"
                >
                  <span className="text-[#22C55E] font-bold shrink-0">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Placement Coordinates (if applicable) */}
          {evidence.recommendedPosition && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Recommended Position</span>
                <span className="text-[10px] text-[#9CA3AF]">
                  Subject Avoidance Coordinates
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#5B8CFF] font-bold">
                <span>X: {evidence.recommendedPosition.x}%</span>
                <span>Y: {evidence.recommendedPosition.y}%</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  Safe Area ✓
                </span>
              </div>
            </div>
          )}

          {/* Verified Official & Empirical Evidence Sources */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#5B8CFF]" />
              <span>Verified Evidence Sources & Documentation</span>
            </h4>
            <div className="space-y-2">
              {evidence.sources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 rounded-xl bg-[#0D0F14] border border-white/[0.06] flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{src.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-[#9CA3AF] border border-white/[0.08] uppercase">
                        {src.sourceType}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#667085]">{src.publisher}</p>
                    <div className="flex items-center gap-3 text-[9px] font-mono text-[#667085] pt-0.5">
                      <span>Updated: {src.updatedDate || src.publishedDate}</span>
                      <span>Verified: {src.accessedAt}</span>
                    </div>
                  </div>

                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[#5B8CFF] transition shrink-0"
                      title="Open source documentation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Model & Dataset Version Transparency Notice */}
          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.05] text-[10px] text-[#667085] space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span>Model: {evidence.scoringModel}</span>
              <span>Version: {evidence.analysisVersion}</span>
              <span>Dataset: {evidence.evidenceDatasetDate}</span>
            </div>
            <p className="font-sans text-[9px] text-[#667085] leading-tight pt-1">
              Notice: Compatibility scores estimate fit using computer-vision frame measurements and published creator guidelines. The engine does not claim access to private platform ranking algorithms.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-5 border-t border-white/[0.08] flex items-center justify-end bg-[#0D0F14] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#7C5CFF] hover:brightness-110 text-white text-xs font-bold transition shadow-md shadow-[#7C5CFF]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
