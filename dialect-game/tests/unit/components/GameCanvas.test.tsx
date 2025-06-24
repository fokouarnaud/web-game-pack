/**
 * Unit tests for GameCanvas component
 * Following TDD methodology - these tests will initially fail (RED phase)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameCanvas } from '../../../src/components/GameCanvas';
import type { GameState, GameEvent } from '../../../src/types';

// Mock GameEngine
const mockGameEngine = {
  initialize: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  dispose: vi.fn(),
  addObject: vi.fn(),
  removeObject: vi.fn(),
  getObject: vi.fn(),
  onStateChange: vi.fn(),
  onEvent: vi.fn(),
  state: 'menu' as GameState,
  config: {
    canvasWidth: 800,
    canvasHeight: 600,
    targetFPS: 60,
    fixedTimeStep: 16.67,
    maxObjects: 1000,
    collisionEnabled: true,
    debug: false
  },
  objects: []
};

// Mock useGameEngine hook
vi.mock('../../../src/hooks/useGameEngine', () => ({
  useGameEngine: () => mockGameEngine
}));

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

describe('GameCanvas', () => {
  const mockOnGameEvent = vi.fn();
  const defaultProps = {
    width: 800,
    height: 600,
    gameState: 'menu' as GameState,
    onGameEvent: mockOnGameEvent
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render canvas with correct dimensions', () => {
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('width', '800');
      expect(canvas).toHaveAttribute('height', '600');
    });

    it('should render with custom dimensions', () => {
      render(<GameCanvas {...defaultProps} width={1024} height={768} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toHaveAttribute('width', '1024');
      expect(canvas).toHaveAttribute('height', '768');
    });

    it('should have proper accessibility attributes', () => {
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toHaveAttribute('aria-label');
      expect(canvas).toHaveAttribute('tabIndex', '0');
    });

    it('should render loading state initially', () => {
      render(<GameCanvas {...defaultProps} gameState="menu" />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display game state in debug mode', () => {
      const gameEngine = { ...mockGameEngine, config: { ...mockGameEngine.config, debug: true } };
      vi.mocked(require('../../../src/hooks/useGameEngine').useGameEngine).mockReturnValue(gameEngine);
      
      render(<GameCanvas {...defaultProps} />);
      
      expect(screen.getByText(/state: menu/i)).toBeInTheDocument();
    });
  });

  describe('Game Engine Integration', () => {
    it('should initialize game engine on mount', () => {
      render(<GameCanvas {...defaultProps} />);
      
      expect(mockGameEngine.initialize).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        expect.objectContaining({
          canvasWidth: 800,
          canvasHeight: 600
        })
      );
    });

    it('should start game engine when state changes to playing', () => {
      const { rerender } = render(<GameCanvas {...defaultProps} gameState="menu" />);
      
      rerender(<GameCanvas {...defaultProps} gameState="playing" />);
      
      expect(mockGameEngine.start).toHaveBeenCalled();
    });

    it('should pause game engine when state changes to paused', () => {
      const { rerender } = render(<GameCanvas {...defaultProps} gameState="playing" />);
      
      rerender(<GameCanvas {...defaultProps} gameState="paused" />);
      
      expect(mockGameEngine.pause).toHaveBeenCalled();
    });

    it('should stop game engine when state changes to game_over', () => {
      const { rerender } = render(<GameCanvas {...defaultProps} gameState="playing" />);
      
      rerender(<GameCanvas {...defaultProps} gameState="game_over" />);
      
      expect(mockGameEngine.stop).toHaveBeenCalled();
    });

    it('should dispose game engine on unmount', () => {
      const { unmount } = render(<GameCanvas {...defaultProps} />);
      
      unmount();
      
      expect(mockGameEngine.dispose).toHaveBeenCalled();
    });

    it('should handle game engine events', () => {
      render(<GameCanvas {...defaultProps} />);
      
      expect(mockGameEngine.onEvent).toHaveBeenCalledWith(expect.any(Function));
      
      // Simulate game event
      const eventCallback = mockGameEngine.onEvent.mock.calls[0][0];
      const gameEvent: GameEvent = {
        type: 'collision',
        timestamp: Date.now(),
        data: { object1: 'player', object2: 'obstacle' }
      };
      
      eventCallback(gameEvent);
      
      expect(mockOnGameEvent).toHaveBeenCalledWith(gameEvent);
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      await user.click(canvas);
      
      expect(mockOnGameEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'canvas_click',
          data: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number)
          })
        })
      );
    });

    it('should handle keyboard events', async () => {
      const user = userEvent.setup();
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      canvas.focus();
      await user.keyboard('{Space}');
      
      expect(mockOnGameEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'key_press',
          data: expect.objectContaining({
            key: ' '
          })
        })
      );
    });

    it('should handle touch events on mobile', () => {
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      expect(mockOnGameEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'touch_start',
          data: expect.objectContaining({
            x: 100,
            y: 200
          })
        })
      );
    });

    it('should prevent context menu on right click', () => {
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      const contextMenuEvent = fireEvent.contextMenu(canvas);
      
      expect(contextMenuEvent).toBe(false);
    });
  });

  describe('Responsive Behavior', () => {
    it('should observe canvas resize', () => {
      render(<GameCanvas {...defaultProps} />);
      
      expect(mockResizeObserver).toHaveBeenCalled();
      expect(mockResizeObserver().observe).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement)
      );
    });

    it('should handle window resize', async () => {
      render(<GameCanvas {...defaultProps} />);
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        expect(mockGameEngine.initialize).toHaveBeenCalledWith(
          expect.any(HTMLCanvasElement),
          expect.objectContaining({
            canvasWidth: expect.any(Number),
            canvasHeight: expect.any(Number)
          })
        );
      });
    });

    it('should maintain aspect ratio', () => {
      render(<GameCanvas {...defaultProps} width={800} height={600} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      const aspectRatio = 800 / 600;
      
      expect(canvas).toHaveStyle({
        aspectRatio: aspectRatio.toString()
      });
    });

    it('should adapt to container size', () => {
      render(
        <div style={{ width: '400px', height: '300px' }}>
          <GameCanvas {...defaultProps} />
        </div>
      );
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = (props: any) => {
        renderSpy();
        return <GameCanvas {...props} />;
      };
      
      const { rerender } = render(<TestComponent {...defaultProps} />);
      
      // Same props should not trigger re-render
      rerender(<TestComponent {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<GameCanvas {...defaultProps} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockResizeObserver().disconnect).toHaveBeenCalled();
    });

    it('should throttle resize events', async () => {
      render(<GameCanvas {...defaultProps} />);
      
      // Trigger multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        fireEvent(window, new Event('resize'));
      }
      
      // Should only process once due to throttling
      await waitFor(() => {
        expect(mockGameEngine.initialize).toHaveBeenCalledTimes(2); // Initial + one throttled
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle canvas context creation failure', () => {
      const mockGetContext = vi.fn().mockReturnValue(null);
      HTMLCanvasElement.prototype.getContext = mockGetContext;
      
      render(<GameCanvas {...defaultProps} />);
      
      expect(screen.getByText(/canvas not supported/i)).toBeInTheDocument();
    });

    it('should handle game engine initialization errors', () => {
      mockGameEngine.initialize.mockImplementation(() => {
        throw new Error('Initialization failed');
      });
      
      render(<GameCanvas {...defaultProps} />);
      
      expect(screen.getByText(/failed to initialize/i)).toBeInTheDocument();
    });

    it('should provide fallback UI for unsupported browsers', () => {
      // Mock canvas as unsupported
      delete (HTMLCanvasElement.prototype as any).getContext;
      
      render(<GameCanvas {...defaultProps} />);
      
      expect(screen.getByText(/canvas not supported/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade your browser/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      
      await user.tab();
      expect(canvas).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnGameEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'key_press',
          data: { key: 'Enter' }
        })
      );
    });

    it('should provide screen reader descriptions', () => {
      render(<GameCanvas {...defaultProps} gameState="playing" />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toHaveAttribute('aria-describedby');
      
      const description = screen.getByText(/game is currently playing/i);
      expect(description).toBeInTheDocument();
    });

    it('should announce state changes to screen readers', async () => {
      const { rerender } = render(<GameCanvas {...defaultProps} gameState="menu" />);
      
      rerender(<GameCanvas {...defaultProps} gameState="playing" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/game started/i)).toBeInTheDocument();
      });
    });

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      
      render(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByRole('img', { name: /game canvas/i });
      expect(canvas).toHaveClass('high-contrast');
    });
  });
});