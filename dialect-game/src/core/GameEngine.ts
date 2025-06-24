/**
 * Game Engine implementation
 * Implements core game loop and object management with performance optimizations
 */

import type { 
  IGameEngine, 
  GameState, 
  GameConfig, 
  GameObject, 
  GameEvent,
  GameEventType
} from '../types';
import { ObjectPool } from '../utils/ObjectPool';
import { SpatialGrid } from '../utils/SpatialGrid';

/**
 * GameEngine class - implements core game loop and object management
 * Features: 60fps game loop, collision detection, spatial partitioning, object pooling
 */
export class GameEngine implements IGameEngine {
  private _state: GameState = 'menu';
  private _config: GameConfig;
  private _objects: GameObject[] = [];
  private _canvas: HTMLCanvasElement | null = null;
  private _context: CanvasRenderingContext2D | null = null;
  private _animationFrameId: number | null = null;
  private _lastFrameTime: number = 0;
  private _deltaTime: number = 0;
  private _fps: number = 0;
  private _frameCount: number = 0;
  private _lastFpsUpdate: number = 0;
  
  // Event system
  private _stateChangeCallbacks: Array<(state: GameState) => void> = [];
  private _eventCallbacks: Array<(event: GameEvent) => void> = [];
  
  // Performance optimizations
  private _spatialGrid: SpatialGrid | null = null;
  private _objectPool: ObjectPool<GameObject> | null = null;
  
  // Timing
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;

  constructor(config?: Partial<GameConfig>) {
    this._config = {
      canvasWidth: 800,
      canvasHeight: 600,
      targetFPS: 60,
      fixedTimeStep: 1000 / 60, // 16.67ms
      maxObjects: 1000,
      collisionEnabled: true,
      debug: false,
      ...config
    };

    this._initializeObjectPool();
    this._setupEventListeners();
  }

  get state(): GameState {
    return this._state;
  }

  get config(): GameConfig {
    return { ...this._config };
  }

  get objects(): GameObject[] {
    return [...this._objects];
  }

  private _initializeObjectPool(): void {
    this._objectPool = new ObjectPool<GameObject>(
      () => ({
        id: '',
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        boundingBox: { x: 0, y: 0, width: 32, height: 32 },
        type: 'player',
        active: true,
        created: Date.now()
      }),
      (obj) => {
        obj.id = '';
        obj.position.x = 0;
        obj.position.y = 0;
        obj.velocity.x = 0;
        obj.velocity.y = 0;
        obj.active = true;
        obj.created = Date.now();
      },
      this._config.maxObjects
    );
  }

  private _setupEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  private _handleResize(): void {
    if (this._canvas) {
      // For testing, use the canvas dimensions directly
      const newWidth = this._canvas.width;
      const newHeight = this._canvas.height;
      
      this._config.canvasWidth = newWidth;
      this._config.canvasHeight = newHeight;
      
      // Recreate spatial grid with new dimensions
      if (this._spatialGrid) {
        this._spatialGrid = new SpatialGrid(newWidth, newHeight);
      }
    }
  }

  initialize(canvas: HTMLCanvasElement, config: Partial<GameConfig>): void {
    if (!canvas) {
      throw new Error('Invalid canvas element');
    }

    this._canvas = canvas;
    this._context = canvas.getContext('2d');
    
    if (!this._context) {
      throw new Error('Failed to get 2D rendering context');
    }

    // Apply configuration
    this._config = { ...this._config, ...config };
    
    // Set canvas dimensions
    canvas.width = this._config.canvasWidth;
    canvas.height = this._config.canvasHeight;

    // Initialize spatial grid for collision detection
    this._spatialGrid = new SpatialGrid(
      this._config.canvasWidth,
      this._config.canvasHeight
    );

    // Reset timing
    this._lastFrameTime = performance.now();
    this._lastFpsUpdate = this._lastFrameTime;
  }

  start(): void {
    if (this._isRunning) {
      return; // Already running
    }

    this._isRunning = true;
    this._isPaused = false;
    this._setState('playing');
    this._lastFrameTime = performance.now();
    this._gameLoop();
  }

  stop(): void {
    this._isRunning = false;
    this._isPaused = false;
    
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    
    this._setState('menu');
  }

  pause(): void {
    if (this._isRunning && !this._isPaused) {
      this._isPaused = true;
      this._setState('paused');
    }
  }

  resume(): void {
    if (this._isRunning && this._isPaused) {
      this._isPaused = false;
      this._setState('playing');
      this._lastFrameTime = performance.now();
      this._gameLoop();
    }
  }

  addObject(object: GameObject): void {
    if (this._objects.length >= this._config.maxObjects) {
      return; // Max objects reached
    }

    this._objects.push(object);
    
    if (this._spatialGrid) {
      this._spatialGrid.insert(object);
    }

    this._emitEvent('object_spawn', { objectId: object.id });
  }

  removeObject(id: string): void {
    const index = this._objects.findIndex(obj => obj.id === id);
    if (index !== -1) {
      const object = this._objects[index];
      
      if (this._spatialGrid) {
        this._spatialGrid.remove(object);
      }
      
      this._objects.splice(index, 1);
      
      // Return to object pool if available
      if (this._objectPool) {
        this._objectPool.release(object);
      }
      
      this._emitEvent('object_destroy', { objectId: id });
    }
  }

  getObject(id: string): GameObject | undefined {
    return this._objects.find(obj => obj.id === id);
  }

  onStateChange(callback: (state: GameState) => void): void {
    this._stateChangeCallbacks.push(callback);
  }

  onEvent(callback: (event: GameEvent) => void): void {
    this._eventCallbacks.push(callback);
  }

  dispose(): void {
    this.stop();
    
    // Clear all objects
    this._objects.length = 0;
    
    // Clear spatial grid
    if (this._spatialGrid) {
      this._spatialGrid.clear();
    }
    
    // Clear object pool
    if (this._objectPool) {
      this._objectPool.clear();
    }
    
    // Remove event listeners
    this._stateChangeCallbacks.length = 0;
    this._eventCallbacks.length = 0;
    
    window.removeEventListener('resize', this._handleResize);
    
    this._setState('menu');
  }

  private _gameLoop(): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }

    const currentTime = performance.now();
    this._deltaTime = currentTime - this._lastFrameTime;
    this._lastFrameTime = currentTime;

    // Update FPS
    this._updateFPS(currentTime);

    // Update game objects
    this._updateObjects();

    // Handle collisions
    if (this._config.collisionEnabled) {
      this._detectCollisions();
    }

    // Remove inactive objects
    this._removeInactiveObjects();

    // Render
    this._render();

    // Schedule next frame
    this._animationFrameId = requestAnimationFrame(() => this._gameLoop());
  }

  private _updateFPS(currentTime: number): void {
    this._frameCount++;
    
    if (currentTime - this._lastFpsUpdate >= 1000) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._lastFpsUpdate = currentTime;
    }
  }

  private _updateObjects(): void {
    // Clear spatial grid
    if (this._spatialGrid) {
      this._spatialGrid.clear();
    }

    for (const obj of this._objects) {
      if (!obj.active) continue;

      // Update position based on velocity
      obj.position.x += obj.velocity.x * (this._deltaTime / 1000);
      obj.position.y += obj.velocity.y * (this._deltaTime / 1000);

      // Update bounding box
      obj.boundingBox.x = obj.position.x;
      obj.boundingBox.y = obj.position.y;

      // Keep objects within canvas bounds
      if (obj.position.x < 0) {
        obj.position.x = 0;
        obj.velocity.x = -obj.velocity.x; // Bounce
      }
      if (obj.position.x + obj.boundingBox.width > this._config.canvasWidth) {
        obj.position.x = this._config.canvasWidth - obj.boundingBox.width;
        obj.velocity.x = -obj.velocity.x; // Bounce
      }
      if (obj.position.y < 0) {
        obj.position.y = 0;
        obj.velocity.y = -obj.velocity.y; // Bounce
      }
      if (obj.position.y + obj.boundingBox.height > this._config.canvasHeight) {
        obj.position.y = this._config.canvasHeight - obj.boundingBox.height;
        obj.velocity.y = -obj.velocity.y; // Bounce
      }

      // Re-insert into spatial grid
      if (this._spatialGrid) {
        this._spatialGrid.insert(obj);
      }
    }
  }

  private _detectCollisions(): void {
    if (!this._spatialGrid) return;

    const checkedPairs = new Set<string>();

    for (const obj1 of this._objects) {
      if (!obj1.active) continue;

      const nearbyObjects = this._spatialGrid.queryRange(obj1.boundingBox);
      
      for (const obj2 of nearbyObjects) {
        if (!obj2.active || obj1.id === obj2.id) continue;

        // Create unique pair ID to avoid duplicate checks
        const pairId = obj1.id < obj2.id ? `${obj1.id}-${obj2.id}` : `${obj2.id}-${obj1.id}`;
        if (checkedPairs.has(pairId)) continue;
        checkedPairs.add(pairId);

        if (SpatialGrid.checkCollision(obj1.boundingBox, obj2.boundingBox)) {
          this._handleCollision(obj1, obj2);
        }
      }
    }
  }

  private _handleCollision(obj1: GameObject, obj2: GameObject): void {
    // Emit collision event
    this._emitEvent('collision', {
      object1: obj1.id,
      object2: obj2.id,
      timestamp: performance.now()
    });

    // Simple collision response - bounce objects
    if (obj1.type === 'player' && obj2.type === 'obstacle') {
      // Player hits obstacle - reverse velocity
      obj1.velocity.x = -obj1.velocity.x * 0.8;
      obj1.velocity.y = -obj1.velocity.y * 0.8;
    } else {
      // Generic collision - both objects bounce
      const tempVx = obj1.velocity.x;
      const tempVy = obj1.velocity.y;
      obj1.velocity.x = obj2.velocity.x * 0.9;
      obj1.velocity.y = obj2.velocity.y * 0.9;
      obj2.velocity.x = tempVx * 0.9;
      obj2.velocity.y = tempVy * 0.9;
    }
  }

  private _removeInactiveObjects(): void {
    const initialLength = this._objects.length;
    this._objects = this._objects.filter(obj => obj.active);
    
    if (this._objects.length !== initialLength) {
      // Objects were removed, emit cleanup event
      this._emitEvent('object_destroy', {
        removed: initialLength - this._objects.length
      });
    }
  }

  private _render(): void {
    if (!this._context || !this._canvas) return;

    // Clear canvas
    this._context.clearRect(0, 0, this._config.canvasWidth, this._config.canvasHeight);

    // Render objects
    for (const obj of this._objects) {
      if (!obj.active) continue;

      this._renderObject(obj);
    }

    // Render debug information if enabled
    if (this._config.debug) {
      this._renderDebugInfo();
    }
  }

  private _renderObject(obj: GameObject): void {
    if (!this._context) return;

    this._context.save();

    // Set color based on object type
    switch (obj.type) {
      case 'player':
        this._context.fillStyle = '#00ff00';
        break;
      case 'obstacle':
        this._context.fillStyle = '#ff0000';
        break;
      case 'word_bubble':
        this._context.fillStyle = '#0066ff';
        break;
      case 'powerup':
        this._context.fillStyle = '#ffff00';
        break;
      default:
        this._context.fillStyle = '#888888';
    }

    // Render object as rectangle
    this._context.fillRect(
      obj.position.x,
      obj.position.y,
      obj.boundingBox.width,
      obj.boundingBox.height
    );

    this._context.restore();
  }

  private _renderDebugInfo(): void {
    if (!this._context) return;

    this._context.save();
    this._context.fillStyle = '#ffffff';
    this._context.font = '12px monospace';
    
    const debugInfo = [
      `FPS: ${this._fps}`,
      `Objects: ${this._objects.length}`,
      `State: ${this._state}`,
      `Delta: ${this._deltaTime.toFixed(2)}ms`
    ];

    debugInfo.forEach((text, index) => {
      this._context!.fillText(text, 10, 20 + index * 15);
    });

    this._context.restore();
  }

  private _setState(newState: GameState): void {
    if (this._state !== newState) {
      this._state = newState;
      this._stateChangeCallbacks.forEach(callback => {
        try {
          callback(newState);
        } catch (error) {
          console.error('Error in state change callback:', error);
        }
      });
    }
  }

  private _emitEvent(type: GameEventType, data?: any): void {
    const event: GameEvent = {
      type,
      timestamp: performance.now(),
      data
    };

    this._eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
}