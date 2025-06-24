/**
 * Service de synchronisation multi-device
 * Task 16: Backend et Synchronisation - Phase 4
 */

import {
  SyncType,
  SyncStatus,
  SyncedDataType,
  ConflictResolutionStrategy,
  type SyncConfiguration,
  type SyncItem,
  SyncItemStatus,
  type ConflictData,
  ConflictType,
  type ConflictResolution,
  type SyncState,
  type SyncError,
  ConnectionQuality,
  type SyncResult,
  type SyncStatistics,
  BACKEND_CONSTANTS
} from '../../types/backend';

class SyncService {
  private syncState: SyncState = {
    status: SyncStatus.IDLE,
    lastSync: 0,
    nextSync: 0,
    totalItems: 0,
    syncedItems: 0,
    pendingItems: 0,
    conflictItems: 0,
    errorItems: 0,
    averageSyncTime: 0,
    lastSyncDuration: 0,
    errorCount: 0,
    isOnline: navigator.onLine,
    connectionQuality: ConnectionQuality.GOOD
  };

  private syncConfiguration: SyncConfiguration = {
    enabled: true,
    autoSync: true,
    syncInterval: 15,
    syncedDataTypes: [
      SyncedDataType.USER_PROFILE,
      SyncedDataType.GAME_PROGRESS,
      SyncedDataType.ACHIEVEMENTS,
      SyncedDataType.SETTINGS
    ],
    conflictResolution: ConflictResolutionStrategy.LAST_MODIFIED_WINS,
    maxConflictAge: 24,
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 1000,
    encryptData: true,
    requireAuth: true,
    enableOfflineMode: true,
    offlineStorageLimit: 50
  };

  private syncQueue: SyncItem[] = [];
  private conflicts: ConflictData[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeService();
  }

  // === INITIALISATION ===

  private initializeService(): void {
    this.loadFromStorage();
    this.setupNetworkMonitoring();
    this.startAutoSync();
  }

  private loadFromStorage(): void {
    try {
      // Charger la configuration
      const storedConfig = localStorage.getItem('sync_configuration');
      if (storedConfig) {
        this.syncConfiguration = { ...this.syncConfiguration, ...JSON.parse(storedConfig) };
      }

      // Charger l'état de synchronisation
      const storedState = localStorage.getItem('sync_state');
      if (storedState) {
        this.syncState = { ...this.syncState, ...JSON.parse(storedState) };
      }

      // Charger la queue de synchronisation
      const storedQueue = localStorage.getItem('sync_queue');
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
      }

      // Charger les conflits
      const storedConflicts = localStorage.getItem('sync_conflicts');
      if (storedConflicts) {
        this.conflicts = JSON.parse(storedConflicts);
      }
    } catch (error) {
      console.error('Erreur chargement synchronisation:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('sync_configuration', JSON.stringify(this.syncConfiguration));
      localStorage.setItem('sync_state', JSON.stringify(this.syncState));
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
      localStorage.setItem('sync_conflicts', JSON.stringify(this.conflicts));
    } catch (error) {
      console.error('Erreur sauvegarde synchronisation:', error);
    }
  }

  // === SYNCHRONISATION PRINCIPALE ===

  /**
   * Démarre une synchronisation
   */
  async startSync(type: SyncType = SyncType.INCREMENTAL): Promise<SyncResult> {
    if (!this.syncConfiguration.enabled) {
      throw new Error('Synchronisation désactivée');
    }

    if (this.syncState.status === SyncStatus.SYNCING) {
      throw new Error('Synchronisation déjà en cours');
    }

    this.setSyncStatus(SyncStatus.SYNCING);
    const startTime = Date.now();

    try {
      // Préparer les éléments à synchroniser
      const itemsToSync = await this.prepareItemsForSync(type);
      
      if (itemsToSync.length === 0) {
        this.setSyncStatus(SyncStatus.SUCCESS);
        return this.createSyncResult([], [], [], startTime);
      }

      // Synchroniser par lots
      const syncedItems: SyncItem[] = [];
      const conflicts: ConflictData[] = [];
      const errors: SyncError[] = [];

      for (let i = 0; i < itemsToSync.length; i += this.syncConfiguration.batchSize) {
        const batch = itemsToSync.slice(i, i + this.syncConfiguration.batchSize);
        
        try {
          const batchResult = await this.syncBatch(batch);
          syncedItems.push(...batchResult.syncedItems);
          conflicts.push(...batchResult.conflicts);
          errors.push(...batchResult.errors);
          
          // Mettre à jour le progrès
          this.updateSyncProgress(i + batch.length, itemsToSync.length);
        } catch (error) {
          console.error('Erreur synchronisation lot:', error);
          errors.push({
            code: 'BATCH_SYNC_ERROR',
            message: `Erreur lors de la synchronisation du lot ${Math.floor(i / this.syncConfiguration.batchSize) + 1}`,
            details: error,
            timestamp: Date.now(),
            recoverable: true
          });
        }
      }

      // Finaliser la synchronisation
      const duration = Date.now() - startTime;
      this.updateSyncState(syncedItems, conflicts, errors, duration);
      
      const result = this.createSyncResult(syncedItems, conflicts, errors, startTime);
      
      if (errors.length === 0) {
        this.setSyncStatus(SyncStatus.SUCCESS);
      } else if (conflicts.length > 0) {
        this.setSyncStatus(SyncStatus.CONFLICT);
      } else {
        this.setSyncStatus(SyncStatus.ERROR);
      }

      this.emitEvent('sync_completed', { result });
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.setSyncStatus(SyncStatus.ERROR);
      
      const syncError: SyncError = {
        code: 'SYNC_FAILED',
        message: 'Échec de la synchronisation',
        details: error,
        timestamp: Date.now(),
        recoverable: true
      };

      this.syncState.lastError = syncError;
      this.syncState.errorCount++;
      this.saveToStorage();

      this.emitEvent('sync_error', { error: syncError });
      throw error;
    }
  }

  /**
   * Ajoute un élément à la queue de synchronisation
   */
  async queueForSync(
    type: SyncedDataType,
    data: any,
    id?: string
  ): Promise<SyncItem> {
    const item: SyncItem = {
      id: id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      version: 1,
      lastModified: Date.now(),
      checksum: this.calculateChecksum(data),
      syncStatus: SyncItemStatus.PENDING,
      syncRetries: 0
    };

    // Vérifier s'il existe déjà un élément avec le même ID
    const existingIndex = this.syncQueue.findIndex(existing => existing.id === item.id);
    if (existingIndex !== -1) {
      // Mettre à jour l'élément existant
      const existing = this.syncQueue[existingIndex];
      item.version = existing.version + 1;
      this.syncQueue[existingIndex] = item;
    } else {
      // Ajouter un nouvel élément
      this.syncQueue.push(item);
    }

    this.updateSyncCounts();
    this.saveToStorage();

    this.emitEvent('item_queued', { item });

    // Déclencher une synchronisation automatique si activée
    if (this.syncConfiguration.autoSync && this.isOnline) {
      this.scheduleNextSync(5000); // Dans 5 secondes
    }

    return item;
  }

  // === RÉSOLUTION DE CONFLITS ===

  /**
   * Résout un conflit manuellement
   */
  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void> {
    const conflictIndex = this.conflicts.findIndex(c => c.detectedAt.toString() === conflictId);
    if (conflictIndex === -1) {
      throw new Error('Conflit introuvable');
    }

    const conflict = this.conflicts[conflictIndex];
    
    try {
      // Appliquer la résolution
      conflict.resolution = resolution;
      conflict.resolvedAt = Date.now();

      // Mettre à jour l'élément dans la queue
      const queueItem = this.syncQueue.find(item => 
        item.conflictData && item.conflictData.detectedAt === conflict.detectedAt
      );

      if (queueItem) {
        queueItem.data = resolution.resolvedData;
        queueItem.syncStatus = SyncItemStatus.PENDING;
        queueItem.conflictData = undefined;
      }

      // Supprimer le conflit de la liste
      this.conflicts.splice(conflictIndex, 1);
      
      this.updateSyncCounts();
      this.saveToStorage();

      this.emitEvent('conflict_resolved', { conflict, resolution });

      // Déclencher une synchronisation pour appliquer la résolution
      if (this.syncConfiguration.autoSync) {
        this.scheduleNextSync(1000);
      }

    } catch (error) {
      console.error('Erreur résolution conflit:', error);
      throw error;
    }
  }

  /**
   * Résout automatiquement les conflits selon la stratégie configurée
   */
  private async autoResolveConflicts(conflicts: ConflictData[]): Promise<ConflictData[]> {
    const unresolvedConflicts: ConflictData[] = [];

    for (const conflict of conflicts) {
      try {
        const resolution = this.createAutoResolution(conflict);
        if (resolution) {
          conflict.resolution = resolution;
          conflict.resolvedAt = Date.now();
        } else {
          unresolvedConflicts.push(conflict);
        }
      } catch (error) {
        console.error('Erreur résolution automatique:', error);
        unresolvedConflicts.push(conflict);
      }
    }

    return unresolvedConflicts;
  }

  private createAutoResolution(conflict: ConflictData): ConflictResolution | null {
    const strategy = this.syncConfiguration.conflictResolution;

    switch (strategy) {
      case ConflictResolutionStrategy.CLIENT_WINS:
        return {
          strategy,
          resolvedData: conflict.clientVersion,
          resolvedBy: 'system',
          resolvedAt: Date.now(),
          notes: 'Résolution automatique : version client'
        };

      case ConflictResolutionStrategy.SERVER_WINS:
        return {
          strategy,
          resolvedData: conflict.serverVersion,
          resolvedBy: 'system',
          resolvedAt: Date.now(),
          notes: 'Résolution automatique : version serveur'
        };

      case ConflictResolutionStrategy.LAST_MODIFIED_WINS:
        const clientModified = conflict.clientVersion?.lastModified || 0;
        const serverModified = conflict.serverVersion?.lastModified || 0;
        
        return {
          strategy,
          resolvedData: clientModified > serverModified ? conflict.clientVersion : conflict.serverVersion,
          resolvedBy: 'system',
          resolvedAt: Date.now(),
          notes: `Résolution automatique : version ${clientModified > serverModified ? 'client' : 'serveur'} plus récente`
        };

      case ConflictResolutionStrategy.MERGE_SMART:
        const mergedData = this.smartMerge(conflict.clientVersion, conflict.serverVersion);
        if (mergedData) {
          return {
            strategy,
            resolvedData: mergedData,
            resolvedBy: 'system',
            resolvedAt: Date.now(),
            notes: 'Résolution automatique : fusion intelligente'
          };
        }
        return null;

      case ConflictResolutionStrategy.MANUAL_RESOLUTION:
      default:
        return null;
    }
  }

  private smartMerge(clientData: any, serverData: any): any | null {
    try {
      // Fusion simple pour les objets
      if (typeof clientData === 'object' && typeof serverData === 'object') {
        const merged = { ...serverData, ...clientData };
        
        // Pour certains champs, préférer la version serveur
        const serverPreferredFields = ['id', 'createdAt', 'permissions'];
        serverPreferredFields.forEach(field => {
          if (serverData[field] !== undefined) {
            merged[field] = serverData[field];
          }
        });

        return merged;
      }

      return null;
    } catch (error) {
      console.error('Erreur fusion intelligente:', error);
      return null;
    }
  }

  // === MÉTHODES PRIVÉES ===

  private async prepareItemsForSync(type: SyncType): Promise<SyncItem[]> {
    let itemsToSync: SyncItem[];

    switch (type) {
      case SyncType.FULL:
        // Synchroniser tous les éléments
        itemsToSync = [...this.syncQueue];
        break;

      case SyncType.INCREMENTAL:
        // Synchroniser seulement les éléments modifiés
        itemsToSync = this.syncQueue.filter(item => 
          item.syncStatus === SyncItemStatus.PENDING || 
          item.syncStatus === SyncItemStatus.ERROR
        );
        break;

      case SyncType.CONFLICT_RESOLUTION:
        // Synchroniser seulement les éléments avec conflits résolus
        itemsToSync = this.syncQueue.filter(item => 
          item.syncStatus === SyncItemStatus.CONFLICT && 
          item.conflictData?.resolvedAt
        );
        break;

      case SyncType.FORCE_PUSH:
        // Forcer l'envoi de tous les éléments
        itemsToSync = this.syncQueue.map(item => ({
          ...item,
          syncStatus: SyncItemStatus.PENDING
        }));
        break;

      case SyncType.FORCE_PULL:
        // Télécharger toutes les données du serveur
        itemsToSync = await this.getAllServerItems();
        break;

      default:
        itemsToSync = [];
    }

    return itemsToSync;
  }

  private async syncBatch(batch: SyncItem[]): Promise<{
    syncedItems: SyncItem[];
    conflicts: ConflictData[];
    errors: SyncError[];
  }> {
    // Simuler la synchronisation avec le serveur
    await this.delay(500 + Math.random() * 1000);

    const syncedItems: SyncItem[] = [];
    const conflicts: ConflictData[] = [];
    const errors: SyncError[] = [];

    for (const item of batch) {
      try {
        // Simuler différents scénarios
        const random = Math.random();
        
        if (random < 0.1) {
          // 10% de chance de conflit
          const conflict: ConflictData = {
            clientVersion: item.data,
            serverVersion: { ...item.data, serverModified: true },
            conflictType: ConflictType.UPDATE_UPDATE,
            detectedAt: Date.now()
          };
          
          item.syncStatus = SyncItemStatus.CONFLICT;
          item.conflictData = conflict;
          conflicts.push(conflict);
        } else if (random < 0.05) {
          // 5% de chance d'erreur
          const error: SyncError = {
            code: 'SYNC_ITEM_ERROR',
            message: `Erreur lors de la synchronisation de l'élément ${item.id}`,
            details: 'Erreur simulée',
            timestamp: Date.now(),
            recoverable: true
          };
          
          item.syncStatus = SyncItemStatus.ERROR;
          item.syncRetries++;
          errors.push(error);
        } else {
          // Succès
          item.syncStatus = SyncItemStatus.SYNCED;
          item.lastSyncAt = Date.now();
          syncedItems.push(item);
        }
      } catch (error) {
        console.error('Erreur synchronisation élément:', error);
        errors.push({
          code: 'ITEM_SYNC_ERROR',
          message: `Erreur lors de la synchronisation de l'élément ${item.id}`,
          details: error,
          timestamp: Date.now(),
          recoverable: true
        });
      }
    }

    return { syncedItems, conflicts, errors };
  }

  private async getAllServerItems(): Promise<SyncItem[]> {
    // Simuler la récupération des données serveur
    await this.delay(1000);
    
    // Retourner des données simulées
    return [];
  }

  private updateSyncProgress(completed: number, total: number): void {
    const progress = completed / total;
    this.syncState.syncedItems = completed;
    this.syncState.totalItems = total;
    
    this.emitEvent('sync_progress', { 
      progress, 
      completed, 
      total 
    });
  }

  private updateSyncState(
    syncedItems: SyncItem[],
    conflicts: ConflictData[],
    errors: SyncError[],
    duration: number
  ): void {
    this.syncState.lastSync = Date.now();
    this.syncState.nextSync = Date.now() + (this.syncConfiguration.syncInterval * 60 * 1000);
    this.syncState.lastSyncDuration = duration;
    
    // Calculer la moyenne des temps de synchronisation
    if (this.syncState.averageSyncTime === 0) {
      this.syncState.averageSyncTime = duration;
    } else {
      this.syncState.averageSyncTime = (this.syncState.averageSyncTime + duration) / 2;
    }

    // Ajouter les nouveaux conflits
    this.conflicts.push(...conflicts);
    
    // Nettoyer les anciens conflits
    this.cleanupOldConflicts();
    
    this.updateSyncCounts();
    this.saveToStorage();
  }

  private updateSyncCounts(): void {
    this.syncState.totalItems = this.syncQueue.length;
    this.syncState.syncedItems = this.syncQueue.filter(item => item.syncStatus === SyncItemStatus.SYNCED).length;
    this.syncState.pendingItems = this.syncQueue.filter(item => item.syncStatus === SyncItemStatus.PENDING).length;
    this.syncState.conflictItems = this.conflicts.length;
    this.syncState.errorItems = this.syncQueue.filter(item => item.syncStatus === SyncItemStatus.ERROR).length;
  }

  private cleanupOldConflicts(): void {
    const maxAge = this.syncConfiguration.maxConflictAge * 60 * 60 * 1000; // Convertir en ms
    const cutoff = Date.now() - maxAge;
    
    this.conflicts = this.conflicts.filter(conflict => 
      conflict.detectedAt > cutoff || !conflict.resolvedAt
    );
  }

  private createSyncResult(
    syncedItems: SyncItem[],
    conflicts: ConflictData[],
    errors: SyncError[],
    startTime: number
  ): SyncResult {
    const duration = Date.now() - startTime;
    
    return {
      success: errors.length === 0,
      syncedItems,
      conflicts,
      errors,
      statistics: {
        totalItems: this.syncState.totalItems,
        successCount: syncedItems.length,
        errorCount: errors.length,
        conflictCount: conflicts.length,
        duration,
        bytesTransferred: this.calculateBytesTransferred(syncedItems)
      }
    };
  }

  private calculateBytesTransferred(items: SyncItem[]): number {
    return items.reduce((total, item) => {
      return total + JSON.stringify(item.data).length;
    }, 0);
  }

  private calculateChecksum(data: any): string {
    // Simple checksum basé sur le JSON
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // === SURVEILLANCE RÉSEAU ===

  private setupNetworkMonitoring(): void {
    // Surveiller l'état de la connexion
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncState.isOnline = true;
      this.syncState.connectionQuality = this.determineConnectionQuality();
      this.emitEvent('network_online', {});
      
      // Reprendre la synchronisation automatique
      if (this.syncConfiguration.autoSync) {
        this.scheduleNextSync(1000);
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.syncState.isOnline = false;
      this.syncState.connectionQuality = ConnectionQuality.OFFLINE;
      this.emitEvent('network_offline', {});
    });

    // Surveiller la qualité de la connexion
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.syncState.connectionQuality = this.determineConnectionQuality();
        this.emitEvent('connection_quality_changed', { 
          quality: this.syncState.connectionQuality 
        });
      });
    }
  }

  private determineConnectionQuality(): ConnectionQuality {
    if (!this.isOnline) {
      return ConnectionQuality.OFFLINE;
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const downlink = connection.downlink || 1;
      
      if (downlink >= 10) return ConnectionQuality.EXCELLENT;
      if (downlink >= 5) return ConnectionQuality.GOOD;
      if (downlink >= 1) return ConnectionQuality.FAIR;
      return ConnectionQuality.POOR;
    }

    return ConnectionQuality.GOOD; // Par défaut
  }

  // === SYNCHRONISATION AUTOMATIQUE ===

  private startAutoSync(): void {
    if (!this.syncConfiguration.autoSync || !this.syncConfiguration.enabled) {
      return;
    }

    this.scheduleNextSync();
  }

  private scheduleNextSync(delayMs?: number): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    const delay = delayMs || (this.syncConfiguration.syncInterval * 60 * 1000);
    
    this.syncTimer = setTimeout(async () => {
      if (this.syncConfiguration.autoSync && this.isOnline && this.syncQueue.length > 0) {
        try {
          await this.startSync(SyncType.INCREMENTAL);
        } catch (error) {
          console.error('Erreur synchronisation automatique:', error);
        }
      }
      
      // Planifier la prochaine synchronisation
      this.scheduleNextSync();
    }, delay);
  }

  // === CONFIGURATION ===

  updateConfiguration(updates: Partial<SyncConfiguration>): void {
    this.syncConfiguration = { ...this.syncConfiguration, ...updates };
    this.saveToStorage();
    
    // Redémarrer la synchronisation automatique si nécessaire
    if (updates.autoSync !== undefined || updates.syncInterval !== undefined) {
      this.startAutoSync();
    }

    this.emitEvent('configuration_updated', { configuration: this.syncConfiguration });
  }

  // === UTILITAIRES ===

  private setSyncStatus(status: SyncStatus): void {
    const previousStatus = this.syncState.status;
    this.syncState.status = status;
    
    this.emitEvent('sync_status_changed', { 
      previousStatus, 
      currentStatus: status 
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === ÉVÉNEMENTS ===

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // === GETTERS ===

  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  getSyncConfiguration(): SyncConfiguration {
    return { ...this.syncConfiguration };
  }

  getConflicts(): ConflictData[] {
    return [...this.conflicts];
  }

  getSyncQueue(): SyncItem[] {
    return [...this.syncQueue];
  }

  isOnlineMode(): boolean {
    return this.isOnline;
  }

  isSyncing(): boolean {
    return this.syncState.status === SyncStatus.SYNCING;
  }

  getConnectionQuality(): ConnectionQuality {
    return this.syncState.connectionQuality;
  }
}

// Instance singleton
export const syncService = new SyncService();
export default syncService;