/**
 * QuizComponent - Modern quiz component using all APIs
 * Intégration complète : Dictionary + Translation + Assets
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../ui/progress';
import { LazyImage } from '../ui/lazy-image';
import { cn } from '@/lib/utils';
import { gameApiService, type QuizQuestion, type GameWord } from '../../services/gameApiService';
import { assetsApi, type ImageAsset } from '../../services/api/assetsApi';

export interface QuizComponentProps {
  words: string[];
  sourceLanguage: string;
  targetLanguage: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, totalQuestions: number) => void;
  onQuestionAnswer: (correct: boolean, points: number) => void;
  className?: string;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  isLoading: boolean;
  selectedAnswer: string | null;
  isAnswered: boolean;
  timeRemaining: number;
  backgroundImage: ImageAsset | null;
}

export const QuizComponent = React.forwardRef<HTMLDivElement, QuizComponentProps>(({
  words,
  sourceLanguage,
  targetLanguage,
  difficulty,
  onComplete,
  onQuestionAnswer,
  className,
  ...props
}, ref) => {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    isLoading: true,
    selectedAnswer: null,
    isAnswered: false,
    timeRemaining: 30,
    backgroundImage: null
  });

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize quiz
  useEffect(() => {
    initializeQuiz();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [words, sourceLanguage, targetLanguage, difficulty]);

  // Timer for current question
  useEffect(() => {
    if (state.isLoading || state.isAnswered) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - auto-answer as wrong
          handleTimeUp();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    setTimer(interval);
    return () => clearInterval(interval);
  }, [state.currentQuestionIndex, state.isLoading, state.isAnswered]);

  const initializeQuiz = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Generate game words and questions
      const gameWords = await gameApiService.generateGameWords(
        words,
        sourceLanguage,
        targetLanguage,
        difficulty
      );

      const questions = await gameApiService.generateQuizQuestions(gameWords, words.length);

      // Get a background image for the quiz theme
      const themeImages = await assetsApi.getGameThemeImages('education', 1);
      const backgroundImage = themeImages.length > 0 ? themeImages[0] : null;

      setState(prev => ({
        ...prev,
        questions,
        isLoading: false,
        timeRemaining: questions[0]?.timeLimit || 30,
        backgroundImage
      }));
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (state.isAnswered) return;

    setState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  const handleAnswerConfirm = () => {
    if (!state.selectedAnswer || state.isAnswered) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : 0;

    setState(prev => ({
      ...prev,
      isAnswered: true,
      score: prev.score + points
    }));

    onQuestionAnswer(isCorrect, points);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleTimeUp = () => {
    if (state.isAnswered) return;

    setState(prev => ({ ...prev, isAnswered: true, selectedAnswer: null }));
    onQuestionAnswer(false, 0);

    setTimeout(() => {
      nextQuestion();
    }, 1000);
  };

  const nextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= state.questions.length) {
      // Quiz completed
      onComplete(state.score, state.questions.length);
      return;
    }

    setState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      isAnswered: false,
      timeRemaining: state.questions[nextIndex]?.timeLimit || 30
    }));
  };

  const getCurrentQuestion = () => state.questions[state.currentQuestionIndex];
  const currentQuestion = getCurrentQuestion();

  const getAnswerButtonVariant = (option: string) => {
    if (!state.isAnswered) {
      return state.selectedAnswer === option ? 'default' : 'outline';
    }

    // Show correct/incorrect after answering
    if (option === currentQuestion.correctAnswer) {
      return 'default'; // Correct answer - green in our theme
    }
    if (option === state.selectedAnswer && option !== currentQuestion.correctAnswer) {
      return 'destructive'; // Wrong selected answer
    }
    return 'outline';
  };

  const getProgressPercentage = () => {
    return ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  };

  const getTimeProgressPercentage = () => {
    const totalTime = currentQuestion?.timeLimit || 30;
    return (state.timeRemaining / totalTime) * 100;
  };

  if (state.isLoading) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)} ref={ref} {...props}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-semibold">Preparing your quiz...</p>
              <p className="text-sm text-muted-foreground">
                Generating questions from {words.length} words
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)} ref={ref} {...props}>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto relative overflow-hidden", className)} ref={ref} {...props}>
      {/* Background Image */}
      {state.backgroundImage && (
        <div className="absolute inset-0 opacity-5">
          <LazyImage
            asset={state.backgroundImage}
            className="w-full h-full object-cover"
            priority
            quality="low"
          />
        </div>
      )}

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Question {state.currentQuestionIndex + 1}</span>
            <Badge variant="outline">{currentQuestion.type}</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'secondary' : 'default'}>
              {difficulty}
            </Badge>
            <Badge variant="outline">
              {state.score} pts
            </Badge>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Quiz Progress</span>
            <span>{state.currentQuestionIndex + 1} / {state.questions.length}</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Time Remaining</span>
            <span className={cn(
              "font-mono",
              state.timeRemaining <= 10 && "text-destructive font-bold animate-pulse"
            )}>
              {state.timeRemaining}s
            </span>
          </div>
          <Progress 
            value={getTimeProgressPercentage()} 
            className={cn(
              "h-1",
              state.timeRemaining <= 10 && "progress-destructive"
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Question */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>
          {currentQuestion.word.hints.phonetic && (
            <p className="text-sm text-muted-foreground font-mono">
              {currentQuestion.word.hints.phonetic}
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={getAnswerButtonVariant(option)}
              size="lg"
              onClick={() => handleAnswerSelect(option)}
              disabled={state.isAnswered}
              className={cn(
                "h-auto p-4 text-left justify-start transition-all duration-200",
                state.selectedAnswer === option && !state.isAnswered && "ring-2 ring-primary ring-offset-2",
                state.isAnswered && option === currentQuestion.correctAnswer && "bg-green-500 text-white border-green-500",
                state.isAnswered && option === state.selectedAnswer && option !== currentQuestion.correctAnswer && "bg-red-500 text-white border-red-500"
              )}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          {!state.isAnswered ? (
            <Button
              onClick={handleAnswerConfirm}
              disabled={!state.selectedAnswer}
              size="lg"
              className="min-w-32"
            >
              Confirm Answer
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <div className={cn(
                "text-lg font-semibold",
                state.selectedAnswer === currentQuestion.correctAnswer ? "text-green-600" : "text-red-600"
              )}>
                {state.selectedAnswer === currentQuestion.correctAnswer ? "Correct! ✓" : "Incorrect ✗"}
              </div>
              {state.selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-sm text-muted-foreground">
                  Correct answer: {currentQuestion.correctAnswer}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hints */}
        {currentQuestion.word.hints.definition && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Hint:</h4>
            <p className="text-sm">{currentQuestion.word.hints.definition}</p>
          </div>
        )}

        {/* Word Info */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Word: {currentQuestion.word.originalWord}</span>
            <span>•</span>
            <span>{sourceLanguage} → {targetLanguage}</span>
            {currentQuestion.word.metadata.partOfSpeech && (
              <>
                <span>•</span>
                <span>{currentQuestion.word.metadata.partOfSpeech}</span>
              </>
            )}
            <span>•</span>
            <span>{currentQuestion.points} points</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

QuizComponent.displayName = 'QuizComponent';