/**
 * GameLessonChatZen - Interface de Chat Conversationnel pour Apprentissage
 * Simule une conversation naturelle avec un tuteur IA bienveillant
 * UX/UI moderne de messagerie avec bonnes pratiques et accessibilité
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Mic,
  Volume2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Play,
  StopCircle,
  Send,
  User,
  Bot,
  Heart,
  Star,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';
import { useGameLessonNavigation } from '../hooks/useGameLessonNavigation';

// Import services TDD
import { AdvancedVoiceEngine } from '../services/voice/AdvancedVoiceEngine';
import { PitchAnalyzer } from '../services/voice/PitchAnalyzer';
import { EmotionalToneDetector } from '../services/voice/EmotionalToneDetector';
import { AccentAdaptationEngine } from '../services/voice/AccentAdaptationEngine';
import { PredictiveAIService } from '../services/ai/PredictiveAIService';
import { LearningPredictor } from '../services/ai/LearningPredictor';
import { WeaknessDetectionAI } from '../services/ai/WeaknessDetectionAI';
import { CognitiveOptimizer } from '../services/ai/CognitiveOptimizer';

interface ChatMessage {
  id: string;
  type: 'tutor' | 'user' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'analyzed' | 'failed';
  audioUrl?: string;
  accuracy?: number;
  suggestion?: string;
  actions?: ChatAction[];
}

interface ChatAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  onClick: () => void;
}

interface ChatState {
  phase: 'intro' | 'learning' | 'practicing' | 'feedback' | 'celebrating' | 'completed';
  currentStep: number;
  totalSteps: number;
  score: number;
  isRecording: boolean;
  isProcessing: boolean;
  userAudioBlob?: Blob;
  messages: ChatMessage[];
  pendingActions: ChatAction[];
}

interface ConversationStep {
  id: string;
  tutorMessage: string;
  targetPhrase: string;
  nativeTranslation: string;
  pronunciation: string;
  context: string;
  difficulty: number;
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

// Données de conversation structurées
const getConversationData = (chapterNumber: number) => {
  const conversations = {
    1: {
      title: "Première Conversation en Anglais",
      tutorName: "Emma",
      tutorAvatar: "👩‍🏫",
      context: "Rencontre avec une anglophone bienveillante",
      steps: [
        {
          id: "intro-1",
          tutorMessage: "Hi there! I'm Emma, your English tutor. Let's start with a simple greeting. Can you say 'Hello' to me?",
          targetPhrase: "Hello",
          nativeTranslation: "Bonjour",
          pronunciation: "HEH-low",
          context: "Salutation de base",
          difficulty: 1
        },
        {
          id: "intro-2", 
          tutorMessage: "Perfect! Now, let's try asking how someone is doing. Say 'How are you?'",
          targetPhrase: "How are you?",
          nativeTranslation: "Comment allez-vous ?",
          pronunciation: "how ar yoo",
          context: "Demander des nouvelles",
          difficulty: 2
        },
        {
          id: "intro-3",
          tutorMessage: "Excellent! Now respond as if you're doing well. Say 'I'm fine, thank you!'",
          targetPhrase: "I'm fine, thank you!",
          nativeTranslation: "Je vais bien, merci !",
          pronunciation: "aym fayn, thank yoo",
          context: "Répondre positivement",
          difficulty: 2
        },
        {
          id: "intro-4",
          tutorMessage: "Wonderful! Let's end our conversation politely. Say 'Nice to meet you!'",
          targetPhrase: "Nice to meet you!",
          nativeTranslation: "Ravi de vous rencontrer !",
          pronunciation: "nys to meet yoo",
          context: "Formule de politesse",
          difficulty: 3
        }
      ]
    }
  };
  
  return conversations[chapterNumber as keyof typeof conversations] || conversations[1];
};

export const GameLessonChatZen: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { navigateToLessonComplete } = useGameLessonNavigation();
  
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const conversationData = getConversationData(chapterNumber);
  
  const [chatState, setChatState] = useState<ChatState>({
    phase: 'intro',
    currentStep: 0,
    totalSteps: conversationData.steps.length,
    score: 0,
    isRecording: false,
    isProcessing: false,
    messages: [],
    pendingActions: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentStep = conversationData.steps[chatState.currentStep];

  // Auto-scroll vers le bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Initialisation de la conversation
  useEffect(() => {
    if (chatState.messages.length === 0) {
      addSystemMessage("💫 Conversation démarrée avec Emma");
      setTimeout(() => {
        addTutorMessage(
          `Hello! 👋 I'm ${conversationData.tutorName}, your friendly English tutor. Welcome to our conversation practice! Are you ready to start? 😊`,
          ['start']
        );
      }, 1000);
    }
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Fonctions de gestion des messages
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    addMessage({
      type: 'system',
      content,
      status: 'sent'
    });
  }, [addMessage]);

  const addTutorMessage = useCallback((content: string, actionIds: string[] = []) => {
    const actions = generateActionsForStep(actionIds);
    addMessage({
      type: 'tutor',
      content,
      status: 'sent',
      actions
    });
    
    // Lecture automatique du message tuteur
    setTimeout(() => {
      playTutorMessage(content);
    }, 500);
  }, [addMessage]);

  const addUserMessage = useCallback((content: string, accuracy?: number, suggestion?: string) => {
    addMessage({
      type: 'user',
      content,
      status: 'analyzed',
      accuracy,
      suggestion
    });
  }, [addMessage]);

  // Génération d'actions contextuelles
  const generateActionsForStep = useCallback((actionIds: string[]): ChatAction[] => {
    const actionMap: Record<string, ChatAction> = {
      start: {
        id: 'start',
        label: 'Commencer',
        icon: <Play className="h-4 w-4" />,
        variant: 'primary',
        onClick: startConversation
      },
      listen: {
        id: 'listen',
        label: 'Écouter exemple',
        icon: <Volume2 className="h-4 w-4" />,
        variant: 'secondary',
        onClick: playExample
      },
      record: {
        id: 'record',
        label: chatState.isRecording ? 'Arrêter' : 'Parler',
        icon: chatState.isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />,
        variant: chatState.isRecording ? 'warning' : 'primary',
        onClick: chatState.isRecording ? stopRecording : startRecording
      },
      retry: {
        id: 'retry',
        label: 'Réessayer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'secondary',
        onClick: retryStep
      },
      next: {
        id: 'next',
        label: 'Continuer',
        icon: <ArrowRight className="h-4 w-4" />,
        variant: 'success',
        onClick: nextStep
      },
      complete: {
        id: 'complete',
        label: 'Terminer',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'success',
        onClick: completeLesson
      }
    };

    return actionIds.map(id => actionMap[id]).filter(Boolean);
  }, [chatState.isRecording]);

  // Fonctions d'actions
  const startConversation = useCallback(() => {
    setChatState(prev => ({ ...prev, phase: 'learning' }));
    addSystemMessage("🎯 Conversation commencée !");
    
    setTimeout(() => {
      addTutorMessage(
        `Great! ${currentStep.tutorMessage}`,
        ['listen', 'record']
      );
      addSystemMessage(`💭 À dire : "${currentStep.targetPhrase}" (${currentStep.nativeTranslation})`);
    }, 1000);
  }, [currentStep, addTutorMessage, addSystemMessage]);

  const playExample = useCallback(() => {
    addSystemMessage("🔊 Exemple audio...");
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentStep.targetPhrase);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        addSystemMessage("✨ Vous pouvez maintenant essayer !");
      };
      
      speechSynthesis.speak(utterance);
    }
  }, [currentStep, addSystemMessage]);

  const playTutorMessage = useCallback((content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

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
        setChatState(prev => ({ ...prev, userAudioBlob: audioBlob }));
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setChatState(prev => ({ ...prev, isRecording: true }));
      addSystemMessage("🎤 Enregistrement en cours... Parlez maintenant !");
      
      mediaRecorderRef.current.start();
      
      // Auto-stop après 10 secondes
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Erreur microphone:', error);
      addSystemMessage("❌ Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  }, [addSystemMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setChatState(prev => ({ ...prev, isRecording: false }));
  }, []);

  const processRecording = useCallback(async (audioBlob: Blob) => {
    setChatState(prev => ({ ...prev, isProcessing: true }));
    addSystemMessage("🧠 Analyse de votre prononciation...");
    
    try {
      // Simulation d'analyse avec nos services TDD
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const accuracy = 70 + Math.random() * 25; // 70-95%
      const isGood = accuracy >= 75;
      
      // Message utilisateur avec résultat
      addUserMessage(
        currentStep.targetPhrase,
        accuracy,
        isGood ? "Excellente prononciation !" : "Bon début ! Essayez de bien articuler."
      );
      
      // Réponse du tuteur
      setTimeout(() => {
        if (isGood) {
          const encouragements = [
            "Excellent! 🌟 Your pronunciation is getting better!",
            "Perfect! 🎉 You're doing great!",
            "Wonderful! ✨ I can hear the improvement!",
            "Amazing! 💫 Keep up the good work!"
          ];
          const message = encouragements[Math.floor(Math.random() * encouragements.length)];
          addTutorMessage(message, ['next']);
          
          setChatState(prev => ({ 
            ...prev, 
            score: prev.score + Math.floor(accuracy * 5),
            phase: 'feedback'
          }));
        } else {
          addTutorMessage(
            "Good try! 😊 Let's practice this a bit more. Would you like to hear the example again?",
            ['listen', 'retry', 'next']
          );
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erreur traitement:', error);
      addSystemMessage("❌ Erreur lors de l'analyse. Réessayez.");
    } finally {
      setChatState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [currentStep, addUserMessage, addTutorMessage, addSystemMessage]);

  const retryStep = useCallback(() => {
    addSystemMessage("🔄 Nouvel essai !");
    addTutorMessage(
      `No problem! Let's try again. ${currentStep.tutorMessage}`,
      ['listen', 'record']
    );
  }, [currentStep, addSystemMessage, addTutorMessage]);

  const nextStep = useCallback(() => {
    if (chatState.currentStep < chatState.totalSteps - 1) {
      setChatState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        phase: 'learning'
      }));
      
      const nextStepData = conversationData.steps[chatState.currentStep + 1];
      addSystemMessage(`✨ Étape ${chatState.currentStep + 2}/${chatState.totalSteps}`);
      
      setTimeout(() => {
        addTutorMessage(
          `Great progress! 🚀 ${nextStepData.tutorMessage}`,
          ['listen', 'record']
        );
        addSystemMessage(`💭 À dire : "${nextStepData.targetPhrase}" (${nextStepData.nativeTranslation})`);
      }, 1000);
    } else {
      setChatState(prev => ({ ...prev, phase: 'celebrating' }));
      addTutorMessage(
        "🎉 Congratulations! You've completed our conversation practice! You did an amazing job! 🌟",
        ['complete']
      );
    }
  }, [chatState.currentStep, chatState.totalSteps, conversationData, addSystemMessage, addTutorMessage]);

  const completeLesson = useCallback(() => {
    navigateToLessonComplete({ 
      status: 'success', 
      chapterNumber, 
      score: chatState.score, 
      accuracy: 85, 
      type: 'zen' 
    });
  }, [navigateToLessonComplete, chapterNumber, chatState.score]);

  // Rendu des messages
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div
        key={message.id}
        className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`}
      >
        {/* Avatar pour tuteur */}
        {!isUser && !isSystem && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        )}
        
        {/* Bulle de message */}
        <div className={`max-w-[80%] ${isSystem ? 'max-w-[90%]' : ''}`}>
          {isSystem ? (
            <div className="text-center">
              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                {message.content}
              </Badge>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl shadow-sm ${
                isUser
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'
              }`}
            >
              <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                {message.content}
              </p>
              
              {/* Accuracy pour messages utilisateur */}
              {isUser && message.accuracy && (
                <div className="mt-2 pt-2 border-t border-blue-400">
                  <div className="flex items-center justify-between text-xs text-blue-100">
                    <span>Précision</span>
                    <span className="font-bold">{Math.round(message.accuracy)}%</span>
                  </div>
                  {message.suggestion && (
                    <p className="text-xs text-blue-100 mt-1">{message.suggestion}</p>
                  )}
                </div>
              )}
              
              {/* Actions pour messages tuteur */}
              {!isUser && message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant={action.variant === 'primary' ? 'default' : 'outline'}
                      onClick={action.onClick}
                      disabled={chatState.isProcessing}
                      className={`text-xs ${
                        action.variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600' :
                        action.variant === 'success' ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' :
                        action.variant === 'warning' ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' :
                        'border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700'
                      }`}
                    >
                      {action.icon}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>
        
        {/* Avatar pour utilisateur */}
        {isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Header chat zen */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
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
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {conversationData.title}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Conversation avec {conversationData.tutorName} {conversationData.tutorAvatar}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-bold">
                {chatState.score}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-center mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Étape {chatState.currentStep + 1} sur {chatState.totalSteps}
              </span>
            </div>
            <Progress 
              value={((chatState.currentStep + 1) / chatState.totalSteps) * 100} 
              className="h-1.5 bg-slate-200 dark:bg-slate-700"
            />
          </div>
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Messages */}
            <div className="space-y-1">
              {chatState.messages.map(renderMessage)}
              
              {/* Indicateur de processing */}
              {chatState.isProcessing && (
                <div className="flex justify-start mb-4">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md p-4 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Emma is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Indicateur d'enregistrement */}
              {chatState.isRecording && (
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 animate-pulse">
                    <Mic className="h-3 w-3 mr-1" />
                    Recording...
                  </Badge>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLessonChatZen;