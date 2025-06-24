import type { ARLearningOverlay } from './ARLearningOverlay';
import type { SpatialAudioManager } from './SpatialAudioManager';
import type { HapticsManager } from './HapticsManager';

/**
 * ImmersiveExperienceEngine - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class ImmersiveExperienceEngine {
  constructor(
    private arLearningOverlay: ARLearningOverlay,
    private spatialAudioManager: SpatialAudioManager,
    private hapticsManager: HapticsManager
  ) {}

  async renderLessonOverlay(context: any): Promise<boolean> {
    if (!context || !context.lessonId) throw new Error('Invalid context');
    return await this.arLearningOverlay.renderOverlay(context);
  }

  async playSpatialAudio(audioId: string, position: { x: number; y: number; z: number }): Promise<boolean> {
    if (!audioId) throw new Error('Invalid audioId');
    return await this.spatialAudioManager.playSpatialAudio(audioId, position);
  }

  async triggerHaptic(interactionType: string): Promise<boolean> {
    return await this.hapticsManager.triggerFeedback(interactionType);
  }

  detectDevice(): string {
    // Mockée dans les tests
    return 'unknown';
  }
}