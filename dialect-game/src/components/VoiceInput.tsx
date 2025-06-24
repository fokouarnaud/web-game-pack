/**
 * VoiceInput component - Voice recognition interface component
 * Following TDD methodology - implementing to make tests pass (GREEN phase)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceService } from '../hooks/useVoiceService';
import type { SpeechResult, VoiceError, VoiceRecognitionState } from '../types';

export interface VoiceInputProps {
  onResult: (result: SpeechResult) => void;
  onError: (error: VoiceError) => void;
  onStateChange: (state: VoiceRecognitionState) => void;
  language: string;
  placeholder?: string;
  disabled?: boolean;
  pushToTalk?: boolean;
  showConfidence?: boolean;
  showTranscript?: boolean;
  showVolumeLevel?: boolean;
  timeout?: number;
  autoRetry?: boolean;
}

export const VoiceInput = React.memo<VoiceInputProps>(({
  onResult,
  onError,
  onStateChange,
  language,
  placeholder = 'Click to speak...',
  disabled = false,
  pushToTalk = false,
  showConfidence = false,
  showTranscript = false,
  showVolumeLevel = false,
  timeout,
  autoRetry = false
}) => {
  const [currentState, setCurrentState] = useState<VoiceRecognitionState>('idle');
  const [lastResult, setLastResult] = useState<SpeechResult | null>(null);
  const [lastError, setLastError] = useState<VoiceError | null>(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  
  const longPressTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  const voiceService = useVoiceService({
    language,
    continuous: !pushToTalk,
    interimResults: showTranscript
  });

  // Check for accessibility preferences
  useEffect(() => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setIsHighContrast(highContrastQuery.matches);
    setReducedMotion(reducedMotionQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    const handleReducedMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Update language when prop changes
  useEffect(() => {
    voiceService.setLanguage(language);
  }, [language, voiceService]);

  // Setup voice service event listeners
  useEffect(() => {
    const handleResult = (result: SpeechResult) => {
      setLastResult(result);
      onResult(result);
    };

    const handleError = (error: VoiceError) => {
      setLastError(error);
      onError(error);
      
      // Auto-retry for certain error types
      if (autoRetry && (error.type === 'no-speech' || error.type === 'aborted')) {
        retryTimeoutRef.current = window.setTimeout(() => {
          if (voiceService.isSupported()) {
            voiceService.start().catch(() => {
              // Ignore retry errors
            });
          }
        }, 1500);
      }
    };

    const handleStateChange = (state: VoiceRecognitionState) => {
      setCurrentState(state);
      onStateChange(state);
      
      // Start countdown if timeout is set and we're listening
      if (state === 'listening' && timeout) {
        setCountdown(Math.floor(timeout / 1000));
        countdownTimerRef.current = window.setInterval(() => {
          setCountdown(prev => {
            if (prev && prev > 1) {
              return prev - 1;
            } else {
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
              }
              voiceService.stop();
              return null;
            }
          });
        }, 1000);
      } else {
        setCountdown(null);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    };

    voiceService.onResult(handleResult);
    voiceService.onError(handleError);
    voiceService.onStateChange(handleStateChange);

    return () => {
      voiceService.removeAllListeners();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [voiceService, onResult, onError, onStateChange, timeout, autoRetry]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [debounceTimeout]);

  const handleButtonClick = useCallback(() => {
    if (disabled || !voiceService.isSupported()) return;

    // Debounce rapid clicks
    if (debounceTimeout) {
      return;
    }

    setDebounceTimeout(window.setTimeout(() => {
      setDebounceTimeout(null);
    }, 300));

    if (currentState === 'listening') {
      voiceService.stop();
    } else {
      voiceService.start().catch((error) => {
        console.error('Failed to start voice recognition:', error);
      });
    }
  }, [disabled, voiceService, currentState, debounceTimeout]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleButtonClick();
    }
  }, [handleButtonClick]);

  const handleMouseDown = useCallback(() => {
    if (!pushToTalk || disabled) return;
    
    voiceService.start().catch(() => {
      // Handle error silently for push-to-talk
    });
  }, [pushToTalk, disabled, voiceService]);

  const handleMouseUp = useCallback(() => {
    if (!pushToTalk || disabled) return;
    
    voiceService.stop();
  }, [pushToTalk, disabled, voiceService]);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    
    // Long press detection
    longPressTimerRef.current = window.setTimeout(() => {
      voiceService.start().catch(() => {
        // Handle error silently
      });
    }, 500);
  }, [disabled, voiceService]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (currentState === 'listening') {
      voiceService.stop();
    }
  }, [currentState, voiceService]);

  const handleRetry = useCallback(() => {
    setLastError(null);
    voiceService.start().catch((error) => {
      console.error('Retry failed:', error);
    });
  }, [voiceService]);

  const getButtonAriaLabel = useCallback(() => {
    switch (currentState) {
      case 'listening':
        return 'Stop voice recognition';
      case 'processing':
        return 'Processing speech';
      case 'error':
        return 'Voice recognition error, click to retry';
      default:
        return 'Start voice recognition';
    }
  }, [currentState]);

  const getStatusMessage = useCallback(() => {
    switch (currentState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Error occurred';
      default:
        return placeholder;
    }
  }, [currentState, placeholder]);

  const getErrorMessage = useCallback((error: VoiceError) => {
    switch (error.type) {
      case 'not-allowed':
        return 'Permission denied. Please allow microphone access to use voice recognition.';
      case 'network':
        return 'Network error. Please check your internet connection and try again.';
      case 'no-speech':
        return 'No speech detected. Please try speaking more clearly.';
      case 'aborted':
        return 'Recognition was aborted. Click to try again.';
      case 'audio-capture':
        return 'Microphone error. Please check your microphone connection.';
      default:
        return error.message || 'An error occurred with voice recognition.';
    }
  }, []);

  // Don't render if voice recognition is not supported
  if (!voiceService.isSupported()) {
    return (
      <div className="voice-input-unsupported" role="alert">
        <p>Voice recognition not supported in this browser.</p>
        <p>Try using a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    );
  }

  return (
    <div
      className={`voice-input ${isHighContrast ? 'high-contrast' : ''}`}
      data-testid="voice-input"
    >
      <button
        type="button"
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        onMouseDown={pushToTalk ? handleMouseDown : undefined}
        onMouseUp={pushToTalk ? handleMouseUp : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`voice-button ${currentState}`}
        aria-label={getButtonAriaLabel()}
        aria-describedby="voice-status"
        aria-disabled={disabled}
      >
        <div 
          className={`microphone-icon ${
            currentState === 'listening' && !reducedMotion ? 'pulse-animation' : ''
          } ${currentState === 'listening' ? 'recording' : ''}`}
          data-testid="microphone-icon"
        >
          🎤
        </div>
        
        {currentState === 'processing' && (
          <div className="processing-spinner" data-testid="processing-spinner">
            ⏳
          </div>
        )}
        
        {currentState === 'error' && (
          <div className="error-icon" data-testid="error-icon">
            ⚠️
          </div>
        )}
      </button>

      <div 
        id="voice-status"
        className="voice-status"
        role="status"
        aria-live="polite"
      >
        {getStatusMessage()}
      </div>

      {showVolumeLevel && currentState === 'listening' && (
        <div 
          className="volume-indicator"
          data-testid="volume-indicator"
        >
          <div 
            className="volume-bar"
            role="progressbar"
            aria-label="Volume level"
            aria-valuenow={volumeLevel}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div 
              className="volume-fill"
              style={{ width: `${volumeLevel}%` }}
            />
          </div>
        </div>
      )}

      {showTranscript && lastResult && (
        <div 
          className="transcript-preview"
          data-testid="transcript-preview"
        >
          {lastResult.transcript}
        </div>
      )}

      {showConfidence && lastResult && (
        <div 
          className="confidence-indicator"
          data-testid="confidence-indicator"
        >
          Confidence: {Math.round(lastResult.confidence * 100)}%
        </div>
      )}

      {countdown !== null && (
        <div 
          className="countdown-timer"
          data-testid="countdown-timer"
        >
          {countdown}s
        </div>
      )}

      {lastError && (
        <div className="error-message" role="alert">
          <p>{getErrorMessage(lastError)}</p>
          <button 
            type="button"
            onClick={handleRetry}
            className="retry-button"
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {currentState === 'listening' && 'Voice recognition started'}
        {currentState === 'idle' && 'Voice recognition stopped'}
        {currentState === 'processing' && 'Processing your speech'}
      </div>
    </div>
  );
});

VoiceInput.displayName = 'VoiceInput';