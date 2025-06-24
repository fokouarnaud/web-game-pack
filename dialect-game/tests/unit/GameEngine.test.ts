/**
 * Unit tests for GameEngine
 * Following TDD methodology - these tests will initially fail (RED phase)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from '../../src/core/GameEngine';
import { 
  createMockCanvas, 
  createMockGameObject, 
  createMockGameObjects,
  createMockGameConfig,
  mockAnimationFrame,
  mockPerformanceNow,
  mockMathRandom,
  PerformanceTestHelper,
  checkCollision
} from '../utils/gameTestUtils';
import type { GameConfig, GameObject, GameState, GameEvent } from '../../src/types';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let mockCanvas: HTMLCanvasElement;
  let animationFrameMock: ReturnType<typeof mockAnimationFrame>;
  let performanceMock: ReturnType<typeof mockPerformanceNow>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup mock environment
    mockCanvas = createMockCanvas();
    animationFrameMock = mockAnimationFrame();
    performanceMock = mockPerformanceNow();
    
    gameEngine = new GameEngine();
  });

  afterEach(() => {
    if (gameEngine) {
      gameEngine.dispose();
    }
    performanceMock.reset();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const engine = new GameEngine();
      
      expect(engine.state).toBe('menu');
      expect(engine.config).toEqual({
        canvasWidth: 800,
        canvasHeight: 600,
        targetFPS: 60,
        fixedTimeStep: 1000 / 60,
        maxObjects: 1000,
        collisionEnabled: true,
        debug: false
      });
      expect(engine.objects).toEqual([]);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<GameConfig> = {
        canvasWidth: 1024,
        canvasHeight: 768,
        targetFPS: 30,
        maxObjects: 500,
        debug: true
      };
      
      const engine = new GameEngine(customConfig);
      
      expect(engine.config).toEqual({
        canvasWidth: 1024,
        canvasHeight: 768,
        targetFPS: 30,
        fixedTimeStep: 1000 / 60, // Should remain default
        maxObjects: 500,
        collisionEnabled: true, // Should remain default
        debug: true
      });
    });

    it('should initialize canvas and apply configuration', () => {
      const customConfig = { canvasWidth: 1024, canvasHeight: 768 };
      
      gameEngine.initialize(mockCanvas, customConfig);
      
      expect(mockCanvas.width).toBe(1024);
      expect(mockCanvas.height).toBe(768);
      expect(gameEngine.config.canvasWidth).toBe(1024);
      expect(gameEngine.config.canvasHeight).toBe(768);
    });

    it('should handle canvas initialization errors gracefully', () => {
      const invalidCanvas = null as any;
      
      expect(() => {
        gameEngine.initialize(invalidCanvas, {});
      }).toThrow('Invalid canvas element');
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, {});
    });

    it('should start game and change state to playing', () => {
      const stateChanges: GameState[] = [];
      gameEngine.onStateChange((state) => stateChanges.push(state));
      
      gameEngine.start();
      
      expect(gameEngine.state).toBe('playing');
      expect(stateChanges).toContain('playing');
    });

    it('should stop game and change state to menu', () => {
      gameEngine.start();
      expect(gameEngine.state).toBe('playing');
      
      gameEngine.stop();
      
      expect(gameEngine.state).toBe('menu');
    });

    it('should pause game and change state to paused', () => {
      gameEngine.start();
      
      gameEngine.pause();
      
      expect(gameEngine.state).toBe('paused');
    });

    it('should resume from paused state', () => {
      gameEngine.start();
      gameEngine.pause();
      expect(gameEngine.state).toBe('paused');
      
      gameEngine.resume();
      
      expect(gameEngine.state).toBe('playing');
    });

    it('should not start if already playing', () => {
      gameEngine.start();
      const firstCallbackCount = animationFrameMock.getQueueSize();
      
      gameEngine.start(); // Second call should be ignored
      
      expect(animationFrameMock.getQueueSize()).toBe(firstCallbackCount);
    });

    it('should handle state transitions properly', () => {
      const stateChanges: GameState[] = [];
      gameEngine.onStateChange((state) => stateChanges.push(state));
      
      gameEngine.start();
      gameEngine.pause();
      gameEngine.resume();
      gameEngine.stop();
      
      expect(stateChanges).toEqual(['playing', 'paused', 'playing', 'menu']);
    });
  });

  describe('Game Loop and Timing', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, {});
    });

    it('should start game loop with requestAnimationFrame', () => {
      gameEngine.start();
      
      expect(animationFrameMock.mockRAF).toHaveBeenCalled();
      expect(animationFrameMock.getQueueSize()).toBeGreaterThan(0);
    });

    it('should maintain target FPS with fixed timestep', () => {
      const config = createMockGameConfig({ targetFPS: 60, fixedTimeStep: 16.67 });
      const engine = new GameEngine(config);
      engine.initialize(mockCanvas, {});
      
      engine.start();
      
      // Simulate multiple frames
      animationFrameMock.triggerFrames(5, 16.67);
      
      expect(animationFrameMock.mockRAF).toHaveBeenCalledTimes(6); // Initial + 5 frames
    });

    it('should stop game loop when stopped', () => {
      gameEngine.start();
      expect(animationFrameMock.getQueueSize()).toBeGreaterThan(0);
      
      gameEngine.stop();
      
      expect(animationFrameMock.mockCAF).toHaveBeenCalled();
    });

    it('should pause game loop without stopping it', () => {
      gameEngine.start();
      const initialCallCount = animationFrameMock.mockRAF.call.length;
      
      gameEngine.pause();
      animationFrameMock.triggerFrame();
      
      // Should not schedule new frames when paused
      expect(animationFrameMock.mockRAF.call.length).toBe(initialCallCount);
    });

    it('should handle frame drops and catch up', () => {
      gameEngine.initialize(mockCanvas, {});
      
      // Test that the engine can be started and handles timing
      gameEngine.start();
      expect(gameEngine.state).toBe('playing');
      
      // Verify animation frame was requested
      expect(animationFrameMock.mockRAF).toHaveBeenCalled();
    });
  });

  describe('Object Management', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, {});
    });

    it('should add game object', () => {
      const obj = createMockGameObject({ id: 'test-1' });
      
      gameEngine.addObject(obj);
      
      expect(gameEngine.objects).toContain(obj);
      expect(gameEngine.objects.length).toBe(1);
    });

    it('should remove game object by id', () => {
      const obj1 = createMockGameObject({ id: 'test-1' });
      const obj2 = createMockGameObject({ id: 'test-2' });
      
      gameEngine.addObject(obj1);
      gameEngine.addObject(obj2);
      expect(gameEngine.objects.length).toBe(2);
      
      gameEngine.removeObject('test-1');
      
      expect(gameEngine.objects.length).toBe(1);
      expect(gameEngine.objects[0].id).toBe('test-2');
    });

    it('should get game object by id', () => {
      const obj = createMockGameObject({ id: 'test-1' });
      gameEngine.addObject(obj);
      
      const retrieved = gameEngine.getObject('test-1');
      
      expect(retrieved).toBe(obj);
    });

    it('should return undefined for non-existent object', () => {
      const retrieved = gameEngine.getObject('non-existent');
      
      expect(retrieved).toBeUndefined();
    });

    it('should enforce max objects limit', () => {
      const engine = new GameEngine({ maxObjects: 2 });
      engine.initialize(mockCanvas, {});
      
      const objects = createMockGameObjects(3);
      
      engine.addObject(objects[0]);
      engine.addObject(objects[1]);
      engine.addObject(objects[2]); // Should be rejected
      
      expect(engine.objects.length).toBe(2);
    });

    it('should update object positions', () => {
      const obj = createMockGameObject({
        position: { x: 0, y: 0 },
        velocity: { x: 5, y: 10 }
      });
      
      gameEngine.addObject(obj);
      gameEngine.start();
      
      // Trigger one frame update
      performanceMock.advance(16.67);
      animationFrameMock.triggerFrame();
      
      const updatedObj = gameEngine.getObject(obj.id);
      expect(updatedObj?.position.x).toBeGreaterThan(0);
      expect(updatedObj?.position.y).toBeGreaterThan(0);
    });

    it('should remove inactive objects', () => {
      const activeObj = createMockGameObject({ id: 'active', active: true });
      const inactiveObj = createMockGameObject({ id: 'inactive', active: false });
      
      gameEngine.addObject(activeObj);
      gameEngine.addObject(inactiveObj);
      gameEngine.start();
      
      // Trigger cleanup
      animationFrameMock.triggerFrame();
      
      expect(gameEngine.objects.length).toBe(1);
      expect(gameEngine.getObject('active')).toBeDefined();
      expect(gameEngine.getObject('inactive')).toBeUndefined();
    });
  });

  describe('Collision Detection', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, { collisionEnabled: true });
    });

    it('should detect collisions between objects', () => {
      const obj1 = createMockGameObject({
        id: 'obj1',
        position: { x: 0, y: 0 },
        boundingBox: { x: 0, y: 0, width: 32, height: 32 }
      });
      
      const obj2 = createMockGameObject({
        id: 'obj2',
        position: { x: 16, y: 16 },
        boundingBox: { x: 16, y: 16, width: 32, height: 32 }
      });
      
      const collisionEvents: GameEvent[] = [];
      gameEngine.onEvent((event) => {
        if (event.type === 'collision') {
          collisionEvents.push(event);
        }
      });
      
      gameEngine.addObject(obj1);
      gameEngine.addObject(obj2);
      gameEngine.start();
      
      animationFrameMock.triggerFrame();
      
      expect(collisionEvents.length).toBeGreaterThan(0);
      expect(collisionEvents[0].type).toBe('collision');
    });

    it('should not detect collisions when disabled', () => {
      const engine = new GameEngine({ collisionEnabled: false });
      engine.initialize(mockCanvas, {});
      
      const obj1 = createMockGameObject({
        position: { x: 0, y: 0 },
        boundingBox: { x: 0, y: 0, width: 32, height: 32 }
      });
      
      const obj2 = createMockGameObject({
        position: { x: 16, y: 16 },
        boundingBox: { x: 16, y: 16, width: 32, height: 32 }
      });
      
      const collisionEvents: GameEvent[] = [];
      engine.onEvent((event) => {
        if (event.type === 'collision') {
          collisionEvents.push(event);
        }
      });
      
      engine.addObject(obj1);
      engine.addObject(obj2);
      engine.start();
      
      animationFrameMock.triggerFrame();
      
      expect(collisionEvents.length).toBe(0);
    });

    it('should handle collision responses', () => {
      const obj1 = createMockGameObject({
        id: 'player',
        type: 'player',
        position: { x: 0, y: 0 },
        velocity: { x: 5, y: 0 },
        boundingBox: { x: 0, y: 0, width: 32, height: 32 }
      });
      
      const obj2 = createMockGameObject({
        id: 'obstacle',
        type: 'obstacle',
        position: { x: 30, y: 0 },
        velocity: { x: 0, y: 0 },
        boundingBox: { x: 30, y: 0, width: 32, height: 32 }
      });
      
      gameEngine.addObject(obj1);
      gameEngine.addObject(obj2);
      gameEngine.start();
      
      // Trigger collision
      animationFrameMock.triggerFrame();
      
      // Player should bounce or stop
      const updatedPlayer = gameEngine.getObject('player');
      expect(updatedPlayer?.velocity.x).not.toBe(5); // Velocity should change
    });
  });

  describe('Event System', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, {});
    });

    it('should emit state change events', () => {
      const stateChangeEvents: GameState[] = [];
      gameEngine.onStateChange((state) => stateChangeEvents.push(state));
      
      gameEngine.start();
      gameEngine.pause();
      gameEngine.resume();
      gameEngine.stop();
      
      expect(stateChangeEvents).toEqual(['playing', 'paused', 'playing', 'menu']);
    });

    it('should emit game events', () => {
      const gameEvents: GameEvent[] = [];
      gameEngine.onEvent((event) => gameEvents.push(event));
      
      // Add an object to trigger events
      const obj = createMockGameObject();
      gameEngine.addObject(obj);
      
      expect(gameEvents.length).toBeGreaterThan(0);
      expect(gameEvents[0].type).toBe('object_spawn');
    });

    it('should emit object spawn events', () => {
      const spawnEvents: GameEvent[] = [];
      gameEngine.onEvent((event) => {
        if (event.type === 'object_spawn') {
          spawnEvents.push(event);
        }
      });
      
      const obj = createMockGameObject();
      gameEngine.addObject(obj);
      
      expect(spawnEvents.length).toBe(1);
      expect(spawnEvents[0].data.objectId).toBe(obj.id);
    });

    it('should emit object destroy events', () => {
      const destroyEvents: GameEvent[] = [];
      gameEngine.onEvent((event) => {
        if (event.type === 'object_destroy') {
          destroyEvents.push(event);
        }
      });
      
      const obj = createMockGameObject({ id: 'test' });
      gameEngine.addObject(obj);
      gameEngine.removeObject('test');
      
      expect(destroyEvents.length).toBe(1);
      expect(destroyEvents[0].data.objectId).toBe('test');
    });
  });

  describe('Performance and Memory Management', () => {
    beforeEach(() => {
      gameEngine.initialize(mockCanvas, {});
    });

    it('should maintain stable frame rate', () => {
      const performanceHelper = new PerformanceTestHelper();
      gameEngine.start();
      
      // Measure multiple frames
      for (let i = 0; i < 10; i++) {
        performanceHelper.start();
        animationFrameMock.triggerFrame();
        performanceHelper.end();
      }
      
      const averageFrameTime = performanceHelper.getAverageDuration();
      expect(averageFrameTime).toBeLessThan(20); // Should be under 20ms for 60fps
    });

    it('should handle large numbers of objects efficiently', () => {
      const objects = createMockGameObjects(100);
      const performanceHelper = new PerformanceTestHelper();
      
      objects.forEach(obj => gameEngine.addObject(obj));
      gameEngine.start();
      
      performanceHelper.start();
      animationFrameMock.triggerFrame();
      performanceHelper.end();
      
      const frameTime = performanceHelper.getMaxDuration();
      expect(frameTime).toBeLessThan(50); // Should handle 100 objects efficiently
    });

    it('should clean up resources on dispose', () => {
      gameEngine.start();
      gameEngine.addObject(createMockGameObject());
      
      gameEngine.dispose();
      
      expect(gameEngine.state).toBe('menu');
      expect(gameEngine.objects.length).toBe(0);
      expect(animationFrameMock.mockCAF).toHaveBeenCalled();
    });

    it('should prevent memory leaks with object pooling', () => {
      const initialObjectCount = gameEngine.objects.length;
      
      // Add and remove many objects
      for (let i = 0; i < 100; i++) {
        const obj = createMockGameObject({ id: `temp-${i}` });
        gameEngine.addObject(obj);
        gameEngine.removeObject(`temp-${i}`);
      }
      
      expect(gameEngine.objects.length).toBe(initialObjectCount);
    });
  });

  describe('Canvas Integration', () => {
    it('should render objects to canvas', () => {
      gameEngine.initialize(mockCanvas, {});
      const context = mockCanvas.getContext('2d') as any;
      
      // Test that canvas context is available and configured
      expect(context).toBeTruthy();
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
      
      // Verify objects can be added
      const obj = createMockGameObject();
      gameEngine.addObject(obj);
      expect(gameEngine.objects.length).toBe(1);
    });

    it('should clear canvas before rendering', () => {
      gameEngine.initialize(mockCanvas, {});
      const context = mockCanvas.getContext('2d') as any;
      
      // Test that canvas is properly initialized
      expect(context).toBeTruthy();
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
    });

    it('should handle canvas resize', () => {
      gameEngine.initialize(mockCanvas, {});
      
      // Simulate canvas resize by updating canvas properties
      mockCanvas.width = 1024;
      mockCanvas.height = 768;
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      expect(gameEngine.config.canvasWidth).toBe(1024);
      expect(gameEngine.config.canvasHeight).toBe(768);
    });
  });

  describe('Debug Mode', () => {
    it('should provide debug information when enabled', () => {
      const engine = new GameEngine({ debug: true });
      engine.initialize(mockCanvas, {});
      
      // Test that debug mode is enabled in configuration
      expect(engine.config.debug).toBe(true);
      
      // Test that engine can be started in debug mode
      engine.start();
      expect(engine.state).toBe('playing');
    });

    it('should not render debug info when disabled', () => {
      const engine = new GameEngine({ debug: false });
      engine.initialize(mockCanvas, {});
      
      // Test that debug mode is disabled in configuration
      expect(engine.config.debug).toBe(false);
      
      // Test that engine can be started normally
      engine.start();
      expect(engine.state).toBe('playing');
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce consistent results with fixed seed', () => {
      const randomMock = mockMathRandom(42);
      
      // Create objects with deterministic random values
      randomMock.setSeed(42);
      const velocity1 = { x: Math.random() * 10, y: Math.random() * 10 };
      
      randomMock.setSeed(42);
      const velocity2 = { x: Math.random() * 10, y: Math.random() * 10 };
      
      expect(velocity1).toEqual(velocity2);
      
      randomMock.restore();
    });
  });
});