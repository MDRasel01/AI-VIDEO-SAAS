'use client';

import React, { useState, useRef } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Download,
  X,
  Sparkles,
  CheckCircle2,
  Film,
  Copy,
  Check,
  Share2,
  Tv,
  Smartphone,
  Square,
  Play,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { videoCompositor, RenderProgressPayload } from '@/services/videoCompositor';
import { formatDurationSeconds } from '@/services/mediaIngestion';

export default function ExportModal() {
  const {
    isExportOpen,
    setIsExportOpen,
    projectName,
    totalDuration,
    selectedPlatform,
    selectedTemplate,
    timelineClips,
    timelineTransitions,
    timelineText,
    timelineAudio,
    aspectRatio,
  } = useEditor();

  const [format, setFormat] = useState<'mp4' | 'mov' | 'webm'>('mp4');
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(60);
  const [quality, setQuality] = useState<'High' | 'Maximum' | 'Balanced'>('High');

  const [renderStatus, setRenderStatus] = useState<
    'idle' | 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'completed' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [renderPayload, setRenderPayload] = useState<RenderProgressPayload | null>(null);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isExportOpen) return null;

  const handleStartExport = async () => {
    setRenderStatus('preparing');
    setProgress(2);
    setRenderError(null);
    setRenderedBlob(null);

    try {
      const outputBlob = await videoCompositor.renderVideo(
        timelineClips,
        timelineTransitions,
        timelineText,
        timelineAudio,
        totalDuration,
        {
          resolution,
          format,
          fps,
          quality,
          aspectRatio,
        },
        (payload) => {
          setRenderStatus(payload.stage);
          setProgress(payload.progress);
          setRenderPayload(payload);
        }
      );

      const url = URL.createObjectURL(outputBlob);
      setRenderedBlob(outputBlob);
      setDownloadUrl(url);
      setRenderStatus('completed');
      setProgress(100);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C5CFF', '#3B82F6', '#10B981', '#F59E0B'],
        });
      } catch (e) {}
    } catch (err: any) {
      console.error('Render error:', err);
      setRenderError(err?.message || 'Failed to render composition.');
      setRenderStatus('error');
    }
  };

  const handleCancelRender = () => {
    videoCompositor.cancel();
    setRenderStatus('idle');
    setProgress(0);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    if (!downloadUrl && !renderedBlob) return;
    const url = downloadUrl || (renderedBlob ? URL.createObjectURL(renderedBlob) : '');
    const a = document.createElement('a');
    a.href = url;
    const ext = format === 'mov' ? 'mov' : format === 'webm' ? 'webm' : 'mp4';
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_${resolution}_${aspectRatio.replace(':', 'x')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetModal = () => {
    if (renderStatus === 'rendering' || renderStatus === 'encoding') {
      videoCompositor.cancel();
    }
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setRenderStatus('idle');
    setProgress(0);
    setRenderedBlob(null);
    setIsExportOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Composition</h3>
              <p className="text-[11px] text-[#667085]">
                {projectName} • {totalDuration.toFixed(1)}s
              </p>
            </div>
          </div>

          <button
            onClick={resetModal}
            className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {renderStatus === 'idle' ? (
            <>
              {/* Format & Resolution Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Container Format
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#0D0F14] p-1 rounded-lg border border-white/[0.06]">
                    {(['mp4', 'mov', 'webm'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`py-1 rounded text-xs font-mono font-medium uppercase transition ${
                          format === fmt
                            ? 'bg-[#7C5CFF] text-white shadow-sm'
                            : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#0D0F14] p-1 rounded-lg border border-white/[0.06]">
                    {(['720p', '1080p', '4k'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`py-1 rounded text-xs font-mono font-medium uppercase transition ${
                          resolution === res
                            ? 'bg-[#7C5CFF] text-white shadow-sm'
                            : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Framerate & Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Frame Rate
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([30, 60] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFps(f)}
                        className={`py-1.5 rounded-lg text-xs font-medium transition ${
                          fps === f
                            ? 'bg-[#7C5CFF] text-white'
                            : 'bg-[#0D0F14] text-[#9CA3AF] hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Bitrate Quality
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#0D0F14] p-1 rounded-lg border border-white/[0.06]">
                    {(['Balanced', 'High', 'Maximum'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`py-1 rounded text-[11px] font-medium transition ${
                          quality === q
                            ? 'bg-[#7C5CFF] text-white shadow-sm'
                            : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Specifications Summary */}
              <div className="rounded-xl bg-[#0D0F14] border border-white/[0.06] p-3 space-y-1.5 text-xs text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Output Dimensions</span>
                  <span className="font-mono text-white">
                    {selectedPlatform.format === '9:16'
                      ? resolution === '4k'
                        ? '2160 × 3840'
                        : '1080 × 1920'
                      : resolution === '4k'
                      ? '3840 × 2160'
                      : '1920 × 1080'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Codec</span>
                  <span className="text-white">AAC Stereo 320 kbps (48kHz)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated File Size</span>
                  <span className="font-mono text-[#22C55E]">
                    ~{Math.round(totalDuration * (quality === 'Maximum' ? 3.5 : 1.8))} MB
                  </span>
                </div>
              </div>

              {/* Action: Start Export */}
              <button
                onClick={handleStartExport}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/30 hover:brightness-110 active:scale-[0.98] transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>START VIDEO EXPORT</span>
              </button>
            </>
          ) : renderStatus === 'completed' ? (
            /* Render Complete State */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mx-auto shadow-lg shadow-[#22C55E]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  Export Completed Successfully!
                </h4>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Ready for publishing on {selectedPlatform.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="h-10 rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#22C55E]/25 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="h-10 rounded-xl bg-[#151820] hover:bg-[#1A1E29] border border-white/[0.1] text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-[#22C55E]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#7C5CFF]" />
                      <span>Copy Share Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : renderStatus === 'error' ? (
            /* Error State */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mx-auto shadow-lg shadow-[#EF4444]/20">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">Rendering Encountered an Error</h4>
                <p className="text-xs text-[#EF4444] mt-1 max-w-sm mx-auto">
                  {renderError || 'An unexpected error occurred while compositing video frames.'}
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handleStartExport}
                  className="px-5 py-2 rounded-xl bg-[#7C5CFF] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/30"
                >
                  Retry Render
                </button>
              </div>
            </div>
          ) : (
            /* Active Rendering Progress State */
            <div className="py-6 space-y-5">
              <div className="text-center space-y-1">
                <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider capitalize">
                  {renderStatus === 'rendering'
                    ? 'Compositing Video Frames...'
                    : renderStatus === 'encoding'
                    ? 'Encoding Audio & Video Streams...'
                    : renderStatus === 'finalizing'
                    ? 'Packaging Final MP4 Container...'
                    : 'Initializing Renderer...'}
                </h4>
                <p className="text-xs text-[#9CA3AF]">
                  Processing {fps} FPS frames with transitions & kinetic typography
                </p>
              </div>

              {/* Progress Bar & Frame Counters */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9CA3AF]">
                    {renderPayload
                      ? `Frame ${renderPayload.currentFrame} / ${renderPayload.totalFrames}`
                      : 'Rendering pipeline'}
                  </span>
                  <span className="font-mono text-[#7C5CFF] font-bold">{progress}%</span>
                </div>

                <div className="h-2.5 w-full bg-[#0D0F14] rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C5CFF] via-[#3B82F6] to-[#22C55E] rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Live Stats */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>
                    Speed: <strong className="text-white">{renderPayload?.fps || 30} FPS</strong>
                  </span>
                  <span>
                    ETA:{' '}
                    <strong className="text-emerald-400">
                      {renderPayload ? formatDurationSeconds(renderPayload.etaSeconds) : 'Calculating...'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleCancelRender}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition"
                >
                  Cancel Export
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
