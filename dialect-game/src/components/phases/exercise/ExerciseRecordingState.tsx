import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';

interface ExerciseRecordingStateProps {
  timeRemaining: number;
  word: string;
  onStopRecording: () => void;
}

export const ExerciseRecordingState: React.FC<ExerciseRecordingStateProps> = ({
  timeRemaining,
  word,
  onStopRecording
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <Mic className="h-10 w-10 text-red-500 dark:text-red-400 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-red-300 dark:border-red-700 animate-ping"></div>
      </div>
      
      <div>
        <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          {timeRemaining}s
        </div>
        <p className="text-base text-slate-600 dark:text-slate-300">
          🎤 Répétez : "{word}"
        </p>
      </div>
      
      <Button
        onClick={onStopRecording}
        variant="destructive"
        size="sm"
        className="rounded-full"
      >
        <StopCircle className="h-4 w-4 mr-2" />
        Terminer
      </Button>
    </div>
  );
};