/**
 * Extended types for dialect data and content management
 */

import type { DialectWord, Language, WordCategory, Difficulty } from './dialect';

/**
 * Detailed word entry with pronunciation and metadata
 */
export interface DialectWordEntry extends DialectWord {
  /** Phonetic pronunciation guide */
  phonetic?: string;
  /** Audio file URL for pronunciation */
  audioUrl?: string;
  /** Difficulty level */
  difficulty: Difficulty;
  /** Numeric difficulty for sorting (1-5) */
  difficultyLevel: number;
  /** Usage example in context */
  example?: string;
  /** Related words or synonyms */
  related?: string[];
  /** Cultural context or notes */
  culturalNote?: string;
  /** Frequency of use (common, uncommon, rare) - extends base frequency number */
  frequencyCategory: 'common' | 'uncommon' | 'rare';
}

/**
 * Complete dialect database structure
 */
export interface DialectDatabase {
  /** Available languages/dialects */
  languages: Record<string, DialectLanguageData>;
  /** Available word categories */
  categories: WordCategory[];
  /** Metadata about the database */
  metadata: {
    version: string;
    lastUpdated: string;
    totalWords: number;
    contributors: string[];
  };
}

/**
 * Language-specific data
 */
export interface DialectLanguageData {
  /** Language metadata */
  info: {
    name: string;
    nativeName: string;
    code: string;
    region: string;
    speakers: number;
    description: string;
  };
  /** Words organized by category */
  words: Record<WordCategory, DialectWordEntry[]>;
  /** Common phrases and expressions */
  phrases: DialectPhraseEntry[];
}

/**
 * Phrase entry for common expressions
 */
export interface DialectPhraseEntry {
  /** Unique identifier */
  id: string;
  /** Phrase in dialect */
  phrase: string;
  /** Translation to standard language */
  translation: string;
  /** Context where phrase is used */
  context: string;
  /** Phonetic pronunciation */
  phonetic?: string;
  /** Audio URL */
  audioUrl?: string;
  /** Difficulty level */
  difficulty: Difficulty;
  /** Numeric difficulty for sorting */
  difficultyLevel: number;
  /** Usage frequency category */
  frequencyCategory: 'common' | 'uncommon' | 'rare';
}

/**
 * Learning progress tracking
 */
export interface LearningProgress {
  /** User identifier */
  userId: string;
  /** Language being learned */
  language: Language;
  /** Words learned by category */
  wordsLearned: Record<WordCategory, Set<string>>;
  /** Phrases learned */
  phrasesLearned: Set<string>;
  /** Overall score */
  totalScore: number;
  /** Accuracy rate */
  accuracy: number;
  /** Learning streak (days) */
  streak: number;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Preferred difficulty level */
  preferredDifficulty: Difficulty;
}

/**
 * Game session result
 */
export interface GameSessionResult {
  /** Session identifier */
  sessionId: string;
  /** Language played */
  language: Language;
  /** Category played */
  category: WordCategory;
  /** Words attempted */
  wordsAttempted: DialectWordEntry[];
  /** Correct answers */
  correctAnswers: string[];
  /** Incorrect answers with user input */
  incorrectAnswers: Array<{
    word: DialectWordEntry;
    userInput: string;
    similarity: number;
  }>;
  /** Session duration in ms */
  duration: number;
  /** Score achieved */
  score: number;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Voice recognition result for dialect words
 */
export interface DialectVoiceResult {
  /** Recognized text */
  recognized: string;
  /** Target word */
  target: DialectWordEntry;
  /** Confidence score (0-1) */
  confidence: number;
  /** Similarity score to target (0-1) */
  similarity: number;
  /** Pronunciation feedback */
  feedback: {
    /** Overall rating */
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    /** Specific areas to improve */
    improvements: string[];
    /** Phonetic comparison */
    phoneticMatch: number;
  };
}

/**
 * Content filter options
 */
export interface ContentFilter {
  /** Languages to include */
  languages?: Language[];
  /** Categories to include */
  categories?: WordCategory[];
  /** Difficulty levels to include */
  difficulties?: Difficulty[];
  /** Frequency filter */
  frequency?: Array<'common' | 'uncommon' | 'rare'>;
  /** Exclude already learned words */
  excludeLearned?: boolean;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Learning recommendation
 */
export interface LearningRecommendation {
  /** Recommended words */
  words: DialectWordEntry[];
  /** Recommended phrases */
  phrases: DialectPhraseEntry[];
  /** Reason for recommendation */
  reason: string;
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
  /** Estimated learning time */
  estimatedTime: number; // minutes
}

/**
 * Content validation result
 */
export interface ContentValidation {
  /** Is content valid */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** Content quality score */
  qualityScore: number;
}