/**
 * Tests unitaires pour le GameCanvas moderne avec shadcn/ui
 * Task 2: Refonte UI moderne avec TailwindCSS - Phase TDD
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../src/components/ThemeProvider';
import { GameCanvas } from '../../../src/components/GameCanvas.modern';
import type { GameState, GameEvent } from '../../../src/types';

// Mock du hook useGameEngine
const mockGameEngine = {
  initialize: vi.fn(),
  start: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  onEvent: vi.fn(),
  config: { debug: false },
  objects: []
};

vi.mock('../../../src/hooks/useGameEngine', () => ({
  useGameEngine: () => mockGameEngine
}));

// Wrapper pour les tests avec ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const renderWithTheme = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper });

describe('GameCanvas Modern', () => {
  const defaultProps = {
    width: 800,
    height: 600,
    gameState: 'menu' as GameState,
    onGameEvent: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      globalCompositeOperation: 'source-over',
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'ltr',
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      isPointInPath: vi.fn(),
      isPointInStroke: vi.fn(),
      createPattern: vi.fn(),
      createLinearGradient: vi.fn(),
      createRadialGradient: vi.fn(),
    }));
  });

  describe('Rendering avec shadcn/ui', () => {
    test('should render modern card layout', () => {
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      // Vérifier la présence des composants shadcn/ui
      expect(screen.getByText('Dialect Game')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument(); // Badge
      expect(screen.getByText('Click or tap to start playing')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
    });

    test('should display proper game state badges', () => {
      const { rerender } = renderWithTheme(<GameCanvas {...defaultProps} gameState="playing" />);
      expect(screen.getByText('Playing')).toBeInTheDocument();

      rerender(<ThemeProvider><GameCanvas {...defaultProps} gameState="paused" /></ThemeProvider>);
      expect(screen.getByText('Paused')).toBeInTheDocument();

      rerender(<ThemeProvider><GameCanvas {...defaultProps} gameState="game_over" /></ThemeProvider>);
      expect(screen.getByText('Game Over')).toBeInTheDocument();
    });

    test('should show loading state with modern spinner', () => {
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      // Le loading apparaît initialement puis disparaît après initialisation
      expect(screen.getByText('Loading game...')).toBeInTheDocument();
    });

    test('should render canvas with proper accessibility', () => {
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByTestId('game-canvas');
      expect(canvas).toHaveAttribute('role', 'img');
      expect(canvas).toHaveAttribute('aria-label', 'Game canvas');
      expect(canvas).toHaveAttribute('tabindex', '0');
    });

    test('should apply custom className', () => {
      renderWithTheme(<GameCanvas {...defaultProps} className="custom-game" />);
      
      const container = document.querySelector('.game-canvas-modern');
      expect(container).toHaveClass('custom-game');
    });
  });

  describe('Error Handling moderne', () => {
    test('should display modern error card when canvas fails', async () => {
      // Mock canvas failure
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Game Error')).toBeInTheDocument();
        expect(screen.getByText(/Canvas not supported/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    test('should handle retry button click', async () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
      
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: 'Retry' });
        fireEvent.click(retryButton);
        expect(reloadSpy).toHaveBeenCalled();
      });
      
      reloadSpy.mockRestore();
    });
  });

  describe('Game Interactions modernisées', () => {
    test('should handle start game button click', async () => {
      const onGameEvent = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<GameCanvas {...defaultProps} onGameEvent={onGameEvent} />);
      
      const startButton = screen.getByRole('button', { name: 'Start Game' });
      await user.click(startButton);
      
      expect(onGameEvent).toHaveBeenCalledWith({
        type: 'game_start',
        timestamp: expect.any(Number),
        data: { interaction: 'button' }
      });
    });

    test('should handle canvas interactions', async () => {
      const onGameEvent = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<GameCanvas {...defaultProps} onGameEvent={onGameEvent} gameState="playing" />);
      
      const canvas = screen.getByTestId('game-canvas');
      await user.click(canvas);
      
      expect(onGameEvent).toHaveBeenCalledWith({
        type: 'game_start',
        timestamp: expect.any(Number),
        data: { interaction: 'click', x: expect.any(Number), y: expect.any(Number) }
      });
    });

    test('should handle keyboard events on canvas', async () => {
      const onGameEvent = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<GameCanvas {...defaultProps} onGameEvent={onGameEvent} gameState="playing" />);
      
      const canvas = screen.getByTestId('game-canvas');
      canvas.focus();
      await user.keyboard('{Space}');
      
      expect(onGameEvent).toHaveBeenCalledWith({
        type: 'game_start',
        timestamp: expect.any(Number),
        data: { interaction: 'keypress', key: ' ' }
      });
    });
  });

  describe('Responsive & Accessibility', () => {
    test('should maintain aspect ratio', () => {
      renderWithTheme(<GameCanvas {...defaultProps} width={1200} height={800} />);
      
      const container = document.querySelector('[style*="aspect-ratio"]');
      expect(container).toHaveStyle({ aspectRatio: '1200/800' });
    });

    test('should support high contrast mode', () => {
      // Mock high contrast media query
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
      });
      
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      const canvas = screen.getByTestId('game-canvas');
      expect(canvas).toHaveClass('contrast-125', 'saturate-150');
    });

    test('should handle touch events', () => {
      const onGameEvent = vi.fn();
      renderWithTheme(<GameCanvas {...defaultProps} onGameEvent={onGameEvent} />);
      
      const canvas = screen.getByTestId('game-canvas');
      
      // Simuler un événement touch
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      expect(onGameEvent).toHaveBeenCalledWith({
        type: 'game_start',
        timestamp: expect.any(Number),
        data: { interaction: 'touch', x: expect.any(Number), y: expect.any(Number) }
      });
    });
  });

  describe('Game Engine Integration', () => {
    test('should initialize game engine properly', () => {
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      expect(mockGameEngine.initialize).toHaveBeenCalled();
      expect(mockGameEngine.onEvent).toHaveBeenCalled();
    });

    test('should handle game state transitions', () => {
      const { rerender } = renderWithTheme(<GameCanvas {...defaultProps} gameState="menu" />);
      
      rerender(<ThemeProvider><GameCanvas {...defaultProps} gameState="playing" /></ThemeProvider>);
      expect(mockGameEngine.start).toHaveBeenCalled();
      
      rerender(<ThemeProvider><GameCanvas {...defaultProps} gameState="paused" /></ThemeProvider>);
      expect(mockGameEngine.pause).toHaveBeenCalled();
      
      rerender(<ThemeProvider><GameCanvas {...defaultProps} gameState="game_over" /></ThemeProvider>);
      expect(mockGameEngine.stop).toHaveBeenCalled();
    });

    test('should show debug info when enabled', () => {
      mockGameEngine.config.debug = true;
      mockGameEngine.objects = [1, 2, 3]; // Mock objects
      
      renderWithTheme(<GameCanvas {...defaultProps} />);
      
      expect(screen.getByText('Debug: 3 objects')).toBeInTheDocument();
    });
  });
});