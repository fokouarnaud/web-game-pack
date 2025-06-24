import React from 'react';

interface ExerciseWordDisplayProps {
  instruction: string;
  word: string;
  translation: string;
}

export const ExerciseWordDisplay: React.FC<ExerciseWordDisplayProps> = ({
  instruction,
  word,
  translation
}) => {
  return (
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
        {instruction}
      </h3>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-green-100 dark:border-slate-600 max-w-md mx-auto">
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {word}
        </p>
        <p className="text-lg text-green-600 dark:text-green-400 font-medium">
          {translation}
        </p>
      </div>
    </div>
  );
};