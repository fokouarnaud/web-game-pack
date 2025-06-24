/**
 * Types pour le système multijoueur local
 * Task 13: Mode Multijoueur Local - Phase 3
 */

// Types de jeux multijoueurs
export enum MultiplayerGameType {
  DUEL = 'duel',
  TEAM = 'team',
  QUIZ_PARTY = 'quiz_party',
  TOURNAMENT = 'tournament',
  SPEED_CHALLENGE = 'speed_challenge'
}

// Modes de jeu
export enum GameMode {
  COMPETITIVE = 'competitive',
  COLLABORATIVE = 'collaborative',
  CASUAL = 'casual',
  RANKED = 'ranked',
  PRACTICE = 'practice'
}

// États des joueurs
export enum PlayerStatus {
  WAITING = 'waiting',
  READY = 'ready',
  PLAYING = 'playing',
  FINISHED = 'finished',
  DISCONNECTED = 'disconnected',
  SPECTATING = 'spectating'
}

// États de la salle
export enum RoomStatus {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  READY_TO_START = 'ready_to_start',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

// Types d'événements multijoueur
export enum MultiplayerEventType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_READY = 'player_ready',
  GAME_STARTED = 'game_started',
  QUESTION_ANSWERED = 'question_answered',
  ROUND_ENDED = 'round_ended',
  GAME_ENDED = 'game_ended',
  CHAT_MESSAGE = 'chat_message',
  POWER_UP_USED = 'power_up_used',
  SPECTATOR_JOINED = 'spectator_joined'
}

// Joueur multijoueur
export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar?: string;
  status: PlayerStatus;
  score: number;
  position: number;
  isHost: boolean;
  isSpectator: boolean;
  
  // Statistiques de jeu
  correctAnswers: number;
  wrongAnswers: number;
  streakCount: number;
  averageResponseTime: number;
  
  // Power-ups et bonus
  powerUps: string[];
  achievements: string[];
  badges: string[];
  
  // Connexion
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unstable';
  lastActivity: number;
  
  // Préférences
  preferences: {
    language: string;
    difficulty: string;
    soundEnabled: boolean;
    vibrationsEnabled: boolean;
  };
}

// Salle de jeu multijoueur
export interface MultiplayerRoom {
  id: string;
  name: string;
  description?: string;
  gameType: MultiplayerGameType;
  gameMode: GameMode;
  status: RoomStatus;
  
  // Configuration
  maxPlayers: number;
  currentPlayers: number;
  players: MultiplayerPlayer[];
  spectators: MultiplayerPlayer[];
  
  // Paramètres de jeu
  settings: RoomSettings;
  
  // Jeu actuel
  currentGame?: ActiveGame;
  
  // Métadonnées
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  hostId: string;
  
  // Chat et social
  chatHistory: ChatMessage[];
  chatEnabled: boolean;
  
  // Système de tournoi
  tournament?: Tournament;
}

// Paramètres de salle
export interface RoomSettings {
  // Jeu
  questionCount: number;
  timePerQuestion: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  categories: string[];
  language: string;
  
  // Scoring
  pointsPerCorrectAnswer: number;
  penaltyForWrongAnswer: number;
  timeBonus: boolean;
  streakBonus: boolean;
  
  // Power-ups
  powerUpsEnabled: boolean;
  availablePowerUps: string[];
  powerUpFrequency: number;
  
  // Social
  allowSpectators: boolean;
  chatEnabled: boolean;
  voiceChatEnabled: boolean;
  
  // Accessibilité
  largeText: boolean;
  highContrast: boolean;
  audioAssistance: boolean;
  
  // Avancé
  reconnectionAllowed: boolean;
  pauseOnDisconnection: boolean;
  showPlayerScores: boolean;
  showCorrectAnswers: boolean;
}

// Jeu actif
export interface ActiveGame {
  id: string;
  roomId: string;
  gameType: MultiplayerGameType;
  status: 'starting' | 'in_progress' | 'paused' | 'finished';
  
  // Questions et réponses
  questions: GameQuestion[];
  currentQuestionIndex: number;
  currentQuestion?: GameQuestion;
  
  // Timing
  startTime: number;
  questionStartTime: number;
  timeRemaining: number;
  roundDuration: number;
  
  // Scores et classement
  leaderboard: Array<{
    playerId: string;
    score: number;
    position: number;
    trend: 'up' | 'down' | 'same';
  }>;
  
  // Réponses des joueurs
  playerAnswers: Map<string, PlayerAnswer>;
  questionResults: QuestionResult[];
  
  // État du jeu
  round: number;
  totalRounds: number;
  isLastQuestion: boolean;
  
  // Événements
  events: GameEvent[];
  
  // Power-ups actifs
  activePowerUps: Map<string, any>;
}

// Question de jeu multijoueur
export interface GameQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'audio' | 'image';
  category: string;
  difficulty: number;
  
  // Options et réponses
  options?: string[];
  correctAnswer: string | number;
  acceptableAnswers?: string[];
  
  // Médias
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  
  // Métadonnées
  explanation?: string;
  hints?: string[];
  timeLimit: number;
  points: number;
  
  // Statistiques
  averageTime: number;
  successRate: number;
  
  // Multijoueur spécifique
  showToAllPlayers: boolean;
  simultaneousAnswering: boolean;
  revealAnswersImmediately: boolean;
}

// Réponse d'un joueur
export interface PlayerAnswer {
  playerId: string;
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  responseTime: number;
  confidence: number;
  timestamp: number;
  powerUpsUsed: string[];
  pointsEarned: number;
  bonusPoints: number;
}

// Résultat d'une question
export interface QuestionResult {
  questionId: string;
  correctAnswer: string | number;
  playerAnswers: PlayerAnswer[];
  statistics: {
    totalPlayers: number;
    correctAnswers: number;
    averageTime: number;
    fastestAnswer: number;
    slowestAnswer: number;
  };
  leaderboardChange: Array<{
    playerId: string;
    positionChange: number;
    scoreChange: number;
  }>;
}

// Événement de jeu
export interface GameEvent {
  id: string;
  type: MultiplayerEventType;
  timestamp: number;
  playerId?: string;
  data: any;
  broadcast: boolean;
  priority: 'low' | 'medium' | 'high';
  
  // Affichage
  message?: string;
  animation?: string;
  sound?: string;
  duration?: number;
}

// Résultat final du jeu
export interface GameResult {
  gameId: string;
  roomId: string;
  gameType: MultiplayerGameType;
  
  // Temps
  startTime: number;
  endTime: number;
  duration: number;
  
  // Résultats
  finalScores: Array<{
    playerId: string;
    playerName: string;
    score: number;
    position: number;
    stats: {
      correctAnswers: number;
      wrongAnswers: number;
      averageTime: number;
      streakCount: number;
      powerUpsUsed: number;
    };
  }>;
  
  // Statistiques globales
  totalQuestions: number;
  averageScore: number;
  perfectScores: number;
  
  // Achievements débloqués
  achievementsUnlocked: Array<{
    playerId: string;
    achievements: string[];
  }>;
  
  // Replay et partage
  replayData?: any;
  shareCode?: string;
}

// Message de chat
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'emoji' | 'system' | 'achievement';
  
  // Modération
  isFiltered: boolean;
  reportCount: number;
  
  // Réactions
  reactions: Map<string, string[]>; // emoji -> playerIds
}

// Système de tournoi
export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  
  // Participants
  participants: MultiplayerPlayer[];
  maxParticipants: number;
  
  // Brackets et matchs
  brackets: TournamentBracket[];
  currentRound: number;
  totalRounds: number;
  
  // État
  status: 'registration' | 'in_progress' | 'finished';
  startTime: number;
  endTime?: number;
  
  // Récompenses
  prizes: Array<{
    position: number;
    reward: string;
    value: number;
  }>;
  
  // Paramètres
  settings: {
    gameType: MultiplayerGameType;
    questionsPerMatch: number;
    timePerQuestion: number;
    advancementCriteria: string;
  };
}

// Bracket de tournoi
export interface TournamentBracket {
  id: string;
  round: number;
  match: number;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  scores: {
    player1: number;
    player2: number;
  };
  status: 'pending' | 'in_progress' | 'finished';
  gameId?: string;
}

// Paramètres de jeu spécifiques
export interface GameSettings {
  // Timing
  preparationTime: number;
  questionTime: number;
  breakTime: number;
  
  // Scoring
  basePoints: number;
  timeMultiplier: number;
  streakMultiplier: number;
  
  // Power-ups
  powerUpSettings: {
    enabled: boolean;
    frequency: number;
    maxPerPlayer: number;
    types: string[];
  };
  
  // Assistance
  hintsEnabled: boolean;
  maxHints: number;
  skipEnabled: boolean;
  maxSkips: number;
  
  // Visual
  showProgress: boolean;
  showScores: boolean;
  showStatistics: boolean;
  animations: boolean;
  
  // Audio
  soundEffects: boolean;
  backgroundMusic: boolean;
  voiceAnnouncements: boolean;
}

// Invitation à une salle
export interface RoomInvitation {
  id: string;
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  invitedPlayerId: string;
  
  // Détails
  gameType: MultiplayerGameType;
  maxPlayers: number;
  currentPlayers: number;
  
  // État
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: number;
  expiresAt: number;
  
  // Message personnalisé
  message?: string;
  
  // Paramètres de privacy
  isPublic: boolean;
  requiresPassword: boolean;
}

// Partage social
export interface SocialShare {
  id: string;
  type: 'game_result' | 'achievement' | 'high_score' | 'tournament_win';
  playerId: string;
  playerName: string;
  
  // Contenu
  title: string;
  description: string;
  imageUrl?: string;
  data: any;
  
  // Métadonnées
  gameType?: MultiplayerGameType;
  score?: number;
  achievement?: string;
  
  // Partage
  platforms: string[];
  sharedAt: number;
  shareCode: string;
  
  // Privacy
  isPublic: boolean;
  allowComments: boolean;
}

// Constantes multijoueur
export const MULTIPLAYER_CONSTANTS = {
  // Limites de salle
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  MAX_SPECTATORS: 20,
  
  // Timing
  DEFAULT_QUESTION_TIME: 30000, // 30 secondes
  MIN_QUESTION_TIME: 5000,      // 5 secondes
  MAX_QUESTION_TIME: 120000,    // 2 minutes
  PREPARATION_TIME: 3000,       // 3 secondes
  BREAK_TIME: 5000,            // 5 secondes
  
  // Scoring
  BASE_POINTS: 100,
  MAX_TIME_BONUS: 50,
  STREAK_MULTIPLIER: 1.5,
  
  // Questions
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  DEFAULT_QUESTIONS: 10,
  
  // Power-ups
  MAX_POWER_UPS_PER_PLAYER: 3,
  POWER_UP_COOLDOWN: 10000, // 10 secondes
  
  // Chat
  CHAT_RATE_LIMIT: 5, // messages par minute
  CHAT_HISTORY_LIMIT: 100,
  
  // Reconnexion
  RECONNECT_TIMEOUT: 30000, // 30 secondes
  MAX_RECONNECT_ATTEMPTS: 3
} as const;

// Pas d'exports conflictuels - tous les types sont déjà exportés directement