import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Trophy, CheckCircle2, Sparkles, RotateCcw, Play } from 'lucide-react';

interface ExerciseCompletedStateProps {
  accuracy: number;
  message: string;
  currentStep: number;
  totalExercises: number;
  isSuccess: boolean;
  hasUserAudio: boolean;
  onPlayUserAudio: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export const ExerciseCompletedState: React.FC<ExerciseCompletedStateProps> = ({
  accuracy,
  message,
  currentStep,
  totalExercises,
  isSuccess,
  hasUserAudio,
  onPlayUserAudio,
  onRetry,
  onNext
}) => {
  const getIcon = () => {
    if (accuracy >= 90) return <Trophy className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />;
    if (accuracy >= 75) return <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />;
    return <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400" />;
  };

  const getBgColor = () => {
    if (accuracy >= 90) return 'bg-yellow-100 dark:bg-yellow-900';
    if (accuracy >= 75) return 'bg-green-100 dark:bg-green-900';
    return 'bg-blue-100 dark:bg-blue-900';
  };

  return (
    <div className="text-center space-y-4">
      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getBgColor()}`}>
        {getIcon()}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          {accuracy}%
        </div>
        <Progress value={accuracy} className="h-3 mb-3 max-w-xs mx-auto" />
        <p className="text-base text-slate-600 dark:text-slate-300 mb-4">
          {message}
        </p>
      </div>
      
      <div className="space-y-3">
        {hasUserAudio && (
          <Button
            onClick={onPlayUserAudio}
            variant="outline"
            size="sm"
            className="w-full max-w-xs mx-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            Réécouter ma voix
          </Button>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
          {!isSuccess && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          
          <Button
            onClick={onNext}
            size="sm"
            data-cta-button
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {currentStep < totalExercises - 1 ? (
              <>
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Terminer
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};