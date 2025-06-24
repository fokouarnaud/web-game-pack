/**
 * ScoreDisplay component - Animated score and statistics display
 * Following TDD methodology - implementing to make tests pass (GREEN phase)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

export interface ScoreDisplayProps {
  score: number;
  highScore: number;
  level: number;
  accuracy: number;
  streak: number;
}

export const ScoreDisplay = React.memo<ScoreDisplayProps>(({
  score,
  highScore,
  level,
  accuracy,
  streak
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

  const getAccuracyClass = useCallback((value: number) => {
    if (value >= 90) return 'accuracy-excellent';
    if (value >= 75) return 'accuracy-good';
    return 'accuracy-poor';
  }, []);

  const getStreakClass = useCallback((value: number) => {
    if (value >= 10) return 'streak-hot';
    if (value >= 5) return 'streak-warm';
    return 'streak-normal';
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
    <div 
      className={`score-display ${isCompact ? 'compact-layout' : ''}`}
      data-testid="score-display"
      role="region"
      aria-label="Game statistics"
      tabIndex={0}
    >
      {/* Score */}
      <div className="stat-item score-item">
        <label className="stat-label">
          {isCompact ? 'Score' : 'Score'}
        </label>
        <div 
          className={`stat-value ${isAnimating ? 'score-animating' : ''}`}
          data-testid="score-value"
          aria-label={`Current score: ${formatScore(animatingScore)}`}
        >
          {formatScore(animatingScore)}
        </div>
      </div>

      {/* High Score */}
      <div className="stat-item high-score-item">
        <label className="stat-label">
          {isCompact ? 'Best' : 'Best'}
        </label>
        <div className="stat-value">
          {formatScore(highScore)}
        </div>
      </div>

      {/* Level */}
      <div className="stat-item level-item">
        <label className="stat-label">
          {isCompact ? 'Lvl' : 'Level'}
        </label>
        <div 
          className="stat-value"
          data-testid="level-display"
          aria-label={`Current level: ${level}`}
        >
          {level}
        </div>
        <div 
          className="progress-bar"
          data-testid="level-progress"
          role="progressbar"
          aria-valuenow={getLevelProgress(level, score)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div 
            className="progress-fill"
            style={{ width: `${getLevelProgress(level, score)}%` }}
          />
        </div>
      </div>

      {/* Accuracy */}
      <div className="stat-item accuracy-item">
        <label className="stat-label">
          {isCompact ? 'Acc' : 'Accuracy'}
        </label>
        <div 
          className={`stat-value ${getAccuracyClass(accuracy)}`}
          data-testid="accuracy-display"
        >
          {formatAccuracy(accuracy)}
        </div>
      </div>

      {/* Streak */}
      <div className="stat-item streak-item">
        <label className="stat-label">
          {isCompact ? 'Streak' : 'Streak'}
        </label>
        <div 
          className={`stat-value ${getStreakClass(streak)}`}
          data-testid="streak-display"
        >
          {streak}
          {streak >= 10 && <span className="streak-fire">🔥</span>}
        </div>
      </div>

      {/* Milestone Celebration */}
      {showMilestone && (
        <div 
          className="celebration milestone-celebration"
          data-testid="milestone-celebration"
          role="alert"
        >
          <div className="celebration-message">
            {getMilestoneMessage(score)}
          </div>
          <div className="celebration-score">
            Score: {formatScore(score)}
          </div>
        </div>
      )}

      {/* High Score Celebration */}
      {showHighScore && (
        <div 
          className="celebration high-score-celebration"
          data-testid="high-score-celebration"
          role="alert"
        >
          <div className="celebration-message">
            New High Score!
          </div>
          <div className="celebration-score">
            {formatScore(score)}
          </div>
        </div>
      )}

      {/* Streak Broken */}
      {showStreakBroken && (
        <div 
          className="notification streak-broken"
          data-testid="streak-broken"
        >
          Streak broken!
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