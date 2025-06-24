import React from 'react';
import { Sparkles } from 'lucide-react';

export const ExerciseProcessingState: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse" />
      </div>
      <div>
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-1">
          🧠 Analyse en cours...
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          L'IA évalue votre prononciation
        </p>
      </div>
    </div>
  );
};