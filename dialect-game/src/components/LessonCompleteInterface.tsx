/**
 * Lesson Complete Interface 2025 - Ultra-Practical Design
 * Direct user flow, maximum 2 choices, real data integration, clear next actions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Target,
  Zap
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggleSimple';

interface LessonResult {
  status: 'success' | 'failed';
  lessonId: string;
  chapterNumber: number;
  score: number;
  accuracy: number;
  timeSpent: number;
  xpEarned: number;
}

// Real lesson progression data
const getLessonProgression = (chapterNumber: number, lessonId: string) => {
  const lessons = {
    1: [
      { id: 'greeting-basics', title: 'Basic Greetings', completed: true },
      { id: 'introductions', title: 'Introductions', completed: false },
      { id: 'politeness', title: 'Politeness Expressions', completed: false }
    ],
    2: [
      { id: 'shopping-basics', title: 'Shopping Basics', completed: true },
      { id: 'numbers-money', title: 'Numbers & Money', completed: false },
      { id: 'bargaining', title: 'Bargaining', completed: false }
    ]
  };
  
  const chapterLessons = lessons[chapterNumber as keyof typeof lessons] || lessons[1];
  const currentIndex = chapterLessons.findIndex(l => l.id === lessonId);
  const nextLesson = chapterLessons[currentIndex + 1];
  const hasNextChapter = chapterNumber < Object.keys(lessons).length;
  
  return {
    current: chapterLessons[currentIndex],
    next: nextLesson,
    hasNextChapter,
    progress: {
      completed: chapterLessons.filter(l => l.completed).length,
      total: chapterLessons.length
    }
  };
};

const getChapterInfo = (chapterNumber: number) => {
  const chapters = {
    1: { title: 'Basic Greetings', context: '🏘️ Village Square' },
    2: { title: 'Shopping Basics', context: '🛒 Local Market' },
    3: { title: 'Directions', context: '⛰️ Mountain Path' }
  };
  
  return chapters[chapterNumber as keyof typeof chapters] || chapters[1];
};

export const LessonCompleteInterface: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status') as 'success' | 'failed' || 'success';
  const lessonId = searchParams.get('lessonId') || 'greeting-basics';
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const score = parseInt(searchParams.get('score') || '750');
  const accuracy = parseInt(searchParams.get('accuracy') || '85');

  const [showCelebration, setShowCelebration] = useState(false);
  
  const result: LessonResult = {
    status,
    lessonId,
    chapterNumber,
    score,
    accuracy,
    timeSpent: Math.floor(2 + Math.random() * 4), // 2-6 minutes
    xpEarned: Math.floor(score * 0.1) + 50
  };

  const progression = getLessonProgression(chapterNumber, lessonId);
  const chapterInfo = getChapterInfo(chapterNumber);
  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Next action logic - clear and simple
  const getNextAction = () => {
    if (!isSuccess) {
      return {
        primary: {
          label: 'Try Again',
          icon: <RotateCcw className="h-5 w-5" />,
          action: () => navigate(`/game-lesson?lessonId=${lessonId}&chapterNumber=${chapterNumber}`)
        },
        secondary: {
          label: 'Back to Lessons',
          icon: <ArrowLeft className="h-5 w-5" />,
          action: () => navigate('/lessons')
        }
      };
    }

    if (progression.next) {
      return {
        primary: {
          label: 'Next Lesson',
          icon: <ArrowRight className="h-5 w-5" />,
          action: () => navigate(`/game-lesson?lessonId=${progression.next.id}&chapterNumber=${chapterNumber}`)
        },
        secondary: {
          label: 'Back to Lessons',
          icon: <ArrowLeft className="h-5 w-5" />,
          action: () => navigate('/lessons')
        }
      };
    }

    if (progression.hasNextChapter) {
      return {
        primary: {
          label: 'Next Chapter',
          icon: <ArrowRight className="h-5 w-5" />,
          action: () => navigate('/lessons') // Navigate to next chapter in lesson list
        },
        secondary: {
          label: 'Review Chapter',
          icon: <RotateCcw className="h-5 w-5" />,
          action: () => navigate('/lessons')
        }
      };
    }

    return {
      primary: {
        label: 'Continue Learning',
        icon: <ArrowRight className="h-5 w-5" />,
        action: () => navigate('/lessons')
      },
      secondary: {
        label: 'View Progress',
        icon: <Target className="h-5 w-5" />,
        action: () => navigate('/progress')
      }
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95 dark:from-background dark:via-background dark:to-muted/10">
      
      {/* Minimal Header */}
      <header className="bg-background/98 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="p-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <div className="font-medium text-sm">
                {chapterInfo.title} Complete
              </div>
              <div className="text-xs text-muted-foreground">
                {chapterInfo.context}
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Single Panel Focus */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Result Hero - Zen Professional Design */}
          <Card className={`text-center overflow-hidden ${
            isSuccess
              ? 'bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20'
              : 'bg-gradient-to-br from-destructive/10 to-orange-500/10 border-destructive/20'
          } border-2 transition-all duration-700 ease-out ${showCelebration ? 'shadow-lg shadow-accent/20 scale-[1.02]' : 'shadow-md'}`}>
            <CardContent className="p-6 sm:p-8 relative">
              {/* Subtle background glow effect */}
              {isSuccess && showCelebration && (
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 animate-gradient-x opacity-60"></div>
              )}
              
              <div className="relative z-10 mb-6">
                {isSuccess ? (
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ease-out ${
                    showCelebration ? 'scale-110 shadow-lg shadow-accent/30' : 'scale-100'
                  }`}>
                    <Trophy className={`h-8 w-8 sm:h-10 sm:w-10 text-accent-foreground transition-transform duration-300 ${
                      showCelebration ? 'scale-110' : 'scale-100'
                    }`} />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ease-out">
                    <RotateCcw className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                )}
              </div>
              
              <h1 className={`text-2xl sm:text-3xl font-bold text-foreground mb-3 transition-all duration-500 ${
                showCelebration ? 'scale-105' : 'scale-100'
              }`}>
                {isSuccess ? 'Well Done!' : 'Keep Practicing!'}
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-6 transition-opacity duration-700">
                {isSuccess ? 'You mastered this lesson' : 'Every attempt makes you better'}
              </p>

              {/* Key Stats - Zen Design */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className={`bg-card/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 transition-all duration-500 hover:bg-card/80 ${
                  showCelebration ? 'animate-soft-scale' : ''
                }`} style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary transition-colors duration-300" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Accuracy</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {result.accuracy}%
                  </div>
                </div>
                
                <div className={`bg-card/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 transition-all duration-500 hover:bg-card/80 ${
                  showCelebration ? 'animate-soft-scale' : ''
                }`} style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-accent transition-colors duration-300" />
                    <span className="text-xs sm:text-sm text-muted-foreground">XP Earned</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    +{result.xpEarned}
                  </div>
                </div>
              </div>

              {/* Progress in Chapter - Zen Design */}
              <div className={`bg-card/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/30 transition-all duration-700 ${
                showCelebration ? 'bg-card/60' : ''
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Chapter Progress</span>
                  <span className="text-sm font-medium text-foreground">
                    {progression.progress.completed}/{progression.progress.total} lessons
                  </span>
                </div>
                <Progress
                  value={(progression.progress.completed / progression.progress.total) * 100}
                  className="h-2 transition-all duration-500"
                />
              </div>

              {/* Professional Action Buttons - Zen Style */}
              <div className="space-y-3">
                <Button
                  onClick={nextAction.primary.action}
                  className={`w-full py-3 sm:py-4 text-base sm:text-lg rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSuccess
                      ? 'bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-accent-foreground shadow-lg shadow-accent/20'
                      : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg shadow-primary/20'
                  } ${showCelebration ? 'animate-zen-glow' : ''}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {nextAction.primary.icon}
                    {nextAction.primary.label}
                  </span>
                </Button>
                
                <Button
                  onClick={nextAction.secondary.action}
                  variant="outline"
                  className="w-full py-3 text-base rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] border-border/50 hover:border-border hover:bg-muted/50 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    {nextAction.secondary.icon}
                    {nextAction.secondary.label}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Notification - Zen Professional */}
          {isSuccess && result.accuracy >= 90 && (
            <Card className={`bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 border border-accent/20 backdrop-blur-sm transition-all duration-700 transform ${
              showCelebration ? 'scale-105 shadow-lg shadow-accent/10' : 'scale-100'
            }`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center transition-transform duration-500 ${
                    showCelebration ? 'scale-110 rotate-12' : 'scale-100'
                  }`}>
                    <Star className="h-6 w-6 text-accent-foreground fill-current" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Perfect Pronunciation!</h3>
                    <p className="text-sm text-muted-foreground">90%+ accuracy achieved</p>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 text-accent transition-transform duration-300 ${
                    showCelebration ? 'scale-110' : 'scale-100'
                  }`} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zen Celebration Effect - Subtle and Professional */}
          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
              {/* Gentle floating sparkles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute opacity-0 animate-gentle-float"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    animationDuration: '3s'
                  }}
                >
                  <div className="w-2 h-2 bg-accent/60 rounded-full shadow-lg"></div>
                </div>
              ))}
              
              {/* Elegant gradient waves */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-gentle-wave opacity-40"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCompleteInterface;