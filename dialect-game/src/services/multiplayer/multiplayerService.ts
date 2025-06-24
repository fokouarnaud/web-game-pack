// Temporairement désactivé pour correction TypeScript
console.warn('Service multiplayerService temporairement désactivé');

// Service par défaut temporaire
class MultiplayerService {
  constructor() {
    console.log('MultiplayerService initialisé (mode désactivé)');
  }

  // Méthodes basiques pour éviter les erreurs
  async createRoom() {
    return null;
  }

  async joinRoom(roomId: string) {
    return null;
  }

  async leaveRoom() {
    return null;
  }

  async startGame() {
    return null;
  }

  async endGame() {
    return null;
  }

  async getActiveRooms() {
    return [];
  }
}

export const multiplayerService = new MultiplayerService();
export default multiplayerService;