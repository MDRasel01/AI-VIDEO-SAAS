'use client';

import React, { useState, useMemo } from 'react';
import { useEditor } from '@/context/EditorContext';
import UploadDropzone from './UploadDropzone';
import VideoAssetCard from './VideoAssetCard';
import StockClipPickerModal from './StockClipPickerModal';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import {
  Search,
  Plus,
  Film,
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Filter,
  Layers,
  Copy,
  FolderPlus,
  ArrowDownUp,
  RotateCcw,
} from 'lucide-react';
import { formatDurationSeconds } from '@/services/mediaIngestion';

export default function MediaPanel() {
  const {
    videos,
    addVideo,
    reorderVideos,
    bulkDeleteVideos,
    clearAllVideos,
    applyOrderToTimeline,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
    openConfirmDialog,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [aspectFilter, setAspectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'duration-desc' | 'duration-asc'>('default');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Total library duration
  const totalLibraryDuration = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.duration || 0), 0);
  }, [videos]);

  // Filter & Sort Logic (Derived view, does not mutate underlying source array)
  const processedVideos = useMemo(() => {
    let result = [...videos];

    // Live search filter across filename and resolution
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.resolution.toLowerCase().includes(q) ||
          v.aspectRatio.toLowerCase().includes(q)
      );
    }

    // Aspect ratio filter
    if (aspectFilter !== 'All') {
      result = result.filter((v) => v.aspectRatio === aspectFilter);
    }

    // Sorting modes
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'duration-desc') {
      result.sort((a, b) => b.duration - a.duration);
    } else if (sortBy === 'duration-asc') {
      result.sort((a, b) => a.duration - b.duration);
    }

    return result;
  }, [videos, searchQuery, aspectFilter, sortBy]);

  // Filtered footage duration
  const filteredDuration = useMemo(() => {
    return processedVideos.reduce((acc, v) => acc + (v.duration || 0), 0);
  }, [processedVideos]);

  const isFiltered = searchQuery.trim() !== '' || aspectFilter !== 'All';

  // Multi-select toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select/Deselect all visible filtered clips
  const handleSelectAll = () => {
    const visibleIds = processedVideos.map((v) => v.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Bulk delete with confirmation modal
  const handleBulkDelete = () => {
    openConfirmDialog({
      title: `Delete ${selectedIds.length} Clips?`,
      message: `Are you sure you want to delete ${selectedIds.length} selected media clip(s)? These clips will also be removed from the timeline, with automatic gapless ripple timing.`,
      confirmLabel: `Delete (${selectedIds.length})`,
      severity: 'danger',
      onConfirm: () => {
        bulkDeleteVideos(selectedIds);
        setSelectedIds([]);
      },
    });
  };

  // Clear all media with confirmation modal
  const handleClearAll = () => {
    openConfirmDialog({
      title: 'Clear All Media Clips?',
      message:
        'This will remove all uploaded and stock clips and their corresponding timeline tracks. Unsaved changes will be discarded.',
      confirmLabel: 'Clear All Media',
      severity: 'danger',
      onConfirm: () => {
        clearAllVideos();
        setSelectedIds([]);
      },
    });
  };

  // Apply custom sort order to Timeline
  const handleApplyOrderToTimeline = () => {
    const sortedIds = processedVideos.map((v) => v.id);
    applyOrderToTimeline(sortedIds);
  };

  // Drag & Drop reorder handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      // Find actual source indexes in full videos list
      const sourceAsset = processedVideos[draggedIndex];
      const targetAsset = processedVideos[targetIndex];
      if (sourceAsset && targetAsset) {
        const fullSourceIdx = videos.findIndex((v) => v.id === sourceAsset.id);
        const fullTargetIdx = videos.findIndex((v) => v.id === targetAsset.id);
        if (fullSourceIdx !== -1 && fullTargetIdx !== -1) {
          reorderVideos(fullSourceIdx, fullTargetIdx);
        }
      }
    }
    setDraggedIndex(null);
  };

  const allVisibleSelected =
    processedVideos.length > 0 &&
    processedVideos.every((v) => selectedIds.includes(v.id));

  return (
    <div id="box-tab-media-panel" className="h-full flex flex-col p-4 space-y-3.5 overflow-y-auto select-none bg-[#080B11]">
      {/* Top Header & Fast Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Media Library</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 font-bold">
              {videos.length}
            </span>
          </h2>

          {/* Feature 18: Total Footage & Duration Summary */}
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isFiltered ? (
              <span>
                Showing <strong className="text-white">{processedVideos.length}</strong> (
                {formatDurationSeconds(filteredDuration)}) •{' '}
                <span className="text-slate-500">
                  {videos.length} total ({formatDurationSeconds(totalLibraryDuration)})
                </span>
              </span>
            ) : (
              <span>
                {videos.length} clip{videos.length === 1 ? '' : 's'} •{' '}
                {formatDurationSeconds(totalLibraryDuration)} total footage • Drag to sequence
              </span>
            )}
          </div>
        </div>

        {/* Stock Footage Library Picker Button */}
        <button
          onClick={() => setIsStockModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stock Clips</span>
        </button>
      </div>

      {/* Dynamic Diagnostic Alert Box for Media Tab (Features 32, 33, 34, 35) */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* Upload Dropzone & Batch Queue (Features 01, 02, 03, 09) */}
      <UploadDropzone />

      {/* Search, Filter & Sort Controls */}
      {videos.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search clips by name or resolution (e.g. 1080)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E121B] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-xl outline-none focus:border-[#3B82F6] transition placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0E121B] border border-white/[0.08] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none cursor-pointer hover:border-white/[0.2] transition"
              >
                <option value="default">Sort: Sequence Order</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="duration-desc">Sort: Longest First</option>
                <option value="duration-asc">Sort: Shortest First</option>
              </select>
            </div>
          </div>

          {/* Aspect Ratio Filter Pills & Clear All */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              {(['All', '9:16', '16:9', '1:1', '4:5'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectFilter(ratio)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition ${
                    aspectFilter === ratio
                      ? 'bg-[#3B82F6] text-white font-bold shadow-sm shadow-blue-500/25'
                      : 'bg-[#0E121B] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* If non-default sorting is active, offer explicit "Apply Order to Timeline" */}
              {sortBy !== 'default' && (
                <button
                  onClick={handleApplyOrderToTimeline}
                  className="text-[10px] text-[#3B82F6] hover:underline font-semibold flex items-center gap-1"
                  title="Apply current visual sort order to the timeline tracks"
                >
                  <ArrowDownUp className="w-3 h-3" />
                  Apply Order
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="text-slate-500 hover:text-[#EF4444] text-[11px] hover:underline transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations Toolbar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-between text-xs animate-in slide-in-from-top-1 shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-mono flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
              {selectedIds.length} Selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-[11px] text-[#3B82F6] hover:underline font-medium"
            >
              {allVisibleSelected ? 'Deselect All' : 'Select All Visible'}
            </button>
          </div>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete ({selectedIds.length})</span>
          </button>
        </div>
      )}

      {/* Asset Cards List */}
      <div className="flex-1 space-y-2.5">
        {processedVideos.length > 0 ? (
          processedVideos.map((video, idx) => (
            <VideoAssetCard
              key={video.id}
              video={video}
              index={idx}
              total={processedVideos.length}
              isSelectedForBatch={selectedIds.includes(video.id)}
              onToggleSelect={handleToggleSelect}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))
        ) : videos.length === 0 ? (
          /* Empty State */
          <div className="py-12 text-center space-y-3.5 px-4 rounded-2xl border border-white/[0.06] bg-[#0E121B]/50">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Start with your video clips</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Drop your local MP4/MOV footage or pick from the stock demo library to begin editing.
              </p>
            </div>
            <button
              onClick={() => setIsStockModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-indigo-600/25 active:scale-95 transition"
            >
              Browse Stock Clips
            </button>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-500 space-y-1">
            <p>No clips found matching your search or aspect filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setAspectFilter('All');
              }}
              className="text-[#3B82F6] hover:underline text-[11px]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Stock Footage Picker Modal */}
      <StockClipPickerModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />
    </div>
  );
}
