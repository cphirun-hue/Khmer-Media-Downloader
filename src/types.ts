export type VideoPlatform = 'youtube' | 'facebook' | 'tiktok' | 'unknown';

export interface VideoMetadata {
  title: string;
  author: string;
  duration: string;
  thumbnailUrl: string;
  fileSizeEstimate: string;
  resolutionOptions: string[];
  platform: VideoPlatform;
  originalUrl: string;
}

export interface WindowsDownloadScript {
  methodName: string;
  description: string;
  command: string;
  instructions: string;
}

export interface AnalysisResponse {
  success: boolean;
  metadata?: VideoMetadata;
  scripts?: WindowsDownloadScript[];
  error?: string;
  directDownloadUrl?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  author: string;
  platform: VideoPlatform;
  url: string;
  downloadedAt: string;
  fileSize: string;
  status: 'completed' | 'failed' | 'pending';
}
