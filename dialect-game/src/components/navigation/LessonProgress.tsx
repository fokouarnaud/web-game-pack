/**
 * LessonProgress - Pagination verticale discrète pour remplacer la sidebar
 * Design minimaliste inspiré des meilleures pratiques UX/UI 2025
 * 
 * OBJECTIFS :
 * 1. Réduire l'encombrement visuel (sidebar 264px → progress 60px)
 * 2. Maintenir focus sur zone d'apprentissage principale
 * 3. Information essentielle accessible mais non-distrayante
 * 4. Style moderne avec micro-interactions subtiles
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Target, BookOpen, Brain, Zap } from 'lucide-react';

// Types pour la configuration des phases
interface PhaseConfig {
  step: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  weight: number;
}

// Interface du composant
export interface LessonProgressProps {
  currentPhase: string | null;
  globalProgress: number;
  phaseConfig: Record<string, PhaseConfig> | null;
  className?: string;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  currentPhase,
  globalProgress,
  phaseConfig,
  className = ''
}) => {
  if (!phaseConfig || !currentPhase) return null;

  const currentPhaseConfig = phaseConfig[currentPhase];

  return (
    <div className={cn(
      "fixed left-4 top-1/2 -translate-y-1/2 z-40",
      "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
      "rounded-2xl border border-gray-200/50 dark:border-gray-700/50",
      "shadow-lg hover:shadow-xl transition-all duration-300",
      "p-3 space-y-3 max-w-[60px]",
      className
    )}>
      {/* Progression globale compacte */}
      <div className="text-center space-y-1">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          {globalProgress}%
        </div>
        <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      </div>

      {/* Indicateurs phases verticaux */}
      <div className="space-y-2">
        {Object.entries(phaseConfig).map(([phase, config]) => {
          const isCompleted = config.step < currentPhaseConfig.step;
          const isCurrent = currentPhase === phase;
          const PhaseIconComponent = config.icon;
          
          return (
            <div 
              key={phase}
              className={cn(
                "relative group flex items-center justify-center",
                "w-10 h-10 rounded-xl transition-all duration-300",
                "hover:scale-110 cursor-pointer",
                isCompleted 
                  ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" 
                  : isCurrent 
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
              )}
              title={config.label}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <PhaseIconComponent className="w-5 h-5" />
              )}
              
              {/* Tooltip au hover */}
              <div className={cn(
                "absolute left-14 top-1/2 -translate-y-1/2",
                "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "pointer-events-none z-50"
              )}>
                {config.label} ({config.step}/{config.total})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonProgress;