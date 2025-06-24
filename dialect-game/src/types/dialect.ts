/**
 * Dialect and language types for the dialect learning game
 * Defines structures for words, languages, dialects, and difficulty levels
 */

/** Difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Language codes (ISO 639-1) */
export type LanguageCode = 
  | 'en' // English
  | 'fr' // French
  | 'es' // Spanish
  | 'de' // German
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'zh' // Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'ar' // Arabic
  | 'hi' // Hindi
  | 'ru' // Russian;

/** Language information */
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  family: string;
}

/** Dialect information */
export interface Dialect {
  id: string;
  name: string;
  language: LanguageCode;
  region: string;
  country: string;
  description: string;
  difficulty: Difficulty;
  isActive: boolean;
}

/** Word in a specific dialect */
export interface DialectWord {
  id: string;
  dialectId: string;
  word: string;
  pronunciation: string;
  meaning: string;
  category: WordCategory;
  difficulty: Difficulty;
  frequency: number; // 1-10, how common the word is
  examples: string[];
  audioUrl?: string;
  phonetic?: string;
  tags: string[];
}

/** Word categories */
export type WordCategory = 
  | 'greeting'
  | 'food'
  | 'family'
  | 'colors'
  | 'numbers'
  | 'animals'
  | 'weather'
  | 'clothing'
  | 'transportation'
  | 'emotions'
  | 'time'
  | 'directions'
  | 'common_phrases'
  | 'slang'
  | 'formal'
  | 'informal';

/** Word learning progress */
export interface WordProgress {
  wordId: string;
  userId: string;
  attempts: number;
  correctAttempts: number;
  accuracy: number;
  averageConfidence: number;
  lastAttempt: number;
  firstAttempt: number;
  masteryLevel: MasteryLevel;
  nextReviewDate: number;
}

/** Mastery levels */
export type MasteryLevel = 
  | 'new'
  | 'learning'
  | 'practicing'
  | 'mastered'
  | 'review_needed';

/** Learning session for a dialect */
export interface DialectLearningSession {
  id: string;
  dialectId: string;
  userId: string;
  difficulty: Difficulty;
  category?: WordCategory;
  startTime: number;
  endTime?: number;
  wordsPresented: string[];
  wordsCorrect: string[];
  totalScore: number;
  accuracy: number;
  averageConfidence: number;
  completed: boolean;
}

/** Dialect learning statistics */
export interface DialectStats {
  dialectId: string;
  userId: string;
  totalWords: number;
  wordsLearned: number;
  wordsMastered: number;
  averageAccuracy: number;
  totalSessions: number;
  totalPlayTime: number; // in minutes
  streak: number; // consecutive days
  lastActivity: number;
  progressByCategory: Record<WordCategory, CategoryProgress>;
  progressByDifficulty: Record<Difficulty, DifficultyProgress>;
}

/** Progress in a word category */
export interface CategoryProgress {
  category: WordCategory;
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  accuracy: number;
}

/** Progress by difficulty level */
export interface DifficultyProgress {
  difficulty: Difficulty;
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  accuracy: number;
}

/** Word matching result */
export interface WordMatchResult {
  wordId: string;
  spokenText: string;
  expectedText: string;
  isCorrect: boolean;
  confidence: number;
  similarity: number; // 0-1, phonetic similarity
  feedback: string;
  points: number;
}

/** Dialect learning preferences */
export interface LearningPreferences {
  userId: string;
  preferredDialects: string[];
  preferredCategories: WordCategory[];
  preferredDifficulty: Difficulty;
  dailyGoal: number; // minutes
  reminderEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}