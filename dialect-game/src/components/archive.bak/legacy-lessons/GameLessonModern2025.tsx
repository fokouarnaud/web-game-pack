/**
 * Game Lesson Interface 2025 - Ultra-Practical Design
 * Single panel focus, maximum 2 choices, direct user flow, real data integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Mic,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  StopCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';
import { useGameLessonNavigation } from '../hooks/useGameLessonNavigation';

interface GameState {
  phase: 'ready' | 'listening' | 'recording' | 'processing' | 'feedback';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeRemaining: number;
  lastAccuracy: number;
  attempts: number;
}

interface LessonStep {
  id: string;
  phrase: string;
  translation: string;
  pronunciation: string;
  context: string;
}

// Real lesson data structure
const getLessonData = (chapterNumber: number) => {
  const lessons = {
    1: {
      title: "Basic Greetings",
      context: "🏘️ Village Square - Meeting locals",
      steps: [
        {
          id: "greeting-1",
          phrase: "Bonjour, comment allez-vous ?",
          translation: "Hello, how are you?",
          pronunciation: "bon-ZHOOR, ko-mahn tah-lay VOO",
          context: "Polite morning greeting"
        },
        {
          id: "greeting-2", 
          phrase: "Je vais bien, merci",
          translation: "I'm doing well, thank you",
          pronunciation: "zhuh vay bee-AHN, mer-SEE",
          context: "Responding positively"
        },
        {
          id: "greeting-3",
          phrase: "Au revoir, bonne journée",
          translation: "Goodbye, have a good day",
          pronunciation: "oh ruh-VWAHR, bun zhoor-NAY",
          context: "Polite farewell"
        }
      ]
    },
    2: {
      title: "Shopping Basics",
      context: "🛒 Local Market - Daily shopping",
      steps: [
        {
          id: "shop-1",
          phrase: "Combien ça coûte ?",
          translation: "How much does it cost?",
          pronunciation: "kom-bee-AHN sah KOOT",
          context: "Asking for price"
        },
        {
          id: "shop-2",
          phrase: "Je voudrais acheter ceci",
          translation: "I would like to buy this",
          pronunciation: "zhuh voo-DREH ash-TAY suh-SEE",
          context: "Making a purchase"
        },
        {
          id: "shop-3",
          phrase: "Merci beaucoup",
          translation: "Thank you very much", 
          pronunciation: "mer-SEE bo-KOO",
          context: "Expressing gratitude"
        }
      ]
    }
  };
  
  return lessons[chapterNumber as keyof typeof lessons] || lessons[1];
};

export const GameLessonModern2025: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { navigateToLessonComplete } = useGameLessonNavigation();
  
  const lessonId = searchParams.get('lessonId') || '';
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const lessonData = getLessonData(chapterNumber);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentStep: 0,
    totalSteps: lessonData.steps.length,
    score: 0,
    timeRemaining: 10,
    lastAccuracy: 0,
    attempts: 0
  });

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStep = lessonData.steps[gameState.currentStep];

  // Cleanup function
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (processingRef.current) clearTimeout(processingRef.current);
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    };
  }, []);

  const playAudio = () => {
    setGameState(prev => ({ ...prev, phase: 'listening' }));
    // Simulate audio playback
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: 'ready' }));
    }, 2000);
  };

  const startRecording = () => {
    // Clear any existing timers
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (processingRef.current) clearTimeout(processingRef.current);
    if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);

    setGameState(prev => ({
      ...prev,
      phase: 'recording',
      timeRemaining: 10
    }));

    // Start countdown
    countdownRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Stop recording when time is up
          clearInterval(countdownRef.current!);
          return { ...prev, timeRemaining: 0, phase: 'processing' };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    // Auto-stop recording after 10 seconds (only if not manually stopped)
    autoStopTimeoutRef.current = setTimeout(() => {
      // Check if we're still recording before auto-stopping
      setGameState(prev => {
        if (prev.phase === 'recording') {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          
          // Process the recording
          processingRef.current = setTimeout(() => {
            const accuracy = 75 + Math.random() * 20; // 75-95% accuracy
            const points = Math.floor(accuracy * 10);
            
            setGameState(prevState => ({
              ...prevState,
              phase: 'feedback',
              lastAccuracy: accuracy,
              score: prevState.score + points,
              attempts: prevState.attempts + 1
            }));
          }, 1500);
          
          return { ...prev, phase: 'processing' };
        }
        return prev; // Don't change state if not recording
      });
    }, 10000);
  };

  const stopRecording = () => {
    // Clear all timers to prevent auto-execution
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    
    setGameState(prev => ({ ...prev, phase: 'processing' }));
    
    // Process the recording
    processingRef.current = setTimeout(() => {
      const accuracy = 75 + Math.random() * 20; // 75-95% accuracy
      const points = Math.floor(accuracy * 10);
      
      setGameState(prev => ({
        ...prev,
        phase: 'feedback',
        lastAccuracy: accuracy,
        score: prev.score + points,
        attempts: prev.attempts + 1
      }));
    }, 1500);
  };

  const handleSuccess = () => {
    if (gameState.currentStep < gameState.totalSteps - 1) {
      // Next step
      setGameState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        phase: 'ready',
        timeRemaining: 10
      }));
    } else {
      // Lesson complete
      navigateToLessonComplete({
        status: 'success',
        lessonId,
        chapterNumber,
        score: gameState.score,
        accuracy: Math.round(gameState.lastAccuracy),
        type: 'modern'
      });
    }
  };

  const handleRetry = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'ready',
      timeRemaining: 10
    }));
  };

  const isSuccess = gameState.lastAccuracy >= 75;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95 dark:from-background dark:via-background dark:to-muted/10">
      
      {/* Mobile-Optimized Header */}
      <header className="bg-background/98 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="p-1.5 sm:p-2 rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="text-center flex-1 px-2">
              <div className="font-medium text-xs sm:text-sm truncate">
                {lessonData.title} • {gameState.currentStep + 1}/{gameState.totalSteps}
              </div>
              <div className="text-xs text-muted-foreground truncate hidden sm:block">
                {lessonData.context}
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-accent/20 text-accent rounded-full px-2 sm:px-3 py-1 text-xs font-bold">
                {gameState.score}
              </div>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <Progress value={((gameState.currentStep + 1) / gameState.totalSteps) * 100} className="h-1" />
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Single Panel Focus */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Mobile-Optimized Main Interaction Card */}
          <Card className="bg-card border border-border">
            <CardContent className="p-4 sm:p-6 md:p-8">
              
              {/* Current Phrase - Mobile Responsive */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-primary/5 rounded-lg p-3 sm:p-4 md:p-6 border border-primary/20 mb-4 sm:mb-6">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
                    {currentStep.phrase}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4">
                    {currentStep.translation}
                  </p>
                  <div className="text-xs sm:text-sm text-accent font-mono break-all">
                    {currentStep.pronunciation}
                  </div>
                </div>
                
                <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  {currentStep.context}
                </div>
              </div>

              {/* Mobile-Optimized Phase-based Interface */}
              {gameState.phase === 'ready' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Button
                        onClick={playAudio}
                        className="bg-accent hover:bg-accent/80 text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full flex-1 sm:flex-none"
                      >
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Listen
                      </Button>
                      
                      <Button
                        onClick={startRecording}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full flex-1 sm:flex-none"
                      >
                        <Mic className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Record
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {gameState.phase === 'listening' && (
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-accent rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-pulse">
                    <Play className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground">Playing audio...</p>
                </div>
              )}

              {gameState.phase === 'recording' && (
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-destructive rounded-full flex items-center justify-center animate-pulse">
                      <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-destructive-foreground" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-destructive animate-ping"></div>
                  </div>
                  
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">
                    {gameState.timeRemaining}s
                  </div>
                  
                  <Button
                    onClick={stopRecording}
                    className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-full"
                  >
                    <StopCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Stop
                  </Button>
                </div>
              )}

              {gameState.phase === 'processing' && (
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-accent rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-accent-foreground border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground">Analyzing...</p>
                </div>
              )}

              {gameState.phase === 'feedback' && (
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    {isSuccess ?
                      <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" /> :
                      <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                    }
                  </div>
                  
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                      {Math.round(gameState.lastAccuracy)}%
                    </div>
                    <Progress value={gameState.lastAccuracy} className="h-2 sm:h-3 mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg text-muted-foreground">
                      {isSuccess ? 'Great pronunciation!' : 'Keep practicing!'}
                    </p>
                  </div>
                  
                  {/* Mobile-Optimized Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {!isSuccess && (
                      <Button
                        onClick={handleRetry}
                        className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-full flex-1 sm:flex-none"
                      >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Try Again
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleSuccess}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-full flex-1 sm:flex-none"
                    >
                      {gameState.currentStep < gameState.totalSteps - 1 ? (
                        <>
                          Next Step
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                        </>
                      ) : (
                        <>
                          Complete
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameLessonModern2025;