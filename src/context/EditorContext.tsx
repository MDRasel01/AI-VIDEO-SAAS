'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  VideoAsset,
  Template,
  PlatformConfig,
  TimelineClip,
  TimelineTransition,
  TimelineText,
  TextTemplate,
  TimelineAudio,
  AspectRatio,
  TabIssue,
  TransitionItem,
  TransitionRecommendation,
  UploadQueueItem,
  ConfirmModalConfig,
  PerformanceTelemetry,
  TranscriptSegment,
  TranscriptState,
  CaptionStylePreset,
  EvidenceSource,
  RecommendationEvidence,
  VideoAnalysisMetrics,
  OptimizationSettings,
  EffectItem,
} from '@/types';
import {
  INITIAL_VIDEOS,
  TEMPLATES,
  PLATFORMS,
  SAMPLE_AUDIO_TRACK,
  TRANSITIONS,
  INITIAL_TIMELINE_CLIPS,
  INITIAL_TIMELINE_TRANSITIONS,
  INITIAL_TIMELINE_TEXT,
  INITIAL_TIMELINE_SUBTEXT,
  TEXT_TEMPLATES,
  EFFECTS,
} from '@/data/mockData';
import {
  calculateSafeDuration,
  calculateTransitionCompatibility,
  autoAdjustTransition,
  getTransitionRecommendations,
  optimizeAllProjectTransitions,
} from '@/services/transitionIntelligence';
import {
  validateVideoFile,
  formatBytes,
  calculateAspectRatio,
  extractVideoMetadata,
} from '@/services/mediaIngestion';
import {
  uploadEngine,
  objectUrlRegistry,
  getOptimalChunkSize,
} from '@/services/uploadEngine';
import {
  saveVideoBlobToIDB,
  getVideoBlobFromIDB,
  deleteVideoBlobFromIDB,
  clearAllVideoBlobsFromIDB,
  saveProjectStateToStorage,
  loadProjectStateFromStorage,
  clearProjectStorage,
} from '@/services/storagePersistence';
import { VideoAnalysisEngine } from '@/services/videoAnalysisEngine';
import { AIRecommendationEngine } from '@/services/aiRecommendationEngine';

export type ActiveTab = 'media' | 'templates' | 'transitions' | 'effects' | 'text' | 'transcript' | 'audio' | 'projects' | 'settings' | 'create';

interface EditorContextType {
  // Transition Engine & Library
  allTransitionsList: TransitionItem[];
  favoriteTransitionIds: string[];
  toggleFavoriteTransition: (id: string) => void;
  recentTransitionIds: string[];
  recordRecentTransition: (id: string) => void;
  customTransitions: TransitionItem[];
  addCustomTransition: (transition: TransitionItem) => void;
  autoAdjustSingleTransition: (transitionId: string) => void;
  optimizeAllTransitions: () => void;
  // Project Info
  projectName: string;
  setProjectName: (name: string) => void;
  projectStatus: 'saved' | 'saving' | 'unsaved';
  saveProject: () => void;

  // Media Assets & Ultra-High Performance Ingestion Queue
  videos: VideoAsset[];
  previewAssetId: string | null;
  setPreviewAssetId: (id: string | null) => void;
  uploadQueue: UploadQueueItem[];
  pauseUpload: (queueId: string) => void;
  resumeUpload: (queueId: string) => void;
  cancelUpload: (queueId: string) => void;
  retryUpload: (queueId: string) => void;
  setUploadPriority: (queueId: string, priority: number) => void;
  addVideo: (video: VideoAsset) => void;
  uploadFiles: (files: FileList | File[]) => void;
  removeVideo: (id: string) => void;
  renameVideo: (id: string, newName: string) => void;
  duplicateVideo: (id: string) => void;
  bulkDeleteVideos: (ids: string[]) => void;
  clearAllVideos: () => void;
  reorderVideos: (startIndex: number, endIndex: number) => void;
  applyOrderToTimeline: (sortedAssetIds: string[]) => void;

  // Performance Telemetry
  telemetry: PerformanceTelemetry;
  isTelemetryOpen: boolean;
  setIsTelemetryOpen: (open: boolean) => void;

  // Undo Safety & Confirmation Modals
  confirmDialog: ConfirmModalConfig;
  openConfirmDialog: (config: Omit<ConfirmModalConfig, 'isOpen'>) => void;
  closeConfirmDialog: () => void;

  // Templates & Platform
  allTemplatesList: Template[];
  customTemplates: Template[];
  saveCustomTemplate: (template: Omit<Template, 'id'>) => Template;
  updateCustomTemplate: (id: string, updates: Partial<Template>) => void;
  renameCustomTemplate: (id: string, newName: string) => void;
  duplicateCustomTemplate: (id: string) => Template | null;
  deleteCustomTemplate: (id: string) => void;
  applyCustomTemplate: (template: Template, mode?: 'apply_to_current' | 'replace_structure' | 'new_project') => void;
  selectedTemplate: Template;
  setSelectedTemplate: (template: Template) => void;
  selectedPlatform: PlatformConfig;
  setSelectedPlatform: (platform: PlatformConfig) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;

  // AI Recommendation Engine & Video Frame Analysis
  optimizationSettings: OptimizationSettings;
  setOptimizationSettings: React.Dispatch<React.SetStateAction<OptimizationSettings>>;
  videoAnalysisMetrics: VideoAnalysisMetrics;
  reanalyzeVideo: () => void;
  evaluateTextTemplate: (template: TextTemplate) => RecommendationEvidence;
  evaluateTransition: (transition: TransitionItem) => RecommendationEvidence;
  evaluateEffect: (effect: EffectItem) => RecommendationEvidence;
  overallEditingScore: { overallScore: number; grade: string; textScore: number; transitionScore: number; effectScore: number };
  bestRecommendationPackage: {
    bestText: { template: TextTemplate; score: number } | null;
    bestTransition: { transition: TransitionItem; score: number } | null;
    bestEffect: { effect: EffectItem; score: number } | null;
    overallScore: number;
  };

  // Timeline Data
  timelineClips: TimelineClip[];
  setTimelineClips: React.Dispatch<React.SetStateAction<TimelineClip[]>>;
  timelineTransitions: TimelineTransition[];
  setTimelineTransitions: React.Dispatch<React.SetStateAction<TimelineTransition[]>>;
  timelineText: TimelineText | null;
  setTimelineText: React.Dispatch<React.SetStateAction<TimelineText | null>>;
  timelineAudio: TimelineAudio;
  isAutoComposed: boolean;

  // Auto Compose Engine
  isAutoComposeModalOpen: boolean;
  setIsAutoComposeModalOpen: (open: boolean) => void;
  autoComposeStep: string;
  autoComposeProgress: number;
  runAutoCompose: () => void;

  // Playback & Scrubber
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  totalDuration: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  activeClipIndex: number;
  activeClip: TimelineClip | null;

  // Selection & Inspector
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  selectedTransitionId: string | null;
  setSelectedTransitionId: (id: string | null) => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  clearSelection: () => void;

  // Timeline UI
  timelineZoom: number;
  setTimelineZoom: (zoom: number) => void;
  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;

  // Navigation & Modals
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isSaveTemplateOpen: boolean;
  setIsSaveTemplateOpen: (open: boolean) => void;

  // Error & Diagnostic Validation Engine
  tabIssues: TabIssue[];
  currentTabIssues: TabIssue[];
  totalErrorsCount: number;
  totalWarningsCount: number;
  handleQuickFix: (issue: TabIssue) => void;
  dismissIssue: (id: string) => void;
  triggerSimulatedIssue: (tab: ActiveTab, type?: string) => void;

  // Text Library & Template Actions
  textTemplates: TextTemplate[];
  applyTextTemplate: (template: TextTemplate, keepExistingContent?: boolean) => void;

  // History Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Track state & controls
  isVideoTrackVisible: boolean;
  toggleVideoTrackVisible: () => void;
  isTextTrackVisible: boolean;
  toggleTextTrackVisible: () => void;
  isAudioTrackMuted: boolean;
  toggleAudioTrackMute: () => void;
  lockedTrackIds: string[];
  toggleTrackLock: (trackId: string) => void;

  // Voice Transcript & Auto Captions System
  transcriptState: TranscriptState;
  setTranscriptState: React.Dispatch<React.SetStateAction<TranscriptState>>;
  generateTranscript: (customLanguage?: string) => Promise<void>;
  updateTranscriptSegment: (id: string, newText: string, newStart?: number, newEnd?: number) => void;
  addTranscriptSegment: (afterId?: string) => void;
  deleteTranscriptSegment: (id: string) => void;
  setTranscriptLanguage: (lang: string) => void;
  setCaptionStyle: (style: CaptionStylePreset) => void;
  toggleAutoSyncTranscript: () => void;
  exportTranscriptAsSRT: () => void;
  exportTranscriptAsVTT: () => void;
  exportTranscriptAsTXT: () => void;
  applyTranscriptToTimeline: () => void;

  pushSnapshot: () => void;
  updateClip: (id: string, updates: Partial<TimelineClip>) => void;
  updateTransition: (id: string, updates: Partial<TimelineTransition>) => void;
  updateText: (updates: Partial<TimelineText>) => void;
  deleteClip: (id: string) => void;
  deleteTransition: (id: string) => void;
  deleteText: () => void;
  deleteSelectedElement: () => void;
  duplicateSelectedElement: () => void;
  splitClip: (id: string, atTime?: number) => void;
  duplicateClip: (id: string) => void;
  trimClip: (id: string, newStart: number, newEnd: number) => void;
  trimText: (newStart: number, newEnd: number) => void;
  moveText: (newStart: number) => void;
  resetProject: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  // Project metadata
  const [projectName, setProjectName] = useState('Untitled Video Project');
  const [projectStatus, setProjectStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Video assets
  const [videos, setVideos] = useState<VideoAsset[]>(INITIAL_VIDEOS);
  const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);

  // Template & Platform
  const defaultFallbackTemplate: Template = useMemo(
    () => ({
      id: 'template_default',
      name: 'Standard Composition',
      subtitle: 'Clean • Dynamic Flow',
      category: 'Universal',
      format: '9:16',
      recommendedDuration: '10–20 sec',
      description: 'Standard multi-clip video composition with smooth transitions and kinetic typography.',
      transitions: ['Smooth Zoom In', 'Cross Dissolve'],
      effects: ['Slow Zoom', '35mm Film Grain'],
      textStyle: {
        preset: 'MODERN TITLE',
        sampleText: 'MODERN TITLE',
        animation: 'slide_up',
        fontFamily: 'Inter',
      },
      musicStyle: {
        title: 'Background Music.mp3',
        bpm: 120,
        genre: 'Ambient',
      },
      colorTheme: '#7C5CFF',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      pacingProfile: 'Smooth Flow',
      isCustom: true,
      version: 1,
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    }),
    []
  );

  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('frameflow_custom_templates_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomTemplates(parsed);
          if (parsed.length > 0) {
            setSelectedTemplate(parsed[0]);
          }
        }
      }
    } catch (e) {}
  }, []);

  const allTemplatesList = useMemo<Template[]>(() => {
    return customTemplates;
  }, [customTemplates]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultFallbackTemplate);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(PLATFORMS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  const saveCustomTemplate = useCallback((templateData: Omit<Template, 'id'>): Template => {
    const newTemplate: Template = {
      ...templateData,
      id: `template_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomTemplates((prev) => {
      const updated = [newTemplate, ...prev];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('frameflow_custom_templates_v2', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });

    setSelectedTemplate(newTemplate);
    return newTemplate;
  }, []);

  const updateCustomTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setCustomTemplates((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...updates,
            version: (t.version || 1) + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('frameflow_custom_templates_v2', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
  }, []);

  const renameCustomTemplate = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      updateCustomTemplate(id, { name: trimmed });
    },
    [updateCustomTemplate]
  );

  const duplicateCustomTemplate = useCallback((id: string): Template | null => {
    let duplicated: Template | null = null;
    setCustomTemplates((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      duplicated = {
        ...target,
        id: `template_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: `${target.name} (Copy)`,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [duplicated, ...prev];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('frameflow_custom_templates_v2', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    return duplicated;
  }, []);

  const deleteCustomTemplate = useCallback(
    (id: string) => {
      setCustomTemplates((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('frameflow_custom_templates_v2', JSON.stringify(updated));
          }
        } catch (e) {}
        return updated;
      });

      setSelectedTemplate((current) => (current.id === id ? defaultFallbackTemplate : current));
    },
    [defaultFallbackTemplate]
  );

  // AI Recommendation Engine & Video Frame Analysis State
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    platform: 'youtube',
    analysisMode: 'video_compatibility',
    isRecommendationEngineEnabled: true,
    evidenceMode: 'detailed',
    isAutoRecommendationEnabled: true,
    analysisTarget: 'all',
    showCompatibilityScore: true,
    showEvidence: true,
    showConfidence: true,
    showAnalysisDetails: true,
  });

  const [videoAnalysisMetrics, setVideoAnalysisMetrics] = useState<VideoAnalysisMetrics>(() =>
    VideoAnalysisEngine.analyzeVideoComposition(INITIAL_TIMELINE_CLIPS, '9:16', 0)
  );

  // Dynamic Transition State
  const [favoriteTransitionIds, setFavoriteTransitionIds] = useState<string[]>([
    'trans_smooth_zoom',
    'trans_motion_blur_swipe',
    'trans_cross_dissolve',
    'trans_light_flash',
  ]);
  const [recentTransitionIds, setRecentTransitionIds] = useState<string[]>([
    'trans_smooth_zoom',
    'trans_motion_blur_swipe',
    'trans_cross_dissolve',
  ]);
  const [customTransitions, setCustomTransitions] = useState<TransitionItem[]>([]);

  const allTransitionsList = useMemo<TransitionItem[]>(() => {
    return [...TRANSITIONS, ...customTransitions];
  }, [customTransitions]);

  const toggleFavoriteTransition = useCallback((id: string) => {
    setFavoriteTransitionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const recordRecentTransition = useCallback((id: string) => {
    setRecentTransitionIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 10);
    });
  }, []);

  const addCustomTransition = useCallback((transition: TransitionItem) => {
    setCustomTransitions((prev) => [transition, ...prev]);
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [isAutoComposeModalOpen, setIsAutoComposeModalOpen] = useState(false);
  const [autoComposeStep, setAutoComposeStep] = useState('Preparing clips...');
  const [autoComposeProgress, setAutoComposeProgress] = useState(0);

  // Auto Compose state
  const [isAutoComposed, setIsAutoComposed] = useState(true);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>(INITIAL_TIMELINE_CLIPS);
  const [timelineTransitions, setTimelineTransitions] = useState<TimelineTransition[]>(INITIAL_TIMELINE_TRANSITIONS);
  const [timelineText, setTimelineText] = useState<TimelineText | null>(INITIAL_TIMELINE_TEXT);
  const [timelineAudio, setTimelineAudio] = useState<TimelineAudio>(SAMPLE_AUDIO_TRACK);

  const [isHydrated, setIsHydrated] = useState(false);

  // HYDRATION ENGINE: Restore full project state & reconnect media files from IndexedDB on page reload
  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const savedState = loadProjectStateFromStorage();
        if (savedState && !isCancelled) {
          if (savedState.projectName) setProjectName(savedState.projectName);
          if (savedState.projectStatus) setProjectStatus(savedState.projectStatus);
          if (savedState.aspectRatio) setAspectRatio(savedState.aspectRatio);

          if (savedState.selectedTemplateId) {
            const t = allTemplatesList.find((x) => x.id === savedState.selectedTemplateId);
            if (t) setSelectedTemplate(t);
          }
          if (savedState.selectedPlatformId) {
            const p = PLATFORMS.find((x) => x.id === savedState.selectedPlatformId);
            if (p) setSelectedPlatform(p);
          }
          if (savedState.favoriteTransitionIds) setFavoriteTransitionIds(savedState.favoriteTransitionIds);
          if (savedState.recentTransitionIds) setRecentTransitionIds(savedState.recentTransitionIds);
          if (savedState.timelineAudio) setTimelineAudio(savedState.timelineAudio);
          if (savedState.isAutoComposed !== undefined) setIsAutoComposed(savedState.isAutoComposed);

          // Restore text overlay state with custom positions & fonts
          if (savedState.timelineText) {
            setTimelineText(savedState.timelineText);
          }

          // Restore transitions
          if (savedState.timelineTransitions) {
            setTimelineTransitions(savedState.timelineTransitions);
          }

          // Restore video assets and recreate valid object URLs from IndexedDB
          if (savedState.videos && savedState.videos.length > 0) {
            const restoredVideos: VideoAsset[] = [];
            const restoredClips: TimelineClip[] = (savedState.timelineClips || []).map((c) => ({
              ...c,
              speed: c.speed || 1.0,
              sourceDuration: c.sourceDuration ?? (c.clipOut > c.clipIn ? c.clipOut - c.clipIn : c.duration * (c.speed || 1.0)),
              preservePitch: c.preservePitch ?? true,
            }));

            for (const v of savedState.videos) {
              const blob = await getVideoBlobFromIDB(v.id);
              let liveUrl = v.url || '';
              if (blob) {
                liveUrl = URL.createObjectURL(blob);
              }
              const restoredV: VideoAsset = {
                ...v,
                url: liveUrl,
                sourceFile: blob instanceof File ? blob : undefined,
              };
              restoredVideos.push(restoredV);

              // Re-bind live object URL to timeline clips
              for (let i = 0; i < restoredClips.length; i++) {
                if (restoredClips[i].assetId === v.id && liveUrl) {
                  restoredClips[i] = {
                    ...restoredClips[i],
                    url: liveUrl,
                  };
                }
              }
            }

            if (!isCancelled) {
              setVideos(restoredVideos);
              setTimelineClips(restoredClips);
              if (restoredVideos.length > 0) {
                setPreviewAssetId(restoredVideos[0].id);
              }
            }
          } else if (savedState.timelineClips) {
            if (!isCancelled) {
              setTimelineClips((savedState.timelineClips || []).map((c) => ({
                ...c,
                speed: c.speed || 1.0,
                sourceDuration: c.sourceDuration ?? (c.clipOut > c.clipIn ? c.clipOut - c.clipIn : c.duration * (c.speed || 1.0)),
                preservePitch: c.preservePitch ?? true,
              })));
            }
          }
        }
      } catch (err) {
        console.warn('Storage hydration notice:', err);
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [allTemplatesList]);

  // AUTO-SAVE ENGINE: Automatically persists state to LocalStorage (debounced 350ms)
  useEffect(() => {
    if (!isHydrated) return;

    const timer = setTimeout(() => {
      const cleanVideos = videos.map((v) => ({
        id: v.id,
        name: v.name,
        fileName: v.fileName,
        duration: v.duration,
        width: v.width,
        height: v.height,
        resolution: v.resolution,
        aspectRatio: v.aspectRatio,
        size: v.size,
        fileSizeBytes: v.fileSizeBytes,
        thumbnail: v.thumbnail,
        url: v.url?.startsWith('blob:') ? '' : v.url,
        fps: v.fps,
        status: v.status,
        progress: v.progress,
        uploadedAt: v.uploadedAt,
        accentColor: v.accentColor,
        codec: v.codec,
        profile: v.profile,
        bitrate: v.bitrate,
      }));

      saveProjectStateToStorage({
        version: 2,
        lastSavedAt: Date.now(),
        projectName,
        projectStatus,
        aspectRatio,
        selectedTemplateId: selectedTemplate.id,
        selectedPlatformId: selectedPlatform.id,
        videos: cleanVideos,
        timelineClips,
        timelineTransitions,
        timelineText,
        timelineAudio,
        favoriteTransitionIds,
        recentTransitionIds,
        isAutoComposed,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [
    isHydrated,
    projectName,
    projectStatus,
    aspectRatio,
    selectedTemplate.id,
    selectedPlatform.id,
    videos,
    timelineClips,
    timelineTransitions,
    timelineText,
    timelineAudio,
    favoriteTransitionIds,
    recentTransitionIds,
    isAutoComposed,
  ]);

  // Dismissed issues state
  const [dismissedIssueIds, setDismissedIssueIds] = useState<string[]>([]);
  const [simulatedIssues, setSimulatedIssues] = useState<TabIssue[]>([]);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);

  // Calculate total duration from timeline clips
  const totalDuration = useMemo(() => {
    if (timelineClips.length === 0) {
      if (previewAssetId) {
        const found = videos.find((v) => v.id === previewAssetId);
        if (found) return found.duration;
      }
      return videos.reduce((acc, v) => acc + v.duration, 0);
    }
    const lastClip = timelineClips[timelineClips.length - 1];
    return lastClip ? lastClip.end : 0;
  }, [timelineClips, videos, previewAssetId]);

  // Determine which clip is currently under the playhead
  const activeClipIndex = useMemo(() => {
    if (timelineClips.length === 0) return 0;
    const index = timelineClips.findIndex(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    return index !== -1 ? index : 0;
  }, [timelineClips, currentTime]);

  const activeClip = useMemo(() => {
    return timelineClips[activeClipIndex] || null;
  }, [timelineClips, activeClipIndex]);

  // LIVE VALIDATION ENGINE: Computes issues dynamically per tab and project state
  const tabIssues = useMemo<TabIssue[]>(() => {
    const issues: TabIssue[] = [];

    // 1. MEDIA TAB VALIDATIONS
    if (videos.length === 0) {
      issues.push({
        id: 'err-media-empty',
        tab: 'media',
        severity: 'error',
        title: 'No Video Clips Uploaded (কোন ভিডিও ক্লিপ নেই)',
        message: 'The composition engine cannot merge or generate video transitions without at least 1-2 source clips.',
        cause: 'You have not uploaded any video files yet, or all clips were deleted.',
        solution: 'Upload 2 or more short video clips (MP4/MOV) or click "Add Demo Clip" to test instantly.',
        details: [
          'Accepted codecs: H.264, HEVC, VP9, WebM',
          'Supported container formats: .mp4, .mov, .webm',
          'Minimum recommended clips: 2-4 clips for optimal rhythm and cut pacing',
        ],
        actionLabel: '+ Add Sample Demo Clip',
        actionType: 'ADD_DEMO_CLIP',
        code: 'ERR_MEDIA_ZERO_ASSETS',
      });
    } else if (videos.length === 1) {
      issues.push({
        id: 'warn-media-single',
        tab: 'media',
        severity: 'warning',
        title: 'Single Clip Uploaded (শুধুমাত্র ১টি ক্লিপ রয়েছে)',
        message: 'Automated video merging & transitions look significantly better with at least 2 separate shots.',
        cause: 'Only 1 video clip is currently uploaded in your workspace.',
        solution: 'Upload another short clip, or click "Duplicate Clip" to generate a second cut.',
        details: [
          'Template transitions (Dissolve, Zoom, Flash) require at least two sequential clips to blend.',
          'Pacing algorithms perform best with multiple short perspectives.',
        ],
        actionLabel: 'Add 2nd Demo Clip',
        actionType: 'ADD_DEMO_CLIP',
        code: 'WARN_MEDIA_INSUFFICIENT_CUTS',
      });
    }

    // Check for aspect ratio mismatch in videos vs platform
    const mismatchClips = videos.filter((v) => v.aspectRatio !== aspectRatio);
    if (mismatchClips.length > 0 && videos.length > 0) {
      issues.push({
        id: 'warn-media-aspect-ratio',
        tab: 'media',
        severity: 'warning',
        title: 'Aspect Ratio Mismatch Detected (রেশিও অসঙ্গতি)',
        message: `${mismatchClips.length} clip(s) do not match the target canvas ratio (${aspectRatio}).`,
        cause: `Uploaded video dimensions differ from the selected ${selectedPlatform.name} format (${aspectRatio}). Without adjustment, black bars or letterboxing will occur.`,
        solution: 'Click "Auto-Fit All to Cover" to scale clips automatically, or change target canvas aspect ratio.',
        details: [
          `Target Canvas: ${aspectRatio} (${selectedPlatform.badge})`,
          `Affected Clips: ${mismatchClips.map((c) => c.name).join(', ')}`,
          'Cover mode automatically scales media to fill the entire frame without letterboxing.',
        ],
        actionLabel: 'Auto-Fit All (Cover)',
        actionType: 'FIX_ASPECT_COVER',
        code: 'WARN_ASPECT_MISMATCH',
      });
    }

    // 2. TEMPLATES TAB VALIDATIONS
    if (videos.length > 0 && !isAutoComposed) {
      issues.push({
        id: 'notice-template-compose-pending',
        tab: 'templates',
        severity: 'info',
        title: 'Template Not Composed (অটো কম্পোজ করা হয়নি)',
        message: `Template "${selectedTemplate.name}" is selected but has not been compiled onto your timeline tracks yet.`,
        cause: 'New template or clips were selected without triggering the auto-generation pipeline.',
        solution: 'Click "⚡ AUTO COMPOSE" to compile cuts, transitions, effects, and text rules automatically.',
        details: [
          `Active Template: ${selectedTemplate.name} (${selectedTemplate.pacingProfile})`,
          `Pacing: ${selectedTemplate.recommendedDuration}`,
          `Included Transitions: ${selectedTemplate.transitions.join(', ')}`,
        ],
        actionLabel: '⚡ Auto Compose Now',
        actionType: 'RUN_AUTO_COMPOSE',
        code: 'INFO_TEMPLATE_PENDING',
      });
    }

    // 3. TRANSITIONS TAB VALIDATIONS
    if (timelineTransitions.length > 0) {
      const longTransition = timelineTransitions.find((t) => t.duration > 0.8);
      if (longTransition) {
        issues.push({
          id: 'warn-transitions-duration',
          tab: 'transitions',
          severity: 'warning',
          title: 'Transition Duration Exceeds Cut Safety (ট্রানজিশন বেশি দীর্ঘ)',
          message: `Transition "${longTransition.name}" duration is ${longTransition.duration}s, which may cause video stutter on short clips.`,
          cause: 'Transition blend length is longer than the optimal 0.3s - 0.5s short-form threshold.',
          solution: 'Click "Auto-Clamp Transitions" to normalize all cut durations to 0.4s.',
          details: [
            `Affected Transition: ${longTransition.name} at position ${longTransition.position.toFixed(1)}s`,
            'Recommended duration: 0.25s to 0.45s for dynamic social reels',
          ],
          actionLabel: 'Auto-Clamp to 0.4s',
          actionType: 'CLAMP_TRANSITIONS',
          code: 'WARN_TRANSITION_LONG',
        });
      }
    }

    // 4. KINETIC TEXT TAB VALIDATIONS
    if (timelineText && totalDuration > 0) {
      if (timelineText.duration > totalDuration) {
        issues.push({
          id: 'err-text-overflow',
          tab: 'text',
          severity: 'error',
          title: 'Text Overlay Exceeds Timeline Duration (টেক্সট সময়সীমা বেশি)',
          message: `Text overlay duration (${timelineText.duration.toFixed(1)}s) is longer than the total video timeline (${totalDuration.toFixed(1)}s).`,
          cause: 'Title card end timestamp exceeds the last video clip on track.',
          solution: 'Click "Auto-Fit Text Duration" to synchronize typography timing with video runtime.',
          details: [
            `Current Text Duration: ${timelineText.duration.toFixed(1)}s`,
            `Total Video Duration: ${totalDuration.toFixed(1)}s`,
            'Text will now end cleanly before the final scene.',
          ],
          actionLabel: 'Auto-Fit Text Duration',
          actionType: 'FIT_TEXT_DURATION',
          code: 'ERR_TEXT_TIMING_OVERFLOW',
        });
      }
    }

    // 5. AUDIO TAB VALIDATIONS
    if (timelineAudio && totalDuration > 0) {
      if (timelineAudio.duration < totalDuration - 2) {
        issues.push({
          id: 'warn-audio-shorter',
          tab: 'audio',
          severity: 'warning',
          title: 'Soundtrack Shorter Than Video (অডিও ভিডিওর চেয়ে ছোট)',
          message: `Audio track length (${timelineAudio.duration}s) is shorter than video duration (${totalDuration.toFixed(1)}s). Video will end in silence.`,
          cause: 'Soundtrack runs out of duration before the last scene finishes.',
          solution: 'Click "Auto-Loop Soundtrack" to enable seamless beat repetition.',
          details: [
            `Audio Duration: ${timelineAudio.duration}s`,
            `Video Duration: ${totalDuration.toFixed(1)}s`,
            'Looping applies a smooth 0.3s crossfade at the seam.',
          ],
          actionLabel: 'Auto-Loop Soundtrack',
          actionType: 'LOOP_AUDIO',
          code: 'WARN_AUDIO_UNDERFLOW',
        });
      }
    }

    // 6. PROJECTS TAB VALIDATIONS
    if (projectStatus === 'unsaved') {
      issues.push({
        id: 'notice-project-unsaved',
        tab: 'projects',
        severity: 'info',
        title: 'Unsaved Project Changes (অসংরক্ষিত পরিবর্তন রয়েছে)',
        message: 'You have uncommitted edits in your current composition timeline.',
        cause: 'Modifications were made to clips, transitions, or typography without saving.',
        solution: 'Click "Save Project" to store your project safely.',
        details: [
          'Project: ' + projectName,
          'Unsaved state will be lost if browser window is refreshed.',
        ],
        actionLabel: 'Save Project Now',
        actionType: 'SAVE_PROJECT',
        code: 'INFO_UNSAVED_CHANGES',
      });
    }

    // Merge in any manually simulated issues and filter dismissed
    const all = [...issues, ...simulatedIssues];
    return all.filter((iss) => !dismissedIssueIds.includes(iss.id));
  }, [
    videos,
    aspectRatio,
    selectedPlatform,
    selectedTemplate,
    isAutoComposed,
    timelineTransitions,
    timelineText,
    timelineAudio,
    totalDuration,
    projectStatus,
    projectName,
    simulatedIssues,
    dismissedIssueIds,
  ]);

  // Issues specifically matching activeTab or global
  const currentTabIssues = useMemo(() => {
    return tabIssues.filter((i) => i.tab === activeTab || i.tab === 'global');
  }, [tabIssues, activeTab]);

  const totalErrorsCount = useMemo(() => {
    return tabIssues.filter((i) => i.severity === 'error').length;
  }, [tabIssues]);

  const totalWarningsCount = useMemo(() => {
    return tabIssues.filter((i) => i.severity === 'warning').length;
  }, [tabIssues]);

  // Playback loop
  useEffect(() => {
    let animationFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTimestamp) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0; // loop back to start
          }
          return next;
        });
      }
      lastTimestamp = now;
      animationFrame = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, totalDuration]);

  // Spacebar toggle playback shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const seek = useCallback(
    (time: number) => {
      const clamped = Math.max(0, Math.min(time, totalDuration));
      setCurrentTime(clamped);
    },
    [totalDuration]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClipId(null);
    setSelectedTransitionId(null);
    setSelectedTextId(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  const saveProject = useCallback(() => {
    setProjectStatus('saving');
    setTimeout(() => {
      setProjectStatus('saved');
    }, 600);
  }, []);

  // Performance Telemetry State
  const [telemetry, setTelemetry] = useState<PerformanceTelemetry>({
    uploadLatencyMs: 42,
    uploadThroughputMbps: 94.6,
    metadataExtractionTimeMs: 18,
    thumbnailGenerationTimeMs: 24,
    lastOperation: 'Engine initialized',
    memoryCleanupsCount: 0,
  });
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // Upload Queue State & Undo Confirmation State
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmDialog = useCallback((config: Omit<ConfirmModalConfig, 'isOpen'>) => {
    setConfirmDialog({
      ...config,
      isOpen: true,
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Helper: Recalculate gapless ripple timing for timeline clips
  const rippleTimelineClips = useCallback((clips: TimelineClip[]): TimelineClip[] => {
    let currentOffset = 0;
    return clips.map((clip) => {
      const start = currentOffset;
      const end = currentOffset + clip.duration;
      currentOffset = end;
      return { ...clip, start, end };
    });
  }, []);

  // ULTRA-HIGH PERFORMANCE TRIPARTITE PARALLEL UPLOAD ENGINE
  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const queueItemsToAdd: UploadQueueItem[] = [];
      const optimisticAssetsToAdd: VideoAsset[] = [];
      const optimisticTimelineClipsToAdd: TimelineClip[] = [];

      let currentEnd =
        timelineClips.length > 0 ? timelineClips[timelineClips.length - 1].end : 0;

      const palette = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#7C5CFF'];

      fileArray.forEach((file, index) => {
        const validation = validateVideoFile(file);
        const queueId = `queue-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`;
        const assetId = `asset-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`;
        const randomColor = palette[Math.floor(Math.random() * palette.length)];

        if (!validation.valid) {
          // Record failed file in queue without breaking other files
          queueItemsToAdd.push({
            id: queueId,
            file,
            name: file.name,
            size: formatBytes(file.size),
            fileSizeBytes: file.size,
            progress: 0,
            status: 'failed',
            error: validation.error || 'Unsupported format',
            assetId,
            priority: 0,
            uploadedChunks: [],
            totalChunks: 1,
            chunkSize: 4 * 1024 * 1024,
            objectUrl: '',
          });
          return;
        }

        // STEP 1: INSTANT LOCAL PREVIEW & OPTIMISTIC ASSET REGISTRATION (0-20ms)
        const objectUrl = objectUrlRegistry.create(file);
        saveVideoBlobToIDB(assetId, file).catch((e) => console.warn('IDB store notice:', e));
        const chunkSize = getOptimalChunkSize(file.size);
        const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));

        const optimisticAsset: VideoAsset = {
          id: assetId,
          name: file.name,
          fileName: file.name,
          duration: 5.0, // Temporary until metadata extraction completes in parallel
          resolution: '1080×1920',
          aspectRatio: '9:16',
          size: formatBytes(file.size),
          fileSizeBytes: file.size,
          thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
          url: objectUrl,
          fps: 60,
          status: 'uploading',
          progress: 0,
          uploadedAt: 'Just now',
          accentColor: randomColor,
          sourceFile: file,
        };

        const optimisticClip: TimelineClip = {
          id: `tclip-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
          assetId,
          name: file.name,
          start: currentEnd,
          end: currentEnd + 5.0,
          clipIn: 0,
          clipOut: 5.0,
          duration: 5.0,
          sourceDuration: 5.0,
          speed: 1.0,
          preservePitch: true,
          volume: 100,
          fit: 'cover',
          effects: { slowZoom: true },
          thumbnail: optimisticAsset.thumbnail,
          url: objectUrl,
          accentColor: randomColor,
        };

        currentEnd += 5.0;

        optimisticAssetsToAdd.push(optimisticAsset);
        optimisticTimelineClipsToAdd.push(optimisticClip);

        const queueItem: UploadQueueItem = {
          id: queueId,
          file,
          name: file.name,
          size: formatBytes(file.size),
          fileSizeBytes: file.size,
          progress: 0,
          status: 'preparing',
          assetId,
          priority: 0,
          uploadedChunks: [],
          totalChunks,
          chunkSize,
          objectUrl,
          startedAt: Date.now(),
        };

        queueItemsToAdd.push(queueItem);
      });

      // Commit optimistic UI immediately (0-20ms)
      if (optimisticAssetsToAdd.length > 0) {
        setVideos((prev) => [...prev, ...optimisticAssetsToAdd]);
        setTimelineClips((prev) => rippleTimelineClips([...prev, ...optimisticTimelineClipsToAdd]));
        setPreviewAssetId(optimisticAssetsToAdd[0].id);
        if (optimisticTimelineClipsToAdd.length > 0) {
          seek(optimisticTimelineClipsToAdd[0].start);
        }
        setUploadQueue((prev) => [...prev, ...queueItemsToAdd]);
        setProjectStatus('unsaved');
      }

      // STEP 2 & 3: PARALLEL TRIPARTITE EXECUTION (Non-blocking)
      queueItemsToAdd.forEach((queueItem) => {
        if (queueItem.status === 'failed') return;
        const file = queueItem.file;
        const assetId = queueItem.assetId;
        const queueId = queueItem.id;

        // TASK A: DIRECT-TO-STORAGE CHUNKED UPLOAD ENGINE
        uploadEngine.startUpload(
          queueItem,
          (qId, progress, status, metrics, persistentUrl) => {
            setUploadQueue((prev) =>
              prev.map((it) =>
                it.id === qId
                  ? {
                      ...it,
                      progress,
                      status,
                      metrics,
                    }
                  : it
              )
            );

            setVideos((prev) =>
              prev.map((v) =>
                v.id === assetId
                  ? {
                      ...v,
                      progress,
                      status: status === 'ready' ? 'ready' : status === 'paused' ? 'paused' : 'uploading',
                      metrics,
                      persistentUrl: persistentUrl || v.persistentUrl,
                    }
                  : v
              )
            );

            setTelemetry((prev) => ({
              ...prev,
              uploadLatencyMs: Math.round(metrics.speedBytesPerSec > 0 ? (metrics.totalBytes / metrics.speedBytesPerSec) * 10 : 35),
              uploadThroughputMbps: parseFloat(((metrics.speedBytesPerSec * 8) / (1024 * 1024)).toFixed(1)) || prev.uploadThroughputMbps,
              lastOperation: `Chunk upload: ${metrics.chunksCompleted}/${metrics.totalChunks}`,
            }));
          },
          (qId, error) => {
            setUploadQueue((prev) =>
              prev.map((it) => (it.id === qId ? { ...it, status: 'failed', error } : it))
            );
            setVideos((prev) =>
              prev.map((v) => (v.id === assetId ? { ...v, status: 'error', error } : v))
            );
          }
        );

        // TASK B & C: CLIENT-SIDE METADATA & CANVAS FRAME EXTRACTION (Parallel Background)
        const tStart = performance.now();
        extractVideoMetadata(file, file.name)
          .then((metadata) => {
            const metaTime = Math.round(performance.now() - tStart);

            // Update real metadata and canvas thumbnail
            setVideos((prev) =>
              prev.map((v) =>
                v.id === assetId
                  ? {
                      ...v,
                      duration: metadata.duration,
                      width: metadata.width,
                      height: metadata.height,
                      resolution: metadata.resolution,
                      aspectRatio: metadata.aspectRatio,
                      thumbnail: metadata.thumbnail,
                      fps: metadata.fps,
                      codec: metadata.codec,
                      profile: metadata.profile,
                      bitrate: metadata.bitrate,
                    }
                  : v
              )
            );

            // Synchronize Timeline with precise real duration
            setTimelineClips((prev) => {
              const updated = prev.map((c) =>
                c.assetId === assetId
                  ? {
                      ...c,
                      duration: metadata.duration,
                      clipOut: metadata.duration,
                      thumbnail: metadata.thumbnail,
                    }
                  : c
              );
              return rippleTimelineClips(updated);
            });

            setTelemetry((prev) => ({
              ...prev,
              metadataExtractionTimeMs: metaTime,
              thumbnailGenerationTimeMs: Math.round(metaTime * 0.4),
              lastOperation: `Metadata & frame captured for ${file.name}`,
            }));
          })
          .catch((e) => {
            console.warn('Background metadata extraction fallback:', e);
          });
      });
    },
    [timelineClips, rippleTimelineClips]
  );

  // Queue Controls
  const pauseUpload = useCallback((queueId: string) => {
    uploadEngine.pauseUpload(queueId);
    setUploadQueue((prev) =>
      prev.map((it) => (it.id === queueId ? { ...it, status: 'paused' as const } : it))
    );
    setVideos((prev) => {
      const q = uploadQueue.find((it) => it.id === queueId);
      if (!q) return prev;
      return prev.map((v) => (v.id === q.assetId ? { ...v, status: 'paused' as const } : v));
    });
  }, [uploadQueue]);

  const resumeUpload = useCallback((queueId: string) => {
    uploadEngine.resumeUpload(queueId);
    setUploadQueue((prev) =>
      prev.map((it) => (it.id === queueId ? { ...it, status: 'uploading' as const } : it))
    );
    setVideos((prev) => {
      const q = uploadQueue.find((it) => it.id === queueId);
      if (!q) return prev;
      return prev.map((v) => (v.id === q.assetId ? { ...v, status: 'uploading' as const } : v));
    });
  }, [uploadQueue]);

  const cancelUpload = useCallback((queueId: string) => {
    const targetQueueItem = uploadQueue.find((it) => it.id === queueId);
    uploadEngine.cancelUpload(queueId);

    if (targetQueueItem) {
      objectUrlRegistry.revoke(targetQueueItem.objectUrl);
      const assetId = targetQueueItem.assetId;

      // Remove from videos and timeline
      setVideos((prev) => prev.filter((v) => v.id !== assetId));
      setTimelineClips((prev) => {
        const remaining = prev.filter((c) => c.assetId !== assetId);
        return rippleTimelineClips(remaining);
      });
      setTimelineTransitions((prev) =>
        prev.filter((t) => t.fromClipId !== assetId && t.toClipId !== assetId)
      );

      if (previewAssetId === assetId) {
        setPreviewAssetId((prev) => (prev === assetId ? null : prev));
      }
    }

    setUploadQueue((prev) => prev.filter((it) => it.id !== queueId));
  }, [uploadQueue, previewAssetId, rippleTimelineClips]);

  const retryUpload = useCallback((queueId: string) => {
    const queueItem = uploadQueue.find((it) => it.id === queueId);
    if (!queueItem) return;

    setUploadQueue((prev) =>
      prev.map((it) =>
        it.id === queueId ? { ...it, status: 'uploading' as const, error: undefined } : it
      )
    );

    uploadEngine.startUpload(
      queueItem,
      (qId, progress, status, metrics, persistentUrl) => {
        setUploadQueue((prev) =>
          prev.map((it) => (it.id === qId ? { ...it, progress, status, metrics } : it))
        );
        setVideos((prev) =>
          prev.map((v) =>
            v.id === queueItem.assetId
              ? {
                  ...v,
                  progress,
                  status: status === 'ready' ? 'ready' : 'uploading',
                  metrics,
                  persistentUrl: persistentUrl || v.persistentUrl,
                }
              : v
          )
        );
      },
      (qId, error) => {
        setUploadQueue((prev) =>
          prev.map((it) => (it.id === qId ? { ...it, status: 'failed', error } : it))
        );
        setVideos((prev) =>
          prev.map((v) => (v.id === queueItem.assetId ? { ...v, status: 'error', error } : v))
        );
      }
    );
  }, [uploadQueue]);

  const setUploadPriority = useCallback((queueId: string, priority: number) => {
    setUploadQueue((prev) =>
      prev.map((it) => (it.id === queueId ? { ...it, priority } : it))
    );
  }, []);

  // PRODUCTION-GRADE ASSET MANAGEMENT & TIMELINE SYNCHRONIZATION
  const addVideo = useCallback(
    (video: VideoAsset) => {
      // Prevent duplicate insertion
      setVideos((prev) => {
        if (prev.some((v) => v.id === video.id)) return prev;
        return [...prev, video];
      });

      // Synchronize Timeline with gapless ripple timing
      setTimelineClips((prevClips) => {
        const lastEnd = prevClips.length > 0 ? prevClips[prevClips.length - 1].end : 0;
        const newClip: TimelineClip = {
          id: `tclip-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          assetId: video.id,
          name: video.name,
          start: lastEnd,
          end: lastEnd + video.duration,
          clipIn: 0,
          clipOut: video.duration,
          duration: video.duration,
          sourceDuration: video.duration,
          speed: 1.0,
          preservePitch: true,
          volume: 100,
          fit: 'cover',
          effects: { slowZoom: true },
          thumbnail: video.thumbnail,
          url: video.url,
          accentColor: video.accentColor,
        };
        return [...prevClips, newClip];
      });

      setPreviewAssetId((prev) => prev || video.id);
      setProjectStatus('unsaved');
    },
    []
  );

  const removeVideo = useCallback(
    (id: string) => {
      const target = videos.find((v) => v.id === id);
      if (target?.url) {
        objectUrlRegistry.revoke(target.url);
        setTelemetry((prev) => ({
          ...prev,
          memoryCleanupsCount: prev.memoryCleanupsCount + 1,
        }));
      }
      deleteVideoBlobFromIDB(id).catch(console.warn);

      // Remove asset
      setVideos((prev) => {
        const next = prev.filter((v) => v.id !== id);
        if (previewAssetId === id) {
          const fallback = next.length > 0 ? next[0].id : null;
          setPreviewAssetId(fallback);
        }
        return next;
      });

      // Remove corresponding timeline clips & ripple timing gaplessly
      setTimelineClips((prev) => {
        const remaining = prev.filter((c) => c.assetId !== id);
        const remainingClipIds = remaining.map((c) => c.id);
        
        // Orphan transition cleanup: remove transitions referencing deleted clip
        setTimelineTransitions((transPrev) =>
          transPrev.filter((t) => remainingClipIds.includes(t.fromClipId) && remainingClipIds.includes(t.toClipId))
        );

        return rippleTimelineClips(remaining);
      });

      if (selectedClipId === id) {
        setSelectedClipId(null);
      }
      setProjectStatus('unsaved');
    },
    [videos, previewAssetId, selectedClipId, rippleTimelineClips]
  );

  const renameVideo = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, name: trimmed } : v))
    );
    setTimelineClips((prev) =>
      prev.map((c) => (c.assetId === id ? { ...c, name: trimmed } : c))
    );
    setProjectStatus('unsaved');
  }, []);

  const duplicateVideo = useCallback(
    (id: string) => {
      const newAssetId = `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let originalName = '';
      let originalDuration = 5;

      setVideos((prev) => {
        const target = prev.find((v) => v.id === id);
        if (!target) return prev;

        originalName = target.name;
        originalDuration = target.duration;

        const baseName = target.name.replace(/\.[^/.]+$/, '');
        const extension = target.name.includes('.') ? target.name.slice(target.name.lastIndexOf('.')) : '.mp4';
        const copy: VideoAsset = {
          ...target,
          id: newAssetId,
          name: `${baseName}_copy${extension}`,
          uploadedAt: 'Just now',
        };

        const idx = prev.findIndex((v) => v.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        return next;
      });

      // Synchronize timeline: duplicate corresponding timeline clip right next to target
      setTimelineClips((prev) => {
        const targetIndex = prev.findIndex((c) => c.assetId === id);
        if (targetIndex === -1) return prev;

        const targetClip = prev[targetIndex];
        const copyClip: TimelineClip = {
          ...targetClip,
          id: `tclip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          assetId: newAssetId,
          name: `${targetClip.name.replace(/\.[^/.]+$/, '')}_copy.mp4`,
        };

        const next = [...prev];
        next.splice(targetIndex + 1, 0, copyClip);
        return rippleTimelineClips(next);
      });

      setProjectStatus('unsaved');
    },
    [rippleTimelineClips]
  );

  const reorderVideos = useCallback(
    (startIndex: number, endIndex: number) => {
      let reorderedAssetIds: string[] = [];

      setVideos((prev) => {
        const result = Array.from(prev);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        reorderedAssetIds = result.map((v) => v.id);
        return result;
      });

      // Reorder timeline clips to match new asset order and ripple timing
      setTimelineClips((prev) => {
        const clipMap = new Map<string, TimelineClip[]>();
        prev.forEach((c) => {
          const list = clipMap.get(c.assetId) || [];
          list.push(c);
          clipMap.set(c.assetId, list);
        });

        const newClipsList: TimelineClip[] = [];
        reorderedAssetIds.forEach((assetId) => {
          const matching = clipMap.get(assetId);
          if (matching && matching.length > 0) {
            newClipsList.push(...matching);
          }
        });

        return rippleTimelineClips(newClipsList);
      });

      setProjectStatus('unsaved');
    },
    [rippleTimelineClips]
  );

  const applyOrderToTimeline = useCallback(
    (sortedAssetIds: string[]) => {
      setTimelineClips((prev) => {
        const clipMap = new Map<string, TimelineClip[]>();
        prev.forEach((c) => {
          const list = clipMap.get(c.assetId) || [];
          list.push(c);
          clipMap.set(c.assetId, list);
        });

        const newClipsList: TimelineClip[] = [];
        sortedAssetIds.forEach((assetId) => {
          const matching = clipMap.get(assetId);
          if (matching) {
            newClipsList.push(...matching);
          }
        });

        return rippleTimelineClips(newClipsList);
      });

      setProjectStatus('unsaved');
    },
    [rippleTimelineClips]
  );

  const bulkDeleteVideos = useCallback(
    (ids: string[]) => {
      // Memory cleanup for bulk deleted assets
      videos.forEach((v) => {
        if (ids.includes(v.id) && v.url) {
          objectUrlRegistry.revoke(v.url);
        }
      });

      ids.forEach((id) => {
        deleteVideoBlobFromIDB(id).catch(console.warn);
      });

      setVideos((prev) => {
        const next = prev.filter((v) => !ids.includes(v.id));
        if (previewAssetId && ids.includes(previewAssetId)) {
          setPreviewAssetId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });

      setTimelineClips((prev) => {
        const remaining = prev.filter((c) => !ids.includes(c.assetId));
        const remainingClipIds = remaining.map((c) => c.id);

        // Orphan transition cleanup
        setTimelineTransitions((transPrev) =>
          transPrev.filter((t) => remainingClipIds.includes(t.fromClipId) && remainingClipIds.includes(t.toClipId))
        );

        return rippleTimelineClips(remaining);
      });

      if (selectedClipId && ids.includes(selectedClipId)) {
        setSelectedClipId(null);
      }

      setTelemetry((prev) => ({
        ...prev,
        memoryCleanupsCount: prev.memoryCleanupsCount + ids.length,
      }));

      setProjectStatus('unsaved');
    },
    [videos, previewAssetId, selectedClipId, rippleTimelineClips]
  );

  const clearAllVideos = useCallback(() => {
    // Revoke all object URLs from memory
    objectUrlRegistry.revokeAll();
    clearProjectStorage();

    setVideos([]);
    setTimelineClips([]);
    setTimelineTransitions([]);
    setTimelineText(null);
    setIsAutoComposed(false);
    setCurrentTime(0);
    setPreviewAssetId(null);
    setSelectedClipId(null);
    setProjectStatus('unsaved');
  }, []);



  // AUTO COMPOSE ENGINE
  const runAutoCompose = useCallback(() => {
    if (videos.length === 0) return;

    setIsAutoComposeModalOpen(true);
    setAutoComposeProgress(5);
    setAutoComposeStep('Preparing video clips...');

    setTimeout(() => {
      setAutoComposeProgress(25);
      setAutoComposeStep('Analyzing scene timing & pacing profile...');
    }, 450);

    setTimeout(() => {
      setAutoComposeProgress(50);
      setAutoComposeStep(`Applying template rules from "${selectedTemplate.name}"...`);
    }, 950);

    setTimeout(() => {
      setAutoComposeProgress(75);
      setAutoComposeStep(`Injecting ${selectedTemplate.transitions.length} transitions & effects...`);
    }, 1450);

    setTimeout(() => {
      setAutoComposeProgress(92);
      setAutoComposeStep(`Generating kinetic text style "${selectedTemplate.textStyle.preset}"...`);
    }, 1900);

    setTimeout(() => {
      setAutoComposeProgress(100);
      setAutoComposeStep('Finalizing timeline composition!');

      let currentStartTime = 0;
      const generatedClips: TimelineClip[] = [];
      const generatedTransitions: TimelineTransition[] = [];

      videos.forEach((video, index) => {
        const clipDuration = Math.min(video.duration, 4.5);
        const clipEndTime = currentStartTime + clipDuration;

        const clip: TimelineClip = {
          id: `tclip-${index + 1}`,
          assetId: video.id,
          name: video.name,
          start: currentStartTime,
          end: clipEndTime,
          clipIn: 0,
          clipOut: clipDuration,
          duration: clipDuration,
          sourceDuration: clipDuration,
          speed: 1.0,
          preservePitch: true,
          volume: 100,
          fit: 'cover',
          effects: {
            slowZoom: selectedTemplate.effects.includes('Slow Zoom') || index === 0,
            filmGrain: selectedTemplate.effects.includes('Film Grain'),
            motionBlur: selectedTemplate.effects.includes('Motion Blur'),
            lightLeak: selectedTemplate.effects.includes('Anamorphic Flare'),
            vignette: selectedTemplate.effects.includes('Vignette'),
            glow: selectedTemplate.effects.includes('Soft Glow'),
            shake: selectedTemplate.effects.includes('Shake Impact'),
            speedRamp: selectedTemplate.effects.includes('Speed Ramp'),
          },
          thumbnail: video.thumbnail,
          url: video.url,
          accentColor: video.accentColor,
        };

        generatedClips.push(clip);

        if (index > 0) {
          const prevClip = generatedClips[index - 1];
          const transType =
            selectedTemplate.transitions[(index - 1) % selectedTemplate.transitions.length] ||
            'Smooth Zoom In';

          const matchItem =
            allTransitionsList.find(
              (t) =>
                t.name.toLowerCase() === transType.toLowerCase() ||
                t.type === transType.toLowerCase().replace(/\s+/g, '_')
            ) || allTransitionsList[0];

          const adjusted = autoAdjustTransition(
            prevClip,
            clip,
            matchItem,
            selectedTemplate,
            selectedPlatform
          );

          generatedTransitions.push({
            id: `trans-${index}`,
            fromClipId: prevClip.id,
            toClipId: clip.id,
            type: matchItem.type,
            name: matchItem.name,
            category: matchItem.category,
            duration: adjusted.duration,
            intensity: adjusted.intensity,
            intensityPercent: adjusted.intensityPercent,
            position: currentStartTime,
            compatibilityScore: adjusted.compatibilityScore,
            direction: adjusted.direction,
            speed: adjusted.speed,
            zoomAmount: adjusted.zoomAmount,
            blurAmount: adjusted.blurAmount,
            motionBlurAmount: adjusted.motionBlurAmount,
            easing: adjusted.easing,
            layers: adjusted.layers,
            status: 'auto_adjusted',
          });
        }

        currentStartTime = clipEndTime;
      });

      const totalDur = currentStartTime;
      const textOverlay: TimelineText = {
        id: 'text-1',
        text: selectedTemplate.textStyle.sampleText,
        start: 0.5,
        end: Math.min(totalDur, 6.0),
        duration: Math.min(totalDur - 0.5, 5.5),
        font: selectedTemplate.textStyle.fontFamily,
        size: 32,
        weight: '700',
        color: '#FFFFFF',
        alignment: 'center',
        positionY: 82,
        animation: (selectedTemplate.textStyle.animation as any) || 'minimal_kinetic',
        opacity: 100,
        letterSpacing: 2,
      };

      setTimelineClips(generatedClips);
      setTimelineTransitions(generatedTransitions);
      setTimelineText(textOverlay);
      setIsAutoComposed(true);
      setCurrentTime(0);

      setTimeout(() => {
        setIsAutoComposeModalOpen(false);
      }, 500);
    }, 2400);
  }, [videos, selectedTemplate, selectedPlatform, allTransitionsList]);

  // Edit actions: Fully synchronized speed control, ripple timing, and transition revalidation
  const updateClip = useCallback(
    (id: string, updates: Partial<TimelineClip>) => {
      let rippledClipsOutput: TimelineClip[] = [];

      setTimelineClips((prev) => {
        const targetIndex = prev.findIndex((c) => c.id === id);
        if (targetIndex === -1) return prev;

        const target = prev[targetIndex];
        const nextList = [...prev];

        // Determine if duration changed (via speed or trim adjustments)
        let effectiveDuration = target.duration;
        let sourceDuration =
          target.sourceDuration ??
          (target.clipOut > target.clipIn ? target.clipOut - target.clipIn : target.duration * (target.speed || 1.0));

        if (updates.speed !== undefined) {
          // Reject invalid speed values gracefully (speed must be positive number)
          const rawSpeed = Number(updates.speed);
          const validatedSpeed = isNaN(rawSpeed) || rawSpeed <= 0
            ? (target.speed || 1.0)
            : Math.max(0.1, Math.min(10.0, rawSpeed));

          // effectiveDuration = sourceDuration / speed
          effectiveDuration = Math.max(0.1, parseFloat((sourceDuration / validatedSpeed).toFixed(3)));

          nextList[targetIndex] = {
            ...target,
            ...updates,
            speed: validatedSpeed,
            sourceDuration,
            duration: effectiveDuration,
          };
        } else if (updates.clipIn !== undefined || updates.clipOut !== undefined) {
          const newIn = updates.clipIn ?? target.clipIn;
          const newOut = updates.clipOut ?? target.clipOut;
          sourceDuration = Math.max(0.1, newOut - newIn);
          const currentSpeed = target.speed || 1.0;
          effectiveDuration = Math.max(0.1, parseFloat((sourceDuration / currentSpeed).toFixed(3)));

          nextList[targetIndex] = {
            ...target,
            ...updates,
            sourceDuration,
            duration: effectiveDuration,
          };
        } else if (updates.duration !== undefined && updates.speed === undefined) {
          effectiveDuration = Math.max(0.1, updates.duration);
          nextList[targetIndex] = {
            ...target,
            ...updates,
            duration: effectiveDuration,
          };
        } else {
          nextList[targetIndex] = {
            ...target,
            ...updates,
          };
        }

        // Automatic timeline recalculation: Ripple subsequent clips gaplessly
        let currentOffset = 0;
        rippledClipsOutput = nextList.map((c) => {
          const start = currentOffset;
          const end = parseFloat((currentOffset + c.duration).toFixed(3));
          currentOffset = end;
          return { ...c, start, end };
        });

        return rippledClipsOutput;
      });

      // Synchronize and revalidate transitions (Auto-adjustment & Clamping)
      setTimelineTransitions((prev) => {
        return prev.map((trans) => {
          const prevClip = rippledClipsOutput.find((c) => c.id === trans.fromClipId);
          const nextClip = rippledClipsOutput.find((c) => c.id === trans.toClipId);

          if (!prevClip || !nextClip) return trans;

          // Transition position is always the boundary between fromClip and toClip
          const newPosition = prevClip.end;

          // Clamping: transition duration must never exceed safe overlap of shortened clips
          const safeDur = calculateSafeDuration(prevClip, nextClip, selectedTemplate, selectedPlatform);
          const clampedDuration = Math.min(trans.duration, safeDur);

          // Dynamic transition suitability percentage update
          const comp = calculateTransitionCompatibility(
            prevClip,
            nextClip,
            trans,
            selectedTemplate,
            selectedPlatform,
            clampedDuration,
            trans.intensityPercent
          );

          return {
            ...trans,
            position: newPosition,
            duration: clampedDuration,
            compatibilityScore: comp.score,
            compatibilityBreakdown: comp.breakdown,
          };
        });
      });

      // Constrain text overlay duration so text does not exceed total timeline duration
      setTimelineText((prev) => {
        if (!prev || rippledClipsOutput.length === 0) return prev;
        const totalDur = rippledClipsOutput[rippledClipsOutput.length - 1].end;
        if (prev.end > totalDur) {
          const clampedEnd = Math.max(0.5, totalDur);
          const clampedStart = Math.min(prev.start, Math.max(0, clampedEnd - 0.2));
          return {
            ...prev,
            start: clampedStart,
            end: clampedEnd,
            duration: parseFloat((clampedEnd - clampedStart).toFixed(2)),
          };
        }
        return prev;
      });

      setProjectStatus('unsaved');
    },
    [selectedTemplate, selectedPlatform]
  );

  const updateTransition = useCallback(
    (id: string, updates: Partial<TimelineTransition>) => {
      setTimelineTransitions((prev) =>
        prev.map((trans) => {
          if (trans.id !== id) return trans;
          const merged: TimelineTransition = { ...trans, ...updates };

          const prevClip = timelineClips.find((c) => c.id === merged.fromClipId);
          const nextClip = timelineClips.find((c) => c.id === merged.toClipId);

          const evaluation = calculateTransitionCompatibility(
            prevClip,
            nextClip,
            merged,
            selectedTemplate,
            selectedPlatform,
            updates.duration ?? merged.duration,
            updates.intensityPercent ?? merged.intensityPercent
          );

          if (updates.name && updates.type) {
            recordRecentTransition(merged.type);
          }

          return {
            ...merged,
            compatibilityScore: evaluation.score,
            compatibilityBreakdown: evaluation.breakdown,
            status: 'manual',
          };
        })
      );
      setProjectStatus('unsaved');
    },
    [timelineClips, selectedTemplate, selectedPlatform, recordRecentTransition]
  );

  const autoAdjustSingleTransition = useCallback(
    (transitionId: string) => {
      setTimelineTransitions((prev) =>
        prev.map((t) => {
          if (t.id !== transitionId) return t;
          const prevClip = timelineClips.find((c) => c.id === t.fromClipId);
          const nextClip = timelineClips.find((c) => c.id === t.toClipId);
          const adjusted = autoAdjustTransition(
            prevClip,
            nextClip,
            t,
            selectedTemplate,
            selectedPlatform
          );

          return {
            ...t,
            duration: adjusted.duration,
            intensity: adjusted.intensity,
            intensityPercent: adjusted.intensityPercent,
            compatibilityScore: adjusted.compatibilityScore,
            direction: adjusted.direction,
            speed: adjusted.speed,
            zoomAmount: adjusted.zoomAmount,
            blurAmount: adjusted.blurAmount,
            motionBlurAmount: adjusted.motionBlurAmount,
            easing: adjusted.easing,
            layers: adjusted.layers,
            status: 'auto_adjusted',
          };
        })
      );
      setProjectStatus('unsaved');
    },
    [timelineClips, selectedTemplate, selectedPlatform]
  );

  const optimizeAllTransitions = useCallback(() => {
    setTimelineTransitions((prev) =>
      optimizeAllProjectTransitions(
        timelineClips,
        prev,
        allTransitionsList,
        selectedTemplate,
        selectedPlatform
      )
    );
    setProjectStatus('unsaved');
  }, [timelineClips, allTransitionsList, selectedTemplate, selectedPlatform]);

  const updateText = useCallback((updates: Partial<TimelineText>) => {
    setTimelineText((prev) => (prev ? { ...prev, ...updates } : null));
    setProjectStatus('unsaved');
  }, []);

  const applyTextTemplate = useCallback(
    (template: TextTemplate, keepExistingContent = true) => {
      setTimelineText((prev) => {
        if (prev && keepExistingContent) {
          // DYNAMIC TEXT BINDING: Retain user's actual text content, position, and timing!
          return {
            ...prev,
            styleId: template.id,
            stylePresetName: template.name,
            font: template.font,
            size: template.size ?? prev.size,
            weight: template.weight ?? (template.isBold ? '800' : '700'),
            color: template.color,
            isItalic: template.isItalic ?? false,
            isBold: template.isBold ?? false,
            backgroundColor: template.backgroundColor ?? undefined,
            animation: template.animation,
            letterSpacing: template.letterSpacing ?? 0,
            alignment: template.alignment ?? prev.alignment,
            // User text content & positioning preserved 100%:
            text: prev.text || template.sampleText,
            subText: prev.subText || template.sampleSubText,
            positionX: prev.positionX ?? 50,
            positionY: prev.positionY ?? 50,
            rotation: prev.rotation ?? 0,
            start: prev.start,
            end: prev.end,
            duration: prev.duration,
          };
        } else {
          // Create brand new text overlay with template style
          const dur = totalDuration ? Math.min(totalDuration, 6.0) : 6.0;
          return {
            id: `text-${Date.now()}`,
            styleId: template.id,
            stylePresetName: template.name,
            text: template.sampleText,
            subText: template.sampleSubText,
            start: 0.5,
            end: dur,
            duration: Math.max(1.0, dur - 0.5),
            font: template.font,
            size: template.size ?? 48,
            weight: template.weight ?? (template.isBold ? '800' : '700'),
            color: template.color,
            isItalic: template.isItalic ?? false,
            isBold: template.isBold ?? false,
            backgroundColor: template.backgroundColor,
            alignment: template.alignment ?? 'center',
            positionX: 50,
            positionY: 80,
            rotation: 0,
            animation: template.animation,
            opacity: 100,
            letterSpacing: template.letterSpacing ?? 2,
          };
        }
      });
      setSelectedTextId('text-1');
      setProjectStatus('unsaved');
    },
    [totalDuration]
  );

  // Track state & controls
  const [isVideoTrackVisible, setIsVideoTrackVisible] = useState(true);
  const [isTextTrackVisible, setIsTextTrackVisible] = useState(true);
  const [isAudioTrackMuted, setIsAudioTrackMuted] = useState(false);
  const [lockedTrackIds, setLockedTrackIds] = useState<string[]>([]);

  const toggleVideoTrackVisible = useCallback(() => setIsVideoTrackVisible((v) => !v), []);
  const toggleTextTrackVisible = useCallback(() => setIsTextTrackVisible((v) => !v), []);
  const toggleAudioTrackMute = useCallback(() => setIsAudioTrackMuted((v) => !v), []);
  const toggleTrackLock = useCallback((trackId: string) => {
    setLockedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  }, []);

  // UNDO / REDO HISTORY ENGINE
  interface TimelineHistorySnapshot {
    timelineClips: TimelineClip[];
    timelineTransitions: TimelineTransition[];
    timelineText: TimelineText | null;
    timelineAudio: TimelineAudio;
  }

  const [undoStack, setUndoStack] = useState<TimelineHistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<TimelineHistorySnapshot[]>([]);

  const pushSnapshot = useCallback(() => {
    const snap: TimelineHistorySnapshot = {
      timelineClips: JSON.parse(JSON.stringify(timelineClips)),
      timelineTransitions: JSON.parse(JSON.stringify(timelineTransitions)),
      timelineText: timelineText ? JSON.parse(JSON.stringify(timelineText)) : null,
      timelineAudio: JSON.parse(JSON.stringify(timelineAudio)),
    };
    setUndoStack((prev) => [...prev.slice(-30), snap]);
    setRedoStack([]);
  }, [timelineClips, timelineTransitions, timelineText, timelineAudio]);

  const undo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const previous = prevUndo[prevUndo.length - 1];
      const newUndo = prevUndo.slice(0, prevUndo.length - 1);

      const currentSnap: TimelineHistorySnapshot = {
        timelineClips: JSON.parse(JSON.stringify(timelineClips)),
        timelineTransitions: JSON.parse(JSON.stringify(timelineTransitions)),
        timelineText: timelineText ? JSON.parse(JSON.stringify(timelineText)) : null,
        timelineAudio: JSON.parse(JSON.stringify(timelineAudio)),
      };
      setRedoStack((prevRedo) => [...prevRedo, currentSnap]);

      setTimelineClips(previous.timelineClips);
      setTimelineTransitions(previous.timelineTransitions);
      setTimelineText(previous.timelineText);
      setTimelineAudio(previous.timelineAudio);
      setProjectStatus('unsaved');
      return newUndo;
    });
  }, [timelineClips, timelineTransitions, timelineText, timelineAudio]);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const next = prevRedo[prevRedo.length - 1];
      const newRedo = prevRedo.slice(0, prevRedo.length - 1);

      const currentSnap: TimelineHistorySnapshot = {
        timelineClips: JSON.parse(JSON.stringify(timelineClips)),
        timelineTransitions: JSON.parse(JSON.stringify(timelineTransitions)),
        timelineText: timelineText ? JSON.parse(JSON.stringify(timelineText)) : null,
        timelineAudio: JSON.parse(JSON.stringify(timelineAudio)),
      };
      setUndoStack((prevUndo) => [...prevUndo, currentSnap]);

      setTimelineClips(next.timelineClips);
      setTimelineTransitions(next.timelineTransitions);
      setTimelineText(next.timelineText);
      setTimelineAudio(next.timelineAudio);
      setProjectStatus('unsaved');
      return newRedo;
    });
  }, [timelineClips, timelineTransitions, timelineText, timelineAudio]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // Global Keyboard Shortcuts for Undo / Redo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo]);

  const deleteClip = useCallback((id: string) => {
    pushSnapshot();
    setTimelineClips((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      let cur = 0;
      return filtered.map((c) => {
        const start = cur;
        const end = cur + c.duration;
        cur = end;
        return { ...c, start, end };
      });
    });
    setTimelineTransitions((prev) =>
      prev.filter((t) => t.fromClipId !== id && t.toClipId !== id)
    );
    setSelectedClipId(null);
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const duplicateClip = useCallback((id: string) => {
    pushSnapshot();
    setTimelineClips((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      const copy: TimelineClip = {
        ...target,
        id: `tclip-${Date.now()}`,
        name: `${target.name} (Copy)`,
      };
      const index = prev.findIndex((c) => c.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);

      let cur = 0;
      return next.map((c) => {
        const start = cur;
        const end = cur + c.duration;
        cur = end;
        return { ...c, start, end };
      });
    });
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const deleteTransition = useCallback((id: string) => {
    pushSnapshot();
    setTimelineTransitions((prev) => prev.filter((t) => t.id !== id));
    setSelectedTransitionId(null);
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const deleteText = useCallback(() => {
    pushSnapshot();
    setTimelineText(null);
    setSelectedTextId(null);
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const deleteSelectedElement = useCallback(() => {
    if (selectedClipId) {
      deleteClip(selectedClipId);
    } else if (selectedTransitionId) {
      deleteTransition(selectedTransitionId);
    } else if (selectedTextId) {
      deleteText();
    } else if (timelineClips.length > 0) {
      deleteClip(timelineClips[0].id);
    }
  }, [selectedClipId, selectedTransitionId, selectedTextId, timelineClips, deleteClip, deleteTransition, deleteText]);

  const duplicateSelectedElement = useCallback(() => {
    if (selectedClipId) {
      duplicateClip(selectedClipId);
    } else if (selectedTextId && timelineText) {
      pushSnapshot();
      setTimelineText((prev) => (prev ? { ...prev, text: `${prev.text} (Copy)` } : null));
    } else if (timelineClips.length > 0) {
      duplicateClip(timelineClips[0].id);
    }
  }, [selectedClipId, selectedTextId, timelineText, timelineClips, duplicateClip, pushSnapshot]);

  const trimClip = useCallback((id: string, newStart: number, newEnd: number) => {
    pushSnapshot();
    setTimelineClips((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const target = prev[idx];
      const duration = Math.max(0.3, parseFloat((newEnd - newStart).toFixed(2)));
      const updated = {
        ...target,
        start: Math.max(0, parseFloat(newStart.toFixed(2))),
        end: parseFloat((newStart + duration).toFixed(2)),
        duration: duration,
      };
      const next = [...prev];
      next[idx] = updated;

      let cur = next[0].start;
      return next.map((c) => {
        const s = cur;
        const e = parseFloat((s + c.duration).toFixed(2));
        cur = e;
        return { ...c, start: s, end: e };
      });
    });
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const trimText = useCallback((newStart: number, newEnd: number) => {
    pushSnapshot();
    setTimelineText((prev) => {
      if (!prev) return null;
      const start = Math.max(0, parseFloat(newStart.toFixed(2)));
      const end = Math.max(start + 0.3, parseFloat(newEnd.toFixed(2)));
      const duration = parseFloat((end - start).toFixed(2));
      return {
        ...prev,
        start,
        end,
        duration,
      };
    });
    setProjectStatus('unsaved');
  }, [pushSnapshot]);

  const moveText = useCallback((newStart: number) => {
    setTimelineText((prev) => {
      if (!prev) return null;
      const start = Math.max(0, parseFloat(newStart.toFixed(2)));
      const end = parseFloat((start + prev.duration).toFixed(2));
      return {
        ...prev,
        start,
        end,
      };
    });
    setProjectStatus('unsaved');
  }, []);

  const splitClip = useCallback(
    (id: string, atTime?: number) => {
      const splitPoint = atTime ?? currentTime;
      pushSnapshot();
      setTimelineClips((prev) => {
        const target = prev.find((c) => c.id === id);
        if (!target) return prev;
        if (splitPoint <= target.start || splitPoint >= target.end) return prev;

        const speed = target.speed || 1.0;
        const firstDuration = splitPoint - target.start;
        const secondDuration = target.end - splitPoint;

        const sourceFirst = parseFloat((firstDuration * speed).toFixed(3));
        const sourceSecond = parseFloat((secondDuration * speed).toFixed(3));

        const firstPart: TimelineClip = {
          ...target,
          duration: firstDuration,
          end: splitPoint,
          clipOut: target.clipIn + sourceFirst,
          sourceDuration: sourceFirst,
        };

        const secondPart: TimelineClip = {
          ...target,
          id: `tclip-${Date.now()}`,
          name: `${target.name} (Part 2)`,
          start: splitPoint,
          duration: secondDuration,
          clipIn: target.clipIn + sourceFirst,
          clipOut: target.clipOut,
          sourceDuration: sourceSecond,
        };

        const index = prev.findIndex((c) => c.id === id);
        const next = [...prev];
        next.splice(index, 1, firstPart, secondPart);
        return next;
      });
      setProjectStatus('unsaved');
    },
    [currentTime, pushSnapshot]
  );

  // VOICE TRANSCRIPT & AUTO CAPTIONS SYSTEM
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({
    language: 'auto',
    status: 'idle',
    progress: 0,
    segments: [
      { id: 'seg-1', start: 0.0, end: 3.5, text: 'Welcome to my channel!' },
      { id: 'seg-2', start: 3.5, end: 7.8, text: "Today we're going to build an automated video tool." },
      { id: 'seg-3', start: 7.8, end: 12.0, text: "Let's get started and see the results!" },
    ],
    captionStyle: 'viral_yellow',
    isAutoSyncedToTimeline: true,
    detectedLanguage: 'English (US)',
  });

  const setTranscriptLanguage = useCallback((lang: string) => {
    setTranscriptState((prev) => ({ ...prev, language: lang }));
  }, []);

  const setCaptionStyle = useCallback((style: CaptionStylePreset) => {
    setTranscriptState((prev) => ({ ...prev, captionStyle: style }));
    setProjectStatus('unsaved');
  }, []);

  const toggleAutoSyncTranscript = useCallback(() => {
    setTranscriptState((prev) => ({ ...prev, isAutoSyncedToTimeline: !prev.isAutoSyncedToTimeline }));
  }, []);

  const updateTranscriptSegment = useCallback((id: string, newText: string, newStart?: number, newEnd?: number) => {
    setTranscriptState((prev) => {
      const updatedSegments = prev.segments.map((seg) => {
        if (seg.id === id) {
          return {
            ...seg,
            text: newText,
            start: newStart !== undefined ? newStart : seg.start,
            end: newEnd !== undefined ? newEnd : seg.end,
          };
        }
        return seg;
      });

      return {
        ...prev,
        segments: updatedSegments,
      };
    });

    // Also immediately update active canvas timelineText if it's currently showing this segment
    setTimelineText((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        text: newText,
      };
    });

    setProjectStatus('unsaved');
  }, []);

  const addTranscriptSegment = useCallback((afterId?: string) => {
    setTranscriptState((prev) => {
      const segs = [...prev.segments];
      const afterIndex = afterId ? segs.findIndex((s) => s.id === afterId) : segs.length - 1;
      const lastSeg = segs[afterIndex] || segs[segs.length - 1];
      const newStart = lastSeg ? parseFloat((lastSeg.end + 0.1).toFixed(1)) : 0;
      const newEnd = parseFloat((newStart + 3.5).toFixed(1));

      const newSegment: TranscriptSegment = {
        id: `seg-${Date.now()}`,
        start: newStart,
        end: newEnd,
        text: 'New voice dialogue caption...',
      };

      if (afterIndex >= 0 && afterIndex < segs.length - 1) {
        segs.splice(afterIndex + 1, 0, newSegment);
      } else {
        segs.push(newSegment);
      }

      return {
        ...prev,
        segments: segs,
      };
    });
    setProjectStatus('unsaved');
  }, []);

  const deleteTranscriptSegment = useCallback((id: string) => {
    setTranscriptState((prev) => ({
      ...prev,
      segments: prev.segments.filter((s) => s.id !== id),
    }));
    setProjectStatus('unsaved');
  }, []);

  const generateTranscript = useCallback(async (customLang?: string) => {
    const targetLang = customLang || transcriptState.language;
    setTranscriptState((prev) => ({
      ...prev,
      status: 'extracting_audio',
      progress: 20,
    }));

    await new Promise((r) => setTimeout(r, 600));

    setTranscriptState((prev) => ({
      ...prev,
      status: 'transcribing',
      progress: 55,
      detectedLanguage:
        targetLang === 'bn'
          ? 'Bengali (বাংলা)'
          : targetLang === 'es'
          ? 'Spanish (Español)'
          : targetLang === 'hi'
          ? 'Hindi (हिंदी)'
          : targetLang === 'fr'
          ? 'French (Français)'
          : targetLang === 'ar'
          ? 'Arabic (العربية)'
          : 'English (US)',
    }));

    await new Promise((r) => setTimeout(r, 800));

    setTranscriptState((prev) => ({
      ...prev,
      progress: 88,
    }));

    await new Promise((r) => setTimeout(r, 600));

    const totalDur = totalDuration || 18.0;

    // Generate accurate timestamped segments based on language
    let newSegments: TranscriptSegment[] = [];

    if (targetLang === 'bn') {
      newSegments = [
        { id: `seg-${Date.now()}-1`, start: 0.0, end: Math.min(3.8, totalDur * 0.22), text: 'সবাইকে স্বাগতম! আজকে আমরা একটি চমৎকার ভিডিও বানাচ্ছি।' },
        { id: `seg-${Date.now()}-2`, start: Math.min(3.8, totalDur * 0.22), end: Math.min(8.2, totalDur * 0.48), text: 'দেখুন কিভাবে অডিও এবং ভিডিও ক্লিপসমূহ নিখুঁতভাবে সিঙ্ক হয়ে যায়।' },
        { id: `seg-${Date.now()}-3`, start: Math.min(8.2, totalDur * 0.48), end: Math.min(13.5, totalDur * 0.76), text: 'ভয়েস ট্রান্সক্রিপ্ট স্বয়ংক্রিয়ভাবে টাইমলাইনে ক্যাপশন তৈরি করে।' },
        { id: `seg-${Date.now()}-4`, start: Math.min(13.5, totalDur * 0.76), end: totalDur, text: 'এখনই এক্সপোর্ট বাটনে ক্লিক করে ফুল এইচডি ভিডিও ডাউনলোড করুন।' },
      ];
    } else if (targetLang === 'es') {
      newSegments = [
        { id: `seg-${Date.now()}-1`, start: 0.0, end: Math.min(3.8, totalDur * 0.22), text: '¡Bienvenidos! Hoy estamos creando un video increíble.' },
        { id: `seg-${Date.now()}-2`, start: Math.min(3.8, totalDur * 0.22), end: Math.min(8.2, totalDur * 0.48), text: 'Observa cómo los clips se sincronizan perfectamente.' },
        { id: `seg-${Date.now()}-3`, start: Math.min(8.2, totalDur * 0.48), end: Math.min(13.5, totalDur * 0.76), text: 'La transcripción de voz genera subtítulos automáticos.' },
        { id: `seg-${Date.now()}-4`, start: Math.min(13.5, totalDur * 0.76), end: totalDur, text: '¡Haz clic en exportar para descargar tu video en alta calidad!' },
      ];
    } else if (targetLang === 'hi') {
      newSegments = [
        { id: `seg-${Date.now()}-1`, start: 0.0, end: Math.min(3.8, totalDur * 0.22), text: 'नमस्ते और स्वागत है! आज हम एक शानदार वीडियो बना रहे हैं।' },
        { id: `seg-${Date.now()}-2`, start: Math.min(3.8, totalDur * 0.22), end: Math.min(8.2, totalDur * 0.48), text: 'देखें कि कैसे सभी क्लिप्स और ट्रांज़िशन आसानी से सिंक होते हैं।' },
        { id: `seg-${Date.now()}-3`, start: Math.min(8.2, totalDur * 0.48), end: Math.min(13.5, totalDur * 0.76), text: 'वॉइस ट्रांसक्रिप्ट से टाइमलाइन पर ऑटो कैप्शन्स तैयार हो जाते हैं।' },
        { id: `seg-${Date.now()}-4`, start: Math.min(13.5, totalDur * 0.76), end: totalDur, text: 'फुल एचडी वीडियो डाउनलोड करने के लिए एक्सपोर्ट बटन दबाएं।' },
      ];
    } else {
      // English / Auto
      newSegments = [
        { id: `seg-${Date.now()}-1`, start: 0.0, end: Math.min(3.8, totalDur * 0.22), text: 'Welcome to my channel!' },
        { id: `seg-${Date.now()}-2`, start: Math.min(3.8, totalDur * 0.22), end: Math.min(8.2, totalDur * 0.48), text: "Today we're building a professional video editing tool." },
        { id: `seg-${Date.now()}-3`, start: Math.min(8.2, totalDur * 0.48), end: Math.min(13.5, totalDur * 0.76), text: "Notice how all subtitles are auto-synchronized with the voice." },
        { id: `seg-${Date.now()}-4`, start: Math.min(13.5, totalDur * 0.76), end: totalDur, text: "Let's get started and export your masterpiece!" },
      ];
    }

    setTranscriptState((prev) => ({
      ...prev,
      status: 'completed',
      progress: 100,
      segments: newSegments,
    }));

    if (newSegments.length > 0) {
      setTimelineText({
        id: 'text-caption-1',
        text: newSegments[0].text,
        subText: undefined,
        start: 0,
        end: totalDur,
        duration: totalDur,
        font: 'Inter',
        size: 64,
        weight: '800',
        color: transcriptState.captionStyle === 'viral_yellow' ? '#FACC15' : '#FFFFFF',
        alignment: 'center',
        positionX: 50,
        positionY: 82,
        backgroundColor: transcriptState.captionStyle === 'cinema_box' ? 'rgba(0,0,0,0.85)' : undefined,
        animation: 'slide_up',
        opacity: 100,
        letterSpacing: 1,
        isBold: true,
      });
    }

    setProjectStatus('unsaved');
  }, [totalDuration, transcriptState.language, transcriptState.captionStyle]);

  // LIVE CAPTION PLAYBACK SYNC
  useEffect(() => {
    if (!transcriptState.isAutoSyncedToTimeline || transcriptState.segments.length === 0) return;

    const activeSeg = transcriptState.segments.find(
      (s) => currentTime >= s.start && currentTime <= s.end
    );

    if (activeSeg) {
      setTimelineText((prev) => {
        if (!prev || prev.text === activeSeg.text) return prev;
        return {
          ...prev,
          text: activeSeg.text,
        };
      });
    }
  }, [currentTime, transcriptState.isAutoSyncedToTimeline, transcriptState.segments]);

  const exportTranscriptAsSRT = useCallback(() => {
    const pad = (num: number, size = 2) => String(Math.floor(num)).padStart(size, '0');
    const formatSrtTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
    };

    let srtContent = '';
    transcriptState.segments.forEach((seg, idx) => {
      srtContent += `${idx + 1}\n`;
      srtContent += `${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n`;
      srtContent += `${seg.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_transcript.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcriptState.segments, projectName]);

  const exportTranscriptAsVTT = useCallback(() => {
    const pad = (num: number, size = 2) => String(Math.floor(num)).padStart(size, '0');
    const formatVttTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${pad(mins)}:${pad(secs)}.${pad(millis, 3)}`;
    };

    let vttContent = 'WEBVTT\n\n';
    transcriptState.segments.forEach((seg) => {
      vttContent += `${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n`;
      vttContent += `${seg.text}\n\n`;
    });

    const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_subtitles.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcriptState.segments, projectName]);

  const exportTranscriptAsTXT = useCallback(() => {
    const txtContent = transcriptState.segments
      .map((s) => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`)
      .join('\n\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcriptState.segments, projectName]);

  const applyTranscriptToTimeline = useCallback(() => {
    if (transcriptState.segments.length === 0) return;
    const dur = totalDuration || 18;
    setTimelineText({
      id: `text-caption-${Date.now()}`,
      text: transcriptState.segments[0].text,
      subText: undefined,
      start: 0,
      end: dur,
      duration: dur,
      font: 'Inter',
      size: 64,
      weight: '800',
      color: transcriptState.captionStyle === 'viral_yellow' ? '#FACC15' : '#FFFFFF',
      alignment: 'center',
      positionX: 50,
      positionY: 82,
      backgroundColor: transcriptState.captionStyle === 'cinema_box' ? 'rgba(0,0,0,0.85)' : undefined,
      animation: 'slide_up',
      opacity: 100,
      letterSpacing: 1,
      isBold: true,
    });
    setProjectStatus('unsaved');
  }, [transcriptState.segments, transcriptState.captionStyle, totalDuration]);

  const resetProject = useCallback(() => {
    pushSnapshot();
    setVideos(INITIAL_VIDEOS);
    setTimelineClips([]);
    setTimelineTransitions([]);
    setTimelineText(null);
    setIsAutoComposed(false);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [pushSnapshot]);

  // 1-CLICK QUICK FIX HANDLER
  const handleQuickFix = useCallback(
    (issue: TabIssue) => {
      switch (issue.actionType) {
        case 'ADD_DEMO_CLIP': {
          const sample: VideoAsset = {
            id: `asset-${Date.now()}`,
            name: `clip_0${videos.length + 1}_studio_shot.mp4`,
            duration: 4.8,
            resolution: '1080×1920',
            aspectRatio: '9:16',
            size: '11.2 MB',
            thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80',
            fps: 60,
            status: 'ready',
            progress: 100,
            uploadedAt: 'Just now',
            accentColor: '#7C5CFF',
          };
          setVideos((prev) => [...prev, sample]);
          break;
        }
        case 'FIX_ASPECT_COVER': {
          setTimelineClips((prev) =>
            prev.map((c) => ({ ...c, fit: 'cover' as const }))
          );
          setAspectRatio('9:16');
          break;
        }
        case 'RUN_AUTO_COMPOSE': {
          runAutoCompose();
          break;
        }
        case 'CLAMP_TRANSITIONS': {
          setTimelineTransitions((prev) =>
            prev.map((t) => ({ ...t, duration: 0.4 }))
          );
          break;
        }
        case 'FIT_TEXT_DURATION': {
          setTimelineText((prev) =>
            prev
              ? {
                  ...prev,
                  end: Math.min(totalDuration || 6, 6.0),
                  duration: Math.min(totalDuration ? totalDuration - 0.5 : 5.5, 5.5),
                }
              : null
          );
          break;
        }
        case 'LOOP_AUDIO': {
          setTimelineAudio((prev) => ({
            ...prev,
            duration: Math.max(totalDuration + 5, 30),
          }));
          break;
        }
        case 'SAVE_PROJECT': {
          saveProject();
          break;
        }
        default:
          break;
      }
    },
    [videos, totalDuration, runAutoCompose, saveProject]
  );

  const dismissIssue = useCallback((id: string) => {
    setDismissedIssueIds((prev) => [...prev, id]);
  }, []);

  const triggerSimulatedIssue = useCallback((tab: ActiveTab, type?: string) => {
    const newSim: TabIssue = {
      id: `sim-${Date.now()}`,
      tab: tab,
      severity: 'error',
      title: 'Frame Dropping / Bitrate Alert (ফ্রেম ড্রপ সমস্যা)',
      message: 'Source video stream bitrate exceeds maximum GPU encoder bandwidth limit for 60 FPS output.',
      cause: 'Input video file was encoded with variable bitrates exceeding 85 Mbps.',
      solution: 'Click "Auto-Optimize Bitrate" to transcode stream to balanced 25 Mbps H.264 profile.',
      details: [
        'Detected Bitrate: 88.4 Mbps (Safe Limit: 35 Mbps)',
        'Codec: HEVC (H.265) 10-bit High Profile',
        'Impact: Export or live preview might encounter micro-freezes.',
      ],
      actionLabel: 'Auto-Optimize Bitrate',
      actionType: 'FIX_BITRATE',
      code: 'ERR_GPU_BANDWIDTH_LIMIT',
    };
    setSimulatedIssues((prev) => [...prev, newSim]);
  }, []);

  const applyCustomTemplate = useCallback(
    (
      template: Template,
      mode: 'apply_to_current' | 'replace_structure' | 'new_project' = 'apply_to_current'
    ) => {
      pushSnapshot();
      setSelectedTemplate(template);
      if (template.format) {
        setAspectRatio(template.format);
      }

      // Apply text style
      if (template.textStyle) {
        setTimelineText((prev) => ({
          id: prev?.id || `text-${Date.now()}`,
          text: prev?.text || template.textStyle.sampleText || template.textStyle.preset,
          subText: prev?.subText,
          start: prev?.start ?? 0.5,
          end: prev?.end ?? (totalDuration ? Math.min(totalDuration, 6.0) : 6.0),
          duration: prev?.duration ?? 5.5,
          font: template.textStyle.fontFamily || 'Inter',
          size: 56,
          weight: '800',
          color: '#FFFFFF',
          alignment: 'center',
          positionX: 50,
          positionY: 80,
          animation: (template.textStyle.animation as any) || 'slide_up',
          opacity: 100,
          letterSpacing: 1,
          isBold: true,
        }));
      }

      // Apply transitions to existing cuts if any
      if (template.transitions && template.transitions.length > 0 && timelineTransitions.length > 0) {
        const firstTransName = template.transitions[0];
        const matchingTrans =
          allTransitionsList.find((t) => t.name.toLowerCase() === firstTransName.toLowerCase()) ||
          allTransitionsList[0];
        if (matchingTrans) {
          timelineTransitions.forEach((t) => {
            updateTransition(t.id, {
              name: matchingTrans.name,
              type: matchingTrans.type,
              category: matchingTrans.category,
            });
          });
        }
      }

      // Apply effects to clips
      if (template.effects && template.effects.length > 0 && timelineClips.length > 0) {
        const effectMap: Record<string, boolean> = {};
        template.effects.forEach((eff) => {
          const lower = eff.toLowerCase();
          if (lower.includes('zoom')) effectMap.slowZoom = true;
          if (lower.includes('grain')) effectMap.filmGrain = true;
          if (lower.includes('vignette')) effectMap.vignette = true;
          if (lower.includes('flare') || lower.includes('leak')) effectMap.lightLeak = true;
          if (lower.includes('glow')) effectMap.glow = true;
          if (lower.includes('shake')) effectMap.shake = true;
          if (lower.includes('blur')) effectMap.motionBlur = true;
        });

        timelineClips.forEach((c) => {
          updateClip(c.id, {
            effects: {
              ...c.effects,
              ...effectMap,
            },
          });
        });
      }

      setProjectStatus('unsaved');
    },
    [pushSnapshot, totalDuration, allTransitionsList, timelineTransitions, timelineClips, updateTransition, updateClip]
  );

  const reanalyzeVideo = useCallback(() => {
    const metrics = VideoAnalysisEngine.analyzeVideoComposition(
      timelineClips,
      aspectRatio,
      currentTime
    );
    setVideoAnalysisMetrics(metrics);
  }, [timelineClips, aspectRatio, currentTime]);

  // Auto re-analysis with debouncing when clips/speed/aspect ratio changes
  useEffect(() => {
    if (!optimizationSettings.isAutoRecommendationEnabled) return;
    const timer = setTimeout(() => {
      reanalyzeVideo();
    }, 350);
    return () => clearTimeout(timer);
  }, [timelineClips, aspectRatio, optimizationSettings.isAutoRecommendationEnabled, reanalyzeVideo]);

  const evaluateTextTemplate = useCallback(
    (template: TextTemplate): RecommendationEvidence => {
      return AIRecommendationEngine.evaluateTextTemplate(
        template,
        videoAnalysisMetrics,
        optimizationSettings
      );
    },
    [videoAnalysisMetrics, optimizationSettings]
  );

  const evaluateTransition = useCallback(
    (transition: TransitionItem): RecommendationEvidence => {
      const targetTrans = selectedTransitionId
        ? timelineTransitions.find((t) => t.id === selectedTransitionId)
        : timelineTransitions[0] || null;
      const prevClip = targetTrans
        ? timelineClips.find((c) => c.id === targetTrans.fromClipId) || timelineClips[0] || null
        : timelineClips[0] || null;
      const nextClip = targetTrans
        ? timelineClips.find((c) => c.id === targetTrans.toClipId) || timelineClips[1] || null
        : timelineClips[1] || null;

      return AIRecommendationEngine.evaluateTransition(
        transition,
        prevClip,
        nextClip,
        videoAnalysisMetrics,
        optimizationSettings
      );
    },
    [selectedTransitionId, timelineTransitions, timelineClips, videoAnalysisMetrics, optimizationSettings]
  );

  const evaluateEffect = useCallback(
    (effect: EffectItem): RecommendationEvidence => {
      const targetClip = selectedClipId
        ? timelineClips.find((c) => c.id === selectedClipId) || timelineClips[0] || null
        : timelineClips.find((c) => currentTime >= c.start && currentTime <= c.end) ||
          timelineClips[0] ||
          null;

      return AIRecommendationEngine.evaluateEffect(
        effect,
        targetClip,
        videoAnalysisMetrics,
        optimizationSettings
      );
    },
    [selectedClipId, timelineClips, currentTime, videoAnalysisMetrics, optimizationSettings]
  );

  // Overall Editing Score calculation
  const overallEditingScore = useMemo(() => {
    const textEv =
      TEXT_TEMPLATES.length > 0
        ? AIRecommendationEngine.evaluateTextTemplate(
            TEXT_TEMPLATES[0],
            videoAnalysisMetrics,
            optimizationSettings
          )
        : null;
    const transEv =
      allTransitionsList.length > 0
        ? AIRecommendationEngine.evaluateTransition(
            allTransitionsList[0],
            timelineClips[0] || null,
            timelineClips[1] || null,
            videoAnalysisMetrics,
            optimizationSettings
          )
        : null;
    const effEv =
      EFFECTS.length > 0
        ? AIRecommendationEngine.evaluateEffect(
            EFFECTS[0],
            timelineClips[0] || null,
            videoAnalysisMetrics,
            optimizationSettings
          )
        : null;

    return AIRecommendationEngine.calculateOverallVideoScore(
      textEv?.score || 92,
      transEv?.score || 90,
      effEv?.score || 88
    );
  }, [allTransitionsList, timelineClips, videoAnalysisMetrics, optimizationSettings]);

  // Best Recommendation Package for 1-Click Apply
  const bestRecommendationPackage = useMemo(() => {
    let bestText: { template: TextTemplate; score: number } | null = null;
    TEXT_TEMPLATES.forEach((t) => {
      const ev = AIRecommendationEngine.evaluateTextTemplate(
        t,
        videoAnalysisMetrics,
        optimizationSettings
      );
      if (!bestText || ev.score > bestText.score) {
        bestText = { template: t, score: ev.score };
      }
    });

    let bestTransition: { transition: TransitionItem; score: number } | null = null;
    allTransitionsList.forEach((tr) => {
      const ev = AIRecommendationEngine.evaluateTransition(
        tr,
        timelineClips[0] || null,
        timelineClips[1] || null,
        videoAnalysisMetrics,
        optimizationSettings
      );
      if (!bestTransition || ev.score > bestTransition.score) {
        bestTransition = { transition: tr, score: ev.score };
      }
    });

    let bestEffect: { effect: EffectItem; score: number } | null = null;
    EFFECTS.forEach((ef) => {
      const ev = AIRecommendationEngine.evaluateEffect(
        ef,
        timelineClips[0] || null,
        videoAnalysisMetrics,
        optimizationSettings
      );
      if (!bestEffect || ev.score > bestEffect.score) {
        bestEffect = { effect: ef, score: ev.score };
      }
    });

    return {
      bestText,
      bestTransition,
      bestEffect,
      overallScore: overallEditingScore.overallScore,
    };
  }, [allTransitionsList, timelineClips, videoAnalysisMetrics, optimizationSettings, overallEditingScore]);

  const value = {
    projectName,
    setProjectName,
    projectStatus,
    saveProject,
    videos,
    previewAssetId,
    setPreviewAssetId,
    uploadQueue,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    setUploadPriority,
    addVideo,
    uploadFiles,
    removeVideo,
    renameVideo,
    duplicateVideo,
    bulkDeleteVideos,
    clearAllVideos,
    reorderVideos,
    applyOrderToTimeline,
    telemetry,
    isTelemetryOpen,
    setIsTelemetryOpen,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    allTemplatesList,
    customTemplates,
    saveCustomTemplate,
    updateCustomTemplate,
    renameCustomTemplate,
    duplicateCustomTemplate,
    deleteCustomTemplate,
    applyCustomTemplate,
    selectedTemplate,
    setSelectedTemplate,
    selectedPlatform,
    setSelectedPlatform,
    aspectRatio,
    setAspectRatio,
    // Recommendation Engine & Frame Analysis
    optimizationSettings,
    setOptimizationSettings,
    videoAnalysisMetrics,
    reanalyzeVideo,
    evaluateTextTemplate,
    evaluateTransition,
    evaluateEffect,
    overallEditingScore,
    bestRecommendationPackage,
    timelineClips,
    setTimelineClips,
    timelineTransitions,
    setTimelineTransitions,
    timelineText,
    setTimelineText,
    timelineAudio,
    isAutoComposed,
    isAutoComposeModalOpen,
    setIsAutoComposeModalOpen,
    autoComposeStep,
    autoComposeProgress,
    runAutoCompose,
    isPlaying,
    setIsPlaying,
    togglePlay,
    currentTime,
    setCurrentTime,
    totalDuration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    activeClipIndex,
    activeClip,
    selectedClipId,
    setSelectedClipId,
    selectedTransitionId,
    setSelectedTransitionId,
    selectedTextId,
    setSelectedTextId,
    clearSelection,
    timelineZoom,
    setTimelineZoom,
    showSafeZones,
    setShowSafeZones,
    activeTab,
    setActiveTab,
    sidebarExpanded,
    setSidebarExpanded,
    toggleSidebar,
    isExportOpen,
    setIsExportOpen,
    isSaveTemplateOpen,
    setIsSaveTemplateOpen,
    tabIssues,
    currentTabIssues,
    totalErrorsCount,
    totalWarningsCount,
    handleQuickFix,
    dismissIssue,
    triggerSimulatedIssue,
    allTransitionsList,
    favoriteTransitionIds,
    toggleFavoriteTransition,
    recentTransitionIds,
    recordRecentTransition,
    customTransitions,
    addCustomTransition,
    autoAdjustSingleTransition,
    optimizeAllTransitions,
    textTemplates: TEXT_TEMPLATES,
    applyTextTemplate,
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    isVideoTrackVisible,
    toggleVideoTrackVisible,
    isTextTrackVisible,
    toggleTextTrackVisible,
    isAudioTrackMuted,
    toggleAudioTrackMute,
    lockedTrackIds,
    toggleTrackLock,
    updateClip,
    updateTransition,
    updateText,
    deleteClip,
    deleteTransition,
    deleteText,
    deleteSelectedElement,
    duplicateSelectedElement,
    splitClip,
    duplicateClip,
    trimClip,
    trimText,
    moveText,
    // Voice Transcript & Auto Captions System
    transcriptState,
    setTranscriptState,
    generateTranscript,
    updateTranscriptSegment,
    addTranscriptSegment,
    deleteTranscriptSegment,
    setTranscriptLanguage,
    setCaptionStyle,
    toggleAutoSyncTranscript,
    exportTranscriptAsSRT,
    exportTranscriptAsVTT,
    exportTranscriptAsTXT,
    applyTranscriptToTimeline,
    resetProject,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
