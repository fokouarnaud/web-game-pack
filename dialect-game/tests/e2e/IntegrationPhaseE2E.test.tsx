/**
 * Test E2E pour la Phase d'Intégration (Mise en Situation)
 * Simule le parcours complet : Hello → Thank you → Goodbye
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GameLessonEducational from '../../src/components/GameLessonEducational';

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

// Mock speechSynthesis avec tracking des appels
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

// Mock de getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }]
    }))
  }
});

// Mock de MediaRecorder avec simulation complète
const mockStart = vi.fn();
const mockStop = vi.fn();
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: mockStart,
  stop: mockStop,
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

describe('GameLessonEducational - E2E Integration Phase Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should complete full dialogue flow: Hello → Thank you → Goodbye', async () => {
    const { container } = renderWithRouter(<GameLessonEducational />);
    
    // =========================
    // PHASE 1: Navigation vers mise en situation
    // =========================
    
    // Partir de la situation et naviguer jusqu'à l'intégration
    console.log('🚀 Phase 1: Navigation vers mise en situation');
    
    // Cliquer sur "Commencer la leçon" (situation → lesson)
    const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
    fireEvent.click(commencerBtn);
    vi.advanceTimersByTime(500);
    
    // Traverser la phase lesson (3 mots)
    for (let i = 0; i < 3; i++) {
      const nextBtn = screen.queryByRole('button', { name: /mot suivant|pratiquer/i });
      if (nextBtn) {
        fireEvent.click(nextBtn);
        vi.advanceTimersByTime(200);
      }
    }
    
    // Traverser la phase application (3 exercices - simulation rapide)
    for (let i = 0; i < 3; i++) {
      // Simuler enregistrement + résultat
      const prononcerBtn = screen.queryByRole('button', { name: /prononcer/i });
      if (prononcerBtn) {
        fireEvent.click(prononcerBtn);
        vi.advanceTimersByTime(100);
        
        // Simuler fin d'enregistrement
        const stopBtn = screen.queryByRole('button', { name: /arrêter/i });
        if (stopBtn) {
          fireEvent.click(stopBtn);
          vi.advanceTimersByTime(2000); // Temps de traitement
          
          // Cliquer sur suivant après le résultat
          const nextBtn = screen.queryByRole('button', { name: /exercice suivant|mise en situation/i });
          if (nextBtn) {
            fireEvent.click(nextBtn);
            vi.advanceTimersByTime(200);
          }
        }
      }
    }
    
    // =========================
    // PHASE 2: Vérification arrivée en mise en situation
    // =========================
    
    console.log('🎯 Phase 2: Vérification arrivée en mise en situation');
    
    await waitFor(() => {
      expect(screen.queryByText('Mise en Situation')).toBeTruthy();
    }, { timeout: 3000 });
    
    // Vérifier que nous sommes bien à 4/4 (100%)
    expect(screen.queryByText('4/4')).toBeTruthy();
    expect(screen.queryByText('100%')).toBeTruthy();
    
    // Vérifier le scénario
    expect(screen.queryByText(/voisin anglophone dans la rue/i)).toBeTruthy();
    
    // =========================
    // PHASE 3: Dialogue E2E - Étape 1 "Hello"
    // =========================
    
    console.log('💬 Phase 3: Dialogue E2E - Étape 1 Hello');
    
    // Le NPC devrait avoir dit automatiquement: "Hi there! Nice to see you!"
    await waitFor(() => {
      expect(screen.queryByText(/Hi there! Nice to see you!/i)).toBeTruthy();
    }, { timeout: 2000 });
    
    // L'utilisateur doit dire "Hello"
    await waitFor(() => {
      expect(screen.queryByText(/À vous de dire/i)).toBeTruthy();
      expect(screen.queryByText('Hello')).toBeTruthy();
    }, { timeout: 1000 });
    
    // Simuler l'enregistrement de "Hello"
    const ecouterHelloBtn = screen.getByRole('button', { name: /écouter/i });
    fireEvent.click(ecouterHelloBtn);
    vi.advanceTimersByTime(100);
    
    const repondreHelloBtn = screen.getByRole('button', { name: /répondre/i });
    fireEvent.click(repondreHelloBtn);
    vi.advanceTimersByTime(100);
    
    // Simuler fin d'enregistrement "Hello"
    const stopHelloBtn = screen.getByRole('button', { name: /arrêter/i });
    fireEvent.click(stopHelloBtn);
    vi.advanceTimersByTime(2000); // Traitement
    
    // Cliquer continuer après "Hello"
    const continuerHelloBtn = await screen.findByRole('button', { name: /continuer/i });
    fireEvent.click(continuerHelloBtn);
    vi.advanceTimersByTime(500);
    
    // =========================
    // PHASE 4: Dialogue E2E - Étape 2 "Thank you"
    // =========================
    
    console.log('🙏 Phase 4: Dialogue E2E - Étape 2 Thank you');
    
    // Le NPC devrait maintenant dire: "I hope that advice I gave you yesterday was helpful."
    await waitFor(() => {
      expect(screen.queryByText(/I hope that advice I gave you yesterday was helpful/i)).toBeTruthy();
    }, { timeout: 2000 });
    
    // Vérifier que l'auto-play du NPC fonctionne
    expect(mockSpeak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "I hope that advice I gave you yesterday was helpful."
      })
    );
    
    // L'utilisateur doit maintenant dire "Thank you" - ÉTAPE CRITIQUE
    await waitFor(() => {
      expect(screen.queryByText(/À vous de dire/i)).toBeTruthy();
      expect(screen.queryByText('Thank you')).toBeTruthy();
      expect(screen.queryByText('Merci')).toBeTruthy();
    }, { timeout: 1000 });
    
    // Simuler l'enregistrement de "Thank you"
    const ecouterThankBtn = screen.getByRole('button', { name: /écouter/i });
    fireEvent.click(ecouterThankBtn);
    vi.advanceTimersByTime(100);
    
    const repondreThankBtn = screen.getByRole('button', { name: /répondre/i });
    fireEvent.click(repondreThankBtn);
    vi.advanceTimersByTime(100);
    
    // Vérifier l'interface d'enregistrement
    expect(screen.queryByText(/\d+s/)).toBeTruthy(); // Compteur temps
    
    const stopThankBtn = screen.getByRole('button', { name: /arrêter/i });
    fireEvent.click(stopThankBtn);
    vi.advanceTimersByTime(2000); // Traitement
    
    // Vérifier le résultat et continuer
    const continuerThankBtn = await screen.findByRole('button', { name: /continuer/i });
    fireEvent.click(continuerThankBtn);
    vi.advanceTimersByTime(500);
    
    // =========================
    // PHASE 5: Dialogue E2E - Étape 3 "Goodbye"
    // =========================
    
    console.log('👋 Phase 5: Dialogue E2E - Étape 3 Goodbye');
    
    // Le NPC devrait dire: "Great! Well, I have to run. Take care!"
    await waitFor(() => {
      expect(screen.queryByText(/Great! Well, I have to run. Take care!/i)).toBeTruthy();
    }, { timeout: 2000 });
    
    // L'utilisateur doit dire "Goodbye"
    await waitFor(() => {
      expect(screen.queryByText(/À vous de dire/i)).toBeTruthy();
      expect(screen.queryByText('Goodbye')).toBeTruthy();
      expect(screen.queryByText('Au revoir')).toBeTruthy();
    }, { timeout: 1000 });
    
    // Simuler l'enregistrement de "Goodbye"
    const repondreGoodbyeBtn = screen.getByRole('button', { name: /répondre/i });
    fireEvent.click(repondreGoodbyeBtn);
    vi.advanceTimersByTime(100);
    
    const stopGoodbyeBtn = screen.getByRole('button', { name: /arrêter/i });
    fireEvent.click(stopGoodbyeBtn);
    vi.advanceTimersByTime(2000); // Traitement
    
    // =========================
    // PHASE 6: Fin de leçon
    // =========================
    
    console.log('🎉 Phase 6: Fin de leçon');
    
    // Après "Goodbye", la leçon devrait se terminer
    // Vérifier que navigate est appelé avec les bons paramètres
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/lesson-complete-educational')
      );
    }, { timeout: 2000 });
    
    console.log('✅ Test E2E complet réussi !');
  }, 60000); // Timeout de 60 secondes pour le test complet

  it('should maintain correct counter throughout integration phase', async () => {
    renderWithRouter(<GameLessonEducational />);
    
    // Navigation rapide vers intégration
    const commencerBtn = screen.getByRole('button', { name: /commencer la leçon/i });
    fireEvent.click(commencerBtn);
    
    // Simulation rapide des phases précédentes
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(100);
      const nextBtns = screen.queryAllByRole('button', { name: /suivant|pratiquer|situation/i });
      if (nextBtns.length > 0) {
        fireEvent.click(nextBtns[0]);
      }
    }
    
    // Vérifier que le compteur reste stable à 4/4 en intégration
    await waitFor(() => {
      const progressElements = screen.queryAllByText(/4\/4/);
      expect(progressElements.length).toBeGreaterThan(0);
      
      // S'assurer qu'on n'a JAMAIS 5/4
      expect(screen.queryByText('5/4')).toBeFalsy();
      expect(screen.queryByText('125%')).toBeFalsy();
    }, { timeout: 3000 });
  });
});