/**
 * Clean Lessons Page with User-Centered Design
 * Focus on lessons list with minimal distractions and responsive layout
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Lock,
  Star,
  BookOpen,
  List,
  ChevronUp,
  ChevronDown,
  X,
  Grid3X3,
  LayoutList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Lesson } from '../LessonSelector';
import NavigationGuard from '../NavigationGuard';
import { ThemeToggle } from '../theme/ThemeToggleSimple';


interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedLessons: number;
  totalLessons: number;
  estimatedTime: number;
  isUnlocked: boolean;
}

// Generate chapters
const generateChapters = (): Chapter[] => {
  const chapters: Chapter[] = [];
  
  for (let i = 0; i < 50; i++) {
    const chapterNumber = i + 1;
    const difficulty = i < 15 ? 'beginner' : i < 35 ? 'intermediate' : 'advanced';
    const lessonsCount = Math.floor(Math.random() * 8) + 4; // 4-11 lessons per chapter
    const completedLessons = i < 3 ? lessonsCount : i < 8 ? Math.floor(lessonsCount * 0.6) : 0;
    
    chapters.push({
      id: `chapter-${chapterNumber}`,
      number: chapterNumber,
      title: getChapterTitle(i, difficulty),
      description: getChapterDescription(i, difficulty),
      lessons: generateLessons(chapterNumber, lessonsCount, difficulty),
      difficulty,
      completedLessons,
      totalLessons: lessonsCount,
      estimatedTime: lessonsCount * 25, // 25 min per lesson
      isUnlocked: i < 5 || completedLessons > 0 // First 5 chapters + completed ones
    });
  }
  
  return chapters;
};

const getChapterTitle = (index: number, difficulty: string): string => {
  const titles = {
    beginner: [
      'Welcome to Dialects', 'Basic Greetings', 'Numbers & Counting', 'Family Terms',
      'Daily Routines', 'Food & Drinks', 'Colors & Objects', 'Weather Talk',
      'Time & Dates', 'Body Parts', 'Clothing', 'House & Home',
      'Transportation', 'Animals', 'Basic Emotions'
    ],
    intermediate: [
      'Market Conversations', 'Directions & Travel', 'Health & Medicine', 'Work & Jobs',
      'Hobbies & Sports', 'Past & Future Tense', 'Making Plans', 'Shopping',
      'Restaurant Dining', 'School & Education', 'Technology', 'Money & Banking',
      'Celebrations', 'Weather Patterns', 'Cultural Events', 'Social Media',
      'Music & Entertainment', 'Cooking', 'Fitness', 'Relationships'
    ],
    advanced: [
      'Business Communication', 'Academic Discussions', 'Technical Vocabulary', 'Literature',
      'Political Discourse', 'Scientific Terms', 'Philosophy', 'Economics',
      'Legal Language', 'Medical Terminology', 'Environmental Issues', 'Psychology',
      'Arts & Culture', 'History', 'Religion & Spirituality'
    ]
  };
  
  const categoryTitles = titles[difficulty as keyof typeof titles] || titles.beginner;
  return categoryTitles[index % categoryTitles.length];
};

const getChapterDescription = (index: number, difficulty: string): string => {
  const descriptions = {
    beginner: 'Master fundamental vocabulary and basic sentence structures',
    intermediate: 'Build practical conversation skills for real-world situations',
    advanced: 'Develop sophisticated language mastery and cultural understanding'
  };
  return descriptions[difficulty as keyof typeof descriptions];
};

const generateLessons = (chapterNum: number, count: number, difficulty: string): Lesson[] => {
  const lessons: Lesson[] = [];
  for (let i = 0; i < count; i++) {
    const lessonNumber = i + 1;
    lessons.push({
      id: `chapter-${chapterNum}-lesson-${lessonNumber}`,
      title: `Lesson ${lessonNumber}: ${getLessonTitle(i)}`,
      description: `Practice ${difficulty} level concepts with interactive exercises`,
      difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
      status: i === 0 && chapterNum <= 3 ? 'current' : 
              i < Math.floor(count * 0.4) && chapterNum <= 3 ? 'completed' : 'available',
      category: difficulty,
      duration: Math.floor(Math.random() * 15) + 15, // 15-30 minutes
      xpReward: Math.floor(Math.random() * 75) + 50, // 50-125 XP
      isRecommended: i === 0 && chapterNum <= 5
    });
  }
  return lessons;
};

const getLessonTitle = (index: number): string => {
  const titles = [
    'Introduction', 'Vocabulary', 'Pronunciation', 'Listening',
    'Grammar Basics', 'Conversation', 'Culture', 'Practice',
    'Review', 'Assessment', 'Application', 'Mastery'
  ];
  return titles[index % titles.length];
};

export const LessonsPageClean: React.FC = () => {
  const navigate = useNavigate();
  const [chapters] = useState<Chapter[]>(generateChapters());
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showNavigationGuard, setShowNavigationGuard] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showChapterInfo, setShowChapterInfo] = useState(true);

  const currentChapter = chapters[currentChapterIndex];
  const totalChapters = chapters.length;

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = Math.max(0, currentChapterIndex - 1);
      
      setTimeout(() => {
        setCurrentChapterIndex(newIndex);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = Math.min(totalChapters - 1, currentChapterIndex + 1);
      
      setTimeout(() => {
        setCurrentChapterIndex(newIndex);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleChapterSelect = (index: number) => {
    if (index !== currentChapterIndex && index >= 0 && index < totalChapters && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = Math.max(0, Math.min(totalChapters - 1, index));
      
      setTimeout(() => {
        setCurrentChapterIndex(newIndex);
        setIsTransitioning(false);
        setShowTableOfContents(false);
      }, 150);
    } else {
      setShowTableOfContents(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    if (lesson.status === 'locked') {
      setShowNavigationGuard(true);
    } else {
      navigate(`/game-lesson?lessonId=${lesson.id}&chapterNumber=${currentChapter.number}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'current': return <Play className="h-5 w-5 text-yellow-400" />;
      case 'locked': return <Lock className="h-5 w-5 text-gray-500" />;
      default: return <BookOpen className="h-5 w-5 text-blue-400" />;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showTableOfContents || isTransitioning) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          if (currentChapterIndex > 0) {
            handlePreviousChapter();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (currentChapterIndex < totalChapters - 1) {
            handleNextChapter();
          }
          break;
        case 'Escape':
          if (showTableOfContents) {
            setShowTableOfContents(false);
          } else {
            setShowChapterInfo(!showChapterInfo);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, showTableOfContents, isTransitioning, totalChapters]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95 dark:from-background dark:via-background dark:to-muted/10">
        
        {/* Mobile-Optimized Header */}
        <header className="bg-background/95 dark:bg-background/98 backdrop-blur-sm border-b border-border/30 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left - Back Navigation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Back</span>
            </Button>
            
            {/* Center - Chapter Control with Clear State */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChapterInfo(!showChapterInfo)}
                className="text-muted-foreground hover:text-foreground p-1 transition-all duration-200"
                title={showChapterInfo ? 'Hide chapter details' : 'Show chapter details'}
              >
                <span className="font-medium">Ch. {currentChapter.number}</span>
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${showChapterInfo ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Chapter Navigation */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousChapter}
                  disabled={currentChapterIndex === 0}
                  className="p-1 h-7 w-7"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === totalChapters - 1}
                  className="p-1 h-7 w-7"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Right - Controls */}
            <div className="flex items-center gap-1">
              {/* View Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 h-8 w-8"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ?
                  <LayoutList className="h-4 w-4" /> :
                  <Grid3X3 className="h-4 w-4" />
                }
              </Button>
              
              {/* Table of Contents - Mobile Only */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTableOfContents(true)}
                className="p-2 h-8 w-8 lg:hidden"
                title="Chapters"
              >
                <List className="h-4 w-4" />
              </Button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Chapter Info - Mobile Optimized */}
      {showChapterInfo && (
        <div className="bg-background/85 dark:bg-background/90 backdrop-blur-sm border-b border-border/30">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(currentChapter.difficulty)} flex-shrink-0`}></div>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground line-clamp-1 flex-1">{currentChapter.title}</h2>
                  <Badge className={`${getDifficultyColor(currentChapter.difficulty)} text-white text-xs flex-shrink-0`}>
                    {currentChapter.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">{currentChapter.description}</p>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-foreground">
                    {currentChapter.completedLessons}/{currentChapter.totalLessons} lessons
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentChapter.estimatedTime}min total
                  </div>
                </div>
                
                {/* Mini Progress Indicator */}
                <div className="w-16 sm:w-20 bg-muted rounded-full h-1.5">
                  <div
                    className="h-1.5 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentChapter.completedLessons / currentChapter.totalLessons) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Vertical Navigation - Optimized positioning */}
      <div className="hidden lg:block fixed left-4 z-30" style={{
        top: showChapterInfo ? 'calc(20% + 60px)' : 'calc(30% + 20px)'
      }}>
        <div className="flex flex-col items-center space-y-3">
          {/* Table of Contents Button - Directly above navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTableOfContents(true)}
            className="bg-card/90 border-border text-muted-foreground hover:bg-muted hover:text-foreground p-2 shadow-sm"
            title="All Chapters"
          >
            <List className="h-4 w-4" />
          </Button>

          {/* Previous Chapter Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousChapter}
            disabled={currentChapterIndex === 0}
            className="text-muted-foreground hover:text-foreground p-2 opacity-70 hover:opacity-100 transition-opacity"
            title={`Previous: ${currentChapterIndex > 0 ? chapters[currentChapterIndex - 1].title : 'None'}`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Vertical Progress Bar - Compact */}
          <div className="relative">
            <div className="w-1 h-48 bg-muted rounded-full">
              <div
                className="w-1 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ height: `${((currentChapterIndex + 1) / totalChapters) * 100}%` }}
              ></div>
            </div>
            
            {/* Current Position Indicator - More Visible */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-md transition-all duration-500"
              style={{ top: `${(currentChapterIndex / (totalChapters - 1)) * 180}px` }}
            >
              <div className="w-2 h-2 bg-primary-foreground rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          {/* Next Chapter Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextChapter}
            disabled={currentChapterIndex === totalChapters - 1}
            className="text-muted-foreground hover:text-foreground p-2 opacity-70 hover:opacity-100 transition-opacity"
            title={`Next: ${currentChapterIndex < totalChapters - 1 ? chapters[currentChapterIndex + 1].title : 'None'}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Chapter Counter - Prominent Current Page */}
          <div className="text-center mt-2">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
              {currentChapterIndex + 1}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 opacity-70">
              of {totalChapters}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-4 lg:pl-16 py-4 sm:py-6 pb-20">
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          
          {/* Lessons - Main Content Focus */}
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
              : "space-y-2 sm:space-y-3"
          }>
            {currentChapter.lessons.map((lesson, index) => {
              if (viewMode === 'list') {
                // List View - Compact horizontal layout
                return (
                  <Card
                    key={lesson.id}
                    className={`
                      group cursor-pointer transition-all duration-200 hover:bg-muted/30
                      bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50
                      ${lesson.isRecommended ? 'ring-1 ring-accent/30' : ''}
                      ${lesson.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    onClick={() => lesson.status !== 'locked' && handleLessonSelect(lesson)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        {/* Top/Left - Lesson Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(lesson.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-1">
                                {lesson.title}
                              </h3>
                              {lesson.isRecommended && (
                                <Star className="h-3 w-3 text-accent fill-current flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-0">
                              {lesson.description}
                            </p>
                            {/* Mobile: Show meta info below description */}
                            <div className="flex items-center gap-2 sm:hidden">
                              <Badge variant="outline" className="text-xs">
                                {lesson.duration}min
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {lesson.xpReward}XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Desktop: Meta Info */}
                        <div className="hidden sm:flex items-center gap-2 mx-4 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {lesson.duration}min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lesson.xpReward}XP
                          </Badge>
                        </div>
                        
                        {/* Bottom/Right - Action Button */}
                        <div className="flex justify-end sm:justify-start">
                          <Button
                            size="sm"
                            className={`w-full sm:w-auto text-xs sm:text-sm px-3 py-2 ${
                              lesson.status === 'current'
                                ? 'bg-primary hover:bg-primary/80'
                                : lesson.status === 'completed'
                                ? 'bg-accent hover:bg-accent/80'
                                : lesson.status === 'locked'
                                ? 'bg-muted cursor-not-allowed'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            disabled={lesson.status === 'locked'}
                          >
                            {lesson.status === 'completed' ? 'Review' :
                             lesson.status === 'current' ? 'Continue' :
                             lesson.status === 'locked' ? 'Locked' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else {
                // Grid View - Card layout optimized
                return (
                  <Card
                    key={lesson.id}
                    className={`
                      group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                      bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 hover:shadow-primary/10
                      ${lesson.isRecommended ? 'ring-1 ring-accent/30' : ''}
                      ${lesson.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    onClick={() => lesson.status !== 'locked' && handleLessonSelect(lesson)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(lesson.status)}
                          {lesson.isRecommended && (
                            <Star className="h-3 w-3 text-accent fill-current" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {lesson.duration}min
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Button
                        size="sm"
                        className={`w-full font-medium transition-all duration-300 ${
                          lesson.status === 'current'
                            ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                            : lesson.status === 'completed'
                            ? 'bg-accent hover:bg-accent/80 text-accent-foreground'
                            : lesson.status === 'locked'
                            ? 'bg-muted cursor-not-allowed text-muted-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                        }`}
                        disabled={lesson.status === 'locked'}
                      >
                        {lesson.status === 'completed' ? '🏆 Review' :
                         lesson.status === 'current' ? '⚡ Continue' :
                         lesson.status === 'locked' ? '🔒 Locked' : '🎮 Start'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation with normal transparency */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 md:hidden">
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousChapter}
              disabled={currentChapterIndex === 0}
              className="p-2 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium text-muted-foreground px-2">
              {currentChapterIndex + 1} / {totalChapters}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextChapter}
              disabled={currentChapterIndex === totalChapters - 1}
              className="p-2 h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table of Contents Overlay - Mobile Optimized */}
      {showTableOfContents && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-2 sm:p-4 overflow-hidden">
          <div className="bg-card rounded-lg border border-border w-full h-full max-w-4xl mx-auto flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Chapters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTableOfContents(false)}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {chapters.map((chapter, index) => (
                  <Card
                    key={chapter.id}
                    className={`
                      cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95
                      ${index === currentChapterIndex ? 'ring-2 ring-primary bg-primary/20' : 'bg-card'}
                      border-border hover:border-primary/50
                    `}
                    onClick={() => handleChapterSelect(index)}
                  >
                    <CardContent className="p-2 sm:p-3 md:p-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getDifficultyColor(chapter.difficulty)}`}></div>
                        <span className="text-foreground font-bold text-xs sm:text-sm md:text-base">Ch. {chapter.number}</span>
                        {index === currentChapterIndex && (
                          <Badge className="bg-primary text-primary-foreground text-xs">NOW</Badge>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1 line-clamp-2">{chapter.title}</h4>
                      <div className="text-xs text-muted-foreground mb-2">
                        {chapter.completedLessons}/{chapter.totalLessons} lessons
                      </div>
                      <Progress
                        value={(chapter.completedLessons / chapter.totalLessons) * 100}
                        className="h-1 mt-1"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Guard Dialog */}
      {showNavigationGuard && selectedLesson && (
        <NavigationGuard
          targetLesson={selectedLesson}
          userProgress={{
            completedLessons: ['chapter-1-lesson-1', 'chapter-1-lesson-2'],
            currentLevel: 3,
            streakDays: 7,
            totalXP: 850,
            preferredDifficulty: 'beginner'
          }}
          onConfirm={() => {
            setShowNavigationGuard(false);
            navigate(`/lesson/${selectedLesson.id}`);
          }}
          onCancel={() => {
            setShowNavigationGuard(false);
            setSelectedLesson(null);
          }}
          onRecommendedPath={() => {
            setShowNavigationGuard(false);
            setSelectedLesson(null);
          }}
          isOpen={showNavigationGuard}
        />
      )}
    </div>
  );
};

export default LessonsPageClean;
