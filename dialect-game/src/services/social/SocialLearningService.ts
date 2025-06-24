import type { StudyBuddyMatcher } from './StudyBuddyMatcher';
import type { CollaborativeQuestEngine } from './CollaborativeQuestEngine';
import type { RealtimeLeaderboards } from './RealtimeLeaderboards';

/**
 * SocialLearningService - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class SocialLearningService {
  constructor(
    private matcher: StudyBuddyMatcher,
    private questEngine: CollaborativeQuestEngine,
    private leaderboards: RealtimeLeaderboards
  ) {}

  async matchBuddy(userProfile: any): Promise<any> {
    if (!userProfile) throw new Error('Invalid user profile');
    return await this.matcher.matchBuddy(userProfile);
  }

  async batchMatch(users: any[]): Promise<any[]> {
    if (!users) throw new Error('Invalid users');
    return await this.matcher.batchMatch(users);
  }

  async startQuest(group: any[]): Promise<any> {
    if (!group) throw new Error('Invalid group');
    return await this.questEngine.startQuest(group);
  }

  async updateQuestProgress(questId: string, progress: number): Promise<any> {
    return await this.questEngine.updateProgress(questId, progress);
  }

  async updateLeaderboard(leaderboardData: any[]): Promise<boolean> {
    return await this.leaderboards.updateLeaderboard(leaderboardData);
  }
}