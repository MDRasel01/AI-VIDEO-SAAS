'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Activity,
  X,
  Zap,
  Gauge,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { getOptimalConcurrency } from '@/services/uploadEngine';

export default function PerformanceTelemetryModal() {
  const { telemetry, isTelemetryOpen, setIsTelemetryOpen, uploadQueue, videos } = useEditor();

  if (!isTelemetryOpen) return null;

  const optimalWorkers = getOptimalConcurrency();
  const activeUploads = uploadQueue.filter((q) => q.status === 'uploading');
  const totalChunksInFlight = activeUploads.reduce(
    (acc, q) => acc + (q.metrics?.activeChunkWorkers || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0C0F17] border border-white/[0.12] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#3B82F6] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Upload Engine Telemetry</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live 60 FPS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct-to-storage parallel multipart diagnostics & memory telemetry
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTelemetryOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Latency */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Stream Latency</span>
              <Clock className="w-3 h-3 text-[#3B82F6]" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {telemetry.uploadLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">Optimal response</p>
          </div>

          {/* Throughput */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Throughput</span>
              <Zap className="w-3 h-3 text-[#10B981]" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {telemetry.uploadThroughputMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Adaptive multi-chunk</p>
          </div>

          {/* Worker Pool */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Chunk Workers</span>
              <Cpu className="w-3 h-3 text-[#7C5CFF]" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {totalChunksInFlight} / {optimalWorkers}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Network-tuned</p>
          </div>

          {/* Metadata Extraction */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Metadata Parse</span>
              <Gauge className="w-3 h-3 text-[#F59E0B]" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {telemetry.metadataExtractionTimeMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <p className="text-[10px] text-slate-400">Parallel non-blocking</p>
          </div>

          {/* Thumbnail Generation */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Frame Capture</span>
              <Layers className="w-3 h-3 text-[#EC4899]" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {telemetry.thumbnailGenerationTimeMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <p className="text-[10px] text-slate-400">HTML5 Canvas</p>
          </div>

          {/* Memory Management */}
          <div className="bg-[#121622] border border-white/[0.06] rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Blob Revocations</span>
              <HardDrive className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {telemetry.memoryCleanupsCount} <span className="text-xs font-normal text-slate-400">URLs</span>
            </p>
            <p className="text-[10px] text-emerald-400">Zero memory leak</p>
          </div>
        </div>

        {/* Status log summary */}
        <div className="bg-[#07090E] border border-white/[0.06] rounded-2xl p-3 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>ENGINE STATUS</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
          <p className="text-slate-300 truncate">
            &gt; {telemetry.lastOperation}
          </p>
          <p className="text-slate-500 text-[10px]">
            Active media assets: {videos.length} | Ingestion queue items: {uploadQueue.length}
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => setIsTelemetryOpen(false)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
