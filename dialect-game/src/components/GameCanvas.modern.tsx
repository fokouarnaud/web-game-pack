/**
 * GameCanvas moderne avec shadcn/ui
 * Task 2: Refonte UI moderne avec TailwindCSS - Phase TDD
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { Card, CardContent } from './ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { GameState, GameEvent } from '../types';

export interface GameCanvasProps {
  width: number;
  height: number;
  gameState: GameState;
  onGameEvent: (event: GameEvent) => void;
  className?: string;
}

export const GameCanvas = React.memo<GameCanvasProps>(({ 
  width, 
  height, 
  gameState, 
  onGameEvent,
  className 
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

  // Get game state badge variant
  const getGameStateBadge = () => {
    switch (gameState) {
      case 'playing':
        return <Badge variant="default" className="bg-green-500">Playing</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'game_over':
        return <Badge variant="destructive">Game Over</Badge>;
      default:
        return <Badge variant="outline">Menu</Badge>;
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div 
            className="text-center space-y-4"
            role="alert"
            aria-live="polite"
          >
            <div className="text-destructive font-semibold">Game Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
            {error.includes('Canvas not supported') && (
              <p className="text-xs text-muted-foreground">
                Try using a modern browser like Chrome, Firefox, or Safari.
              </p>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("game-canvas-modern", className)}>
      <CardContent className="p-6">
        {/* Game Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Dialect Game</h3>
            {getGameStateBadge()}
          </div>
          
          {gameEngine.config.debug && (
            <div className="text-xs text-muted-foreground">
              Debug: {gameEngine.objects.length} objects
            </div>
          )}
        </div>
        
        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative rounded-lg overflow-hidden border bg-muted/10"
          style={{ 
            aspectRatio: `${width}/${height}`,
            minHeight: '300px'
          }}
        >
          {isLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-background/80"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Loading game...</span>
              </div>
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
            className={cn(
              "w-full h-full cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isHighContrast && "contrast-125 saturate-150"
            )}
            role="img"
            aria-label="Game canvas"
            aria-describedby="game-canvas-description"
            tabIndex={0}
            data-testid="game-canvas"
          />
          
          {/* Game Controls Overlay */}
          {gameState !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {gameState === 'menu' && 'Click or tap to start playing'}
                  {gameState === 'paused' && 'Game is paused'}
                  {gameState === 'game_over' && 'Game Over! Click to restart'}
                </p>
                {gameState === 'menu' && (
                  <Button 
                    onClick={() => onGameEvent({
                      type: 'game_start',
                      timestamp: Date.now(),
                      data: { interaction: 'button' }
                    })}
                  >
                    Start Game
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Screen Reader Info */}
        <div 
          id="game-canvas-description" 
          className="sr-only"
        >
          Game is currently {gameState === 'playing' ? 'playing' : gameState}
        </div>
        
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        >
          {gameState === 'playing' && 'Game started'}
          {gameState === 'paused' && 'Game paused'}
          {gameState === 'game_over' && 'Game over'}
        </div>
      </CardContent>
    </Card>
  );
});

GameCanvas.displayName = 'GameCanvas';