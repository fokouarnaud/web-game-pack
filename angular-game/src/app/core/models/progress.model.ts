export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  lessonTitle: string;
  currentPhase: LessonPhase;
  currentStep: number;
  phaseProgress: number;
  overallProgress: number;
  status: CompletionStatus;
  score?: number;
  timeSpent: number; // en secondes
  attemptsCount: number;
  mistakesCount: number;
  phaseScores: Record<string, number>;
  detailedProgress: Record<string, any>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  lessonId: number;
  currentPhase: LessonPhase;
  currentStep: number;
  phaseProgress: number;
  overallProgress: number;
  status: CompletionStatus;
  score?: number;
  timeSpent: number;
  phaseScores?: Record<string, number>;
  detailedProgress?: Record<string, any>;
}

export enum LessonPhase {
  SITUATION = 'SITUATION',
  VOCABULARY = 'VOCABULARY',
  EXERCISES = 'EXERCISES',
  INTEGRATION = 'INTEGRATION'
}

export enum CompletionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  progressByDifficulty: Record<string, number>;
  recentActivity: ProgressActivity[];
}

export interface ProgressActivity {
  date: string;
  lessonTitle: string;
  score: number;
  timeSpent: number;
  status: CompletionStatus;
}