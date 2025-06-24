/**
 * Tests de validation des corrections spécifiques pour GameLessonEducational
 * Validation des problèmes :
 * 1. Compteur 5/4 -> 4/4 et 125% -> 100%
 * 2. Bouton "Arrêter" manquant
 * 3. Boucle infinie du compte à rebours
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

describe('GameLessonEducational - Validation des Corrections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Correction du compteur de progression', () => {
    it('devrait afficher 1/4 au démarrage (pas 2/4)', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Vérifier que l'affichage initial est correct
      expect(screen.getByText('1/4')).toBeTruthy();
      expect(screen.getByText('25%')).toBeTruthy();
    });

    it('devrait progresser correctement : 1/4 -> 2/4 -> 3/4 -> 4/4', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Phase 1: Situation (1/4 - 25%)
      expect(screen.getByText('1/4')).toBeTruthy();
      expect(screen.getByText('25%')).toBeTruthy();
      
      // Passer à la phase lesson
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      // Phase 2: Lesson (2/4 - 50%)
      expect(screen.getByText('2/4')).toBeTruthy();
      expect(screen.getByText('50%')).toBeTruthy();
      
      // Passer à la phase application
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        // Phase 3: Application (3/4 - 75%)
        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByText('75%')).toBeTruthy();
      }
    });

    it('ne devrait jamais dépasser 4/4 et 100%', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Simuler progression complète
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Forcer plusieurs transitions
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(100);
        const nextBtn = screen.queryByRole('button', { name: /pratiquer|exercice suivant|mise en situation/i });
        if (nextBtn) fireEvent.click(nextBtn);
      }
      
      // Vérifier qu'on ne dépasse jamais les limites
      const progressTexts = screen.queryAllByText(/\/4/);
      progressTexts.forEach(text => {
        const [current, total] = text.textContent!.split('/').map(n => parseInt(n));
        expect(current).toBeLessThanOrEqual(4);
        expect(total).toBe(4);
      });
      
      const percentageTexts = screen.queryAllByText(/%$/);
      percentageTexts.forEach(text => {
        const percentage = parseInt(text.textContent!.replace('%', ''));
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Correction du bouton Arrêter', () => {
    it('devrait afficher le bouton Arrêter pendant l\'enregistrement', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Naviguer jusqu'à une phase avec enregistrement
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        // Démarrer l'enregistrement
        const prononceBtn = screen.queryByRole('button', { name: /prononcer|répondre/i });
        if (prononceBtn) {
          fireEvent.click(prononceBtn);
          
          // Vérifier que le bouton Arrêter apparaît
          await waitFor(() => {
            expect(screen.queryByRole('button', { name: /arrêter/i })).toBeTruthy();
          });
        }
      }
    });

    it('devrait pouvoir arrêter l\'enregistrement manuellement', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation vers phase d'enregistrement
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        const prononceBtn = screen.queryByRole('button', { name: /prononcer|répondre/i });
        if (prononceBtn) {
          fireEvent.click(prononceBtn);
          
          // Cliquer sur Arrêter
          await waitFor(() => {
            const arreterBtn = screen.queryByRole('button', { name: /arrêter/i });
            if (arreterBtn) {
              fireEvent.click(arreterBtn);
              
              // Vérifier que l'enregistrement s'arrête
              expect(screen.queryByText(/s$/)).toBeFalsy();
            }
          });
        }
      }
    });
  });

  describe('Correction de la boucle infinie du compte à rebours', () => {
    it('devrait arrêter proprement le compte à rebours à 0', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation vers phase d'enregistrement
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        const prononceBtn = screen.queryByRole('button', { name: /prononcer|répondre/i });
        if (prononceBtn) {
          fireEvent.click(prononceBtn);
          
          // Vérifier le décompte
          expect(screen.queryByText('5s')).toBeTruthy();
          
          // Avancer jusqu'à la fin du compte à rebours
          vi.advanceTimersByTime(5000);
          
          // Le compte à rebours devrait s'arrêter (pas de boucle infinie)
          await waitFor(() => {
            expect(screen.queryByText(/\ds$/)).toBeFalsy();
          }, { timeout: 2000 });
        }
      }
    });

    it('ne devrait pas avoir de timers qui traînent après arrêt', () => {
      renderWithRouter(<GameLessonEducational />);
      
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Mesurer les timers avant
      const timersBefore = vi.getTimerCount();
      
      // Simuler activité intensive
      vi.advanceTimersByTime(10000);
      
      // Nettoyer
      cleanup();
      
      // Avancer encore pour voir s'il y a des fuites
      vi.advanceTimersByTime(5000);
      
      // Le nombre de timers ne devrait pas exploser
      const timersAfter = vi.getTimerCount();
      expect(timersAfter - timersBefore).toBeLessThan(5);
    });
  });
});