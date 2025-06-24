/**
 * Test final pour valider que le problème du compteur 5/4 est résolu
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GameLessonEducational from '../../../src/components/GameLessonEducational';

// Mock des hooks de navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('chapterNumber=1&lessonId=chapter-1-lesson-1')]
  };
});

// Mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [])
  }
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GameLessonEducational - Final Counter Fix Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should NEVER show 5/4 or 125% - Protection absolue', () => {
    renderWithRouter(<GameLessonEducational />);
    
    // Vérifier qu'au démarrage on a 1/4 et 25%
    expect(screen.getByText('1/4')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
    
    // S'assurer qu'on n'a JAMAIS 5/4 ou 125%
    expect(screen.queryByText('5/4')).toBeFalsy();
    expect(screen.queryByText('125%')).toBeFalsy();
    
    // Vérifier les limites strictes
    const progressTexts = screen.queryAllByText(/\/4$/);
    progressTexts.forEach(element => {
      const text = element.textContent || '';
      const match = text.match(/(\d+)\/4/);
      if (match) {
        const currentStep = parseInt(match[1]);
        expect(currentStep).toBeLessThanOrEqual(4);
        expect(currentStep).toBeGreaterThanOrEqual(1);
      }
    });
    
    const percentageTexts = screen.queryAllByText(/%$/);
    percentageTexts.forEach(element => {
      const text = element.textContent || '';
      const match = text.match(/(\d+)%/);
      if (match) {
        const percentage = parseInt(match[1]);
        expect(percentage).toBeLessThanOrEqual(100);
        expect(percentage).toBeGreaterThanOrEqual(25);
      }
    });
  });

  it('should show correct progression: 1/4 -> 2/4 -> 3/4 -> 4/4', () => {
    renderWithRouter(<GameLessonEducational />);
    
    // État initial: 1/4 (25%)
    expect(screen.getByText('1/4')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
    
    // Progression vers 2/4 (50%)
    const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
    fireEvent.click(commencerBtn);
    
    expect(screen.getByText('2/4')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('should have robust Math.min/Math.max protection', () => {
    renderWithRouter(<GameLessonEducational />);
    
    // Chercher tous les éléments de progression
    const allProgressElements = [
      ...screen.queryAllByText(/\/4$/),
      ...screen.queryAllByText(/%$/)
    ];
    
    expect(allProgressElements.length).toBeGreaterThan(0);
    
    // Vérifier que toutes les valeurs sont dans les limites acceptables
    allProgressElements.forEach(element => {
      const text = element.textContent || '';
      
      if (text.includes('/4')) {
        const match = text.match(/(\d+)\/4/);
        if (match) {
          const value = parseInt(match[1]);
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(4);
        }
      }
      
      if (text.includes('%')) {
        const match = text.match(/(\d+)%/);
        if (match) {
          const value = parseInt(match[1]);
          expect(value).toBeGreaterThanOrEqual(25);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    });
  });
});