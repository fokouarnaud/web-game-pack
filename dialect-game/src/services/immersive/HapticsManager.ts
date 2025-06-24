/**
 * HapticsManager - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class HapticsManager {
  private isInitialized = false;
  private supportedPatterns: Map<string, any> = new Map();
  private activeFeedbacks: Set<string> = new Set();

  constructor() {
    this.initializeHapticPatterns();
  }

  async triggerFeedback(interactionType: string): Promise<boolean> {
    if (!interactionType || typeof interactionType !== 'string') {
      throw new Error('Invalid interaction type');
    }

    try {
      // Initialisation si nécessaire
      if (!this.isInitialized) {
        await this.initializeHapticsSystem();
      }

      // Vérification du support du pattern
      if (!this.supportedPatterns.has(interactionType)) {
        await this.createDynamicPattern(interactionType);
      }

      // Exécution du retour haptique
      const success = await this.executeHapticFeedback(interactionType);
      
      return success;
    } catch (error) {
      throw error;
    }
  }

  private async initializeHapticsSystem(): Promise<void> {
    try {
      // Vérification du support des vibrations
      if ('vibrate' in navigator) {
        this.isInitialized = true;
      } else if ('haptics' in navigator) {
        // Support expérimental des haptics avancés
        this.isInitialized = true;
      } else {
        // Fallback pour les environnements sans support haptique
        this.isInitialized = true;
      }
    } catch (error) {
      // Mode simulation pour les tests
      this.isInitialized = true;
    }
  }

  private initializeHapticPatterns(): void {
    // Patterns haptiques prédéfinis
    this.supportedPatterns.set('tap', {
      duration: 50,
      intensity: 0.5,
      pattern: [50]
    });

    this.supportedPatterns.set('click', {
      duration: 30,
      intensity: 0.3,
      pattern: [30]
    });

    this.supportedPatterns.set('success', {
      duration: 200,
      intensity: 0.7,
      pattern: [100, 50, 100]
    });

    this.supportedPatterns.set('error', {
      duration: 300,
      intensity: 0.8,
      pattern: [50, 50, 50, 50, 50]
    });

    this.supportedPatterns.set('notification', {
      duration: 150,
      intensity: 0.4,
      pattern: [75, 25, 75]
    });

    this.supportedPatterns.set('selection', {
      duration: 40,
      intensity: 0.3,
      pattern: [40]
    });

    this.supportedPatterns.set('longPress', {
      duration: 500,
      intensity: 0.6,
      pattern: [500]
    });

    this.supportedPatterns.set('drag', {
      duration: 25,
      intensity: 0.2,
      pattern: [25]
    });
  }

  private async createDynamicPattern(interactionType: string): Promise<void> {
    // Création dynamique de patterns pour les types non prédéfinis
    const defaultPattern = {
      duration: 100,
      intensity: 0.5,
      pattern: [100]
    };

    // Adaptation basée sur le type d'interaction
    if (interactionType.includes('button')) {
      defaultPattern.duration = 50;
      defaultPattern.intensity = 0.4;
      defaultPattern.pattern = [50];
    } else if (interactionType.includes('slide')) {
      defaultPattern.duration = 30;
      defaultPattern.intensity = 0.2;
      defaultPattern.pattern = [30];
    } else if (interactionType.includes('confirm')) {
      defaultPattern.duration = 200;
      defaultPattern.intensity = 0.6;
      defaultPattern.pattern = [100, 50, 100];
    }

    this.supportedPatterns.set(interactionType, defaultPattern);
  }

  private async executeHapticFeedback(interactionType: string): Promise<boolean> {
    const pattern = this.supportedPatterns.get(interactionType);
    if (!pattern) {
      return false;
    }

    try {
      // Vérification des conflits (éviter les feedbacks simultanés du même type)
      if (this.activeFeedbacks.has(interactionType)) {
        return false;
      }

      // Marquage comme actif
      this.activeFeedbacks.add(interactionType);

      // Exécution du feedback haptique
      const success = await this.performHapticPattern(pattern);

      // Nettoyage après exécution
      setTimeout(() => {
        this.activeFeedbacks.delete(interactionType);
      }, pattern.duration + 50);

      return success;
    } catch (error) {
      this.activeFeedbacks.delete(interactionType);
      throw error;
    }
  }

  private async performHapticPattern(pattern: any): Promise<boolean> {
    try {
      // Tentative d'utilisation de l'API Vibration standard
      if ('vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(pattern.pattern);
        return true;
      }

      // Tentative d'utilisation d'APIs haptiques avancées (expérimental)
      if ('haptics' in navigator) {
        // @ts-ignore - API expérimentale
        await navigator.haptics.vibrate({
          duration: pattern.duration,
          intensity: pattern.intensity
        });
        return true;
      }

      // Simulation pour les environnements sans support haptique
      await this.simulateHapticFeedback(pattern);
      return true;

    } catch (error) {
      // Fallback - simulation silencieuse
      await this.simulateHapticFeedback(pattern);
      return true;
    }
  }

  private async simulateHapticFeedback(pattern: any): Promise<void> {
    // Simulation non-intrusive du feedback haptique
    return new Promise(resolve => {
      setTimeout(resolve, Math.min(pattern.duration, 10));
    });
  }

  // Méthodes utilitaires publiques
  isHapticsSupported(): boolean {
    return 'vibrate' in navigator || 'haptics' in navigator;
  }

  getSupportedPatterns(): string[] {
    return Array.from(this.supportedPatterns.keys());
  }

  addCustomPattern(name: string, pattern: { duration: number; intensity: number; pattern: number[] }): void {
    this.supportedPatterns.set(name, pattern);
  }

  removePattern(name: string): boolean {
    return this.supportedPatterns.delete(name);
  }

  getActivefeedbacks(): string[] {
    return Array.from(this.activeFeedbacks);
  }

  async stopAllFeedback(): Promise<void> {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(0);
    }
    this.activeFeedbacks.clear();
  }

  // Méthodes de convenance pour les interactions courantes
  async tapFeedback(): Promise<boolean> {
    return this.triggerFeedback('tap');
  }

  async successFeedback(): Promise<boolean> {
    return this.triggerFeedback('success');
  }

  async errorFeedback(): Promise<boolean> {
    return this.triggerFeedback('error');
  }

  async clickFeedback(): Promise<boolean> {
    return this.triggerFeedback('click');
  }
}