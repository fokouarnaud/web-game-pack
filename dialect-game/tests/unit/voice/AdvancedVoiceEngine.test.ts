// tests/unit/voice/AdvancedVoiceEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdvancedVoiceEngine } from '../../../src/services/voice/AdvancedVoiceEngine';
import { PitchAnalyzer } from '../../../src/services/voice/PitchAnalyzer';
import { EmotionalToneDetector } from '../../../src/services/voice/EmotionalToneDetector';
import { AccentAdaptationEngine } from '../../../src/services/voice/AccentAdaptationEngine';

// Mocks des dépendances
vi.mock('../../../src/services/voice/PitchAnalyzer');
vi.mock('../../../src/services/voice/EmotionalToneDetector');
vi.mock('../../../src/services/voice/AccentAdaptationEngine');

describe('AdvancedVoiceEngine - Phase RED TDD', () => {
  let engine: AdvancedVoiceEngine;
  let mockPitchAnalyzer: vi.Mocked<PitchAnalyzer>;
  let mockEmotionalToneDetector: vi.Mocked<EmotionalToneDetector>;
  let mockAccentAdaptationEngine: vi.Mocked<AccentAdaptationEngine>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPitchAnalyzer = new PitchAnalyzer() as vi.Mocked<PitchAnalyzer>;
    mockEmotionalToneDetector = new EmotionalToneDetector() as vi.Mocked<EmotionalToneDetector>;
    mockAccentAdaptationEngine = new AccentAdaptationEngine() as vi.Mocked<AccentAdaptationEngine>;
    engine = new AdvancedVoiceEngine(
      mockPitchAnalyzer,
      mockEmotionalToneDetector,
      mockAccentAdaptationEngine
    );
  });

  describe('Initialisation', () => {
    it('should instantiate with all dependencies', () => {
      expect(engine).toBeInstanceOf(AdvancedVoiceEngine);
    });
  });

  describe('Reconnaissance multi-accent', () => {
    const accents = ['us', 'uk', 'aus', 'ind', 'can', 'za', 'ie', 'sg'];
    accents.forEach(accent => {
      it(`should recognize speech in ${accent.toUpperCase()} accent`, async () => {
        const audioInput = new Float32Array([0.1, 0.2, 0.3]);
        const expectedText = `Hello from ${accent}`;
        mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue(accent);
        mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
        mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 220, confidence: 0.98 });
        mockEmotionalToneDetector.detect.mockResolvedValue({ emotion: 'neutral', confidence: 0.95 });
        engine.recognizeSpeech = vi.fn().mockResolvedValue(expectedText);

        const result = await engine.processAudio(audioInput);

        expect(mockAccentAdaptationEngine.recognizeAccent).toHaveBeenCalledWith(audioInput);
        expect(mockAccentAdaptationEngine.adaptToAccent).toHaveBeenCalledWith(audioInput, accent);
        expect(engine.recognizeSpeech).toHaveBeenCalledWith(audioInput, accent);
        expect(result.text).toBe(expectedText);
        expect(result.accent).toBe(accent);
        expect(result.pitch).toBe(220);
        expect(result.emotion).toBe('neutral');
      });
    });
  });

  describe('Analyse prosodique', () => {
    it('should analyze pitch and prosody of the audio', async () => {
      const audioInput = new Float32Array([0.2, 0.3, 0.4]);
      mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 245, confidence: 0.99 });
      engine.recognizeSpeech = vi.fn().mockResolvedValue('Test');
      mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue('us');
      mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
      mockEmotionalToneDetector.detect.mockResolvedValue({ emotion: 'happy', confidence: 0.93 });

      const result = await engine.processAudio(audioInput);

      expect(result.pitch).toBe(245);
      expect(result.prosody).toBeDefined();
    });
  });

  describe('Détection émotionnelle', () => {
    it('should detect emotion from the audio', async () => {
      const audioInput = new Float32Array([0.5, 0.6, 0.7]);
      mockEmotionalToneDetector.detect.mockResolvedValue({ emotion: 'sad', confidence: 0.91 });
      engine.recognizeSpeech = vi.fn().mockResolvedValue('Test');
      mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue('uk');
      mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
      mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 180, confidence: 0.97 });

      const result = await engine.processAudio(audioInput);

      expect(result.emotion).toBe('sad');
      expect(result.emotionConfidence).toBeGreaterThan(0.9);
    });

    it('should support at least 5 emotions', async () => {
      const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised'];
      for (const emotion of emotions) {
        const audioInput = new Float32Array([Math.random(), Math.random(), Math.random()]);
        mockEmotionalToneDetector.detect.mockResolvedValue({ emotion, confidence: 0.92 });
        engine.recognizeSpeech = vi.fn().mockResolvedValue('Test');
        mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue('us');
        mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
        mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 200, confidence: 0.95 });

        const result = await engine.processAudio(audioInput);

        expect(result.emotion).toBe(emotion);
      }
    });
  });

  describe('Robustesse et gestion des erreurs', () => {
    it('should handle unrecognized accent gracefully', async () => {
      const audioInput = new Float32Array([0.1, 0.2, 0.3]);
      mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue('unknown');
      mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
      engine.recognizeSpeech = vi.fn().mockResolvedValue('Test');
      mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 210, confidence: 0.9 });
      mockEmotionalToneDetector.detect.mockResolvedValue({ emotion: 'neutral', confidence: 0.9 });

      const result = await engine.processAudio(audioInput);

      expect(result.accent).toBe('unknown');
      expect(result.text).toBe('Test');
    });

    it('should throw error on invalid audio input', async () => {
      await expect(engine.processAudio(null as any)).rejects.toThrow('Invalid audio input');
    });
  });

  describe('Performance', () => {
    it('should process audio and return result in less than 2 seconds', async () => {
      const audioInput = new Float32Array([0.1, 0.2, 0.3]);
      mockAccentAdaptationEngine.recognizeAccent.mockResolvedValue('us');
      mockAccentAdaptationEngine.adaptToAccent.mockResolvedValue(audioInput);
      engine.recognizeSpeech = vi.fn().mockResolvedValue('Test');
      mockPitchAnalyzer.analyze.mockResolvedValue({ pitch: 220, confidence: 0.98 });
      mockEmotionalToneDetector.detect.mockResolvedValue({ emotion: 'neutral', confidence: 0.95 });

      const start = Date.now();
      await engine.processAudio(audioInput);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});