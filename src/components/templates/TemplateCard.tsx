'use client';

import React, { useState } from 'react';
import { Template } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Check,
  Play,
  Sparkles,
  Smartphone,
  Layers,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  RotateCw,
} from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export default function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const {
    renameCustomTemplate,
    duplicateCustomTemplate,
    deleteCustomTemplate,
    applyCustomTemplate,
  } = useEditor();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(template.name);
  const [isAppliedToast, setIsAppliedToast] = useState(false);

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newName.trim()) {
      renameCustomTemplate(template.id, newName.trim());
      setIsRenaming(false);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    applyCustomTemplate(template, 'apply_to_current');
    setIsAppliedToast(true);
    setTimeout(() => setIsAppliedToast(false), 1500);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl bg-[#11141A] border cursor-pointer transition-all duration-200 overflow-hidden flex flex-col ${
        isSelected
          ? 'border-[#7C5CFF] shadow-[0_0_20px_rgba(124,92,255,0.25)] ring-1 ring-[#7C5CFF]'
          : 'border-white/[0.08] hover:border-white/[0.2] hover:bg-[#151820]'
      }`}
    >
      {/* Video Preview Image Area */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11141A] via-transparent to-black/40" />

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#7C5CFF] text-white flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}

        {/* Format Pill & Version Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
            <Smartphone className="w-3 h-3 text-[#7C5CFF]" />
            <span>{template.format}</span>
          </div>
          {template.version && (
            <span className="bg-[#7C5CFF]/25 border border-[#7C5CFF]/40 text-[#7C5CFF] text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
              v{template.version}
            </span>
          )}
        </div>

        {/* Action Menu (Top Right when not selected) */}
        {!isSelected && (
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[#9CA3AF] hover:text-white hover:bg-white/10 transition"
              title="Template Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-36 bg-[#0D0F14] border border-white/[0.12] rounded-xl shadow-2xl py-1 text-xs text-white z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-white/10 flex items-center gap-2 text-[#9CA3AF] hover:text-white"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>

                <button
                  onClick={() => {
                    duplicateCustomTemplate(template.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-white/10 flex items-center gap-2 text-[#9CA3AF] hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => {
                    deleteCustomTemplate(template.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-red-500/20 flex items-center gap-2 text-[#EF4444]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hover Action: Quick Preview Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition backdrop-blur-sm pointer-events-auto shadow-lg"
            title="Inspect Template Details"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Duration bottom pill */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-medium">
          {template.recommendedDuration || '10–20s'}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {isRenaming ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => setIsRenaming(false)}
                className="w-full bg-[#0D0F14] border border-[#7C5CFF] text-white text-xs px-2 py-0.5 rounded outline-none"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-[#7C5CFF] text-white text-[10px] font-bold"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-[#F5F7FA] group-hover:text-white truncate">
                {template.name}
              </h4>
              <span className="text-[10px] font-medium text-[#7C5CFF] bg-[#7C5CFF]/15 px-1.5 py-0.2 rounded shrink-0">
                {template.category}
              </span>
            </div>
          )}
          <p className="text-[11px] text-[#667085] truncate mt-0.5">
            {template.description || template.subtitle}
          </p>
        </div>

        {/* Transitions / Effects Mini Tags & Apply Button */}
        <div className="pt-1 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-hidden text-[10px] text-[#9CA3AF]">
            {template.transitions?.[0] && (
              <span className="bg-white/[0.04] px-1.5 py-0.5 rounded truncate max-w-[80px]">
                {template.transitions[0]}
              </span>
            )}
            {template.effects?.[0] && (
              <>
                <span className="text-[#667085]">+</span>
                <span className="bg-white/[0.04] px-1.5 py-0.5 rounded truncate max-w-[80px]">
                  {template.effects[0]}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleApply}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              isAppliedToast
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#0D0F14] hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/35'
            }`}
          >
            {isAppliedToast ? (
              <>
                <Check className="w-3 h-3" />
                <span>Applied</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Apply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
