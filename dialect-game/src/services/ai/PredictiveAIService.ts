import type { LearningPredictor } from './LearningPredictor';
import type { WeaknessDetectionAI } from './WeaknessDetectionAI';
import type { CognitiveOptimizer } from './CognitiveOptimizer';

/**
 * PredictiveAIService - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class PredictiveAIService {
  constructor(
    private learningPredictor: LearningPredictor,
    private weaknessDetectionAI: WeaknessDetectionAI,
    private cognitiveOptimizer: CognitiveOptimizer
  ) {}

  async predictNextActivity(userProfile: any): Promise<string> {
    if (!userProfile) throw new Error('Invalid user profile');
    return await this.learningPredictor.predictNextActivity(userProfile);
  }

  async predictRetention(userProfile: any): Promise<number> {
    if (!userProfile) throw new Error('Invalid user profile');
    return await this.learningPredictor.predictRetention(userProfile);
  }

  async detectWeaknesses(activityData: any): Promise<string[]> {
    if (!activityData) throw new Error('Invalid activity data');
    return await this.weaknessDetectionAI.detectWeaknesses(activityData);
  }

  async generateCognitiveFeedback(userProfile: any): Promise<string> {
    if (!userProfile) throw new Error('Invalid user profile');
    return await this.cognitiveOptimizer.generateFeedback(userProfile);
  }
}