export interface VoiceProcessingRequest {
  sessionType: VoiceSessionType;
  expectedText?: string;
  language?: string;
  lessonId?: number;
  enableFeedback?: boolean;
  enableScoring?: boolean;
}

export interface VoiceProcessingResponse {
  sessionId: number;
  transcribedText: string;
  confidenceScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  processingStatus: ProcessingStatus;
  aiFeedback?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
}

export interface VoiceSession {
  id: number;
  sessionType: VoiceSessionType;
  transcribedText: string;
  expectedText?: string;
  confidenceScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  processingStatus: ProcessingStatus;
  language: string;
  durationMs: number;
  aiFeedback?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
}

export enum VoiceSessionType {
  PRONUNCIATION = 'PRONUNCIATION',
  CONVERSATION = 'CONVERSATION',
  DICTATION = 'DICTATION',
  FREE_SPEECH = 'FREE_SPEECH'
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface VoiceRecordingConfig {
  maxDuration: number;
  silenceThreshold: number;
  language: string;
  enableEchoCancellation: boolean;
  enableNoiseSuppression: boolean;
  enableAutoGainControl: boolean;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  volume: number;
  hasError: boolean;
  errorMessage?: string;
}