import { create } from 'zustand';
import { createContext, useContext, createElement } from 'react';
import type { ReactNode } from 'react';
import type { StateCreator } from 'zustand';

// Types pour les états de leçon et dialogue
interface LessonState {
  currentPhase: 'situation' | 'vocabulary' | 'exercises' | 'integration' | null;
  currentStep: number;
  phaseProgress: number;
}

interface DialogueState {
  currentDialogueIndex: number;
  userTurnCompleted: boolean;
}

interface GameState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Nouveaux états pour les leçons
  lessonState: LessonState;
  dialogueState: DialogueState;
  
  // Actions de base
  initialize: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // Actions pour les leçons
  updateLessonPhase: (phase: LessonState['currentPhase'], step?: number) => void;
  updateLessonProgress: (step?: number, progress?: number) => void;
  updateDialogueState: (dialogueState: Partial<DialogueState>) => void;
  resetLessonState: () => void;
}

const initialState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  
  // États initiaux des leçons
  lessonState: {
    currentPhase: null as LessonState['currentPhase'],
    currentStep: 0,
    phaseProgress: 0,
  },
  
  dialogueState: {
    currentDialogueIndex: 0,
    userTurnCompleted: false,
  },
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  // Actions de base
  initialize: () => set({ isInitialized: true }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set(initialState),
  
  // Actions pour les leçons avec validation
  updateLessonPhase: (phase: LessonState['currentPhase'], step?: number) => {
    console.log(`[GameStore] Updating lesson phase to: ${phase}, step: ${step}`);
    
    // Validation de la phase
    const validPhases = ['situation', 'vocabulary', 'exercises', 'integration', null];
    if (phase !== null && !validPhases.includes(phase)) {
      console.error(`[GameStore] Invalid phase: ${phase}`);
      return;
    }
    
    set((state) => ({
      lessonState: {
        ...state.lessonState,
        currentPhase: phase,
        currentStep: step !== undefined ? step : state.lessonState.currentStep,
      }
    }));
  },
  
  updateLessonProgress: (step?: number, progress?: number) => {
    console.log(`[GameStore] Updating lesson progress - step: ${step}, progress: ${progress}`);
    
    set((state) => ({
      lessonState: {
        ...state.lessonState,
        currentStep: step !== undefined ? Math.max(0, step) : state.lessonState.currentStep,
        phaseProgress: progress !== undefined ? Math.max(0, Math.min(100, progress)) : state.lessonState.phaseProgress,
      }
    }));
  },
  
  updateDialogueState: (newDialogueState: Partial<DialogueState>) => {
    console.log(`[GameStore] Updating dialogue state:`, newDialogueState);
    
    // Validation de l'index de dialogue
    if (newDialogueState.currentDialogueIndex !== undefined && newDialogueState.currentDialogueIndex < 0) {
      console.error(`[GameStore] Invalid dialogue index: ${newDialogueState.currentDialogueIndex}`);
      return;
    }
    
    set((state) => ({
      dialogueState: {
        ...state.dialogueState,
        ...newDialogueState,
      }
    }));
  },
  
  resetLessonState: () => {
    console.log(`[GameStore] Resetting lesson state`);
    set((state) => ({
      lessonState: initialState.lessonState,
      dialogueState: initialState.dialogueState,
    }));
  },
}));

// Export des types pour compatibilité
export type { LessonState, DialogueState };

// Export des actions pour compatibilité avec useGameLessonState
export const gameStoreActions = {
  updateLessonPhase: (phase: LessonState['currentPhase'], step?: number) => 
    useGameStore.getState().updateLessonPhase(phase, step),
  updateLessonProgress: (step?: number, progress?: number) => 
    useGameStore.getState().updateLessonProgress(step, progress),
  updateDialogueState: (dialogueState: Partial<DialogueState>) => 
    useGameStore.getState().updateDialogueState(dialogueState),
  resetLessonState: () => 
    useGameStore.getState().resetLessonState(),
};

// Export du type global pour compatibilité
export interface GlobalGameState {
  lessonState: LessonState;
  dialogueState: DialogueState;
}

// Create context for the GameStore Provider
const GameStoreContext = createContext<null | GameState>(null);

// Provider component
interface GameStoreProviderProps {
  children: ReactNode;
}

export const GameStoreProvider = ({ children }: GameStoreProviderProps) => {
  const store = useGameStore();
  return createElement(GameStoreContext.Provider, { value: store }, children);
};

// Hook to use the game store
export const useGameStoreContext = () => {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error('useGameStoreContext must be used within GameStoreProvider');
  }
  return context;
};