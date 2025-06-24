/**
 * GameLessonSimple - Interface Simple pour Débutants
 * Interface claire et cohérente pour apprendre les mots de base
 * Écouter → Prononcer → Mot suivant
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Mic,
  Volume2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Play,
  StopCircle,
  Heart,
  Award
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';
import { useGameLessonNavigation } from '../hooks/useGameLessonNavigation';

interface SimpleStep {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  completed: boolean;
  userAudioBlob?: Blob;
  accuracy?: number;
  attempts: number;
}

interface SimpleState {
  currentStep: number;
  totalSteps: number;
  isRecording: boolean;
  isProcessing: boolean;
  steps: SimpleStep[];
  score: number;
  message: string;
  timeRemaining: number;
}

// Mots simples pour débutants - Chapitre 1
const getSimpleLesson = (chapterNumber: number) => {
  const lessons = {
    1: {
      title: "Premiers Mots",
      description: "Apprenons les mots de base ensemble",
      steps: [
        {
          id: "hello",
          word: "Hello",
          translation: "Bonjour",
          pronunciation: "HEH-low",
          example: "Hello! Comment dire bonjour en anglais.",
          completed: false,
          attempts: 0
        },
        {
          id: "goodbye",
          word: "Goodbye",
          translation: "Au revoir",
          pronunciation: "good-BYE",
          example: "Goodbye! Pour dire au revoir.",
          completed: false,
          attempts: 0
        },
        {
          id: "yes",
          word: "Yes",
          translation: "Oui",
          pronunciation: "yess",
          example: "Yes! Pour dire oui.",
          completed: false,
          attempts: 0
        },
        {
          id: "no",
          word: "No",
          translation: "Non",
          pronunciation: "noh",
          example: "No! Pour dire non.",
          completed: false,
          attempts: 0
        },
        {
          id: "thank-you",
          word: "Thank you",
          translation: "Merci",
          pronunciation: "thank yoo",
          example: "Thank you! Pour dire merci.",
          completed: false,
          attempts: 0
        }
      ]
    }
  };
  
  return lessons[chapterNumber as keyof typeof lessons] || lessons[1];
};

export const GameLessonSimple: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { navigateToLessonComplete } = useGameLessonNavigation();
  
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const lessonId = searchParams.get('lessonId') || 'simple-lesson';
  const lessonData = getSimpleLesson(chapterNumber);
  
  const [state, setState] = useState<SimpleState>({
    currentStep: 0,
    totalSteps: lessonData.steps.length,
    isRecording: false,
    isProcessing: false,
    steps: lessonData.steps,
    score: 0,
    message: '',
    timeRemaining: 5
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStep = state.steps[state.currentStep];

  // Nettoyage
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Écouter le mot
  const playWord = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentStep.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Un peu plus lent pour les débutants
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }, [currentStep]);

  // Commencer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setState(prev => ({ 
        ...prev, 
        isRecording: true,
        timeRemaining: 5,
        message: ''
      }));
      
      mediaRecorderRef.current.start();
      startCountdown();

    } catch (error) {
      console.error('Erreur microphone:', error);
      setState(prev => ({ 
        ...prev, 
        message: "Impossible d'accéder au microphone. Vérifiez les permissions."
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setState(prev => ({ ...prev, isRecording: false }));
  }, []);

  const startCountdown = useCallback(() => {
    countdownRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          stopRecording();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [stopRecording]);

  // Traiter l'enregistrement
  const processRecording = useCallback(async (audioBlob: Blob) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Simulation simple
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const accuracy = 75 + Math.random() * 20; // 75-95%
      const isGood = accuracy >= 80;
      
      let message = '';
      if (isGood) {
        message = "Très bien ! Vous pouvez passer au mot suivant.";
      } else {
        message = "Bon essai ! Vous pouvez réessayer ou passer au suivant.";
      }
      
      setState(prev => ({
        ...prev,
        steps: prev.steps.map((step, index) => 
          index === prev.currentStep 
            ? { ...step, completed: true, userAudioBlob: audioBlob, accuracy, attempts: step.attempts + 1 }
            : step
        ),
        score: prev.score + Math.floor(accuracy * 2),
        isProcessing: false,
        message
      }));
      
    } catch (error) {
      console.error('Erreur traitement:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        message: "Erreur lors de l'analyse. Réessayez."
      }));
    }
  }, [state.currentStep]);

  // Mot suivant
  const nextWord = useCallback(() => {
    if (state.currentStep < state.totalSteps - 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        message: '',
        timeRemaining: 5
      }));
    } else {
      // Leçon terminée
      navigateToLessonComplete({
        status: 'success',
        chapterNumber,
        score: state.score,
        lessonId,
        type: 'simple'
      });
    }
  }, [state.currentStep, state.totalSteps, state.score, chapterNumber, navigate]);

  // Réessayer
  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      message: '',
      timeRemaining: 5
    }));
  }, []);

  // Réécouter sa voix
  const playUserAudio = useCallback(() => {
    if (currentStep.userAudioBlob) {
      const audio = new Audio(URL.createObjectURL(currentStep.userAudioBlob));
      audio.play();
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header simple et cohérent */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center flex-1 px-4">
              <h1 className="font-semibold text-foreground">
                {lessonData.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lessonData.description}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold">
                {state.score} points
              </Badge>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-center mb-2">
              <span className="text-sm text-muted-foreground">
                Mot {state.currentStep + 1} sur {state.totalSteps}
              </span>
            </div>
            <Progress 
              value={((state.currentStep + 1) / state.totalSteps) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          <Card>
            <CardContent className="p-8">
              
              {/* Mot actuel */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    Mot à apprendre :
                  </div>
                  <h2 className="text-4xl font-bold text-foreground mb-2">
                    {currentStep.word}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-3">
                    {currentStep.translation}
                  </p>
                  <div className="text-lg font-mono text-primary">
                    🗣️ {currentStep.pronunciation}
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground">
                    {currentStep.example}
                  </p>
                </div>
              </div>

              {/* Actions selon l'état */}
              
              {/* État normal - prêt à apprendre */}
              {!state.isRecording && !state.isProcessing && !currentStep.completed && (
                <div className="text-center space-y-6">
                  <p className="text-foreground">
                    Écoutez d'abord, puis répétez le mot.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={playWord}
                      size="lg"
                      variant="outline"
                      className="px-8 py-3"
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      Écouter
                    </Button>
                    
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="px-8 py-3"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Prononcer
                    </Button>
                  </div>
                  
                  {state.message && (
                    <div className="bg-muted border-l-4 border-primary p-4 rounded">
                      <p className="text-foreground">{state.message}</p>
                    </div>
                  )}
                </div>
              )}

              {/* État enregistrement */}
              {state.isRecording && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <Mic className="h-12 w-12 text-red-500 animate-pulse" />
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {state.timeRemaining}s
                    </div>
                    <p className="text-lg text-muted-foreground mb-4">
                      Dites : "{currentStep.word}"
                    </p>
                  </div>
                  
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <StopCircle className="h-5 w-5 mr-2" />
                    Arrêter
                  </Button>
                </div>
              )}

              {/* État traitement */}
              {state.isProcessing && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground">
                      Analyse de votre prononciation...
                    </p>
                  </div>
                </div>
              )}

              {/* État terminé */}
              {currentStep.completed && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    {currentStep.accuracy! >= 85 ? 
                      <Award className="h-12 w-12 text-green-500" /> :
                      <Heart className="h-12 w-12 text-green-500" />
                    }
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {Math.round(currentStep.accuracy!)}%
                    </div>
                    <Progress 
                      value={currentStep.accuracy!} 
                      className="h-3 mb-4 max-w-xs mx-auto"
                    />
                    <p className="text-lg text-muted-foreground mb-4">
                      {state.message}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {currentStep.userAudioBlob && (
                      <Button
                        onClick={playUserAudio}
                        variant="outline"
                        className="w-full max-w-xs mx-auto"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Réécouter ma voix
                      </Button>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                      {currentStep.accuracy! < 80 && (
                        <Button
                          onClick={retry}
                          variant="outline"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Réessayer
                        </Button>
                      )}
                      
                      <Button
                        onClick={nextWord}
                        className="flex-1"
                      >
                        {state.currentStep < state.totalSteps - 1 ? (
                          <>
                            Mot suivant
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Terminer
                            <CheckCircle2 className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
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

export default GameLessonSimple;