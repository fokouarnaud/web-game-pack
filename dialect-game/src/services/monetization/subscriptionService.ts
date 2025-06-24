// Temporairement désactivé pour correction TypeScript
console.warn('Service subscriptionService temporairement désactivé');

// Service par défaut temporaire
class SubscriptionService {
  constructor() {
    console.log('SubscriptionService initialisé (mode désactivé)');
  }

  // Méthodes basiques pour éviter les erreurs
  async getSubscriptionStatus() {
    return { status: 'free', features: [] };
  }

  async createSubscription() {
    return null;
  }

  async cancelSubscription() {
    return null;
  }

  async getUsageLimits() {
    return { daily: 10, monthly: 100 };
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;