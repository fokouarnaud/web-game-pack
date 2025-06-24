/**
 * Unit tests for VoiceService
 * Following TDD methodology - these tests will initially fail (RED phase)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceService } from '../../src/services/VoiceService';
import { mockSpeechRecognition } from '../setup';
import type { VoiceRecognitionConfig, SpeechResult, VoiceError } from '../../src/types';

describe('VoiceService', () => {
  let voiceService: VoiceService;
  let mockRecognitionInstance: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create a fresh mock instance for each test
    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      maxAlternatives: 1,
      serviceURI: '',
      grammars: null,
    };
    
    mockSpeechRecognition.mockReturnValue(mockRecognitionInstance);
    voiceService = new VoiceService();
  });

  afterEach(() => {
    if (voiceService) {
      voiceService.dispose();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const service = new VoiceService();
      
      expect(service.state).toBe('idle');
      expect(service.config).toEqual({
        language: 'en-US',
        continuous: true,
        interimResults: false,
        maxAlternatives: 1,
        serviceGrammars: false,
      });
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<VoiceRecognitionConfig> = {
        language: 'fr-FR',
        continuous: false,
        interimResults: true,
        maxAlternatives: 5,
      };
      
      const service = new VoiceService(customConfig);
      
      expect(service.config).toEqual({
        language: 'fr-FR',
        continuous: false,
        interimResults: true,
        maxAlternatives: 5,
        serviceGrammars: false,
      });
    });

    it('should detect Web Speech API support', () => {
      expect(voiceService.isSupported()).toBe(true);
    });
  });

  describe('Voice Recognition Control', () => {
    it('should start voice recognition successfully', async () => {
      mockRecognitionInstance.start.mockImplementation(() => {
        // Simulate successful start
        const event = new Event('start');
        mockRecognitionInstance.onstart?.(event);
      });

      await voiceService.start();
      
      expect(mockSpeechRecognition).toHaveBeenCalled();
      expect(mockRecognitionInstance.start).toHaveBeenCalled();
      expect(voiceService.state).toBe('listening');
    });

    it('should handle start errors', async () => {
      const errorCallback = vi.fn();
      voiceService.onError(errorCallback);

      mockRecognitionInstance.start.mockImplementation(() => {
        const errorEvent = {
          error: 'not-allowed',
          message: 'Permission denied',
        };
        mockRecognitionInstance.onerror?.(errorEvent);
      });

      await expect(voiceService.start()).rejects.toThrow();
      expect(voiceService.state).toBe('error');
      expect(errorCallback).toHaveBeenCalledWith({
        type: 'not-allowed',
        message: 'Permission denied',
        timestamp: expect.any(Number),
      });
    });

    it('should stop voice recognition', () => {
      voiceService.stop();
      
      expect(mockRecognitionInstance.stop).toHaveBeenCalled();
      expect(voiceService.state).toBe('idle');
    });

    it('should abort voice recognition', () => {
      voiceService.abort();
      
      expect(mockRecognitionInstance.abort).toHaveBeenCalled();
      expect(voiceService.state).toBe('idle');
    });

    it('should not start if already listening', async () => {
      // First start should work
      mockRecognitionInstance.start.mockImplementation(() => {
        const event = new Event('start');
        mockRecognitionInstance.onstart?.(event);
      });
      
      await voiceService.start();
      expect(voiceService.state).toBe('listening');
      
      // Second start should be ignored
      await voiceService.start();
      expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration Management', () => {
    it('should update language setting', () => {
      voiceService.setLanguage('es-ES');
      
      expect(voiceService.config.language).toBe('es-ES');
      expect(mockRecognitionInstance.lang).toBe('es-ES');
    });

    it('should update configuration', () => {
      const newConfig: Partial<VoiceRecognitionConfig> = {
        continuous: false,
        interimResults: true,
        maxAlternatives: 3,
      };
      
      voiceService.configure(newConfig);
      
      expect(voiceService.config.continuous).toBe(false);
      expect(voiceService.config.interimResults).toBe(true);
      expect(voiceService.config.maxAlternatives).toBe(3);
      expect(mockRecognitionInstance.continuous).toBe(false);
      expect(mockRecognitionInstance.interimResults).toBe(true);
      expect(mockRecognitionInstance.maxAlternatives).toBe(3);
    });
  });

  describe('Event Handling', () => {
    it('should handle speech recognition results', () => {
      const resultCallback = vi.fn();
      voiceService.onResult(resultCallback);

      const mockResult: SpeechResult = {
        transcript: 'hello world',
        confidence: 0.95,
        isFinal: true,
        timestamp: Date.now(),
        alternatives: [
          { transcript: 'hello world', confidence: 0.95 },
          { transcript: 'hello word', confidence: 0.85 },
        ],
      };

      // Simulate result event
      const resultEvent = {
        results: [{
          [0]: {
            transcript: 'hello world',
            confidence: 0.95,
          },
          isFinal: true,
          length: 2,
          item: (index: number) => ({
            transcript: index === 0 ? 'hello world' : 'hello word',
            confidence: index === 0 ? 0.95 : 0.85,
          }),
        }],
        resultIndex: 0,
      };

      mockRecognitionInstance.onresult?.(resultEvent);
      
      expect(resultCallback).toHaveBeenCalledWith(expect.objectContaining({
        transcript: 'hello world',
        confidence: 0.95,
        isFinal: true,
        timestamp: expect.any(Number),
      }));
    });

    it('should handle interim results when enabled', () => {
      voiceService.configure({ interimResults: true });
      const resultCallback = vi.fn();
      voiceService.onResult(resultCallback);

      const interimEvent = {
        results: [{
          [0]: {
            transcript: 'hello',
            confidence: 0.7,
          },
          isFinal: false,
          length: 1,
          item: () => ({ transcript: 'hello', confidence: 0.7 }),
        }],
        resultIndex: 0,
      };

      mockRecognitionInstance.onresult?.(interimEvent);
      
      expect(resultCallback).toHaveBeenCalledWith(expect.objectContaining({
        transcript: 'hello',
        confidence: 0.7,
        isFinal: false,
      }));
    });

    it('should handle various error types', () => {
      const errorCallback = vi.fn();
      voiceService.onError(errorCallback);

      const errorTypes = [
        'no-speech',
        'aborted',
        'audio-capture',
        'network',
        'not-allowed',
        'service-not-allowed',
        'bad-grammar',
        'language-not-supported',
      ];

      errorTypes.forEach((errorType) => {
        const errorEvent = { error: errorType };
        mockRecognitionInstance.onerror?.(errorEvent);
        
        expect(errorCallback).toHaveBeenCalledWith(expect.objectContaining({
          type: errorType,
          timestamp: expect.any(Number),
        }));
      });
    });

    it('should handle state changes', () => {
      const stateChangeCallback = vi.fn();
      voiceService.onStateChange(stateChangeCallback);

      // Simulate start event
      mockRecognitionInstance.onstart?.({});
      expect(stateChangeCallback).toHaveBeenCalledWith('listening');

      // Simulate end event
      mockRecognitionInstance.onend?.({});
      expect(stateChangeCallback).toHaveBeenCalledWith('idle');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should throttle rapid start/stop calls', () => {
      // Mock the start method to simulate immediate start
      mockRecognitionInstance.start.mockImplementation(() => {
        const event = new Event('start');
        mockRecognitionInstance.onstart?.(event);
      });
      
      // First start call
      voiceService.start();
      expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);
      
      // Rapid subsequent start calls should be ignored if already listening
      voiceService.start();
      voiceService.start();
      
      // Should still only be called once since we're already listening
      expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);
      
      // Stop should work normally
      voiceService.stop();
      expect(mockRecognitionInstance.stop).toHaveBeenCalledTimes(1);
    });

    it('should clean up resources on dispose', () => {
      const resultCallback = vi.fn();
      const errorCallback = vi.fn();
      
      voiceService.onResult(resultCallback);
      voiceService.onError(errorCallback);
      
      voiceService.dispose();
      
      expect(mockRecognitionInstance.removeEventListener).toHaveBeenCalled();
      expect(voiceService.state).toBe('idle');
    });

    it('should remove all event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      voiceService.onResult(callback1);
      voiceService.onError(callback2);
      
      voiceService.removeAllListeners();
      
      // Simulate events after removing listeners
      mockRecognitionInstance.onresult?.({});
      mockRecognitionInstance.onerror?.({});
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle API unavailable gracefully', async () => {
      // Create a service that will simulate unsupported API
      const unsupportedService = new VoiceService();
      
      // Mock the isSupported method to return false
      vi.spyOn(unsupportedService, 'isSupported').mockReturnValue(false);
      
      expect(unsupportedService.isSupported()).toBe(false);
      await expect(unsupportedService.start()).rejects.toThrow('Speech recognition not supported');
    });

    it('should handle permission denied error', async () => {
      const errorCallback = vi.fn();
      voiceService.onError(errorCallback);

      mockRecognitionInstance.start.mockImplementation(() => {
        const errorEvent = { error: 'not-allowed' };
        mockRecognitionInstance.onerror?.(errorEvent);
      });

      await expect(voiceService.start()).rejects.toThrow();
      expect(voiceService.state).toBe('error');
    });

    it('should handle network errors during recognition', () => {
      const errorCallback = vi.fn();
      voiceService.onError(errorCallback);

      const networkError = { error: 'network' };
      mockRecognitionInstance.onerror?.(networkError);
      
      expect(errorCallback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'network',
      }));
      expect(voiceService.state).toBe('error');
    });

    it('should handle low confidence results', () => {
      const resultCallback = vi.fn();
      voiceService.onResult(resultCallback);

      const lowConfidenceEvent = {
        results: [{
          [0]: {
            transcript: 'unclear speech',
            confidence: 0.3,
          },
          isFinal: true,
          length: 1,
          item: () => ({ transcript: 'unclear speech', confidence: 0.3 }),
        }],
        resultIndex: 0,
      };

      mockRecognitionInstance.onresult?.(lowConfidenceEvent);
      
      expect(resultCallback).toHaveBeenCalledWith(expect.objectContaining({
        confidence: 0.3,
      }));
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with Chrome (webkitSpeechRecognition)', () => {
      const service = new VoiceService();
      expect(service.isSupported()).toBe(true);
    });

    it('should work with standard SpeechRecognition API', () => {
      const service = new VoiceService();
      expect(service.isSupported()).toBe(true);
    });
  });
});