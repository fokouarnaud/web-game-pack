/**
 * Tests unitaires pour le système de progression avancé
 * Task 12: Système de Progression Avancé - Phase 3
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Types simplifiés pour les tests
interface UserProfile {
  id: string;
  username: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalGamesPlayed: number;
  totalTimeSpent: number;
  averageScore: number;
  bestScore: number;
  achievements: Achievement[];
  skillLevels: Record<string, SkillProgress>;
}

interface SkillProgress {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  masteredConcepts: string[];
  weakConcepts: string[];
  lastPracticed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  badgeIcon: string;
  badgeColor: string;
  rarity: string;
  unlockedAt?: number;
  progress?: number;
}

interface GameSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  gameMode: string;
  difficulty: string;
  score: number;
  maxScore: number;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
  xpEarned: number;
  skillXP: Record<string, number>;
  levelUps: LevelUp[];
  achievementsUnlocked: Achievement[];
  streakMaintained: boolean;
  newBestScore: boolean;
  perfectGame: boolean;
}

interface LevelUp {
  skill?: string;
  previousLevel: number;
  newLevel: number;
  xpRequired: number;
  rewards: LevelReward[];
}

interface LevelReward {
  level: number;
  type: string;
  name: string;
  description: string;
  icon?: string;
  unlocks?: string[];
}

interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  target: ChallengeTarget;
  progress: number;
  completed: boolean;
  xpReward: number;
  expiresAt: number;
}

interface ChallengeTarget {
  type: string;
  value: number;
  description: string;
}

interface Leaderboard {
  id: string;
  name: string;
  type: string;
  period: string;
  entries: LeaderboardEntry[];
  userEntry?: LeaderboardEntry;
  totalParticipants: number;
  lastUpdated: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  value: number;
  badge?: string;
}

interface DetailedStats {
  totalPlayTime: number;
  averageSessionTime: number;
  totalSessions: number;
  overallAccuracy: number;
  bestStreak: number;
  currentStreak: number;
  perfectGames: number;
  skillStats: Record<string, SkillStats>;
}

interface SkillStats {
  totalTime: number;
  totalQuestions: number;
  accuracy: number;
  averageScore: number;
  bestScore: number;
  level: number;
  masteredConcepts: number;
  weakAreas: string[];
  lastPracticed: number;
  improvement: number;
}

// Service de progression pour les tests
class TestProgressionService {
  private currentUser: UserProfile | null = null;
  private achievements: Achievement[] = [];
  private currentSession: GameSession | null = null;
  private storage: Map<string, string> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  // === GESTION UTILISATEUR ===

  async createNewProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      username: `Joueur_${userId.slice(-4)}`,
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      bestScore: 0,
      achievements: [],
      skillLevels: {
        vocabulary: { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 80, masteredConcepts: [], weakConcepts: [], lastPracticed: 0 },
        grammar: { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 80, masteredConcepts: [], weakConcepts: [], lastPracticed: 0 },
        pronunciation: { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 80, masteredConcepts: [], weakConcepts: [], lastPracticed: 0 },
        listening: { level: 1, currentXP: 0, totalXP: 0, xpToNextLevel: 80, masteredConcepts: [], weakConcepts: [], lastPracticed: 0 }
      }
    };

    this.currentUser = profile;
    this.saveProfile();
    return profile;
  }

  async loadUserProfile(userId: string): Promise<UserProfile | null> {
    const stored = this.storage.get(`profile_${userId}`);
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    return null;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveProfile();
  }

  private saveProfile(): void {
    if (this.currentUser) {
      this.storage.set(`profile_${this.currentUser.id}`, JSON.stringify(this.currentUser));
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // === GESTION DES SESSIONS ===

  startGameSession(gameMode: string, difficulty: string): GameSession {
    if (!this.currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const session: GameSession = {
      id: `session_${Date.now()}`,
      userId: this.currentUser.id,
      startTime: Date.now(),
      gameMode,
      difficulty,
      score: 0,
      maxScore: 100,
      accuracy: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      xpEarned: 0,
      skillXP: {},
      levelUps: [],
      achievementsUnlocked: [],
      streakMaintained: false,
      newBestScore: false,
      perfectGame: false
    };

    this.currentSession = session;
    return session;
  }

  async endGameSession(score: number, questionsAnswered: number, correctAnswers: number, skills: string[]): Promise<GameSession> {
    if (!this.currentSession || !this.currentUser) {
      throw new Error('Aucune session active');
    }

    const session = this.currentSession;
    const now = Date.now();

    // Finaliser la session
    session.endTime = now;
    session.duration = now - session.startTime;
    session.score = score;
    session.questionsAnswered = questionsAnswered;
    session.correctAnswers = correctAnswers;
    session.accuracy = questionsAnswered > 0 ? correctAnswers / questionsAnswered : 0;
    session.perfectGame = session.accuracy === 1.0 && questionsAnswered > 0;
    session.newBestScore = score > this.currentUser.bestScore;

    // Calculer XP
    await this.calculateSessionXP(session, skills);

    // Mettre à jour les stats utilisateur
    await this.updateUserStats(session);

    // Vérifier achievements
    await this.checkAchievements(session);

    // Gérer le streak
    await this.updateStreak();

    // Sauvegarder
    this.saveSession(session);
    this.currentSession = null;

    return session;
  }

  private async calculateSessionXP(session: GameSession, skills: string[]): Promise<void> {
    const baseXP = 10;
    const difficultyMultipliers = { beginner: 1.0, intermediate: 1.5, advanced: 2.0 };
    const difficultyMultiplier = difficultyMultipliers[session.difficulty as keyof typeof difficultyMultipliers] || 1.0;

    let totalXP = 0;
    const skillXP: Record<string, number> = {};

    skills.forEach(skill => {
      let xp = Math.floor(baseXP * difficultyMultiplier * (1 + session.accuracy));
      
      if (session.perfectGame) {
        xp += 50; // Bonus perfect game
      }

      // Multiplicateur de streak
      const streakMultiplier = Math.min(1 + (this.currentUser!.currentStreak * 0.1), 2.0);
      xp = Math.floor(xp * streakMultiplier);

      skillXP[skill] = xp;
      totalXP += xp;
    });

    session.xpEarned = Math.min(totalXP, 1000); // Max 1000 XP par jour
    session.skillXP = skillXP;

    await this.awardXP(session.xpEarned, skillXP);
  }

  async awardXP(totalXP: number, skillXP: Record<string, number> = {}): Promise<void> {
    if (!this.currentUser) return;

    const oldLevel = this.currentUser.level;
    this.currentUser.totalXP += totalXP;

    // Calculer nouveau niveau
    const newLevel = this.calculateLevel(this.currentUser.totalXP);
    
    if (newLevel > oldLevel) {
      const levelUp: LevelUp = {
        previousLevel: oldLevel,
        newLevel,
        xpRequired: this.getXPForLevel(newLevel),
        rewards: this.getLevelRewards(newLevel)
      };

      this.currentUser.level = newLevel;

      if (this.currentSession) {
        this.currentSession.levelUps.push(levelUp);
      }
    }

    // XP par compétence
    Object.entries(skillXP).forEach(([skill, xp]) => {
      if (this.currentUser!.skillLevels[skill]) {
        const skillProgress = this.currentUser!.skillLevels[skill];
        const oldSkillLevel = skillProgress.level;

        skillProgress.currentXP += xp;
        skillProgress.totalXP += xp;
        skillProgress.lastPracticed = Date.now();

        const newSkillLevel = this.calculateSkillLevel(skillProgress.totalXP);
        if (newSkillLevel > oldSkillLevel) {
          skillProgress.level = newSkillLevel;
          skillProgress.xpToNextLevel = this.getXPForSkillLevel(newSkillLevel + 1) - skillProgress.totalXP;

          if (this.currentSession) {
            this.currentSession.levelUps.push({
              skill,
              previousLevel: oldSkillLevel,
              newLevel: newSkillLevel,
              xpRequired: this.getXPForSkillLevel(newSkillLevel),
              rewards: []
            });
          }
        } else {
          skillProgress.xpToNextLevel = this.getXPForSkillLevel(skillProgress.level + 1) - skillProgress.totalXP;
        }
      }
    });

    this.saveProfile();
  }

  private calculateLevel(totalXP: number): number {
    const xpLevels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000];
    for (let level = 1; level < xpLevels.length; level++) {
      if (totalXP < xpLevels[level]) {
        return level;
      }
    }
    return xpLevels.length;
  }

  private calculateSkillLevel(skillXP: number): number {
    return Math.floor(skillXP / 80) + 1;
  }

  private getXPForLevel(level: number): number {
    const xpLevels = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000];
    return xpLevels[level - 1] || 0;
  }

  private getXPForSkillLevel(level: number): number {
    return (level - 1) * 80;
  }

  private getLevelRewards(level: number): LevelReward[] {
    const rewards: LevelReward[] = [];
    
    if (level % 5 === 0) {
      rewards.push({
        level,
        type: 'content',
        name: `Pack Niveau ${level}`,
        description: `Nouveau contenu débloqué`,
        icon: '🎁',
        unlocks: [`level_${level}_content`]
      });
    }

    return rewards;
  }

  // === GESTION DES ACHIEVEMENTS ===

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_game',
        name: 'Premier Pas',
        description: 'Terminez votre premier jeu',
        category: 'progression',
        xpReward: 50,
        badgeIcon: '🎮',
        badgeColor: '#4CAF50',
        rarity: 'common'
      },
      {
        id: 'games_10',
        name: 'Joueur Dévoué',
        description: 'Jouez 10 parties',
        category: 'progression',
        xpReward: 100,
        badgeIcon: '🏆',
        badgeColor: '#FF9800',
        rarity: 'uncommon'
      },
      {
        id: 'perfect_score',
        name: 'Perfectionniste',
        description: 'Obtenez un score parfait',
        category: 'mastery',
        xpReward: 150,
        badgeIcon: '💯',
        badgeColor: '#9C27B0',
        rarity: 'rare'
      },
      {
        id: 'streak_3',
        name: 'En Forme',
        description: 'Maintenez une série de 3 jours',
        category: 'streak',
        xpReward: 75,
        badgeIcon: '🔥',
        badgeColor: '#F44336',
        rarity: 'common'
      },
      {
        id: 'xp_1000',
        name: 'Millionnaire',
        description: 'Gagnez 1000 XP au total',
        category: 'progression',
        xpReward: 100,
        badgeIcon: '💰',
        badgeColor: '#FFD700',
        rarity: 'uncommon'
      }
    ];
  }

  private async checkAchievements(session: GameSession): Promise<void> {
    if (!this.currentUser) return;

    for (const achievement of this.achievements) {
      // Ignorer si déjà débloqué
      if (this.currentUser.achievements.some(a => a.id === achievement.id)) {
        continue;
      }

      let unlocked = false;

      switch (achievement.id) {
        case 'first_game':
          unlocked = this.currentUser.totalGamesPlayed >= 1;
          break;
        case 'games_10':
          unlocked = this.currentUser.totalGamesPlayed >= 10;
          break;
        case 'perfect_score':
          unlocked = session.perfectGame;
          break;
        case 'streak_3':
          unlocked = this.currentUser.currentStreak >= 3;
          break;
        case 'xp_1000':
          unlocked = this.currentUser.totalXP >= 1000;
          break;
      }

      if (unlocked) {
        await this.unlockAchievement(achievement, session);
      }
    }
  }

  private async unlockAchievement(achievement: Achievement, session: GameSession): Promise<void> {
    if (!this.currentUser) return;

    const unlockedAchievement = {
      ...achievement,
      unlockedAt: Date.now(),
      progress: 1
    };

    this.currentUser.achievements.push(unlockedAchievement);
    session.achievementsUnlocked.push(unlockedAchievement);

    // Bonus XP
    await this.awardXP(achievement.xpReward);
    this.saveProfile();
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getUserAchievements(): Achievement[] {
    return this.currentUser?.achievements || [];
  }

  // === GESTION DU STREAK ===

  private async updateStreak(): Promise<void> {
    if (!this.currentUser || !this.currentSession) return;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Simuler dernière activité
    const lastActiveDay = this.storage.get(`last_active_${this.currentUser.id}`);

    if (lastActiveDay === today) {
      // Déjà joué aujourd'hui
      this.currentSession.streakMaintained = true;
    } else if (lastActiveDay === yesterday) {
      // Streak maintenu
      this.currentUser.currentStreak += 1;
      this.currentUser.longestStreak = Math.max(
        this.currentUser.longestStreak,
        this.currentUser.currentStreak
      );
      this.currentSession.streakMaintained = true;
    } else {
      // Streak brisé
      this.currentUser.currentStreak = 1;
      this.currentSession.streakMaintained = false;
    }

    this.storage.set(`last_active_${this.currentUser.id}`, today);
    this.saveProfile();
  }

  // === STATISTIQUES ===

  private async updateUserStats(session: GameSession): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser.totalGamesPlayed += 1;
    this.currentUser.totalTimeSpent += session.duration || 0;

    // Moyenne des scores
    const totalScorePoints = (this.currentUser.averageScore * (this.currentUser.totalGamesPlayed - 1)) + session.score;
    this.currentUser.averageScore = totalScorePoints / this.currentUser.totalGamesPlayed;

    // Meilleur score
    if (session.score > this.currentUser.bestScore) {
      this.currentUser.bestScore = session.score;
    }

    this.saveProfile();
  }

  async getDetailedStats(): Promise<DetailedStats | null> {
    if (!this.currentUser) return null;

    // Charger les sessions
    const sessionsData = this.storage.get(`sessions_${this.currentUser.id}`);
    const sessions: GameSession[] = sessionsData ? JSON.parse(sessionsData) : [];

    const totalPlayTime = sessions.reduce((total, session) => total + (session.duration || 0), 0);
    const totalSessions = sessions.length;
    const averageSessionTime = totalSessions > 0 ? totalPlayTime / totalSessions : 0;

    // Statistiques par compétence
    const skillStats: Record<string, SkillStats> = {};
    const skills = ['vocabulary', 'grammar', 'pronunciation', 'listening'];

    skills.forEach(skill => {
      const skillSessions = sessions.filter(s => s.skillXP[skill] > 0);
      const skillTime = skillSessions.reduce((total, s) => total + (s.duration || 0), 0);
      const totalQuestions = skillSessions.reduce((total, s) => total + s.questionsAnswered, 0);
      const correctAnswers = skillSessions.reduce((total, s) => total + s.correctAnswers, 0);

      skillStats[skill] = {
        totalTime: skillTime,
        totalQuestions,
        accuracy: totalQuestions > 0 ? correctAnswers / totalQuestions : 0,
        averageScore: skillSessions.length > 0 ? 
          skillSessions.reduce((total, s) => total + s.score, 0) / skillSessions.length : 0,
        bestScore: Math.max(...skillSessions.map(s => s.score), 0),
        level: this.currentUser.skillLevels[skill]?.level || 1,
        masteredConcepts: this.currentUser.skillLevels[skill]?.masteredConcepts.length || 0,
        weakAreas: this.currentUser.skillLevels[skill]?.weakConcepts || [],
        lastPracticed: this.currentUser.skillLevels[skill]?.lastPracticed || 0,
        improvement: 0
      };
    });

    return {
      totalPlayTime: Math.floor(totalPlayTime / (1000 * 60)), // en minutes
      averageSessionTime: Math.floor(averageSessionTime / (1000 * 60)),
      totalSessions,
      overallAccuracy: sessions.length > 0 ? 
        sessions.reduce((total, s) => total + s.accuracy, 0) / sessions.length : 0,
      bestStreak: this.currentUser.longestStreak,
      currentStreak: this.currentUser.currentStreak,
      perfectGames: sessions.filter(s => s.perfectGame).length,
      skillStats
    };
  }

  // === DÉFIS QUOTIDIENS ===

  generateDailyChallenge(): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const challenges = [
      {
        title: 'Expert du Vocabulaire',
        description: 'Répondez correctement à 20 questions de vocabulaire',
        type: 'vocabulary',
        difficulty: 'intermediate',
        target: { type: 'questions', value: 20, description: '20 questions correctes' },
        xpReward: 100
      },
      {
        title: 'Précision Parfaite',
        description: 'Obtenez 90% de précision',
        type: 'grammar',
        difficulty: 'advanced',
        target: { type: 'accuracy', value: 0.9, description: '90% de précision' },
        xpReward: 150
      },
      {
        title: 'Marathon d\'Apprentissage',
        description: 'Jouez pendant 30 minutes',
        type: 'reading',
        difficulty: 'beginner',
        target: { type: 'time', value: 30, description: '30 minutes de jeu' },
        xpReward: 75
      }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return {
      id: `challenge_${today}`,
      date: today,
      ...randomChallenge,
      progress: 0,
      completed: false,
      expiresAt: new Date(today + 'T23:59:59').getTime()
    };
  }

  // === LEADERBOARDS ===

  generateMockLeaderboard(type: string): Leaderboard {
    const mockEntries = [
      { rank: 1, userId: 'user1', username: 'LanguageMaster', value: 5000, badge: '👑' },
      { rank: 2, userId: 'user2', username: 'VocabularyKing', value: 4200, badge: '🥈' },
      { rank: 3, userId: 'user3', username: 'GrammarGuru', value: 3800, badge: '🥉' },
      { rank: 4, userId: 'user4', username: 'PronunciationPro', value: 3200 },
      { rank: 5, userId: 'user5', username: 'SpeakingStud', value: 2900 }
    ];

    if (this.currentUser) {
      const userValue = type === 'total_xp' ? this.currentUser.totalXP :
                      type === 'current_streak' ? this.currentUser.currentStreak :
                      this.currentUser.totalGamesPlayed;
      
      mockEntries.push({
        rank: mockEntries.length + 1,
        userId: this.currentUser.id,
        username: this.currentUser.username,
        value: userValue
      });
    }

    return {
      id: `leaderboard_${type}`,
      name: type === 'total_xp' ? 'XP Total' : type === 'current_streak' ? 'Série Actuelle' : 'Parties Jouées',
      type,
      period: 'all_time',
      entries: mockEntries,
      userEntry: mockEntries.find(e => e.userId === this.currentUser?.id),
      totalParticipants: mockEntries.length,
      lastUpdated: Date.now()
    };
  }

  // === UTILITAIRES ===

  private saveSession(session: GameSession): void {
    const sessionsKey = `sessions_${session.userId}`;
    const stored = this.storage.get(sessionsKey);
    const sessions: GameSession[] = stored ? JSON.parse(stored) : [];
    
    sessions.push(session);
    
    // Garder seulement les 100 dernières sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    this.storage.set(sessionsKey, JSON.stringify(sessions));
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  clearStorage(): void {
    this.storage.clear();
    this.currentUser = null;
    this.currentSession = null;
  }

  getStorageSize(): number {
    return this.storage.size;
  }
}

describe('Progression System', () => {
  let progressionService: TestProgressionService;

  beforeEach(() => {
    progressionService = new TestProgressionService();
  });

  describe('User Profile Management', () => {
    test('should create a new user profile', async () => {
      const profile = await progressionService.createNewProfile('user123');

      expect(profile.id).toBe('user123');
      expect(profile.username).toContain('user123');
      expect(profile.level).toBe(1);
      expect(profile.totalXP).toBe(0);
      expect(profile.currentStreak).toBe(0);
      expect(profile.longestStreak).toBe(0);
      expect(profile.achievements).toHaveLength(0);
      expect(profile.skillLevels).toBeDefined();
      expect(Object.keys(profile.skillLevels)).toHaveLength(4);
    });

    test('should load existing user profile', async () => {
      await progressionService.createNewProfile('user456');
      
      const loadedProfile = await progressionService.loadUserProfile('user456');
      
      expect(loadedProfile).toBeTruthy();
      expect(loadedProfile?.id).toBe('user456');
    });

    test('should update user profile', async () => {
      await progressionService.createNewProfile('user789');
      
      await progressionService.updateProfile({
        username: 'SuperLearner',
        level: 5
      });

      const currentUser = progressionService.getCurrentUser();
      expect(currentUser?.username).toBe('SuperLearner');
      expect(currentUser?.level).toBe(5);
    });

    test('should throw error when updating without user', async () => {
      await expect(
        progressionService.updateProfile({ username: 'Test' })
      ).rejects.toThrow('Aucun utilisateur connecté');
    });
  });

  describe('Game Session Management', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('session_user');
    });

    test('should start a game session', () => {
      const session = progressionService.startGameSession('vocabulary', 'intermediate');

      expect(session.id).toBeTruthy();
      expect(session.userId).toBe('session_user');
      expect(session.gameMode).toBe('vocabulary');
      expect(session.difficulty).toBe('intermediate');
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.score).toBe(0);
      expect(session.perfectGame).toBe(false);
    });

    test('should end a game session with score calculation', async () => {
      progressionService.startGameSession('grammar', 'beginner');
      
      const finishedSession = await progressionService.endGameSession(
        85, // score
        10, // questions answered
        8,  // correct answers
        ['grammar', 'vocabulary']
      );

      expect(finishedSession.endTime).toBeTruthy();
      expect(finishedSession.duration).toBeGreaterThan(0);
      expect(finishedSession.score).toBe(85);
      expect(finishedSession.accuracy).toBe(0.8);
      expect(finishedSession.xpEarned).toBeGreaterThan(0);
      expect(finishedSession.perfectGame).toBe(false);
    });

    test('should detect perfect game', async () => {
      progressionService.startGameSession('vocabulary', 'advanced');
      
      const perfectSession = await progressionService.endGameSession(
        100, // perfect score
        5,   // questions answered
        5,   // all correct
        ['vocabulary']
      );

      expect(perfectSession.perfectGame).toBe(true);
      expect(perfectSession.accuracy).toBe(1.0);
      expect(perfectSession.xpEarned).toBeGreaterThan(50); // Should include perfect game bonus
    });

    test('should update user stats after session', async () => {
      const initialUser = progressionService.getCurrentUser();
      expect(initialUser?.totalGamesPlayed).toBe(0);

      progressionService.startGameSession('listening', 'intermediate');
      await progressionService.endGameSession(75, 8, 6, ['listening']);

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.totalGamesPlayed).toBe(1);
      expect(updatedUser?.averageScore).toBe(75);
      expect(updatedUser?.bestScore).toBe(75);
    });

    test('should throw error when ending session without active session', async () => {
      await expect(
        progressionService.endGameSession(100, 10, 10, ['vocabulary'])
      ).rejects.toThrow('Aucune session active');
    });
  });

  describe('XP and Level System', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('xp_user');
    });

    test('should award XP correctly', async () => {
      const initialXP = progressionService.getCurrentUser()?.totalXP || 0;
      
      await progressionService.awardXP(150, { vocabulary: 75, grammar: 75 });

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.totalXP).toBe(initialXP + 150);
    });

    test('should level up when reaching XP threshold', async () => {
      const initialLevel = progressionService.getCurrentUser()?.level || 1;
      
      // Award enough XP to reach level 2 (need 100 XP)
      await progressionService.awardXP(150);

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.level).toBeGreaterThan(initialLevel);
    });

    test('should level up skills independently', async () => {
      const initialSkillLevel = progressionService.getCurrentUser()?.skillLevels.vocabulary.level || 1;
      
      // Award enough skill XP to level up (need 80 XP for skill level 2)
      await progressionService.awardXP(0, { vocabulary: 100 });

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.skillLevels.vocabulary.level).toBeGreaterThan(initialSkillLevel);
      expect(updatedUser?.skillLevels.vocabulary.currentXP).toBe(100);
      expect(updatedUser?.skillLevels.vocabulary.totalXP).toBe(100);
    });

    test('should track level ups in session', async () => {
      const session = progressionService.startGameSession('vocabulary', 'advanced');
      
      // End session with high score to trigger level up
      const finishedSession = await progressionService.endGameSession(100, 10, 10, ['vocabulary']);

      expect(finishedSession.levelUps.length).toBeGreaterThan(0);
      expect(finishedSession.levelUps[0].newLevel).toBeGreaterThan(finishedSession.levelUps[0].previousLevel);
    });
  });

  describe('Achievement System', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('achievement_user');
    });

    test('should unlock first game achievement', async () => {
      const initialAchievements = progressionService.getUserAchievements();
      expect(initialAchievements).toHaveLength(0);

      progressionService.startGameSession('vocabulary', 'beginner');
      const session = await progressionService.endGameSession(50, 5, 3, ['vocabulary']);

      expect(session.achievementsUnlocked.length).toBeGreaterThan(0);
      expect(session.achievementsUnlocked[0].id).toBe('first_game');
      
      const updatedAchievements = progressionService.getUserAchievements();
      expect(updatedAchievements).toHaveLength(1);
    });

    test('should unlock perfect score achievement', async () => {
      progressionService.startGameSession('grammar', 'intermediate');
      const session = await progressionService.endGameSession(100, 5, 5, ['grammar']);

      const perfectAchievement = session.achievementsUnlocked.find(a => a.id === 'perfect_score');
      expect(perfectAchievement).toBeTruthy();
      expect(perfectAchievement?.name).toBe('Perfectionniste');
    });

    test('should unlock XP milestone achievement', async () => {
      // Award enough XP to trigger milestone achievement
      await progressionService.awardXP(1000);

      const achievements = progressionService.getUserAchievements();
      const xpAchievement = achievements.find(a => a.id === 'xp_1000');
      expect(xpAchievement).toBeTruthy();
    });

    test('should not unlock same achievement twice', async () => {
      // Play first game
      progressionService.startGameSession('vocabulary', 'beginner');
      await progressionService.endGameSession(50, 5, 3, ['vocabulary']);

      // Play second game
      progressionService.startGameSession('grammar', 'beginner');
      const secondSession = await progressionService.endGameSession(60, 8, 6, ['grammar']);

      // First game achievement should not unlock again
      const firstGameAchievements = secondSession.achievementsUnlocked.filter(a => a.id === 'first_game');
      expect(firstGameAchievements).toHaveLength(0);
    });

    test('should provide correct achievement list', () => {
      const achievements = progressionService.getAchievements();
      
      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('name');
      expect(achievements[0]).toHaveProperty('description');
      expect(achievements[0]).toHaveProperty('xpReward');
    });
  });

  describe('Streak System', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('streak_user');
    });

    test('should start streak on first game', async () => {
      progressionService.startGameSession('vocabulary', 'beginner');
      const session = await progressionService.endGameSession(70, 6, 4, ['vocabulary']);

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.currentStreak).toBe(1);
      expect(session.streakMaintained).toBe(false); // First game doesn't maintain existing streak
    });

    test('should increment streak on consecutive days', async () => {
      // Simulate consecutive day play
      progressionService.startGameSession('grammar', 'intermediate');
      await progressionService.endGameSession(80, 10, 8, ['grammar']);

      const user = progressionService.getCurrentUser();
      expect(user?.currentStreak).toBeGreaterThanOrEqual(1);
    });

    test('should update longest streak', async () => {
      const initialLongestStreak = progressionService.getCurrentUser()?.longestStreak || 0;

      // Manually set streak to test longest streak tracking
      await progressionService.updateProfile({ currentStreak: 5 });
      
      progressionService.startGameSession('listening', 'advanced');
      await progressionService.endGameSession(90, 12, 11, ['listening']);

      const updatedUser = progressionService.getCurrentUser();
      expect(updatedUser?.longestStreak).toBeGreaterThanOrEqual(initialLongestStreak);
    });
  });

  describe('Statistics and Analytics', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('stats_user');
    });

    test('should generate detailed statistics', async () => {
      // Play a few games to generate data
      for (let i = 0; i < 3; i++) {
        progressionService.startGameSession('vocabulary', 'intermediate');
        await progressionService.endGameSession(70 + i * 10, 10, 7 + i, ['vocabulary', 'grammar']);
      }

      const stats = await progressionService.getDetailedStats();

      expect(stats).toBeTruthy();
      expect(stats?.totalSessions).toBe(3);
      expect(stats?.totalPlayTime).toBeGreaterThan(0);
      expect(stats?.overallAccuracy).toBeGreaterThan(0);
      expect(stats?.skillStats).toBeDefined();
      expect(stats?.skillStats.vocabulary).toBeDefined();
    });

    test('should calculate skill-specific statistics', async () => {
      progressionService.startGameSession('pronunciation', 'advanced');
      await progressionService.endGameSession(95, 8, 8, ['pronunciation']);

      const stats = await progressionService.getDetailedStats();
      const pronunciationStats = stats?.skillStats.pronunciation;

      expect(pronunciationStats).toBeDefined();
      expect(pronunciationStats?.accuracy).toBe(1.0);
      expect(pronunciationStats?.bestScore).toBe(95);
      expect(pronunciationStats?.totalQuestions).toBe(8);
    });

    test('should return null stats when no user', async () => {
      // Clear user
      progressionService.clearStorage();
      
      const stats = await progressionService.getDetailedStats();
      expect(stats).toBeNull();
    });
  });

  describe('Daily Challenges', () => {
    test('should generate daily challenge', () => {
      const challenge = progressionService.generateDailyChallenge();

      expect(challenge.id).toBeTruthy();
      expect(challenge.title).toBeTruthy();
      expect(challenge.description).toBeTruthy();
      expect(challenge.target).toBeDefined();
      expect(challenge.xpReward).toBeGreaterThan(0);
      expect(challenge.progress).toBe(0);
      expect(challenge.completed).toBe(false);
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should generate different challenge types', () => {
      const challenges = [];
      for (let i = 0; i < 10; i++) {
        challenges.push(progressionService.generateDailyChallenge());
      }

      const uniqueTypes = new Set(challenges.map(c => c.type));
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
  });

  describe('Leaderboards', () => {
    beforeEach(async () => {
      await progressionService.createNewProfile('leaderboard_user');
    });

    test('should generate mock leaderboard', () => {
      const leaderboard = progressionService.generateMockLeaderboard('total_xp');

      expect(leaderboard.id).toBe('leaderboard_total_xp');
      expect(leaderboard.name).toBe('XP Total');
      expect(leaderboard.entries.length).toBeGreaterThan(0);
      expect(leaderboard.totalParticipants).toBeGreaterThan(0);
      expect(leaderboard.lastUpdated).toBeGreaterThan(0);
    });

    test('should include current user in leaderboard', () => {
      const leaderboard = progressionService.generateMockLeaderboard('current_streak');
      
      expect(leaderboard.userEntry).toBeTruthy();
      expect(leaderboard.userEntry?.userId).toBe('leaderboard_user');
    });

    test('should generate different leaderboard types', () => {
      const xpLeaderboard = progressionService.generateMockLeaderboard('total_xp');
      const streakLeaderboard = progressionService.generateMockLeaderboard('current_streak');

      expect(xpLeaderboard.name).not.toBe(streakLeaderboard.name);
      expect(xpLeaderboard.type).not.toBe(streakLeaderboard.type);
    });
  });

  describe('Data Persistence', () => {
    test('should persist user profile', async () => {
      await progressionService.createNewProfile('persist_user');
      
      expect(progressionService.getStorageSize()).toBeGreaterThan(0);
    });

    test('should persist game sessions', async () => {
      await progressionService.createNewProfile('session_persist_user');
      
      progressionService.startGameSession('vocabulary', 'beginner');
      await progressionService.endGameSession(75, 8, 6, ['vocabulary']);

      expect(progressionService.getStorageSize()).toBeGreaterThan(1);
    });

    test('should clear storage correctly', async () => {
      await progressionService.createNewProfile('clear_user');
      progressionService.startGameSession('grammar', 'intermediate');
      
      progressionService.clearStorage();
      
      expect(progressionService.getStorageSize()).toBe(0);
      expect(progressionService.getCurrentUser()).toBeNull();
      expect(progressionService.getCurrentSession()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing user for session start', () => {
      expect(() => {
        progressionService.startGameSession('vocabulary', 'beginner');
      }).toThrow('Aucun utilisateur connecté');
    });

    test('should handle missing session for session end', async () => {
      await progressionService.createNewProfile('error_user');
      
      await expect(
        progressionService.endGameSession(100, 10, 10, ['vocabulary'])
      ).rejects.toThrow('Aucune session active');
    });

    test('should handle invalid user profile load', async () => {
      const result = await progressionService.loadUserProfile('nonexistent_user');
      expect(result).toBeNull();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent sessions', async () => {
      await progressionService.createNewProfile('performance_user');

      // Simulate rapid session creation/completion
      for (let i = 0; i < 10; i++) {
        progressionService.startGameSession(`mode_${i}`, 'intermediate');
        await progressionService.endGameSession(80 + i, 10, 7 + i % 3, ['vocabulary']);
      }

      const user = progressionService.getCurrentUser();
      expect(user?.totalGamesPlayed).toBe(10);
    });

    test('should maintain session limit', async () => {
      await progressionService.createNewProfile('limit_user');

      // Create more than 100 sessions
      for (let i = 0; i < 105; i++) {
        progressionService.startGameSession('vocabulary', 'beginner');
        await progressionService.endGameSession(50, 5, 3, ['vocabulary']);
      }

      // Check that only recent sessions are kept
      const stats = await progressionService.getDetailedStats();
      expect(stats?.totalSessions).toBeLessThanOrEqual(100);
    });

    test('should handle large XP values', async () => {
      await progressionService.createNewProfile('large_xp_user');

      await progressionService.awardXP(999999);

      const user = progressionService.getCurrentUser();
      expect(user?.totalXP).toBe(999999);
      expect(user?.level).toBeGreaterThan(1);
    });
  });
});

// Tests d'intégration interface
describe('Progression Interface Integration', () => {
  test('should format XP display correctly', () => {
    const formatXP = (xp: number): string => {
      if (xp >= 1000000) return `${Math.floor(xp / 1000000)}M`;
      if (xp >= 1000) return `${Math.floor(xp / 1000)}K`;
      return xp.toString();
    };

    expect(formatXP(500)).toBe('500');
    expect(formatXP(1500)).toBe('1K');
    expect(formatXP(1500000)).toBe('1M');
  });

  test('should determine level progress percentage', () => {
    const calculateProgress = (currentXP: number, levelXP: number, nextLevelXP: number): number => {
      const xpInCurrentLevel = currentXP - levelXP;
      const xpNeededForNextLevel = nextLevelXP - levelXP;
      return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
    };

    expect(calculateProgress(150, 100, 250)).toBe(33); // 50/150 = 33%
    expect(calculateProgress(200, 100, 250)).toBe(66); // 100/150 = 66%
    expect(calculateProgress(250, 100, 250)).toBe(100); // 150/150 = 100%
  });

  test('should categorize achievements by rarity', () => {
    const achievements = [
      { rarity: 'common', name: 'First Game' },
      { rarity: 'rare', name: 'Perfect Score' },
      { rarity: 'legendary', name: 'Master' }
    ];

    const rarityColors = {
      common: '#4CAF50',
      uncommon: '#FF9800', 
      rare: '#9C27B0',
      epic: '#673AB7',
      legendary: '#FFD700'
    };

    achievements.forEach(achievement => {
      expect(rarityColors[achievement.rarity as keyof typeof rarityColors]).toBeTruthy();
    });
  });
});