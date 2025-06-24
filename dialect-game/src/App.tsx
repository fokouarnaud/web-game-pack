/**
 * Main App component for Dialect Learning Game
 * Task 10: Final integration with optimizations and error handling
 */

import React, { useState, useCallback, useEffect, useReducer, Suspense } from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { ThemeToggle } from './components/theme/ThemeToggleSimple';
import { GameCanvas } from './components/GameCanvas';
import { ScoreDisplay } from './components/ScoreDisplay';
import { VoiceInput } from './components/VoiceInput';
import type { GameState, GameEvent, SpeechResult, VoiceError, VoiceRecognitionState } from './types';

// Game state reducer for better state management
interface GameStateType {
  gameState: GameState;
  score: number;
  highScore: number;
  level: number;
  accuracy: number;
  streak: number;
  totalAttempts: number;
  correctAttempts: number;
  isLoading: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'BACK_TO_MENU' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'VOICE_RESULT'; payload: { correct: boolean; confidence: number } }
  | { type: 'RESET_STREAK' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialGameState: GameStateType = {
  gameState: 'menu',
  score: 0,
  highScore: parseInt(localStorage.getItem('dialectGame_highScore') || '0'),
  level: 1,
  accuracy: 0,
  streak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  isLoading: false,
  error: null,
};

function gameStateReducer(state: GameStateType, action: GameAction): GameStateType {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameState: 'playing',
        score: 0,
        level: 1,
        accuracy: 0,
        streak: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        error: null,
      };
    
    case 'END_GAME': {
      const newHighScore = Math.max(state.score, state.highScore);
      if (newHighScore > state.highScore) {
        localStorage.setItem('dialectGame_highScore', newHighScore.toString());
      }
      return {
        ...state,
        gameState: 'game_over',
        highScore: newHighScore,
      };
    }
    
    case 'PAUSE_GAME':
      return { ...state, gameState: 'paused' };
    
    case 'RESUME_GAME':
      return { ...state, gameState: 'playing' };
    
    case 'BACK_TO_MENU':
      return {
        ...state,
        gameState: 'menu',
        error: null,
      };
    
    case 'UPDATE_SCORE': {
      const newScore = state.score + action.payload;
      const newLevel = Math.floor(newScore / 1000) + 1;
      return {
        ...state,
        score: newScore,
        level: newLevel,
      };
    }
    
    case 'VOICE_RESULT': {
      const { correct } = action.payload;
      const newTotalAttempts = state.totalAttempts + 1;
      const newCorrectAttempts = state.correctAttempts + (correct ? 1 : 0);
      const newAccuracy = (newCorrectAttempts / newTotalAttempts) * 100;
      const newStreak = correct ? state.streak + 1 : 0;
      
      return {
        ...state,
        totalAttempts: newTotalAttempts,
        correctAttempts: newCorrectAttempts,
        accuracy: newAccuracy,
        streak: newStreak,
      };
    }
    
    case 'RESET_STREAK':
      return { ...state, streak: 0 };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" data-testid="error-boundary">
          <h2>Something went wrong!</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner" data-testid="loading-spinner">
    <div className="spinner-icon">⏳</div>
    <p>Loading game...</p>
  </div>
);

// Performance monitoring hook
function usePerformanceMonitor() {
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
        
        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024));
        }
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return { fps, memoryUsage };
}

export function App() {
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);
  const { fps, memoryUsage } = usePerformanceMonitor();
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dialectGame_highScore');
    if (savedHighScore) {
      const score = parseInt(savedHighScore, 10);
      if (score > state.highScore) {
        dispatch({ type: 'UPDATE_SCORE', payload: score - state.score });
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'D':
            event.preventDefault();
            setDebugMode(prev => !prev);
            break;
          case 'R':
            event.preventDefault();
            if (state.gameState === 'playing') {
              dispatch({ type: 'END_GAME' });
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.gameState]);

  const handleStartGame = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate loading time for better UX
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'START_GAME' });
    }, 500);
  }, []);

  const handleGameEvent = useCallback((event: GameEvent) => {
    console.log('Game event:', event);
    
    switch (event.type) {
      case 'score_update':
        dispatch({ type: 'UPDATE_SCORE', payload: event.data?.points || 100 });
        break;
      case 'game_end':
        dispatch({ type: 'END_GAME' });
        break;
      case 'state_change':
        if (event.data?.newState === 'paused') {
          dispatch({ type: 'PAUSE_GAME' });
        } else if (event.data?.newState === 'playing') {
          dispatch({ type: 'RESUME_GAME' });
        }
        break;
    }
  }, []);

  const handleVoiceResult = useCallback((result: SpeechResult) => {
    console.log('Voice result:', result);
    
    if (result.isFinal && result.transcript.trim()) {
      // Simulate word recognition logic
      const isCorrect = result.confidence > 0.7; // Simple confidence threshold
      const points = isCorrect ? Math.round(result.confidence * 100) : 0;
      
      dispatch({ type: 'VOICE_RESULT', payload: { correct: isCorrect, confidence: result.confidence } });
      
      if (isCorrect) {
        dispatch({ type: 'UPDATE_SCORE', payload: points });
      } else {
        dispatch({ type: 'RESET_STREAK' });
      }
    }
  }, []);

  const handleVoiceError = useCallback((error: VoiceError) => {
    console.error('Voice error:', error);
    dispatch({ type: 'SET_ERROR', payload: `Voice recognition error: ${error.message}` });
  }, []);

  const handleVoiceStateChange = useCallback((voiceState: VoiceRecognitionState) => {
    console.log('Voice state:', voiceState);
    // Could add visual feedback based on voice state
  }, []);

  const handleGameOver = useCallback(() => {
    dispatch({ type: 'END_GAME' });
  }, []);

  const handleBackToMenu = useCallback(() => {
    dispatch({ type: 'BACK_TO_MENU' });
  }, []);

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleErrorBoundary = useCallback((error: Error) => {
    dispatch({ type: 'SET_ERROR', payload: `Application error: ${error.message}` });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary onError={handleErrorBoundary}>
        <div data-testid="app-container" className="game-layout min-h-screen">
          <header className="app-header p-4 flex justify-between items-center glass-container mx-4 mt-4 rounded-xl">
            <h1 className="text-gradient text-3xl font-display font-bold">Dialect Learning Game</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {debugMode && (
                <div className="debug-info badge badge-primary" data-testid="debug-info">
                  <span>FPS: {fps}</span>
                  {memoryUsage > 0 && <span>Memory: {memoryUsage}MB</span>}
                </div>
              )}
            </div>
          </header>
        
        {state.error && (
          <div className="error-banner" data-testid="error-banner" role="alert">
            <p>{state.error}</p>
            <button onClick={clearError} className="close-error">×</button>
          </div>
        )}

        {state.isLoading ? (
          <Suspense fallback={<LoadingSpinner />}>
            <LoadingSpinner />
          </Suspense>
        ) : (
          <>
            {state.gameState === 'menu' && (
              <div data-testid="game-menu" className="game-menu">
                <h2>Welcome to Dialect Learning Game</h2>
                <p>Learn different dialects through voice recognition!</p>
                <button 
                  data-testid="start-game-button"
                  onClick={handleStartGame}
                  className="start-button"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? 'Loading...' : 'Start Game'}
                </button>
                
                {state.highScore > 0 && (
                  <div className="high-score-display">
                    <p>Best Score: {state.highScore.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {(state.gameState === 'playing' || state.gameState === 'paused') && (
              <div className="game-view">
                <div className="game-header">
                  <ScoreDisplay
                    score={state.score}
                    highScore={state.highScore}
                    level={state.level}
                    accuracy={state.accuracy}
                    streak={state.streak}
                  />
                  <div className="game-controls">
                    <button 
                      data-testid="menu-button"
                      onClick={handleBackToMenu}
                      className="menu-button"
                    >
                      Menu
                    </button>
                    <button 
                      data-testid="game-over-button"
                      onClick={handleGameOver}
                      className="game-over-button"
                    >
                      End Game
                    </button>
                  </div>
                </div>

                <div className="game-content">
                  <GameCanvas
                    width={800}
                    height={600}
                    gameState={state.gameState}
                    onGameEvent={handleGameEvent}
                  />
                  
                  <div className="game-controls">
                    <VoiceInput
                      onResult={handleVoiceResult}
                      onError={handleVoiceError}
                      onStateChange={handleVoiceStateChange}
                      language="en-US"
                      placeholder="Say the word you hear..."
                      showConfidence={true}
                      showTranscript={debugMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {state.gameState === 'game_over' && (
              <div data-testid="game-over-screen" className="game-over">
                <h2>Game Over</h2>
                <div data-testid="final-score" className="final-score">
                  <p>Final Score: {state.score.toLocaleString()}</p>
                  <p>Level Reached: {state.level}</p>
                  <p>Accuracy: {state.accuracy.toFixed(1)}%</p>
                  <p>Best Streak: {state.streak}</p>
                  {state.score === state.highScore && state.score > 0 && (
                    <p className="new-high-score">🎉 New High Score! 🎉</p>
                  )}
                </div>
                <div className="game-over-actions">
                  <button 
                    data-testid="restart-button"
                    onClick={handleRestart}
                    className="restart-button"
                  >
                    Play Again
                  </button>
                  <button 
                    onClick={handleBackToMenu}
                    className="menu-button"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Screen reader content */}
        <div className="sr-only">
          <div role="status" aria-live="polite">
            Game state: {state.gameState}
          </div>
          <div role="status" aria-live="polite">
            Current score: {state.score.toLocaleString()}
          </div>
        </div>

        {/* Noscript fallback */}
        <noscript>
          <div className="noscript-warning">
            <h2>JavaScript Required</h2>
            <p>This game requires JavaScript to function properly. Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
      </div>
    </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
