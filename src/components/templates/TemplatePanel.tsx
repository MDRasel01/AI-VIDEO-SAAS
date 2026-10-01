'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import TemplateCard from './TemplateCard';
import TemplateDetails from './TemplateDetails';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import { Search, Plus, BookmarkPlus, Filter, Sparkles } from 'lucide-react';
import { Template } from '@/types';

export default function TemplatePanel() {
  const {
    allTemplatesList,
    selectedTemplate,
    setSelectedTemplate,
    setAspectRatio,
    setIsSaveTemplateOpen,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [inspectingTemplate, setInspectingTemplate] = useState<Template | null>(null);

  const categories = ['All', 'Product', 'Shorts', 'TikTok', 'Instagram', 'Universal', 'Tech'];

  const filteredTemplates = allTemplatesList.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tpl.subtitle && tpl.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'All' ||
      tpl.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (template.format) {
      setAspectRatio(template.format);
    }
  };

  return (
    <div id="box-tab-templates-panel" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Saved Video Templates</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30 font-bold">
              {allTemplatesList.length} Saved
            </span>
          </h2>
          <p className="text-[11px] text-[#667085]">
            Save, customize, and reuse complete video editing structures
          </p>
        </div>

        <button
          onClick={() => setIsSaveTemplateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save as Template</span>
        </button>
      </div>

      {/* Dynamic Red Error / Warning Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* Search & Categories */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search saved templates, styles, effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] transition placeholder-[#667085]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/25 font-bold'
                  : 'bg-[#11141A] text-[#9CA3AF] hover:text-white hover:bg-white/5 border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Grid or Empty State */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate.id === template.id}
              onSelect={() => handleSelect(template)}
              onPreview={() => setInspectingTemplate(template)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center space-y-3 px-4 rounded-2xl border border-white/[0.08] bg-[#0D0F14]/60">
          <div className="w-14 h-14 rounded-2xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#7C5CFF]/15">
            <BookmarkPlus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Saved Templates Yet</h3>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-[280px] mx-auto leading-relaxed">
              Create your first reusable editing template from your current timeline text styles, transitions, and visual effects.
            </p>
          </div>
          <button
            onClick={() => setIsSaveTemplateOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Save Current Project as Template</span>
          </button>
        </div>
      )}

      {/* Template Detail / Inspector Drawer */}
      {inspectingTemplate && (
        <div className="pt-2">
          <TemplateDetails
            template={inspectingTemplate}
            onClose={() => setInspectingTemplate(null)}
          />
        </div>
      )}
    </div>
  );
}
