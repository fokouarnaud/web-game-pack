/**
 * Enhanced Lesson Selection Interface
 * Inspired by EdClub - Modern lesson selection with progress tracking
 * Phase 3 - Task 11 Implementation
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Lock, Search, Star, Trophy, Zap } from 'lucide-react';

// Types for lesson data
export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'completed' | 'current' | 'locked' | 'available';
  category: string;
  duration: number; // in minutes
  xpReward: number;
  prerequisiteIds?: string[];
  isRecommended?: boolean;
  isFavorite?: boolean;
}

interface LessonCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  totalLessons: number;
  completedLessons: number;
  color: string;
}

// Mock lesson data
const MOCK_LESSONS: Lesson[] = [
  {
    id: 'basics-1',
    title: 'Greetings & Introductions',
    description: 'Learn basic greetings in different dialects',
    difficulty: 'beginner',
    status: 'completed',
    category: 'basics',
    duration: 15,
    xpReward: 50,
    isRecommended: true
  },
  {
    id: 'basics-2',
    title: 'Numbers & Counting',
    description: 'Master numbers 1-100 in various dialects',
    difficulty: 'beginner',
    status: 'current',
    category: 'basics',
    duration: 20,
    xpReward: 75
  },
  {
    id: 'basics-3',
    title: 'Family & Relationships',
    description: 'Vocabulary for family members and relationships',
    difficulty: 'beginner',
    status: 'available',
    category: 'basics',
    duration: 25,
    xpReward: 80,
    prerequisiteIds: ['basics-2']
  },
  {
    id: 'conversation-1',
    title: 'Daily Conversations',
    description: 'Practice everyday conversations',
    difficulty: 'intermediate',
    status: 'locked',
    category: 'conversation',
    duration: 30,
    xpReward: 100,
    prerequisiteIds: ['basics-3']
  },
  {
    id: 'conversation-2',
    title: 'Shopping & Services',
    description: 'Learn phrases for shopping and using services',
    difficulty: 'intermediate',
    status: 'locked',
    category: 'conversation',
    duration: 35,
    xpReward: 120,
    prerequisiteIds: ['conversation-1']
  },
  {
    id: 'advanced-1',
    title: 'Business Communication',
    description: 'Professional communication in dialects',
    difficulty: 'advanced',
    status: 'locked',
    category: 'advanced',
    duration: 45,
    xpReward: 200,
    prerequisiteIds: ['conversation-2']
  }
];

const LESSON_CATEGORIES: LessonCategory[] = [
  {
    id: 'basics',
    name: 'Basics',
    description: 'Foundation vocabulary and phrases',
    icon: <Zap className="h-5 w-5" />,
    totalLessons: 3,
    completedLessons: 1,
    color: 'bg-green-500'
  },
  {
    id: 'conversation',
    name: 'Conversation',
    description: 'Interactive dialogue practice',
    icon: <Clock className="h-5 w-5" />,
    totalLessons: 2,
    completedLessons: 0,
    color: 'bg-blue-500'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Complex language structures',
    icon: <Trophy className="h-5 w-5" />,
    totalLessons: 1,
    completedLessons: 0,
    color: 'bg-purple-500'
  }
];

interface LessonSelectorProps {
  onLessonSelect: (lesson: Lesson) => void;
  className?: string;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  onLessonSelect,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Filter lessons based on search and filters
  const filteredLessons = useMemo(() => {
    return MOCK_LESSONS.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
      const matchesDifficulty = filterDifficulty === 'all' || lesson.difficulty === filterDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, filterDifficulty]);

  // Get status icon and color
  const getStatusDisplay = (status: Lesson['status']) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-500' };
      case 'current':
        return { icon: <Clock className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
      case 'locked':
        return { icon: <Lock className="h-4 w-4 text-gray-400" />, color: 'text-gray-400' };
      default:
        return { icon: null, color: 'text-gray-700' };
    }
  };

  // Get difficulty badge variant
  const getDifficultyVariant = (difficulty: Lesson['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'default';
      case 'intermediate': return 'secondary';
      case 'advanced': return 'destructive';
      default: return 'default';
    }
  };

  // Calculate category progress
  const getCategoryProgress = (categoryId: string) => {
    const category = LESSON_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return (category.completedLessons / category.totalLessons) * 100;
  };

  return (
    <div className={`lesson-selector ${className}`}>
      {/* Header with search and filters */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2">Choose Your Lesson</h1>
          <p className="text-muted-foreground text-lg">
            Select a lesson to continue your dialect learning journey
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Category overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {LESSON_CATEGORIES.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{category.completedLessons}/{category.totalLessons}</span>
                </div>
                <Progress value={getCategoryProgress(category.id)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lessons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const statusDisplay = getStatusDisplay(lesson.status);
          const isDisabled = lesson.status === 'locked';
          
          return (
            <Card
              key={lesson.id}
              className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
              } ${lesson.isRecommended ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => !isDisabled && onLessonSelect(lesson)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {statusDisplay.icon}
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {lesson.title}
                      </CardTitle>
                      {lesson.isRecommended && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {lesson.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={getDifficultyVariant(lesson.difficulty)}>
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {lesson.duration} min
                  </Badge>
                  <Badge variant="outline">
                    {lesson.xpReward} XP
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <Button
                  className="w-full"
                  disabled={isDisabled}
                  variant={lesson.status === 'current' ? 'default' : 'outline'}
                >
                  {lesson.status === 'completed' ? 'Review Lesson' :
                   lesson.status === 'current' ? 'Continue Lesson' :
                   lesson.status === 'locked' ? 'Locked' : 'Start Lesson'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results message */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No lessons found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setFilterDifficulty('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonSelector;