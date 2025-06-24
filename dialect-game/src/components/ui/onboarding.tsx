/**
 * Système d'onboarding interactif avec animations
 * Task 9: Amélioration UX/UI - Phase 2
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw } from 'lucide-react';
import { EnhancedButton } from './enhanced-button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter, EnhancedCardHeader } from './enhanced-card';

const onboardingVariants = cva(
  [
    'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
    'animate-fade-in',
  ],
  {
    variants: {
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content?: React.ReactNode;
  target?: string; // Sélecteur CSS pour l'élément à mettre en évidence
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  autoAdvance?: number; // Millisecondes avant passage auto à l'étape suivante
}

interface OnboardingProps extends VariantProps<typeof onboardingVariants> {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  showProgress?: boolean;
  showSkip?: boolean;
  allowBackward?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  currentStep: controlledStep,
  onStepChange,
  showProgress = true,
  showSkip = true,
  allowBackward = true,
  autoPlay = false,
  size,
  className,
}) => {
  const [internalStep, setInternalStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const [highlightedElement, setHighlightedElement] = React.useState<HTMLElement | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const currentStepIndex = controlledStep ?? internalStep;
  const currentStepData = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Gestion du step courant
  const handleStepChange = React.useCallback((newStep: number) => {
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }
  }, [onStepChange]);

  // Auto-advance logic
  React.useEffect(() => {
    if (!isOpen || !isPlaying || !currentStepData?.autoAdvance) return;

    timeoutRef.current = setTimeout(() => {
      if (!isLastStep) {
        handleStepChange(currentStepIndex + 1);
      } else {
        onComplete?.();
      }
    }, currentStepData.autoAdvance);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentStepIndex, isOpen, isPlaying, isLastStep, currentStepData, handleStepChange, onComplete]);

  // Mise en évidence de l'élément ciblé
  React.useEffect(() => {
    if (!isOpen || !currentStepData?.target) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      
      // Scrolling smooth vers l'élément
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Ajout de classes pour la mise en évidence
      element.classList.add('onboarding-highlight');
      
      return () => {
        element.classList.remove('onboarding-highlight');
      };
    }
  }, [isOpen, currentStepData]);

  const handleNext = () => {
    if (!isLastStep) {
      handleStepChange(currentStepIndex + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      handleStepChange(currentStepIndex - 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    handleStepChange(0);
    setIsPlaying(autoPlay);
  };

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = highlightedElement.getBoundingClientRect();
    const position = currentStepData?.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // Ajouter les styles CSS directement au head
  React.useEffect(() => {
    if (!isOpen) return;

    const style = document.createElement('style');
    style.textContent = `
      .onboarding-highlight {
        position: relative;
        z-index: 51;
        border-radius: 8px;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        animation: pulse-highlight 2s infinite;
      }
      
      @keyframes pulse-highlight {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isOpen]);

  if (!isOpen || !currentStepData) return null;

  return (
    <div className={cn(onboardingVariants({ size }), className)}>
      {highlightedElement && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${
              highlightedElement.getBoundingClientRect().left + 
              highlightedElement.getBoundingClientRect().width / 2
            }px ${
              highlightedElement.getBoundingClientRect().top + 
              highlightedElement.getBoundingClientRect().height / 2
            }px, transparent 100px, rgba(0,0,0,0.8) 200px)`,
          }}
        />
      )}

      {/* Tooltip avec contenu */}
      <div
        className="absolute w-96 max-w-[90vw] z-10 animate-scale-in"
        style={getTooltipPosition()}
      >
        <EnhancedCard variant="elevated" className="shadow-2xl">
          <EnhancedCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                {steps.some(step => step.autoAdvance) && (
                  <EnhancedButton
                    variant="ghost"
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-8 w-8"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </EnhancedButton>
                )}
                
                <EnhancedButton
                  variant="ghost"
                  size="icon"
                  onClick={handleRestart}
                  className="h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </EnhancedButton>

                {showSkip && (
                  <EnhancedButton
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </EnhancedButton>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {showProgress && (
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            )}
          </EnhancedCardHeader>

          <EnhancedCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
            
            {currentStepData.content && (
              <div className="mb-4">
                {currentStepData.content}
              </div>
            )}

            {/* Action step */}
            {currentStepData.action && (
              <EnhancedButton
                onClick={currentStepData.action.onClick}
                className="w-full mb-4"
                glow="subtle"
              >
                {currentStepData.action.label}
              </EnhancedButton>
            )}
          </EnhancedCardContent>

          <EnhancedCardFooter justify="between">
            <div className="flex space-x-2">
              {allowBackward && !isFirstStep && (
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  icon={<ChevronLeft className="h-4 w-4" />}
                >
                  Précédent
                </EnhancedButton>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {currentStepIndex + 1} / {steps.length}
              </span>
              
              <EnhancedButton
                size="sm"
                onClick={handleNext}
                icon={!isLastStep ? <ChevronRight className="h-4 w-4" /> : undefined}
                iconPosition="right"
                glow={isLastStep ? "medium" : "none"}
                variant={isLastStep ? "success" : "default"}
              >
                {isLastStep ? 'Terminer' : 'Suivant'}
              </EnhancedButton>
            </div>
          </EnhancedCardFooter>
        </EnhancedCard>
      </div>
    </div>
  );
};

// Hook pour gérer l'onboarding
export const useOnboarding = (steps: OnboardingStep[]) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [hasCompleted, setHasCompleted] = React.useState(false);

  const start = React.useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const complete = React.useCallback(() => {
    setHasCompleted(true);
    setIsOpen(false);
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
    setHasCompleted(false);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    currentStep,
    hasCompleted,
    start,
    close,
    complete,
    reset,
    setCurrentStep,
  };
};

// Présets d'onboarding pour l'application
export const gameOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans Dialect Game ! 🎉',
    description: 'Découvrez comment apprendre les langues de manière interactive et amusante.',
    position: 'center',
    autoAdvance: 3000,
  },
  {
    id: 'language-selector',
    title: 'Choisissez vos langues',
    description: 'Sélectionnez la langue source et la langue cible pour commencer votre apprentissage.',
    target: '[data-testid="language-selector"]',
    position: 'bottom',
  },
  {
    id: 'difficulty',
    title: 'Niveau de difficulté',
    description: 'Ajustez le niveau selon votre expérience. Vous pourrez le modifier à tout moment.',
    target: '[data-testid="difficulty-selector"]',
    position: 'top',
  },
  {
    id: 'start-quiz',
    title: 'Commencer un quiz',
    description: 'Cliquez ici pour démarrer votre premier quiz interactif !',
    target: '[data-testid="start-quiz-button"]',
    position: 'top',
    action: {
      label: 'Essayer maintenant',
      onClick: () => console.log('Quiz started from onboarding'),
    },
  },
  {
    id: 'voice-input',
    title: 'Reconnaissance vocale',
    description: 'Utilisez votre voix pour répondre aux questions et améliorer votre pronunciation.',
    target: '[data-testid="voice-input"]',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'Vous êtes prêt ! 🚀',
    description: 'Vous connaissez maintenant toutes les fonctionnalités. Amusez-vous bien !',
    position: 'center',
    autoAdvance: 2000,
  },
];

export { Onboarding, onboardingVariants };
export type { OnboardingStep, OnboardingProps };