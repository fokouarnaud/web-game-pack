import { DifficultyLevel } from './user.model';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  language: string;
  order: number;
  chapterId?: number;
  estimatedDuration: number; // en minutes
  isActive: boolean;
  content?: LessonContent;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  // Phase 1: Situation
  situationContext: string;
  situationProblem: string;
  situationMotivation: string;
  situationImageUrl?: string;

  // Phase 2: Vocabulary
  vocabularyWords: VocabularyWord[];

  // Phase 3: Exercises
  exercises: Exercise[];

  // Phase 4: Integration
  integrationScenario: string;
  integrationDialogue: DialogueLine[];
}

export interface VocabularyWord {
  word: string;
  pronunciation: string;
  translation: string;
  definition: string;
  example: string;
  audioUrl?: string;
  imageUrl?: string;
  difficulty: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  expectedAnswer: string;
  options?: string[];
  audioUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface DialogueLine {
  id: string;
  speaker: 'USER' | 'NPC';
  text: string;
  translation: string;
  audioUrl?: string;
  isUserTurn: boolean;
  possibleResponses?: string[];
  metadata?: Record<string, any>;
}

export enum ExerciseType {
  PRONUNCIATION = 'PRONUNCIATION',
  TRANSLATION = 'TRANSLATION',
  COMPREHENSION = 'COMPREHENSION'
}

export interface LessonFilter {
  language?: string;
  difficultyLevel?: DifficultyLevel;
  chapterId?: number;
}