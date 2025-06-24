/**
 * Game testing utilities
 * Helper functions and mock objects for game engine testing
 */

import { vi } from 'vitest';
import type { GameObject, GameConfig, Position, Velocity, BoundingBox } from '../../src/types';

/**
 * Create a mock GameObject for testing
 */
export function createMockGameObject(overrides: Partial<GameObject> = {}): GameObject {
  return {
    id: `test-object-${Math.random().toString(36).substr(2, 9)}`,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    boundingBox: { x: 0, y: 0, width: 32, height: 32 },
    type: 'player',
    active: true,
    created: Date.now(),
    ...overrides
  };
}

/**
 * Create multiple mock game objects
 */
export function createMockGameObjects(count: number, typeOverride?: string): GameObject[] {
  return Array.from({ length: count }, (_, index) => 
    createMockGameObject({
      id: `test-object-${index}`,
      type: typeOverride as any || 'player',
      position: { x: index * 50, y: index * 50 }
    })
  );
}

/**
 * Mock canvas element for testing
 */
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      canvas: null as any
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600
    }))
  } as any as HTMLCanvasElement;

  return canvas;
}

/**
 * Create mock game configuration
 */
export function createMockGameConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    canvasWidth: 800,
    canvasHeight: 600,
    targetFPS: 60,
    fixedTimeStep: 1000 / 60,
    maxObjects: 1000,
    collisionEnabled: true,
    debug: false,
    ...overrides
  };
}

/**
 * Mock requestAnimationFrame for deterministic testing
 */
export function mockAnimationFrame() {
  let frameId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  
  const mockRAF = vi.fn((callback: FrameRequestCallback) => {
    frameId++;
    callbacks.set(frameId, callback);
    return frameId;
  });

  const mockCAF = vi.fn((id: number) => {
    callbacks.delete(id);
  });

  const triggerFrame = (timestamp: number = performance.now()) => {
    const callbacksToCall = Array.from(callbacks.values());
    callbacks.clear();
    callbacksToCall.forEach(callback => callback(timestamp));
  };

  const triggerFrames = (count: number, interval: number = 16.67) => {
    for (let i = 0; i < count; i++) {
      triggerFrame(i * interval);
    }
  };

  // Replace global functions
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: mockRAF,
    writable: true
  });

  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: mockCAF,
    writable: true
  });

  return {
    triggerFrame,
    triggerFrames,
    getQueuedCallbacks: () => Array.from(callbacks.values()),
    getQueueSize: () => callbacks.size,
    mockRAF,
    mockCAF
  };
}

/**
 * Mock performance.now() for deterministic timing
 */
export function mockPerformanceNow() {
  let currentTime = 0;
  
  const mockNow = vi.fn(() => currentTime);
  
  const advance = (deltaTime: number) => {
    currentTime += deltaTime;
  };

  const reset = () => {
    currentTime = 0;
  };

  Object.defineProperty(window.performance, 'now', {
    value: mockNow,
    writable: true
  });

  return {
    advance,
    reset,
    getCurrentTime: () => currentTime,
    mockNow
  };
}

/**
 * Check if two bounding boxes overlap (collision detection utility)
 */
export function checkCollision(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(a: Position, b: Position): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Create a deterministic seed for testing
 */
export function mockMathRandom(seed: number = 42) {
  let value = seed;
  
  const mockRandom = vi.fn(() => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  });

  const originalRandom = Math.random;
  Math.random = mockRandom;

  const restore = () => {
    Math.random = originalRandom;
  };

  return {
    mockRandom,
    restore,
    setSeed: (newSeed: number) => { value = newSeed; }
  };
}

/**
 * Performance testing utilities
 */
export class PerformanceTestHelper {
  private startTime: number = 0;
  private endTime: number = 0;
  private measurements: number[] = [];

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverageDuration(): number {
    if (this.measurements.length === 0) return 0;
    return this.measurements.reduce((sum, time) => sum + time, 0) / this.measurements.length;
  }

  getMaxDuration(): number {
    return Math.max(...this.measurements);
  }

  getMinDuration(): number {
    return Math.min(...this.measurements);
  }

  reset(): void {
    this.measurements = [];
  }

  getMeasurements(): number[] {
    return [...this.measurements];
  }
}