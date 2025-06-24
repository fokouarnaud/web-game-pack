/**
 * Tests unitaires pour le ScoreDisplay moderne avec shadcn/ui
 * Task 2: Refonte UI moderne avec TailwindCSS - Phase TDD
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../src/components/ThemeProvider';
import { ScoreDisplay } from '../../../src/components/ScoreDisplay.modern';

// Wrapper pour les tests avec ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const renderWithTheme = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper });

describe('ScoreDisplay Modern', () => {
  const defaultProps = {
    score: 1500,
    highScore: 5000,
    level: 3,
    accuracy: 85.5,
    streak: 7
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering avec shadcn/ui', () => {
    test('should render modern card layout', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      // Vérifier la présence des composants shadcn/ui
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Score')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('Streak')).toBeInTheDocument();
    });

    test('should display formatted score values', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      expect(screen.getByTestId('score-value')).toHaveTextContent('1,500');
      expect(screen.getByText('5,000')).toBeInTheDocument(); // High score
      expect(screen.getByTestId('level-display')).toHaveTextContent('3');
      expect(screen.getByTestId('accuracy-display')).toHaveTextContent('85.5%');
      expect(screen.getByTestId('streak-display')).toHaveTextContent('7');
    });

    test('should show level progress bar', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      const progressBar = screen.getByTestId('level-progress');
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText('Level Progress')).toBeInTheDocument();
    });

    test('should apply custom className', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} className="custom-score" />);
      
      const container = screen.getByTestId('score-display');
      expect(container).toHaveClass('custom-score');
    });
  });

  describe('Badge Variants', () => {
    test('should show proper accuracy badge variants', () => {
      const { rerender } = renderWithTheme(
        <ScoreDisplay {...defaultProps} accuracy={95} />
      );
      let badge = screen.getByTestId('accuracy-display');
      expect(badge).toHaveTextContent('95.0%');

      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} accuracy={80} /></ThemeProvider>);
      badge = screen.getByTestId('accuracy-display');
      expect(badge).toHaveTextContent('80.0%');

      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} accuracy={60} /></ThemeProvider>);
      badge = screen.getByTestId('accuracy-display');
      expect(badge).toHaveTextContent('60.0%');
    });

    test('should show proper streak badge variants', () => {
      const { rerender } = renderWithTheme(
        <ScoreDisplay {...defaultProps} streak={15} />
      );
      let badge = screen.getByTestId('streak-display');
      expect(badge).toHaveTextContent('15');
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Fire emoji for hot streak

      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} streak={25} /></ThemeProvider>);
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Fire
      expect(screen.getByText('⚡')).toBeInTheDocument(); // Lightning for super streak

      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} streak={3} /></ThemeProvider>);
      badge = screen.getByTestId('streak-display');
      expect(badge).toHaveTextContent('3');
    });
  });

  describe('Animations and Effects', () => {
    test('should animate score changes', async () => {
      const { rerender } = renderWithTheme(<ScoreDisplay {...defaultProps} score={1000} />);
      
      expect(screen.getByTestId('score-value')).toHaveTextContent('1,000');
      
      // Changer le score pour déclencher l'animation
      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} score={2000} /></ThemeProvider>);
      
      // L'animation devrait commencer
      await waitFor(() => {
        const scoreElement = screen.getByTestId('score-value');
        expect(scoreElement).toHaveClass('animate-pulse');
      }, { timeout: 1000 });
    });

    test('should show milestone celebration', async () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} score={5000} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('milestone-celebration')).toBeInTheDocument();
        expect(screen.getByText(/Amazing!/)).toBeInTheDocument();
      });
    });

    test('should show high score celebration', async () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} score={6000} highScore={5000} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('high-score-celebration')).toBeInTheDocument();
        expect(screen.getByText('🏆 New High Score!')).toBeInTheDocument();
        expect(screen.getByText('High Score!')).toBeInTheDocument(); // Badge in header
      });
    });

    test('should show streak broken notification', async () => {
      const { rerender } = renderWithTheme(<ScoreDisplay {...defaultProps} streak={10} />);
      
      // Casser le streak
      rerender(<ThemeProvider><ScoreDisplay {...defaultProps} streak={0} /></ThemeProvider>);
      
      await waitFor(() => {
        expect(screen.getByTestId('streak-broken')).toBeInTheDocument();
        expect(screen.getByText('💔 Streak broken!')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should adapt to compact layout', () => {
      // Mock window.innerWidth pour simuler mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      // Le layout devrait s'adapter (vérifiable via les classes CSS appliquées)
      const container = screen.getByTestId('score-display');
      expect(container).toBeInTheDocument();
    });

    test('should handle window resize', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      // Simuler un resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Le composant devrait toujours être rendu
      expect(screen.getByTestId('score-display')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      const scoreValue = screen.getByTestId('score-value');
      expect(scoreValue).toHaveAttribute('aria-label', 'Current score: 1,500');
      
      const levelDisplay = screen.getByTestId('level-display');
      expect(levelDisplay).toHaveAttribute('aria-label', 'Current level: 3');
    });

    test('should announce score changes to screen readers', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      // Vérifier la présence des régions live pour les annonces
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('should have proper progress bar semantics', () => {
      renderWithTheme(<ScoreDisplay {...defaultProps} />);
      
      const progressBar = screen.getByTestId('level-progress');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero values gracefully', () => {
      renderWithTheme(
        <ScoreDisplay 
          score={0}
          highScore={0}
          level={1}
          accuracy={0}
          streak={0}
        />
      );
      
      expect(screen.getByTestId('score-value')).toHaveTextContent('0');
      expect(screen.getByTestId('accuracy-display')).toHaveTextContent('0.0%');
      expect(screen.getByTestId('streak-display')).toHaveTextContent('0');
    });

    test('should handle large numbers correctly', () => {
      renderWithTheme(
        <ScoreDisplay 
          {...defaultProps}
          score={1234567}
          highScore={9999999}
        />
      );
      
      expect(screen.getByTestId('score-value')).toHaveTextContent('1,234,567');
      expect(screen.getByText('9,999,999')).toBeInTheDocument();
    });

    test('should handle invalid values', () => {
      renderWithTheme(
        <ScoreDisplay 
          score={NaN}
          highScore={-100}
          level={1}
          accuracy={150} // Over 100%
          streak={-5}
        />
      );
      
      expect(screen.getByTestId('score-value')).toHaveTextContent('0');
      expect(screen.getByTestId('accuracy-display')).toHaveTextContent('100.0%'); // Clamped
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = React.memo(({ score, ...props }) => {
        renderSpy();
        return <ScoreDisplay score={score} {...props} />;
      });

      const { rerender } = renderWithTheme(
        <TestComponent {...defaultProps} />
      );
      
      // Re-render with same props
      rerender(<ThemeProvider><TestComponent {...defaultProps} /></ThemeProvider>);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});