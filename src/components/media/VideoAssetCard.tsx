'use client';

import React, { useState } from 'react';
import { VideoAsset } from '@/types';
import { useEditor } from '@/context/EditorContext';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Play,
  Edit2,
  Check,
  X,
  Copy,
  GripVertical,
  Info,
  Smartphone,
  Tv,
  Square,
  Maximize2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatDurationSeconds } from '@/services/mediaIngestion';

interface VideoAssetCardProps {
  video: VideoAsset;
  index: number;
  total: number;
  isSelectedForBatch: boolean;
  onToggleSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export default function VideoAssetCard({
  video,
  index,
  total,
  isSelectedForBatch,
  onToggleSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: VideoAssetCardProps) {
  const {
    removeVideo,
    reorderVideos,
    renameVideo,
    duplicateVideo,
    seek,
    timelineClips,
    selectedClipId,
    setSelectedClipId,
    previewAssetId,
    setPreviewAssetId,
    openConfirmDialog,
  } = useEditor();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(video.name);
  const [showInfo, setShowInfo] = useState(false);

  const isActivePreview = previewAssetId === video.id;

  const handlePreviewClip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewAssetId(video.id);
    const matchingClip = timelineClips.find((c) => c.assetId === video.id);
    if (matchingClip) {
      setSelectedClipId(matchingClip.id);
      seek(matchingClip.start);
    } else {
      seek(0);
    }
  };

  const handleSaveRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== video.name) {
      renameVideo(video.id, trimmed);
    } else {
      setEditName(video.name);
    }
    setIsEditing(false);
  };

  const handleDeleteWithConfirmation = () => {
    openConfirmDialog({
      title: `Delete Clip "${video.name}"?`,
      message: `Are you sure you want to delete this media clip? It will also be removed from your timeline tracks, and attached transitions will be safely cleaned up with gapless ripple timing.`,
      confirmLabel: 'Delete Clip',
      severity: 'danger',
      onConfirm: () => removeVideo(video.id),
    });
  };

  // Determine Aspect Ratio Device Icon
  const RatioIcon =
    video.aspectRatio === '9:16'
      ? Smartphone
      : video.aspectRatio === '16:9'
      ? Tv
      : video.aspectRatio === '1:1'
      ? Square
      : Maximize2;

  const isUploading = video.status === 'uploading';
  const isProcessing = video.status === 'processing';
  const isError = video.status === 'error';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative rounded-2xl border p-3 flex items-center gap-3 transition-all duration-200 select-none ${
        isActivePreview
          ? 'bg-[#141A28] border-[#3B82F6] ring-2 ring-[#3B82F6]/30 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
          : isSelectedForBatch
          ? 'bg-[#7C5CFF]/15 border-[#7C5CFF] shadow-[0_0_15px_rgba(124,92,255,0.2)]'
          : 'bg-[#0E121B] hover:bg-[#121723] border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Batch Select Checkbox & Drag Handle */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <input
          type="checkbox"
          checked={isSelectedForBatch}
          onChange={() => onToggleSelect(video.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-3.5 h-3.5 accent-[#3B82F6] rounded cursor-pointer"
          title="Select clip for batch actions"
        />

        <div
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white p-0.5 transition"
          title="Drag to reorder sequence"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Sequence Number Badge & Step Reorder Buttons */}
      <div className="flex flex-col items-center justify-center shrink-0 space-y-0.5">
        <button
          onClick={() => index > 0 && reorderVideos(index, index - 1)}
          disabled={index === 0}
          title="Move up in sequence"
          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 transition"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] font-mono font-bold text-slate-300 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.04]">
          {String(index + 1).padStart(2, '0')}
        </span>

        <button
          onClick={() => index < total - 1 && reorderVideos(index, index + 1)}
          disabled={index === total - 1}
          title="Move down in sequence"
          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 transition"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail & Quick Preview Trigger */}
      <div
        onClick={handlePreviewClip}
        className={`relative w-20 h-24 rounded-xl overflow-hidden bg-black shrink-0 border cursor-pointer group/thumb shadow-md transition-transform duration-200 active:scale-98 ${
          isActivePreview ? 'border-[#3B82F6]' : 'border-white/[0.1]'
        }`}
        title="Click to preview video & seek timeline"
      >
        <img
          src={video.thumbnail}
          alt={video.name}
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Hover play icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
          <Play className="w-5 h-5 text-white fill-white shadow-lg" />
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
          <RatioIcon className="w-2.5 h-2.5 text-[#3B82F6]" />
          <span>{video.aspectRatio}</span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white">
          {formatDurationSeconds(video.duration)}
        </div>
      </div>

      {/* Metadata & Inline Rename Area */}
      <div className="flex-1 min-w-0 space-y-1">
        {isEditing ? (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') {
                  setEditName(video.name);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="bg-[#080B11] border border-[#3B82F6] text-white text-xs px-2 py-1 rounded-lg outline-none w-full font-medium"
            />
            <button
              onClick={handleSaveRename}
              className="p-1 text-[#22C55E] hover:bg-white/10 rounded-md"
              title="Save Name (Enter)"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditName(video.name);
                setIsEditing(false);
              }}
              className="p-1 text-[#EF4444] hover:bg-white/10 rounded-md"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 group/name">
            <h4
              onDoubleClick={() => setIsEditing(true)}
              className="text-xs font-bold text-white truncate group-hover:text-[#3B82F6] transition cursor-pointer"
              title={`${video.name} (Double-click to rename)`}
            >
              {video.name}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="opacity-0 group-hover/name:opacity-100 text-slate-500 hover:text-white p-1 rounded transition"
              title="Rename clip"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Specs Row: Duration, Resolution */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono text-slate-200 bg-white/[0.04] px-1.5 py-0.5 rounded text-[10px]">
            {formatDurationSeconds(video.duration, true)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono">{video.resolution}</span>
        </div>

        {/* Status, File Size & Tech Info Inspector Trigger */}
        <div className="flex items-center justify-between pt-0.5 text-[10px]">
          {isUploading || isProcessing ? (
            <span className="flex items-center gap-1 text-[#3B82F6] font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              {isUploading ? `Uploading ${video.progress}%` : 'Processing...'}
            </span>
          ) : isError ? (
            <span className="flex items-center gap-1 text-[#EF4444] font-medium">
              <AlertCircle className="w-3 h-3" />
              Upload Error
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#22C55E] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Ready
            </span>
          )}

          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-mono">{video.size}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Inspect Codec & Technical Specs"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons: Duplicate & Delete */}
      <div className="flex flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateVideo(video.id);
          }}
          title="Duplicate Clip in sequence"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteWithConfirmation();
          }}
          title="Delete Clip"
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/15 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Technical Specs Popover (Feature 27) */}
      {showInfo && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-3 right-3 mt-1.5 bg-[#080B11] border border-white/[0.15] rounded-2xl p-3.5 z-40 shadow-2xl text-[11px] space-y-1.5 animate-in fade-in slide-in-from-top-1"
        >
          <div className="flex justify-between items-center text-white font-bold pb-1.5 border-b border-white/[0.08]">
            <span className="flex items-center gap-1.5 text-xs">
              <Info className="w-3.5 h-3.5 text-[#3B82F6]" />
              Technical Media Specifications
            </span>
            <button
              onClick={() => setShowInfo(false)}
              className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>Codec:</span>
              <span className="text-white font-mono">{video.codec || 'H.264 / AVC'}</span>
            </div>
            <div className="flex justify-between">
              <span>Profile:</span>
              <span className="text-white font-mono">{video.profile || 'Not available in browser'}</span>
            </div>
            <div className="flex justify-between">
              <span>Bitrate:</span>
              <span className="text-white font-mono">{video.bitrate || 'Not available in browser'}</span>
            </div>
            <div className="flex justify-between">
              <span>Framerate:</span>
              <span className="text-[#22C55E] font-mono">{video.fps} FPS</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-white font-mono">{video.resolution}</span>
            </div>
            <div className="flex justify-between">
              <span>Aspect Ratio:</span>
              <span className="text-[#3B82F6] font-mono">{video.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>File Size:</span>
              <span className="text-white font-mono">{video.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="text-white font-mono">{video.duration.toFixed(2)}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
