/**
 * Tests for NavigationGuard Component
 * Phase 3 - Task 12 Implementation Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NavigationGuard, { BreadcrumbNavigation } from '../../../../src/components/NavigationGuard';
import type { Lesson } from '../../../../src/components/LessonSelector';

// Mock lesson for testing
const mockTargetLesson: Lesson = {
  id: 'conversation-1',
  title: 'Daily Conversations',
  description: 'Practice everyday conversations',
  difficulty: 'intermediate',
  status: 'available',
  category: 'conversation',
  duration: 30,
  xpReward: 100,
  prerequisiteIds: ['basics-3']
};

const mockUserProgress = {
  completedLessons: ['basics-1'],
  currentLevel: 1,
  streakDays: 3,
  totalXP: 150,
  preferredDifficulty: 'beginner' as const
};

describe('NavigationGuard Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnRecommendedPath = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
    mockOnRecommendedPath.mockClear();
  });

  it('renders warning dialog for advanced lessons', async () => {
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    // Utiliser des queries plus flexibles
    expect(screen.getByText(/Hold up/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Daily Conversations/i)[0]).toBeInTheDocument();
  });

  it('shows lesson details in the dialog', async () => {
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    expect(screen.getByText(/30.*min/i)).toBeInTheDocument();
    expect(screen.getByText(/100.*XP/i)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it('calls onConfirm when user chooses to continue anyway', async () => {
    const user = userEvent.setup();
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    const continueButton = screen.getByText(/Continue Anyway/i);
    expect(continueButton).toBeInTheDocument();

    await user.click(continueButton);
    expect(mockOnConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when user chooses recommended path', async () => {
    const user = userEvent.setup();
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    const recommendedButton = screen.getByText(/Take Recommended Path/i);
    expect(recommendedButton).toBeInTheDocument();

    await user.click(recommendedButton);
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it('shows confidence score and progress information', async () => {
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    expect(screen.getByText(/Confidence Score/i)).toBeInTheDocument();
    // Progress bar should be visible
    expect(document.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('shows detailed analysis when requested', async () => {
    const user = userEvent.setup();
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={true}
      />
    );

    const detailButton = screen.getByText(/Show detailed analysis/i);
    expect(detailButton).toBeInTheDocument();

    await user.click(detailButton);

    await waitFor(() => {
      expect(screen.getByText(/Completed lessons.*1/i)).toBeInTheDocument();
      expect(screen.getByText(/Current streak.*3 days/i)).toBeInTheDocument();
      expect(screen.getByText(/Total XP.*150/i)).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <NavigationGuard
        targetLesson={mockTargetLesson}
        userProgress={mockUserProgress}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onRecommendedPath={mockOnRecommendedPath}
        isOpen={false}
      />
    );

    expect(screen.queryByText('Daily Conversations')).not.toBeInTheDocument();
  });
});

describe('BreadcrumbNavigation Component', () => {
  const mockLesson: Lesson = {
    id: 'basics-1',
    title: 'Greetings',
    description: 'Basic greetings',
    difficulty: 'beginner',
    status: 'completed',
    category: 'basics',
    duration: 15,
    xpReward: 50
  };

  it('renders breadcrumb navigation correctly', () => {
    render(
      <BreadcrumbNavigation
        currentLesson={mockLesson}
        allLessons={[]}
      />
    );

    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Greetings')).toBeInTheDocument();
  });

  it('marks current lesson as active', () => {
    render(
      <BreadcrumbNavigation
        currentLesson={mockLesson}
        allLessons={[]}
      />
    );

    const currentLessonElement = screen.getByText('Greetings');
    expect(currentLessonElement).toHaveAttribute('aria-current', 'page');
  });

  it('has proper accessibility attributes', () => {
    render(
      <BreadcrumbNavigation
        currentLesson={mockLesson}
        allLessons={[]}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Lesson breadcrumb');
  });
});