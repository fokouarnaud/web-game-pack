import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, CheckCircle2, Play, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import type { LessonData } from '../../data/lessonData';
import { useGameLessonState } from '../../hooks/useGameLessonState';
import { useNavigate } from 'react-router-dom';
import { AutoScrollContainer } from '../common/AutoScrollContainer';
import { IntegrationHeader } from './integration/IntegrationHeader';
import { DialogueHistory } from './integration/DialogueHistory';
import { UserTurnUI } from './integration/UserTurnUI';
import { NPCTurnUI } from './integration/NPCTurnUI';

interface IntegrationPhaseProps {
  lessonData: LessonData;
  lessonId?: string;
  chapterNumber: number;
}

interface DialogueState {
  isRecording: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  timeRemaining: number;
  message: string;
  userAudioBlob?: Blob;
}

export const IntegrationPhase: React.FC<IntegrationPhaseProps> = ({ 
  lessonData, 
  lessonId,
  chapterNumber 
}) => {
  const navigate = useNavigate();
  const { dialogueState, updateDialogue } = useGameLessonState();
  
  const [dialogState, setDialogState] = useState<DialogueState>({
    isRecording: false,
    isProcessing: false,
    isCompleted: false,
    timeRemaining: 10,
    message: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const currentDialogueIndex = dialogueState.currentDialogueIndex ?? 0;
  const currentDialogue = lessonData.integration.dialogue[currentDialogueIndex];
  const totalDialogues = lessonData.integration.dialogue.length;
  const progressPercentage = ((currentDialogueIndex + 1) / totalDialogues) * 100;

  // Cleanup et reset de l'état local quand l'index de dialogue change
  useEffect(() => {
    // Reset de l'état local à chaque changement de dialogue
    if (!dialogueState.userTurnCompleted) {
      setDialogState({
        isRecording: false,
        isProcessing: false,
        isCompleted: false,
        timeRemaining: 10,
        message: '',
        userAudioBlob: undefined,
      });
    }
  }, [currentDialogueIndex, dialogueState.userTurnCompleted]);

  // Cleanup général
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Audio automatique pour NPC
  const playAudio = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Lecture audio utilisateur
  const playUserAudio = useCallback(() => {
    if (dialogState.userAudioBlob) {
      const audio = new Audio(URL.createObjectURL(dialogState.userAudioBlob));
      audio.play();
    }
  }, [dialogState.userAudioBlob]);

  // Auto-play pour les messages NPC
  useEffect(() => {
    if (currentDialogue?.speaker === 'npc' && !dialogState.isCompleted) {
      const timeout = setTimeout(() => playAudio(currentDialogue.text), 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentDialogue, playAudio, dialogState.isCompleted]);

  // Démarrer enregistrement
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setDialogState(prev => ({ ...prev, userAudioBlob: audioBlob }));
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setDialogState(prev => ({ ...prev, isRecording: true, timeRemaining: 10 }));
      mediaRecorderRef.current.start();
      startCountdown();

    } catch (error) {
      console.error('Erreur microphone:', error);
      setDialogState(prev => ({ 
        ...prev, 
        message: "🎤 Vérifiez vos permissions microphone et réessayez !"
      }));
    }
  }, []);

  // Décompte
  const startCountdown = useCallback(() => {
    countdownRef.current = setInterval(() => {
      setDialogState(prev => {
        if (prev.timeRemaining <= 1) {
          stopRecording();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, []);

  // Arrêter enregistrement
  const stopRecording = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setDialogState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
  }, []);

  // Traitement enregistrement
  const processRecording = useCallback(async (audioBlob: Blob) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2; // 80% de réussite
      const messages = success ? 
        ["🌟 Parfait ! Votre conversation est naturelle !", "✨ Excellent ! Vous maîtrisez bien !", "💫 Bravo ! Communication réussie !"] :
        ["🌱 Bien tenté ! Continuons ensemble !", "💪 Presque ! Réessayez !", "✨ C'est le bon chemin !"];
      
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      setDialogState(prev => ({
        ...prev,
        isProcessing: false,
        isCompleted: true,
        message
      }));

      // ✅ Correction : mise à jour plus simple et fiable
      updateDialogue({ userTurnCompleted: true });

    } catch (error) {
      console.error('Erreur traitement:', error);
      setDialogState(prev => ({ 
        ...prev, 
        isProcessing: false,
        message: "✨ Réessayons ensemble !"
      }));
    }
  }, [dialogueState, updateDialogue]);

  // Dialogue suivant
  const handleNextDialogue = useCallback(() => {
    if (currentDialogueIndex < totalDialogues - 1) {
      const nextIndex = currentDialogueIndex + 1;
      
      // Mise à jour de l'état global
      updateDialogue({
        currentDialogueIndex: nextIndex,
        userTurnCompleted: false
      });
      
      // Réinitialisation complète de l'état local
      setDialogState({
        isRecording: false,
        isProcessing: false,
        isCompleted: false,
        timeRemaining: 10,
        message: '',
        userAudioBlob: undefined, // ✅ Reset de l'audio
      });
      
      // Nettoyage des refs
      audioChunksRef.current = [];
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
    } else {
      navigate(`/lesson-complete-educational?status=success&chapterNumber=${chapterNumber}&score=95&lessonId=${lessonId}&type=integration`);
    }
  }, [currentDialogueIndex, totalDialogues, updateDialogue, navigate, chapterNumber, lessonId]);

  if (!currentDialogue) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <IntegrationHeader
        currentDialogueIndex={currentDialogueIndex}
        totalDialogues={totalDialogues}
        progressPercentage={progressPercentage}
        scenario={lessonData.integration.scenario}
      />

      <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/10 border-0 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          
          <DialogueHistory
            dialogues={lessonData.integration.dialogue}
            currentIndex={currentDialogueIndex}
          />

          <AutoScrollContainer 
            shouldScroll={dialogState.isRecording || dialogState.isProcessing || dialogState.isCompleted}
            className="space-y-4"
          >
            {/* Tour de l'utilisateur */}
            {currentDialogue.speaker === 'user' && !dialogueState.userTurnCompleted && (
              <div className="space-y-4">
                
                {/* État initial */}
                {!dialogState.isRecording && !dialogState.isProcessing && !dialogState.isCompleted && (
                  <UserTurnUI
                    currentDialogue={currentDialogue}
                    onPlayAudio={playAudio}
                    onStartRecording={startRecording}
                  />
                )}

                {/* État enregistrement */}
                {dialogState.isRecording && (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <Mic className="h-10 w-10 text-red-500 dark:text-red-400 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-300 dark:border-red-700 animate-ping"></div>
                    </div>
                    
                    <div>
                      <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-1">
                        {dialogState.timeRemaining}s
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        🎤 Dites : "{currentDialogue.text}"
                      </p>
                    </div>
                    
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Terminer
                    </Button>
                  </div>
                )}

                {/* État traitement */}
                {dialogState.isProcessing && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-lg text-slate-700 dark:text-slate-200 mb-1">
                        🧠 Analyse en cours...
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Évaluation de votre conversation
                      </p>
                    </div>
                  </div>
                )}

                {/* État complété */}
                {dialogState.isCompleted && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div>
                      <p className="text-base text-slate-600 dark:text-slate-300 mb-3">
                        {dialogState.message}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {dialogState.userAudioBlob && (
                        <Button
                          onClick={playUserAudio}
                          variant="outline"
                          size="sm"
                          className="w-full max-w-xs mx-auto"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Réécouter ma voix
                        </Button>
                      )}
                      
                      <Button
                        onClick={handleNextDialogue}
                        size="sm"
                        data-cta-button
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        {currentDialogueIndex < totalDialogues - 1 ? (
                          <>
                            Continuer la conversation
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Terminer la leçon
                            <Trophy className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tour du NPC */}
            {currentDialogue.speaker === 'npc' && (
              <NPCTurnUI
                currentDialogue={currentDialogue}
                onNext={handleNextDialogue}
              />
            )}

          </AutoScrollContainer>

        </CardContent>
      </Card>
    </div>
  );
};