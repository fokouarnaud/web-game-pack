import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Mic } from 'lucide-react';

interface ExerciseInitialStateProps {
  word: string;
  onPlayAudio: (text: string) => void;
  onStartRecording: () => void;
}

export const ExerciseInitialState: React.FC<ExerciseInitialStateProps> = ({
  word,
  onPlayAudio,
  onStartRecording
}) => {
  return (
    <div className="text-center space-y-4">
      <p className="text-base text-slate-600 dark:text-slate-300">
        Écoutez le modèle, puis répétez !
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <Button
          onClick={() => onPlayAudio(word)}
          variant="outline"
          size="sm"
          className="border-green-300 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Écouter
        </Button>
        
        <Button
          onClick={onStartRecording}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Mic className="h-4 w-4 mr-2" />
          Prononcer
        </Button>
      </div>
    </div>
  );
};