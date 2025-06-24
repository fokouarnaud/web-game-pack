/**
 * Types pour le système de contenu éducatif avancé
 * Task 14: Contenu Éducatif Avancé - Phase 3
 */

// Types d'exercices disponibles
export enum ExerciseType {
  TRANSLATION = 'translation',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  WRITING = 'writing',
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANKS = 'fill_blanks',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  DICTATION = 'dictation',
  CONVERSATION = 'conversation'
}

// Niveaux de difficulté
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  PROFICIENT = 'proficient'
}

// Catégories de contenu
export enum ContentCategory {
  BASICS = 'basics',
  GREETINGS = 'greetings',
  FAMILY = 'family',
  WORK = 'work',
  TRAVEL = 'travel',
  FOOD = 'food',
  SHOPPING = 'shopping',
  HEALTH = 'health',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  TECHNOLOGY = 'technology',
  CULTURE = 'culture',
  BUSINESS = 'business',
  EMERGENCY = 'emergency'
}

// Compétences linguistiques
export enum LanguageSkill {
  SPEAKING = 'speaking',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  COMPREHENSION = 'comprehension'
}

// Leçon structurée
export interface Lesson {
  id: string;
  title: string;
  description: string;
  language: string;
  targetLanguage: string;
  level: DifficultyLevel;
  category: ContentCategory;
  skills: LanguageSkill[];
  duration: number; // en minutes
  prerequisiteIds: string[];
  objectives: string[];
  content: LessonContent;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  culturalNotes?: CulturalNote[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-1
  rating?: number; // 1-5
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Contenu d'une leçon
export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  keyPoints: string[];
  tips: string[];
}

// Section d'une leçon
export interface LessonSection {
  id: string;
  title: string;
  type: 'text' | 'audio' | 'video' | 'interactive' | 'quiz';
  content: string;
  media?: MediaContent;
  examples?: Example[];
  notes?: string[];
}

// Contenu média
export interface MediaContent {
  type: 'audio' | 'video' | 'image';
  url: string;
  duration?: number;
  transcript?: string;
  subtitles?: Subtitle[];
  thumbnailUrl?: string;
}

// Sous-titres
export interface Subtitle {
  start: number;
  end: number;
  text: string;
  language: string;
}

// Exemple dans une leçon
export interface Example {
  original: string;
  translation: string;
  pronunciation?: string;
  audio?: string;
  context?: string;
  difficulty: DifficultyLevel;
}

// Exercice éducatif
export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  instructions: string;
  question: string;
  options?: string[]; // Pour QCM, matching, etc.
  correctAnswer: string | string[];
  acceptableAnswers?: string[];
  hints: string[];
  explanation: string;
  difficulty: DifficultyLevel;
  points: number;
  timeLimit?: number;
  media?: MediaContent;
  metadata: ExerciseMetadata;
  isCompleted: boolean;
  attempts: ExerciseAttempt[];
}

// Métadonnées d'exercice
export interface ExerciseMetadata {
  focusSkills: LanguageSkill[];
  grammarPoints?: string[];
  vocabularyWords?: string[];
  culturalContext?: string;
  commonMistakes?: string[];
  relatedExercises?: string[];
}

// Tentative d'exercice
export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  answer: string | string[];
  isCorrect: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  timestamp: number;
  feedback?: string;
}

// Élément de vocabulaire
export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  phonetic?: string;
  audio?: string;
  image?: string;
  partOfSpeech: PartOfSpeech;
  difficulty: DifficultyLevel;
  frequency: number; // 1-10
  examples: Example[];
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  etymology?: string;
  culturalNotes?: string[];
  tags: string[];
  isFavorite: boolean;
  timesReviewed: number;
  nextReviewDate: number;
  masteryLevel: number; // 0-1
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
  ARTICLE = 'article',
  DETERMINER = 'determiner'
}

// Note culturelle
export interface CulturalNote {
  id: string;
  title: string;
  content: string;
  category: 'tradition' | 'etiquette' | 'history' | 'society' | 'food' | 'holidays' | 'customs';
  language: string;
  region?: string;
  images?: string[];
  relatedLessons: string[];
  tags: string[];
}

// Phrase courante
export interface CommonPhrase {
  id: string;
  phrase: string;
  translation: string;
  pronunciation: string;
  audio?: string;
  situation: string;
  formality: 'formal' | 'informal' | 'neutral';
  frequency: number; // 1-10
  alternatives: string[];
  responses?: string[];
  culturalContext?: string;
  examples: Example[];
  category: ContentCategory;
  tags: string[];
  isFavorite: boolean;
}

// Dictionnaire interactif
export interface Dictionary {
  id: string;
  language: string;
  targetLanguage: string;
  entries: DictionaryEntry[];
  favorites: string[]; // IDs des entrées favorites
  recentSearches: string[];
  customEntries: DictionaryEntry[];
}

// Entrée de dictionnaire
export interface DictionaryEntry {
  id: string;
  word: string;
  translations: Translation[];
  pronunciation: string;
  phonetic?: string;
  audio?: string;
  partOfSpeech: PartOfSpeech;
  definitions: Definition[];
  examples: Example[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  etymology?: string;
  frequency: number;
  difficulty: DifficultyLevel;
  isCustom: boolean;
  tags: string[];
}

// Traduction avec contexte
export interface Translation {
  text: string;
  context?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  region?: string;
  usage?: string;
}

// Définition
export interface Definition {
  text: string;
  context?: string;
  examples: string[];
  synonyms?: string[];
}

// Système de révision espacée (Spaced Repetition)
export interface SpacedRepetitionCard {
  id: string;
  type: 'vocabulary' | 'phrase' | 'grammar' | 'exercise';
  contentId: string;
  userId: string;
  interval: number; // jours jusqu'à la prochaine révision
  repetitions: number;
  easeFactor: number; // facteur de facilité (2.5 par défaut)
  nextReviewDate: number;
  lastReviewDate: number;
  quality: number; // 0-5 (0 = échec total, 5 = parfait)
  history: ReviewHistory[];
  isActive: boolean;
}

// Historique de révision
export interface ReviewHistory {
  date: number;
  quality: number;
  timeSpent: number;
  difficulty: DifficultyLevel;
  notes?: string;
}

// Cours structuré
export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  targetLanguage: string;
  level: DifficultyLevel;
  category: ContentCategory;
  lessons: string[]; // IDs des leçons
  duration: number; // durée totale en heures
  objectives: string[];
  prerequisites: string[];
  certificateAwarded: boolean;
  price: number;
  rating: number;
  enrolledUsers: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  isEnrolled: boolean;
  progress: CourseProgress;
}

// Progression dans un cours
export interface CourseProgress {
  courseId: string;
  userId: string;
  lessonsCompleted: string[];
  exercisesCompleted: string[];
  overallProgress: number; // 0-1
  timeSpent: number;
  startDate: number;
  lastAccessDate: number;
  certificateEarned?: boolean;
  certificateDate?: number;
  finalGrade?: number;
}

// Évaluation et feedback
export interface Assessment {
  id: string;
  type: 'lesson' | 'course' | 'skill' | 'overall';
  targetId: string; // ID de la leçon, cours, etc.
  userId: string;
  score: number; // 0-100
  maxScore: number;
  skills: SkillAssessment[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  completedAt: number;
  timeSpent: number;
}

// Évaluation de compétence
export interface SkillAssessment {
  skill: LanguageSkill;
  score: number;
  level: DifficultyLevel;
  confidence: number; // 0-1
  areas: SkillArea[];
}

// Domaine de compétence
export interface SkillArea {
  name: string;
  score: number;
  examples: string[];
  improvementTips: string[];
}

// Système de recommandations
export interface LearningRecommendation {
  id: string;
  userId: string;
  type: 'lesson' | 'exercise' | 'vocabulary' | 'review';
  contentId: string;
  reason: string;
  priority: number; // 1-10
  confidence: number; // 0-1
  estimatedTime: number;
  skills: LanguageSkill[];
  createdAt: number;
  isApplied: boolean;
}

// État du système éducatif
export interface EducationState {
  currentLesson: Lesson | null;
  availableLessons: Lesson[];
  completedLessons: string[];
  currentCourse: Course | null;
  enrolledCourses: Course[];
  vocabulary: VocabularyItem[];
  commonPhrases: CommonPhrase[];
  dictionary: Dictionary;
  spacedRepetitionCards: SpacedRepetitionCard[];
  culturalNotes: CulturalNote[];
  assessments: Assessment[];
  recommendations: LearningRecommendation[];
  preferences: LearningPreferences;
  analytics: LearningAnalytics;
}

// Préférences d'apprentissage
export interface LearningPreferences {
  primaryLanguage: string;
  targetLanguages: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  difficultyPreference: 'gradual' | 'challenging' | 'adaptive';
  sessionDuration: number; // minutes
  reminderEnabled: boolean;
  reminderTime: string;
  pronunciationFeedback: boolean;
  culturalContent: boolean;
  spacedRepetition: boolean;
  multiplayerPreference: boolean;
}

// Analytics d'apprentissage
export interface LearningAnalytics {
  totalTimeSpent: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  vocabularyLearned: number;
  averageScore: number;
  streakDays: number;
  skillLevels: Record<LanguageSkill, number>;
  weakAreas: string[];
  strongAreas: string[];
  learningVelocity: number; // mots/phrases par heure
  retentionRate: number; // pourcentage
  engagementScore: number; // 0-100
  lastActivityDate: number;
}

// Actions pour le store éducatif
export type EducationAction =
  | { type: 'START_LESSON'; payload: { lessonId: string } }
  | { type: 'COMPLETE_LESSON'; payload: { lessonId: string; score: number } }
  | { type: 'START_EXERCISE'; payload: { exerciseId: string } }
  | { type: 'COMPLETE_EXERCISE'; payload: ExerciseAttempt }
  | { type: 'ADD_VOCABULARY'; payload: VocabularyItem }
  | { type: 'FAVORITE_VOCABULARY'; payload: { wordId: string; isFavorite: boolean } }
  | { type: 'SCHEDULE_REVIEW'; payload: SpacedRepetitionCard }
  | { type: 'COMPLETE_REVIEW'; payload: { cardId: string; quality: number } }
  | { type: 'SEARCH_DICTIONARY'; payload: { query: string } }
  | { type: 'ADD_CUSTOM_PHRASE'; payload: CommonPhrase }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<LearningPreferences> }
  | { type: 'GENERATE_RECOMMENDATIONS'; payload: LearningRecommendation[] };

// Configuration par défaut
export const DEFAULT_LEARNING_PREFERENCES: LearningPreferences = {
  primaryLanguage: 'fr',
  targetLanguages: ['en'],
  preferredLearningStyle: 'mixed',
  difficultyPreference: 'adaptive',
  sessionDuration: 15,
  reminderEnabled: true,
  reminderTime: '19:00',
  pronunciationFeedback: true,
  culturalContent: true,
  spacedRepetition: true,
  multiplayerPreference: false
};

// Paramètres de révision espacée
export const SPACED_REPETITION_CONFIG = {
  intervals: [1, 3, 7, 14, 30, 90, 180, 365], // jours
  easeFactor: {
    min: 1.3,
    max: 2.5,
    default: 2.5,
    increment: 0.1,
    decrement: 0.15
  },
  qualityThreshold: 3, // en dessous = répétition
  maxReviewsPerDay: 50
};

// Contenu éducatif par défaut
export const DEFAULT_CONTENT_CATEGORIES = [
  { id: 'basics', name: 'Bases', icon: '🔤', color: '#3B82F6' },
  { id: 'greetings', name: 'Salutations', icon: '👋', color: '#10B981' },
  { id: 'family', name: 'Famille', icon: '👨‍👩‍👧‍👦', color: '#F59E0B' },
  { id: 'work', name: 'Travail', icon: '💼', color: '#EF4444' },
  { id: 'travel', name: 'Voyage', icon: '✈️', color: '#8B5CF6' },
  { id: 'food', name: 'Nourriture', icon: '🍕', color: '#06B6D4' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#84CC16' },
  { id: 'health', name: 'Santé', icon: '🏥', color: '#F97316' }
];