/**
 * LessonSidebar - Navigation verticale gauche pour l'apprentissage immersif
 * Remplace les éléments de progression du header pour optimiser l'espace d'apprentissage
 * 
 * FONCTIONNALITÉS :
 * 1. Progression globale avec barre moderne
 * 2. Indicateurs phases avec états visuels
 * 3. Animation slide responsive
 * 4. Overlay mobile avec backdrop
 * 5. Accessibilité WCAG AA complète
 */

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '../ui/progress';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour la configuration des phases (réutilise les patterns existants)
interface PhaseConfig {
  step: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  weight: number;
}
// Configuration des couleurs (réutilise LESSON_THEME du composant principal)
const LESSON_THEME = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA', 
  primaryDark: '#1E40AF',
  success: '#10B981',
  background: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
  accent: {
    situation: 'from-blue-500 to-blue-600',
    vocabulary: 'from-blue-600 to-indigo-600',
    exercises: 'from-indigo-600 to-purple-600', 
    integration: 'from-purple-600 to-violet-600'
  }
};

// Interface du composant
export interface LessonSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPhase: string | null;
  globalProgress: number;
  phaseConfig: Record<string, PhaseConfig> | null;
  lessonTitle: string;
  className?: string;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  isOpen,
  onToggle,
  currentPhase,
  globalProgress,
  phaseConfig,
  lessonTitle,
  className = ''
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Gestion du focus pour l'accessibilité
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Focus sur le premier élément focusable lors de l'ouverture
      const firstFocusable = sidebarRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isOpen]);

  // Gestion de l'échappement au clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onToggle]);

  // Rendu des indicateurs de phases
  const renderPhaseIndicators = () => {
    if (!phaseConfig || !currentPhase) return null;

    return Object.entries(phaseConfig).map(([phase, config]) => {
      const isCompleted = phaseConfig && config.step < (phaseConfig[currentPhase]?.step || 0);
      const isCurrent = currentPhase === phase;
      const PhaseIconComponent = config.icon;
      
      return (
        <div 
          key={phase}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            isCompleted && "bg-green-50 dark:bg-green-950/50",
            isCurrent && "bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-200 dark:ring-blue-800"
          )}
        >
          {/* Icône de phase avec état visuel */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isCompleted 
              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" 
              : isCurrent 
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
          )}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <PhaseIconComponent className="w-5 h-5" />
            )}
          </div>

          {/* Informations de phase */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-medium text-sm truncate",
                isCompleted 
                  ? "text-green-700 dark:text-green-300"
                  : isCurrent
                    ? "text-blue-700 dark:text-blue-300" 
                    : "text-gray-600 dark:text-gray-400"
              )}>
                {config.label}
              </h3>
              <Badge 
                variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                className="ml-2 text-xs"
              >
                {config.step}/{config.total}
              </Badge>
            </div>
            
            {/* Barre de progression de phase */}
            {isCurrent && (
              <div className="mt-2">
                <div className={cn(
                  "h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                )}>
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r transition-all duration-700 ease-out",
                      LESSON_THEME.accent[phase as keyof typeof LESSON_THEME.accent]
                    )}
                    style={{ width: `${Math.min(globalProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  };
  return (
    <>
      {/* Overlay pour mobile (z-40 pour être sous la sidebar z-50) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar principale */}
      <div
        ref={sidebarRef}
        className={cn(
          // Position et dimensions
          "fixed left-0 top-0 h-full w-64 z-50",
          // Style et backdrop
          "bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg",
          "border-r border-gray-200/50 dark:border-gray-700/50",
          "shadow-xl",
          // Animation slide
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Responsive : masqué sur grand écran par défaut
          "lg:translate-x-0",
          className
        )}
        role="navigation"
        aria-label="Navigation de la leçon"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {lessonTitle}
              </h2>
            </div>
            
            {/* Bouton fermeture (mobile uniquement) */}
            <Button
              variant="ghost" 
              size="sm"
              onClick={onToggle}
              className="lg:hidden ml-2"
              aria-label="Fermer la navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>          
          {/* Contenu principal de la sidebar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Section progression globale */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Progression globale
                  </h3>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    {globalProgress}%
                  </span>
                </div>
                
                {/* Barre de progression principale */}
                <div className="space-y-2">
                  <Progress 
                    value={globalProgress} 
                    className="h-3"
                    aria-label={`Progression de la leçon : ${globalProgress}%`}
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Début</span>
                    <span>Terminé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section phases */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm px-1">
                Phases d'apprentissage
              </h3>
              <div className="space-y-2">
                {renderPhaseIndicators()}
              </div>
            </div>
          </div>

          {/* Footer avec bouton toggle (desktop uniquement) */}
          <div className="hidden lg:block p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              size="sm" 
              onClick={onToggle}
              className="w-full justify-center"
              aria-label={isOpen ? "Réduire la navigation" : "Étendre la navigation"}
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default LessonSidebar;