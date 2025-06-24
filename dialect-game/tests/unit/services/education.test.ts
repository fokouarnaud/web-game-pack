/**
 * Tests unitaires pour le système de contenu éducatif avancé
 * Task 14: Contenu Éducatif Avancé - Phase TDD
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  Lesson,
  Exercise,
  VocabularyItem,
  CommonPhrase,
  DictionaryEntry,
  SpacedRepetitionCard,
  Course,
  Assessment,
  LearningRecommendation,
  ExerciseType,
  DifficultyLevel,
  ContentCategory,
  LanguageSkill,
  PartOfSpeech,
  DEFAULT_LEARNING_PREFERENCES,
  SPACED_REPETITION_CONFIG
} from '../../../src/types/education';

import {
  createLesson,
  canAccessLesson,
  calculateLessonProgress,
  unlockNextLessons,
  saveLessonProgress,
  createLessonWithExercises,
  createExercise,
  validateAnswer,
  calculateExerciseScore,
  recordExerciseAttempt,
  getNextHint,
  createVocabularyItem,
  toggleVocabularyFavorite,
  updateMasteryLevel,
  searchVocabulary,
  saveVocabularyItem,
  createDictionaryEntry,
  createDictionary,
  searchDictionary,
  addCustomEntry,
  addRecentSearch,
  toggleDictionaryFavorite,
  createSpacedRepetitionCard,
  calculateNextReviewDate,
  processReview,
  getCardsDueForReview,
  createCourse,
  calculateCourseProgress,
  enrollInCourse,
  checkCertificateEligibility,
  createAssessment,
  analyzeSkillPerformance,
  generateRecommendations,
  createCommonPhrase,
  searchPhrasesBySituation,
  getPhraseAlternatives,
  createCulturalNote,
  getCulturalNotesForLesson,
  createLearningAnalytics,
  updateLearningTime,
  calculateLearningVelocity,
  updateSkillLevel,
  calculateEngagementScore,
  createEducationState,
  saveEducationState,
  loadEducationState,
  exportUserProgress
} from '../../../src/services/education/educationService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Education System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2025-06-15T11:00:00Z'));
  });

  describe('Lesson Management', () => {
    test('should create a structured lesson', () => {
      const lesson = createLesson({
        title: 'Basic Greetings',
        level: DifficultyLevel.BEGINNER,
        category: ContentCategory.GREETINGS,
        language: 'en',
        targetLanguage: 'fr'
      });

      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBe('Basic Greetings');
      expect(lesson.level).toBe(DifficultyLevel.BEGINNER);
      expect(lesson.category).toBe(ContentCategory.GREETINGS);
      expect(lesson.isUnlocked).toBe(true);
      expect(lesson.progress).toBe(0);
      expect(Array.isArray(lesson.exercises)).toBe(true);
    });

    test('should check lesson prerequisites', () => {
      const basicLesson = createLesson({ title: 'Basics' });
      const advancedLesson = createLesson({ 
        title: 'Advanced',
        prerequisiteIds: [basicLesson.id]
      });

      const canAccess = canAccessLesson(advancedLesson, []);
      const canAccessWithPrereq = canAccessLesson(advancedLesson, [basicLesson.id]);

      expect(canAccess).toBe(false);
      expect(canAccessWithPrereq).toBe(true);
    });

    test('should calculate lesson progress', () => {
      const lesson = createLessonWithExercises(5);
      const completedExercises = [lesson.exercises[0].id, lesson.exercises[1].id];

      const progress = calculateLessonProgress(lesson, completedExercises);

      expect(progress).toBe(0.4); // 2/5 exercises completed
    });

    test('should unlock next lessons after completion', () => {
      const lesson1 = createLesson({ title: 'Lesson 1' });
      const lesson2 = createLesson({
        title: 'Lesson 2',
        prerequisiteIds: [lesson1.id]
      });
      lesson2.isUnlocked = false; // Modifier après création

      const updatedLessons = unlockNextLessons([lesson1, lesson2], lesson1.id);

      expect(updatedLessons.find(l => l.id === lesson2.id)?.isUnlocked).toBe(true);
    });

    test('should save lesson progress', () => {
      const lesson = createLesson({ title: 'Test Lesson' });
      
      saveLessonProgress(lesson.id, 0.7, true);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `lesson-progress-${lesson.id}`,
        expect.stringContaining('0.7')
      );
    });
  });

  describe('Exercise System', () => {
    test('should create different types of exercises', () => {
      const translationEx = createExercise(ExerciseType.TRANSLATION, {
        question: 'Translate: Hello',
        correctAnswer: 'Bonjour'
      });

      const mcqEx = createExercise(ExerciseType.MULTIPLE_CHOICE, {
        question: 'What is "hello" in French?',
        options: ['Bonjour', 'Au revoir', 'Merci'],
        correctAnswer: 'Bonjour'
      });

      expect(translationEx.type).toBe(ExerciseType.TRANSLATION);
      expect(mcqEx.type).toBe(ExerciseType.MULTIPLE_CHOICE);
      expect(mcqEx.options).toHaveLength(3);
    });

    test('should validate exercise answers', () => {
      const exercise = createExercise(ExerciseType.TRANSLATION, {
        question: 'Hello',
        correctAnswer: 'Bonjour',
        acceptableAnswers: ['Salut', 'Coucou']
      });

      expect(validateAnswer(exercise, 'Bonjour')).toBe(true);
      expect(validateAnswer(exercise, 'Salut')).toBe(true);
      expect(validateAnswer(exercise, 'Au revoir')).toBe(false);
    });

    test('should calculate exercise score', () => {
      const exercise = createExercise(ExerciseType.TRANSLATION, {
        points: 100,
        timeLimit: 30000
      });

      const score1 = calculateExerciseScore(exercise, true, 5000, 0); // Fast, correct, no hints
      const score2 = calculateExerciseScore(exercise, true, 25000, 2); // Slow, correct, hints used

      expect(score1).toBeGreaterThan(score2);
      expect(score1).toBeLessThanOrEqual(100);
    });

    test('should track exercise attempts', () => {
      const exercise = createExercise(ExerciseType.TRANSLATION);
      const attempt = {
        answer: 'Bonjour',
        isCorrect: true,
        timeSpent: 5000,
        hintsUsed: 0
      };

      const updatedExercise = recordExerciseAttempt(exercise, 'user-1', attempt);

      expect(updatedExercise.attempts).toHaveLength(1);
      expect(updatedExercise.attempts[0].isCorrect).toBe(true);
    });

    test('should provide hints progressively', () => {
      const exercise = createExercise(ExerciseType.TRANSLATION, {
        hints: ['It\'s a greeting', 'Starts with B', 'Bon___']
      });

      expect(getNextHint(exercise, 0)).toBe('It\'s a greeting');
      expect(getNextHint(exercise, 1)).toBe('Starts with B');
      expect(getNextHint(exercise, 2)).toBe('Bon___');
      expect(getNextHint(exercise, 3)).toBeNull();
    });
  });

  describe('Vocabulary Management', () => {
    test('should create vocabulary item with metadata', () => {
      const vocab = createVocabularyItem({
        word: 'bonjour',
        translation: 'hello',
        pronunciation: 'bon-ZHOOR',
        partOfSpeech: PartOfSpeech.INTERJECTION,
        difficulty: DifficultyLevel.BEGINNER
      });

      expect(vocab.word).toBe('bonjour');
      expect(vocab.translation).toBe('hello');
      expect(vocab.partOfSpeech).toBe(PartOfSpeech.INTERJECTION);
      expect(vocab.masteryLevel).toBe(0);
      expect(vocab.timesReviewed).toBe(0);
    });

    test('should add vocabulary to favorites', () => {
      const vocab = createVocabularyItem({ word: 'test' });
      
      const updatedVocab = toggleVocabularyFavorite(vocab, true);

      expect(updatedVocab.isFavorite).toBe(true);
    });

    test('should update mastery level based on reviews', () => {
      const vocab = createVocabularyItem({ word: 'test' });
      const correctReviews = 5;
      const totalReviews = 7;

      const updatedVocab = updateMasteryLevel(vocab, correctReviews, totalReviews);

      expect(updatedVocab.masteryLevel).toBeCloseTo(0.71, 2); // 5/7
      expect(updatedVocab.timesReviewed).toBe(totalReviews);
    });

    test('should search vocabulary by criteria', () => {
      const vocabList = [
        createVocabularyItem({ word: 'bonjour', partOfSpeech: PartOfSpeech.INTERJECTION }),
        createVocabularyItem({ word: 'chat', partOfSpeech: PartOfSpeech.NOUN }),
        createVocabularyItem({ word: 'courir', partOfSpeech: PartOfSpeech.VERB })
      ];

      const nouns = searchVocabulary(vocabList, { partOfSpeech: PartOfSpeech.NOUN });
      const wordSearch = searchVocabulary(vocabList, { query: 'bon' });

      expect(nouns).toHaveLength(1);
      expect(nouns[0].word).toBe('chat');
      expect(wordSearch).toHaveLength(1);
      expect(wordSearch[0].word).toBe('bonjour');
    });

    test('should save vocabulary to local storage', () => {
      const vocab = createVocabularyItem({
        word: 'test',
        translation: 'test',
        pronunciation: 'test',
        partOfSpeech: PartOfSpeech.NOUN,
        difficulty: DifficultyLevel.BEGINNER
      });
      
      saveVocabularyItem(vocab);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vocabulary-items',
        expect.stringContaining('test')
      );
    });
  });

  describe('Dictionary System', () => {
    test('should search dictionary entries', () => {
      const entries = [
        createDictionaryEntry({ word: 'hello', translations: [{ text: 'bonjour' }] }),
        createDictionaryEntry({ word: 'goodbye', translations: [{ text: 'au revoir' }] })
      ];

      const results = searchDictionary(entries, 'hello');

      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('hello');
    });

    test('should add custom dictionary entry', () => {
      const dictionary = createDictionary('en', 'fr');
      const customEntry = createDictionaryEntry({
        word: 'slang-word',
        translations: [{ text: 'mot-argot' }],
        isCustom: true
      });

      const updatedDictionary = addCustomEntry(dictionary, customEntry);

      expect(updatedDictionary.customEntries).toContain(customEntry);
    });

    test('should track recent searches', () => {
      const dictionary = createDictionary('en', 'fr');
      
      const updatedDictionary = addRecentSearch(dictionary, 'hello');

      expect(updatedDictionary.recentSearches).toContain('hello');
    });

    test('should manage dictionary favorites', () => {
      const dictionary = createDictionary('en', 'fr');
      const entryId = 'entry-1';

      const updated1 = toggleDictionaryFavorite(dictionary, entryId, true);
      const updated2 = toggleDictionaryFavorite(updated1, entryId, false);

      expect(updated1.favorites).toContain(entryId);
      expect(updated2.favorites).not.toContain(entryId);
    });
  });

  describe('Spaced Repetition System', () => {
    test('should create spaced repetition card', () => {
      const card = createSpacedRepetitionCard({
        type: 'vocabulary',
        contentId: 'vocab-1',
        userId: 'user-1'
      });

      expect(card.interval).toBe(SPACED_REPETITION_CONFIG.intervals[0]);
      expect(card.easeFactor).toBe(SPACED_REPETITION_CONFIG.easeFactor.default);
      expect(card.repetitions).toBe(0);
      expect(card.isActive).toBe(true);
    });

    test('should calculate next review date', () => {
      const card = createSpacedRepetitionCard({ type: 'vocabulary' });
      
      const nextDate = calculateNextReviewDate(card, 4); // Good quality

      expect(nextDate).toBeGreaterThan(Date.now());
    });

    test('should update card after review', () => {
      const card = createSpacedRepetitionCard({ type: 'vocabulary' });
      
      const updatedCard = processReview(card, 5, 3000); // Perfect quality, 3 seconds

      expect(updatedCard.repetitions).toBe(1);
      expect(updatedCard.interval).toBeGreaterThan(card.interval);
      expect(updatedCard.history).toHaveLength(1);
    });

    test('should reset card on poor review', () => {
      const card = createSpacedRepetitionCard({ 
        type: 'vocabulary',
        repetitions: 3,
        interval: 7
      });
      
      const updatedCard = processReview(card, 1, 10000); // Poor quality

      expect(updatedCard.repetitions).toBe(0);
      expect(updatedCard.interval).toBe(SPACED_REPETITION_CONFIG.intervals[0]);
    });

    test('should get cards due for review', () => {
      const cards = [
        createSpacedRepetitionCard({ nextReviewDate: Date.now() - 86400000 }), // Past due
        createSpacedRepetitionCard({ nextReviewDate: Date.now() + 86400000 }), // Future
        createSpacedRepetitionCard({ nextReviewDate: Date.now() - 3600000 })   // Past due
      ];

      const dueCards = getCardsDueForReview(cards);

      expect(dueCards).toHaveLength(2);
    });
  });

  describe('Course Management', () => {
    test('should create structured course', () => {
      const course = createCourse({
        title: 'French Basics',
        level: DifficultyLevel.BEGINNER,
        lessonIds: ['lesson-1', 'lesson-2', 'lesson-3']
      });

      expect(course.title).toBe('French Basics');
      expect(course.lessons).toHaveLength(3);
      expect(course.progress.overallProgress).toBe(0);
    });

    test('should calculate course progress', () => {
      const course = createCourse({ lessonIds: ['l1', 'l2', 'l3', 'l4'] });
      const completedLessons = ['l1', 'l2'];

      const progress = calculateCourseProgress(course, completedLessons);

      expect(progress).toBe(0.5); // 2/4 lessons
    });

    test('should enroll user in course', () => {
      const course = createCourse({ title: 'Test Course' });
      
      const enrolledCourse = enrollInCourse(course, 'user-1');

      expect(enrolledCourse.isEnrolled).toBe(true);
      expect(enrolledCourse.progress.startDate).toBe(Date.now());
    });

    test('should award certificate on completion', () => {
      const course = createCourse({ 
        lessonIds: ['l1', 'l2'],
        certificateAwarded: true
      });
      
      const result = checkCertificateEligibility(course, ['l1', 'l2'], 85);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('completed');
    });
  });

  describe('Assessment System', () => {
    test('should create skill assessment', () => {
      const assessment = createAssessment({
        type: 'lesson',
        targetId: 'lesson-1',
        userId: 'user-1',
        score: 85
      });

      expect(assessment.score).toBe(85);
      expect(Array.isArray(assessment.skills)).toBe(true);
      expect(assessment.completedAt).toBe(Date.now());
    });

    test('should analyze strengths and weaknesses', () => {
      const skillScores = {
        [LanguageSkill.VOCABULARY]: 90,
        [LanguageSkill.GRAMMAR]: 60,
        [LanguageSkill.PRONUNCIATION]: 85,
        [LanguageSkill.LISTENING]: 70
      };

      const analysis = analyzeSkillPerformance(skillScores);

      expect(analysis.strengths).toContain(LanguageSkill.VOCABULARY);
      expect(analysis.weaknesses).toContain(LanguageSkill.GRAMMAR);
    });

    test('should generate improvement recommendations', () => {
      const assessment = createAssessment({
        score: 65,
        skills: [
          { skill: LanguageSkill.GRAMMAR, score: 50 },
          { skill: LanguageSkill.VOCABULARY, score: 80 }
        ]
      });

      const recommendations = generateRecommendations(assessment);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.some(r => r.reason.includes('grammar'))).toBe(true);
    });
  });

  describe('Common Phrases System', () => {
    test('should create common phrase with context', () => {
      const phrase = createCommonPhrase({
        phrase: 'Comment allez-vous?',
        translation: 'How are you?',
        situation: 'greeting',
        formality: 'formal'
      });

      expect(phrase.phrase).toBe('Comment allez-vous?');
      expect(phrase.formality).toBe('formal');
      expect(phrase.situation).toBe('greeting');
    });

    test('should search phrases by situation', () => {
      const phrases = [
        createCommonPhrase({ situation: 'greeting', phrase: 'Hello' }),
        createCommonPhrase({ situation: 'farewell', phrase: 'Goodbye' }),
        createCommonPhrase({ situation: 'greeting', phrase: 'Good morning' })
      ];

      const greetings = searchPhrasesBySituation(phrases, 'greeting');

      expect(greetings).toHaveLength(2);
    });

    test('should get phrase alternatives', () => {
      const phrase = createCommonPhrase({
        phrase: 'Comment allez-vous?',
        alternatives: ['Comment ça va?', 'Ça va?']
      });

      const alternatives = getPhraseAlternatives(phrase);

      expect(alternatives).toHaveLength(2);
      expect(alternatives).toContain('Comment ça va?');
    });
  });

  describe('Cultural Notes System', () => {
    test('should create cultural note', () => {
      const note = createCulturalNote({
        title: 'French Greetings',
        content: 'In France, greetings vary by formality...',
        category: 'etiquette',
        language: 'fr'
      });

      expect(note.title).toBe('French Greetings');
      expect(note.category).toBe('etiquette');
      expect(note.language).toBe('fr');
    });

    test('should link cultural notes to lessons', () => {
      const note = createCulturalNote({
        title: 'Test Note',
        relatedLessons: ['lesson-1', 'lesson-2']
      });

      const relatedNotes = getCulturalNotesForLesson('lesson-1', [note]);

      expect(relatedNotes).toHaveLength(1);
      expect(relatedNotes[0]).toBe(note);
    });
  });

  describe('Learning Analytics', () => {
    test('should track learning time', () => {
      const analytics = createLearningAnalytics();
      
      const updated = updateLearningTime(analytics, 1800000); // 30 minutes

      expect(updated.totalTimeSpent).toBe(1800000);
      expect(updated.lastActivityDate).toBe(Date.now());
    });

    test('should calculate learning velocity', () => {
      const analytics = createLearningAnalytics();
      analytics.totalTimeSpent = 3600000; // 1 hour
      analytics.vocabularyLearned = 20;

      const velocity = calculateLearningVelocity(analytics);

      expect(velocity).toBe(20); // 20 words per hour
    });

    test('should update skill levels', () => {
      const analytics = createLearningAnalytics();
      
      const updated = updateSkillLevel(analytics, LanguageSkill.VOCABULARY, 0.8);

      expect(updated.skillLevels[LanguageSkill.VOCABULARY]).toBe(0.8);
    });

    test('should calculate engagement score', () => {
      const analytics = {
        streakDays: 7,
        averageScore: 85,
        totalTimeSpent: 7200000, // 2 hours
        lessonsCompleted: 10
      };

      const engagement = calculateEngagementScore(analytics);

      expect(engagement).toBeGreaterThan(0);
      expect(engagement).toBeLessThanOrEqual(100);
    });
  });

  describe('Persistence and Storage', () => {
    test('should save education state', () => {
      const state = createEducationState();
      
      saveEducationState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'education-state',
        expect.any(String)
      );
    });

    test('should load education state', () => {
      const mockState = createEducationState();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockState));

      const loaded = loadEducationState();

      expect(loaded).toEqual(mockState);
    });

    test('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const state = loadEducationState();

      expect(state).toBeNull();
    });

    test('should export user progress', () => {
      const progress = {
        lessonsCompleted: ['l1', 'l2'],
        vocabularyLearned: 50,
        totalTimeSpent: 3600000
      };

      const exported = exportUserProgress('user-1', progress);

      expect(exported).toContain('user-1');
      expect(exported).toContain('vocabularyLearned');
    });
  });
});

// Tests using real implementations from educationService