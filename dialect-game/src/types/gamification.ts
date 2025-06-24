/**
 * Types pour le système de gamification adaptative
 * Phase RED TDD - Types définis avant implémentation
 */

// Types de base pour l'analyse comportementale
export interface UserBehaviorData {
  userId: string;
  sessionDuration: number;
  correctAnswers: number;
  totalQuestions: number;
  streakCount: number;
  timeSpentPerQuestion: number[];
  interactionPatterns: string[];
}

export interface EngagementMetrics {
  engagementScore: number;
  difficultyPreference: 'easy' | 'medium' | 'hard';
  learningPattern: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  motivationTriggers: string[];
  riskOfDisengagement: number;
}

// Types pour l'ajustement de difficulté
export interface PerformanceData {
  accuracy: number;
  averageResponseTime: number;
  streakCount: number;
  recentMistakes: string[];
}

export interface DifficultyAdjustment {
  newDifficulty: 'easy' | 'medium' | 'hard';
  adjustmentReason: string;
  suggestedContent: string[];
  confidenceLevel: number;
}

// Types pour la personnalisation
export interface UserProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  interests: string[];
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  goalType: 'conversation' | 'grammar' | 'vocabulary' | 'listening_comprehension';
  timeAvailable: number;
  previousTopics: string[];
}

export interface PersonalizedExperience {
  recommendedTopics: string[];
  contentFormat: string;
  exerciseTypes: string[];
  gamificationElements: string[];
  estimatedDuration: number;
}

// Types pour les métriques d'engagement
export interface UserActivity {
  totalSessions: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  completionRate: number;
  streakDays: number;
  achievementsUnlocked: number;
  socialInteractions: number;
}

export interface ComprehensiveEngagementMetrics {
  overallEngagement: number;
  consistency: number;
  progression: number;
  socialEngagement: number;
  retentionProbability: number;
  recommendationScore: number;
}

// Types pour l'optimisation de gamification
export interface CurrentGamification {
  points: number;
  level: number;
  badges: string[];
  leaderboardPosition: number;
  dailyGoal: number;
  streakCount: number;
}

export interface UserPreferences {
  competitiveMotivation: number;
  achievementMotivation: number;
  progressMotivation: number;
  socialMotivation: number;
}

export interface GamificationOptimization {
  suggestedElements: string[];
  pointsStrategy: string;
  badgeRecommendations: string[];
  levelingStrategy: string;
  socialFeatures: string[];
  estimatedEngagementIncrease: number;
}

// Interfaces pour les services
export interface IBehaviorAnalyzer {
  analyzeEngagement(userData: UserBehaviorData): Promise<EngagementMetrics>;
}

export interface IDifficultyAdjuster {
  calculateOptimalDifficulty(
    currentDifficulty: string,
    performanceData: PerformanceData
  ): Promise<DifficultyAdjustment>;
}

export interface IPersonalizationEngine {
  generatePersonalizedExperience(userProfile: UserProfile): Promise<PersonalizedExperience>;
}

export interface IAdaptiveGamificationService {
  analyzeUserBehavior(userData: UserBehaviorData): Promise<EngagementMetrics>;
  adjustDifficulty(currentDifficulty: string, performanceData: PerformanceData): Promise<DifficultyAdjustment>;
  generatePersonalizedContent(userProfile: UserProfile): Promise<PersonalizedExperience>;
  getEngagementMetrics(userActivity: UserActivity): ComprehensiveEngagementMetrics;
  optimizeGamification(
    currentGamification: CurrentGamification,
    userPreferences: UserPreferences
  ): Promise<GamificationOptimization>;
  analyzeUserBehaviorWithFallback(userData: UserBehaviorData): Promise<EngagementMetrics>;
  getFallbackMetrics(): EngagementMetrics;
  calculateEngagementMetrics(userActivity: UserActivity): ComprehensiveEngagementMetrics;
  optimizeGamificationElements(
    currentGamification: CurrentGamification,
    userPreferences: UserPreferences
  ): Promise<GamificationOptimization>;
}