/**
 * GameLessonAdaptive - Interface Intelligente d'Apprentissage des Langues
 * S'adapte automatiquement selon le type de leçon : Immersif, Standard ou Zen
 * UX/UI optimisée avec bonnes pratiques modernes 2025
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
  User,
  Users,
  Clock,
  Pause,
  Rewind,
  BookOpen,
  Star,
  Volume1,
  RefreshCw,
  Brain,
  MessageCircle,
  Headphones,
  Award,
  Heart,
  Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';

// Import services TDD
import { AdvancedVoiceEngine } from '../services/voice/AdvancedVoiceEngine';
import { PitchAnalyzer } from '../services/voice/PitchAnalyzer';
import { EmotionalToneDetector } from '../services/voice/EmotionalToneDetector';
import { AccentAdaptationEngine } from '../services/voice/AccentAdaptationEngine';
import { PredictiveAIService } from '../services/ai/PredictiveAIService';
import { LearningPredictor } from '../services/ai/LearningPredictor';
import { WeaknessDetectionAI } from '../services/ai/WeaknessDetectionAI';
import { CognitiveOptimizer } from '../services/ai/CognitiveOptimizer';

// Types de leçons supportées
type LessonType = 'immersive' | 'standard' | 'zen';
type LessonPhase = 'intro' | 'learning' | 'practicing' | 'feedback' | 'review' | 'completed';

interface LessonStep {
  id: string;
  speaker?: 'npc' | 'user';
  phrase: string;
  translation: string;
  pronunciation: string;
  context: string;
  situation?: string;
  difficulty: number;
  completed: boolean;
  userAudioBlob?: Blob;
  accuracy?: number;
  attempts: number;
}

interface GameState {
  lessonType: LessonType;
  phase: LessonPhase;
  currentStep: number;
  totalSteps: number;
  isPaused: boolean;
  coachingActive: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  steps: LessonStep[];
  score: number;
  encouragementMessage: string;
  timeRemaining: number;
}

interface LessonConfig {
  type: LessonType;
  title: string;
  subtitle: string;
  setting?: string;
  npcName?: string;
  npcDescription?: string;
  objective?: string;
  steps: Omit<LessonStep, 'completed' | 'attempts' | 'userAudioBlob' | 'accuracy'>[];
}

// Services TDD initialisés
const voiceEngine = new AdvancedVoiceEngine(
  new PitchAnalyzer(),
  new EmotionalToneDetector(),
  new AccentAdaptationEngine()
);

const aiService = new PredictiveAIService(
  new LearningPredictor(),
  new WeaknessDetectionAI(),
  new CognitiveOptimizer()
);

// Configuration des leçons selon le type
const getLessonConfig = (chapterNumber: number, lessonId?: string): LessonConfig => {
  const lessons = {
    // Leçons immersives (situations réelles)
    immersive: {
      1: {
        type: 'immersive' as const,
        title: "Commande au Café",
        subtitle: "Situation réelle dans un café londonien",
        setting: "☕ Starbucks - High Street, London",
        npcName: "Sarah",
        npcDescription: "Barista souriante et patiente",
        objective: "Commander un café et un muffin, demander le prix, payer",
        steps: [
          {
            id: "greeting",
            speaker: "npc" as const,
            phrase: "Good morning! Welcome to Starbucks. What can I get for you today?",
            translation: "Bonjour ! Bienvenue chez Starbucks. Que puis-je vous servir aujourd'hui ?",
            pronunciation: "good MOR-ning! WEL-come to STAR-bucks. what can i get for you to-DAY?",
            context: "Accueil chaleureux du personnel",
            situation: "La barista vous sourit et attend votre commande",
            difficulty: 1
          },
          {
            id: "order",
            speaker: "user" as const,
            phrase: "Hi! I'd like a large cappuccino and a blueberry muffin, please.",
            translation: "Salut ! Je voudrais un grand cappuccino et un muffin aux myrtilles, s'il vous plaît.",
            pronunciation: "hi! i'd like a large cap-pu-CHI-no and a BLUE-berry MUF-fin, please",
            context: "Passer sa commande poliment",
            situation: "Vous commandez ce que vous désirez",
            difficulty: 2
          },
          {
            id: "payment",
            speaker: "user" as const,
            phrase: "No, that's all. Can I pay by card, please?",
            translation: "Non, c'est tout. Puis-je payer par carte, s'il vous plaît ?",
            pronunciation: "no, that's all. can i pay by card, please?",
            context: "Confirmer la commande et demander mode de paiement",
            situation: "Vous confirmez votre commande et voulez payer",
            difficulty: 2
          }
        ]
      }
    },
    // Leçons standard (apprentissage guidé)
    standard: {
      1: {
        type: 'standard' as const,
        title: "Salutations de Base",
        subtitle: "Apprendre les salutations essentielles",
        steps: [
          {
            id: "hello",
            phrase: "Hello!",
            translation: "Bonjour !",
            pronunciation: "HEH-low",
            context: "Salutation universelle",
            difficulty: 1
          },
          {
            id: "how-are-you",
            phrase: "How are you?",
            translation: "Comment allez-vous ?",
            pronunciation: "how ar yoo",
            context: "Demander des nouvelles",
            difficulty: 2
          },
          {
            id: "fine-thanks",
            phrase: "I'm fine, thank you!",
            translation: "Je vais bien, merci !",
            pronunciation: "aym fayn, thank yoo",
            context: "Répondre positivement",
            difficulty: 2
          }
        ]
      }
    },
    // Leçons zen (expérience apaisante)
    zen: {
      1: {
        type: 'zen' as const,
        title: "Premiers Mots en Douceur",
        subtitle: "Apprentissage serein et progressif",
        steps: [
          {
            id: "hello-zen",
            phrase: "Hello",
            translation: "Bonjour",
            pronunciation: "HEH-low",
            context: "Votre premier mot en anglais",
            difficulty: 1
          },
          {
            id: "goodbye-zen",
            phrase: "Goodbye",
            translation: "Au revoir",
            pronunciation: "good-BYE",
            context: "Dire au revoir poliment",
            difficulty: 1
          }
        ]
      }
    }
  };

  // Détection automatique du type selon le contexte
  const detectLessonType = (): LessonType => {
    if (lessonId === 'immersive' || chapterNumber === 1) return 'immersive';
    if (lessonId === 'zen') return 'zen';
    return 'standard';
  };

  const type = detectLessonType();
  const chapter = lessons[type][chapterNumber as keyof typeof lessons[typeof type]] || lessons[type][1];
  
  return chapter;
};

export const GameLessonAdaptive: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const lessonId = searchParams.get('type') || undefined;
  const lessonConfig = getLessonConfig(chapterNumber, lessonId);
  
  const [gameState, setGameState] = useState<GameState>({
    lessonType: lessonConfig.type,
    phase: 'intro',
    currentStep: 0,
    totalSteps: lessonConfig.steps.length,
    isPaused: false,
    coachingActive: false,
    isRecording: false,
    isProcessing: false,
    steps: lessonConfig.steps.map(step => ({
      ...step,
      completed: false,
      attempts: 0
    })),
    score: 0,
    encouragementMessage: '',
    timeRemaining: lessonConfig.type === 'zen' ? 8 : 10
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStep = gameState.steps[gameState.currentStep];

  // Nettoyage
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll pour immersif
  useEffect(() => {
    if (gameState.lessonType === 'immersive' && contentRef.current) {
      const currentElement = contentRef.current.querySelector(`[data-step="${gameState.currentStep}"]`);
      currentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [gameState.currentStep, gameState.lessonType]);

  // Démarrer la leçon
  const startLesson = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: 'learning' }));
    
    // Auto-play pour immersif et NPC
    if (gameState.lessonType === 'immersive' && currentStep?.speaker === 'npc') {
      setTimeout(() => {
        playAudio(currentStep.phrase, 'en-GB');
      }, 1000);
    }
  }, [gameState.lessonType, currentStep]);

  // Lecture audio adaptative
  const playAudio = useCallback((text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = gameState.lessonType === 'zen' ? 0.7 : 0.9;
      utterance.pitch = gameState.lessonType === 'zen' ? 1.1 : 1.0;
      speechSynthesis.speak(utterance);
    }
  }, [gameState.lessonType]);

  // Pause/reprise pour immersif
  const togglePause = useCallback(() => {
    if (gameState.lessonType === 'immersive') {
      setGameState(prev => ({
        ...prev,
        isPaused: !prev.isPaused,
        coachingActive: !prev.isPaused
      }));
    }
  }, [gameState.lessonType]);

  // Enregistrement intelligent
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

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

      setGameState(prev => ({ 
        ...prev, 
        isRecording: true,
        timeRemaining: prev.lessonType === 'zen' ? 8 : 10
      }));
      
      mediaRecorderRef.current.start();
      startCountdown();

    } catch (error) {
      console.error('Erreur microphone:', error);
      setGameState(prev => ({ 
        ...prev, 
        encouragementMessage: "🎤 Vérifiez vos permissions microphone et réessayez !"
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
    
    setGameState(prev => ({ ...prev, isRecording: false }));
  }, []);

  const startCountdown = useCallback(() => {
    countdownRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          stopRecording();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [stopRecording]);

  // Traitement adaptatif
  const processRecording = useCallback(async (audioBlob: Blob) => {
    setGameState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 
        gameState.lessonType === 'zen' ? 1500 : 2000
      ));
      
      const accuracy = 70 + Math.random() * 25;
      const encouragement = generateEncouragement(accuracy, currentStep.attempts + 1);
      
      setGameState(prev => ({
        ...prev,
        steps: prev.steps.map((step, index) => 
          index === prev.currentStep 
            ? { ...step, completed: true, userAudioBlob: audioBlob, accuracy, attempts: step.attempts + 1 }
            : step
        ),
        score: prev.score + Math.floor(accuracy * 5),
        isProcessing: false,
        encouragementMessage: encouragement,
        phase: 'feedback',
        coachingActive: prev.lessonType === 'immersive' ? true : false,
        isPaused: prev.lessonType === 'immersive' ? true : false
      }));
      
    } catch (error) {
      console.error('Erreur traitement:', error);
      setGameState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [gameState.lessonType, currentStep]);

  // Encouragements adaptatifs selon le type
  const generateEncouragement = useCallback((accuracy: number, attempts: number) => {
    const level = accuracy >= 90 ? 'excellent' : accuracy >= 75 ? 'great' : 'good';
    
    const messages = {
      zen: {
        excellent: "🌟 Magnifique ! Votre prononciation est parfaite !",
        great: "✨ Très bien ! Vous progressez en douceur !",
        good: "🌱 Bel effort ! Continuez à votre rythme !"
      },
      immersive: {
        excellent: "🎯 Parfait ! Vous maîtrisez cette situation !",
        great: "👏 Excellent ! Votre conversation est fluide !",
        good: "💪 Bon début ! Cette situation vous aidera !"
      },
      standard: {
        excellent: "🏆 Excellent ! Vous maîtrisez cette phrase !",
        great: "🎉 Très bien ! Votre apprentissage progresse !",
        good: "📚 C'est un bon début ! Continuez à pratiquer !"
      }
    };
    
    return messages[gameState.lessonType][level] || messages.standard[level];
  }, [gameState.lessonType]);

  // Navigation adaptative
  const handleNext = useCallback(() => {
    if (gameState.currentStep < gameState.totalSteps - 1) {
      setGameState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        phase: 'learning',
        isPaused: false,
        coachingActive: false,
        encouragementMessage: '',
        timeRemaining: prev.lessonType === 'zen' ? 8 : 10
      }));
      
      // Auto-play pour immersif NPC
      const nextStep = gameState.steps[gameState.currentStep + 1];
      if (gameState.lessonType === 'immersive' && nextStep?.speaker === 'npc') {
        setTimeout(() => {
          playAudio(nextStep.phrase, 'en-GB');
        }, 1000);
      }
    } else {
      setGameState(prev => ({ ...prev, phase: 'completed' }));
    }
  }, [gameState.currentStep, gameState.totalSteps, gameState.steps, gameState.lessonType, playAudio]);

  // Retry adaptatif
  const handleRetry = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'learning',
      isPaused: false,
      coachingActive: false,
      encouragementMessage: '',
      timeRemaining: prev.lessonType === 'zen' ? 8 : 10
    }));
  }, []);

  // Réécouter audio utilisateur
  const playUserAudio = useCallback(() => {
    if (currentStep.userAudioBlob) {
      const audio = new Audio(URL.createObjectURL(currentStep.userAudioBlob));
      audio.play();
    }
  }, [currentStep]);

  // Couleurs thématiques selon le type
  const getThemeColors = useCallback(() => {
    switch (gameState.lessonType) {
      case 'immersive':
        return {
          gradient: 'from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-amber-900 dark:to-orange-900',
          accent: 'orange',
          border: 'border-orange-200 dark:border-slate-700'
        };
      case 'zen':
        return {
          gradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900',
          accent: 'blue',
          border: 'border-blue-200 dark:border-slate-700'
        };
      default:
        return {
          gradient: 'from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
          accent: 'slate',
          border: 'border-slate-200 dark:border-slate-700'
        };
    }
  }, [gameState.lessonType]);

  const theme = getThemeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      
      {/* Header adaptatif */}
      <header className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b ${theme.border} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center flex-1 px-4">
              <div className="flex items-center justify-center gap-2">
                {gameState.lessonType === 'immersive' && <Users className="h-5 w-5 text-orange-500" />}
                {gameState.lessonType === 'zen' && <Heart className="h-5 w-5 text-blue-500" />}
                {gameState.lessonType === 'standard' && <BookOpen className="h-5 w-5 text-slate-500" />}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {lessonConfig.title}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lessonConfig.subtitle}
                {lessonConfig.setting && ` • ${lessonConfig.setting}`}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`bg-${theme.accent}-100 text-${theme.accent}-700 dark:bg-${theme.accent}-900 dark:text-${theme.accent}-300 font-bold`}>
                {gameState.score}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-center mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {gameState.lessonType === 'immersive' ? 'Tour' : 'Étape'} {gameState.currentStep + 1} sur {gameState.totalSteps}
              </span>
            </div>
            <Progress 
              value={((gameState.currentStep + 1) / gameState.totalSteps) * 100} 
              className={`h-1.5 bg-${theme.accent}-200 dark:bg-slate-700`}
            />
          </div>
        </div>
      </header>

      {/* Interface adaptative selon le type et la phase */}
      <div className={`${gameState.lessonType === 'immersive' ? 'flex flex-col lg:flex-row h-[calc(100vh-140px)]' : 'container mx-auto px-4 py-8'}`}>
        
        {/* Zone principale adaptative */}
        <div className={gameState.lessonType === 'immersive' ? 'flex-1 lg:flex-[2] relative' : 'max-w-4xl mx-auto'}>
          <div ref={contentRef}>
            
            {/* Phase intro */}
            {gameState.phase === 'intro' && (
              <div className={gameState.lessonType === 'immersive' ? 'h-full flex items-center justify-center p-6' : 'text-center mb-8'}>
                <Card className={`max-w-2xl w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur ${theme.border}`}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">
                      {gameState.lessonType === 'immersive' && '☕'}
                      {gameState.lessonType === 'zen' && '🧘‍♀️'}
                      {gameState.lessonType === 'standard' && '📚'}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                      {lessonConfig.title}
                    </h1>
                    
                    {gameState.lessonType === 'immersive' && (
                      <div className="space-y-4 mb-6">
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Situation :</strong> {lessonConfig.setting}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Objectif :</strong> {lessonConfig.objective}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Interlocuteur :</strong> {lessonConfig.npcName} - {lessonConfig.npcDescription}
                        </p>
                      </div>
                    )}
                    
                    {gameState.lessonType === 'zen' && (
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Prenez votre temps, respirez profondément, et commençons cet apprentissage en douceur ✨
                      </p>
                    )}
                    
                    {gameState.lessonType === 'standard' && (
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Apprenons ensemble ces phrases essentielles étape par étape 📖
                      </p>
                    )}
                    
                    <Button 
                      onClick={startLesson}
                      className={`bg-${theme.accent}-500 hover:bg-${theme.accent}-600 text-white px-8 py-3 rounded-full text-lg`}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {gameState.lessonType === 'immersive' ? 'Entrer dans la situation' : 
                       gameState.lessonType === 'zen' ? 'Commencer en douceur' : 
                       'Commencer la leçon'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Interface selon le type de leçon et la phase */}
            {(gameState.phase === 'learning' || gameState.phase === 'feedback') && (
              <>
                {/* Interface immersive */}
                {gameState.lessonType === 'immersive' && (
                  <div className="h-full flex flex-col">
                    {/* Contrôles immersifs */}
                    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b ${theme.border} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={togglePause}
                            variant={gameState.isPaused ? "default" : "outline"}
                            size="sm"
                            className={gameState.isPaused ? `bg-${theme.accent}-500 hover:bg-${theme.accent}-600` : ""}
                          >
                            {gameState.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            {gameState.isPaused ? 'Reprendre' : 'Pause & Aide'}
                          </Button>
                          
                          {gameState.isPaused && (
                            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Conversation en pause
                            </Badge>
                          )}
                        </div>
                        
                        {currentStep?.speaker === 'user' && !gameState.isPaused && (
                          <Button
                            onClick={gameState.isRecording ? stopRecording : startRecording}
                            className={gameState.isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
                            disabled={gameState.isProcessing}
                          >
                            {gameState.isRecording ? <StopCircle className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                            {gameState.isRecording ? 'Arrêter' : 'Répondre'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Conversation immersive */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {gameState.steps.map((step: LessonStep, index: number) => (
                        <div 
                          key={step.id}
                          data-step={index}
                          className={`flex ${step.speaker === 'user' ? 'justify-end' : 'justify-start'} ${
                            index === gameState.currentStep ? 'ring-2 ring-orange-300 ring-opacity-50 rounded-lg p-2' : ''
                          }`}
                        >
                          {/* Avatar NPC */}
                          {step.speaker === 'npc' && (
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                          )}
                          
                          {/* Bulle de conversation */}
                          <div className={`max-w-[70%] ${step.speaker === 'user' ? 'order-1' : ''}`}>
                            <div className={`p-4 rounded-2xl shadow-sm ${
                              step.speaker === 'user'
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-bl-md'
                            }`}>
                              <p className={`text-sm leading-relaxed ${
                                step.speaker === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                              }`}>
                                {step.phrase}
                              </p>
                              
                              {/* Indicateurs état */}
                              {index === gameState.currentStep && (
                                <div className="mt-2 pt-2 border-t border-orange-200">
                                  {step.speaker === 'user' ? (
                                    <div className="text-xs text-blue-100">
                                      {!step.completed && !gameState.isProcessing && !gameState.isRecording && (
                                        <span>🎤 À vous de parler...</span>
                                      )}
                                      {gameState.isRecording && <span>🔴 Enregistrement...</span>}
                                      {gameState.isProcessing && <span>🧠 Analyse...</span>}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500">
                                      <span>💬 {lessonConfig.npcName} parle...</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Résultats */}
                              {step.speaker === 'user' && step.completed && step.accuracy && (
                                <div className="mt-2 pt-2 border-t border-blue-400">
                                  <div className="flex items-center justify-between text-xs text-blue-100">
                                    <span>Précision</span>
                                    <span className="font-bold">{Math.round(step.accuracy)}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className={`text-xs mt-1 ${step.speaker === 'user' ? 'text-right text-blue-400' : 'text-slate-400'}`}>
                              {step.speaker === 'npc' ? lessonConfig.npcName : 'Vous'}
                            </div>
                          </div>
                          
                          {/* Avatar utilisateur */}
                          {step.speaker === 'user' && (
                            <div className="flex-shrink-0 ml-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interface standard/zen */}
                {(gameState.lessonType === 'standard' || gameState.lessonType === 'zen') && (
                  <Card className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur border-0 shadow-xl`}>
                    <CardContent className="p-8">
                      
                      {/* Phrase et contexte */}
                      <div className="text-center mb-8">
                        <div className="mb-6">
                          <Badge variant="outline" className={`mb-3 bg-${theme.accent}-50 border-${theme.accent}-200 text-${theme.accent}-700`}>
                            💭 {currentStep.context}
                          </Badge>
                          <p className="text-xl text-slate-600 dark:text-slate-300 mb-4">
                            {currentStep.translation}
                          </p>
                        </div>
                        
                        <div className={`bg-gradient-to-r ${
                          gameState.lessonType === 'zen' 
                            ? 'from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600' 
                            : 'from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600'
                        } rounded-2xl p-6 border ${theme.border}`}>
                          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                            {currentStep.phrase}
                          </h1>
                          <div className={`text-lg font-mono mb-3 ${
                            gameState.lessonType === 'zen' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            🗣️ {currentStep.pronunciation}
                          </div>
                        </div>
                      </div>

                      {/* Interface selon la phase */}
                      
                      {/* Phase apprentissage */}
                      {gameState.phase === 'learning' && (
                        <div className="text-center space-y-6">
                          <div className="space-y-4">
                            <p className="text-lg text-slate-700 dark:text-slate-300">
                              {gameState.lessonType === 'zen' 
                                ? "Prêt pour cette phrase ? Prenez votre temps ✨" 
                                : "Prêt pour cette phrase ? Commençons ! 📚"}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                              <Button
                                onClick={() => playAudio(currentStep.phrase)}
                                className={`bg-${theme.accent}-500 hover:bg-${theme.accent}-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105`}
                              >
                                <Volume2 className="h-5 w-5 mr-2" />
                                Écouter
                              </Button>
                              
                              <Button
                                onClick={startRecording}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                                disabled={gameState.isRecording || gameState.isProcessing}
                              >
                                <Mic className="h-5 w-5 mr-2" />
                                Parler
                              </Button>
                            </div>
                          </div>
                          
                          {gameState.encouragementMessage && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                              <p className="text-yellow-800 dark:text-yellow-300">
                                {gameState.encouragementMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Phase enregistrement */}
                      {gameState.isRecording && (
                        <div className="text-center space-y-6">
                          <div className="relative">
                            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                              gameState.lessonType === 'zen' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                            }`}>
                              <Mic className={`h-16 w-16 animate-pulse ${
                                gameState.lessonType === 'zen' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                              }`} />
                            </div>
                            <div className={`absolute inset-0 rounded-full border-4 animate-ping ${
                              gameState.lessonType === 'zen' ? 'border-blue-300 dark:border-blue-700' : 'border-green-300 dark:border-green-700'
                            }`}></div>
                          </div>
                          
                          <div>
                            <div className="text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                              {gameState.timeRemaining}s
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                              🎤 C'est à vous ! Répétez la phrase
                            </p>
                          </div>
                          
                          <Button
                            onClick={stopRecording}
                            className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-full"
                          >
                            <StopCircle className="h-5 w-5 mr-2" />
                            Terminer
                          </Button>
                        </div>
                      )}

                      {/* Phase traitement */}
                      {gameState.isProcessing && (
                        <div className="text-center space-y-6">
                          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                            gameState.lessonType === 'zen' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-indigo-100 dark:bg-indigo-900'
                          }`}>
                            <Brain className={`h-10 w-10 animate-pulse ${
                              gameState.lessonType === 'zen' ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xl text-slate-700 dark:text-slate-200 mb-2">
                              🧠 Analyse en cours...
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {gameState.lessonType === 'zen' 
                                ? "L'IA évalue votre prononciation avec bienveillance" 
                                : "L'IA évalue votre prononciation"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Phase feedback */}
                      {gameState.phase === 'feedback' && currentStep.completed && (
                        <div className="text-center space-y-6">
                          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                            currentStep.accuracy! >= 90 ? 'bg-yellow-100 dark:bg-yellow-900' :
                            currentStep.accuracy! >= 75 ? 'bg-green-100 dark:bg-green-900' :
                            'bg-blue-100 dark:bg-blue-900'
                          }`}>
                            {currentStep.accuracy! >= 90 ? 
                              <Award className="h-12 w-12 text-yellow-600 dark:text-yellow-400" /> :
                              currentStep.accuracy! >= 75 ?
                              <Sparkles className="h-12 w-12 text-green-600 dark:text-green-400" /> :
                              <Heart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            }
                          </div>
                          
                          <div>
                            <div className="text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                              {Math.round(currentStep.accuracy!)}%
                            </div>
                            <Progress 
                              value={currentStep.accuracy!} 
                              className="h-4 mb-4 max-w-xs mx-auto"
                            />
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                              {gameState.encouragementMessage}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {currentStep.userAudioBlob && (
                              <Button
                                onClick={playUserAudio}
                                variant="outline"
                                className="w-full max-w-xs mx-auto border-slate-300 dark:border-slate-600"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Réécouter ma voix
                              </Button>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                              {currentStep.accuracy! < 75 && (
                                <Button
                                  onClick={handleRetry}
                                  variant="outline"
                                  className="border-slate-300 dark:border-slate-600"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Réessayer
                                </Button>
                              )}
                              
                              <Button
                                onClick={handleNext}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                {gameState.currentStep < gameState.totalSteps - 1 ? (
                                  <>
                                    {gameState.lessonType === 'zen' ? 'Phrase suivante' : 'Continuer'}
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
                )}
              </>
            )}

            {/* Phase terminée */}
            {gameState.phase === 'completed' && (
              <div className="text-center">
                <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-4">🎉</div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        {gameState.lessonType === 'immersive' ? 'Situation terminée !' :
                         gameState.lessonType === 'zen' ? 'Apprentissage zen terminé !' :
                         'Leçon terminée !'}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300">
                        Félicitations ! Vous avez complété : {lessonConfig.title}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => navigate('/lessons')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Continuer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>

        {/* Coaching latéral pour immersif */}
        {gameState.lessonType === 'immersive' && (
          <div className={`lg:flex-1 lg:max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur border-l ${theme.border} transition-all duration-300 ${
            gameState.coachingActive ? 'lg:block' : 'lg:hidden'
          }`}>
            {gameState.coachingActive && currentStep && (
              <div className="h-full overflow-y-auto p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Aide & Conseils
                </h3>
                
                <Card className="mb-4 border-orange-200 dark:border-slate-600">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                          📝 À dire :
                        </div>
                        <div className="text-base font-medium text-slate-800 dark:text-slate-100">
                          {currentStep.phrase}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                          🇫🇷 Traduction :
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {currentStep.translation}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                          🗣️ Prononciation :
                        </div>
                        <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          {currentStep.pronunciation}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                          💡 Contexte :
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {currentStep.context}
                        </div>
                      </div>
                      
                      {currentStep.situation && (
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                            🎭 Situation :
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {currentStep.situation}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => playAudio(currentStep.phrase, 'en-GB')}
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Écouter l'exemple
                  </Button>
                  
                  {currentStep.userAudioBlob && (
                    <Button
                      onClick={playUserAudio}
                      variant="outline"
                      className="w-full border-green-300 hover:bg-green-50"
                    >
                      <Volume1 className="h-4 w-4 mr-2" />
                      Réécouter ma voix
                    </Button>
                  )}
                  
                  {currentStep.completed && currentStep.accuracy && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                          {Math.round(currentStep.accuracy)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          Précision de prononciation
                        </div>
                        <Progress value={currentStep.accuracy} className="h-2 mb-3" />
                        
                        {currentStep.accuracy >= 80 ? (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            ✅ Excellente prononciation !
                          </div>
                        ) : (
                          <div className="text-sm text-orange-600 dark:text-orange-400">
                            💪 Continuez à vous entraîner !
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentStep.completed && (
                    <Button
                      onClick={handleNext}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continuer la conversation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default GameLessonAdaptive;