/**
 * Core game types and interfaces for Dialect Learning Game
 * Defines the main structures for game state, objects, and configuration
 */

/** Position in 2D space */
export interface Position {
  x: number;
  y: number;
}

/** Velocity vector for object movement */
export interface Velocity {
  x: number;
  y: number;
}

/** Bounding box for collision detection */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Game object base interface */
export interface GameObject {
  id: string;
  position: Position;
  velocity: Velocity;
  boundingBox: BoundingBox;
  type: GameObjectType;
  active: boolean;
  created: number; // timestamp
}

/** Types of game objects */
export type GameObjectType =
  | 'player'
  | 'word_bubble'
  | 'obstacle'
  | 'powerup'
  | 'particle';

/** Game states */
export type GameState =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'game_over'
  | 'loading';

/** Game configuration */
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  targetFPS: number;
  fixedTimeStep: number; // in milliseconds
  maxObjects: number;
  collisionEnabled: boolean;
  debug: boolean;
}

/** Game session data */
export interface GameSession {
  id: string;
  startTime: number;
  endTime?: number;
  score: number;
  level: number;
  wordsCorrect: number;
  wordsTotal: number;
  accuracy: number; // percentage
  dialect: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/** Main game state */
export interface GameStateData {
  state: GameState;
  session?: GameSession;
  objects: GameObject[];
  config: GameConfig;
  lastUpdate: number;
  deltaTime: number;
  performance: {
    fps: number;
    frameTime: number;
    memoryUsage?: number;
  };
}

/** Game events */
export type GameEventType =
  | 'state_change'
  | 'object_spawn'
  | 'object_destroy'
  | 'collision'
  | 'score_update'
  | 'game_start'
  | 'game_end'
  | 'level_up';

/** Game event interface */
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data?: any;
}