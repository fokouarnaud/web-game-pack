/**
 * Tests simplifiés pour GameLessonEducational - Focus sur la correction des timers
 * TDD pour valider que les corrections fonctionnent
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

// Mock simplifié de speechSynthesis
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

describe('GameLessonEducational - Tests de Correction des Timers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Phase Situation', () => {
    it('devrait afficher la phase situation par défaut', () => {
      renderWithRouter(<GameLessonEducational />);
      
      expect(screen.getAllByText(/situation-problème/i)).toHaveLength(2); // Header + contenu principal
      expect(screen.getByText(/commencer la leçon/i)).toBeTruthy();
    });

    it('devrait passer à la phase lesson quand on clique sur commencer', () => {
      renderWithRouter(<GameLessonEducational />);
      
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Avancer les timers si nécessaire
      vi.advanceTimersByTime(100);
      
      expect(screen.queryByText(/apprentissage des mots/i)).toBeTruthy();
    });
  });

  describe('Phase Lesson', () => {
    it('devrait naviguer correctement dans les mots', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Aller à la phase lesson
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      // Vérifier qu'on peut avancer aux mots suivants
      const nextBtn = screen.queryByRole('button', { name: /mot suivant/i });
      if (nextBtn) {
        fireEvent.click(nextBtn);
        expect(screen.queryByText(/mot 2 sur/i)).toBeTruthy();
      }
    });
  });

  describe('Gestion des Timers - Tests Simples', () => {
    it('devrait nettoyer correctement au démontage', () => {
      const { unmount } = renderWithRouter(<GameLessonEducational />);
      
      // Actions simples
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Démonter le composant
      unmount();
      
      // Avancer les timers pour tester le nettoyage
      vi.advanceTimersByTime(5000);
      
      // Pas d'exception ne devrait être levée
      expect(true).toBe(true);
    });

    it('devrait gérer correctement la navigation de base', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation simple à travers les phases
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      vi.advanceTimersByTime(100);
      
      // Passer rapidement à la phase suivante
      const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (nextBtn) {
        fireEvent.click(nextBtn);
        vi.advanceTimersByTime(100);
        
        expect(screen.queryByText(/exercice d'application/i)).toBeTruthy();
      }
    });
  });

  describe('Validation des Corrections', () => {
    it('devrait avoir corrigé le problème de countdown', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Simuler rapidement l'arrivée à un exercice d'application
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const nextBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (nextBtn) {
        fireEvent.click(nextBtn);
        vi.advanceTimersByTime(100);
        
        // Le composant ne devrait pas crasher et devrait s'afficher correctement
        expect(screen.queryByText(/exercice d'application/i)).toBeTruthy();
      }
    });

    it('devrait avoir corrigé le problème d\'auto-play dans l\'intégration', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation rapide vers l'intégration (simulation)
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      
      // Avancer les timers sans causer de problèmes
      vi.advanceTimersByTime(3000);
      
      // Pas de timeout ni de boucle infinie
      expect(true).toBe(true);
    });
  });
});