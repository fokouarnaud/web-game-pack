import React from 'react';

interface DialogueMessage {
  speaker: 'user' | 'npc';
  text: string;
  translation: string;
}

interface DialogueHistoryProps {
  dialogues: DialogueMessage[];
  currentIndex: number;
}

export const DialogueHistory: React.FC<DialogueHistoryProps> = ({
  dialogues,
  currentIndex
}) => {
  return (
    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
      {dialogues.slice(0, currentIndex + 1).map((line, index) => (
        <div key={index} className={`flex ${line.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
            line.speaker === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
              : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {line.speaker === 'user' ? (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
              ) : (
                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <span className="text-xs font-medium opacity-80">
                {line.speaker === 'user' ? 'Vous' : 'Assistant'}
              </span>
            </div>
            <p className="font-medium mb-1 text-sm">{line.text}</p>
            <p className={`text-xs opacity-80 ${
              line.speaker === 'user' ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {line.translation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};