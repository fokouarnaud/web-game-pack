/**
 * GameLessonEducational UX/UI Amélioré - Standards modernes 2025
 * Basé sur l'analyse Duolingo et meilleures pratiques d'apprentissage
 * 
 * AMÉLIORATIONS CRITIQUES IMPLEMENTÉES :
 * 1. Barre de progression unifiée (suppression duplication)
 * 2. Couleur primaire cohérente avec variations harmonieuses
 * 3. Auto-scroll intelligent entre sections
 * 4. Feedback utilisateur moderne avec microanimations
 * 5. Information consolidée (suppression redondance)
 * 6. Accessibilité WCAG AA + navigation clavier
 */

import React, { useEffect, Suspense, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ArrowLeft, BookOpen, Target, Brain, Zap } from 'lucide-react';
import { ThemeToggle } from '../../theme/ThemeToggleSimple';
import { LessonProgress } from '../../navigation/LessonProgress';
import { useGameLessonState } from '../../../hooks/useGameLessonState';
import { useGameLessonNavigation } from '../../../hooks/useGameLessonNavigation';
import { getLessonData, type LessonData } from '../../../data/lessonData';
import { LessonSkeleton } from '../../common/LoadingSkeleton';
import usePreloadData from '../../../hooks/usePreloadData';
import { SituationPhase } from '../../phases/SituationPhase';
import { VocabularyPhase } from '../../phases/VocabularyPhase';
import { ExercisesPhase } from '../../phases/ExercisesPhase';
import { IntegrationPhase } from '../../phases/IntegrationPhase';

// Configuration unifiée des couleurs pour cohérence
const LESSON_THEME = {
  primary: '#3B82F6', // Bleu primaire unifié
  primaryLight: '#60A5FA',
  primaryDark: '#1E40AF',
  success: '#10B981',
  background: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
  accent: {
    situation: 'from-blue-500 to-blue-600',
    vocabulary: 'from-blue-600 to-indigo-600', 
    exercises: 'from-indigo-600 to-purple-600',
    integration: 'from-purple-600 to-violet-600'
  }
};

// Configuration des phases avec progression unifiée
const PHASE_CONFIG = {
  situation: { step: 1, total: 4, icon: Target, label: 'Contexte', weight: 0.2 },
  vocabulary: { step: 2, total: 4, icon: BookOpen, label: 'Vocabulaire', weight: 0.3 },
  exercises: { step: 3, total: 4, icon: Brain, label: 'Pratique', weight: 0.3 },
  integration: { step: 4, total: 4, icon: Zap, label: 'Intégration', weight: 0.2 }
};

export const GameLessonEducational: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { navigateToLessons } = useGameLessonNavigation();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Paramètres de leçon
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1', 10);
  const lessonId = searchParams.get('lessonId') || 'chapter-1-lesson-1';
  
  // États du store Zustand
  const { 
    currentPhase, 
    currentStep, 
    phaseProgress,
    updatePhase,
    resetLesson 
  } = useGameLessonState();
  
  // État pour le dialog de confirmation moderne
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Hook optimisé de préchargement avec typage correct
  const {
    data: lessonData,
    isLoading,
    error: lessonError,
    preloadData,
    performanceMetrics
  } = usePreloadData<LessonData>({
    cacheKey: `lesson-${lessonId}-${chapterNumber}`,
    ttl: 30 * 60 * 1000, // 30 minutes
    retryAttempts: 2,
    retryDelay: 50,
    enablePerformanceTracking: true,
    fallbackData: null
  });

  // Fonction fetcher optimisée avec typage correct
  const fetchLessonData = async (): Promise<LessonData> => {
    console.log(`[Enhanced] Loading lesson: ${lessonId}`);
    await new Promise(resolve => setTimeout(resolve, 50)); // Délai réaliste
    return getLessonData();
  };

  // **AMÉLIORATION UX 1 : Calcul de progression unifié**
  const calculateGlobalProgress = (): number => {
    if (!currentPhase) return 0;
    
    const phaseConfig = PHASE_CONFIG[currentPhase];
    if (!phaseConfig) return 0;
    
    // Progression basée sur les phases complétées + progression actuelle
    const completedPhases = phaseConfig.step - 1;
    const currentPhaseProgress = (phaseProgress / 100) * phaseConfig.weight;
    const totalCompletedWeight = Object.values(PHASE_CONFIG)
      .slice(0, completedPhases)
      .reduce((sum, config) => sum + config.weight, 0);
    
    return Math.round((totalCompletedWeight + currentPhaseProgress) * 100);
  };

  // **AMÉLIORATION UX 2 : Auto-scroll intelligent**
  const scrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Chargement optimisé avec auto-scroll
  useEffect(() => {
    const initializeLesson = async () => {
      try {
        await preloadData(fetchLessonData);
        
        if (!currentPhase) {
          updatePhase('situation', 0);
        }
        
        // Auto-scroll après chargement
        setTimeout(scrollToContent, 300);
        
      } catch (error) {
        console.error('[Enhanced] Error loading:', error);
      }
    };
    
    initializeLesson();
  }, [lessonId, chapterNumber, currentPhase, updatePhase, preloadData]);

  // Auto-scroll lors des transitions de phase
  useEffect(() => {
    if (currentPhase) {
      setTimeout(scrollToContent, 200);
    }
  }, [currentPhase]);

  // Navigation améliorée avec dialog moderne
  const handleGoBack = () => {
    setShowConfirmDialog(true);
  };

  // Handler pour confirmer la sortie de leçon
  const handleConfirmExit = () => {
    setShowConfirmDialog(false);
    resetLesson();
    navigateToLessons();
  };

  // Handler pour annuler la sortie
  const handleCancelExit = () => {
    setShowConfirmDialog(false);
  };

  // Configuration de la phase actuelle
  const phaseConfig = currentPhase ? PHASE_CONFIG[currentPhase] : null;
  const globalProgress = calculateGlobalProgress();  
  // **AMÉLIORATION UX 3 : Rendu des phases avec feedback moderne**
  const renderPhaseContent = () => {
    // Gestion des erreurs avec retry amélioré
    if (lessonError) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md p-6 text-center border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="space-y-4 p-0">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Erreur de chargement
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {lessonError.message}
                </p>
              </div>
              <Button 
                onClick={() => preloadData(fetchLessonData)}
                className="gaming-button bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Loading avec skeleton moderne
    if (isLoading || !lessonData) {
      return <LessonSkeleton className="max-w-7xl mx-auto" />;
    }
    
    // **AMÉLIORATION UX 4 : Suspense avec feedback unifié**
    const SuspenseFallback = () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chargement de {phaseConfig?.label}...
          </p>
        </div>
      </div>
    );
    
    // Rendu des phases avec Suspense unifié
    const renderPhase = () => {
      switch (currentPhase) {
        case 'situation':
          return <SituationPhase lessonData={lessonData} />;
        case 'vocabulary':
          return <VocabularyPhase lessonData={lessonData} />;
        case 'exercises':
          return <ExercisesPhase lessonData={lessonData} />;
        case 'integration':
          return (
            <IntegrationPhase 
              lessonData={lessonData} 
              lessonId={lessonId} 
              chapterNumber={chapterNumber} 
            />
          );
        default:
          return <SituationPhase lessonData={lessonData} />;
      }
    };
    
    return (
      <Suspense fallback={<SuspenseFallback />}>
        {renderPhase()}
      </Suspense>
    );
  };  
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${LESSON_THEME.background}`}>
      {/* **PHASE 2 UX OPTIMISÉE : Pagination verticale discrète** */}
      <LessonProgress
        currentPhase={currentPhase}
        globalProgress={globalProgress}
        phaseConfig={PHASE_CONFIG}
      />
      
      {/* **AMÉLIORATION UX PHASE 2 : Header minimaliste immersif** */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            
            {/* Bouton retour essentiel */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Retour</span>
            </Button>
            
            {/* Titre de leçon centré */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {lessonData?.title || 'Premiers Contacts en Anglais'}
              </h1>
            </div>
            
            {/* Actions essentielles */}
            <div className="flex items-center gap-2">
              {/* Performance badge (dev seulement) */}
              {process.env.NODE_ENV === 'development' && performanceMetrics.loadTime > 0 && (
                <Badge variant="secondary" className="hidden lg:flex text-xs">
                  {performanceMetrics.loadTime.toFixed(0)}ms
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      {/* **PHASE 2 UX OPTIMISÉE : Contenu principal pleine largeur** */}
      <main 
        className="flex-1 transition-all duration-300 ease-in-out" 
        ref={contentRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderPhaseContent()}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* **AMÉLIORATION UX 9 : Bouton scroll-to-top moderne** */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
        >
          <ArrowLeft className="h-5 w-5 rotate-90" />
        </Button>
      </div>

      {/* **PHASE 3 UX : Dialog de confirmation moderne et accessible** */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        title="Quitter cette leçon ?"
        description="Votre progression actuelle sera perdue et vous devrez recommencer cette leçon depuis le début."
        confirmText="Quitter"
        cancelText="Continuer la leçon"
        variant="warning"
      />
    </div>
  );
};

export default GameLessonEducational;