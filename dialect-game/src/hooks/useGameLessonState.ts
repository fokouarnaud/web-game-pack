/**
 * useGameLessonState - Hook personnalisé pour gestion centralisée des états de leçon
 * Encapsule l'utilisation du GameStore étendu spécifiquement pour les composants game-lesson
 * Fournit une API simple et sécurisée pour gérer les états de leçon et de dialogue
 */

import { useCallback } from 'react';
import { useGameStore, type LessonState, type DialogueState, type GlobalGameState } from '../stores/gameStore';

// Interface pour le hook useGameLessonState
export interface GameLessonStateHook {
  // Getters - État actuel
  currentPhase: LessonState['currentPhase'];
  currentStep: number;
  phaseProgress: number;
  dialogueState: DialogueState;
  
  // Setters - Actions pour modifier l'état
  updatePhase: (phase: LessonState['currentPhase'], step?: number) => void;
  updateStep: (step: number) => void;
  updateProgress: (progress: number) => void;
  updateDialogue: (dialogueState: Partial<DialogueState>) => void;
  
  // Actions - Opérations complexes
  resetLesson: () => void;
  completePhase: () => void;
  moveToNextStep: () => void;
  startPhase: (phase: LessonState['currentPhase']) => void;
  
  // Utilitaires
  isPhaseCompleted: (phase: LessonState['currentPhase']) => boolean;
  getTotalStepsForCurrentPhase: () => number;
}

/**
 * Hook useGameLessonState
 * Point d'entrée principal pour tous les composants game-lesson
 * Utilise maintenant le store Zustand étendu directement
 */
export const useGameLessonState = (): GameLessonStateHook => {
  // Utilisation du store Zustand étendu
  const lessonState = useGameStore((state) => state.lessonState);
  const dialogueState = useGameStore((state) => state.dialogueState);
  const updateLessonPhase = useGameStore((state) => state.updateLessonPhase);
  const updateLessonProgress = useGameStore((state) => state.updateLessonProgress);
  const updateDialogueStateAction = useGameStore((state) => state.updateDialogueState);
  const resetLessonStateAction = useGameStore((state) => state.resetLessonState);
  
  // Getters - Accès direct aux états du store
  const currentPhase = lessonState.currentPhase;
  const currentStep = lessonState.currentStep;
  const phaseProgress = lessonState.phaseProgress;
  
  // Setters - Actions pour modifier l'état avec validation
  const updatePhase = useCallback((phase: LessonState['currentPhase'], step?: number) => {
    console.log(`[useGameLessonState] Updating phase to: ${phase}, step: ${step}`);
    updateLessonPhase(phase, step);
  }, [updateLessonPhase]);
  
  const updateStep = useCallback((step: number) => {
    console.log(`[useGameLessonState] Updating step to: ${step}`);
    updateLessonProgress(step);
  }, [updateLessonProgress]);
  
  const updateProgress = useCallback((progress: number) => {
    console.log(`[useGameLessonState] Updating progress to: ${progress}%`);
    updateLessonProgress(undefined, progress);
  }, [updateLessonProgress]);
  
  const updateDialogue = useCallback((newDialogueState: Partial<DialogueState>) => {
    console.log(`[useGameLessonState] Updating dialogue state:`, newDialogueState);
    updateDialogueStateAction(newDialogueState);
  }, [updateDialogueStateAction]);
  
  // Actions - Opérations complexes utilisant le store Zustand
  const resetLesson = useCallback(() => {
    console.log(`[useGameLessonState] Resetting lesson state`);
    resetLessonStateAction();
  }, [resetLessonStateAction]);
  
  const completePhase = useCallback(() => {
    console.log(`[useGameLessonState] Completing current phase: ${currentPhase}`);
    
    if (!currentPhase) {
      console.warn(`[useGameLessonState] No current phase to complete`);
      return;
    }
    
    // Logique de transition entre phases
    const phaseOrder = ['situation', 'vocabulary', 'exercises', 'integration'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1] as LessonState['currentPhase'];
      console.log(`[useGameLessonState] Moving to next phase: ${nextPhase}`);
      updateLessonPhase(nextPhase, 0);
      updateLessonProgress(0, 0);
    } else {
      console.log(`[useGameLessonState] All phases completed`);
      updateLessonProgress(undefined, 100);
    }
  }, [currentPhase, updateLessonPhase, updateLessonProgress]);
  
  const moveToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    console.log(`[useGameLessonState] Moving to next step: ${nextStep}`);
    updateLessonProgress(nextStep);
  }, [currentStep, updateLessonProgress]);
  
  const startPhase = useCallback((phase: LessonState['currentPhase']) => {
    console.log(`[useGameLessonState] Starting phase: ${phase}`);
    updateLessonPhase(phase, 0);
    updateLessonProgress(0, 0);
  }, [updateLessonPhase, updateLessonProgress]);
  
  // Utilitaires - Fonctions d'aide temporaires
  const isPhaseCompleted = useCallback((phase: LessonState['currentPhase']) => {
    if (!phase) return false;
    
    // Logique simple : une phase est complétée si le progrès est à 100%
    // Les composants peuvent implémenter leur propre logique
    return currentPhase === phase && phaseProgress >= 100;
  }, [currentPhase, phaseProgress]);
  
  const getTotalStepsForCurrentPhase = useCallback(() => {
    // Nombre d'étapes par défaut par phase
    const defaultSteps = {
      'situation': 1,
      'vocabulary': 5,
      'exercises': 3,
      'integration': 1
    };
    
    return currentPhase ? defaultSteps[currentPhase] || 1 : 1;
  }, [currentPhase]);
  
  return {
    // Getters
    currentPhase,
    currentStep,
    phaseProgress,
    dialogueState,
    
    // Setters
    updatePhase,
    updateStep,
    updateProgress,
    updateDialogue,
    
    // Actions
    resetLesson,
    completePhase,
    moveToNextStep,
    startPhase,
    
    // Utilitaires
    isPhaseCompleted,
    getTotalStepsForCurrentPhase,
  };
};

export default useGameLessonState;
