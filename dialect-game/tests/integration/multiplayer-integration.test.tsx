/**
 * TDD CYCLE 4 - PHASE GREEN
 * Tests pour fonctionnalités multiplayer avancées
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import MultiplayerLobby from '../../src/components/MultiplayerLobby'

// Mock du service multiplayer
const mockMultiplayerService = {
  createRoom: vi.fn().mockResolvedValue({ roomId: 'room123', players: [] }),
  joinRoom: vi.fn().mockResolvedValue({ success: true }),
  leaveRoom: vi.fn(),
  sendGameData: vi.fn(),
  onPlayerJoined: vi.fn(),
  onGameStateUpdate: vi.fn(),
  getConnectedPlayers: vi.fn().mockReturnValue([])
}

// Mock du service de chat
const mockChatService = {
  sendMessage: vi.fn(),
  onMessageReceived: vi.fn(),
  getHistory: vi.fn().mockReturnValue([])
}

describe('Multiplayer Integration Tests (TDD CYCLE 4 GREEN Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Phase GREEN - Tests qui doivent maintenant passer', () => {
    it('should display lobby interface with basic controls', () => {
      render(<MultiplayerLobby />)
      
      // Tests de base qui passent maintenant
      expect(screen.getByTestId('multiplayer-lobby-container')).toBeInTheDocument()
      expect(screen.getByTestId('lobby-status')).toHaveTextContent('Lobby Ready')
      expect(screen.getByTestId('player-count')).toHaveTextContent('Players: 0/4')
      
      // Éléments de contrôle
      expect(screen.getByTestId('create-room-button')).toBeInTheDocument()
      expect(screen.getByTestId('join-room-button')).toBeInTheDocument()
    })

    it('should handle room creation and display room code', async () => {
      render(<MultiplayerLobby />)
      
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      // Tests création de room maintenant implémentés
      await waitFor(() => {
        expect(screen.getByTestId('room-code-display')).toHaveTextContent('Room: room123')
      })
      
      expect(screen.getByTestId('share-room-button')).toBeInTheDocument()
      expect(screen.getByTestId('lobby-status')).toHaveTextContent('Joined Room: room123')
    })

    it('should allow joining existing room with code', async () => {
      render(<MultiplayerLobby />)
      
      // Tests join room maintenant implémentés
      const roomInput = screen.getByTestId('room-code-input')
      const joinButton = screen.getByTestId('join-room-button')
      
      fireEvent.change(roomInput, { target: { value: 'room123' } })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('lobby-status')).toHaveTextContent('Joined Room: room123')
      })
      
      expect(screen.getByTestId('room-code-display')).toHaveTextContent('Room: room123')
    })

    it('should display connected players in real-time', async () => {
      render(<MultiplayerLobby />)
      
      // Créer une room pour avoir des joueurs
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      // Tests affichage joueurs maintenant implémentés
      await waitFor(() => {
        expect(screen.getByTestId('player-alice')).toBeInTheDocument()
        expect(screen.getByTestId('player-bob')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('player-count')).toHaveTextContent('Players: 2/4')
      expect(screen.getByTestId('player-alice')).toHaveClass('ready')
      expect(screen.getByTestId('player-bob')).toHaveClass('waiting')
    })

    it('should handle real-time game synchronization', async () => {
      render(<MultiplayerLobby />)
      
      // Créer une room d'abord
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('start-game-button')).toBeInTheDocument()
      })
      
      // Tests synchronisation de jeu maintenant implémentés
      const startGameButton = screen.getByTestId('start-game-button')
      fireEvent.click(startGameButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('game-sync-status')).toHaveTextContent('Syncing...')
      })
      
      expect(screen.getByTestId('countdown-timer')).toBeInTheDocument()
    })

    it('should show live scores and rankings', async () => {
      render(<MultiplayerLobby />)
      
      // Créer une room pour avoir des scores
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('live-scoreboard')).toBeInTheDocument()
      })
      
      // Tests scores en temps réel maintenant implémentés
      expect(screen.getByTestId('player1-score')).toHaveTextContent('Alice: 150')
      expect(screen.getByTestId('player2-score')).toHaveTextContent('Bob: 90')
      expect(screen.getByTestId('current-leader')).toHaveTextContent('Leader: Alice')
    })

    it('should handle chat functionality', async () => {
      render(<MultiplayerLobby />)
      
      // Créer une room pour avoir le chat
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
      
      // Tests chat maintenant implémentés
      const chatInput = screen.getByTestId('chat-input')
      const sendButton = screen.getByTestId('send-message-button')
      
      fireEvent.change(chatInput, { target: { value: 'Hello everyone!' } })
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-messages')).toHaveTextContent('Hello everyone!')
      })
    })

    it('should handle disconnections gracefully', async () => {
      render(<MultiplayerLobby />)
      
      // Les tests de déconnexion sont déjà implémentés
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toBeInTheDocument()
      })
      
      // Vérifier les boutons de reconnexion
      expect(screen.getByTestId('reconnect-button')).toBeInTheDocument()
      expect(screen.getByTestId('offline-mode-button')).toBeInTheDocument()
    })

    it('should show room code input when not in room', () => {
      render(<MultiplayerLobby />)
      
      expect(screen.getByTestId('room-code-input')).toBeInTheDocument()
      expect(screen.getByLabelText('Enter Room Code:')).toBeInTheDocument()
    })

    it('should update player count when players join', async () => {
      render(<MultiplayerLobby />)
      
      // État initial
      expect(screen.getByTestId('player-count')).toHaveTextContent('Players: 0/4')
      
      // Créer une room
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      // Vérifier la mise à jour
      await waitFor(() => {
        expect(screen.getByTestId('player-count')).toHaveTextContent('Players: 2/4')
      })
    })
  })

  describe('Performance et Latence', () => {
    it('should maintain low latency for real-time updates', async () => {
      const startTime = performance.now()
      
      render(<MultiplayerLobby />)
      
      // Simuler mise à jour temps réel
      const updateButton = screen.getByTestId('trigger-update-button')
      fireEvent.click(updateButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('last-update-time')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Latence < 100ms
    })

    it('should handle network quality indicators', () => {
      render(<MultiplayerLobby />)
      
      // Tests qualité réseau maintenant implémentés
      expect(screen.getByTestId('network-quality')).toBeInTheDocument()
      expect(screen.getByTestId('ping-display')).toHaveTextContent('Ping: 45ms')
      expect(screen.getByTestId('connection-strength')).toHaveClass('strong')
    })

    it('should update ping dynamically', async () => {
      render(<MultiplayerLobby />)
      
      const initialPing = screen.getByTestId('ping-display').textContent
      
      // Déclencher mise à jour
      const updateButton = screen.getByTestId('trigger-update-button')
      fireEvent.click(updateButton)
      
      await waitFor(() => {
        const newPing = screen.getByTestId('ping-display').textContent
        expect(newPing).not.toBe(initialPing)
      })
    })

    it('should handle chat message sending via Enter key', async () => {
      render(<MultiplayerLobby />)
      
      // Créer une room
      const createButton = screen.getByTestId('create-room-button')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
      
      const chatInput = screen.getByTestId('chat-input')
      fireEvent.change(chatInput, { target: { value: 'Test message' } })
      fireEvent.keyPress(chatInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-messages')).toHaveTextContent('Test message')
      })
    })
  })
})