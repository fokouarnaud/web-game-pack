// Service Worker registration et gestion
import React from 'react';

/**
 * Configuration du Service Worker
 */
const SW_CONFIG = {
  url: '/sw.js',
  scope: '/',
  updateInterval: 24 * 60 * 60 * 1000, // 24 heures
};

/**
 * Interface pour les événements SW
 */
interface ServiceWorkerEvents {
  'sw-registered': ServiceWorkerRegistration;
  'sw-updated': ServiceWorkerRegistration;
  'sw-offline': void;
  'sw-online': void;
  'sw-error': Error;
}

/**
 * Gestionnaire du Service Worker
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private listeners: Map<keyof ServiceWorkerEvents, Function[]> = new Map();

  /**
   * Initialiser et enregistrer le Service Worker
   */
  async init(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return;
    }

    if (import.meta.env.DEV) {
      console.log('🔧 Service Worker disabled in development');
      return;
    }

    try {
      await this.register();
      this.setupNetworkStatusListeners();
      this.setupUpdateChecker();
      console.log('✅ Service Worker initialized successfully');
    } catch (error) {
      console.error('❌ Service Worker initialization failed:', error);
      this.emit('sw-error', error as Error);
    }
  }

  /**
   * Enregistrer le Service Worker
   */
  private async register(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register(
        SW_CONFIG.url,
        { scope: SW_CONFIG.scope }
      );

      this.emit('sw-registered', this.registration);

      // Gérer les différents états
      if (this.registration.installing) {
        console.log('🔧 Service Worker: Installing...');
        await this.waitForState(this.registration.installing, 'installed');
      }

      if (this.registration.waiting) {
        console.log('⏳ Service Worker: Waiting to activate...');
        this.handleWaitingWorker();
      }

      if (this.registration.active) {
        console.log('✅ Service Worker: Active and ready');
      }

      // Écouter les mises à jour
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

    } catch (error) {
      throw new Error(`Service Worker registration failed: ${error}`);
    }
  }

  /**
   * Gérer une nouvelle version trouvée
   */
  private handleUpdateFound(): void {
    if (!this.registration?.installing) return;

    const newWorker = this.registration.installing;
    console.log('🔄 Service Worker: Update found, installing...');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('🎉 Service Worker: New version available');
        this.emit('sw-updated', this.registration!);
      }
    });
  }

  /**
   * Gérer un worker en attente
   */
  private handleWaitingWorker(): void {
    if (!this.registration?.waiting) return;

    // Proposer de redémarrer pour activer la nouvelle version
    this.emit('sw-updated', this.registration);
  }

  /**
   * Activer la nouvelle version du Service Worker
   */
  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      console.warn('⚠️ No waiting Service Worker to activate');
      return;
    }

    // Dire au worker en attente de prendre le contrôle
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Attendre que le nouveau worker devienne actif
    await this.waitForState(this.registration.waiting, 'activated');

    // Recharger la page pour utiliser la nouvelle version
    window.location.reload();
  }

  /**
   * Attendre qu'un worker atteigne un état spécifique
   */
  private waitForState(worker: ServiceWorker, state: ServiceWorkerState): Promise<void> {
    return new Promise((resolve) => {
      if (worker.state === state) {
        resolve();
        return;
      }

      const stateChangeHandler = () => {
        if (worker.state === state) {
          worker.removeEventListener('statechange', stateChangeHandler);
          resolve();
        }
      };

      worker.addEventListener('statechange', stateChangeHandler);
    });
  }

  /**
   * Configurer la vérification périodique des mises à jour
   */
  private setupUpdateChecker(): void {
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, SW_CONFIG.updateInterval);

    // Vérifier aussi quand l'onglet reprend le focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Vérifier manuellement les mises à jour
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('🔍 Service Worker: Update check completed');
    } catch (error) {
      console.warn('⚠️ Service Worker update check failed:', error);
    }
  }

  /**
   * Configurer les listeners de statut réseau
   */
  private setupNetworkStatusListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network: Back online');
      this.emit('sw-online');
    });

    window.addEventListener('offline', () => {
      console.log('📱 Network: Gone offline');
      this.emit('sw-offline');
    });
  }

  /**
   * Obtenir des informations sur les caches
   */
  async getCacheInfo(): Promise<Record<string, number>> {
    if (!this.registration?.active) {
      throw new Error('No active Service Worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_INFO') {
          resolve(event.data.payload);
        } else {
          reject(new Error('Failed to get cache info'));
        }
      };

      this.registration!.active!.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Vider un cache spécifique
   */
  async clearCache(cacheName: string): Promise<void> {
    if (!this.registration?.active) {
      throw new Error('No active Service Worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve();
        } else {
          reject(new Error('Failed to clear cache'));
        }
      };

      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE', payload: { cacheName } },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Précharger des ressources
   */
  async preloadResources(urls: string[]): Promise<void> {
    if (!this.registration?.active) {
      throw new Error('No active Service Worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'RESOURCES_PRELOADED') {
          resolve();
        } else {
          reject(new Error('Failed to preload resources'));
        }
      };

      this.registration!.active!.postMessage(
        { type: 'PRELOAD_RESOURCES', payload: { urls } },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Écouter un événement
   */
  on<K extends keyof ServiceWorkerEvents>(
    event: K,
    listener: (data: ServiceWorkerEvents[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Supprimer un listener
   */
  off<K extends keyof ServiceWorkerEvents>(
    event: K,
    listener: (data: ServiceWorkerEvents[K]) => void
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Émettre un événement
   */
  private emit<K extends keyof ServiceWorkerEvents>(
    event: K,
    data?: ServiceWorkerEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data as any));
    }
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
    this.listeners.clear();
  }

  /**
   * Obtenir le statut du Service Worker
   */
  getStatus(): {
    supported: boolean;
    registered: boolean;
    active: boolean;
    waiting: boolean;
  } {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      active: !!this.registration?.active,
      waiting: !!this.registration?.waiting
    };
  }
}

/**
 * Hook React pour utiliser le Service Worker
 */
export function useServiceWorker() {
  const [swManager] = React.useState(() => new ServiceWorkerManager());
  const [status, setStatus] = React.useState(swManager.getStatus());
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    // Initialiser le Service Worker
    swManager.init();

    // Écouter les événements
    const handleRegistered = () => {
      setStatus(swManager.getStatus());
    };

    const handleUpdated = () => {
      setStatus(swManager.getStatus());
      setUpdateAvailable(true);
    };

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    swManager.on('sw-registered', handleRegistered);
    swManager.on('sw-updated', handleUpdated);
    swManager.on('sw-online', handleOnline);
    swManager.on('sw-offline', handleOffline);

    // Cleanup
    return () => {
      swManager.off('sw-registered', handleRegistered);
      swManager.off('sw-updated', handleUpdated);
      swManager.off('sw-online', handleOnline);
      swManager.off('sw-offline', handleOffline);
      swManager.cleanup();
    };
  }, [swManager]);

  const activateUpdate = React.useCallback(async () => {
    await swManager.activateUpdate();
    setUpdateAvailable(false);
  }, [swManager]);

  const checkForUpdates = React.useCallback(() => {
    return swManager.checkForUpdates();
  }, [swManager]);

  return {
    status,
    updateAvailable,
    isOnline,
    activateUpdate,
    checkForUpdates,
    swManager
  };
}

/**
 * Composant pour afficher les notifications de mise à jour
 */
export function ServiceWorkerUpdateNotification() {
  const { updateAvailable, activateUpdate } = useServiceWorker();

  if (!updateAvailable) return null;

  return React.createElement('div', {
    className: 'fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50'
  }, [
    React.createElement('div', {
      key: 'content',
      className: 'flex items-center space-x-3'
    }, [
      React.createElement('div', { key: 'text' }, [
        React.createElement('h4', {
          key: 'title',
          className: 'font-semibold'
        }, 'Mise à jour disponible'),
        React.createElement('p', {
          key: 'description',
          className: 'text-sm opacity-90'
        }, 'Une nouvelle version de l\'application est prête.')
      ]),
      React.createElement('button', {
        key: 'button',
        onClick: activateUpdate,
        className: 'bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors'
      }, 'Mettre à jour')
    ])
  ]);
}

/**
 * Composant pour afficher le statut de connexion
 */
export function NetworkStatusIndicator() {
  const { isOnline } = useServiceWorker();

  if (isOnline) return null;

  return React.createElement('div', {
    className: 'fixed top-0 left-0 right-0 bg-yellow-600 text-white p-2 text-center text-sm z-50'
  }, '📱 Mode hors ligne - Certaines fonctionnalités peuvent être limitées');
}

// Instance globale du gestionnaire
export const swManager = new ServiceWorkerManager();