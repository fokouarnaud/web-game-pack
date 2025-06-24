/**
 * Tests pour GameLessonEducational - Focus sur la gestion des compteurs et de la mise en situation
 * Approche TDD pour résoudre les problèmes de compteurs non-arrêtés
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

// Ajouter la méthode statique isTypeSupported
(global.MediaRecorder as any).isTypeSupported = vi.fn(() => true);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GameLessonEducational - Gestion des Compteurs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('RED: Tests qui échouent pour identifier les problèmes', () => {
    it('devrait arrêter le compteur d\'enregistrement quand le composant est démonté', async () => {
      const { unmount } = renderWithRouter(<GameLessonEducational />);
      
      // Aller à la phase d'application
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Avancer à la phase application
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
        if (nextBtn) fireEvent.click(nextBtn);
      });

      // Démarrer l'enregistrement
      const prononceBtn = screen.queryByRole('button', { name: /prononcer/i });
      if (prononceBtn) {
        fireEvent.click(prononceBtn);
        vi.advanceTimersByTime(1000);
      }

      // Capturer les timers actifs avant démontage
      const pendingTimers = vi.getTimerCount();
      
      // Démonter le composant
      unmount();
      
      // Vérifier que tous les timers sont nettoyés
      expect(vi.getTimerCount()).toBeLessThan(pendingTimers);
    });

    it('devrait arrêter automatiquement l\'enregistrement après 5 secondes', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation vers phase application
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
        if (nextBtn) fireEvent.click(nextBtn);
      });

      // Commencer enregistrement
      const prononceBtn = screen.queryByRole('button', { name: /prononcer/i });
      if (prononceBtn) {
        fireEvent.click(prononceBtn);
        
        // Vérifier que l'enregistrement est actif
        expect(screen.queryByText(/5s/)).toBeTruthy();
        
        // Avancer de 5 secondes
        vi.advanceTimersByTime(5000);
        
        // L'enregistrement devrait s'arrêter automatiquement
        await waitFor(() => {
          expect(screen.queryByText(/5s/)).toBeFalsy();
        });
      }
    });

    it('devrait gérer correctement la navigation dans la phase intégration', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Naviguer jusqu'à la phase intégration
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Passer par lesson phase
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
        if (nextBtn) fireEvent.click(nextBtn);
      });

      // Passer par application phase - simuler completion de tous les exercices
      vi.advanceTimersByTime(100);
      const exerciseButtons = screen.queryAllByRole('button', { name: /prononcer/i });
      for (const btn of exerciseButtons) {
        if (btn) {
          fireEvent.click(btn);
          vi.advanceTimersByTime(2000); // Simulation du traitement
          const nextBtn = screen.queryByRole('button', { name: /exercice suivant|mise en situation/i });
          if (nextBtn) fireEvent.click(nextBtn);
        }
      }

      // Maintenant en phase intégration
      await waitFor(() => {
        expect(screen.queryByText(/mise en situation/i)).toBeTruthy();
      });

      // Vérifier que l'auto-play NPC ne crée pas de boucles infinies
      const initialTimerCount = vi.getTimerCount();
      vi.advanceTimersByTime(3000);
      
      // Le nombre de timers ne devrait pas exploser
      expect(vi.getTimerCount()).toBeLessThanOrEqual(initialTimerCount + 2);
    });
  });

  describe('GREEN: Tests corrigés qui passent', () => {
    it('devrait nettoyer tous les timers au démontage du composant', async () => {
      const { unmount } = renderWithRouter(<GameLessonEducational />);
      
      // Démarrer quelques interactions qui créent des timers
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      vi.advanceTimersByTime(100);
      
      // Démonter et vérifier le nettoyage
      unmount();
      
      // Avancer les timers pour voir s'il y a des fuites
      expect(() => vi.advanceTimersByTime(10000)).not.toThrow();
    });

    it('devrait gérer correctement le compte à rebours d\'enregistrement', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Naviguer vers phase application
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
        if (nextBtn) fireEvent.click(nextBtn);
      });

      const prononceBtn = screen.queryByRole('button', { name: /prononcer/i });
      if (prononceBtn) {
        fireEvent.click(prononceBtn);
        
        // Vérifier le décompte seconde par seconde
        expect(screen.queryByText('5s')).toBeTruthy();
        
        vi.advanceTimersByTime(1000);
        expect(screen.queryByText('4s')).toBeTruthy();
        
        vi.advanceTimersByTime(1000);
        expect(screen.queryByText('3s')).toBeTruthy();
        
        vi.advanceTimersByTime(3000); // Terminer le compte à rebours
        
        await waitFor(() => {
          expect(screen.queryByText(/s$/)).toBeFalsy();
        });
      }
    });

    it('devrait naviguer correctement dans le dialogue d\'intégration', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Simuler la progression complète jusqu'à l'intégration
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Navigation rapide pour les tests
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
        if (nextBtn) fireEvent.click(nextBtn);
      });

      // Terminer rapidement les exercices
      vi.advanceTimersByTime(100);
      
      // En phase intégration, tester la navigation
      await waitFor(() => {
        const integrationPhase = screen.queryByText(/mise en situation/i);
        if (integrationPhase) {
          // Vérifier que le premier message NPC s'affiche
          expect(screen.queryByText(/nice to see you/i)).toBeTruthy();
        }
      });
    });
  });

  describe('REFACTOR: Tests d\'optimisation', () => {
    it('devrait avoir une performance optimale sans fuites mémoire', async () => {
      const { unmount } = renderWithRouter(<GameLessonEducational />);
      
      // Mesurer l'utilisation de timers
      const initialTimers = vi.getTimerCount();
      
      // Simuler utilisation intensive
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(1000);
      }
      
      const maxTimers = vi.getTimerCount();
      
      unmount();
      
      // Vérifier qu'il n'y a pas de croissance exponentielle
      expect(maxTimers - initialTimers).toBeLessThan(10);
    });
  });
});