/**
 * Types pour le système de progression avancé
 * Task 12: Système de Progression Avancé - Phase 3
 */

// Niveaux de difficulté
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary', 
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Types d'activités
export enum ActivityType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  READING = 'reading',
  CULTURE = 'culture'
}

// Profil utilisateur
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  
  // Progression générale
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  
  // Statistiques
  totalGamesPlayed: number;
  totalTimeSpent: number; // en minutes
  averageScore: number;
  bestScore: number;
  
  // Progression par compétence
  skillLevels: Record<ActivityType, SkillProgress>;
  
  // Préférences
  preferences: UserPreferences;
  
  // Métadonnées
  createdAt: number;
  lastActiveAt: number;
  achievements: Achievement[];
  unlockedContent: string[];
}

// Progression par compétence
export interface SkillProgress {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  masteredConcepts: string[];
  weakConcepts: string[];
  lastPracticed: number;
}

// Préférences utilisateur
export interface UserPreferences {
  language: string;
  targetLanguages: string[];
  difficultyPreference: DifficultyLevel;
  dailyGoal: number; // minutes
  reminderTime?: string; // HH:MM
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: string;
}

// Système d'achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  
  // Critères d'obtention
  criteria: AchievementCriteria;
  
  // Récompenses
  xpReward: number;
  badgeIcon: string;
  badgeColor: string;
  
  // Métadonnées
  rarity: AchievementRarity;
  isHidden: boolean;
  unlockedAt?: number;
  progress?: number; // 0-1 pour achievements progressifs
}

// Catégories d'achievements
export enum AchievementCategory {
  PROGRESSION = 'progression',
  STREAK = 'streak',
  MASTERY = 'mastery',
  SOCIAL = 'social',
  EXPLORATION = 'exploration',
  DEDICATION = 'dedication',
  SPECIAL = 'special'
}

// Types d'achievements
export enum AchievementType {
  SINGLE = 'single', // Une fois seulement
  PROGRESSIVE = 'progressive', // Par paliers (1, 10, 100, etc.)
  STREAK = 'streak', // Basé sur continuité
  CUMULATIVE = 'cumulative' // Accumulation dans le temps
}

// Rareté des achievements
export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Critères d'achievement
export interface AchievementCriteria {
  type: 'games_played' | 'streak_days' | 'total_xp' | 'skill_level' | 'perfect_scores' | 'time_spent';
  target: number;
  skill?: ActivityType;
  timeframe?: number; // en jours pour critères temporels
}

// Système de niveaux
export interface LevelSystem {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPForLevel: number;
  
  // Progression
  progressPercentage: number;
  xpMultiplier: number;
  
  // Récompenses de niveau
  rewards: LevelReward[];
  nextReward?: LevelReward;
}

// Récompenses de niveau
export interface LevelReward {
  level: number;
  type: 'content' | 'feature' | 'cosmetic' | 'badge';
  name: string;
  description: string;
  icon?: string;
  unlocks?: string[]; // IDs de contenu débloqué
}

// Session de jeu
export interface GameSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  
  // Détails du jeu
  gameMode: string;
  difficulty: DifficultyLevel;
  activities: ActivityType[];
  
  // Performance
  score: number;
  maxScore: number;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
  
  // XP et progression
  xpEarned: number;
  skillXP: Record<ActivityType, number>;
  levelUps: LevelUp[];
  achievementsUnlocked: Achievement[];
  
  // Contexte
  streakMaintained: boolean;
  newBestScore: boolean;
  perfectGame: boolean;
}

// Montée de niveau
export interface LevelUp {
  skill?: ActivityType; // undefined pour niveau général
  previousLevel: number;
  newLevel: number;
  xpRequired: number;
  rewards: LevelReward[];
}

// Statistiques détaillées
export interface DetailedStats {
  // Temps de jeu
  totalPlayTime: number; // minutes
  averageSessionTime: number;
  totalSessions: number;
  
  // Performance
  overallAccuracy: number;
  bestStreak: number;
  currentStreak: number;
  perfectGames: number;
  
  // Par compétence
  skillStats: Record<ActivityType, SkillStats>;
  
  // Par difficulté
  difficultyStats: Record<DifficultyLevel, DifficultyStats>;
  
  // Tendances temporelles
  dailyProgress: DailyProgress[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

// Statistiques par compétence
export interface SkillStats {
  totalTime: number;
  totalQuestions: number;
  accuracy: number;
  averageScore: number;
  bestScore: number;
  level: number;
  masteredConcepts: number;
  weakAreas: string[];
  lastPracticed: number;
  improvement: number; // pourcentage d'amélioration récente
}

// Statistiques par difficulté
export interface DifficultyStats {
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  accuracy: number;
  totalTime: number;
  preference: number; // fréquence de sélection
}

// Progression quotidienne
export interface DailyProgress {
  date: string; // YYYY-MM-DD
  xpEarned: number;
  timeSpent: number;
  gamesPlayed: number;
  accuracy: number;
  streakDay: boolean;
  goalAchieved: boolean;
}

// Progression hebdomadaire
export interface WeeklyProgress {
  weekStart: string; // YYYY-MM-DD
  totalXP: number;
  totalTime: number;
  totalGames: number;
  averageAccuracy: number;
  daysActive: number;
  goals: {
    target: number;
    achieved: number;
  };
}

// Progression mensuelle
export interface MonthlyProgress {
  month: string; // YYYY-MM
  totalXP: number;
  totalTime: number;
  levelUps: number;
  achievementsUnlocked: number;
  averageAccuracy: number;
  bestStreak: number;
  daysActive: number;
}

// Système de streak (séries)
export interface StreakSystem {
  current: number;
  longest: number;
  lastDate: string; // YYYY-MM-DD
  
  // Récompenses de streak
  milestones: StreakMilestone[];
  nextMilestone?: StreakMilestone;
  
  // Freeze/protection
  freezesAvailable: number;
  freezesUsed: number;
}

// Jalons de streak
export interface StreakMilestone {
  days: number;
  xpBonus: number;
  specialReward?: {
    type: 'badge' | 'avatar' | 'theme' | 'content';
    id: string;
    name: string;
  };
}

// Défis quotidiens
export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  
  // Défi
  title: string;
  description: string;
  type: ActivityType;
  difficulty: DifficultyLevel;
  
  // Objectifs
  target: ChallengeTarget;
  progress: number; // 0-1
  completed: boolean;
  
  // Récompenses
  xpReward: number;
  bonusReward?: {
    type: string;
    value: any;
  };
  
  // Métadonnées
  expiresAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

// Objectif de défi
export interface ChallengeTarget {
  type: 'score' | 'accuracy' | 'questions' | 'time' | 'streak';
  value: number;
  description: string;
}

// Leaderboards
export interface Leaderboard {
  id: string;
  name: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  
  // Entrées
  entries: LeaderboardEntry[];
  userEntry?: LeaderboardEntry; // Position de l'utilisateur actuel
  
  // Métadonnées
  totalParticipants: number;
  lastUpdated: number;
  nextUpdate: number;
}

// Types de leaderboards
export enum LeaderboardType {
  TOTAL_XP = 'total_xp',
  CURRENT_STREAK = 'current_streak',
  WEEKLY_XP = 'weekly_xp',
  ACCURACY = 'accuracy',
  GAMES_PLAYED = 'games_played',
  SKILL_LEVEL = 'skill_level'
}

// Périodes de leaderboards
export enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  DAILY = 'daily'
}

// Entrée de leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  value: number;
  change?: number; // changement de position depuis dernière mise à jour
  badge?: string; // badge spécial pour top performers
}

// Système de récompenses
export interface RewardSystem {
  // XP et multiplicateurs
  baseXP: Record<ActivityType, number>;
  difficultyMultipliers: Record<DifficultyLevel, number>;
  streakMultipliers: number[]; // par jour de streak
  perfectGameBonus: number;
  
  // Niveaux
  xpPerLevel: number[];
  levelRewards: Record<number, LevelReward[]>;
  
  // Achievements
  achievements: Achievement[];
  
  // Défis
  dailyChallenges: {
    pool: DailyChallenge[];
    refreshTime: string; // HH:MM
  };
}

// Configuration de progression
export interface ProgressionConfig {
  // XP
  xpSystems: RewardSystem;
  
  // Niveaux
  maxLevel: number;
  xpCurve: 'linear' | 'exponential' | 'logarithmic';
  
  // Streaks
  streakGracePeriod: number; // heures
  streakFreezeCost: number; // coût en points/monnaie
  
  // Défis
  challengeRefreshTime: string;
  maxActiveChallenges: number;
  
  // Leaderboards
  leaderboardUpdateInterval: number; // minutes
  leaderboardSize: number; // top N
  
  // Sauvegarde
  autoSaveInterval: number; // secondes
  backupRetention: number; // jours
}

// Analytics et métriques
export interface ProgressionAnalytics {
  // Engagement
  sessionFrequency: number; // sessions par semaine
  averageSessionLength: number;
  retentionRate: number; // 0-1
  
  // Performance
  learningVelocity: number; // XP par heure
  accuracyTrend: number[]; // évolution sur 30 jours
  strongestSkills: ActivityType[];
  weakestSkills: ActivityType[];
  
  // Motivation
  streakHealth: number; // 0-1, probabilité de maintenir streak
  challengeCompletionRate: number;
  goalAchievementRate: number;
  
  // Prédictions
  projectedLevel: number; // niveau dans 30 jours
  riskFactors: string[]; // facteurs de désengagement
  recommendations: string[]; // suggestions d'amélioration
}

// États du système de progression
export interface ProgressionState {
  // Utilisateur
  currentUser: UserProfile | null;
  isLoading: boolean;
  lastSync: number;
  
  // Session courante
  currentSession: GameSession | null;
  sessionStartTime: number;
  
  // Progression temps réel
  pendingXP: number;
  levelUpQueue: LevelUp[];
  achievementQueue: Achievement[];
  
  // Défis et streaks
  dailyChallenge: DailyChallenge | null;
  streakStatus: StreakSystem;
  
  // Leaderboards
  leaderboards: Record<string, Leaderboard>;
  
  // Cache
  recentSessions: GameSession[];
  cachedStats: DetailedStats | null;
  
  // Configuration
  config: ProgressionConfig;
  
  // Erreurs
  errors: ProgressionError[];
}

// Erreurs de progression
export interface ProgressionError {
  id: string;
  type: 'sync' | 'calculation' | 'storage' | 'network';
  message: string;
  timestamp: number;
  context?: any;
  resolved: boolean;
}

// Actions du système de progression
export type ProgressionAction =
  | { type: 'LOAD_PROFILE'; payload: { userId: string } }
  | { type: 'UPDATE_PROFILE'; payload: { updates: Partial<UserProfile> } }
  | { type: 'START_SESSION'; payload: { gameMode: string; difficulty: DifficultyLevel } }
  | { type: 'END_SESSION'; payload: { score: number; activities: ActivityType[] } }
  | { type: 'AWARD_XP'; payload: { amount: number; skill?: ActivityType; source: string } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: string } }
  | { type: 'UPDATE_STREAK'; payload: { maintained: boolean } }
  | { type: 'COMPLETE_CHALLENGE'; payload: { challengeId: string } }
  | { type: 'SYNC_LEADERBOARDS'; payload: {} }
  | { type: 'SAVE_PROGRESS'; payload: {} };

// Utilitaires
export const PROGRESSION_CONSTANTS = {
  // XP de base par activité
  BASE_XP: {
    [ActivityType.VOCABULARY]: 10,
    [ActivityType.GRAMMAR]: 15,
    [ActivityType.PRONUNCIATION]: 20,
    [ActivityType.LISTENING]: 12,
    [ActivityType.SPEAKING]: 25,
    [ActivityType.WRITING]: 18,
    [ActivityType.READING]: 8,
    [ActivityType.CULTURE]: 10
  },
  
  // Multiplicateurs de difficulté
  DIFFICULTY_MULTIPLIERS: {
    [DifficultyLevel.BEGINNER]: 1.0,
    [DifficultyLevel.ELEMENTARY]: 1.2,
    [DifficultyLevel.INTERMEDIATE]: 1.5,
    [DifficultyLevel.ADVANCED]: 2.0,
    [DifficultyLevel.EXPERT]: 3.0
  },
  
  // Niveau par défaut
  DEFAULT_LEVEL_XP: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000],
  
  // Bonus
  PERFECT_GAME_BONUS: 50,
  STREAK_MULTIPLIER_MAX: 2.0,
  
  // Limites
  MAX_DAILY_XP: 1000,
  MAX_STREAK_DAYS: 365,
  
  // Temps
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTOSAVE_INTERVAL: 60 * 1000, // 1 minute
  
  // Stockage
  STORAGE_KEYS: {
    USER_PROFILE: 'dialect_user_profile',
    GAME_SESSIONS: 'dialect_game_sessions',
    ACHIEVEMENTS: 'dialect_achievements',
    PREFERENCES: 'dialect_preferences'
  }
} as const;