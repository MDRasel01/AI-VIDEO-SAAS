'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useEditor } from '@/context/EditorContext';
import { UploadCloud, X, Film, Sparkles, FolderOpen, Play, CheckCircle2 } from 'lucide-react';
import { formatDurationSeconds } from '@/services/mediaIngestion';
import IdBadge from '@/components/ui/IdBadge';

export default function UploadVideosCard() {
  const {
    videos,
    uploadFiles,
    removeVideo,
    previewAssetId,
    setPreviewAssetId,
    setActiveTab,
    openConfirmDialog,
    timelineClips,
    seek,
    runAutoCompose,
  } = useEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Total duration of all uploaded clips
  const totalDuration = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.duration || 0), 0);
  }, [videos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDeleteVideo = (e: React.MouseEvent, videoId: string, videoName: string) => {
    e.stopPropagation();
    openConfirmDialog({
      title: `Delete "${videoName}"?`,
      message: `Are you sure you want to remove this clip? It will also be removed from the timeline tracks, and attached transitions will be cleaned up with gapless ripple timing.`,
      confirmLabel: 'Delete Clip',
      severity: 'danger',
      onConfirm: () => removeVideo(videoId),
    });
  };

  return (
    <div id="box-upload-videos-panel" className="bg-[#0E131F] border border-white/[0.08] rounded-2xl p-4 flex flex-col h-full select-none shadow-sm justify-between">
      {/* Step Header with Total Clips & Duration Summary */}
      <div id="upload-panel-header" className="flex items-center justify-between mb-3">
        <div id="upload-panel-title-group" className="flex items-center gap-2">
          <div id="upload-step-badge" className="w-5 h-5 rounded-md bg-[#7C3AED] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            1.
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span id="upload-panel-title-text" className="text-xs font-bold text-white tracking-wide">
                Upload Your Videos
              </span>
              <IdBadge id="box-upload-videos-panel" />
            </div>
            <p id="upload-panel-subtitle-meta" className="text-[10px] text-slate-400 font-mono">
              {videos.length} clip{videos.length === 1 ? '' : 's'} • {formatDurationSeconds(totalDuration)} total
            </p>
          </div>
        </div>

        {/* Action Group: Auto Compose + Library Button */}
        <div id="upload-header-actions" className="flex items-center gap-2">
          {videos.length > 0 && (
            <button
              id="btn-upload-quick-autocompose"
              onClick={runAutoCompose}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition active:scale-95"
              title="Automatically compose uploaded videos with transitions, effects & captions"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Auto Compose</span>
            </button>
          )}

          {/* Quick button to open full Media Library tab */}
          <button
            id="btn-open-media-library"
            onClick={() => setActiveTab('media')}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:text-white hover:bg-white/5 px-2.5 py-1 rounded-lg transition border border-white/[0.06]"
            title="Open Media Library in sidebar"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        id="box-drag-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 min-h-[135px] ${
          isDragging
            ? 'border-[#3B82F6] bg-[#3B82F6]/15 scale-[0.99] shadow-[0_0_20px_rgba(59,130,246,0.25)]'
            : 'border-[#1E293B] hover:border-[#3B82F6]/50 bg-[#080B11]/60 hover:bg-[#080B11]'
        }`}
      >
        <input
          id="upload-file-input"
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi,.ts,.3gp,.flv,.wmv"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div id="upload-icon-circle" className="w-11 h-11 rounded-2xl bg-[#1E293B]/80 flex items-center justify-center text-[#3B82F6] mb-2 shadow-inner group-hover:scale-105 transition duration-200">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p id="upload-prompt-title" className="text-xs font-bold text-slate-200">
          Drag &amp; Drop Videos Here
        </p>
        <p id="upload-supported-formats" className="text-[11px] text-slate-500 my-1 font-mono">MP4 • MOV • WebM • 4K/60fps</p>

        <button
          id="btn-browse-files"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition"
        >
          Browse Files
        </button>
      </div>

      {/* Uploaded Videos Row */}
      <div id="box-uploaded-videos-section" className="mt-3.5 pt-3 border-t border-white/[0.06]">
        <div id="uploaded-videos-header" className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-2">
          <span id="uploaded-videos-count-label">Uploaded Videos ({videos.length})</span>
          {videos.length > 4 && (
            <span id="uploaded-videos-scroll-hint" className="text-[10px] text-slate-500 font-mono">
              Scroll &rarr;
            </span>
          )}
        </div>

        <div id="box-uploaded-videos-list" className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {videos.map((video) => {
            const isSelected = previewAssetId === video.id;
            return (
              <div
                key={video.id}
                id={`uploaded-video-item-${video.id}`}
                onClick={() => {
                  setPreviewAssetId(video.id);
                  const match = timelineClips.find((c) => c.assetId === video.id);
                  if (match) {
                    seek(match.start);
                  }
                }}
                className="group cursor-pointer flex flex-col min-w-[88px] w-[96px] shrink-0"
              >
                {/* Thumbnail Container with Active Preview Highlight */}
                <div
                  id={`video-thumb-container-${video.id}`}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1E293B] border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/50 shadow-md shadow-blue-500/20'
                      : 'border-white/10 group-hover:border-white/25'
                  }`}
                >
                  <img
                    id={`video-thumb-img-${video.id}`}
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top-Right Remove Button with confirmation */}
                  <button
                    id={`btn-remove-video-${video.id}`}
                    onClick={(e) => handleDeleteVideo(e, video.id, video.name)}
                    title="Remove Video"
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-[#EF4444] text-white flex items-center justify-center transition opacity-80 group-hover:opacity-100 z-10"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>

                  {/* Bottom Duration Badge */}
                  <div id={`video-duration-badge-${video.id}`} className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono font-medium text-white">
                    {formatDurationSeconds(video.duration)}
                  </div>
                </div>

                {/* File Name Label */}
                <span id={`video-name-label-${video.id}`} className="text-[11px] font-medium text-slate-300 truncate mt-1 text-center group-hover:text-white transition">
                  {video.name}
                </span>
              </div>
            );
          })}

          {videos.length === 0 && (
            <div id="empty-videos-notice" className="w-full py-3 text-center text-[11px] text-slate-500 italic">
              No video clips uploaded yet. Drag &amp; drop files above to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
