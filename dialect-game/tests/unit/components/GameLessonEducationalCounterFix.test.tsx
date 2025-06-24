/**
 * Test spécifique pour le bug du compteur 5/4 dans GameLessonEducational
 * Isoler et corriger le problème de progression
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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

// Mock de speechSynthesis
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

// Mock de getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }]
    }))
  }
});

// Mock de MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null
})) as any;

(global.MediaRecorder as any).isTypeSupported = vi.fn(() => true);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GameLessonEducational - Counter Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Counter Progression Logic', () => {
    it('should start with 1/4 (25%) in situation phase', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Vérifier l'état initial
      expect(screen.getByText('1/4')).toBeTruthy();
      expect(screen.getByText('25%')).toBeTruthy();
    });

    it('should progress to 2/4 (50%) when entering lesson phase', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Cliquer sur "Commencer la leçon"
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Attendre que l'état se mette à jour
      vi.advanceTimersByTime(100);
      
      // Vérifier la progression
      expect(screen.getByText('2/4')).toBeTruthy();
      expect(screen.getByText('50%')).toBeTruthy();
    });

    it('should progress through all phases without exceeding 4/4', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Phase 1: Situation -> Lesson
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      expect(screen.getByText('2/4')).toBeTruthy();
      
      // Phase 2: Lesson -> Application (simuler fin de tous les mots)
      for (let i = 0; i < 3; i++) { // 3 mots dans la leçon
        const nextBtn = screen.queryByRole('button', { name: /mot suivant|pratiquer/i });
        if (nextBtn) {
          fireEvent.click(nextBtn);
          vi.advanceTimersByTime(100);
        }
      }
      
      // Vérifier qu'on est en phase application (3/4)
      await waitFor(() => {
        expect(screen.queryByText('3/4')).toBeTruthy();
        expect(screen.queryByText('75%')).toBeTruthy();
      }, { timeout: 2000 });
      
      // Phase 3: Application -> Integration
      // Simuler completion de tous les exercices
      for (let i = 0; i < 3; i++) { // 3 exercices dans l'application
        const exerciceBtn = screen.queryByRole('button', { name: /exercice suivant|mise en situation/i });
        if (exerciceBtn) {
          fireEvent.click(exerciceBtn);
          vi.advanceTimersByTime(100);
        }
      }
      
      // Vérifier qu'on est en phase intégration (4/4) et PAS 5/4
      await waitFor(() => {
        expect(screen.queryByText('4/4')).toBeTruthy();
        expect(screen.queryByText('100%')).toBeTruthy();
        
        // S'assurer qu'on n'a PAS 5/4 ou 125%
        expect(screen.queryByText('5/4')).toBeFalsy();
        expect(screen.queryByText('125%')).toBeFalsy();
      }, { timeout: 2000 });
    });

    it('should never exceed totalSteps (4)', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation rapide vers la fin
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Forcer plusieurs clics pour tester les limites
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(100);
        const nextBtns = screen.queryAllByRole('button', { name: /suivant|pratiquer|situation|continuer/i });
        nextBtns.forEach(btn => {
          if (btn && btn.textContent) {
            fireEvent.click(btn);
          }
        });
      }
      
      // Vérifier qu'on ne dépasse jamais 4/4
      const progressTexts = screen.queryAllByText(/\/4$/);
      progressTexts.forEach(element => {
        const text = element.textContent || '';
        const match = text.match(/(\d+)\/4/);
        if (match) {
          const currentStep = parseInt(match[1]);
          expect(currentStep).toBeLessThanOrEqual(4);
          expect(currentStep).toBeGreaterThan(0);
        }
      });
      
      // Vérifier qu'on ne dépasse jamais 100%
      const percentageTexts = screen.queryAllByText(/%$/);
      percentageTexts.forEach(element => {
        const text = element.textContent || '';
        const match = text.match(/(\d+)%/);
        if (match) {
          const percentage = parseInt(match[1]);
          expect(percentage).toBeLessThanOrEqual(100);
          expect(percentage).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Phase Transition Logic', () => {
    it('should correctly track currentStep during phase transitions', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Mock console.log pour tracker les transitions
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Déclencher transition
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      // Vérifier que la transition a été logged correctement
      expect(logSpy).toHaveBeenCalledWith('Commencer la leçon clicked - current phase:', 'situation');
      
      logSpy.mockRestore();
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency across re-renders', () => {
      const { rerender } = renderWithRouter(<GameLessonEducational />);
      
      // Vérifier état initial
      expect(screen.getByText('1/4')).toBeTruthy();
      
      // Re-render et vérifier que l'état persiste
      rerender(
        <BrowserRouter>
          <GameLessonEducational />
        </BrowserRouter>
      );
      
      expect(screen.getByText('1/4')).toBeTruthy();
      expect(screen.getByText('25%')).toBeTruthy();
    });
  });
});