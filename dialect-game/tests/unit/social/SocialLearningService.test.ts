// tests/unit/social/SocialLearningService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialLearningService } from '../../../src/services/social/SocialLearningService';
import { StudyBuddyMatcher } from '../../../src/services/social/StudyBuddyMatcher';
import { CollaborativeQuestEngine } from '../../../src/services/social/CollaborativeQuestEngine';
import { RealtimeLeaderboards } from '../../../src/services/social/RealtimeLeaderboards';

// Mocks des dépendances sociales
vi.mock('../../../src/services/social/StudyBuddyMatcher');
vi.mock('../../../src/services/social/CollaborativeQuestEngine');
vi.mock('../../../src/services/social/RealtimeLeaderboards');

describe('SocialLearningService - Phase RED TDD', () => {
  let service: SocialLearningService;
  let mockMatcher: vi.Mocked<StudyBuddyMatcher>;
  let mockQuestEngine: vi.Mocked<CollaborativeQuestEngine>;
  let mockLeaderboards: vi.Mocked<RealtimeLeaderboards>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMatcher = new StudyBuddyMatcher() as vi.Mocked<StudyBuddyMatcher>;
    mockQuestEngine = new CollaborativeQuestEngine() as vi.Mocked<CollaborativeQuestEngine>;
    mockLeaderboards = new RealtimeLeaderboards() as vi.Mocked<RealtimeLeaderboards>;
    service = new SocialLearningService(
      mockMatcher,
      mockQuestEngine,
      mockLeaderboards
    );
  });

  describe('Initialisation', () => {
    it('should instantiate with all dependencies', () => {
      expect(service).toBeInstanceOf(SocialLearningService);
    });
  });

  describe('Matching IA', () => {
    it('should match user with best study buddy', async () => {
      const userProfile = { id: 'user1', preferences: { topics: ['grammar'] } };
      mockMatcher.matchBuddy.mockResolvedValue({ id: 'user2', score: 0.95 });

      const result = await service.matchBuddy(userProfile);

      expect(mockMatcher.matchBuddy).toHaveBeenCalledWith(userProfile);
      expect(result.id).toBe('user2');
      expect(result.score).toBeGreaterThan(0.9);
    });

    it('should match 90% of users in a batch', async () => {
      const users = [
        { id: 'u1' }, { id: 'u2' }, { id: 'u3' }, { id: 'u4' }, { id: 'u5' }
      ];
      mockMatcher.batchMatch.mockResolvedValue([
        { id: 'u1', buddy: 'u2' }, { id: 'u3', buddy: 'u4' }, { id: 'u5', buddy: null }
      ]);

      const result = await service.batchMatch(users);

      expect(mockMatcher.batchMatch).toHaveBeenCalledWith(users);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Défis collaboratifs temps réel', () => {
    it('should start a collaborative quest for a group', async () => {
      const group = [{ id: 'u1' }, { id: 'u2' }];
      mockQuestEngine.startQuest.mockResolvedValue({ questId: 'Q1', status: 'active' });

      const result = await service.startQuest(group);

      expect(mockQuestEngine.startQuest).toHaveBeenCalledWith(group);
      expect(result.status).toBe('active');
    });

    it('should update quest progress in real time', async () => {
      const questId = 'Q1';
      mockQuestEngine.updateProgress.mockResolvedValue({ questId, progress: 50 });

      const result = await service.updateQuestProgress(questId, 50);

      expect(mockQuestEngine.updateProgress).toHaveBeenCalledWith(questId, 50);
      expect(result.progress).toBe(50);
    });
  });

  describe('Leaderboards temps réel', () => {
    it('should update leaderboard for 1000+ users', async () => {
      const leaderboardData = Array.from({ length: 1000 }, (_, i) => ({ id: `u${i}`, score: Math.random() * 100 }));
      mockLeaderboards.updateLeaderboard.mockResolvedValue(true);

      const result = await service.updateLeaderboard(leaderboardData);

      expect(mockLeaderboards.updateLeaderboard).toHaveBeenCalledWith(leaderboardData);
      expect(result).toBe(true);
    });
  });

  describe('Robustesse et gestion des erreurs', () => {
    it('should handle matching errors gracefully', async () => {
      mockMatcher.matchBuddy.mockRejectedValue(new Error('Matching error'));
      const userProfile = { id: 'userX' };

      await expect(service.matchBuddy(userProfile)).rejects.toThrow('Matching error');
    });

    it('should handle invalid input for quest start', async () => {
      await expect(service.startQuest(null as any)).rejects.toThrow('Invalid group');
    });
  });

  describe('Performance', () => {
    it('should match a buddy in less than 100ms', async () => {
      const userProfile = { id: 'userY', preferences: {} };
      mockMatcher.matchBuddy.mockResolvedValue({ id: 'userZ', score: 0.91 });

      const start = Date.now();
      await service.matchBuddy(userProfile);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});