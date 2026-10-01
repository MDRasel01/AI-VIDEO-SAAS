'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { BookmarkPlus, X, CheckCircle2, Sparkles } from 'lucide-react';

export default function SaveTemplateModal() {
  const {
    isSaveTemplateOpen,
    setIsSaveTemplateOpen,
    selectedPlatform,
    selectedTemplate,
    timelineTransitions,
    timelineText,
    timelineClips,
    saveCustomTemplate,
  } = useEditor();

  const [name, setName] = useState('My Custom Workflow Reel');
  const [description, setDescription] = useState(
    'Custom timing, dynamic Ken Burns drift and kinetic slide typography.'
  );
  const [category, setCategory] = useState<'Product' | 'Shorts' | 'TikTok' | 'Tech'>('Product');
  const [isSaved, setIsSaved] = useState(false);

  if (!isSaveTemplateOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Collect active transitions from timeline
    const activeTransitions = Array.from(
      new Set(
        timelineTransitions.length > 0
          ? timelineTransitions.map((t) => t.name)
          : selectedTemplate.transitions
      )
    );

    // Collect active effects
    const activeEffects: string[] = [];
    const firstClip = timelineClips[0];
    if (firstClip?.effects?.slowZoom) activeEffects.push('Slow Zoom');
    if (firstClip?.effects?.filmGrain) activeEffects.push('Film Grain');
    if (firstClip?.effects?.vignette) activeEffects.push('Vignette');
    if (firstClip?.effects?.lightLeak) activeEffects.push('Anamorphic Flare');
    if (firstClip?.effects?.glow) activeEffects.push('Soft Glow');
    if (firstClip?.effects?.shake) activeEffects.push('Shake Impact');
    if (firstClip?.effects?.motionBlur) activeEffects.push('Motion Blur');

    saveCustomTemplate({
      name: name.trim() || 'Custom Template',
      subtitle: `${category} • Custom Workflow`,
      category: category as any,
      format: selectedPlatform.format as any,
      recommendedDuration: '10–20 sec',
      description: description.trim() || 'Custom automated video composition template.',
      transitions: activeTransitions.length > 0 ? activeTransitions : ['Smooth Zoom In', 'Cross Dissolve'],
      effects: activeEffects.length > 0 ? activeEffects : ['Slow Zoom', 'Film Grain'],
      textStyle: {
        preset: timelineText?.text || 'CUSTOM TITLE',
        sampleText: timelineText?.text || 'CUSTOM TITLE',
        animation: (timelineText?.animation as any) || 'slide_up',
        fontFamily: timelineText?.font || 'Poppins',
      },
      musicStyle: selectedTemplate.musicStyle || {
        title: 'Custom Beat.mp3',
        bpm: 120,
        genre: 'Modern Beat',
      },
      colorTheme: '#7C5CFF',
      thumbnail: timelineClips[0]?.thumbnail || selectedTemplate.thumbnail,
      pacingProfile: selectedTemplate.pacingProfile || 'Smooth Flow',
      isCustom: true,
    } as any);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSaveTemplateOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="text-sm font-bold text-white">Save Composition Rules as Template</h3>
          </div>
          <button
            onClick={() => setIsSaveTemplateOpen(false)}
            className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isSaved ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white">Template Saved!</h4>
            <p className="text-xs text-[#9CA3AF]">
              &quot;{name}&quot; is now available in your custom template presets library.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9CA3AF]">Template Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9CA3AF]">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs p-2 rounded-lg outline-none"
                >
                  <option value="Product">Product Launch</option>
                  <option value="Shorts">Viral Shorts</option>
                  <option value="TikTok">TikTok / Reels</option>
                  <option value="Tech">Tech / Minimal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF]">Format Target</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedPlatform.format} (${selectedPlatform.badge})`}
                  className="w-full bg-[#0D0F14]/60 border border-white/[0.05] text-[#9CA3AF] text-xs px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/30 hover:brightness-110 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SAVE REUSABLE TEMPLATE</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
