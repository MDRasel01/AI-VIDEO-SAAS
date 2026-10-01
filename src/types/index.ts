export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type PlatformId = 'universal' | 'tiktok' | 'reels' | 'shorts' | 'youtube' | 'facebook';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface TabIssue {
  id: string;
  tab: 'media' | 'templates' | 'transitions' | 'effects' | 'text' | 'transcript' | 'audio' | 'projects' | 'global' | 'create' | 'settings';
  severity: IssueSeverity;
  title: string;
  message: string;
  cause: string; // Keno hocce (Why it happened / Root Cause)
  solution: string; // Ki solve korte hobe (How to solve it / Resolution)
  details: string[]; // Detailed technical & practical troubleshooting breakdown
  actionLabel?: string; // 1-click Quick Fix button text
  actionType?: string; // Identifier for automatic solver handler
  timestamp?: string;
  code?: string;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  badge: string;
  format: AspectRatio;
  description: string;
  safeZone: {
    top: number; // percentage from top
    bottom: number; // percentage from bottom
    right: number; // percentage from right
    left: number;
  };
  recommendedPacing: string;
  recommendedDuration: string;
}

export type MediaAssetStatus =
  | 'idle'
  | 'queued'
  | 'preparing'
  | 'uploading'
  | 'paused'
  | 'processing'
  | 'ready'
  | 'error'
  | 'failed'
  | 'cancelled';

export type UploadStatus =
  | 'queued'
  | 'preparing'
  | 'uploading'
  | 'paused'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'cancelled';

export interface UploadMetrics {
  speedBytesPerSec: number;
  speedFormatted: string; // e.g. "12.4 MB/s"
  etaSeconds: number;
  etaFormatted: string; // e.g. "00:04"
  uploadedBytes: number;
  totalBytes: number;
  chunksCompleted: number;
  totalChunks: number;
  activeChunkWorkers: number;
}

export interface VideoAsset {
  id: string;
  name: string;
  fileName?: string;
  duration: number; // in seconds (precise float)
  width?: number;
  height?: number;
  resolution: string; // e.g., "1080×1920"
  aspectRatio: string; // e.g. "9:16", "16:9", "1:1", "4:5", or custom ratio
  size: string; // e.g., "14.2 MB"
  fileSizeBytes?: number;
  thumbnail: string;
  url?: string;
  persistentUrl?: string;
  fps: number;
  status: MediaAssetStatus;
  progress: number;
  uploadedAt: string;
  accentColor: string;
  codec?: string;
  profile?: string;
  bitrate?: string;
  error?: string;
  sourceFile?: File;
  metrics?: UploadMetrics;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: string;
  fileSizeBytes: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  assetId: string;
  priority: number; // 0 = normal, 1 = high, 2 = urgent
  metrics?: UploadMetrics;
  uploadedChunks: number[];
  totalChunks: number;
  chunkSize: number;
  objectUrl: string;
  startedAt?: number;
  completedAt?: number;
}

export interface PerformanceTelemetry {
  uploadLatencyMs: number;
  uploadThroughputMbps: number;
  metadataExtractionTimeMs: number;
  thumbnailGenerationTimeMs: number;
  lastOperation: string;
  memoryCleanupsCount: number;
}

export interface ConfirmModalConfig {
  isOpen: boolean;

  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}


export type TransitionCategory =
  | 'All'
  | 'Smooth'
  | 'Cinematic'
  | 'Dynamic'
  | 'Motion'
  | 'Zoom'
  | 'Camera'
  | 'Swipe'
  | 'Push'
  | 'Spin'
  | 'Blur'
  | 'Flash'
  | 'Glitch'
  | 'Light'
  | 'Distortion'
  | 'Speed'
  | 'Mask'
  | '3D'
  | 'Advanced'
  | 'Custom'
  | 'Favorites'
  | 'Recently Used';

export type TransitionDirection =
  | 'in'
  | 'out'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'diagonal_tl'
  | 'diagonal_tr'
  | 'clockwise'
  | 'counterclockwise'
  | 'center';

export type TransitionEasing =
  | 'ease_in_out'
  | 'ease_in'
  | 'ease_out'
  | 'linear'
  | 'cubic_in'
  | 'exponential'
  | 'spring';

export type TransitionSpeed = 'slow' | 'medium' | 'fast' | 'ultra';

export interface TransitionLayers {
  scale?: boolean;
  motionBlur?: boolean;
  lightFlash?: boolean;
  directional?: boolean;
  rotation?: boolean;
  colorDiffusion?: boolean;
}

export interface TransitionItem {
  id: string;
  name: string;
  type: string;
  category: string;
  duration: number;
  description: string;
  iconName: string;
  previewAnimationType?: string;
  variations?: string[];
  supportedLayers?: string[];
  defaultDirection?: TransitionDirection;
  defaultEasing?: TransitionEasing;
  defaultIntensity?: number; // 0-100
  defaultZoom?: number; // 0-100
  defaultMotionBlur?: number; // 0-100
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface TransitionRecommendation {
  transition: TransitionItem;
  score: number; // 0 - 100
  reason: string;
  adjustedDuration: number;
  adjustedIntensity: number;
  matchGrade: 'Optimal' | 'High' | 'Compatible' | 'Moderate';
}

export interface EffectItem {
  id: string;
  name: string;
  type: string;
  category: 'Motion' | 'Cinematic' | 'Light' | 'Color' | 'Blur';
  intensity: number;
  description: string;
  iconName: string;
}

export interface Template {
  id: string;
  name: string;
  subtitle: string;
  category: 'All' | 'Product' | 'Shorts' | 'TikTok' | 'Instagram' | 'Universal' | 'Tech';
  format: AspectRatio;
  recommendedDuration: string;
  description: string;
  transitions: string[];
  effects: string[];
  textStyle: {
    preset: string;
    sampleText: string;
    animation: string;
    fontFamily: string;
  };
  musicStyle: {
    title: string;
    bpm: number;
    genre: string;
  };
  colorTheme: string;
  thumbnail: string;
  pacingProfile: 'Fast & Punchy' | 'Cinematic Slow' | 'Beat-Synced' | 'Smooth Flow';
  isCustom?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  canvasSettings?: {
    width: number;
    height: number;
    aspectRatio: AspectRatio;
  };
}

export interface TimelineClip {
  id: string;
  assetId: string;
  name: string;
  start: number; // timeline start time in seconds
  end: number; // timeline end time in seconds
  clipIn: number; // trim start in source clip
  clipOut: number; // trim end in source clip
  duration: number; // effective duration on timeline (sourceDuration / speed)
  sourceDuration?: number; // un-sped physical source duration (clipOut - clipIn)
  speed: number; // playback speed multiplier (e.g. 0.25x, 1.0x, 2.0x, 4.0x)
  preservePitch?: boolean; // Preserve audio pitch on speed change (default: true)
  volume: number; // 0 - 100
  fit: 'cover' | 'contain';
  effects: {
    slowZoom?: boolean;
    pan?: boolean;
    motionBlur?: boolean;
    lightLeak?: boolean;
    filmGrain?: boolean;
    vignette?: boolean;
    glow?: boolean;
    shake?: boolean;
    speedRamp?: boolean;
    rgbSplit?: boolean;
    cinematicGrade?: boolean;
    lightFlash?: boolean;
    [key: string]: boolean | number | Record<string, unknown> | undefined;
  };
  transitionIn?: {
    id: string;
    type: string;
    duration: number;
  };
  thumbnail: string;
  url?: string;
  accentColor: string;
}

export interface TimelineTransition {
  id: string;
  fromClipId: string;
  toClipId: string;
  type: string;
  name: string;
  category?: string;
  duration: number; // e.g. 0.4s
  intensity: 'Low' | 'Medium' | 'High';
  intensityPercent?: number; // 0 - 100
  position: number; // time position on timeline
  compatibilityScore?: number; // 0 - 100%
  compatibilityBreakdown?: {
    timingScore: number;
    motionScore: number;
    compositionScore: number;
    pacingScore: number;
  };
  direction?: TransitionDirection;
  speed?: TransitionSpeed;
  zoomAmount?: number; // percentage (e.g. 18%)
  blurAmount?: number; // percentage
  motionBlurAmount?: number; // percentage
  easing?: TransitionEasing;
  layers?: TransitionLayers;
  variationName?: string;
  status?: 'auto_adjusted' | 'manual' | 'optimized';
}

export interface TimelineText {
  id: string;
  text: string;
  subText?: string;
  start: number;
  end: number;
  duration: number;
  font: string;
  size: number;
  weight: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  positionX?: number; // percentage from left (e.g. 50% for center)
  positionY: number; // percentage from top (e.g. 50% for center, 80% for lower third)
  scale?: number; // scale multiplier
  rotation?: number; // rotation in degrees
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  backgroundColor?: string;
  animation: 'minimal_kinetic' | 'slide_up' | 'glow_pulse' | 'typewriter' | 'fade_in';
  opacity: number;
  letterSpacing: number;
  styleId?: string; // Identifier of applied Text Library template
  stylePresetName?: string;
  width?: number; // width in pixels or percentage
  height?: number;
  locked?: boolean;
}

export interface TextTemplate {
  id: string;
  name: string;
  category: 'All' | 'Modern' | 'Bold' | 'Cinematic' | 'Social' | 'Tech' | 'Minimal' | 'Luxury' | 'Retro' | string;
  sampleText: string;
  sampleSubText?: string;
  font: string;
  size?: number;
  weight?: string;
  color: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderStyle?: string;
  shadowStyle?: string;
  isItalic?: boolean;
  isBold?: boolean;
  letterSpacing?: number;
  animation: 'minimal_kinetic' | 'slide_up' | 'glow_pulse' | 'typewriter' | 'fade_in';
  description: string;
  badge?: string;
  accentColor?: string;
  tags?: string[];
}

export interface TimelineAudio {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number;
  volume: number;
  waveformData: number[];
}

export interface Project {
  id: string;
  name: string;
  lastEdited: string;
  duration: number;
  format: AspectRatio;
  platform: PlatformId;
  templateId: string;
  status: 'saved' | 'saving' | 'unsaved';
  thumbnail: string;
  clipsCount: number;
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'webm';
  resolution: '1080p' | '4k' | '720p';
  fps: 30 | 60;
  quality: 'High' | 'Maximum' | 'Balanced';
  audioCodec: 'AAC 320kbps' | 'AAC 192kbps' | 'WAV Lossless';
}

export interface TranscriptSegment {
  id: string;
  start: number; // In seconds
  end: number;   // In seconds
  text: string;
  speaker?: string;
  confidence?: number;
}

export type CaptionStylePreset =
  | 'tiktok_bold'
  | 'clean_minimal'
  | 'viral_yellow'
  | 'cinema_box'
  | 'neon_glow';

export interface TranscriptState {
  language: string; // 'auto' | 'en' | 'bn' | 'es' | 'hi' etc.
  status: 'idle' | 'extracting_audio' | 'transcribing' | 'completed' | 'error';
  progress: number;
  segments: TranscriptSegment[];
  captionStyle: CaptionStylePreset;
  isAutoSyncedToTimeline: boolean;
  detectedLanguage?: string;
}

export interface EvidenceSource {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  sourceType: 'official' | 'research' | 'internal' | 'empirical';
  accessedAt?: string;
  publishedDate?: string;
  updatedDate?: string;
  relevantTo: string[];
  isPotentiallyOutdated?: boolean;
}

export interface RecommendationEvidence {
  score: number;
  grade: 'Optimal' | 'High' | 'Compatible' | 'Moderate' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0 - 100%
  breakdown: {
    readabilityScore?: number;
    compositionScore?: number;
    contrastScore?: number;
    aspectRatioScore?: number;
    motionScore?: number;
    styleScore?: number;
    durationScore?: number;
    intensityScore?: number;
    timingScore?: number;
    visualFitScore?: number;
    safeAreaScore?: number;
  };
  reasons: string[];
  sources: EvidenceSource[];
  recommendedPosition?: {
    x: number; // percentage (e.g. 50%)
    y: number; // percentage (e.g. 78%)
    safeAreaVerified: boolean;
  };
  conflictWarning?: string;
  analysisVersion: string;
  evidenceDatasetDate: string;
  scoringModel: string;
}

export interface VideoAnalysisMetrics {
  analyzedAt: number;
  dominantColors: string[];
  colorTemperature: 'Warm' | 'Cool' | 'Neutral';
  brightness: number; // 0-100 (low, medium, high key)
  contrastRatio: number; // e.g. 4.5
  luminance: number; // 0-100
  visualComplexity: 'Low' | 'Moderate' | 'High';
  backgroundComplexity: 'Simple' | 'Moderate' | 'Complex';
  darkBackgroundAvailable: boolean;
  lightBackgroundAvailable: boolean;
  isDarkBackground?: boolean;
  negativeSpaceZone: 'Top' | 'Bottom' | 'Center' | 'Sides';
  subjectLocation: 'Center' | 'Left' | 'Right' | 'Top' | 'Bottom' | 'None';
  subjectPosition?: 'Center' | 'Left' | 'Right' | 'Top' | 'Bottom' | 'None';
  motionDynamics: 'Static' | 'Gentle Pan' | 'Rapid Zoom' | 'High Motion' | 'Shaky';
  aspectRatio: AspectRatio;
  duration: number;
  clipCount: number;
  sceneCutCount: number;
}

export interface OptimizationSettings {
  platform: 'youtube' | 'youtube_shorts' | 'instagram_reels' | 'tiktok' | 'facebook';
  analysisMode: 'video_compatibility' | 'high_engagement' | 'cinematic_balanced';
  isRecommendationEngineEnabled: boolean;
  engineEnabled?: boolean;
  evidenceMode: 'detailed' | 'compact';
  isAutoRecommendationEnabled: boolean;
  autoRecommend?: boolean;
  analysisTarget: 'all' | 'text' | 'transitions' | 'effects';
  target?: 'all' | 'text' | 'transitions' | 'effects';
  showCompatibilityScore: boolean;
  showScores?: boolean;
  showEvidence: boolean;
  showConfidence: boolean;
  showAnalysisDetails: boolean;
  showDetails?: boolean;
}


