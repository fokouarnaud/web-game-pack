/**
 * GameDashboard - Main game component integrating all APIs and services
 * Expérience de jeu complète utilisant tous les services développés
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { QuizComponent } from './QuizComponent';
import { LanguageSelector } from './LanguageSelector';
import { ScoreDisplay } from '../ScoreDisplay.modern';
import { ImageGallery } from '../ui/image-gallery';
import { cn } from '@/lib/utils';
import { gameApiService } from '../../services/gameApiService';
import { assetsApi, type ImageAsset } from '../../services/api/assetsApi';
import { dictionaryApi } from '../../services/api/dictionaryApi';
import { translateApi } from '../../services/api/translateApi';

export interface GameDashboardProps {
  className?: string;
}

interface GameState {
  currentTab: 'setup' | 'quiz' | 'results' | 'gallery';
  sourceLanguage: string;
  targetLanguage: string;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedWords: string[];
  customWords: string;
  score: number;
  totalQuestions: number;
  streak: number;
  level: number;
  accuracy: number;
  highScore: number;
  isLoading: boolean;
  apiStatus: {
    dictionary: boolean;
    translation: boolean;
    assets: boolean;
  };
  themeImages: ImageAsset[];
  selectedTheme: string;
}

const DEFAULT_WORD_SETS = {
  easy: ['hello', 'house', 'water', 'food', 'happy', 'red', 'big', 'good'],
  medium: ['beautiful', 'important', 'language', 'culture', 'traditional', 'modern', 'wonderful', 'difficult'],
  hard: ['sophisticated', 'extraordinary', 'accomplishment', 'revolutionary', 'incomprehensible', 'philosophical', 'magnificent', 'transcendental']
};

const GAME_THEMES = [
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'city', name: 'City Life', icon: '🏙️' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'sport', name: 'Sports', icon: '⚽' }
];

export const GameDashboard = React.forwardRef<HTMLDivElement, GameDashboardProps>(({
  className,
  ...props
}, ref) => {
  const [gameState, setGameState] = useState<GameState>({
    currentTab: 'setup',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    difficulty: 'medium',
    selectedWords: DEFAULT_WORD_SETS.medium,
    customWords: '',
    score: 0,
    totalQuestions: 0,
    streak: 0,
    level: 1,
    accuracy: 0,
    highScore: parseInt(localStorage.getItem('dialectGameHighScore') || '0'),
    isLoading: false,
    apiStatus: {
      dictionary: false,
      translation: false,
      assets: false
    },
    themeImages: [],
    selectedTheme: 'education'
  });

  // Initialize and check API status
  useEffect(() => {
    checkApiStatus();
    loadThemeImages(gameState.selectedTheme);
  }, []);

  const checkApiStatus = async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      const [gameApiStatus, assetsStatus] = await Promise.all([
        gameApiService.testApiConnectivity(),
        assetsApi.testConnectivity()
      ]);

      setGameState(prev => ({
        ...prev,
        apiStatus: {
          dictionary: gameApiStatus.dictionary,
          translation: gameApiStatus.translation,
          assets: assetsStatus.overall
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to check API status:', error);
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        apiStatus: { dictionary: false, translation: false, assets: true } // Assets always work with fallbacks
      }));
    }
  };

  const loadThemeImages = async (theme: string) => {
    try {
      const images = await assetsApi.getGameThemeImages(theme, 12);
      setGameState(prev => ({ ...prev, themeImages: images }));
    } catch (error) {
      console.error('Failed to load theme images:', error);
    }
  };

  const handleLanguageSelect = (sourceLanguage: string, targetLanguage: string) => {
    setGameState(prev => ({
      ...prev,
      sourceLanguage,
      targetLanguage
    }));
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setGameState(prev => ({
      ...prev,
      difficulty,
      selectedWords: DEFAULT_WORD_SETS[difficulty]
    }));
  };

  const handleCustomWordsChange = (customWords: string) => {
    const words = customWords
      .split(/[,\n\s]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);

    setGameState(prev => ({
      ...prev,
      customWords,
      selectedWords: words.length > 0 ? words : DEFAULT_WORD_SETS[prev.difficulty]
    }));
  };

  const handleStartQuiz = () => {
    setGameState(prev => ({
      ...prev,
      currentTab: 'quiz',
      score: 0,
      totalQuestions: 0,
      streak: 0
    }));
  };

  const handleQuestionAnswer = (correct: boolean, points: number) => {
    setGameState(prev => {
      const newScore = prev.score + points;
      const newTotalQuestions = prev.totalQuestions + 1;
      const newStreak = correct ? prev.streak + 1 : 0;
      const newAccuracy = newTotalQuestions > 0 ? (newScore / (newTotalQuestions * 20)) * 100 : 0;

      return {
        ...prev,
        score: newScore,
        totalQuestions: newTotalQuestions,
        streak: newStreak,
        accuracy: Math.round(newAccuracy * 10) / 10
      };
    });
  };

  const handleQuizComplete = (finalScore: number, totalQuestions: number) => {
    const newHighScore = Math.max(finalScore, gameState.highScore);
    localStorage.setItem('dialectGameHighScore', newHighScore.toString());

    setGameState(prev => ({
      ...prev,
      currentTab: 'results',
      highScore: newHighScore,
      level: Math.floor(finalScore / 1000) + 1
    }));
  };

  const handleThemeChange = (theme: string) => {
    setGameState(prev => ({ ...prev, selectedTheme: theme }));
    loadThemeImages(theme);
  };

  const renderApiStatus = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge variant={gameState.apiStatus.dictionary ? 'default' : 'secondary'}>
        📚 Dictionary {gameState.apiStatus.dictionary ? '✓' : '✗'}
      </Badge>
      <Badge variant={gameState.apiStatus.translation ? 'default' : 'secondary'}>
        🌍 Translation {gameState.apiStatus.translation ? '✓' : '✗'}
      </Badge>
      <Badge variant={gameState.apiStatus.assets ? 'default' : 'secondary'}>
        🖼️ Images {gameState.apiStatus.assets ? '✓' : '✗'}
      </Badge>
    </div>
  );

  const renderSetupTab = () => (
    <div className="space-y-6">
      {renderApiStatus()}
      
      <LanguageSelector
        onLanguageSelect={handleLanguageSelect}
        selectedSource={gameState.sourceLanguage}
        selectedTarget={gameState.targetLanguage}
      />

      <Card>
        <CardHeader>
          <CardTitle>Difficulty & Words</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <Button
                key={diff}
                variant={gameState.difficulty === diff ? 'default' : 'outline'}
                onClick={() => handleDifficultyChange(diff)}
                className="capitalize"
              >
                {diff}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Words (optional)</label>
            <textarea
              className="w-full p-3 border rounded-md min-h-[100px] resize-y"
              placeholder="Enter custom words separated by commas or new lines..."
              value={gameState.customWords}
              onChange={(e) => handleCustomWordsChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Current words ({gameState.selectedWords.length}): {gameState.selectedWords.join(', ')}
            </p>
          </div>

          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="w-full"
            disabled={gameState.selectedWords.length === 0 || gameState.isLoading}
          >
            Start Quiz ({gameState.selectedWords.length} words)
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuizTab = () => (
    <div className="space-y-6">
      <ScoreDisplay
        score={gameState.score}
        highScore={gameState.highScore}
        level={gameState.level}
        accuracy={gameState.accuracy}
        streak={gameState.streak}
      />

      <QuizComponent
        words={gameState.selectedWords}
        sourceLanguage={gameState.sourceLanguage}
        targetLanguage={gameState.targetLanguage}
        difficulty={gameState.difficulty}
        onComplete={handleQuizComplete}
        onQuestionAnswer={handleQuestionAnswer}
      />
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">🎉 Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-primary">
            {gameState.score} points
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold">Questions</div>
              <div>{gameState.totalQuestions}</div>
            </div>
            <div>
              <div className="font-semibold">Accuracy</div>
              <div>{gameState.accuracy}%</div>
            </div>
            <div>
              <div className="font-semibold">Best Streak</div>
              <div>{gameState.streak}</div>
            </div>
            <div>
              <div className="font-semibold">Level</div>
              <div>{gameState.level}</div>
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-4">
            <Button onClick={() => setGameState(prev => ({ ...prev, currentTab: 'setup' }))}>
              New Game
            </Button>
            <Button variant="outline" onClick={() => setGameState(prev => ({ ...prev, currentTab: 'gallery' }))}>
              View Gallery
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScoreDisplay
        score={gameState.score}
        highScore={gameState.highScore}
        level={gameState.level}
        accuracy={gameState.accuracy}
        streak={gameState.streak}
      />
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {GAME_THEMES.map((theme) => (
              <Button
                key={theme.id}
                variant={gameState.selectedTheme === theme.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange(theme.id)}
                className="h-auto p-2"
              >
                <span className="mr-1">{theme.icon}</span>
                {theme.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageGallery
        images={gameState.themeImages}
        title={`${GAME_THEMES.find(t => t.id === gameState.selectedTheme)?.name || 'Theme'} Images`}
        columns={3}
        showAttribution
        showSource
        emptyMessage="No images found for this theme"
      />
    </div>
  );

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)} ref={ref} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🌍 Dialect Game Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={gameState.currentTab} onValueChange={(tab) => setGameState(prev => ({ ...prev, currentTab: tab as any }))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="quiz" disabled={gameState.selectedWords.length === 0}>Quiz</TabsTrigger>
              <TabsTrigger value="results" disabled={gameState.totalQuestions === 0}>Results</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="mt-6">
              {renderSetupTab()}
            </TabsContent>

            <TabsContent value="quiz" className="mt-6">
              {renderQuizTab()}
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              {renderResultsTab()}
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              {renderGalleryTab()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

GameDashboard.displayName = 'GameDashboard';