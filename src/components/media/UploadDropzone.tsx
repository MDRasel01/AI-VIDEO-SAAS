'use client';

import React, { useRef, useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  UploadCloud,
  FileVideo,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Pause,
  Play,
  Zap,
  Activity,
  ArrowUp,
  Sliders,
} from 'lucide-react';
import { formatBytes } from '@/services/mediaIngestion';

export default function UploadDropzone() {
  const {
    uploadFiles,
    uploadQueue,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    setUploadPriority,
    setIsTelemetryOpen,
  } = useEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const activeQueue = uploadQueue.filter((item) => item.status !== 'ready');

  return (
    <div className="space-y-3">
      {/* Responsive Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload videos"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        className={`group relative rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 select-none outline-none focus:ring-2 focus:ring-[#3B82F6] ${
          isDragOver
            ? 'border-[#3B82F6] bg-[#3B82F6]/15 shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[0.99]'
            : 'border-[#1E293B] hover:border-[#3B82F6]/60 bg-[#080B11]/70 hover:bg-[#0B0F19]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
              isDragOver
                ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/30'
                : 'bg-[#1E293B] text-[#3B82F6] border border-white/[0.08]'
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-white tracking-wide">
              Drop videos here to upload
            </p>
            <p className="text-[11px] text-slate-400">
              or <span className="text-[#3B82F6] font-semibold underline underline-offset-2">Browse Files</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono pt-0.5">
              Instant 0-20ms preview • Multipart chunked parallel upload
            </p>
          </div>
        </div>
      </div>

      {/* Upload Queue Manager Drawer (Real-time speed, ETA, pause, resume, cancel, retry) */}
      {activeQueue.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-[#090C12] border border-white/[0.08] p-3 shadow-xl animate-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span>Active Uploads</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30">
                {activeQueue.length}
              </span>
            </div>

            {/* Engine Telemetry Button */}
            <button
              onClick={() => setIsTelemetryOpen(true)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition"
              title="Open real-time upload telemetry"
            >
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Telemetry</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeQueue.map((item) => {
              const isError = item.status === 'failed';
              const isUploading = item.status === 'uploading';
              const isPaused = item.status === 'paused';
              const isPreparing = item.status === 'preparing';

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-2.5 border text-xs flex flex-col gap-1.5 transition ${
                    isError
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                      : isPaused
                      ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                      : 'bg-[#11141E] border-white/[0.06] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isError ? (
                        <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                      ) : isPaused ? (
                        <Pause className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      ) : isUploading ? (
                        <Loader2 className="w-4 h-4 text-[#3B82F6] animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      )}

                      <span className="truncate font-semibold text-[11px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{item.size}</span>

                      {/* Pause / Resume button */}
                      {isUploading && (
                        <button
                          onClick={() => pauseUpload(item.id)}
                          title="Pause Upload"
                          aria-label="Pause Upload"
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        >
                          <Pause className="w-3 h-3" />
                        </button>
                      )}

                      {isPaused && (
                        <button
                          onClick={() => resumeUpload(item.id)}
                          title="Resume Upload"
                          aria-label="Resume Upload"
                          className="p-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B] text-[#F59E0B] hover:text-black transition"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      )}

                      {/* Retry on Error */}
                      {isError && (
                        <button
                          onClick={() => retryUpload(item.id)}
                          title="Retry Upload"
                          aria-label="Retry Upload"
                          className="p-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}

                      {/* Cancel button */}
                      <button
                        onClick={() => cancelUpload(item.id)}
                        title="Cancel Upload"
                        aria-label="Cancel Upload"
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & High-Speed Metrics (MB/s & ETA) */}
                  {!isError && (
                    <div className="space-y-1">
                      <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 rounded-full ${
                            isPaused
                              ? 'bg-[#F59E0B]'
                              : 'bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#10B981]'
                          }`}
                          style={{ width: `${Math.max(item.progress, 5)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-2">
                          <span>
                            {isPaused
                              ? 'Paused'
                              : isPreparing
                              ? 'Initializing chunk session...'
                              : `${item.progress}%`}
                          </span>

                          {/* Real-time speed and ETA */}
                          {item.metrics && item.metrics.speedBytesPerSec > 0 && !isPaused && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-emerald-400 font-semibold">
                                {item.metrics.speedFormatted}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span>ETA {item.metrics.etaFormatted}</span>
                            </>
                          )}
                        </div>

                        {item.metrics && item.metrics.totalChunks > 1 && (
                          <span className="text-slate-500">
                            Chunk {item.metrics.chunksCompleted}/{item.metrics.totalChunks}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {isError && (
                    <p className="text-[10px] text-[#EF4444] leading-tight">
                      {item.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
