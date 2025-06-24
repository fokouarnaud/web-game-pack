import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface ExerciseHeaderProps {
  currentStep: number;
  totalExercises: number;
  accuracy: number;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  currentStep,
  totalExercises,
  accuracy
}) => {
  return (
    <div className="text-center mb-6">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center shadow-lg">
          <Target className="h-8 w-8 text-green-500 dark:text-green-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">🎯</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3">
        Exercices Pratiques
      </h2>
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm">
          Exercice {currentStep + 1}/{totalExercises}
        </Badge>
        {accuracy > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-sm">
            {accuracy}%
          </Badge>
        )}
      </div>
    </div>
  );
};