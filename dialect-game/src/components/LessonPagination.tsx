/**
 * Advanced Lesson Pagination System
 * Inspired by course platforms with unlimited level support
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BookOpen,
  Lock,
  CheckCircle,
  Play,
  Star,
  Grid3X3,
  List,
  MoreHorizontal
} from 'lucide-react';
import type { Lesson } from './LessonSelector';

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isExpanded: boolean;
  completedLessons: number;
  totalLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in hours
}

interface LessonPaginationProps {
  lessons: Lesson[];
  onLessonSelect: (lesson: Lesson) => void;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// Generate mock chapters with unlimited levels
const generateChapters = (totalLevels: number = 50): Chapter[] => {
  const chapters: Chapter[] = [];
  const chaptersPerDifficulty = Math.ceil(totalLevels / 3);
  
  for (let i = 0; i < totalLevels; i++) {
    const chapterNumber = i + 1;
    const difficulty = i < chaptersPerDifficulty ? 'beginner' : 
                     i < chaptersPerDifficulty * 2 ? 'intermediate' : 'advanced';
    
    const lessonsInChapter = Math.floor(Math.random() * 8) + 3; // 3-10 lessons per chapter
    const completedLessons = Math.floor(Math.random() * lessonsInChapter);
    
    chapters.push({
      id: `chapter-${chapterNumber}`,
      title: `Chapter ${chapterNumber}: ${getChapterTitle(i, difficulty)}`,
      description: getChapterDescription(i, difficulty),
      lessons: generateLessonsForChapter(chapterNumber, lessonsInChapter, difficulty),
      isExpanded: i < 3, // First 3 chapters expanded by default
      completedLessons,
      totalLessons: lessonsInChapter,
      difficulty,
      estimatedTime: lessonsInChapter * 0.5 // 30min per lesson average
    });
  }
  
  return chapters;
};

const getChapterTitle = (index: number, difficulty: string): string => {
  const beginnerTitles = [
    'Welcome to Dialects', 'Basic Greetings', 'Numbers & Time', 'Family & Friends',
    'Daily Routines', 'Food & Drinks', 'Colors & Objects', 'Weather & Seasons'
  ];
  const intermediateTitles = [
    'Market Conversations', 'Directions & Travel', 'Health & Body', 'Work & Jobs',
    'Hobbies & Interests', 'Past & Future', 'Emotions & Feelings', 'Culture & Traditions'
  ];
  const advancedTitles = [
    'Business Communication', 'Academic Discussions', 'Technical Vocabulary', 'Literature & Poetry',
    'Political Discourse', 'Scientific Terms', 'Philosophy & Ideas', 'Regional Variations'
  ];
  
  if (difficulty === 'beginner') return beginnerTitles[index % beginnerTitles.length];
  if (difficulty === 'intermediate') return intermediateTitles[index % intermediateTitles.length];
  return advancedTitles[index % advancedTitles.length];
};

const getChapterDescription = (index: number, difficulty: 'beginner' | 'intermediate' | 'advanced'): string => {
  const descriptions = {
    beginner: 'Master the fundamentals with interactive exercises',
    intermediate: 'Build practical conversation skills',
    advanced: 'Develop sophisticated language mastery'
  };
  return descriptions[difficulty];
};

const generateLessonsForChapter = (chapter: number, count: number, difficulty: 'beginner' | 'intermediate' | 'advanced'): Lesson[] => {
  const lessons: Lesson[] = [];
  for (let i = 0; i < count; i++) {
    const lessonNumber = i + 1;
    lessons.push({
      id: `chapter-${chapter}-lesson-${lessonNumber}`,
      title: `Lesson ${lessonNumber}: ${getLessonTitle(i, difficulty)}`,
      description: getLessonDescription(i, difficulty),
      difficulty,
      status: i === 0 ? 'current' : i < Math.floor(count * 0.3) ? 'completed' : 'available',
      category: difficulty,
      duration: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
      xpReward: Math.floor(Math.random() * 100) + 50, // 50-150 XP
      isRecommended: i === 0 && chapter <= 3
    });
  }
  return lessons;
};

const getLessonTitle = (index: number, difficulty: string): string => {
  const titles = [
    'Introduction', 'Vocabulary Building', 'Pronunciation Practice', 'Listening Exercise',
    'Grammar Basics', 'Conversation Practice', 'Cultural Context', 'Review & Assessment'
  ];
  return titles[index % titles.length];
};

const getLessonDescription = (index: number, difficulty: string): string => {
  return `Practice ${difficulty} level concepts with interactive exercises`;
};

export const LessonPagination: React.FC<LessonPaginationProps> = ({
  lessons = [],
  onLessonSelect,
  itemsPerPage = 6,
  currentPage = 1,
  onPageChange
}) => {
  const [chapters, setChapters] = useState<Chapter[]>(generateChapters(50));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentChapterPage, setCurrentChapterPage] = useState(1);
  const chaptersPerPage = 5;

  // Filter chapters based on search and difficulty
  const filteredChapters = useMemo(() => {
    return chapters.filter(chapter => {
      const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chapter.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || chapter.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [chapters, searchTerm, selectedDifficulty]);

  // Paginate chapters
  const paginatedChapters = useMemo(() => {
    const startIndex = (currentChapterPage - 1) * chaptersPerPage;
    return filteredChapters.slice(startIndex, startIndex + chaptersPerPage);
  }, [filteredChapters, currentChapterPage, chaptersPerPage]);

  const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, isExpanded: !chapter.isExpanded }
        : chapter
    ));
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
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'current': return <Play className="h-4 w-4 text-yellow-500" />;
      default: return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="lesson-pagination space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Course Content</h2>
          <Badge variant="outline" className="text-gray-300">
            {filteredChapters.length} Chapters
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="space-y-4">
        {paginatedChapters.map((chapter) => (
          <Card key={chapter.id} className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(chapter.difficulty)}`}></div>
                  <div>
                    <CardTitle className="text-lg text-white">{chapter.title}</CardTitle>
                    <CardDescription className="text-gray-400">{chapter.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {chapter.completedLessons}/{chapter.totalLessons} lessons
                    </div>
                    <div className="text-xs text-gray-500">
                      ~{chapter.estimatedTime}h
                    </div>
                  </div>
                  
                  <Progress 
                    value={(chapter.completedLessons / chapter.totalLessons) * 100} 
                    className="w-20 h-2" 
                  />
                  
                  {chapter.isExpanded ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>
            </CardHeader>

            {chapter.isExpanded && (
              <CardContent className="pt-0">
                <div className={`grid gap-3 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {chapter.lessons.map((lesson) => (
                    <Card 
                      key={lesson.id}
                      className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gray-800 border-gray-600 hover:border-purple-500/50"
                      onClick={() => onLessonSelect(lesson)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(lesson.status)}
                          <h4 className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors">
                            {lesson.title}
                          </h4>
                          {lesson.isRecommended && (
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-3">{lesson.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs text-gray-300">
                              {lesson.duration}min
                            </Badge>
                            <Badge variant="outline" className="text-xs text-gray-300">
                              {lesson.xpReward}XP
                            </Badge>
                          </div>
                          
                          <Button size="sm" variant="ghost" className="text-xs">
                            {lesson.status === 'completed' ? 'Review' : 
                             lesson.status === 'current' ? 'Continue' : 'Start'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-6">
          <Button
            variant="outline"
            onClick={() => setCurrentChapterPage(prev => Math.max(1, prev - 1))}
            disabled={currentChapterPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* Page Numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentChapterPage <= 3) {
                pageNumber = i + 1;
              } else if (currentChapterPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentChapterPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentChapterPage === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentChapterPage(pageNumber)}
                  className="w-10 h-10"
                >
                  {pageNumber}
                </Button>
              );
            })}

            {totalPages > 5 && currentChapterPage < totalPages - 2 && (
              <>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentChapterPage(totalPages)}
                  className="w-10 h-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentChapterPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentChapterPage === totalPages}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="text-center text-sm text-gray-400">
        Showing {paginatedChapters.length} of {filteredChapters.length} chapters 
        ({filteredChapters.reduce((acc, ch) => acc + ch.totalLessons, 0)} total lessons)
      </div>
    </div>
  );
};

export default LessonPagination;