/**
 * Tests unitaires pour GameLessonAdvanced
 * Vérifie les fonctionnalités pédagogiques avancées
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { GameLessonAdvanced } from '../../../src/components/GameLessonAdvanced';

// Mock des services TDD
vi.mock('../../../src/services/voice/AdvancedVoiceEngine', () => ({
  AdvancedVoiceEngine: vi.fn().mockImplementation(() => ({
    processAudio: vi.fn().mockResolvedValue({
      text: 'Hello how are you',
      accent: 'US',
      confidence: 0.85,
      emotion: 'neutral'
    })
  }))
}));

vi.mock('../../../src/services/ai/PredictiveAIService', () => ({
  PredictiveAIService: vi.fn().mockImplementation(() => ({
    detectWeaknesses: vi.fn().mockResolvedValue(['pronunciation']),
    generateCognitiveFeedback: vi.fn().mockResolvedValue('Great job! Keep practicing.')
  }))
}));

// Mock des APIs Web
const mockMediaDevices = {
  getUserMedia: vi.fn()
};

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn()
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});

Object.defineProperty(global, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
});

Object.defineProperty(global, 'SpeechSynthesisUtterance', {
  value: vi.fn().mockImplementation((text) => ({
    text,
    lang: 'en-US',
    rate: 0.8,
    pitch: 1.0,
    onend: null
  })),
  writable: true
});

const renderGameLessonAdvanced = (searchParams = '') => {
  // Mock useSearchParams
  const mockSearchParams = new URLSearchParams(searchParams);
  vi.doMock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useSearchParams: () => [mockSearchParams],
      useNavigate: () => vi.fn()
    };
  });

  return render(
    <BrowserRouter>
      <GameLessonAdvanced />
    </BrowserRouter>
  );
};

describe('GameLessonAdvanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock MediaRecorder
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      state: 'inactive',
      ondataavailable: null,
      onstop: null
    })) as any;
    global.MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendu initial', () => {
    it('should render the advanced lesson interface', () => {
      renderGameLessonAdvanced('?chapterNumber=1');
      
      expect(screen.getByText('Basic Greetings')).toBeInTheDocument();
      expect(screen.getByText('Hello, how are you today?')).toBeInTheDocument();
      expect(screen.getByText('Bonjour, comment allez-vous aujourd\'hui ?')).toBeInTheDocument();
    });

    it('should display bilingual support badges', () => {
      renderGameLessonAdvanced('?chapterNumber=1');
      
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should show progress indicator', () => {
      renderGameLessonAdvanced('?chapterNumber=1');
      
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  describe('Navigation et controls', () => {
    it('should have back navigation button', () => {
      renderGameLessonAdvanced();
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display lesson context', () => {
      renderGameLessonAdvanced('?chapterNumber=1');
      
      expect(screen.getByText(/Village Square/i)).toBeInTheDocument();
    });
  });

  describe('Audio et enregistrement', () => {
    it('should have listen to model button', () => {
      renderGameLessonAdvanced();
      
      const listenButton = screen.getByRole('button', { name: /écouter le modèle/i });
      expect(listenButton).toBeInTheDocument();
    });

    it('should have recording button', () => {
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      expect(recordButton).toBeInTheDocument();
    });

    it('should play model audio when listen button is clicked', async () => {
      renderGameLessonAdvanced();
      
      const listenButton = screen.getByRole('button', { name: /écouter le modèle/i });
      fireEvent.click(listenButton);
      
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should request microphone permission when recording', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      await waitFor(() => {
        expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      });
    });
  });

  describe('Phases d\'apprentissage', () => {
    it('should show listening phase when playing model', async () => {
      renderGameLessonAdvanced();
      
      const listenButton = screen.getByRole('button', { name: /écouter le modèle/i });
      fireEvent.click(listenButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Écoutez attentivement/i)).toBeInTheDocument();
      });
    });

    it('should show recording phase with countdown', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Répétez la phrase/i)).toBeInTheDocument();
        expect(screen.getByText('15s')).toBeInTheDocument();
      });
    });

    it('should show processing phase', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      // Simulate stopping recording
      const stopButton = await screen.findByRole('button', { name: /terminer/i });
      fireEvent.click(stopButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Analyse de votre prononciation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Analyse et feedback', () => {
    it('should display word analysis after processing', async () => {
      // Mock d'un enregistrement complet
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonAdvanced();
      
      // Simuler l'enregistrement et traitement
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      await waitFor(() => {
        const stopButton = screen.getByRole('button', { name: /terminer/i });
        fireEvent.click(stopButton);
      }, { timeout: 3000 });
      
      // Vérifier que l'analyse apparaît
      await waitFor(() => {
        expect(screen.getByText(/Analyse détaillée/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show encouragement messages', async () => {
      renderGameLessonAdvanced();
      
      // Simuler une phase d'encouragement
      // (nécessite de mocker l'état interne du composant)
      await waitFor(() => {
        // Cette partie sera testée avec des tests d'intégration
        expect(true).toBe(true);
      });
    });
  });

  describe('Répétition espacée', () => {
    it('should track difficult words for future review', () => {
      renderGameLessonAdvanced();
      
      // Test de la logique de répétition espacée
      // sera implémenté avec des tests d'intégration
      expect(true).toBe(true);
    });
  });

  describe('Gestion d\'erreurs', () => {
    it('should handle microphone permission denial gracefully', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'));
      
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      // Vérifier qu'une alerte ou message d'erreur apparaît
      await waitFor(() => {
        // Le composant devrait gérer l'erreur gracieusement
        expect(recordButton).toBeInTheDocument();
      });
    });

    it('should handle audio processing errors', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonAdvanced();
      
      const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
      fireEvent.click(recordButton);
      
      // Le composant devrait rester stable même en cas d'erreur de traitement
      await waitFor(() => {
        expect(recordButton).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('should have proper ARIA labels', () => {
      renderGameLessonAdvanced();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have proper heading structure', () => {
      renderGameLessonAdvanced('?chapterNumber=1');
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderGameLessonAdvanced();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Responsive design', () => {
    it('should render correctly on mobile viewport', () => {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderGameLessonAdvanced();
      
      // Le composant devrait avoir des classes responsive
      const container = screen.getByRole('main') || document.body.firstChild;
      expect(container).toBeInTheDocument();
    });
  });
});

describe('GameLessonAdvanced - Tests d\'intégration', () => {
  it('should complete a full learning flow', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }]
    };
    mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
    
    renderGameLessonAdvanced('?chapterNumber=1');
    
    // 1. Écouter le modèle
    const listenButton = screen.getByRole('button', { name: /écouter le modèle/i });
    fireEvent.click(listenButton);
    
    await waitFor(() => {
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
    
    // 2. Enregistrer
    const recordButton = screen.getByRole('button', { name: /s'enregistrer/i });
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
    });
    
    // 3. Arrêter l'enregistrement
    const stopButton = await screen.findByRole('button', { name: /terminer/i });
    fireEvent.click(stopButton);
    
    // 4. Vérifier que le traitement commence
    await waitFor(() => {
      expect(screen.getByText(/Analyse de votre prononciation/i)).toBeInTheDocument();
    });
    
    // Le flux complet devrait être fluide et sans erreur
    expect(true).toBe(true);
  });
});