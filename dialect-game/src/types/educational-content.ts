/**
 * Types pour le contenu éducatif avancé
 * Task 14: Contenu Éducatif Avancé - Phase 3
 */

// Niveaux de compétence CECR
export enum CEFRLevel {
  A1 = 'A1', // Débutant
  A2 = 'A2', // Pré-intermédiaire
  B1 = 'B1', // Intermédiaire
  B2 = 'B2', // Intermédiaire supérieur
  C1 = 'C1', // Avancé
  C2 = 'C2'  // Maîtrise
}

// Alias pour compatibilité
export const CECRLevel = CEFRLevel;

// Compétences linguistiques
export enum LanguageSkill {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
  CULTURAL_AWARENESS = 'cultural_awareness'
}

// Types de contenu éducatif
export enum ContentType {
  LESSON = 'lesson',
  EXERCISE = 'exercise',
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
  CULTURE = 'culture',
  CONVERSATION = 'conversation'
}

// Types d'exercices
export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANKS = 'fill_in_blanks',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  PRONUNCIATION_PRACTICE = 'pronunciation_practice',
  LISTENING_COMPREHENSION = 'listening_comprehension',
  DICTATION = 'dictation',
  TRANSLATION = 'translation',
  CONVERSATION_SIMULATION = 'conversation_simulation',
  WRITING_COMPOSITION = 'writing_composition',
  GRAMMAR_CORRECTION = 'grammar_correction',
  VOCABULARY_BUILDER = 'vocabulary_builder'
}

// Types de questions
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANKS = 'fill_blanks',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  AUDIO_RESPONSE = 'audio_response'
}

// Niveaux de Bloom
export enum BloomLevel {
  REMEMBER = 'remember',
  UNDERSTAND = 'understand',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create'
}

// Types de sections
export enum SectionType {
  INTRODUCTION = 'introduction',
  CONTENT = 'content',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  SUMMARY = 'summary'
}

// Intervalles SRS
export enum SRSInterval {
  ONE_DAY = 86400000,      // 1 jour en millisecondes
  THREE_DAYS = 259200000,  // 3 jours
  ONE_WEEK = 604800000,    // 1 semaine
  TWO_WEEKS = 1209600000,  // 2 semaines
  ONE_MONTH = 2592000000,  // 1 mois
  THREE_MONTHS = 7776000000, // 3 mois
  SIX_MONTHS = 15552000000,  // 6 mois
  ONE_YEAR = 31104000000     // 1 an
}

// Algorithmes SRS
export enum SRSAlgorithm {
  SM2 = 'SM2',
  ANKI = 'ANKI',
  SUPERMEMO = 'SUPERMEMO'
}

// Modes de révision
export enum RevisionMode {
  SPACED_REPETITION = 'spaced_repetition',
  RANDOM_REVIEW = 'random_review',
  WEAKNESS_FOCUSED = 'weakness_focused',
  RECENT_MISTAKES = 'recent_mistakes',
  DAILY_PRACTICE = 'daily_practice',
  EXAM_PREPARATION = 'exam_preparation'
}

// Situations contextuelles
export enum ContextualSituation {
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  SHOPPING = 'shopping',
  AIRPORT = 'airport',
  DOCTOR = 'doctor',
  WORKPLACE = 'workplace',
  SOCIAL_EVENT = 'social_event',
  FAMILY = 'family',
  SCHOOL = 'school',
  TRANSPORTATION = 'transportation',
  EMERGENCY = 'emergency',
  BANKING = 'banking'
}

// Parties du discours
export enum PartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  ARTICLE = 'article'
}

// === TYPES DE CONTENU ===

export interface AudioContent {
  url: string;
  duration: number;
  speaker?: string;
  speed?: number;
  volume?: number;
}

export interface VideoContent {
  url: string;
  duration: number;
  thumbnail?: string;
  subtitles?: string[];
  quality?: string;
}

export interface ImageContent {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface InteractiveContent {
  type: string;
  config: any;
  data: any;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation?: string;
}

export interface InteractiveConfig {
  type: string;
  settings: Record<string, any>;
}

export interface InteractiveStyling {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}

// Contenu de section
export interface SectionContent {
  text?: string;
  html?: string;
  markdown?: string;
  audio?: AudioContent;
  video?: VideoContent;
  images?: ImageContent[];
  interactive?: InteractiveContent;
  code?: CodeExample[];
}

// === OBJECTIFS ET SECTIONS ===

export interface LearningObjective {
  id: string;
  description: string;
  type: 'knowledge' | 'skill' | 'attitude' | 'vocabulary';
  measurable: boolean;
  assessmentCriteria: string[];
  bloomLevel: BloomLevel;
}

export interface LessonSection {
  id: string;
  title: string;
  type: SectionType;
  order: number;
  content: SectionContent;
  estimatedTime: number;
  requiresCompletion: boolean;
  assessments: string[];
  resources: string[];
  metadata: Record<string, any>;
  accessibility: Record<string, any>;
}

// === QUESTIONS ET EXERCICES ===

export interface Hint {
  id: string;
  text: string;
  type: 'text' | 'audio' | 'visual';
  revealOrder: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  feedback?: string;
}

export interface QuestionStatistics {
  correctAnswers: number;
  wrongAnswers: number;
  averageTime: number;
  difficultyRating: number;
}

export interface ExerciseQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string | number | boolean | string[];
  acceptableAnswers?: string[];
  hints: Hint[];
  explanation: string;
  difficulty: number;
  timeLimit?: number;
  points: number;
  tags: string[];
  media?: AudioContent | VideoContent | ImageContent;
  statistics: QuestionStatistics;
}

// === CONTEXTE CULTUREL ===

export interface CulturalContext {
  region: string;
  description?: string;
  customsExplanation?: string;
  socialNorms?: string[];
  communicationStyle?: string;
  nonVerbalCues?: string[];
  commonMistakes?: string[];
  tips?: string[];
}

// === SYSTÈME DE PROGRESSION ===

export interface CompletionCriteria {
  minimumScore?: number;
  minimumAccuracy?: number;
  requiredSections: string[];
  timeLimit?: number;
  maxAttempts?: number;
}

export interface LessonReward {
  type: 'xp' | 'badge' | 'unlock' | 'certificate';
  value: number | string;
  condition: string;
  description: string;
}

export interface ExerciseReference {
  id: string;
  type: ExerciseType;
  difficulty: number;
  estimatedTime: number;
  required: boolean;
}

// === LEÇON PRINCIPALE ===

export interface EducationalLesson {
  id: string;
  title: string;
  description: string;
  
  // Classification
  level: CEFRLevel;
  targetSkills: LanguageSkill[];
  estimatedDuration: number;
  prerequisites: string[];
  
  // Structure
  learningObjectives: LearningObjective[];
  sections: LessonSection[];
  
  // Contexte culturel
  culturalContext?: CulturalContext;
  
  // Adaptations
  adaptations: {
    difficulty: Record<string, any>;
    accessibility: Record<string, any>;
    learningStyle: Record<string, any>;
  };
  
  // Métadonnées
  metadata: {
    author: string;
    version: string;
    lastUpdated: number;
    tags: string[];
    difficulty: number;
    popularity: number;
  };
  
  // Analytics
  analytics: {
    completionRate: number;
    averageScore: number;
    timeSpent: number;
    errorPatterns: Record<string, number>;
    improvements: string[];
  };
}

// === EXERCICES ===

export interface ImmediateFeedback {
  enabled: boolean;
  showCorrectAnswer: boolean;
  showExplanation: boolean;
  showHints: boolean;
}

export interface AdaptiveSettings {
  adjustDifficulty: boolean;
  adaptationSpeed: number;
}

export interface FeedbackSettings {
  immediate: ImmediateFeedback;
  detailed: boolean;
  explanations: boolean;
  hints: boolean;
  encouragement: boolean;
}

export interface EducationalExercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  contentType: ContentType;
  level: CEFRLevel;
  estimatedDuration: number;
  targetSkills: LanguageSkill[];
  questions: ExerciseQuestion[];
  
  // Configuration
  scoringRules: {
    pointsPerQuestion: number;
    penaltyPerError: number;
    timeBonus?: number;
    streakBonus?: number;
    completionBonus?: number;
  };
  
  adaptiveSettings: AdaptiveSettings;
  feedback: FeedbackSettings;
  
  accessibility: {
    audioSupport: boolean;
    visualSupport: boolean;
    keyboardNavigation: boolean;
    screenReaderCompatible: boolean;
  };
  
  analytics: {
    completionRate: number;
    averageScore: number;
    averageTime: number;
    difficultyRating: number;
    errorPatterns: Record<string, number>;
    improvements: string[];
  };
}

// === FEEDBACK TYPES ===

export interface SummaryFeedback {
  score: number;
  timeSpent: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
}

export interface PersonalizedFeedback {
  userId: string;
  recommendations: string[];
  nextSteps: string[];
  resources: string[];
}

export interface MotivationalFeedback {
  message: string;
  tone: 'encouraging' | 'congratulatory' | 'supportive';
  achievement?: string;
}

export interface ExerciseFeedback {
  summary: SummaryFeedback;
  personalized: PersonalizedFeedback;
  motivational: MotivationalFeedback;
  detailed: {
    questionFeedback: Record<string, string>;
    improvements: string[];
    nextExercises: string[];
  };
}

// === DICTIONNAIRE ===

export interface Etymology {
  origin: string;
  evolution: string;
  relatedWords: string[];
}

export interface UsageExample {
  sentence: string;
  translation: string;
  context: string;
  audioUrl?: string;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  pronunciation: AudioContent[];
  partOfSpeech: PartOfSpeech;
  definitions: string[];
  translations: Record<string, string>;
  examples: UsageExample[];
  difficulty: CEFRLevel;
  frequency: number;
  audio?: AudioContent;
  etymology?: Etymology;
  tags: string[];
  lastUpdated: number;
  verified: boolean;
}

export interface DictionaryCategory {
  id: string;
  name: string;
  description: string;
  entries: string[];
}

export interface DictionaryFeature {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface SearchConfig {
  fuzzySearch: boolean;
  searchByCategory: boolean;
  searchByLevel: boolean;
  searchByFrequency: boolean;
}

export interface UserNote {
  id: string;
  entryId: string;
  userId: string;
  content: string;
  createdAt: number;
}

export interface StudyList {
  id: string;
  name: string;
  userId: string;
  entries: string[];
  createdAt: number;
}

export interface DictionaryStats {
  totalEntries: number;
  entriesByLevel: Record<CEFRLevel, number>;
  userActivity: Record<string, number>;
}

export interface InteractiveDictionary {
  id: string;
  name: string;
  description: string;
  language: string;
  version: string;
  entries: DictionaryEntry[];
  categories: DictionaryCategory[];
  features: DictionaryFeature[];
  searchConfig: SearchConfig;
  userFeatures: {
    bookmarks: string[];
    notes: Map<string, UserNote>;
    studyLists: Map<string, StudyList>;
    searchHistory: string[];
  };
  analytics: {
    totalSearches: number;
    popularTerms: Map<string, number>;
    userActivity: Map<string, DictionaryStats>;
  };
}

// === PHRASES COMMUNES ===

export interface DialogueExample {
  speaker: string;
  text: string;
  translation: string;
  audio?: AudioContent;
}

export interface PhraseSubcategory {
  id: string;
  name: string;
  phrases: string[];
}

export interface PhraseUsageStats {
  timesUsed: number;
  lastUsed: number;
  successRate: number;
}

export interface PhraseProgress {
  mastered: boolean;
  confidence: number;
  lastPracticed: number;
}

export interface PhraseEntry {
  id: string;
  french: string;
  english: string;
  phonetic: string;
  pronunciation: string;
  context: string;
  difficulty: CEFRLevel;
  frequency: number;
  formality: 'formal' | 'informal' | 'neutral';
  usage: string;
  audio: AudioContent;
  alternatives: string[];
  culturalNotes?: string;
  tags: string[];
  studyCount: number;
  lastUpdated: number;
}

export interface CommonPhrases {
  id: string;
  language: string;
  version: string;
  categories: Map<ContextualSituation, PhraseEntry[]>;
  analytics: {
    usage: Map<string, PhraseUsageStats>;
    popularity: Map<string, number>;
    userProgress: Map<string, PhraseProgress>;
  };
}

// === SYSTÈME SRS ===

export interface SRSDeck {
  id: string;
  name: string;
  description: string;
  items: string[];
  config: Record<string, any>;
}

export interface SRSSessionSummary {
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  itemsReviewed: number;
}

export interface SRSOverallStats {
  totalReviews: number;
  successRate: number;
  averageRetention: number;
  timeSpent: number;
}

export interface ReviewSchedule {
  nextReview: number;
  interval: SRSInterval;
  priority: number;
}

export interface SRSItem {
  id: string;
  contentId: string;
  contentType: ContentType;
  difficulty: number;
  interval: SRSInterval;
  easeFactor: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
  successStreak: number;
  totalReviews: number;
  successRate: number;
  averageResponseTime: number;
  metadata: {
    createdAt: number;
    updatedAt: number;
    tags: string[];
    priority: 'low' | 'normal' | 'high';
  };
}

export interface SRSSession {
  id: string;
  startTime: number;
  endTime: number;
  itemIds: string[];
  results: Array<{
    itemId: string;
    correct: boolean;
    responseTime: number;
    difficulty: number;
  }>;
  statistics: {
    correctAnswers: number;
    wrongAnswers: number;
    averageResponseTime: number;
    difficultyRating: number;
  };
}

export interface SpacedRepetitionSystem {
  id: string;
  name: string;
  description: string;
  algorithm: SRSAlgorithm;
  version: string;
  items: SRSItem[];
  decks: SRSDeck[];
  config: {
    initialInterval: SRSInterval;
    maxInterval: SRSInterval;
    easeFactor: number;
    difficultyThreshold: number;
    retentionTarget: number;
  };
  analytics: {
    totalReviews: number;
    successRate: number;
    averageRetention: number;
    timeSpent: number;
  };
}

// === PRÉFÉRENCES D'APPRENTISSAGE ===

export interface LearningPreferences {
  id: string;
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredPace: 'slow' | 'normal' | 'fast';
  contentTypes: Array<{
    type: string;
    weight: number;
    enabled: boolean;
  }>;
  difficultyPreference: 'easy' | 'balanced' | 'challenging' | 'adaptive';
  feedbackStyle: 'immediate' | 'delayed' | 'end_of_session';
  hintUsage: 'never' | 'when_stuck' | 'always_available';
  sessionLength: number; // minutes
  breakFrequency: number; // minutes
  studyTimes: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  competitiveMode: boolean;
  gamificationLevel: 'minimal' | 'balanced' | 'high';
  achievementNotifications: boolean;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    colorBlindness: 'none' | 'red_green' | 'blue_yellow' | 'monochrome';
    closedCaptions: boolean;
    signLanguage: boolean;
    audioDescriptions: boolean;
    keyboardNavigation: boolean;
    voiceControl: boolean;
    switchControl: boolean;
    reducedMotion: boolean;
    simplifiedUI: boolean;
    extendedTimeouts: boolean;
    customAccommodations: string[];
  };
  customSettings: Record<string, any>;
  version: string;
}

// === CONSTANTES ===

export const EDUCATIONAL_CONSTANTS = {
  MAX_LESSON_DURATION: 120, // minutes
  MIN_LESSON_DURATION: 5,   // minutes
  MAX_EXERCISE_QUESTIONS: 50,
  MIN_EXERCISE_QUESTIONS: 1,
  DEFAULT_DIFFICULTY: 0.5,
  MAX_HINTS_PER_QUESTION: 5,
  
  STORAGE_KEYS: {
    PROGRESS: 'educational_progress',
    SRS_DATA: 'srs_data',
    PREFERENCES: 'learning_preferences',
    HISTORY: 'learning_history'
  },
  
  SRS_DEFAULTS: {
    INITIAL_INTERVAL: SRSInterval.ONE_DAY,
    MAX_INTERVAL: SRSInterval.ONE_YEAR,
    EASE_FACTOR: 2.5,
    MIN_EASE_FACTOR: 1.3,
    MAX_EASE_FACTOR: 4.0
  }
} as const;