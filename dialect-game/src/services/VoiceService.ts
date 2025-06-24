/**
 * Voice recognition service implementation
 * Implements voice recognition functionality using Web Speech API
 */

import type {
  IVoiceService,
  VoiceRecognitionState,
  VoiceRecognitionConfig,
  SpeechResult,
  VoiceError,
  VoiceEvent,
  VoiceEventType
} from '../types';
import { getSpeechRecognition, createSpeechRecognition } from '../utils/speechApi';

/**
 * VoiceService class - implements voice recognition functionality
 * Integrates with Web Speech API with robust error handling and fallbacks
 */
export class VoiceService implements IVoiceService {
  private _state: VoiceRecognitionState = 'idle';
  private _config: VoiceRecognitionConfig;
  private _recognition: any | null = null;
  private _resultCallbacks: Array<(result: SpeechResult) => void> = [];
  private _errorCallbacks: Array<(error: VoiceError) => void> = [];
  private _stateChangeCallbacks: Array<(state: VoiceRecognitionState) => void> = [];
  private _eventCallbacks: Array<(event: VoiceEvent) => void> = [];
  private _isStarting = false;
  private _lastStartTime = 0;
  private _throttleDelay = 100; // ms

  constructor(config?: Partial<VoiceRecognitionConfig>) {
    this._config = {
      language: 'en-US',
      continuous: true,
      interimResults: false,
      maxAlternatives: 1,
      serviceGrammars: false,
      ...config
    };

    this._initializeRecognition();
  }

  get state(): VoiceRecognitionState {
    return this._state;
  }

  get config(): VoiceRecognitionConfig {
    return { ...this._config };
  }

  private _initializeRecognition(): void {
    if (!this.isSupported()) {
      this._setState('not_supported');
      return;
    }

    try {
      this._recognition = createSpeechRecognition();
      if (this._recognition) {
        this._setupRecognition();
      } else {
        this._setState('error');
        this._emitError('unknown', 'Failed to initialize speech recognition');
      }
    } catch (error) {
      this._setState('error');
      this._emitError('unknown', 'Failed to initialize speech recognition');
    }
  }

  private _setupRecognition(): void {
    if (!this._recognition) return;

    // Configure recognition
    this._recognition.continuous = this._config.continuous;
    this._recognition.interimResults = this._config.interimResults;
    this._recognition.lang = this._config.language;
    this._recognition.maxAlternatives = this._config.maxAlternatives;

    // Event handlers
    this._recognition.onstart = this._handleStart.bind(this);
    this._recognition.onend = this._handleEnd.bind(this);
    this._recognition.onresult = this._handleResult.bind(this);
    this._recognition.onerror = this._handleError.bind(this);
    this._recognition.onspeechstart = this._handleSpeechStart.bind(this);
    this._recognition.onspeechend = this._handleSpeechEnd.bind(this);
    this._recognition.onsoundstart = this._handleSoundStart.bind(this);
    this._recognition.onsoundend = this._handleSoundEnd.bind(this);
    this._recognition.onaudiostart = this._handleAudioStart.bind(this);
    this._recognition.onaudioend = this._handleAudioEnd.bind(this);
    this._recognition.onnomatch = this._handleNoMatch.bind(this);
  }

  isSupported(): boolean {
    return getSpeechRecognition() !== null;
  }

  async start(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported');
    }

    if (this._state === 'listening' || this._isStarting) {
      return; // Already listening or starting
    }

    // Throttle rapid calls
    const now = Date.now();
    if (now - this._lastStartTime < this._throttleDelay) {
      return;
    }
    this._lastStartTime = now;

    if (!this._recognition) {
      this._initializeRecognition();
      if (!this._recognition) {
        throw new Error('Failed to initialize speech recognition');
      }
    }

    return new Promise((resolve, reject) => {
      this._isStarting = true;

      const onStart = () => {
        this._isStarting = false;
        resolve();
      };

      const onError = (error: VoiceError) => {
        this._isStarting = false;
        reject(new Error(error.message));
      };

      // Temporary listeners for this start operation
      const startListener = () => {
        this._eventCallbacks.splice(this._eventCallbacks.indexOf(startListener), 1);
        this._errorCallbacks.splice(this._errorCallbacks.indexOf(onError), 1);
        onStart();
      };

      this._eventCallbacks.push(startListener);
      this._errorCallbacks.push(onError);

      try {
        this._recognition!.start();
      } catch (error) {
        this._isStarting = false;
        reject(error);
      }
    });
  }

  stop(): void {
    if (this._recognition) {
      this._recognition.stop();
      this._setState('idle');
    }
  }

  abort(): void {
    if (this._recognition) {
      this._recognition.abort();
      this._setState('idle');
    }
  }

  setLanguage(language: string): void {
    this._config.language = language;
    if (this._recognition) {
      this._recognition.lang = language;
    }
  }

  configure(config: Partial<VoiceRecognitionConfig>): void {
    this._config = { ...this._config, ...config };
    
    if (this._recognition) {
      this._recognition.continuous = this._config.continuous;
      this._recognition.interimResults = this._config.interimResults;
      this._recognition.lang = this._config.language;
      this._recognition.maxAlternatives = this._config.maxAlternatives;
    }
  }

  onResult(callback: (result: SpeechResult) => void): void {
    this._resultCallbacks.push(callback);
  }

  onError(callback: (error: VoiceError) => void): void {
    this._errorCallbacks.push(callback);
  }

  onStateChange(callback: (state: VoiceRecognitionState) => void): void {
    this._stateChangeCallbacks.push(callback);
  }

  onEvent(callback: (event: VoiceEvent) => void): void {
    this._eventCallbacks.push(callback);
  }

  removeAllListeners(): void {
    this._resultCallbacks = [];
    this._errorCallbacks = [];
    this._stateChangeCallbacks = [];
    this._eventCallbacks = [];
  }

  dispose(): void {
    if (this._recognition) {
      this._recognition.abort();
      
      // Remove event listeners
      if (this._recognition.removeEventListener) {
        this._recognition.removeEventListener('start', this._handleStart);
        this._recognition.removeEventListener('end', this._handleEnd);
        this._recognition.removeEventListener('result', this._handleResult);
        this._recognition.removeEventListener('error', this._handleError);
      }
      
      this._recognition.onstart = null;
      this._recognition.onend = null;
      this._recognition.onresult = null;
      this._recognition.onerror = null;
      this._recognition.onspeechstart = null;
      this._recognition.onspeechend = null;
      this._recognition.onsoundstart = null;
      this._recognition.onsoundend = null;
      this._recognition.onaudiostart = null;
      this._recognition.onaudioend = null;
      this._recognition.onnomatch = null;
    }
    
    this.removeAllListeners();
    this._setState('idle');
  }

  // Event handlers
  private _handleStart(event: Event): void {
    this._setState('listening');
    this._emitEvent('start', {});
  }

  private _handleEnd(event: Event): void {
    this._setState('idle');
    this._emitEvent('end', {});
  }

  private _handleResult(event: any): void {
    const results = event.results;
    const resultIndex = event.resultIndex || 0;
    
    if (!results || !results.length) return;
    
    for (let i = resultIndex; i < results.length; i++) {
      const result = results[i];
      if (!result || !result.length) continue;
      
      const transcript = result[0]?.transcript || '';
      const confidence = result[0]?.confidence || 0;
      
      const alternatives = [];
      for (let j = 0; j < result.length; j++) {
        if (result[j]) {
          alternatives.push({
            transcript: result[j].transcript || '',
            confidence: result[j].confidence || 0
          });
        }
      }

      const speechResult: SpeechResult = {
        transcript: transcript.trim(),
        confidence,
        isFinal: result.isFinal || false,
        timestamp: Date.now(),
        alternatives
      };

      this._resultCallbacks.forEach(callback => {
        try {
          callback(speechResult);
        } catch (error) {
          console.error('Error in result callback:', error);
        }
      });

      this._emitEvent('result', speechResult);
    }
  }

  private _handleError(event: any): void {
    const errorType = this._mapErrorType(event.error);
    const error: VoiceError = {
      type: errorType,
      message: event.message || `Speech recognition error: ${event.error}`,
      timestamp: Date.now(),
      code: typeof event.error === 'string' ? undefined : event.error
    };

    this._setState('error');
    this._emitError(errorType, error.message);
    this._emitEvent('error', error);
  }

  private _handleSpeechStart(event: Event): void {
    this._emitEvent('speech_start', {});
  }

  private _handleSpeechEnd(event: Event): void {
    this._emitEvent('speech_end', {});
  }

  private _handleSoundStart(event: Event): void {
    this._emitEvent('sound_start', {});
  }

  private _handleSoundEnd(event: Event): void {
    this._emitEvent('sound_end', {});
  }

  private _handleAudioStart(event: Event): void {
    this._emitEvent('audio_start', {});
  }

  private _handleAudioEnd(event: Event): void {
    this._emitEvent('audio_end', {});
  }

  private _handleNoMatch(event: Event): void {
    this._emitEvent('no_match', {});
  }

  // Helper methods
  private _setState(newState: VoiceRecognitionState): void {
    if (this._state !== newState) {
      this._state = newState;
      this._stateChangeCallbacks.forEach(callback => {
        try {
          callback(newState);
        } catch (error) {
          console.error('Error in state change callback:', error);
        }
      });
    }
  }

  private _emitError(type: string, message: string): void {
    const error: VoiceError = {
      type: this._mapErrorType(type),
      message,
      timestamp: Date.now()
    };

    this._errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }

  private _emitEvent(type: VoiceEventType, data?: any): void {
    const event: VoiceEvent = {
      type,
      timestamp: Date.now(),
      data
    };

    this._eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  private _mapErrorType(error: string): VoiceError['type'] {
    switch (error) {
      case 'no-speech': return 'no-speech';
      case 'aborted': return 'aborted';
      case 'audio-capture': return 'audio-capture';
      case 'network': return 'network';
      case 'not-allowed': return 'not-allowed';
      case 'service-not-allowed': return 'service-not-allowed';
      case 'bad-grammar': return 'bad-grammar';
      case 'language-not-supported': return 'language-not-supported';
      default: return 'unknown';
    }
  }
}
