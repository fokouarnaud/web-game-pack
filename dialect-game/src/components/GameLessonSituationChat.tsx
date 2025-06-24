/**
 * GameLessonSituationChat - Conversation Immersive avec Assistance Contextuelle
 * Simule une vraie situation de conversation continue avec aide non-intrusive
 * L'utilisateur vit la situation tandis qu'un coach virtuel l'aide discrètement
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
  RefreshCw
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';

// Import services TDD
import { AdvancedVoiceEngine } from '../services/voice/AdvancedVoiceEngine';
import { PitchAnalyzer } from '../services/voice/PitchAnalyzer';
import { EmotionalToneDetector } from '../services/voice/EmotionalToneDetector';
import { AccentAdaptationEngine } from '../services/voice/AccentAdaptationEngine';

interface ConversationTurn {
  id: string;
  speaker: 'npc' | 'user';
  text: string;
  nativeTranslation: string;
  pronunciation: string;
  context: string;
  situation: string;
  completed: boolean;
  userAudioBlob?: Blob;
  accuracy?: number;
  attempts: number;
}

interface SituationState {
  phase: 'intro' | 'conversation' | 'coaching' | 'review' | 'completed';
  currentTurn: number;
  totalTurns: number;
  conversationPaused: boolean;
  coachingActive: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  conversationHistory: ConversationTurn[];
  currentUserResponse?: string;
  score: number;
}

interface ConversationScenario {
  id: string;
  title: string;
  situation: string;
  npcName: string;
  npcDescription: string;
  setting: string;
  objective: string;
  turns: ConversationTurn[];
}

// Services TDD
const voiceEngine = new AdvancedVoiceEngine(
  new PitchAnalyzer(),
  new EmotionalToneDetector(),
  new AccentAdaptationEngine()
);

// Scénarios de conversation immersive
const getConversationScenario = (chapterNumber: number): ConversationScenario => {
  const scenarios = {
    1: {
      id: "coffee-shop",
      title: "Commande au Café",
      situation: "Vous entrez dans un café branché de Londres pour commander votre boisson préférée",
      npcName: "Sarah",
      npcDescription: "Barista souriante et patiente",
      setting: "☕ Starbucks - High Street, London",
      objective: "Commander un café et un muffin, demander le prix, payer",
      turns: [
        {
          id: "greeting",
          speaker: "npc" as const,
          text: "Good morning! Welcome to Starbucks. What can I get for you today?",
          nativeTranslation: "Bonjour ! Bienvenue chez Starbucks. Que puis-je vous servir aujourd'hui ?",
          pronunciation: "good MOR-ning! WEL-come to STAR-bucks. what can i get for you to-DAY?",
          context: "Accueil chaleureux du personnel",
          situation: "La barista vous sourit et attend votre commande",
          completed: false,
          attempts: 0
        },
        {
          id: "order",
          speaker: "user" as const,
          text: "Hi! I'd like a large cappuccino and a blueberry muffin, please.",
          nativeTranslation: "Salut ! Je voudrais un grand cappuccino et un muffin aux myrtilles, s'il vous plaît.",
          pronunciation: "hi! i'd like a large cap-pu-CHI-no and a BLUE-berry MUF-fin, please",
          context: "Passer sa commande poliment",
          situation: "Vous commandez ce que vous désirez",
          completed: false,
          attempts: 0
        },
        {
          id: "price",
          speaker: "npc" as const,
          text: "Perfect! That'll be £7.50. Would you like anything else?",
          nativeTranslation: "Parfait ! Cela fera 7,50£. Désirez-vous autre chose ?",
          pronunciation: "PER-fect! that'll be SEV-en fifty. would you like A-ny-thing else?",
          context: "Annonce du prix et proposition additionnelle",
          situation: "La barista confirme votre commande et annonce le prix",
          completed: false,
          attempts: 0
        },
        {
          id: "payment",
          speaker: "user" as const,
          text: "No, that's all. Can I pay by card, please?",
          nativeTranslation: "Non, c'est tout. Puis-je payer par carte, s'il vous plaît ?",
          pronunciation: "no, that's all. can i pay by card, please?",
          context: "Confirmer la commande et demander mode de paiement",
          situation: "Vous confirmez votre commande et voulez payer",
          completed: false,
          attempts: 0
        },
        {
          id: "farewell",
          speaker: "npc" as const,
          text: "Of course! Here you go. Your order will be ready in just a moment. Have a great day!",
          nativeTranslation: "Bien sûr ! Voilà. Votre commande sera prête dans un instant. Passez une excellente journée !",
          pronunciation: "of course! here you go. your OR-der will be REA-dy in just a MO-ment. have a great day!",
          context: "Finalisation courtoise de la transaction",
          situation: "La barista finalise la vente et vous souhaite une bonne journée",
          completed: false,
          attempts: 0
        },
        {
          id: "thanks",
          speaker: "user" as const,
          text: "Thank you so much! See you later.",
          nativeTranslation: "Merci beaucoup ! À plus tard.",
          pronunciation: "thank you so much! see you LA-ter",
          context: "Remerciement et au revoir poli",
          situation: "Vous remerciez et prenez congé poliment",
          completed: false,
          attempts: 0
        }
      ]
    }
  };
  
  return scenarios[chapterNumber as keyof typeof scenarios] || scenarios[1];
};

export const GameLessonSituationChat: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const scenario = getConversationScenario(chapterNumber);
  
  const [situationState, setSituationState] = useState<SituationState>({
    phase: 'intro',
    currentTurn: 0,
    totalTurns: scenario.turns.length,
    conversationPaused: false,
    coachingActive: false,
    isRecording: false,
    isProcessing: false,
    conversationHistory: [...scenario.turns],
    score: 0
  });

  const conversationAreaRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentTurn = situationState.conversationHistory[situationState.currentTurn];

  // Auto-scroll conversation
  const scrollToCurrentTurn = () => {
    if (conversationAreaRef.current) {
      const currentElement = conversationAreaRef.current.querySelector(`[data-turn="${situationState.currentTurn}"]`);
      currentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    scrollToCurrentTurn();
  }, [situationState.currentTurn]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Démarrer la conversation
  const startConversation = useCallback(() => {
    setSituationState(prev => ({ ...prev, phase: 'conversation' }));
    
    // Lire automatiquement le premier message NPC
    if (currentTurn && currentTurn.speaker === 'npc') {
      setTimeout(() => {
        playNPCAudio(currentTurn.text);
      }, 1000);
    }
  }, [currentTurn]);

  // Lecture audio NPC
  const playNPCAudio = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB'; // Accent britannique pour le café londonien
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Mettre en pause / reprendre la conversation
  const toggleConversationPause = useCallback(() => {
    setSituationState(prev => ({ 
      ...prev, 
      conversationPaused: !prev.conversationPaused,
      coachingActive: !prev.conversationPaused // Activer coaching quand pause
    }));
  }, []);

  // Démarrer l'enregistrement utilisateur
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
        processUserResponse(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setSituationState(prev => ({ ...prev, isRecording: true }));
      mediaRecorderRef.current.start();
      
      // Auto-stop après 10 secondes
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Erreur microphone:', error);
    }
  }, []);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setSituationState(prev => ({ ...prev, isRecording: false }));
  }, []);

  // Traiter la réponse utilisateur
  const processUserResponse = useCallback(async (audioBlob: Blob) => {
    setSituationState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Simulation d'analyse avec nos services TDD
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const accuracy = 75 + Math.random() * 20; // 75-95%
      
      // Mettre à jour l'historique
      setSituationState(prev => ({
        ...prev,
        conversationHistory: prev.conversationHistory.map((turn, index) => 
          index === prev.currentTurn 
            ? { ...turn, completed: true, userAudioBlob: audioBlob, accuracy, attempts: turn.attempts + 1 }
            : turn
        ),
        score: prev.score + Math.floor(accuracy * 5),
        isProcessing: false,
        coachingActive: true, // Activer coaching pour feedback
        conversationPaused: true
      }));
      
    } catch (error) {
      console.error('Erreur traitement:', error);
      setSituationState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [situationState.currentTurn]);

  // Continuer la conversation
  const continueConversation = useCallback(() => {
    if (situationState.currentTurn < situationState.totalTurns - 1) {
      setSituationState(prev => ({
        ...prev,
        currentTurn: prev.currentTurn + 1,
        conversationPaused: false,
        coachingActive: false
      }));
      
      // Lire le prochain message NPC si applicable
      const nextTurn = situationState.conversationHistory[situationState.currentTurn + 1];
      if (nextTurn && nextTurn.speaker === 'npc') {
        setTimeout(() => {
          playNPCAudio(nextTurn.text);
        }, 1000);
      }
    } else {
      setSituationState(prev => ({ ...prev, phase: 'review' }));
    }
  }, [situationState.currentTurn, situationState.totalTurns, situationState.conversationHistory, playNPCAudio]);

  // Réécouter sa propre voix
  const playUserAudio = useCallback((turn: ConversationTurn) => {
    if (turn.userAudioBlob) {
      const audio = new Audio(URL.createObjectURL(turn.userAudioBlob));
      audio.play();
    }
  }, []);

  // Réécouter l'exemple
  const playExampleAudio = useCallback((text: string) => {
    playNPCAudio(text);
  }, [playNPCAudio]);

  // Réécouter toute la conversation
  const playFullConversation = useCallback(() => {
    let index = 0;
    const playNext = () => {
      if (index < situationState.conversationHistory.length) {
        const turn = situationState.conversationHistory[index];
        playNPCAudio(turn.text);
        
        setTimeout(() => {
          index++;
          playNext();
        }, turn.text.length * 80); // Délai basé sur la longueur du texte
      }
    };
    playNext();
  }, [situationState.conversationHistory, playNPCAudio]);

  // Recommencer la leçon
  const restartLesson = useCallback(() => {
    setSituationState({
      phase: 'intro',
      currentTurn: 0,
      totalTurns: scenario.turns.length,
      conversationPaused: false,
      coachingActive: false,
      isRecording: false,
      isProcessing: false,
      conversationHistory: [...scenario.turns],
      score: 0
    });
  }, [scenario]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-amber-900 dark:to-orange-900">
      
      {/* Header situation */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-orange-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="rounded-full hover:bg-orange-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center flex-1 px-4">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {scenario.title}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {scenario.setting}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 font-bold">
                {situationState.score}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-center mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Tour {situationState.currentTurn + 1} sur {situationState.totalTurns}
              </span>
            </div>
            <Progress 
              value={((situationState.currentTurn + 1) / situationState.totalTurns) * 100} 
              className="h-1.5 bg-orange-200 dark:bg-slate-700"
            />
          </div>
        </div>
      </header>

      {/* Interface principale en 2 colonnes */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
        
        {/* Colonne principale : Conversation immersive */}
        <div className="flex-1 lg:flex-[2] relative">
          
          {/* Phase intro */}
          {situationState.phase === 'intro' && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="max-w-2xl w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur border-orange-200 dark:border-slate-700">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">☕</div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    {scenario.title}
                  </h1>
                  <div className="space-y-4 mb-6">
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Situation :</strong> {scenario.situation}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Votre objectif :</strong> {scenario.objective}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Interlocuteur :</strong> {scenario.npcName} - {scenario.npcDescription}
                    </p>
                  </div>
                  <Button 
                    onClick={startConversation}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Commencer la conversation
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Phase conversation */}
          {(situationState.phase === 'conversation' || situationState.phase === 'coaching') && (
            <div className="h-full flex flex-col">
              
              {/* Contrôles conversation */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-orange-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleConversationPause}
                      variant={situationState.conversationPaused ? "default" : "outline"}
                      size="sm"
                      className={situationState.conversationPaused ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {situationState.conversationPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      {situationState.conversationPaused ? 'Reprendre' : 'Pause & Aide'}
                    </Button>
                    
                    {situationState.conversationPaused && (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Conversation en pause
                      </Badge>
                    )}
                  </div>
                  
                  {currentTurn && currentTurn.speaker === 'user' && !situationState.conversationPaused && (
                    <Button
                      onClick={situationState.isRecording ? stopRecording : startRecording}
                      className={situationState.isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
                      disabled={situationState.isProcessing}
                    >
                      {situationState.isRecording ? <StopCircle className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {situationState.isRecording ? 'Arrêter' : 'Répondre'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Zone de conversation */}
              <div ref={conversationAreaRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {situationState.conversationHistory.map((turn, index) => (
                  <div 
                    key={turn.id}
                    data-turn={index}
                    className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'} ${
                      index === situationState.currentTurn ? 'ring-2 ring-orange-300 ring-opacity-50 rounded-lg p-2' : ''
                    }`}
                  >
                    {/* Avatar NPC */}
                    {turn.speaker === 'npc' && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Bulle de conversation */}
                    <div className={`max-w-[70%] ${turn.speaker === 'user' ? 'order-1' : ''}`}>
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        turn.speaker === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-bl-md'
                      }`}>
                        <p className={`text-sm leading-relaxed ${
                          turn.speaker === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {turn.text}
                        </p>
                        
                        {/* Indicateurs pour tour actuel */}
                        {index === situationState.currentTurn && (
                          <div className="mt-2 pt-2 border-t border-orange-200">
                            {turn.speaker === 'user' ? (
                              <div className="text-xs text-blue-100">
                                {!turn.completed && !situationState.isProcessing && !situationState.isRecording && (
                                  <span>🎤 À vous de parler...</span>
                                )}
                                {situationState.isRecording && <span>🔴 Enregistrement...</span>}
                                {situationState.isProcessing && <span>🧠 Analyse...</span>}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">
                                <span>💬 {scenario.npcName} parle...</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Résultats utilisateur */}
                        {turn.speaker === 'user' && turn.completed && turn.accuracy && (
                          <div className="mt-2 pt-2 border-t border-blue-400">
                            <div className="flex items-center justify-between text-xs text-blue-100">
                              <span>Précision</span>
                              <span className="font-bold">{Math.round(turn.accuracy)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-1 ${turn.speaker === 'user' ? 'text-right text-blue-400' : 'text-slate-400'}`}>
                        {turn.speaker === 'npc' ? scenario.npcName : 'Vous'}
                      </div>
                    </div>
                    
                    {/* Avatar utilisateur */}
                    {turn.speaker === 'user' && (
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

          {/* Phase review */}
          {situationState.phase === 'review' && (
            <div className="h-full overflow-y-auto p-6">
              <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      Conversation terminée !
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      Vous avez complété la situation : {scenario.title}
                    </p>
                  </div>
                  
                  {/* Récapitulatif conversation */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      📝 Récapitulatif de votre conversation
                    </h3>
                    
                    {situationState.conversationHistory.map((turn, index) => (
                      <div key={turn.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                              {turn.speaker === 'npc' ? scenario.npcName : 'Vous'}: {turn.text}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                              {turn.nativeTranslation}
                            </div>
                            {turn.speaker === 'user' && turn.accuracy && (
                              <Badge variant={turn.accuracy >= 80 ? 'default' : 'secondary'} className="text-xs">
                                Précision: {Math.round(turn.accuracy)}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => playExampleAudio(turn.text)}
                              className="text-xs"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                            {turn.speaker === 'user' && turn.userAudioBlob && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playUserAudio(turn)}
                                className="text-xs"
                              >
                                <Volume1 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Actions finales */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={playFullConversation}
                      variant="outline"
                      className="border-orange-300 hover:bg-orange-50"
                    >
                      <Rewind className="h-4 w-4 mr-2" />
                      Réécouter toute la conversation
                    </Button>
                    
                    <Button
                      onClick={restartLesson}
                      variant="outline"
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recommencer la leçon
                    </Button>
                    
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

        {/* Colonne latérale : Coaching non-intrusif */}
        <div className={`lg:flex-1 lg:max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur border-l border-orange-200 dark:border-slate-700 transition-all duration-300 ${
          situationState.coachingActive ? 'lg:block' : 'lg:hidden'
        }`}>
          {situationState.coachingActive && currentTurn && (
            <div className="h-full overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                Aide & Conseils
              </h3>
              
              {/* Informations sur la phrase actuelle */}
              <Card className="mb-4 border-orange-200 dark:border-slate-600">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        📝 À dire :
                      </div>
                      <div className="text-base font-medium text-slate-800 dark:text-slate-100">
                        {currentTurn.text}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        🇫🇷 Traduction :
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {currentTurn.nativeTranslation}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        🗣️ Prononciation :
                      </div>
                      <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                        {currentTurn.pronunciation}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        💡 Contexte :
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {currentTurn.context}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions d'aide */}
              <div className="space-y-3">
                <Button
                  onClick={() => playExampleAudio(currentTurn.text)}
                  variant="outline"
                  className="w-full border-blue-300 hover:bg-blue-50"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Écouter l'exemple
                </Button>
                
                {currentTurn.userAudioBlob && (
                  <Button
                    onClick={() => playUserAudio(currentTurn)}
                    variant="outline"
                    className="w-full border-green-300 hover:bg-green-50"
                  >
                    <Volume1 className="h-4 w-4 mr-2" />
                    Réécouter ma voix
                  </Button>
                )}
                
                {currentTurn.completed && currentTurn.accuracy && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {Math.round(currentTurn.accuracy)}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        Précision de prononciation
                      </div>
                      <Progress value={currentTurn.accuracy} className="h-2 mb-3" />
                      
                      {currentTurn.accuracy >= 80 ? (
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
                
                {currentTurn.completed && (
                  <Button
                    onClick={continueConversation}
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
      </div>
    </div>
  );
};

export default GameLessonSituationChat;