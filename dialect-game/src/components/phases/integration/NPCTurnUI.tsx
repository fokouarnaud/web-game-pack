import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface NPCTurnUIProps {
  currentDialogue: {
    text: string;
    translation: string;
  };
  onNext: () => void;
}

export const NPCTurnUI: React.FC<NPCTurnUIProps> = ({
  currentDialogue,
  onNext
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            L'assistant vous parle...
          </p>
        </div>
        <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1">
          💬 {currentDialogue.text}
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {currentDialogue.translation}
        </p>
      </div>
      
      <Button 
        onClick={onNext} 
        variant="outline"
        size="sm"
        className="border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-900/20"
      >
        Continuer 
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};