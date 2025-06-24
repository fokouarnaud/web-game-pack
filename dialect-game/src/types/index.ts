/**
 * Centralized export for all types
 * Main entry point for importing types throughout the application
 */

// Re-export all types from individual modules
export * from './game';
export * from './voice';
export * from './dialect';

// Import types for service interfaces
import type { GameState, GameConfig, GameObject, GameEvent } from './game';
import type { VoiceError } from './voice';
import type { LearningPreferences, Dialect, DialectLearningSession, DialectStats, LanguageCode } from './dialect';

// Service interfaces
export interface IGameEngine {
  readonly state: GameState;
  readonly config: GameConfig;
  readonly objects: GameObject[];
  
  initialize(canvas: HTMLCanvasElement, config: Partial<GameConfig>): void;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  addObject(object: GameObject): void;
  removeObject(id: string): void;
  getObject(id: string): GameObject | undefined;
  
  onStateChange(callback: (state: GameState) => void): void;
  onEvent(callback: (event: GameEvent) => void): void;
  
  dispose(): void;
}

export interface IAudioService {
  readonly isSupported: boolean;
  readonly volume: number;
  
  initialize(): Promise<void>;
  playSound(url: string, volume?: number): Promise<void>;
  playBackgroundMusic(url: string, loop?: boolean): Promise<void>;
  stopBackgroundMusic(): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  dispose(): void;
}

// Import for global app state
import type { GameStateData } from './game';

// Global app state
export interface AppState {
  user: {
    id: string;
    name: string;
    preferences: LearningPreferences;
  };
  game: GameStateData;
  learning: {
    currentDialect?: Dialect;
    currentSession?: DialectLearningSession;
    stats: DialectStats[];
  };
  ui: {
    theme: 'light' | 'dark';
    language: LanguageCode;
    loading: boolean;
    errors: string[];
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event callback types
export type EventCallback<T = any> = (data: T) => void;
export type ErrorCallback = (error: Error | VoiceError) => void;
export type StateChangeCallback<T> = (newState: T, oldState: T) => void;