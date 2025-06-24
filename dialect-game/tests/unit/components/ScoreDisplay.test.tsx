/**
 * Unit tests for ScoreDisplay component
 * Version simplifiée selon les bonnes pratiques
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from '../../../src/components/ScoreDisplay';

describe('ScoreDisplay', () => {
  const defaultProps = {
    score: 0,
    highScore: 1000,
    level: 1,
    accuracy: 85.5,
    streak: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<ScoreDisplay {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('should render score value', () => {
      render(<ScoreDisplay {...defaultProps} score={1234} />);
      const scoreElement = screen.getByTestId('score-value');
      expect(scoreElement).toBeTruthy();
      expect(scoreElement.textContent).toContain('1,234');
    });

    it('should render high score', () => {
      render(<ScoreDisplay {...defaultProps} highScore={5000} />);
      const container = screen.getByTestId('score-display');
      expect(container).toBeTruthy();
      expect(container.textContent).toContain('5,000');
    });

    it('should display level information', () => {
      render(<ScoreDisplay {...defaultProps} level={3} />);
      const levelElement = screen.getByTestId('level-display');
      expect(levelElement).toBeTruthy();
      expect(levelElement.textContent).toBe('3');
    });

    it('should handle zero values', () => {
      render(<ScoreDisplay score={0} highScore={0} level={0} accuracy={0} streak={0} />);
      const scoreElement = screen.getByTestId('score-value');
      expect(scoreElement.textContent).toBe('0');
    });

    it('should handle different score values', () => {
      render(<ScoreDisplay {...defaultProps} score={99999} />);
      const scoreElement = screen.getByTestId('score-value');
      expect(scoreElement.textContent).toContain('99,999');
    });

    it('should display accuracy information', () => {
      render(<ScoreDisplay {...defaultProps} accuracy={92.5} />);
      const accuracyElement = screen.getByTestId('accuracy-display');
      expect(accuracyElement).toBeTruthy();
      expect(accuracyElement.textContent).toContain('92.5');
    });

    it('should display streak information', () => {
      render(<ScoreDisplay {...defaultProps} streak={10} />);
      const streakElement = screen.getByTestId('streak-display');
      expect(streakElement).toBeTruthy();
      expect(streakElement.textContent).toContain('10');
    });
  });
});