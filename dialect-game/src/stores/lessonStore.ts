import { create } from 'zustand';
import type { StateCreator } from 'zustand';

type DialogueState = {
  currentDialogueIndex: number;
  userTurnCompleted: boolean;
};

type LearningPhase = 'situation' | 'vocabulary' | 'exercises' | 'integration';
type AllPhases = LearningPhase | 'completed';

interface LessonState {
  currentPhase: LearningPhase | null;
  dialogueState: DialogueState;
  progress: number;
  overallScore: number;
  timeRemaining: number;
  message: string;
  isRecording: boolean;
  isProcessing: boolean;
  currentWordIndex: number;
  currentExerciseIndex: number;

  // Actions
  setPhase: (phase: LearningPhase) => void;
  updateProgress: (progress: number) => void;
  updateDialogue: (dialogue: DialogueState) => void;
  setOverallScore: (score: number) => void;
  setTimeRemaining: (time: number) => void;
  setMessage: (message: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
  setCurrentExerciseIndex: (index: number) => void;
  reset: () => void;
}

const initialState = {
  currentPhase: null,
  dialogueState: { currentDialogueIndex: 0, userTurnCompleted: false },
  progress: 0,
  overallScore: 0,
  timeRemaining: 5,
  message: '',
  isRecording: false,
  isProcessing: false,
  currentWordIndex: 0,
  currentExerciseIndex: 0,
};

export const useLessonStore = create<LessonState>((set) => ({
  ...initialState,

  setPhase: (phase: LearningPhase) => set({ currentPhase: phase }),
  updateProgress: (progress: number) => set({ progress }),
  updateDialogue: (dialogue: DialogueState) => set({ dialogueState: dialogue }),
  setOverallScore: (score: number) => set({ overallScore: score }),
  setTimeRemaining: (time: number) => set({ timeRemaining: time }),
  setMessage: (message: string) => set({ message }),
  setIsRecording: (isRecording: boolean) => set({ isRecording }),
  setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),
  setCurrentWordIndex: (index: number) => set({ currentWordIndex: index }),
  setCurrentExerciseIndex: (index: number) => set({ currentExerciseIndex: index }),
  reset: () => set(initialState),
}));

export type { LearningPhase, AllPhases, DialogueState };