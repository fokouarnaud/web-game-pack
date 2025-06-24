/**
 * ScoreDisplay moderne avec shadcn/ui
 * Task 2: Refonte UI moderne avec TailwindCSS - Phase TDD
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

export interface ScoreDisplayProps {
  score: number;
  highScore: number;
  level: number;
  accuracy: number;
  streak: number;
  className?: string;
}

export const ScoreDisplay = React.memo<ScoreDisplayProps>(({
  score,
  highScore,
  level,
  accuracy,
  streak,
  className
}) => {
  const [animatingScore, setAnimatingScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showHighScore, setShowHighScore] = useState(false);
  const [showStreakBroken, setShowStreakBroken] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(streak);
  const [isCompact, setIsCompact] = useState(false);

  // Memoized number formatter
  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-US');
  }, []);

  // Check for compact layout
  useEffect(() => {
    const checkLayout = () => {
      setIsCompact(window.innerWidth <= 600);
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  // Handle score animation
  useEffect(() => {
    if (score === animatingScore) return;
    
    // Don't animate if score decreases
    if (score < animatingScore) {
      setAnimatingScore(score);
      return;
    }

    setIsAnimating(true);
    const difference = score - animatingScore;
    const duration = Math.min(1000, Math.max(300, difference / 10));
    const steps = Math.min(50, Math.max(10, difference / 10));
    const increment = difference / steps;
    const stepDuration = duration / steps;

    let currentScore = animatingScore;
    let stepCount = 0;
    let timeoutId: number;

    const animateStep = () => {
      stepCount++;
      currentScore += increment;
      
      if (stepCount >= steps) {
        setAnimatingScore(score);
        setIsAnimating(false);
      } else {
        setAnimatingScore(Math.floor(currentScore));
        timeoutId = window.setTimeout(animateStep, stepDuration);
      }
    };

    timeoutId = window.setTimeout(animateStep, 16);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [score, animatingScore]);

  // Handle milestone celebrations
  useEffect(() => {
    const milestones = [1000, 5000, 10000, 25000, 50000];
    const previousScore = animatingScore;
    
    for (const milestone of milestones) {
      if (previousScore < milestone && score >= milestone) {
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 3000);
        break;
      }
    }
  }, [score, animatingScore]);

  // Handle high score celebration
  useEffect(() => {
    if (score > highScore && score > 0) {
      setShowHighScore(true);
      setTimeout(() => setShowHighScore(false), 3000);
    }
  }, [score, highScore]);

  // Handle streak broken
  useEffect(() => {
    if (previousStreak > 0 && streak === 0) {
      setShowStreakBroken(true);
      setTimeout(() => setShowStreakBroken(false), 2000);
    }
    setPreviousStreak(streak);
  }, [streak, previousStreak]);

  const formatScore = useCallback((value: number) => {
    const safeValue = isNaN(value) || value < 0 ? 0 : value;
    if (safeValue > Number.MAX_SAFE_INTEGER) {
      return '999,999,999+';
    }
    return numberFormatter.format(safeValue);
  }, [numberFormatter]);

  const formatAccuracy = useCallback((value: number) => {
    const safeValue = isNaN(value) || value < 0 ? 0 : Math.min(100, value);
    return `${safeValue.toFixed(1)}%`;
  }, []);

  const getAccuracyBadgeVariant = useCallback((value: number) => {
    if (value >= 90) return 'default'; // Success green
    if (value >= 75) return 'secondary'; // Warning yellow
    return 'destructive'; // Error red
  }, []);

  const getStreakBadgeVariant = useCallback((value: number) => {
    if (value >= 10) return 'default'; // Hot streak
    if (value >= 5) return 'secondary'; // Warm streak
    return 'outline'; // Normal
  }, []);

  const getLevelProgress = useCallback((currentLevel: number, currentScore: number) => {
    const baseScore = (currentLevel - 1) * 1000;
    const nextLevelScore = currentLevel * 1000;
    const progress = ((currentScore - baseScore) / (nextLevelScore - baseScore)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, []);

  const getMilestoneMessage = useCallback((score: number) => {
    if (score >= 50000) return 'Legendary!';
    if (score >= 25000) return 'Incredible!';
    if (score >= 10000) return 'Outstanding!';
    if (score >= 5000) return 'Amazing!';
    if (score >= 1000) return 'Milestone reached!';
    return 'Great job!';
  }, []);

  return (
    <div className={cn("space-y-4", className)} data-testid="score-display">
      {/* Main Statistics Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
          <CardTitle className="flex items-center justify-between">
            <span>Statistics</span>
            {score > highScore && (
              <Badge variant="default" className="bg-yellow-500 text-black animate-pulse">
                High Score!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Score and High Score Row */}
          <div className={cn("grid gap-4", isCompact ? "grid-cols-2" : "grid-cols-4")}>
            {/* Current Score */}
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground">Score</div>
              <div 
                className={cn(
                  "text-2xl font-bold transition-all duration-300",
                  isAnimating && "scale-110 text-primary animate-pulse"
                )}
                data-testid="score-value"
                aria-label={`Current score: ${formatScore(animatingScore)}`}
              >
                {formatScore(animatingScore)}
              </div>
            </div>

            {/* High Score */}
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground">Best</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatScore(highScore)}
              </div>
            </div>

            {/* Level */}
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground">Level</div>
              <div 
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                data-testid="level-display"
                aria-label={`Current level: ${level}`}
              >
                {level}
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <Badge 
                variant={getAccuracyBadgeVariant(accuracy)}
                className="text-sm font-bold"
                data-testid="accuracy-display"
              >
                {formatAccuracy(accuracy)}
              </Badge>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Level Progress</span>
              <span>{Math.round(getLevelProgress(level, score))}%</span>
            </div>
            <Progress 
              value={getLevelProgress(level, score)}
              className="h-2"
              data-testid="level-progress"
            />
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Streak</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getStreakBadgeVariant(streak)}
                className="text-sm font-bold"
                data-testid="streak-display"
              >
                {streak}
              </Badge>
              {streak >= 10 && (
                <span className="text-orange-500 animate-bounce">🔥</span>
              )}
              {streak >= 20 && (
                <span className="text-red-500 animate-bounce">⚡</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Celebration */}
      {showMilestone && (
        <Card 
          className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 animate-in slide-in-from-top duration-500"
          data-testid="milestone-celebration"
        >
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
              🎉 {getMilestoneMessage(score)}
            </div>
            <div className="text-lg text-yellow-600 dark:text-yellow-400">
              Score: {formatScore(score)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Score Celebration */}
      {showHighScore && (
        <Card 
          className="border-green-500 bg-green-50 dark:bg-green-900/20 animate-in slide-in-from-top duration-500"
          data-testid="high-score-celebration"
        >
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              🏆 New High Score!
            </div>
            <div className="text-lg text-green-600 dark:text-green-400">
              {formatScore(score)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak Broken Notification */}
      {showStreakBroken && (
        <div 
          className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20 p-4 text-center animate-in slide-in-from-right duration-300"
          data-testid="streak-broken"
        >
          <div className="text-red-700 dark:text-red-300 font-semibold">
            💔 Streak broken!
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isAnimating && `Score increased to ${formatScore(score)}`}
      </div>

      <div role="alert" aria-live="assertive" className="sr-only">
        {showMilestone && `Milestone reached! Score: ${formatScore(score)}`}
        {showHighScore && `New high score achieved: ${formatScore(score)}`}
      </div>
    </div>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';