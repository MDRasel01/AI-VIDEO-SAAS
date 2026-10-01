'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Sparkles, Check, BookmarkPlus, Plus } from 'lucide-react';
import { Template } from '@/types';

export default function ChooseTemplateCard() {
  const {
    allTemplatesList,
    selectedTemplate,
    setSelectedTemplate,
    runAutoCompose,
    setActiveTab,
    setIsSaveTemplateOpen,
  } = useEditor();

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="bg-[#0E131F] border border-white/[0.08] rounded-2xl p-4 flex flex-col h-full select-none justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#7C3AED] flex items-center justify-center text-white text-[11px] font-bold">
            2.
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Choose a Template
          </span>
        </div>

        <button
          onClick={() => setActiveTab('templates')}
          suppressHydrationWarning
          className="text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] hover:underline transition cursor-pointer"
        >
          View All ({allTemplatesList.length})
        </button>
      </div>

      {/* Grid of Template Cards or Empty State */}
      {allTemplatesList.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5 flex-1 content-center">
          {allTemplatesList.slice(0, 6).map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Image Frame */}
                <div
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1E293B] border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/40 shadow-lg shadow-blue-500/20'
                      : 'border-white/10 group-hover:border-white/30'
                  }`}
                >
                  <img
                    src={tmpl.thumbnail}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Template Name */}
                <span
                  className={`text-[11px] font-semibold truncate mt-1 text-center transition ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {tmpl.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-3 text-center space-y-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <BookmarkPlus className="w-6 h-6 text-[#7C5CFF]" />
          <p className="text-[11px] text-[#9CA3AF] max-w-[200px]">
            No saved templates yet. Save your current composition or auto-compose.
          </p>
          <button
            onClick={() => setIsSaveTemplateOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#7C5CFF]/20 hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white text-[10px] font-bold border border-[#7C5CFF]/40 transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Save Template</span>
          </button>
        </div>
      )}

      {/* Bottom Giant Auto Compose Action Button */}
      <div className="mt-3 pt-2">
        <button
          onClick={runAutoCompose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all group"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="tracking-wide">Auto Compose</span>
        </button>
        <p className="text-[10.5px] text-slate-400 text-center mt-1.5">
          Merge, Add Transitions, Effects &amp; Text Automatically
        </p>
      </div>
    </div>
  );
}
