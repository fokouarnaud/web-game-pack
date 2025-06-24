/**
 * GameCanvas component - Canvas-based game rendering component
 * Following TDD methodology - implementing to make tests pass (GREEN phase)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import type { GameState, GameEvent } from '../types';

export interface GameCanvasProps {
  width: number;
  height: number;
  gameState: GameState;
  onGameEvent: (event: GameEvent) => void;
}

export const GameCanvas = React.memo<GameCanvasProps>(({ 
  width, 
  height, 
  gameState, 
  onGameEvent 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const gameEngine = useGameEngine({ 
    canvasWidth: width, 
    canvasHeight: height,
    debug: false 
  });

  // Handle high contrast mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Canvas not supported in this browser. Please upgrade your browser.');
        return;
      }

      gameEngine.initialize(canvas, {
        canvasWidth: width,
        canvasHeight: height
      });
      
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to initialize game engine');
      setIsLoading(false);
    }
  }, [gameEngine, width, height]);

  // Handle game state changes
  useEffect(() => {
    switch (gameState) {
      case 'playing':
        gameEngine.start();
        break;
      case 'paused':
        gameEngine.pause();
        break;
      case 'game_over':
        gameEngine.stop();
        break;
      case 'menu':
        gameEngine.stop();
        break;
    }
  }, [gameState, gameEngine]);

  // Handle game engine events
  useEffect(() => {
    const handleGameEvent = (event: GameEvent) => {
      onGameEvent(event);
    };

    gameEngine.onEvent(handleGameEvent);
    
    return () => {
      // Cleanup is handled by the game engine itself
    };
  }, [gameEngine, onGameEvent]);

  // Handle resize observer
  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (canvasRef.current) {
          canvasRef.current.width = newWidth;
          canvasRef.current.height = newHeight;
        }
      }
    });

    resizeObserver.observe(canvasRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle window resize with throttling
  useEffect(() => {
    let timeoutId: number;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (canvasRef.current) {
          gameEngine.initialize(canvasRef.current, {
            canvasWidth: window.innerWidth,
            canvasHeight: window.innerHeight
          });
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [gameEngine]);

  // Handle user interactions
  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    onGameEvent({
      type: 'game_start',
      timestamp: Date.now(),
      data: { interaction: 'click', x, y }
    });
  }, [onGameEvent]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>) => {
    onGameEvent({
      type: 'game_start',
      timestamp: Date.now(),
      data: { interaction: 'keypress', key: event.key }
    });
  }, [onGameEvent]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      onGameEvent({
        type: 'game_start',
        timestamp: Date.now(),
        data: { interaction: 'touch', x, y }
      });
    }
  }, [onGameEvent]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    return false;
  }, []);

  if (error) {
    return (
      <div 
        className="game-canvas-error"
        role="alert"
        aria-live="polite"
      >
        <p>{error}</p>
        {error.includes('Canvas not supported') && (
          <p>Try using a modern browser like Chrome, Firefox, or Safari.</p>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="game-canvas-container"
      style={{ 
        width: '100%', 
        height: '100%',
        aspectRatio: `${width}/${height}`
      }}
    >
      {isLoading && (
        <div 
          className="game-canvas-loading"
          role="status"
          aria-live="polite"
        >
          Loading game...
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onContextMenu={handleContextMenu}
        className={isHighContrast ? 'high-contrast' : ''}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: `${width}/${height}`
        }}
        role="img"
        aria-label="Game canvas"
        aria-describedby="game-canvas-description"
        tabIndex={0}
        data-testid="game-canvas"
      />
      
      <div 
        id="game-canvas-description" 
        className="sr-only"
      >
        Game is currently {gameState === 'playing' ? 'playing' : gameState}
      </div>
      
      {gameState !== 'menu' && (
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        >
          {gameState === 'playing' && 'Game started'}
          {gameState === 'paused' && 'Game paused'}
          {gameState === 'game_over' && 'Game over'}
        </div>
      )}
      
      {gameEngine.config.debug && (
        <div className="debug-overlay">
          <p>State: {gameState}</p>
          <p>Objects: {gameEngine.objects.length}</p>
          <p>FPS: 60</p>
        </div>
      )}
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';