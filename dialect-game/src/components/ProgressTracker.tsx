/**
 * Adaptive Progress Tracking System
 * Comprehensive progress management with analytics and achievements
 * Phase 3 - Task 13 Implementation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Star, 
  Flame,
  Brain,
  Zap,
  Award,
  CheckCircle,
  BarChart3,
  Timer,
  BookOpen
} from 'lucide-react';
import type { Lesson } from './LessonSelector';

// Types for progress tracking
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'streak' | 'speed' | 'mastery' | 'exploration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface ProgressData {
  lessonsCompleted: number;
  totalLessons: number;
  streakDays: number;
  maxStreak: number;
  totalTimeSpent: number; // in minutes
  averageSessionTime: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  accuracy: number;
  favoriteCategory: string;
  weeklyGoal: number;
  monthlyGoal: number;
  achievements: Achievement[];
  weeklyProgress: number[];
  learningPath: string[];
  recommendedNext: Lesson[];
  lastActivityDate: Date;
}

interface LearningStats {
  totalSessions: number;
  averageAccuracy: number;
  fastestCompletion: number;
  longestStreak: number;
  categoriesExplored: number;
  difficultyDistribution: Record<string, number>;
}

// Mock achievements data
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'learning',
    rarity: 'common',
    progress: 1,
    maxProgress: 1,
    xpReward: 25,
    unlockedAt: new Date('2025-06-15')
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: <Flame className="h-5 w-5" />,
    category: 'streak',
    rarity: 'rare',
    progress: 3,
    maxProgress: 7,
    xpReward: 100
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a lesson in under 10 minutes',
    icon: <Zap className="h-5 w-5" />,
    category: 'speed',
    rarity: 'epic',
    progress: 0,
    maxProgress: 1,
    xpReward: 150
  },
  {
    id: 'category_master',
    title: 'Category Master',
    description: 'Complete all lessons in a category',
    icon: <Trophy className="h-5 w-5" />,
    category: 'mastery',
    rarity: 'legendary',
    progress: 1,
    maxProgress: 3,
    xpReward: 300
  }
];

// Mock progress data
const MOCK_PROGRESS: ProgressData = {
  lessonsCompleted: 5,
  totalLessons: 15,
  streakDays: 3,
  maxStreak: 7,
  totalTimeSpent: 120, // 2 hours
  averageSessionTime: 24,
  totalXP: 450,
  level: 2,
  xpToNextLevel: 150,
  accuracy: 87,
  favoriteCategory: 'basics',
  weeklyGoal: 5,
  monthlyGoal: 20,
  achievements: ACHIEVEMENTS,
  weeklyProgress: [1, 2, 1, 0, 1, 0, 0], // Last 7 days
  learningPath: ['basics-1', 'basics-2', 'basics-3'],
  recommendedNext: [],
  lastActivityDate: new Date()
};

interface ProgressTrackerProps {
  progressData?: ProgressData;
  onSetGoal?: (type: 'weekly' | 'monthly', value: number) => void;
  className?: string;
}

// Circular progress component
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(value / max, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Achievement card component
interface AchievementCardProps {
  achievement: Achievement;
  onCelebrate?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onCelebrate }) => {
  const isUnlocked = achievement.progress >= achievement.maxProgress;
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-200';
      case 'rare': return 'text-blue-500 border-blue-200';
      case 'epic': return 'text-purple-500 border-purple-200';
      case 'legendary': return 'text-yellow-500 border-yellow-200';
      default: return 'text-gray-500 border-gray-200';
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-md ${
        isUnlocked ? 'ring-2 ring-green-200' : 'opacity-75'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
              {achievement.icon}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{achievement.title}</CardTitle>
              <CardDescription className="text-xs">{achievement.description}</CardDescription>
            </div>
          </div>
          {isUnlocked && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{achievement.progress}/{achievement.maxProgress}</span>
          </div>
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {achievement.xpReward} XP
            </Badge>
            {isUnlocked && achievement.unlockedAt && (
              <span className="text-xs text-muted-foreground">
                {achievement.unlockedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progressData = MOCK_PROGRESS,
  onSetGoal,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate derived metrics
  const overallProgress = (progressData.lessonsCompleted / progressData.totalLessons) * 100;
  const levelProgress = ((progressData.totalXP % 500) / 500) * 100; // Assuming 500 XP per level
  const weeklyGoalProgress = (progressData.weeklyProgress.reduce((a, b) => a + b, 0) / progressData.weeklyGoal) * 100;

  // Learning statistics
  const learningStats: LearningStats = useMemo(() => ({
    totalSessions: progressData.weeklyProgress.filter(day => day > 0).length,
    averageAccuracy: progressData.accuracy,
    fastestCompletion: 12, // Mock data
    longestStreak: progressData.maxStreak,
    categoriesExplored: 3, // Mock data
    difficultyDistribution: {
      beginner: 60,
      intermediate: 30,
      advanced: 10
    }
  }), [progressData]);

  // Filter achievements by category
  const achievementsByCategory = useMemo(() => {
    const categories = ['learning', 'streak', 'speed', 'mastery', 'exploration'] as const;
    return categories.reduce((acc, category) => {
      acc[category] = progressData.achievements.filter(a => a.category === category);
      return acc;
    }, {} as Record<string, Achievement[]>);
  }, [progressData.achievements]);

  return (
    <div className={`progress-tracker ${className}`}>
      {/* Header with overall progress */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2">Your Learning Journey</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and celebrate your achievements
          </p>
        </div>

        {/* Key metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{progressData.totalXP.toLocaleString()}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {progressData.streakDays}
                    <Flame className="h-5 w-5 text-orange-500" />
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
                  <p className="text-2xl font-bold">{progressData.lessonsCompleted}/{progressData.totalLessons}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{progressData.accuracy}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <CircularProgress value={progressData.lessonsCompleted} max={progressData.totalLessons}>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </CircularProgress>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lessons completed</span>
                    <span>{progressData.lessonsCompleted}/{progressData.totalLessons}</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Level {progressData.level}
                </CardTitle>
                <CardDescription>
                  {progressData.xpToNextLevel} XP to level {progressData.level + 1}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <CircularProgress value={500 - progressData.xpToNextLevel} max={500}>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{progressData.level}</div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                  </CircularProgress>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>XP Progress</span>
                    <span>{500 - progressData.xpToNextLevel}/500</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your learning activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-32 gap-2">
                {progressData.weeklyProgress.map((lessons, index) => {
                  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const height = Math.max((lessons / Math.max(...progressData.weeklyProgress)) * 100, 5);
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t transition-all duration-300 ${
                          lessons > 0 ? 'bg-primary' : 'bg-muted'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-muted-foreground mt-2">{dayNames[index]}</div>
                      <div className="text-xs font-medium">{lessons}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {progressData.achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{learningStats.totalSessions}</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progressData.averageSessionTime}m</div>
                    <div className="text-sm text-muted-foreground">Avg. Session</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{learningStats.averageAccuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(progressData.totalTimeSpent / 60)}h</div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Difficulty Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(learningStats.difficultyDistribution).map(([difficulty, percentage]) => (
                  <div key={difficulty}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{difficulty}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Goal
                </CardTitle>
                <CardDescription>Complete {progressData.weeklyGoal} lessons this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CircularProgress 
                    value={progressData.weeklyProgress.reduce((a, b) => a + b, 0)} 
                    max={progressData.weeklyGoal}
                    size={100}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {progressData.weeklyProgress.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">of {progressData.weeklyGoal}</div>
                    </div>
                  </CircularProgress>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(weeklyGoalProgress)}%</span>
                    </div>
                    <Progress value={weeklyGoalProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Goal
                </CardTitle>
                <CardDescription>Complete {progressData.monthlyGoal} lessons this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CircularProgress 
                    value={progressData.lessonsCompleted} 
                    max={progressData.monthlyGoal}
                    size={100}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{progressData.lessonsCompleted}</div>
                      <div className="text-xs text-muted-foreground">of {progressData.monthlyGoal}</div>
                    </div>
                  </CircularProgress>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((progressData.lessonsCompleted / progressData.monthlyGoal) * 100)}%</span>
                    </div>
                    <Progress value={(progressData.lessonsCompleted / progressData.monthlyGoal) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracker;