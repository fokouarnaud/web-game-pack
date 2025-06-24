/**
 * useGameEngine hook - React hook for GameEngine integration
 * Following TDD methodology - implementing to make tests pass (GREEN phase)
 */

import { useEffect, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';
import type { IGameEngine, GameConfig } from '../types';

export function useGameEngine(config?: Partial<GameConfig>): IGameEngine {
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize engine on first render
  if (!engineRef.current) {
    engineRef.current = new GameEngine(config);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return engineRef.current;
}