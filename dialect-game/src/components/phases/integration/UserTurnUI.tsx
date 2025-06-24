import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Volume2, Mic } from 'lucide-react';

interface UserTurnUIProps {
  currentDialogue: {
    text: string;
    translation: string;
  };
  onPlayAudio: (text: string) => void;
  onStartRecording: () => void;
}

export const UserTurnUI: React.FC<UserTurnUIProps> = ({
  currentDialogue,
  onPlayAudio,
  onStartRecording
}) => {
  return (
    <div className="space-y-4">
      
      {/* Phrase à dire */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            À vous de dire :
          </h3>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {currentDialogue.text}
          </p>
          <p className="text-base text-blue-600 dark:text-blue-400">
            {currentDialogue.translation}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Écoutez d'abord, puis répétez la phrase !
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
          <Button
            onClick={() => onPlayAudio(currentDialogue.text)}
            variant="outline"
            size="sm"
            className="border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-900/20"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Écouter
          </Button>
          
          <Button
            onClick={onStartRecording}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Mic className="h-4 w-4 mr-2" />
            Répondre
          </Button>
        </div>
      </div>
    </div>
  );
};