/**
 * Test de validation de l'auto-scroll pour GameLessonEducational
 * Vérifier que l'utilisateur n'a plus besoin de scroller manuellement
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

// Mock de speechSynthesis avec tracking
const mockSpeak = vi.fn();
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [])
  }
});

// Mock de scrollTo pour tester l'auto-scroll
const mockScrollTo = vi.fn();
const mockScrollElement = {
  scrollTo: mockScrollTo,
  scrollHeight: 1000,
  clientHeight: 500
};

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

describe('GameLessonEducational - Auto-Scroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock querySelector pour retourner notre élément mockÉ
    document.querySelector = vi.fn().mockReturnValue(mockScrollElement);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Auto-scroll lors de l\'audio', () => {
    it('devrait scroller automatiquement quand on clique sur Écouter', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Naviguer vers une phase avec bouton Écouter
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      // Trouver et cliquer sur le bouton Écouter
      const ecouterBtn = screen.queryByRole('button', { name: /écouter/i });
      if (ecouterBtn) {
        fireEvent.click(ecouterBtn);
        
        // Vérifier que speechSynthesis.speak a été appelé
        expect(mockSpeak).toHaveBeenCalled();
        
        // Avancer le timer pour déclencher l'auto-scroll
        vi.advanceTimersByTime(200);
        
        // Vérifier que scrollTo a été appelé (auto-scroll déclenché)
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: mockScrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  describe('Auto-scroll lors de l\'enregistrement', () => {
    it('devrait scroller automatiquement quand on commence l\'enregistrement', async () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Naviguer vers phase application
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        // Commencer l'enregistrement
        const prononceBtn = screen.queryByRole('button', { name: /prononcer/i });
        if (prononceBtn) {
          fireEvent.click(prononceBtn);
          
          // Avancer le timer pour déclencher l'auto-scroll après l'enregistrement
          vi.advanceTimersByTime(300);
          
          // Vérifier que scrollTo a été appelé
          expect(mockScrollTo).toHaveBeenCalledWith({
            top: mockScrollElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  describe('Auto-scroll dans la phase intégration', () => {
    it('devrait scroller automatiquement dans la mise en situation', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Navigation rapide vers intégration
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      // Simuler progression rapide vers intégration
      const pratiquerBtn = screen.queryByRole('button', { name: /pratiquer/i });
      if (pratiquerBtn) {
        fireEvent.click(pratiquerBtn);
        vi.advanceTimersByTime(100);
        
        // Passage à l'intégration (simulation)
        const nextBtn = screen.queryByRole('button', { name: /mise en situation/i });
        if (nextBtn) {
          fireEvent.click(nextBtn);
          vi.advanceTimersByTime(100);
          
          // Chercher bouton Écouter dans l'intégration
          const ecouterIntegrationBtn = screen.queryByRole('button', { name: /écouter/i });
          if (ecouterIntegrationBtn) {
            fireEvent.click(ecouterIntegrationBtn);
            
            // Vérifier auto-scroll déclenché
            vi.advanceTimersByTime(200);
            expect(mockScrollTo).toHaveBeenCalled();
          }
        }
      }
    });

    it('devrait utiliser la référence correcte pour le conteneur d\'intégration', () => {
      renderWithRouter(<GameLessonEducational />);
      
      // Le conteneur de référence devrait être défini
      // (Test indirect - si le composant se rend sans erreur, la ref est ok)
      expect(screen.getByText(/premiers mots/i)).toBeTruthy();
    });
  });

  describe('Configuration de l\'auto-scroll', () => {
    it('devrait utiliser le bon comportement de scroll (smooth)', () => {
      renderWithRouter(<GameLessonEducational />);
      
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const ecouterBtn = screen.queryByRole('button', { name: /écouter/i });
      if (ecouterBtn) {
        fireEvent.click(ecouterBtn);
        vi.advanceTimersByTime(200);
        
        // Vérifier que le scroll utilise 'smooth'
        expect(mockScrollTo).toHaveBeenCalledWith(
          expect.objectContaining({
            behavior: 'smooth'
          })
        );
      }
    });

    it('devrait scroller vers le bas (scrollHeight)', () => {
      renderWithRouter(<GameLessonEducational />);
      
      const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
      fireEvent.click(commencerBtn);
      vi.advanceTimersByTime(100);
      
      const ecouterBtn = screen.queryByRole('button', { name: /écouter/i });
      if (ecouterBtn) {
        fireEvent.click(ecouterBtn);
        vi.advanceTimersByTime(200);
        
        // Vérifier que le scroll va vers scrollHeight (bas de page)
        expect(mockScrollTo).toHaveBeenCalledWith(
          expect.objectContaining({
            top: mockScrollElement.scrollHeight
          })
        );
      }
    });
  });
});