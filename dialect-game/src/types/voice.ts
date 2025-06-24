/**
 * Voice recognition types and interfaces
 * Defines structures for speech recognition, results, and voice service
 */

/** Voice recognition states */
export type VoiceRecognitionState = 
  | 'idle'
  | 'listening' 
  | 'processing'
  | 'error'
  | 'not_supported';

/** Speech recognition result */
export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  alternatives?: SpeechAlternative[];
}

/** Alternative speech recognition results */
export interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

/** Voice recognition configuration */
export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceGrammars?: boolean;
}

/** Voice recognition error types */
export type VoiceErrorType = 
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'unknown';

/** Voice recognition error */
export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  timestamp: number;
  code?: number;
}

/** Voice event types */
export type VoiceEventType = 
  | 'start'
  | 'end'
  | 'result'
  | 'error'
  | 'speech_start'
  | 'speech_end'
  | 'sound_start'
  | 'sound_end'
  | 'audio_start'
  | 'audio_end'
  | 'no_match';

/** Voice event */
export interface VoiceEvent {
  type: VoiceEventType;
  timestamp: number;
  data?: SpeechResult | VoiceError | any;
}

/** Voice service interface */
export interface IVoiceService {
  /** Current state of voice recognition */
  readonly state: VoiceRecognitionState;
  
  /** Current configuration */
  readonly config: VoiceRecognitionConfig;
  
  /** Check if voice recognition is supported */
  isSupported(): boolean;
  
  /** Start voice recognition */
  start(): Promise<void>;
  
  /** Stop voice recognition */
  stop(): void;
  
  /** Abort voice recognition */
  abort(): void;
  
  /** Set language for recognition */
  setLanguage(language: string): void;
  
  /** Set configuration */
  configure(config: Partial<VoiceRecognitionConfig>): void;
  
  /** Event listeners */
  onResult(callback: (result: SpeechResult) => void): void;
  onError(callback: (error: VoiceError) => void): void;
  onStateChange(callback: (state: VoiceRecognitionState) => void): void;
  onEvent(callback: (event: VoiceEvent) => void): void;
  
  /** Remove event listeners */
  removeAllListeners(): void;
  
  /** Cleanup resources */
  dispose(): void;
}

/** Voice recognition metrics */
export interface VoiceMetrics {
  totalRecognitions: number;
  successfulRecognitions: number;
  averageConfidence: number;
  averageLatency: number; // in milliseconds
  errorCount: number;
  errorsByType: Record<VoiceErrorType, number>;
}

/** Voice calibration data */
export interface VoiceCalibration {
  language: string;
  noiseLevel: number;
  volumeLevel: number;
  microphoneSensitivity: number;
  calibratedAt: number;
}