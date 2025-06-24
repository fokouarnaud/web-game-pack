import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users } from 'lucide-react';

interface IntegrationHeaderProps {
  currentDialogueIndex: number;
  totalDialogues: number;
  progressPercentage: number;
  scenario: string;
}

export const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  currentDialogueIndex,
  totalDialogues,
  progressPercentage,
  scenario
}) => {
  return (
    <div className="text-center mb-6">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center shadow-lg">
          <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">💬</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
        Mise en Situation
      </h2>
      <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-4">
        {scenario}
      </p>
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-sm">
          Dialogue {currentDialogueIndex + 1}/{totalDialogues}
        </Badge>
      </div>
      
      <Progress value={progressPercentage} className="h-2 max-w-xs mx-auto" />
    </div>
  );
};