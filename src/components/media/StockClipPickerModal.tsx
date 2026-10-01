'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DEMO_STOCK_LIBRARY } from '@/data/mockData';
import { useEditor } from '@/context/EditorContext';
import { VideoAsset } from '@/types';
import {
  Sparkles,
  X,
  Play,
  Plus,
  Check,
  Smartphone,
  Tv,
  Square,
  Search,
  CheckCircle2,
  Film,
  Eye,
} from 'lucide-react';
import { formatDurationSeconds } from '@/services/mediaIngestion';

interface StockClipPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StockClipPickerModal({ isOpen, onClose }: StockClipPickerModalProps) {
  const { addVideo, videos } = useEditor();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [addedNames, setAddedNames] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<(typeof DEMO_STOCK_LIBRARY)[0] | null>(null);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) {
          setPreviewItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewItem, onClose]);

  const categories = ['All', 'Cinematic', 'Lifestyle', 'Nature', 'Action', 'Landscape'];

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return DEMO_STOCK_LIBRARY.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.resolution.includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, debouncedSearch]);

  if (!isOpen) return null;

  const handleAddClip = (item: (typeof DEMO_STOCK_LIBRARY)[0]) => {
    if (addedNames.includes(item.name)) return; // Prevent duplicate rapid clicks

    const newAsset: VideoAsset = {
      id: `asset-stock-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: item.name,
      fileName: item.name,
      duration: item.duration,
      resolution: item.resolution,
      aspectRatio: item.aspectRatio,
      size: item.size,
      thumbnail: item.thumbnail,
      url: item.url,
      fps: item.fps,
      status: 'ready',
      progress: 100,
      uploadedAt: 'Stock Ready',
      accentColor: item.accentColor,
      codec: item.codec || 'H.264 High 10',
      profile: 'High Profile',
      bitrate: item.bitrate || '25 Mbps',
    };

    addVideo(newAsset);
    setAddedNames((prev) => [...prev, item.name]);

    setTimeout(() => {
      setAddedNames((prev) => prev.filter((n) => n !== item.name));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#0D1017] border border-white/[0.12] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/[0.08] flex items-center justify-between bg-[#11141E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#5B8CFF] text-white flex items-center justify-center shadow-md shadow-[#7C5CFF]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Stock & Demo Clips Library</h3>
              <p className="text-[11px] text-[#94A3B8]">
                Browse curated high-definition video samples with varied aspect ratios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-white/[0.06] bg-[#090C12] space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stock footage by title, category, description, resolution..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#11141E] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-xl outline-none focus:border-[#7C5CFF] transition placeholder-[#64748B]"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white shadow-md shadow-[#7C5CFF]/25'
                    : 'bg-[#11141E] text-[#94A3B8] hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 bg-[#080B11]">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isAdded = addedNames.includes(item.name);
              const RatioIcon =
                item.aspectRatio === '9:16'
                  ? Smartphone
                  : item.aspectRatio === '16:9'
                  ? Tv
                  : Square;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0F131D] border border-white/[0.08] hover:border-[#7C5CFF]/50 p-3 flex flex-col justify-between space-y-2.5 group transition shadow-sm"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail & Preview Trigger */}
                    <div
                      onClick={() => setPreviewItem(item)}
                      className="relative w-24 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-white/[0.06] cursor-pointer group/thumb shadow-inner"
                      title="Click to inspect clip"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                        <RatioIcon className="w-2.5 h-2.5 text-[#7C5CFF]" />
                        <span>{item.aspectRatio}</span>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        {formatDurationSeconds(item.duration)}
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold text-[#7C5CFF] tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">{item.size}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-snug">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-[#64748B] pt-1">
                        <span className="font-mono text-slate-300">{item.resolution}</span>
                        <span>•</span>
                        <span>{item.fps} FPS</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Action Button */}
                  <button
                    onClick={() => handleAddClip(item)}
                    disabled={isAdded}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-98 ${
                      isAdded
                        ? 'bg-[#22C55E] text-white'
                        : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Added to Workspace!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Media Clips</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-12 text-center text-xs text-[#64748B] space-y-2">
              <Film className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
              <p>No stock clips found matching "{searchInput}".</p>
            </div>
          )}
        </div>

        {/* Clip Detail Inspector Popover */}
        {previewItem && (
          <div className="p-4 border-t border-white/[0.08] bg-[#0F131D] flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <img
                src={previewItem.thumbnail}
                alt={previewItem.name}
                className="w-14 h-14 rounded-lg object-cover border border-white/10"
              />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">{previewItem.name}</p>
                <p className="text-[#94A3B8] text-[11px]">{previewItem.description}</p>
                <p className="text-[10px] text-[#64748B] font-mono">
                  {previewItem.aspectRatio} • {previewItem.resolution} • {previewItem.duration}s • {previewItem.size}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleAddClip(previewItem);
                  setPreviewItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md"
              >
                Add Clip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
