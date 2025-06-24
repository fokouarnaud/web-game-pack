// tests/unit/immersive/ImmersiveExperienceEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImmersiveExperienceEngine } from '../../../src/services/immersive/ImmersiveExperienceEngine';
import { ARLearningOverlay } from '../../../src/services/immersive/ARLearningOverlay';
import { SpatialAudioManager } from '../../../src/services/immersive/SpatialAudioManager';
import { HapticsManager } from '../../../src/services/immersive/HapticsManager';

// Mocks des dépendances immersives
vi.mock('../../../src/services/immersive/ARLearningOverlay');
vi.mock('../../../src/services/immersive/SpatialAudioManager');
vi.mock('../../../src/services/immersive/HapticsManager');

describe('ImmersiveExperienceEngine - Phase RED TDD', () => {
  let engine: ImmersiveExperienceEngine;
  let mockARLearningOverlay: vi.Mocked<ARLearningOverlay>;
  let mockSpatialAudioManager: vi.Mocked<SpatialAudioManager>;
  let mockHapticsManager: vi.Mocked<HapticsManager>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockARLearningOverlay = new ARLearningOverlay() as vi.Mocked<ARLearningOverlay>;
    mockSpatialAudioManager = new SpatialAudioManager() as vi.Mocked<SpatialAudioManager>;
    mockHapticsManager = new HapticsManager() as vi.Mocked<HapticsManager>;
    engine = new ImmersiveExperienceEngine(
      mockARLearningOverlay,
      mockSpatialAudioManager,
      mockHapticsManager
    );
  });

  describe('Initialisation', () => {
    it('should instantiate with all dependencies', () => {
      expect(engine).toBeInstanceOf(ImmersiveExperienceEngine);
    });
  });

  describe('AR Contextual Overlays', () => {
    it('should render AR overlays for a lesson context', async () => {
      const context = { lessonId: 'L1', position: { x: 1, y: 2, z: 3 } };
      mockARLearningOverlay.renderOverlay.mockResolvedValue(true);

      const result = await engine.renderLessonOverlay(context);

      expect(mockARLearningOverlay.renderOverlay).toHaveBeenCalledWith(context);
      expect(result).toBe(true);
    });
  });

  describe('Spatial Audio', () => {
    it('should play spatial audio for a given position', async () => {
      const audioId = 'AUDIO1';
      const position = { x: 2, y: 0, z: 5 };
      mockSpatialAudioManager.playSpatialAudio.mockResolvedValue(true);

      const result = await engine.playSpatialAudio(audioId, position);

      expect(mockSpatialAudioManager.playSpatialAudio).toHaveBeenCalledWith(audioId, position);
      expect(result).toBe(true);
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback for interaction', async () => {
      const interactionType = 'tap';
      mockHapticsManager.triggerFeedback.mockResolvedValue(true);

      const result = await engine.triggerHaptic(interactionType);

      expect(mockHapticsManager.triggerFeedback).toHaveBeenCalledWith(interactionType);
      expect(result).toBe(true);
    });
  });

  describe('Multi-device Compatibility', () => {
    it('should detect and adapt to VR device', async () => {
      engine.detectDevice = vi.fn().mockReturnValue('vr');
      const device = engine.detectDevice();
      expect(device).toBe('vr');
    });

    it('should detect and adapt to mobile device', async () => {
      engine.detectDevice = vi.fn().mockReturnValue('mobile');
      const device = engine.detectDevice();
      expect(device).toBe('mobile');
    });
  });

  describe('Robustesse et gestion des erreurs', () => {
    it('should handle AR overlay rendering failure gracefully', async () => {
      mockARLearningOverlay.renderOverlay.mockRejectedValue(new Error('AR error'));
      const context = { lessonId: 'L2', position: { x: 0, y: 0, z: 0 } };
      await expect(engine.renderLessonOverlay(context)).rejects.toThrow('AR error');
    });

    it('should throw error on invalid audioId for spatial audio', async () => {
      await expect(engine.playSpatialAudio('', { x: 0, y: 0, z: 0 })).rejects.toThrow('Invalid audioId');
    });
  });

  describe('Performance', () => {
    it('should render overlay and play audio in less than 100ms', async () => {
      const context = { lessonId: 'L3', position: { x: 1, y: 1, z: 1 } };
      mockARLearningOverlay.renderOverlay.mockResolvedValue(true);
      mockSpatialAudioManager.playSpatialAudio.mockResolvedValue(true);

      const start = Date.now();
      await engine.renderLessonOverlay(context);
      await engine.playSpatialAudio('AUDIO2', { x: 1, y: 1, z: 1 });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});