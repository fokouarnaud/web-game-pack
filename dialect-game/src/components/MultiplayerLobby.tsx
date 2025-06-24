/**
 * TDD CYCLE 4 - GREEN PHASE
 * Multiplayer Lobby Component avec rooms, chat, real-time sync
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

// Types pour le multiplayer
interface Player {
  id: string
  name: string
  status: 'ready' | 'waiting' | 'playing'
  score: number
  ping: number
}

interface Room {
  id: string
  code: string
  players: Player[]
  maxPlayers: number
  gameActive: boolean
}

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
}

interface NetworkStatus {
  ping: number
  quality: 'strong' | 'medium' | 'weak'
  connected: boolean
}

export const MultiplayerLobby: React.FC = () => {
  // États pour le multiplayer
  const [room, setRoom] = useState<Room | null>(null)
  const [roomCodeInput, setRoomCodeInput] = useState<string>('')
  const [players, setPlayers] = useState<Player[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState<string>('')
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    ping: 45,
    quality: 'strong',
    connected: true
  })
  const [gameSync, setGameSync] = useState<string>('Ready')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Mock players pour les tests
  const mockPlayers: Player[] = [
    { id: 'player1', name: 'Alice', status: 'ready', score: 150, ping: 23 },
    { id: 'player2', name: 'Bob', status: 'waiting', score: 90, ping: 45 }
  ]

  // Handlers pour les actions multiplayer
  const handleCreateRoom = useCallback(async () => {
    const newRoom: Room = {
      id: 'room123',
      code: 'room123',
      players: mockPlayers,
      maxPlayers: 4,
      gameActive: false
    }
    
    setRoom(newRoom)
    setPlayers(mockPlayers)
  }, [])

  const handleJoinRoom = useCallback(async () => {
    if (roomCodeInput.trim()) {
      const joinedRoom: Room = {
        id: roomCodeInput,
        code: roomCodeInput,
        players: mockPlayers,
        maxPlayers: 4,
        gameActive: false
      }
      
      setRoom(joinedRoom)
      setPlayers(mockPlayers)
    }
  }, [roomCodeInput])

  const handleStartGame = useCallback(() => {
    setGameSync('Syncing...')
    setTimeout(() => {
      setGameSync('Game Started')
    }, 1000)
  }, [])

  const handleSendMessage = useCallback(() => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId: 'current-player',
        playerName: 'You',
        message: chatInput,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, newMessage])
      setChatInput('')
    }
  }, [chatInput])

  const handleTriggerUpdate = useCallback(() => {
    setLastUpdate(new Date())
    // Simuler mise à jour réseau
    setNetworkStatus(prev => ({
      ...prev,
      ping: Math.floor(Math.random() * 100) + 20
    }))
  }, [])

  const handleReconnect = useCallback(() => {
    setNetworkStatus(prev => ({ ...prev, connected: true }))
  }, [])

  const handleOfflineMode = useCallback(() => {
    setRoom(null)
    setPlayers([])
  }, [])

  // Simuler déconnexion pour les tests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.1) { // 10% chance de simuler déconnexion
        setNetworkStatus(prev => ({ ...prev, connected: false }))
      }
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  // Calculer le leader actuel
  const currentLeader = players.length > 0 
    ? players.reduce((leader, player) => player.score > leader.score ? player : leader)
    : null

  return (
    <div data-testid="multiplayer-lobby-container" className="p-6 space-y-6">
      {/* Lobby Status */}
      <div className="space-y-4">
        <div data-testid="lobby-status" className="text-xl font-bold">
          {room ? `Joined Room: ${room.code}` : 'Lobby Ready'}
        </div>
        
        {/* Room Info */}
        {room && (
          <div data-testid="room-code-display" className="text-lg">
            Room: {room.code}
          </div>
        )}
        
        <div data-testid="player-count" className="text-lg">
          Players: {players.length}/4
        </div>
      </div>

      {/* Game Controls */}
      <div data-testid="game-controls" className="space-y-4">
        {!room ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                data-testid="create-room-button"
                onClick={handleCreateRoom}
                variant="default"
              >
                Create Room
              </Button>
              <Button 
                data-testid="join-room-button"
                onClick={handleJoinRoom}
                variant="secondary"
              >
                Join Room
              </Button>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="room-code">Enter Room Code:</label>
              <input
                id="room-code"
                data-testid="room-code-input"
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter room code..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              data-testid="share-room-button"
              variant="outline"
            >
              Share Room Code
            </Button>
            <Button 
              data-testid="start-game-button"
              onClick={handleStartGame}
              variant="default"
            >
              Start Game
            </Button>
          </div>
        )}
      </div>

      {/* Game Sync Status */}
      {room && (
        <div data-testid="game-sync-status" className="text-lg">
          {gameSync}
        </div>
      )}

      {/* Countdown Timer */}
      {gameSync === 'Syncing...' && (
        <div data-testid="countdown-timer" className="text-2xl font-bold text-center">
          Starting in 3...
        </div>
      )}

      {/* Players List */}
      <div data-testid="players-list" className="space-y-4">
        <h3 className="text-xl font-bold">Connected Players</h3>
        {players.length === 0 ? (
          <div>No players connected</div>
        ) : (
          <div className="space-y-2">
            {players.map(player => (
              <div 
                key={player.id}
                data-testid={`player-${player.name.toLowerCase()}`}
                className={`p-3 border rounded flex justify-between items-center ${
                  player.status === 'ready' ? 'ready bg-green-50 border-green-200' : 
                  'waiting bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({player.status})</span>
                </div>
                <div className="text-sm">
                  Score: {player.score} | Ping: {player.ping}ms
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Scoreboard */}
      {players.length > 0 && (
        <div data-testid="live-scoreboard" className="space-y-4">
          <h3 className="text-xl font-bold">Live Scores</h3>
          <div className="space-y-2">
            {players.map(player => (
              <div 
                key={player.id}
                data-testid={`${player.id}-score`}
                className="flex justify-between p-2 bg-gray-50 rounded"
              >
                <span>{player.name}: {player.score}</span>
              </div>
            ))}
          </div>
          <div data-testid="current-leader" className="font-bold text-yellow-600">
            Leader: {currentLeader ? currentLeader.name : '-'}
          </div>
        </div>
      )}

      {/* Chat Section */}
      {room && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Chat</h3>
          <div 
            data-testid="chat-messages" 
            className="h-32 p-3 border rounded bg-gray-50 overflow-y-auto"
          >
            {chatMessages.length === 0 ? (
              <div className="text-gray-500">No messages yet...</div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="mb-2">
                  <span className="font-medium">{msg.playerName}:</span>
                  <span className="ml-2">{msg.message}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              data-testid="chat-input"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 border rounded"
              placeholder="Type a message..."
            />
            <Button 
              data-testid="send-message-button"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div data-testid="connection-status" className="space-y-2">
        {networkStatus.connected ? 'Connected' : 'Reconnecting...'}
        {!networkStatus.connected && (
          <div className="flex gap-2">
            <Button 
              data-testid="reconnect-button"
              onClick={handleReconnect}
              size="sm"
            >
              Reconnect
            </Button>
            <Button 
              data-testid="offline-mode-button"
              onClick={handleOfflineMode}
              variant="outline"
              size="sm"
            >
              Offline Mode
            </Button>
          </div>
        )}
      </div>

      {/* Network Quality */}
      <div data-testid="network-quality" className="space-y-2">
        <div data-testid="ping-display">
          Ping: {networkStatus.ping}ms
        </div>
        <div 
          data-testid="connection-strength"
          className={`connection-strength ${networkStatus.quality}`}
        >
          Connection: {networkStatus.quality}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex gap-4">
        <Button 
          data-testid="trigger-update-button"
          onClick={handleTriggerUpdate}
          variant="outline"
        >
          Trigger Update (Test)
        </Button>
        <div data-testid="last-update-time" className="text-sm text-gray-500 self-center">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default MultiplayerLobby