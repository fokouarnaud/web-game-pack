/**
 * Tests unitaires pour le système multijoueur local
 * Version simplifiée selon les bonnes pratiques
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Test simplifié - testons uniquement l'import et les fonctions de base
import { multiplayerService } from '../../../src/services/multiplayer/multiplayerService';

describe('Multiplayer Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should import successfully', () => {
    expect(multiplayerService).toBeDefined();
    expect(typeof multiplayerService).toBe('object');
  });

  test('should have basic methods', () => {
    expect(typeof multiplayerService.createRoom).toBe('function');
    expect(typeof multiplayerService.joinRoom).toBe('function');
    expect(typeof multiplayerService.leaveRoom).toBe('function');
    expect(typeof multiplayerService.startGame).toBe('function');
    expect(typeof multiplayerService.endGame).toBe('function');
    expect(typeof multiplayerService.getActiveRooms).toBe('function');
  });

  test('should return null for disabled functions', async () => {
    // Le service est temporairement désactivé, donc les méthodes retournent null
    const room = await multiplayerService.createRoom();
    expect(room).toBeNull();
    
    const joinResult = await multiplayerService.joinRoom('test-room');
    expect(joinResult).toBeNull();
    
    const activeRooms = await multiplayerService.getActiveRooms();
    expect(Array.isArray(activeRooms)).toBe(true);
    expect(activeRooms).toHaveLength(0);
  });

  test('should handle async operations without errors', async () => {
    // Test que les méthodes async ne lancent pas d'erreurs
    await expect(multiplayerService.createRoom()).resolves.not.toThrow();
    await expect(multiplayerService.joinRoom('test')).resolves.not.toThrow();
    await expect(multiplayerService.leaveRoom()).resolves.not.toThrow();
    await expect(multiplayerService.startGame()).resolves.not.toThrow();
    await expect(multiplayerService.endGame()).resolves.not.toThrow();
    await expect(multiplayerService.getActiveRooms()).resolves.not.toThrow();
  });
});