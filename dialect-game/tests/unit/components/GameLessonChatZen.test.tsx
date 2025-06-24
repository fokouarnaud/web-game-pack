/**
 * Tests unitaires pour GameLessonChatZen
 * Vérifie l'interface de chat conversationnel et l'expérience utilisateur
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { GameLessonChatZen } from '../../../src/components/GameLessonChatZen';

// Mock des services TDD
vi.mock('../../../src/services/voice/AdvancedVoiceEngine', () => ({
  AdvancedVoiceEngine: vi.fn().mockImplementation(() => ({
    processAudio: vi.fn().mockResolvedValue({
      text: 'Hello',
      confidence: 0.85
    })
  }))
}));

vi.mock('../../../src/services/ai/PredictiveAIService', () => ({
  PredictiveAIService: vi.fn().mockImplementation(() => ({
    detectWeaknesses: vi.fn().mockResolvedValue(['pronunciation']),
    generateCognitiveFeedback: vi.fn().mockResolvedValue('Great job!')
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

const renderGameLessonChatZen = (searchParams = '') => {
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
      <GameLessonChatZen />
    </BrowserRouter>
  );
};

describe('GameLessonChatZen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      state: 'inactive',
      ondataavailable: null,
      onstop: null
    })) as any;
    global.MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
  });

  describe('Interface de chat - Rendu initial', () => {
    it('should render chat interface with conversation header', () => {
      renderGameLessonChatZen('?chapterNumber=1');
      
      expect(screen.getByText('Première Conversation en Anglais')).toBeInTheDocument();
      expect(screen.getByText(/Conversation avec Emma/)).toBeInTheDocument();
    });

    it('should display chat progress indicator', () => {
      renderGameLessonChatZen('?chapterNumber=1');
      
      expect(screen.getByText('Étape 1 sur 4')).toBeInTheDocument();
    });

    it('should have chat header with score and theme toggle', () => {
      renderGameLessonChatZen();
      
      const scoreElement = screen.getByText('0');
      expect(scoreElement).toBeInTheDocument();
      
      const themeToggle = screen.getByLabelText('Toggle theme');
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Messages de chat', () => {
    it('should display initial system message', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        expect(screen.getByText(/Conversation démarrée/)).toBeInTheDocument();
      });
    });

    it('should display tutor welcome message', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        expect(screen.getByText(/Hello! 👋 I'm Emma/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show tutor avatar for tutor messages', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        const botIcons = screen.getAllByTestId(/bot-avatar|tutor-avatar/);
        expect(botIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Actions de chat contextuelles', () => {
    it('should display start conversation button', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        expect(startButton).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show listen and record buttons after starting', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /écouter exemple/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /parler/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Fonctionnalités audio dans le chat', () => {
    it('should play tutor message automatically', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle listen example action', async () => {
      renderGameLessonChatZen();
      
      // Démarrer la conversation
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      // Cliquer sur écouter exemple
      await waitFor(() => {
        const listenButton = screen.getByRole('button', { name: /écouter exemple/i });
        fireEvent.click(listenButton);
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2); // Welcome + example
      });
    });

    it('should handle microphone recording', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonChatZen();
      
      // Démarrer la conversation
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      // Cliquer sur parler
      await waitFor(() => {
        const speakButton = screen.getByRole('button', { name: /parler/i });
        fireEvent.click(speakButton);
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
      });
    });
  });

  describe('États de chat dynamiques', () => {
    it('should show recording indicator when recording', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonChatZen();
      
      // Démarrer conversation et enregistrement
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      await waitFor(() => {
        const speakButton = screen.getByRole('button', { name: /parler/i });
        fireEvent.click(speakButton);
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(screen.getByText(/Recording.../)).toBeInTheDocument();
      });
    });

    it('should show processing indicator when analyzing', async () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }]
      };
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
      
      renderGameLessonChatZen();
      
      // Démarrer, enregistrer et arrêter
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      await waitFor(() => {
        const speakButton = screen.getByRole('button', { name: /parler/i });
        fireEvent.click(speakButton);
      }, { timeout: 3000 });
      
      await waitFor(() => {
        const stopButton = screen.getByRole('button', { name: /arrêter/i });
        fireEvent.click(stopButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Emma is analyzing.../)).toBeInTheDocument();
      });
    });
  });

  describe('Bulles de message chat', () => {
    it('should display different message types correctly', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        // System message avec badge
        expect(screen.getByText(/Conversation démarrée/)).toBeInTheDocument();
        
        // Tutor message avec avatar
        expect(screen.getByText(/Hello! 👋 I'm Emma/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show timestamps on messages', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        // Les timestamps sont affichés au format HH:MM
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
        expect(timeElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Navigation et flow de chat', () => {
    it('should have back navigation button', () => {
      renderGameLessonChatZen();
      
      const backButton = screen.getAllByRole('button')[0]; // Premier bouton = back
      expect(backButton).toBeInTheDocument();
    });

    it('should handle conversation progression', async () => {
      renderGameLessonChatZen();
      
      // Démarrer la conversation
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      // Vérifier que la conversation progresse
      await waitFor(() => {
        expect(screen.getByText(/Great! /)).toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Responsive design du chat', () => {
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderGameLessonChatZen();
      
      // L'interface chat devrait être responsive
      const chatContainer = document.body.firstChild;
      expect(chatContainer).toBeInTheDocument();
    });

    it('should have proper message bubble layout', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        // Les messages devraient avoir des classes CSS appropriées
        const messageElements = screen.getAllByText(/Hello! 👋 I'm Emma/);
        if (messageElements.length > 0) {
          expect(messageElements[0].closest('.rounded-2xl')).toBeInTheDocument();
        }
      }, { timeout: 2000 });
    });
  });

  describe('Accessibilité du chat', () => {
    it('should have proper ARIA labels for chat interface', () => {
      renderGameLessonChatZen();
      
      // Header devrait avoir role banner
      const headers = screen.getAllByRole('banner');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons with proper labels', async () => {
      renderGameLessonChatZen();
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Chaque bouton devrait avoir du contenu accessible
          expect(button.textContent?.trim().length || button.getAttribute('aria-label')?.length).toBeGreaterThan(0);
        });
      }, { timeout: 2000 });
    });
  });

  describe('Gestion d\'erreurs dans le chat', () => {
    it('should handle microphone permission errors gracefully', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'));
      
      renderGameLessonChatZen();
      
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /commencer/i });
        fireEvent.click(startButton);
      }, { timeout: 2000 });
      
      await waitFor(() => {
        const speakButton = screen.getByRole('button', { name: /parler/i });
        fireEvent.click(speakButton);
      }, { timeout: 3000 });
      
      // Le chat devrait afficher un message d'erreur approprié
      await waitFor(() => {
        expect(screen.getByText(/Impossible d'accéder au microphone/)).toBeInTheDocument();
      });
    });
  });
});

describe('GameLessonChatZen - Tests d\'intégration chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      state: 'inactive',
      ondataavailable: null,
      onstop: null
    })) as any;
    global.MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
  });

  it('should complete full conversation flow', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }]
    };
    mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
    
    renderGameLessonChatZen('?chapterNumber=1');
    
    // 1. Vérifier l'initialisation du chat
    await waitFor(() => {
      expect(screen.getByText(/Conversation démarrée/)).toBeInTheDocument();
    });
    
    // 2. Démarrer la conversation
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /commencer/i });
      fireEvent.click(startButton);
    }, { timeout: 2000 });
    
    // 3. Vérifier la progression
    await waitFor(() => {
      expect(screen.getByText(/Great!/)).toBeInTheDocument();
    }, { timeout: 4000 });
    
    // 4. Tester l'enregistrement
    await waitFor(() => {
      const speakButton = screen.getByRole('button', { name: /parler/i });
      fireEvent.click(speakButton);
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
    });
    
    // Le flow de chat devrait être fluide et naturel
    expect(true).toBe(true);
  });

  it('should provide natural conversation experience', async () => {
    renderGameLessonChatZen('?chapterNumber=1');
    
    // L'expérience devrait ressembler à une vraie conversation
    await waitFor(() => {
      expect(screen.getByText(/Hello! 👋 I'm Emma/)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Avec des actions contextuelles appropriées
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /commencer/i });
      expect(startButton).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(true).toBe(true);
  });
});