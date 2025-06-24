// Temporairement désactivé pour correction TypeScript
console.warn('Service conversationService temporairement désactivé');

// Service par défaut temporaire
class ConversationService {
  constructor() {
    console.log('ConversationService initialisé (mode désactivé)');
  }

  // Méthodes basiques pour éviter les erreurs
  async generateResponse(input: string) {
    return "Service temporairement indisponible";
  }

  async startConversation() {
    return null;
  }

  async endConversation() {
    return null;
  }
}

export const conversationService = new ConversationService();
export default conversationService;