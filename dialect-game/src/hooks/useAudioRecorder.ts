import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderOptions {
  onProcessingComplete: (success: boolean) => void;
}

export const useAudioRecorder = ({ onProcessingComplete }: UseAudioRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const processRecording = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Simulate audio processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      onProcessingComplete(true);
    } catch (error) {
      onProcessingComplete(false);
    } finally {
      setIsProcessing(false);
    }
  }, [onProcessingComplete]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setTimeRemaining(5);
      mediaRecorder.start();

      const countdown = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownRef.current = countdown;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onProcessingComplete(false);
    }
  }, [processRecording, stopRecording, onProcessingComplete]);

  return {
    isRecording,
    timeRemaining,
    isProcessing,
    startRecording,
    stopRecording
  };
};