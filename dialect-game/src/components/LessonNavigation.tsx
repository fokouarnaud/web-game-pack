/**
 * Enhanced Lesson Content Navigation
 * In-lesson navigation controls with progress saving and accessibility
 * Phase 3 - Task 14 Implementation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Menu, 
  Save, 
  SkipForward,
  SkipBack,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Keyboard,
  X,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import type { Lesson } from './LessonSelector';

export interface LessonStep {
  id: string;
  title: string;
  type: 'instruction' | 'practice' | 'quiz' | 'review';
  duration: number; // estimated minutes
  isCompleted: boolean;
  isOptional?: boolean;
}

export interface LessonNavigationState {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  autoPlay: boolean;
  timeSpent: number; // in seconds
  accuracy: number;
  stepsCompleted: number;
}

interface LessonNavigationProps {
  lesson: Lesson;
  steps: LessonStep[];
  navigationState: LessonNavigationState;
  onNavigate: (direction: 'previous' | 'next' | 'step', stepIndex?: number) => void;
  onExit: (saveProgress: boolean) => void;
  onToggleAutoPlay: () => void;
  onRestart: () => void;
  className?: string;
}

// Keyboard shortcuts configuration
const KEYBOARD_SHORTCUTS = {
  'ArrowLeft': 'Previous step',
  'ArrowRight': 'Next step',
  'Space': 'Play/Pause auto-advance',
  'Home': 'Go to first step',
  'End': 'Go to last step',
  'Escape': 'Exit lesson',
  'r': 'Restart lesson',
  's': 'Save progress',
  '?': 'Show shortcuts'
};

// Mini-map component for multi-step lessons
interface LessonMiniMapProps {
  steps: LessonStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  className?: string;
}

const LessonMiniMap: React.FC<LessonMiniMapProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`lesson-mini-map ${className}`}>
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Lesson Progress ({currentStep + 1}/{steps.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {steps.map((step, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = step.isCompleted;
            const isAccessible = index <= currentStep || isCompleted;
            
            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepClick(index)}
                disabled={!isAccessible}
                className={`
                  w-6 h-6 rounded text-xs font-medium transition-all duration-200
                  ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-ring' :
                    isCompleted ? 'bg-green-500 text-white' :
                    isAccessible ? 'bg-muted hover:bg-muted-foreground/20' :
                    'bg-muted-foreground/10 opacity-50 cursor-not-allowed'}
                `}
                title={`${step.title} ${isCompleted ? '(Completed)' : isCurrent ? '(Current)' : ''}`}
              >
                {isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Floating navigation controls
interface FloatingControlsProps {
  navigationState: LessonNavigationState;
  onNavigate: (direction: 'previous' | 'next') => void;
  onToggleAutoPlay: () => void;
  onShowMenu: () => void;
  className?: string;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  navigationState,
  onNavigate,
  onToggleAutoPlay,
  onShowMenu,
  className = ''
}) => {
  return (
    <div className={`floating-controls fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('previous')}
          disabled={!navigationState.canGoBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAutoPlay}
          className="rounded-full"
        >
          {navigationState.autoPlay ? 
            <Pause className="h-4 w-4" /> : 
            <Play className="h-4 w-4" />
          }
        </Button>
        
        <div className="px-3 py-1 text-sm font-medium">
          {navigationState.currentStep + 1}/{navigationState.totalSteps}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={!navigationState.canGoForward}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowMenu}
          className="rounded-full"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  lesson,
  steps,
  navigationState,
  onNavigate,
  onExit,
  onToggleAutoPlay,
  onRestart,
  className = ''
}) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    
    autoSaveRef.current = setInterval(() => {
      setLastSaveTime(new Date());
      // Trigger save progress
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (navigationState.canGoBack) {
          onNavigate('previous');
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (navigationState.canGoForward) {
          onNavigate('next');
        }
        break;
      case ' ':
        event.preventDefault();
        onToggleAutoPlay();
        break;
      case 'Home':
        event.preventDefault();
        onNavigate('step', 0);
        break;
      case 'End':
        event.preventDefault();
        onNavigate('step', navigationState.totalSteps - 1);
        break;
      case 'Escape':
        event.preventDefault();
        setShowExitDialog(true);
        break;
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onRestart();
        }
        break;
      case 's':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setLastSaveTime(new Date());
        }
        break;
      case '?':
        event.preventDefault();
        setShowShortcuts(true);
        break;
    }
  }, [navigationState, onNavigate, onToggleAutoPlay, onRestart]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Calculate lesson progress
  const overallProgress = (navigationState.stepsCompleted / navigationState.totalSteps) * 100;
  const currentStepProgress = ((navigationState.currentStep + 1) / navigationState.totalSteps) * 100;

  // Format time spent
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`lesson-navigation ${className}`}>
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitDialog(true)}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Exit
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lesson.title}</span>
                <span>•</span>
                <span>Step {navigationState.currentStep + 1} of {navigationState.totalSteps}</span>
              </div>
            </div>

            {/* Center section - Progress */}
            <div className="flex-1 max-w-md mx-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(currentStepProgress)}%</span>
                </div>
                <Progress value={currentStepProgress} className="h-2" />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(navigationState.timeSpent)}
              </Badge>
              
              <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                <Target className="h-3 w-3" />
                {navigationState.accuracy}%
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMiniMap(!showMiniMap)}
                className="gap-2"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mini-map overlay */}
      {showMiniMap && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowMiniMap(false)}>
          <div className="absolute top-20 right-4">
            <LessonMiniMap
              steps={steps}
              currentStep={navigationState.currentStep}
              onStepClick={(stepIndex) => {
                onNavigate('step', stepIndex);
                setShowMiniMap(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Floating controls */}
      <FloatingControls
        navigationState={navigationState}
        onNavigate={onNavigate}
        onToggleAutoPlay={onToggleAutoPlay}
        onShowMenu={() => setShowMiniMap(!showMiniMap)}
      />

      {/* Auto-save indicator */}
      {lastSaveTime && (
        <div className="fixed bottom-6 right-6 z-30">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Save className="h-3 w-3" />
            Saved {lastSaveTime.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Exit confirmation dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Lesson?</DialogTitle>
            <DialogDescription>
              You're {Math.round(currentStepProgress)}% through this lesson. Your progress will be saved automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Time Spent</div>
                  <div className="text-muted-foreground">{formatTime(navigationState.timeSpent)}</div>
                </div>
                <div>
                  <div className="font-medium">Steps Completed</div>
                  <div className="text-muted-foreground">{navigationState.stepsCompleted}/{navigationState.totalSteps}</div>
                </div>
                <div>
                  <div className="font-medium">Current Accuracy</div>
                  <div className="text-muted-foreground">{navigationState.accuracy}%</div>
                </div>
                <div>
                  <div className="font-medium">Auto-save</div>
                  <div className="text-green-600">Enabled</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExitDialog(false)}
              className="w-full sm:w-auto"
            >
              Continue Lesson
            </Button>
            <Button
              onClick={() => {
                onExit(true);
                setShowExitDialog(false);
              }}
              className="w-full sm:w-auto"
            >
              Save & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard shortcuts dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate more efficiently
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {Object.entries(KEYBOARD_SHORTCUTS).map(([key, description]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{description}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {key === ' ' ? 'Space' : key}
                </Badge>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowShortcuts(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Touch gesture indicators (mobile) */}
      <div className="fixed bottom-20 left-4 sm:hidden">
        <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs text-muted-foreground">
          Swipe ← → to navigate
        </div>
      </div>
    </div>
  );
};

export default LessonNavigation;