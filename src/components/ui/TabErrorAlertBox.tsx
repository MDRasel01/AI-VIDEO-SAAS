'use client';

import React, { useState } from 'react';
import { TabIssue } from '@/types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronUp,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';

interface TabErrorAlertBoxProps {
  issues: TabIssue[];
  onQuickFix?: (issue: TabIssue) => void;
  onDismiss?: (issueId: string) => void;
}

export default function TabErrorAlertBox({
  issues,
  onQuickFix,
  onDismiss,
}: TabErrorAlertBoxProps) {
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [fixedIssueIds, setFixedIssueIds] = useState<string[]>([]);

  if (!issues || issues.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  const handleFix = (issue: TabIssue) => {
    if (onQuickFix) {
      onQuickFix(issue);
      setFixedIssueIds((prev) => [...prev, issue.id]);
      setTimeout(() => {
        setFixedIssueIds((prev) => prev.filter((id) => id !== issue.id));
      }, 2500);
    }
  };

  return (
    <div className="space-y-2.5 my-2.5 animate-in fade-in duration-200">
      {issues.map((issue) => {
        const isExpanded = expandedIssueId === issue.id;
        const isFixed = fixedIssueIds.includes(issue.id);
        const isError = issue.severity === 'error';
        const isWarning = issue.severity === 'warning';

        const borderColor = isError
          ? 'border-[#EF4444]/40 border-l-4 border-l-[#EF4444]'
          : isWarning
          ? 'border-[#F59E0B]/40 border-l-4 border-l-[#F59E0B]'
          : 'border-[#5B8CFF]/40 border-l-4 border-l-[#5B8CFF]';

        const bgGlow = isError
          ? 'bg-gradient-to-r from-[#EF4444]/15 via-[#EF4444]/10 to-[#11141A]'
          : isWarning
          ? 'bg-gradient-to-r from-[#F59E0B]/15 via-[#F59E0B]/10 to-[#11141A]'
          : 'bg-gradient-to-r from-[#5B8CFF]/15 via-[#5B8CFF]/10 to-[#11141A]';

        const iconColor = isError
          ? 'text-[#EF4444]'
          : isWarning
          ? 'text-[#F59E0B]'
          : 'text-[#5B8CFF]';

        return (
          <div
            key={issue.id}
            className={`relative rounded-xl border ${borderColor} ${bgGlow} p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 overflow-hidden`}
          >
            {/* Top Bar: Error Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                    isError
                      ? 'bg-[#EF4444]/20 text-[#EF4444]'
                      : isWarning
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      : 'bg-[#5B8CFF]/20 text-[#5B8CFF]'
                  }`}
                >
                  {isError ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isError
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                          : isWarning
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                          : 'bg-[#5B8CFF]/20 text-[#5B8CFF] border border-[#5B8CFF]/30'
                      }`}
                    >
                      {isError ? 'Error Detected' : isWarning ? 'Warning' : 'Notice'}
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      {issue.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#F5F7FA] font-medium leading-relaxed">
                    {issue.message}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(issue.id)}
                  className="text-[#667085] hover:text-white p-1 rounded hover:bg-white/5 transition"
                  title="Dismiss warning"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Middle: Cause & Solution Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/[0.08] text-xs">
              {/* Why it happened (কেন হচ্ছে) */}
              <div className="p-2.5 rounded-lg bg-[#090A0E]/80 border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[11px] font-semibold">
                  <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Why this happened (কারণ):</span>
                </div>
                <p className="text-[#D1D5DB] text-[11px] leading-relaxed">
                  {issue.cause}
                </p>
              </div>

              {/* How to solve it (কিভাবে সমাধান করবেন) */}
              <div className="p-2.5 rounded-lg bg-[#090A0E]/80 border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[11px] font-semibold">
                  <Wrench className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>How to solve (সমাধান):</span>
                </div>
                <p className="text-[#22C55E] text-[11px] font-medium leading-relaxed">
                  {issue.solution}
                </p>
              </div>
            </div>

            {/* Bottom Actions Row: 1-Click Quick Fix & More Details Toggle */}
            <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-white/[0.06]">
              {/* Left Action: Quick Fix Button */}
              {issue.actionLabel && (
                <button
                  onClick={() => handleFix(issue)}
                  disabled={isFixed}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isFixed
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] hover:brightness-110 text-white shadow-[#7C5CFF]/20 active:scale-95'
                  }`}
                >
                  {isFixed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Issue Solved!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{issue.actionLabel}</span>
                    </>
                  )}
                </button>
              )}

              {/* Right: More Details Expand Button */}
              <button
                onClick={() => toggleExpand(issue.id)}
                className="ml-auto text-[11px] font-semibold text-[#9CA3AF] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-white/5 transition"
              >
                <span>{isExpanded ? 'Less Details' : 'More Details (বিস্তারিত)'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Expanded Detailed Diagnostics Panel */}
            {isExpanded && (
              <div className="mt-3 p-3 rounded-lg bg-[#050609] border border-white/[0.08] text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between text-[#667085] text-[10px] font-mono uppercase tracking-wider">
                  <span>Diagnostic Breakdown & Frame Info</span>
                  {issue.code && <span>Code: {issue.code}</span>}
                </div>

                <ul className="space-y-1.5 text-[11px] text-[#9CA3AF] list-disc pl-4">
                  {issue.details.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="p-2 rounded bg-white/[0.03] border border-white/[0.05] text-[10px] text-[#667085] flex items-center justify-between">
                  <span>Target Tab: {issue.tab.toUpperCase()}</span>
                  <span>Engine: FrameFlow Auto-Validator v2.4</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
