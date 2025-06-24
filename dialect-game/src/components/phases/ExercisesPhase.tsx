import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LessonData } from '@/data/lessonData';
import { useGameLessonState } from '@/hooks/useGameLessonState';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { AutoScrollContainer } from '@/components/common/AutoScrollContainer';
import { ExerciseHeader } from './exercise/ExerciseHeader';
import { ExerciseWordDisplay } from './exercise/ExerciseWordDisplay';
import { ExerciseInitialState } from './exercise/ExerciseInitialState';
import { ExerciseRecordingState } from './exercise/ExerciseRecordingState';
import { ExerciseProcessingState } from './exercise/ExerciseProcessingState';
import { ExerciseCompletedState } from './exercise/ExerciseCompletedState';

interface ExercisesPhaseProps {
  lessonData: LessonData;
}

interface ExerciseState {
  isRecording: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  timeRemaining: number;
  accuracy: number;
  attempts: number;
  message: string;
  userAudioBlob?: Blob;
}

export const ExercisesPhase: React.FC<ExercisesPhaseProps> = ({ lessonData }) => {
  const { currentStep, updateStep, updateProgress, updatePhase } = useGameLessonState();
  
  // **PHASE 2 UX : Auto-scroll intelligent vers boutons CTA**
  const { scrollToActionButton } = useAutoScroll();
  
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    isRecording: false,
    isProcessing: false,
    isCompleted: false,
    timeRemaining: 8,
    accuracy: 0,
    attempts: 0,
    message: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const currentExercise = lessonData.exercises.exercises[currentStep] || lessonData.exercises.exercises[0];
  const totalExercises = lessonData.exercises.exercises.length;

  // Cleanup
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Reset état à chaque nouvel exercice
  useEffect(() => {
    setExerciseState(prev => ({
      ...prev,
      isCompleted: false,
      message: '',
      attempts: 0,
      accuracy: 0,
      userAudioBlob: undefined
    }));
  }, [currentStep]);
  
  // **PHASE 2 UX : Auto-scroll vers boutons CTA après changement d'exercice**
  useEffect(() => {
    if (exerciseState.isCompleted && currentStep > 0) { 
      const timer = setTimeout(() => {
        scrollToActionButton('[data-cta-button]');
      }, 500); // Délai 500ms après completion
      
      return () => clearTimeout(timer);
    }
  }, [exerciseState.isCompleted, currentStep, scrollToActionButton]);

  // Audio modèle
  const playModelAudio = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Lecture audio utilisateur
  const playUserAudio = useCallback(() => {
    if (exerciseState.userAudioBlob) {
      const audio = new Audio(URL.createObjectURL(exerciseState.userAudioBlob));
      audio.play();
    }
  }, [exerciseState.userAudioBlob]);

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
        setExerciseState(prev => ({ ...prev, userAudioBlob: audioBlob }));
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setExerciseState(prev => ({ ...prev, isRecording: true, timeRemaining: 8 }));
      mediaRecorderRef.current.start();
      startCountdown();

    } catch (error) {
      console.error('Erreur microphone:', error);
      setExerciseState(prev => ({ 
        ...prev, 
        message: "🎤 Vérifiez vos permissions microphone et réessayez !"
      }));
    }
  }, []);

  // Décompte
  const startCountdown = useCallback(() => {
    countdownRef.current = setInterval(() => {
      setExerciseState(prev => {
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
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setExerciseState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
  }, []);

  // Traitement enregistrement
  const processRecording = useCallback(async (audioBlob: Blob) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const accuracy = 70 + Math.random() * 25;
      const newAttempts = exerciseState.attempts + 1;
      
      let message = '';
      if (accuracy >= 90) message = "🌟 Excellent ! Votre prononciation est parfaite !";
      else if (accuracy >= 75) message = "✨ Très bien ! Vous progressez rapidement !";
      else if (newAttempts === 1) message = "🌱 Premier essai ! C'est déjà un bon début !";
      else message = "💪 Continuez ! Chaque essai vous améliore !";
      
      setExerciseState(prev => ({
        ...prev,
        isProcessing: false,
        isCompleted: true,
        accuracy: Math.round(accuracy),
        attempts: newAttempts,
        message
      }));

    } catch (error) {
      console.error('Erreur traitement:', error);
      setExerciseState(prev => ({ 
        ...prev, 
        isProcessing: false,
        message: "✨ Réessayons ensemble !"
      }));
    }
  }, [exerciseState.attempts]);

  // Exercice suivant
  const handleNextExercise = useCallback(() => {
    if (currentStep < totalExercises - 1) {
      const nextStep = currentStep + 1;
      updateStep(nextStep);
      updateProgress((nextStep / totalExercises) * 100);
    } else {
      updatePhase('integration', 0);
      updateProgress(0);
    }
  }, [currentStep, totalExercises, updateStep, updateProgress, updatePhase]);

  // Réessayer
  const handleRetry = useCallback(() => {
    setExerciseState(prev => ({
      ...prev,
      isCompleted: false,
      message: '',
      userAudioBlob: undefined
    }));
  }, []);

  const isSuccess = exerciseState.accuracy >= 70;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <ExerciseHeader
        currentStep={currentStep}
        totalExercises={totalExercises}
        accuracy={exerciseState.accuracy}
      />

      <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10 border-0 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          
          <ExerciseWordDisplay
            instruction={currentExercise.instruction}
            word={currentExercise.word}
            translation={currentExercise.translation}
          />

          <AutoScrollContainer 
            shouldScroll={exerciseState.isRecording || exerciseState.isProcessing || exerciseState.isCompleted}
            className="space-y-6"
          >
            {!exerciseState.isRecording && !exerciseState.isProcessing && !exerciseState.isCompleted && (
              <ExerciseInitialState
                word={currentExercise.word}
                onPlayAudio={playModelAudio}
                onStartRecording={startRecording}
              />
            )}

            {exerciseState.isRecording && (
              <ExerciseRecordingState
                timeRemaining={exerciseState.timeRemaining}
                word={currentExercise.word}
                onStopRecording={stopRecording}
              />
            )}

            {exerciseState.isProcessing && <ExerciseProcessingState />}

            {exerciseState.isCompleted && (
              <ExerciseCompletedState
                accuracy={exerciseState.accuracy}
                message={exerciseState.message}
                currentStep={currentStep}
                totalExercises={totalExercises}
                isSuccess={isSuccess}
                hasUserAudio={!!exerciseState.userAudioBlob}
                onPlayUserAudio={playUserAudio}
                onRetry={handleRetry}
                onNext={handleNextExercise}
              />
            )}
          </AutoScrollContainer>

        </CardContent>
      </Card>
    </div>
  );
};