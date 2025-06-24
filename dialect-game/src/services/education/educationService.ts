/**
 * Service de contenu éducatif avancé avec leçons, exercices, vocabulaire
 * Task 14: Contenu Éducatif Avancé - Phase 3
 */

import type {
  Lesson,
  Exercise,
  VocabularyItem,
  CommonPhrase,
  DictionaryEntry,
  SpacedRepetitionCard,
  Course,
  Assessment,
  LearningRecommendation,
  EducationState,
  LearningAnalytics,
  CulturalNote,
  ExerciseAttempt,
  SkillAssessment,
  CourseProgress,
  Dictionary
} from '../../types/education';

import {
  ExerciseType,
  DifficultyLevel,
  ContentCategory,
  LanguageSkill,
  PartOfSpeech,
  DEFAULT_LEARNING_PREFERENCES,
  SPACED_REPETITION_CONFIG,
  DEFAULT_CONTENT_CATEGORIES
} from '../../types/education';

import { persistentCache } from '../api/persistentCache';

// Génération d'IDs uniques
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== LESSON MANAGEMENT =====

// Créer une leçon structurée
export function createLesson(options: {
  title: string;
  level?: DifficultyLevel;
  category?: ContentCategory;
  language?: string;
  targetLanguage?: string;
  prerequisiteIds?: string[];
}): Lesson {
  return {
    id: generateId('lesson'),
    title: options.title,
    description: `Leçon sur ${options.title}`,
    language: options.language || 'en',
    targetLanguage: options.targetLanguage || 'fr',
    level: options.level || DifficultyLevel.BEGINNER,
    category: options.category || ContentCategory.BASICS,
    skills: [LanguageSkill.VOCABULARY, LanguageSkill.READING],
    duration: 15,
    prerequisiteIds: options.prerequisiteIds || [],
    objectives: [`Apprendre ${options.title}`],
    content: {
      introduction: `Introduction à ${options.title}`,
      sections: [],
      summary: `Résumé de ${options.title}`,
      keyPoints: [`Point clé de ${options.title}`],
      tips: [`Conseil pour ${options.title}`]
    },
    exercises: [],
    vocabulary: [],
    culturalNotes: [],
    isUnlocked: options.prerequisiteIds?.length === 0 || true,
    isCompleted: false,
    progress: 0,
    tags: [options.title.toLowerCase()],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Vérifier l'accès aux prérequis
export function canAccessLesson(lesson: Lesson, completedLessons: string[]): boolean {
  return lesson.prerequisiteIds.every(prereqId => completedLessons.includes(prereqId));
}

// Calculer la progression d'une leçon
export function calculateLessonProgress(lesson: Lesson, completedExercises: string[]): number {
  if (lesson.exercises.length === 0) return 0;
  const completed = lesson.exercises.filter(ex => completedExercises.includes(ex.id)).length;
  return completed / lesson.exercises.length;
}

// Débloquer les leçons suivantes
export function unlockNextLessons(lessons: Lesson[], completedLessonId: string): Lesson[] {
  return lessons.map(lesson => {
    if (lesson.prerequisiteIds.includes(completedLessonId)) {
      return { ...lesson, isUnlocked: true };
    }
    return lesson;
  });
}

// Sauvegarder la progression
export function saveLessonProgress(lessonId: string, progress: number, completed: boolean): void {
  try {
    const progressData = {
      lessonId,
      progress,
      completed,
      timestamp: Date.now()
    };
    localStorage.setItem(`lesson-progress-${lessonId}`, JSON.stringify(progressData));
  } catch (error) {
    console.error('Failed to save lesson progress:', error);
  }
}

// Créer une leçon avec exercices
export function createLessonWithExercises(count: number): Lesson {
  const lesson = createLesson({ title: 'Test Lesson' });
  lesson.exercises = Array.from({ length: count }, (_, i) => 
    createExercise(ExerciseType.TRANSLATION, {
      question: `Question ${i + 1}`,
      correctAnswer: `Réponse ${i + 1}`
    })
  );
  return lesson;
}

// ===== EXERCISE SYSTEM =====

// Créer un exercice
export function createExercise(type: ExerciseType, options: any = {}): Exercise {
  return {
    id: generateId('exercise'),
    lessonId: options.lessonId || 'lesson-1',
    type,
    title: options.title || `Exercise ${type}`,
    instructions: options.instructions || 'Complétez l\'exercice',
    question: options.question || 'Question par défaut',
    options: options.options,
    correctAnswer: options.correctAnswer || 'Réponse correcte',
    acceptableAnswers: options.acceptableAnswers || [],
    hints: options.hints || ['Indice 1', 'Indice 2'],
    explanation: options.explanation || 'Explication de la réponse',
    difficulty: options.difficulty || DifficultyLevel.BEGINNER,
    points: options.points || 100,
    timeLimit: options.timeLimit,
    metadata: {
      focusSkills: [LanguageSkill.VOCABULARY],
      grammarPoints: [],
      vocabularyWords: [],
      relatedExercises: []
    },
    isCompleted: false,
    attempts: []
  };
}

// Valider une réponse
export function validateAnswer(exercise: Exercise, answer: string): boolean {
  const userAnswer = answer.toLowerCase().trim();
  
  // Gérer le cas où correctAnswer peut être string ou string[]
  if (Array.isArray(exercise.correctAnswer)) {
    if (exercise.correctAnswer.some(correct => correct.toLowerCase().trim() === userAnswer)) {
      return true;
    }
  } else {
    const correctAnswer = exercise.correctAnswer.toLowerCase().trim();
    if (userAnswer === correctAnswer) return true;
  }
  
  // Vérifier les réponses acceptables
  if (Array.isArray(exercise.acceptableAnswers)) {
    return exercise.acceptableAnswers.some(acceptable =>
      acceptable.toLowerCase().trim() === userAnswer
    );
  }
  
  return false;
}

// Calculer le score d'un exercice
export function calculateExerciseScore(exercise: Exercise, correct: boolean, timeSpent: number, hintsUsed: number): number {
  if (!correct) return 0;
  
  let score = exercise.points;
  
  // Malus pour les indices utilisés
  score -= hintsUsed * 10;
  
  // Bonus de vitesse si limite de temps définie
  if (exercise.timeLimit && timeSpent < exercise.timeLimit) {
    const speedRatio = timeSpent / exercise.timeLimit;
    const speedBonus = Math.max(0, (1 - speedRatio) * 0.2); // Jusqu'à 20% bonus
    score += Math.round(exercise.points * speedBonus);
  }
  
  return Math.max(0, score);
}

// Enregistrer une tentative
export function recordExerciseAttempt(exercise: Exercise, userId: string, attempt: any): Exercise {
  const newAttempt: ExerciseAttempt = {
    id: generateId('attempt'),
    exerciseId: exercise.id,
    userId,
    answer: attempt.answer,
    isCorrect: attempt.isCorrect,
    score: calculateExerciseScore(exercise, attempt.isCorrect, attempt.timeSpent, attempt.hintsUsed),
    timeSpent: attempt.timeSpent,
    hintsUsed: attempt.hintsUsed,
    timestamp: Date.now()
  };
  
  return {
    ...exercise,
    attempts: [...exercise.attempts, newAttempt],
    isCompleted: attempt.isCorrect
  };
}

// Obtenir le prochain indice
export function getNextHint(exercise: Exercise, hintIndex: number): string | null {
  if (hintIndex >= exercise.hints.length) return null;
  return exercise.hints[hintIndex];
}

// ===== VOCABULARY MANAGEMENT =====

// Créer un élément de vocabulaire
export function createVocabularyItem(options: {
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: PartOfSpeech;
  difficulty: DifficultyLevel;
}): VocabularyItem {
  return {
    id: generateId('vocab'),
    word: options.word,
    translation: options.translation,
    pronunciation: options.pronunciation,
    partOfSpeech: options.partOfSpeech,
    difficulty: options.difficulty,
    frequency: 5,
    examples: [],
    synonyms: [],
    antonyms: [],
    relatedWords: [],
    tags: [],
    isFavorite: false,
    timesReviewed: 0,
    nextReviewDate: Date.now() + 86400000, // Demain
    masteryLevel: 0
  };
}

// Basculer favori
export function toggleVocabularyFavorite(vocab: VocabularyItem, isFavorite: boolean): VocabularyItem {
  return { ...vocab, isFavorite };
}

// Mettre à jour le niveau de maîtrise
export function updateMasteryLevel(vocab: VocabularyItem, correctReviews: number, totalReviews: number): VocabularyItem {
  const masteryLevel = totalReviews > 0 ? correctReviews / totalReviews : 0;
  return {
    ...vocab,
    masteryLevel,
    timesReviewed: totalReviews
  };
}

// Rechercher dans le vocabulaire
export function searchVocabulary(vocabList: VocabularyItem[], criteria: any): VocabularyItem[] {
  return vocabList.filter(vocab => {
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      return vocab.word.toLowerCase().includes(query) || 
             vocab.translation.toLowerCase().includes(query);
    }
    
    if (criteria.partOfSpeech) {
      return vocab.partOfSpeech === criteria.partOfSpeech;
    }
    
    if (criteria.difficulty) {
      return vocab.difficulty === criteria.difficulty;
    }
    
    if (criteria.isFavorite !== undefined) {
      return vocab.isFavorite === criteria.isFavorite;
    }
    
    return true;
  });
}

// Sauvegarder vocabulaire
export function saveVocabularyItem(vocab: VocabularyItem): void {
  try {
    const existing = localStorage.getItem('vocabulary-items');
    const items: VocabularyItem[] = existing ? JSON.parse(existing) : [];
    
    const index = items.findIndex(item => item.id === vocab.id);
    if (index >= 0) {
      items[index] = vocab;
    } else {
      items.push(vocab);
    }
    
    localStorage.setItem('vocabulary-items', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save vocabulary:', error);
  }
}

// ===== DICTIONARY SYSTEM =====

// Créer une entrée de dictionnaire
export function createDictionaryEntry(options: any): DictionaryEntry {
  return {
    id: generateId('dict'),
    word: options.word,
    translations: options.translations || [],
    pronunciation: options.pronunciation || '',
    partOfSpeech: options.partOfSpeech || PartOfSpeech.NOUN,
    definitions: options.definitions || [],
    examples: options.examples || [],
    synonyms: options.synonyms || [],
    antonyms: options.antonyms || [],
    collocations: options.collocations || [],
    frequency: options.frequency || 5,
    difficulty: options.difficulty || DifficultyLevel.INTERMEDIATE,
    isCustom: options.isCustom || false,
    tags: options.tags || []
  };
}

// Créer un dictionnaire
export function createDictionary(language: string, targetLanguage: string): Dictionary {
  return {
    id: generateId('dict'),
    language,
    targetLanguage,
    entries: [],
    favorites: [],
    recentSearches: [],
    customEntries: []
  };
}

// Rechercher dans le dictionnaire
export function searchDictionary(entries: DictionaryEntry[], query: string): DictionaryEntry[] {
  const searchTerm = query.toLowerCase().trim();
  return entries.filter(entry => 
    entry.word.toLowerCase().includes(searchTerm) ||
    entry.translations.some(t => t.text.toLowerCase().includes(searchTerm))
  );
}

// Ajouter entrée personnalisée
export function addCustomEntry(dictionary: Dictionary, entry: DictionaryEntry): Dictionary {
  return {
    ...dictionary,
    customEntries: [...dictionary.customEntries, entry]
  };
}

// Ajouter recherche récente
export function addRecentSearch(dictionary: Dictionary, query: string): Dictionary {
  const recent = [query, ...dictionary.recentSearches.filter(s => s !== query)].slice(0, 10);
  return { ...dictionary, recentSearches: recent };
}

// Basculer favori dictionnaire
export function toggleDictionaryFavorite(dictionary: Dictionary, entryId: string, isFavorite: boolean): Dictionary {
  const favorites = isFavorite 
    ? [...dictionary.favorites, entryId]
    : dictionary.favorites.filter(id => id !== entryId);
  
  return { ...dictionary, favorites };
}

// ===== SPACED REPETITION SYSTEM =====

// Créer une carte de révision espacée
export function createSpacedRepetitionCard(options: any): SpacedRepetitionCard {
  return {
    id: generateId('card'),
    type: options.type,
    contentId: options.contentId,
    userId: options.userId,
    interval: SPACED_REPETITION_CONFIG.intervals[0], // Premier intervalle
    repetitions: 0,
    easeFactor: SPACED_REPETITION_CONFIG.easeFactor.default,
    nextReviewDate: Date.now() + (SPACED_REPETITION_CONFIG.intervals[0] * 86400000),
    lastReviewDate: Date.now(),
    quality: 0,
    history: [],
    isActive: true
  };
}

// Calculer la prochaine date de révision
export function calculateNextReviewDate(card: SpacedRepetitionCard, quality: number): number {
  const intervals = SPACED_REPETITION_CONFIG.intervals;
  
  if (quality < SPACED_REPETITION_CONFIG.qualityThreshold) {
    // Recommencer depuis le début
    return Date.now() + (intervals[0] * 86400000);
  }
  
  const nextIntervalIndex = Math.min(card.repetitions + 1, intervals.length - 1);
  const interval = intervals[nextIntervalIndex];
  
  return Date.now() + (interval * 86400000);
}

// Traiter une révision
export function processReview(card: SpacedRepetitionCard, quality: number, timeSpent: number): SpacedRepetitionCard {
  const config = SPACED_REPETITION_CONFIG;
  
  let newRepetitions = card.repetitions;
  let newEaseFactor = card.easeFactor;
  let newInterval = card.interval;
  
  if (quality < config.qualityThreshold) {
    // Échec - recommencer
    newRepetitions = 0;
    newInterval = config.intervals[0];
  } else {
    // Succès - progresser
    newRepetitions += 1;
    newEaseFactor = Math.max(
      config.easeFactor.min,
      newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    
    const nextIntervalIndex = Math.min(newRepetitions, config.intervals.length - 1);
    newInterval = Math.round(config.intervals[nextIntervalIndex] * newEaseFactor);
  }
  
  const nextReviewDate = Date.now() + (newInterval * 86400000);
  
  return {
    ...card,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate,
    lastReviewDate: Date.now(),
    quality,
    history: [...card.history, {
      date: Date.now(),
      quality,
      timeSpent,
      difficulty: DifficultyLevel.INTERMEDIATE
    }]
  };
}

// Obtenir les cartes à réviser
export function getCardsDueForReview(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
  const now = Date.now();
  return cards.filter(card => card.isActive && card.nextReviewDate <= now);
}

// ===== COURSE MANAGEMENT =====

// Créer un cours
export function createCourse(options: any): Course {
  return {
    id: generateId('course'),
    title: options.title,
    description: options.description || `Cours sur ${options.title}`,
    language: options.language || 'en',
    targetLanguage: options.targetLanguage || 'fr',
    level: options.level || DifficultyLevel.BEGINNER,
    category: options.category || ContentCategory.BASICS,
    lessons: options.lessonIds || [],
    duration: options.duration || 10,
    objectives: options.objectives || [`Apprendre ${options.title}`],
    prerequisites: options.prerequisites || [],
    certificateAwarded: options.certificateAwarded || false,
    price: options.price || 0,
    rating: options.rating || 4.5,
    enrolledUsers: options.enrolledUsers || 0,
    createdBy: options.createdBy || 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isEnrolled: false,
    progress: {
      courseId: '',
      userId: '',
      lessonsCompleted: [],
      exercisesCompleted: [],
      overallProgress: 0,
      timeSpent: 0,
      startDate: Date.now(),
      lastAccessDate: Date.now()
    }
  };
}

// Calculer progression cours
export function calculateCourseProgress(course: Course, completedLessons: string[]): number {
  if (course.lessons.length === 0) return 0;
  const completed = course.lessons.filter(lessonId => completedLessons.includes(lessonId)).length;
  return completed / course.lessons.length;
}

// S'inscrire à un cours
export function enrollInCourse(course: Course, userId: string): Course {
  return {
    ...course,
    isEnrolled: true,
    progress: {
      ...course.progress,
      courseId: course.id,
      userId,
      startDate: Date.now(),
      lastAccessDate: Date.now()
    }
  };
}

// Vérifier éligibilité certificat
export function checkCertificateEligibility(course: Course, completedLessons: string[], score: number): any {
  const progressRate = calculateCourseProgress(course, completedLessons);
  const minScore = 70;
  
  const eligible = course.certificateAwarded && progressRate >= 1.0 && score >= minScore;
  
  return {
    eligible,
    reason: eligible 
      ? 'Course completed with passing grade'
      : `Need ${Math.round((1.0 - progressRate) * 100)}% more completion and ${Math.max(0, minScore - score)} more points`
  };
}

// ===== ASSESSMENT SYSTEM =====

// Créer une évaluation
export function createAssessment(options: any): Assessment {
  return {
    id: generateId('assessment'),
    type: options.type || 'lesson',
    targetId: options.targetId,
    userId: options.userId,
    score: options.score || 0,
    maxScore: options.maxScore || 100,
    skills: options.skills || [],
    strengths: options.strengths || [],
    weaknesses: options.weaknesses || [],
    recommendations: options.recommendations || [],
    feedback: options.feedback || '',
    completedAt: Date.now(),
    timeSpent: options.timeSpent || 0
  };
}

// Analyser performance
export function analyzeSkillPerformance(skillScores: Record<LanguageSkill, number>): any {
  const skills = Object.entries(skillScores);
  const average = skills.reduce((sum, [_, score]) => sum + score, 0) / skills.length;
  
  const strengths = skills
    .filter(([_, score]) => score > average + 10)
    .map(([skill, _]) => skill as LanguageSkill);
    
  const weaknesses = skills
    .filter(([_, score]) => score < average - 10)
    .map(([skill, _]) => skill as LanguageSkill);
  
  return { strengths, weaknesses, average };
}

// Générer recommandations
export function generateRecommendations(assessment: Assessment): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  
  // Recommandations basées sur les faiblesses
  assessment.weaknesses.forEach(weakness => {
    recommendations.push({
      id: generateId('rec'),
      userId: assessment.userId,
      type: 'exercise',
      contentId: `${weakness}-practice`,
      reason: `Améliorer ${weakness} (score actuel: faible)`,
      priority: 8,
      confidence: 0.8,
      estimatedTime: 15,
      skills: [weakness as LanguageSkill],
      createdAt: Date.now(),
      isApplied: false
    });
  });
  
  return recommendations;
}

// ===== COMMON PHRASES =====

// Créer phrase courante
export function createCommonPhrase(options: any): CommonPhrase {
  return {
    id: generateId('phrase'),
    phrase: options.phrase,
    translation: options.translation,
    pronunciation: options.pronunciation || '',
    audio: options.audio,
    situation: options.situation,
    formality: options.formality || 'neutral',
    frequency: options.frequency || 5,
    alternatives: options.alternatives || [],
    responses: options.responses || [],
    culturalContext: options.culturalContext,
    examples: options.examples || [],
    category: options.category || ContentCategory.BASICS,
    tags: options.tags || [],
    isFavorite: false
  };
}

// Rechercher phrases par situation
export function searchPhrasesBySituation(phrases: CommonPhrase[], situation: string): CommonPhrase[] {
  return phrases.filter(phrase => phrase.situation === situation);
}

// Obtenir alternatives
export function getPhraseAlternatives(phrase: CommonPhrase): string[] {
  return phrase.alternatives;
}

// ===== CULTURAL NOTES =====

// Créer note culturelle
export function createCulturalNote(options: any): CulturalNote {
  return {
    id: generateId('culture'),
    title: options.title,
    content: options.content,
    category: options.category,
    language: options.language,
    region: options.region,
    images: options.images || [],
    relatedLessons: options.relatedLessons || [],
    tags: options.tags || []
  };
}

// Obtenir notes pour leçon
export function getCulturalNotesForLesson(lessonId: string, notes: CulturalNote[]): CulturalNote[] {
  return notes.filter(note => note.relatedLessons.includes(lessonId));
}

// ===== LEARNING ANALYTICS =====

// Créer analytics
export function createLearningAnalytics(): LearningAnalytics {
  return {
    totalTimeSpent: 0,
    lessonsCompleted: 0,
    exercisesCompleted: 0,
    vocabularyLearned: 0,
    averageScore: 0,
    streakDays: 0,
    skillLevels: {
      [LanguageSkill.SPEAKING]: 0,
      [LanguageSkill.LISTENING]: 0,
      [LanguageSkill.READING]: 0,
      [LanguageSkill.WRITING]: 0,
      [LanguageSkill.GRAMMAR]: 0,
      [LanguageSkill.VOCABULARY]: 0,
      [LanguageSkill.PRONUNCIATION]: 0,
      [LanguageSkill.COMPREHENSION]: 0
    },
    weakAreas: [],
    strongAreas: [],
    learningVelocity: 0,
    retentionRate: 0,
    engagementScore: 0,
    lastActivityDate: Date.now()
  };
}

// Mettre à jour temps d'apprentissage
export function updateLearningTime(analytics: LearningAnalytics, timeSpent: number): LearningAnalytics {
  return {
    ...analytics,
    totalTimeSpent: analytics.totalTimeSpent + timeSpent,
    lastActivityDate: Date.now()
  };
}

// Calculer vélocité d'apprentissage
export function calculateLearningVelocity(analytics: LearningAnalytics): number {
  if (analytics.totalTimeSpent === 0) return 0;
  const hours = analytics.totalTimeSpent / 3600000; // millisecondes en heures
  return analytics.vocabularyLearned / hours;
}

// Mettre à jour niveau de compétence
export function updateSkillLevel(analytics: LearningAnalytics, skill: LanguageSkill, level: number): LearningAnalytics {
  return {
    ...analytics,
    skillLevels: {
      ...analytics.skillLevels,
      [skill]: level
    }
  };
}

// Calculer score d'engagement
export function calculateEngagementScore(analytics: any): number {
  let score = 0;
  
  // Facteurs d'engagement
  score += Math.min(analytics.streakDays * 5, 30); // Série (max 30 points)
  score += Math.min(analytics.averageScore * 0.3, 30); // Performance (max 30 points)
  score += Math.min(analytics.lessonsCompleted * 2, 25); // Progression (max 25 points)
  score += Math.min((analytics.totalTimeSpent / 3600000) * 3, 15); // Temps (max 15 points)
  
  return Math.min(score, 100);
}

// ===== PERSISTENCE =====

// Créer état éducatif
export function createEducationState(): EducationState {
  return {
    currentLesson: null,
    availableLessons: [],
    completedLessons: [],
    currentCourse: null,
    enrolledCourses: [],
    vocabulary: [],
    commonPhrases: [],
    dictionary: createDictionary('en', 'fr'),
    spacedRepetitionCards: [],
    culturalNotes: [],
    assessments: [],
    recommendations: [],
    preferences: DEFAULT_LEARNING_PREFERENCES,
    analytics: createLearningAnalytics()
  };
}

// Sauvegarder état
export function saveEducationState(state: EducationState): void {
  try {
    localStorage.setItem('education-state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save education state:', error);
  }
}

// Charger état
export function loadEducationState(): EducationState | null {
  try {
    const saved = localStorage.getItem('education-state');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load education state:', error);
    return null;
  }
}

// Exporter progression
export function exportUserProgress(userId: string, progress: any): string {
  const exportData = {
    userId,
    exportDate: new Date().toISOString(),
    ...progress
  };
  
  return JSON.stringify(exportData, null, 2);
}