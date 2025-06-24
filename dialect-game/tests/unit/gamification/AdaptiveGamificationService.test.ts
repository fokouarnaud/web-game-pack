import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdaptiveGamificationService } from '../../../src/services/gamification/AdaptiveGamificationService';
import { BehaviorAnalyzer } from '../../../src/services/gamification/BehaviorAnalyzer';
import { DifficultyAdjuster } from '../../../src/services/gamification/DifficultyAdjuster';
import { PersonalizationEngine } from '../../../src/services/gamification/PersonalizationEngine';

// Mock des dépendances
vi.mock('../../../src/services/gamification/BehaviorAnalyzer');
vi.mock('../../../src/services/gamification/DifficultyAdjuster');
vi.mock('../../../src/services/gamification/PersonalizationEngine');

describe('AdaptiveGamificationService - Phase RED TDD', () => {
  let service: AdaptiveGamificationService;
  let mockBehaviorAnalyzer: vi.Mocked<BehaviorAnalyzer>;
  let mockDifficultyAdjuster: vi.Mocked<DifficultyAdjuster>;
  let mockPersonalizationEngine: vi.Mocked<PersonalizationEngine>;

  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Créer les instances mockées
    mockBehaviorAnalyzer = new BehaviorAnalyzer() as vi.Mocked<BehaviorAnalyzer>;
    mockDifficultyAdjuster = new DifficultyAdjuster() as vi.Mocked<DifficultyAdjuster>;
    mockPersonalizationEngine = new PersonalizationEngine() as vi.Mocked<PersonalizationEngine>;
    
    // Créer le service avec les mocks
    service = new AdaptiveGamificationService(
      mockBehaviorAnalyzer,
      mockDifficultyAdjuster,
      mockPersonalizationEngine
    );
  });

  describe('Initialisation du service', () => {
    it('should be created with required dependencies', () => {
      expect(service).toBeInstanceOf(AdaptiveGamificationService);
      expect(service).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(service.analyzeUserBehavior).toBeDefined();
      expect(service.adjustDifficulty).toBeDefined();
      expect(service.generatePersonalizedContent).toBeDefined();
      expect(service.getEngagementMetrics).toBeDefined();
      expect(service.optimizeGamification).toBeDefined();
    });
  });

  describe('Analyse comportementale', () => {
    it('should analyze user behavior and return engagement metrics', async () => {
      // Arrange
      const mockUserData = {
        userId: 'user123',
        sessionDuration: 1800, // 30 minutes
        correctAnswers: 15,
        totalQuestions: 20,
        streakCount: 5,
        timeSpentPerQuestion: [45, 30, 60, 40, 35],
        interactionPatterns: ['quick_start', 'consistent_pace', 'focused']
      };

      const expectedMetrics = {
        engagementScore: 0.85,
        difficultyPreference: 'medium',
        learningPattern: 'visual',
        motivationTriggers: ['progress_bars', 'achievements', 'social_comparison'],
        riskOfDisengagement: 0.15
      };

      mockBehaviorAnalyzer.analyzeEngagement.mockResolvedValue(expectedMetrics);

      // Act
      const result = await service.analyzeUserBehavior(mockUserData);

      // Assert
      expect(mockBehaviorAnalyzer.analyzeEngagement).toHaveBeenCalledWith(mockUserData);
      expect(result).toEqual(expectedMetrics);
      expect(result.engagementScore).toBeGreaterThan(0.8);
    });

    it('should handle low engagement scenarios', async () => {
      // Arrange
      const mockLowEngagementData = {
        userId: 'user456',
        sessionDuration: 300, // 5 minutes
        correctAnswers: 2,
        totalQuestions: 10,
        streakCount: 0,
        timeSpentPerQuestion: [120, 90, 150, 200],
        interactionPatterns: ['slow_start', 'frequent_pauses', 'distracted']
      };

      const expectedLowMetrics = {
        engagementScore: 0.25,
        difficultyPreference: 'easy',
        learningPattern: 'kinesthetic',
        motivationTriggers: ['immediate_rewards', 'simple_tasks', 'encouragement'],
        riskOfDisengagement: 0.85
      };

      mockBehaviorAnalyzer.analyzeEngagement.mockResolvedValue(expectedLowMetrics);

      // Act
      const result = await service.analyzeUserBehavior(mockLowEngagementData);

      // Assert
      expect(result.riskOfDisengagement).toBeGreaterThan(0.8);
      expect(result.engagementScore).toBeLessThan(0.3);
      expect(result.motivationTriggers).toContain('immediate_rewards');
    });
  });

  describe('Ajustement de difficulté adaptatif', () => {
    it('should adjust difficulty based on user performance', async () => {
      // Arrange
      const currentDifficulty = 'medium';
      const performanceData = {
        accuracy: 0.65, // 65% de réussite
        averageResponseTime: 45,
        streakCount: 2,
        recentMistakes: ['grammar_tense', 'vocabulary_advanced']
      };

      const expectedAdjustment = {
        newDifficulty: 'easy',
        adjustmentReason: 'low_accuracy',
        suggestedContent: ['basic_grammar', 'common_vocabulary'],
        confidenceLevel: 0.9
      };

      mockDifficultyAdjuster.calculateOptimalDifficulty.mockResolvedValue(expectedAdjustment);

      // Act
      const result = await service.adjustDifficulty(currentDifficulty, performanceData);

      // Assert
      expect(mockDifficultyAdjuster.calculateOptimalDifficulty).toHaveBeenCalledWith(
        currentDifficulty,
        performanceData
      );
      expect(result).toEqual(expectedAdjustment);
      expect(result.newDifficulty).toBe('easy');
    });

    it('should increase difficulty for high performers', async () => {
      // Arrange
      const currentDifficulty = 'medium';
      const highPerformanceData = {
        accuracy: 0.95, // 95% de réussite
        averageResponseTime: 25,
        streakCount: 10,
        recentMistakes: []
      };

      const expectedIncrease = {
        newDifficulty: 'hard',
        adjustmentReason: 'high_accuracy',
        suggestedContent: ['advanced_grammar', 'complex_vocabulary'],
        confidenceLevel: 0.95
      };

      mockDifficultyAdjuster.calculateOptimalDifficulty.mockResolvedValue(expectedIncrease);

      // Act
      const result = await service.adjustDifficulty(currentDifficulty, highPerformanceData);

      // Assert
      expect(result.newDifficulty).toBe('hard');
      expect(result.adjustmentReason).toBe('high_accuracy');
    });

    it('should maintain difficulty for optimal performance', async () => {
      // Arrange
      const currentDifficulty = 'medium';
      const optimalPerformanceData = {
        accuracy: 0.8, // 80% de réussite - optimal
        averageResponseTime: 35,
        streakCount: 5,
        recentMistakes: ['pronunciation_minor']
      };

      const expectedMaintain = {
        newDifficulty: 'medium',
        adjustmentReason: 'optimal_performance',
        suggestedContent: ['current_level_content'],
        confidenceLevel: 0.85
      };

      mockDifficultyAdjuster.calculateOptimalDifficulty.mockResolvedValue(expectedMaintain);

      // Act
      const result = await service.adjustDifficulty(currentDifficulty, optimalPerformanceData);

      // Assert
      expect(result.newDifficulty).toBe('medium');
      expect(result.adjustmentReason).toBe('optimal_performance');
    });
  });

  describe('Moteur de personnalisation', () => {
    it('should generate personalized content based on user profile', async () => {
      // Arrange
      const userProfile = {
        learningStyle: 'visual',
        interests: ['technology', 'travel', 'cooking'],
        proficiencyLevel: 'intermediate',
        goalType: 'conversation',
        timeAvailable: 30,
        previousTopics: ['restaurants', 'directions']
      };

      const expectedPersonalization = {
        recommendedTopics: ['hotel_booking', 'tech_vocabulary', 'cooking_terms'],
        contentFormat: 'interactive_visual',
        exerciseTypes: ['image_matching', 'video_comprehension', 'role_play'],
        gamificationElements: ['progress_visualization', 'topic_badges', 'streak_counter'],
        estimatedDuration: 28
      };

      mockPersonalizationEngine.generatePersonalizedExperience.mockResolvedValue(expectedPersonalization);

      // Act
      const result = await service.generatePersonalizedContent(userProfile);

      // Assert
      expect(mockPersonalizationEngine.generatePersonalizedExperience).toHaveBeenCalledWith(userProfile);
      expect(result).toEqual(expectedPersonalization);
      expect(result.contentFormat).toBe('interactive_visual');
      expect(result.recommendedTopics).toContain('tech_vocabulary');
    });

    it('should adapt content for different learning styles', async () => {
      // Arrange
      const auditoryUserProfile = {
        learningStyle: 'auditory',
        interests: ['music', 'podcasts'],
        proficiencyLevel: 'beginner',
        goalType: 'listening_comprehension',
        timeAvailable: 15,
        previousTopics: ['greetings']
      };

      const expectedAuditoryPersonalization = {
        recommendedTopics: ['music_vocabulary', 'basic_conversations'],
        contentFormat: 'audio_focused',
        exerciseTypes: ['listening_comprehension', 'pronunciation_practice', 'audio_matching'],
        gamificationElements: ['audio_badges', 'listening_streaks', 'pronunciation_scores'],
        estimatedDuration: 14
      };

      mockPersonalizationEngine.generatePersonalizedExperience.mockResolvedValue(expectedAuditoryPersonalization);

      // Act
      const result = await service.generatePersonalizedContent(auditoryUserProfile);

      // Assert
      expect(result.contentFormat).toBe('audio_focused');
      expect(result.exerciseTypes).toContain('pronunciation_practice');
    });
  });

  describe('Métriques d\'engagement', () => {
    it('should calculate comprehensive engagement metrics', () => {
      // Arrange
      const userActivity = {
        totalSessions: 25,
        totalTimeSpent: 15000, // 4.17 heures
        averageSessionDuration: 600, // 10 minutes
        completionRate: 0.88,
        streakDays: 7,
        achievementsUnlocked: 12,
        socialInteractions: 5
      };

      const expectedMetrics = {
        overallEngagement: 0.82,
        consistency: 0.9,
        progression: 0.85,
        socialEngagement: 0.6,
        retentionProbability: 0.87,
        recommendationScore: 9.2
      };

      // Act
      const result = service.getEngagementMetrics(userActivity);

      // Assert
      expect(result).toBeDefined();
      expect(result.overallEngagement).toBeGreaterThan(0.8);
      expect(result.retentionProbability).toBeGreaterThan(0.85);
    });
  });

  describe('Optimisation de gamification', () => {
    it('should optimize gamification elements for maximum engagement', async () => {
      // Arrange
      const currentGamification = {
        points: 850,
        level: 5,
        badges: ['first_lesson', 'week_streak', 'perfect_score'],
        leaderboardPosition: 15,
        dailyGoal: 20,
        streakCount: 7
      };

      const userPreferences = {
        competitiveMotivation: 0.8,
        achievementMotivation: 0.9,
        progressMotivation: 0.7,
        socialMotivation: 0.6
      };

      const expectedOptimization = {
        suggestedElements: ['achievement_showcase', 'progress_visualization', 'competitive_challenges'],
        pointsStrategy: 'achievement_focused',
        badgeRecommendations: ['grammar_master', 'vocabulary_champion'],
        levelingStrategy: 'steady_progression',
        socialFeatures: ['study_groups', 'peer_challenges'],
        estimatedEngagementIncrease: 0.25
      };

      // Act
      const result = await service.optimizeGamification(currentGamification, userPreferences);

      // Assert
      expect(result).toBeDefined();
      expect(result.estimatedEngagementIncrease).toBeGreaterThan(0.2);
      expect(result.suggestedElements).toContain('achievement_showcase');
    });
  });

  describe('Gestion des erreurs et cas limites', () => {
    it('should handle invalid user data gracefully', async () => {
      // Arrange
      const invalidUserData = {
        userId: null,
        sessionDuration: -1,
        correctAnswers: 'invalid',
        totalQuestions: 0
      };

      mockBehaviorAnalyzer.analyzeEngagement.mockRejectedValue(new Error('Invalid user data'));

      // Act & Assert
      await expect(service.analyzeUserBehavior(invalidUserData as any))
        .rejects.toThrow('Invalid user data');
    });

    it('should handle service failures with fallback', async () => {
      // Arrange
      const validUserData = {
        userId: 'user123',
        sessionDuration: 1800,
        correctAnswers: 15,
        totalQuestions: 20,
        streakCount: 5,
        timeSpentPerQuestion: [45, 30, 60],
        interactionPatterns: ['consistent']
      };

      const fallbackMetrics = {
        engagementScore: 0.5,
        difficultyPreference: 'medium',
        learningPattern: 'mixed',
        motivationTriggers: ['progress_bars'],
        riskOfDisengagement: 0.5
      };

      mockBehaviorAnalyzer.analyzeEngagement.mockRejectedValue(new Error('Service unavailable'));

      // Act
      const result = await service.analyzeUserBehaviorWithFallback(validUserData);

      // Assert
      expect(result).toBeDefined();
      expect(result.engagementScore).toBe(0.5);
      expect(result.difficultyPreference).toBe('medium');
    });
  });

  describe('Performance et optimisation', () => {
    it('should complete analysis within performance threshold', async () => {
      // Arrange
      const startTime = Date.now();
      const userData = {
        userId: 'user123',
        sessionDuration: 1800,
        correctAnswers: 15,
        totalQuestions: 20,
        streakCount: 5,
        timeSpentPerQuestion: [45, 30, 60],
        interactionPatterns: ['consistent']
      };

      const metrics = {
        engagementScore: 0.85,
        difficultyPreference: 'medium',
        learningPattern: 'visual',
        motivationTriggers: ['progress_bars'],
        riskOfDisengagement: 0.15
      };

      mockBehaviorAnalyzer.analyzeEngagement.mockResolvedValue(metrics);

      // Act
      await service.analyzeUserBehavior(userData);
      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // < 100ms selon les specs
    });
  });
});