/**
 * Individual Lesson Page with Phase 3 Navigation
 * Complete lesson experience using LessonNavigation component
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Mic, 
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Target,
  BookOpen,
  Headphones
} from 'lucide-react';
import LessonNavigation, { type LessonStep, type LessonNavigationState } from './LessonNavigation';
import type { Lesson } from './LessonSelector';

// Mock lesson data
const LESSON_DATA: Record<string, Lesson> = {
  'basics-2': {
    id: 'basics-2',
    title: 'Numbers & Counting',
    description: 'Master numbers 1-100 in various dialects',
    difficulty: 'beginner',
    status: 'current',
    category: 'basics',
    duration: 20,
    xpReward: 75
  },
  'conversation-1': {
    id: 'conversation-1',
    title: 'Daily Conversations',
    description: 'Practice everyday conversations',
    difficulty: 'intermediate',
    status: 'available',
    category: 'conversation',
    duration: 30,
    xpReward: 100
  }
};

const LESSON_STEPS: Record<string, LessonStep[]> = {
  'basics-2': [
    {
      id: 'intro',
      title: 'Introduction to Numbers',
      type: 'instruction',
      duration: 3,
      isCompleted: true
    },
    {
      id: 'numbers-1-10',
      title: 'Numbers 1-10',
      type: 'practice',
      duration: 5,
      isCompleted: true
    },
    {
      id: 'numbers-11-50',
      title: 'Numbers 11-50',
      type: 'practice',
      duration: 7,
      isCompleted: false
    },
    {
      id: 'numbers-51-100',
      title: 'Numbers 51-100',
      type: 'practice',
      duration: 5,
      isCompleted: false
    },
    {
      id: 'quiz',
      title: 'Numbers Quiz',
      type: 'quiz',
      duration: 3,
      isCompleted: false
    }
  ],
  'conversation-1': [
    {
      id: 'greetings',
      title: 'Common Greetings',
      type: 'instruction',
      duration: 5,
      isCompleted: false
    },
    {
      id: 'introductions',
      title: 'Introducing Yourself',
      type: 'practice',
      duration: 8,
      isCompleted: false
    },
    {
      id: 'small-talk',
      title: 'Small Talk Practice',
      type: 'practice',
      duration: 10,
      isCompleted: false
    },
    {
      id: 'dialogue-sim',
      title: 'Dialogue Simulation',
      type: 'practice',
      duration: 7,
      isCompleted: false
    },
    {
      id: 'final-quiz',
      title: 'Conversation Quiz',
      type: 'quiz',
      duration: 5,
      isCompleted: false
    }
  ]
};

interface LessonContent {
  type: 'instruction' | 'practice' | 'quiz';
  title: string;
  content: React.ReactNode;
}

export const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [navigationState, setNavigationState] = useState<LessonNavigationState>({
    currentStep: 0,
    totalSteps: 0,
    canGoBack: false,
    canGoForward: true,
    autoPlay: false,
    timeSpent: 0,
    accuracy: 85,
    stepsCompleted: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (lessonId && LESSON_DATA[lessonId]) {
      const lessonData = LESSON_DATA[lessonId];
      const lessonSteps = LESSON_STEPS[lessonId] || [];
      
      setLesson(lessonData);
      setSteps(lessonSteps);
      setNavigationState(prev => ({
        ...prev,
        totalSteps: lessonSteps.length,
        stepsCompleted: lessonSteps.filter(step => step.isCompleted).length,
        canGoBack: false,
        canGoForward: true
      }));
    } else {
      // Redirect to lessons page if lesson not found
      navigate('/lessons');
    }
  }, [lessonId, navigate]);

  useEffect(() => {
    // Timer for tracking time spent
    const timer = setInterval(() => {
      setNavigationState(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNavigation = (direction: 'previous' | 'next' | 'step', stepIndex?: number) => {
    setNavigationState(prev => {
      const newState = { ...prev };
      
      if (direction === 'previous' && prev.canGoBack) {
        newState.currentStep = Math.max(0, prev.currentStep - 1);
      } else if (direction === 'next' && prev.canGoForward) {
        newState.currentStep = Math.min(prev.totalSteps - 1, prev.currentStep + 1);
        // Mark previous step as completed
        if (prev.currentStep < steps.length) {
          const updatedSteps = [...steps];
          updatedSteps[prev.currentStep].isCompleted = true;
          setSteps(updatedSteps);
          newState.stepsCompleted = updatedSteps.filter(step => step.isCompleted).length;
        }
      } else if (direction === 'step' && stepIndex !== undefined) {
        newState.currentStep = stepIndex;
      }
      
      newState.canGoBack = newState.currentStep > 0;
      newState.canGoForward = newState.currentStep < newState.totalSteps - 1;
      
      return newState;
    });

    setShowFeedback(false);
    setUserAnswer('');
  };

  const handleExit = (saveProgress: boolean) => {
    if (saveProgress) {
      // Save progress logic here
      console.log('Progress saved');
    }
    navigate('/lessons');
  };

  const handleToggleAutoPlay = () => {
    setNavigationState(prev => ({
      ...prev,
      autoPlay: !prev.autoPlay
    }));
  };

  const handleRestart = () => {
    setNavigationState(prev => ({
      ...prev,
      currentStep: 0,
      timeSpent: 0,
      accuracy: 85,
      canGoBack: false,
      canGoForward: true
    }));
    setUserAnswer('');
    setShowFeedback(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
    // Simulate audio playing
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleAnswerSubmit = () => {
    // Simple validation logic
    const currentStep = steps[navigationState.currentStep];
    let correct = false;
    
    if (currentStep?.type === 'practice') {
      // Mock validation - in real app this would check against correct answers
      correct = userAnswer.toLowerCase().includes('hello') || userAnswer.toLowerCase().includes('number');
    } else if (currentStep?.type === 'quiz') {
      correct = userAnswer.toLowerCase() === 'correct answer';
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update accuracy
    setNavigationState(prev => ({
      ...prev,
      accuracy: correct ? Math.min(100, prev.accuracy + 2) : Math.max(0, prev.accuracy - 1)
    }));
  };

  const renderLessonContent = (): LessonContent | null => {
    if (!steps[navigationState.currentStep]) return null;
    
    const currentStep = steps[navigationState.currentStep];
    
    switch (currentStep.type) {
      case 'instruction':
        return {
          type: 'instruction',
          title: currentStep.title,
          content: (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentStep.title}
                  </CardTitle>
                  <CardDescription>
                    Learn the fundamentals before practicing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg">
                    In this section, you'll learn about numbers in different dialects. 
                    Pay attention to the pronunciation patterns and cultural context.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">English</h4>
                      <p>One, Two, Three, Four, Five</p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Local Dialect</h4>
                      <p>Wan, Tu, Tri, Fo, Faiv</p>
                    </Card>
                  </div>
                  
                  <Button onClick={handleAudioPlay} className="gap-2">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Playing...' : 'Listen to Pronunciation'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        };
        
      case 'practice':
        return {
          type: 'practice',
          title: currentStep.title,
          content: (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Practice Session
                  </CardTitle>
                  <CardDescription>
                    Practice saying the numbers and get immediate feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Say: "Hello, my name is..."</h3>
                    <p className="text-muted-foreground">
                      Practice this common greeting in the local dialect
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={handleAudioPlay} className="gap-2">
                      <Volume2 className="h-4 w-4" />
                      Listen
                    </Button>
                    <Button onClick={handleAudioPlay} className="gap-2">
                      <Headphones className="h-4 w-4" />
                      Repeat
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">
                      Type what you heard:
                    </label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter your answer..."
                    />
                    <Button 
                      onClick={handleAnswerSubmit} 
                      disabled={!userAnswer.trim()}
                      className="w-full"
                    >
                      Submit Answer
                    </Button>
                  </div>
                  
                  {showFeedback && (
                    <Card className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Excellent!' : 'Try Again'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">
                          {isCorrect 
                            ? 'Perfect pronunciation! You\'re making great progress.' 
                            : 'Keep practicing. Listen carefully to the pronunciation.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        };
        
      case 'quiz':
        return {
          type: 'quiz',
          title: currentStep.title,
          content: (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Knowledge Check
                  </CardTitle>
                  <CardDescription>
                    Test your understanding of what you've learned
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      Question: How do you say "Three" in the local dialect?
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {['Tri', 'Tree', 'Thee', 'Trai'].map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start text-left p-4"
                          onClick={() => setUserAnswer(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={handleAnswerSubmit}
                      disabled={!userAnswer}
                      className="w-full"
                    >
                      Submit Answer
                    </Button>
                  </div>
                  
                  {showFeedback && (
                    <Card className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">
                          {isCorrect 
                            ? 'Great job! You understood the lesson perfectly.' 
                            : 'The correct answer is "Tri". Review the lesson material.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        };
        
      default:
        return null;
    }
  };

  if (!lesson) {
    return <div>Loading...</div>;
  }

  const lessonContent = renderLessonContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{lesson.category}</Badge>
              <Badge variant="outline">{lesson.difficulty}</Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {lesson.duration} min
              </Badge>
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                {lesson.xpReward} XP
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{lesson.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lesson Progress</span>
                <span>{navigationState.currentStep + 1}/{navigationState.totalSteps}</span>
              </div>
              <Progress 
                value={((navigationState.currentStep + 1) / navigationState.totalSteps) * 100} 
                className="h-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {lessonContent && lessonContent.content}
        </div>
      </div>

      {/* Lesson Navigation */}
      <LessonNavigation
        lesson={lesson}
        steps={steps}
        navigationState={navigationState}
        onNavigate={handleNavigation}
        onExit={handleExit}
        onToggleAutoPlay={handleToggleAutoPlay}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default LessonPage;