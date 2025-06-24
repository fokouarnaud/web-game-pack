/**
 * Tableau de bord éducatif avancé avec leçons, vocabulaire, dictionnaire
 * Task 14: Contenu Éducatif Avancé - Phase 3
 */

import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardTitle, EnhancedCardDescription, EnhancedCardFooter } from './ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { createToastHelpers, useToast } from './ui/toast';
import type { 
  Lesson, 
  Exercise, 
  VocabularyItem, 
  DictionaryEntry, 
  CommonPhrase,
  SpacedRepetitionCard,
  Course,
  EducationState 
} from '../types/education';
import { 
  ExerciseType,
  DifficultyLevel,
  ContentCategory,
  LanguageSkill,
  PartOfSpeech,
  DEFAULT_CONTENT_CATEGORIES
} from '../types/education';

import {
  createLesson,
  createExercise,
  createVocabularyItem,
  createCommonPhrase,
  createDictionary,
  createEducationState,
  validateAnswer,
  calculateExerciseScore,
  recordExerciseAttempt,
  getNextHint,
  createSpacedRepetitionCard,
  getCardsDueForReview,
  processReview,
  saveEducationState,
  loadEducationState
} from '../services/education/educationService';

interface EducationDashboardProps {
  className?: string;
}

export const EducationDashboard: React.FC<EducationDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const toastHelpers = createToastHelpers(toast);
  
  const [educationState, setEducationState] = useState<EducationState | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'lessons' | 'vocabulary' | 'dictionary' | 'review'>('overview');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialisation
  useEffect(() => {
    initializeEducation();
  }, []);

  const initializeEducation = () => {
    let state = loadEducationState();
    
    if (!state) {
      state = createEducationState();
      
      // Ajouter des leçons de démonstration
      const basicLesson = createLesson({
        title: 'Salutations de base',
        level: DifficultyLevel.BEGINNER,
        category: ContentCategory.GREETINGS,
        language: 'fr',
        targetLanguage: 'en'
      });
      
      // Ajouter des exercices à la leçon
      const exercises = [
        createExercise(ExerciseType.TRANSLATION, {
          question: 'Comment dit-on "Bonjour" en anglais ?',
          correctAnswer: 'Hello',
          acceptableAnswers: ['Hi', 'Good morning'],
          hints: ['C\'est une salutation courante', 'Commence par H', 'He___']
        }),
        createExercise(ExerciseType.MULTIPLE_CHOICE, {
          question: 'Quelle est la traduction de "Good evening" ?',
          options: ['Bonne nuit', 'Bonsoir', 'Bon après-midi', 'Bonjour'],
          correctAnswer: 'Bonsoir'
        }),
        createExercise(ExerciseType.FILL_BLANKS, {
          question: 'Complétez: "Good ___" (pour dire au revoir)',
          correctAnswer: 'bye',
          acceptableAnswers: ['goodbye'],
          hints: ['C\'est court', 'Bye']
        })
      ];
      
      basicLesson.exercises = exercises;
      state.availableLessons = [basicLesson];
      
      // Ajouter du vocabulaire de base
      const vocabulary = [
        createVocabularyItem({
          word: 'hello',
          translation: 'bonjour',
          pronunciation: 'heh-LOW',
          partOfSpeech: PartOfSpeech.INTERJECTION,
          difficulty: DifficultyLevel.BEGINNER
        }),
        createVocabularyItem({
          word: 'goodbye',
          translation: 'au revoir',
          pronunciation: 'good-BYE',
          partOfSpeech: PartOfSpeech.INTERJECTION,
          difficulty: DifficultyLevel.BEGINNER
        }),
        createVocabularyItem({
          word: 'thank you',
          translation: 'merci',
          pronunciation: 'THANK-you',
          partOfSpeech: PartOfSpeech.INTERJECTION,
          difficulty: DifficultyLevel.BEGINNER
        })
      ];
      
      state.vocabulary = vocabulary;
      
      // Ajouter phrases courantes
      const phrases = [
        createCommonPhrase({
          phrase: 'How are you?',
          translation: 'Comment allez-vous ?',
          pronunciation: 'how-are-YOU',
          situation: 'greeting',
          formality: 'neutral',
          alternatives: ['How\'s it going?', 'How are you doing?']
        }),
        createCommonPhrase({
          phrase: 'Nice to meet you',
          translation: 'Enchanté(e) de vous rencontrer',
          pronunciation: 'nice-to-MEET-you',
          situation: 'introduction',
          formality: 'formal'
        })
      ];
      
      state.commonPhrases = phrases;
      
      saveEducationState(state);
    }
    
    setEducationState(state);
    toastHelpers.success('Système éducatif initialisé', 'Prêt pour l\'apprentissage !');
  };

  // Démarrer une leçon
  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (lesson.exercises.length > 0) {
      setCurrentExercise(lesson.exercises[0]);
      setUserAnswer('');
      setHintsUsed(0);
    }
    setCurrentView('lessons');
    toastHelpers.info('Leçon démarrée', `Commençons "${lesson.title}"`);
  };

  // Soumettre une réponse
  const submitAnswer = () => {
    if (!currentExercise || !userAnswer.trim()) return;

    const isCorrect = validateAnswer(currentExercise, userAnswer);
    const timeSpent = Math.random() * 10000 + 2000; // Simulation
    const score = calculateExerciseScore(currentExercise, isCorrect, timeSpent, hintsUsed);
    
    const attempt = {
      answer: userAnswer,
      isCorrect,
      timeSpent,
      hintsUsed,
      score
    };

    const updatedExercise = recordExerciseAttempt(currentExercise, 'demo-user', attempt);
    setCurrentExercise(updatedExercise);

    if (isCorrect) {
      toastHelpers.success('✅ Correct !', `+${score} points`);
      
      // Passer à l'exercice suivant après un délai
      setTimeout(() => {
        nextExercise();
      }, 1500);
    } else {
      toastHelpers.error('❌ Incorrect', 'Essayez encore ou demandez un indice');
    }
  };

  // Exercice suivant
  const nextExercise = () => {
    if (!selectedLesson || !currentExercise) return;

    const currentIndex = selectedLesson.exercises.findIndex(ex => ex.id === currentExercise.id);
    if (currentIndex < selectedLesson.exercises.length - 1) {
      setCurrentExercise(selectedLesson.exercises[currentIndex + 1]);
      setUserAnswer('');
      setHintsUsed(0);
    } else {
      // Leçon terminée
      toastHelpers.success('🎉 Leçon terminée !', 'Félicitations pour vos progrès');
      setCurrentView('overview');
      setSelectedLesson(null);
      setCurrentExercise(null);
    }
  };

  // Demander un indice
  const getHint = () => {
    if (!currentExercise) return;

    const hint = getNextHint(currentExercise, hintsUsed);
    if (hint) {
      setHintsUsed(prev => prev + 1);
      toastHelpers.info('💡 Indice', hint);
    } else {
      toastHelpers.warning('Aucun indice disponible', 'Vous avez utilisé tous les indices');
    }
  };

  // Ajouter au vocabulaire favori
  const toggleVocabFavorite = (vocabId: string) => {
    if (!educationState) return;

    const updatedVocab = educationState.vocabulary.map(item => 
      item.id === vocabId ? { ...item, isFavorite: !item.isFavorite } : item
    );

    const updatedState = { ...educationState, vocabulary: updatedVocab };
    setEducationState(updatedState);
    saveEducationState(updatedState);

    toastHelpers.success('Favoris mis à jour', 'Mot ajouté/retiré des favoris');
  };

  // Filtrer le vocabulaire
  const filteredVocabulary = educationState?.vocabulary.filter(item =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translation.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Vue d'ensemble
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Système Éducatif Avancé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Apprenez avec des leçons structurées, exercices variés et outils d'étude
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Leçons */}
        <EnhancedCard 
          variant="interactive" 
          hover 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => setCurrentView('lessons')}
        >
          <EnhancedCardHeader>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">📚</span>
            </div>
            <EnhancedCardTitle className="text-center">Leçons</EnhancedCardTitle>
            <EnhancedCardDescription className="text-center">
              Cours structurés par niveau et thème
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {educationState?.availableLessons.length || 0}
            </div>
            <div className="text-sm text-gray-500">disponibles</div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Vocabulaire */}
        <EnhancedCard 
          variant="interactive" 
          hover 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => setCurrentView('vocabulary')}
        >
          <EnhancedCardHeader>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">📝</span>
            </div>
            <EnhancedCardTitle className="text-center">Vocabulaire</EnhancedCardTitle>
            <EnhancedCardDescription className="text-center">
              Mots et expressions avec audio
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {educationState?.vocabulary.length || 0}
            </div>
            <div className="text-sm text-gray-500">mots appris</div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Dictionnaire */}
        <EnhancedCard 
          variant="interactive" 
          hover 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => setCurrentView('dictionary')}
        >
          <EnhancedCardHeader>
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">📖</span>
            </div>
            <EnhancedCardTitle className="text-center">Dictionnaire</EnhancedCardTitle>
            <EnhancedCardDescription className="text-center">
              Recherche et traductions instantanées
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {educationState?.dictionary.favorites.length || 0}
            </div>
            <div className="text-sm text-gray-500">favoris</div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Révisions */}
        <EnhancedCard 
          variant="interactive" 
          hover 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => setCurrentView('review')}
        >
          <EnhancedCardHeader>
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🔄</span>
            </div>
            <EnhancedCardTitle className="text-center">Révisions</EnhancedCardTitle>
            <EnhancedCardDescription className="text-center">
              Système de répétition espacée
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {educationState?.spacedRepetitionCards.length || 0}
            </div>
            <div className="text-sm text-gray-500">cartes</div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Statistiques rapides */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>Progression aujourd'hui</EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">0</div>
              <div className="text-sm text-gray-500">Minutes d'étude</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">0</div>
              <div className="text-sm text-gray-500">Exercices complétés</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">0</div>
              <div className="text-sm text-gray-500">Nouveaux mots</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">0</div>
              <div className="text-sm text-gray-500">Série actuelle</div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );

  // Vue des leçons
  const renderLessons = () => {
    if (currentExercise) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{selectedLesson?.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Exercice {(selectedLesson?.exercises.findIndex(ex => ex.id === currentExercise.id) ?? -1) + 1} / {selectedLesson?.exercises.length}
              </p>
            </div>
            <EnhancedButton 
              onClick={() => {
                setCurrentView('lessons');
                setCurrentExercise(null);
                setSelectedLesson(null);
              }}
              variant="outline"
              size="sm"
            >
              Retour
            </EnhancedButton>
          </div>

          {/* Exercice actuel */}
          <EnhancedCard variant="elevated">
            <EnhancedCardHeader>
              <EnhancedCardTitle>{currentExercise.title}</EnhancedCardTitle>
              <EnhancedCardDescription>{currentExercise.instructions}</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <div className="text-lg font-medium p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {currentExercise.question}
                </div>

                {currentExercise.type === ExerciseType.MULTIPLE_CHOICE && currentExercise.options ? (
                  <div className="space-y-2">
                    {currentExercise.options.map((option, index) => (
                      <EnhancedButton
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setUserAnswer(option)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </EnhancedButton>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre réponse..."
                      onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <EnhancedButton onClick={submitAnswer} variant="default" disabled={!userAnswer.trim()}>
                    Valider
                  </EnhancedButton>
                  <EnhancedButton onClick={getHint} variant="outline">
                    💡 Indice ({hintsUsed}/{currentExercise.hints.length})
                  </EnhancedButton>
                </div>

                {currentExercise.attempts.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tentatives: {currentExercise.attempts.length}
                  </div>
                )}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Leçons disponibles</h2>
          <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
            Retour
          </EnhancedButton>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {educationState?.availableLessons.map((lesson) => (
            <EnhancedCard key={lesson.id} variant="interactive" hover>
              <EnhancedCardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <EnhancedCardTitle>{lesson.title}</EnhancedCardTitle>
                    <EnhancedCardDescription>{lesson.description}</EnhancedCardDescription>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {lesson.level}
                  </span>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    📝 {lesson.exercises.length} exercices • ⏱️ {lesson.duration} min
                  </div>
                  <div className="text-sm">
                    🎯 Compétences: {lesson.skills.join(', ')}
                  </div>
                </div>
              </EnhancedCardContent>
              <EnhancedCardFooter>
                <EnhancedButton onClick={() => startLesson(lesson)} className="w-full">
                  Commencer la leçon
                </EnhancedButton>
              </EnhancedCardFooter>
            </EnhancedCard>
          ))}
        </div>
      </div>
    );
  };

  // Vue du vocabulaire
  const renderVocabulary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vocabulaire</h2>
        <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
          Retour
        </EnhancedButton>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Rechercher un mot..."
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocabulary.map((vocab) => (
          <EnhancedCard key={vocab.id} variant="elevated">
            <EnhancedCardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <EnhancedCardTitle className="text-lg">{vocab.word}</EnhancedCardTitle>
                  <EnhancedCardDescription>{vocab.translation}</EnhancedCardDescription>
                </div>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVocabFavorite(vocab.id)}
                >
                  {vocab.isFavorite ? '❤️' : '🤍'}
                </EnhancedButton>
              </div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2 text-sm">
                <div>🔊 {vocab.pronunciation}</div>
                <div>📝 {vocab.partOfSpeech}</div>
                <div>📊 Niveau: {vocab.difficulty}</div>
                <div>⭐ Maîtrise: {Math.round(vocab.masteryLevel * 100)}%</div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>
    </div>
  );

  // Vue dictionnaire simplifiée
  const renderDictionary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dictionnaire</h2>
        <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
          Retour
        </EnhancedButton>
      </div>

      <EnhancedCard>
        <EnhancedCardContent className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold mb-2">Dictionnaire interactif</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Fonctionnalité avancée en développement
          </p>
          <EnhancedButton variant="outline">Bientôt disponible</EnhancedButton>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );

  // Vue révisions
  const renderReview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Révisions espacées</h2>
        <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
          Retour
        </EnhancedButton>
      </div>

      <EnhancedCard>
        <EnhancedCardContent className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold mb-2">Système de révision</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Révisions intelligentes basées sur l'algorithme d'Ebbinghaus
          </p>
          <EnhancedButton variant="outline">Bientôt disponible</EnhancedButton>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );

  if (!educationState) {
    return (
      <EnhancedCard className={className}>
        <EnhancedCardContent className="text-center py-8">
          <div className="text-gray-500">Chargement du système éducatif...</div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {currentView === 'overview' && renderOverview()}
      {currentView === 'lessons' && renderLessons()}
      {currentView === 'vocabulary' && renderVocabulary()}
      {currentView === 'dictionary' && renderDictionary()}
      {currentView === 'review' && renderReview()}
    </div>
  );
};

export default EducationDashboard;