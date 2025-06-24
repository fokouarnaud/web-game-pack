/**
 * Smart Navigation with Skip-Ahead Warnings
 * Intelligent progression guidance system inspired by EdClub
 * Phase 3 - Task 12 Implementation
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  ChevronRight, 
  Target, 
  TrendingUp, 
  Lightbulb,
  Star,
  CheckCircle,
  ArrowRight,
  Brain
} from 'lucide-react';
import type { Lesson } from './LessonSelector';

interface NavigationGuardProps {
  targetLesson: Lesson;
  userProgress: UserProgress;
  onConfirm: () => void;
  onCancel: () => void;
  onRecommendedPath: (lessons: Lesson[]) => void;
  isOpen: boolean;
}

interface UserProgress {
  completedLessons: string[];
  currentLevel: number;
  streakDays: number;
  totalXP: number;
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface RecommendationEngine {
  recommendedLessons: Lesson[];
  skipReason: 'difficulty_jump' | 'missing_prerequisites' | 'optimal_path' | 'none';
  confidenceScore: number;
  motivationalMessage: string;
}

// Mock data for demonstration
const MOCK_USER_PROGRESS: UserProgress = {
  completedLessons: ['basics-1'],
  currentLevel: 1,
  streakDays: 3,
  totalXP: 150,
  preferredDifficulty: 'beginner'
};

const MOTIVATIONAL_MESSAGES = {
  difficulty_jump: {
    warning: "Whoa there, speed racer! 🚀",
    description: "This lesson is quite a bit more challenging than your current level. You might find it frustrating without the foundation from earlier lessons.",
    encouragement: "Building a strong foundation will make advanced concepts much easier to grasp!"
  },
  missing_prerequisites: {
    warning: "Hold up! Missing some building blocks 🧱",
    description: "This lesson builds on concepts from previous lessons you haven't completed yet. You might feel lost without that background knowledge.",
    encouragement: "Each lesson teaches skills you'll need for the next one. Trust the journey!"
  },
  optimal_path: {
    warning: "Not quite ready yet! 🎯",
    description: "Our learning algorithm suggests you'd benefit from completing a few more lessons first. This will ensure better retention and confidence.",
    encouragement: "The most successful learners follow the recommended path. You're doing great!"
  },
  none: {
    warning: "You're all set! ✅",
    description: "You've completed all prerequisites and this lesson matches your current skill level perfectly.",
    encouragement: "Great job staying on track with your learning goals!"
  }
};

// Breadcrumb navigation component
interface BreadcrumbProps {
  currentLesson: Lesson;
  allLessons: Lesson[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbProps> = ({
  currentLesson,
  allLessons,
  className = ''
}) => {
  const getPath = () => {
    const path = [{ id: 'home', title: 'Lessons', category: '' }];
    
    // Add category
    path.push({
      id: `category-${currentLesson.category}`,
      title: currentLesson.category.charAt(0).toUpperCase() + currentLesson.category.slice(1),
      category: currentLesson.category
    });
    
    // Add current lesson
    path.push({
      id: currentLesson.id,
      title: currentLesson.title,
      category: currentLesson.category
    });
    
    return path;
  };

  const pathItems = getPath();

  return (
    <nav className={`breadcrumb-navigation ${className}`} aria-label="Lesson breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {pathItems.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
            <span
              className={
                index === pathItems.length - 1
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground cursor-pointer transition-colors'
              }
              aria-current={index === pathItems.length - 1 ? 'page' : undefined}
            >
              {item.title}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Recommendation engine
const analyzeNavigation = (
  targetLesson: Lesson,
  userProgress: UserProgress,
  allLessons: Lesson[]
): RecommendationEngine => {
  // Check prerequisites
  const missingPrereqs = targetLesson.prerequisiteIds?.filter(
    prereqId => !userProgress.completedLessons.includes(prereqId)
  ) || [];

  if (missingPrereqs.length > 0) {
    const recommendedLessons = allLessons.filter(lesson =>
      missingPrereqs.includes(lesson.id)
    );
    
    return {
      recommendedLessons,
      skipReason: 'missing_prerequisites',
      confidenceScore: 0.9,
      motivationalMessage: MOTIVATIONAL_MESSAGES.missing_prerequisites.encouragement
    };
  }

  // Check difficulty jump
  const completedDifficulties = allLessons
    .filter(lesson => userProgress.completedLessons.includes(lesson.id))
    .map(lesson => lesson.difficulty);

  const hasIntermediateExp = completedDifficulties.includes('intermediate');
  const hasAdvancedExp = completedDifficulties.includes('advanced');

  if (targetLesson.difficulty === 'advanced' && !hasIntermediateExp) {
    const recommendedLessons = allLessons.filter(lesson =>
      lesson.difficulty === 'intermediate' && lesson.status !== 'locked'
    );
    
    return {
      recommendedLessons,
      skipReason: 'difficulty_jump',
      confidenceScore: 0.8,
      motivationalMessage: MOTIVATIONAL_MESSAGES.difficulty_jump.encouragement
    };
  }

  if (targetLesson.difficulty === 'intermediate' && completedDifficulties.length < 2) {
    const recommendedLessons = allLessons.filter(lesson =>
      lesson.difficulty === 'beginner' && lesson.status !== 'locked' && lesson.status !== 'completed'
    );
    
    return {
      recommendedLessons,
      skipReason: 'optimal_path',
      confidenceScore: 0.7,
      motivationalMessage: MOTIVATIONAL_MESSAGES.optimal_path.encouragement
    };
  }

  return {
    recommendedLessons: [],
    skipReason: 'none',
    confidenceScore: 1.0,
    motivationalMessage: MOTIVATIONAL_MESSAGES.none.encouragement
  };
};

export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  targetLesson,
  userProgress,
  onConfirm,
  onCancel,
  onRecommendedPath,
  isOpen
}) => {
  const [recommendation, setRecommendation] = useState<RecommendationEngine | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mock all lessons for analysis
      const allLessons: Lesson[] = [
        { id: 'basics-1', title: 'Greetings', description: '', difficulty: 'beginner', status: 'completed', category: 'basics', duration: 15, xpReward: 50 },
        { id: 'basics-2', title: 'Numbers', description: '', difficulty: 'beginner', status: 'current', category: 'basics', duration: 20, xpReward: 75 },
        { id: 'basics-3', title: 'Family', description: '', difficulty: 'beginner', status: 'available', category: 'basics', duration: 25, xpReward: 80 },
      ];
      
      const analysis = analyzeNavigation(targetLesson, userProgress, allLessons);
      setRecommendation(analysis);
    }
  }, [isOpen, targetLesson, userProgress]);

  if (!recommendation) return null;

  const shouldWarn = recommendation.skipReason !== 'none';
  const messageData = MOTIVATIONAL_MESSAGES[recommendation.skipReason];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {shouldWarn ? (
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            <div>
              <DialogTitle className="text-xl">
                {messageData.warning}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Jumping to: <strong>{targetLesson.title}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning message */}
          <Alert className={shouldWarn ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className="text-sm">
              {messageData.description}
            </AlertDescription>
          </Alert>

          {/* Lesson details */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{targetLesson.title}</h4>
              <Badge variant={targetLesson.difficulty === 'advanced' ? 'destructive' : 'secondary'}>
                {targetLesson.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{targetLesson.description}</p>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">{targetLesson.duration} min</Badge>
              <Badge variant="outline">{targetLesson.xpReward} XP</Badge>
            </div>
          </div>

          {/* Recommendations */}
          {recommendation.recommendedLessons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Recommended next steps:</span>
              </div>
              
              <div className="space-y-2">
                {recommendation.recommendedLessons.slice(0, 3).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => onRecommendedPath([lesson])}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.duration} min • {lesson.xpReward} XP</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Confidence Score
              </span>
              <span className="font-medium">{Math.round(recommendation.confidenceScore * 100)}%</span>
            </div>
            <Progress value={recommendation.confidenceScore * 100} className="h-2" />
          </div>

          {/* Motivational message */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{recommendation.motivationalMessage}</p>
            </div>
          </div>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} detailed analysis
          </button>

          {showDetails && (
            <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
              <div>Skip reason: {recommendation.skipReason.replace('_', ' ')}</div>
              <div>Completed lessons: {userProgress.completedLessons.length}</div>
              <div>Current streak: {userProgress.streakDays} days</div>
              <div>Total XP: {userProgress.totalXP}</div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {shouldWarn ? (
            <>
              <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Take Recommended Path
              </Button>
              <Button onClick={onConfirm} className="w-full sm:w-auto">
                Continue Anyway
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={onConfirm} className="w-full sm:w-auto">
                Start Lesson
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationGuard;