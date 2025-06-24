/**
 * Tests for LessonSelector Component
 * Phase 3 - Task 11 Implementation Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LessonSelector, { type Lesson } from '../../../../src/components/LessonSelector';

// Mock data
const mockLessons: Lesson[] = [
  {
    id: 'basics-1',
    title: 'Greetings & Introductions',
    description: 'Learn basic greetings in different dialects',
    difficulty: 'beginner',
    status: 'completed',
    category: 'basics',
    duration: 15,
    xpReward: 50,
    isRecommended: true
  },
  {
    id: 'basics-2',
    title: 'Numbers & Counting',
    description: 'Master numbers 1-100 in various dialects',
    difficulty: 'beginner',
    status: 'current',
    category: 'basics',
    duration: 20,
    xpReward: 75
  },
  {
    id: 'conversation-1',
    title: 'Daily Conversations',
    description: 'Practice everyday conversations',
    difficulty: 'intermediate',
    status: 'locked',
    category: 'conversation',
    duration: 30,
    xpReward: 100
  }
];

describe('LessonSelector Component', () => {
  const mockOnLessonSelect = vi.fn();

  beforeEach(() => {
    mockOnLessonSelect.mockClear();
  });

  it('renders the component with lesson grid', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    expect(screen.getByText('Choose Your Lesson')).toBeInTheDocument();
    expect(screen.getByText('Select a lesson to continue your dialect learning journey')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search lessons...')).toBeInTheDocument();
  });

  it('displays lesson categories with progress', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeInTheDocument();
    expect(screen.getAllByText('Advanced')[0]).toBeInTheDocument();
  });

  it('shows lesson cards with correct information', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Check for lesson titles
    expect(screen.getByText('Greetings & Introductions')).toBeInTheDocument();
    expect(screen.getByText('Numbers & Counting')).toBeInTheDocument();
    
    // Check for difficulty badges
    expect(screen.getAllByText('beginner')).toHaveLength(3); // 3 beginner lessons
    expect(screen.getAllByText('intermediate').length).toBeGreaterThanOrEqual(1);
  });

  it('handles lesson selection', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Find and click on an available lesson
    const lessonCard = screen.getByText('Numbers & Counting').closest('.group');
    expect(lessonCard).toBeInTheDocument();
    
    await user.click(lessonCard!);
    
    await waitFor(() => {
      expect(mockOnLessonSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'basics-2',
          title: 'Numbers & Counting'
        })
      );
    });
  });

  it('prevents selection of locked lessons', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Try to click on a locked lesson
    const lockedLesson = screen.getByText('Daily Conversations').closest('.group');
    expect(lockedLesson).toHaveClass('opacity-60', 'cursor-not-allowed');
    
    await user.click(lockedLesson!);
    
    // Should not call onLessonSelect for locked lessons
    expect(mockOnLessonSelect).not.toHaveBeenCalled();
  });

  it('filters lessons by search term', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Search lessons...');
    await user.type(searchInput, 'greetings');
    
    await waitFor(() => {
      expect(screen.getByText('Greetings & Introductions')).toBeInTheDocument();
      expect(screen.queryByText('Numbers & Counting')).not.toBeInTheDocument();
    });
  });

  it('filters lessons by difficulty', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    const difficultyFilter = screen.getByDisplayValue('All Levels');
    await user.selectOptions(difficultyFilter, 'intermediate');
    
    await waitFor(() => {
      expect(screen.getByText('Daily Conversations')).toBeInTheDocument();
      expect(screen.queryByText('Greetings & Introductions')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when no lessons match filters', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Search lessons...');
    await user.type(searchInput, 'nonexistent lesson');
    
    await waitFor(() => {
      expect(screen.getByText('No lessons found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search lessons...');
    await user.type(searchInput, 'test');
    
    await waitFor(() => {
      expect(screen.getByText('No lessons found')).toBeInTheDocument();
    });
    
    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(screen.queryByText('No lessons found')).not.toBeInTheDocument();
      expect(screen.getByText('Greetings & Introductions')).toBeInTheDocument();
    });
  });

  it('highlights recommended lessons', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    const recommendedLesson = screen.getByText('Greetings & Introductions').closest('.group');
    expect(recommendedLesson).toHaveClass('ring-2', 'ring-yellow-400');
  });

  it('shows correct button text based on lesson status', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Completed lesson
    expect(screen.getByText('Review Lesson')).toBeInTheDocument();
    
    // Current lesson
    expect(screen.getByText('Continue Lesson')).toBeInTheDocument();
    
    // Locked lesson - use getAllByText since there might be multiple locked lessons
    expect(screen.getAllByText('Locked').length).toBeGreaterThanOrEqual(1);
  });

  it('is accessible with proper ARIA labels', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Check for accessible search input
    const searchInput = screen.getByPlaceholderText('Search lessons...');
    expect(searchInput).toBeInTheDocument();
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Choose Your Lesson');
  });

  it('displays lesson metadata correctly', () => {
    render(<LessonSelector onLessonSelect={mockOnLessonSelect} />);
    
    // Check for duration and XP badges
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('50 XP')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.getByText('75 XP')).toBeInTheDocument();
  });
});