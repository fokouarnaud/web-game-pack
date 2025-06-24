// tests/unit/ai/PredictiveAIService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PredictiveAIService } from '../../../src/services/ai/PredictiveAIService';
import { LearningPredictor } from '../../../src/services/ai/LearningPredictor';
import { WeaknessDetectionAI } from '../../../src/services/ai/WeaknessDetectionAI';
import { CognitiveOptimizer } from '../../../src/services/ai/CognitiveOptimizer';

// Mocks des dépendances IA
vi.mock('../../../src/services/ai/LearningPredictor');
vi.mock('../../../src/services/ai/WeaknessDetectionAI');
vi.mock('../../../src/services/ai/CognitiveOptimizer');

describe('PredictiveAIService - Phase RED TDD', () => {
  let service: PredictiveAIService;
  let mockLearningPredictor: vi.Mocked<LearningPredictor>;
  let mockWeaknessDetectionAI: vi.Mocked<WeaknessDetectionAI>;
  let mockCognitiveOptimizer: vi.Mocked<CognitiveOptimizer>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLearningPredictor = new LearningPredictor() as vi.Mocked<LearningPredictor>;
    mockWeaknessDetectionAI = new WeaknessDetectionAI() as vi.Mocked<WeaknessDetectionAI>;
    mockCognitiveOptimizer = new CognitiveOptimizer() as vi.Mocked<CognitiveOptimizer>;
    service = new PredictiveAIService(
      mockLearningPredictor,
      mockWeaknessDetectionAI,
      mockCognitiveOptimizer
    );
  });

  describe('Initialisation', () => {
    it('should instantiate with all dependencies', () => {
      expect(service).toBeInstanceOf(PredictiveAIService);
    });
  });

  describe('Prédiction d\'apprentissage', () => {
    it('should predict next best activity for user', async () => {
      const userProfile = { id: 'user1', history: ['lesson1', 'lesson2'] };
      mockLearningPredictor.predictNextActivity.mockResolvedValue('lesson3');

      const result = await service.predictNextActivity(userProfile);

      expect(mockLearningPredictor.predictNextActivity).toHaveBeenCalledWith(userProfile);
      expect(result).toBe('lesson3');
    });

    it('should predict user retention probability', async () => {
      const userProfile = { id: 'user2', history: ['lessonA'] };
      mockLearningPredictor.predictRetention.mockResolvedValue(0.87);

      const result = await service.predictRetention(userProfile);

      expect(mockLearningPredictor.predictRetention).toHaveBeenCalledWith(userProfile);
      expect(result).toBeGreaterThan(0.5);
    });
  });

  describe('Détection de faiblesse', () => {
    it('should detect user weaknesses from activity data', async () => {
      const activityData = { userId: 'user3', scores: [60, 70, 55] };
      mockWeaknessDetectionAI.detectWeaknesses.mockResolvedValue(['grammar', 'listening']);

      const result = await service.detectWeaknesses(activityData);

      expect(mockWeaknessDetectionAI.detectWeaknesses).toHaveBeenCalledWith(activityData);
      expect(result).toContain('grammar');
    });
  });

  describe('Neurofeedback adaptatif', () => {
    it('should generate cognitive feedback for user', async () => {
      const userProfile = { id: 'user4', brainwaveData: [0.1, 0.2, 0.3] };
      mockCognitiveOptimizer.generateFeedback.mockResolvedValue('Take a short break');

      const result = await service.generateCognitiveFeedback(userProfile);

      expect(mockCognitiveOptimizer.generateFeedback).toHaveBeenCalledWith(userProfile);
      expect(result).toBe('Take a short break');
    });
  });

  describe('Robustesse et gestion des erreurs', () => {
    it('should handle prediction errors gracefully', async () => {
      mockLearningPredictor.predictNextActivity.mockRejectedValue(new Error('Prediction error'));
      const userProfile = { id: 'user5', history: [] };

      await expect(service.predictNextActivity(userProfile)).rejects.toThrow('Prediction error');
    });

    it('should handle invalid input for weakness detection', async () => {
      await expect(service.detectWeaknesses(null as any)).rejects.toThrow('Invalid activity data');
    });
  });

  describe('Performance', () => {
    it('should predict next activity in less than 100ms', async () => {
      const userProfile = { id: 'user6', history: ['lessonX'] };
      mockLearningPredictor.predictNextActivity.mockResolvedValue('lessonY');

      const start = Date.now();
      await service.predictNextActivity(userProfile);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});