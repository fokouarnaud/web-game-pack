/**
 * Types pour le système backend et synchronisation
 * Task 16: Backend et Synchronisation - Phase 4
 */

// Providers d'authentification
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  GITHUB = 'github',
  DISCORD = 'discord',
  TWITTER = 'twitter',
  MICROSOFT = 'microsoft'
}

// États d'authentification
export enum AuthState {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
  REFRESHING = 'refreshing',
  EXPIRED = 'expired'
}

// Types de synchronisation
export enum SyncType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  FORCE_PUSH = 'force_push',
  FORCE_PULL = 'force_pull'
}

// États de synchronisation
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  CONFLICT = 'conflict',
  OFFLINE = 'offline'
}

// Types d'analytics
export enum AnalyticsEventType {
  USER_ACTION = 'user_action',
  GAME_EVENT = 'game_event',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  CUSTOM = 'custom'
}

// Utilisateur authentifié
export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Profil utilisateur
  profile: UserProfile;
  
  // Métadonnées d'auth
  provider: AuthProvider;
  providerId: string;
  
  // Tokens
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  
  // Permissions
  roles: UserRole[];
  permissions: Permission[];
  
  // Audit
  createdAt: number;
  lastLoginAt: number;
  lastActiveAt: number;
  
  // Paramètres de compte
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  subscriptionStatus: SubscriptionStatus;
  
  // Préférences
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

// Profil utilisateur
export interface UserProfile {
  // Informations personnelles
  firstName?: string;
  lastName?: string;
  username: string;
  bio?: string;
  location?: string;
  timezone: string;
  language: string;
  
  // Avatar
  avatar: AvatarInfo;
  
  // Statistiques publiques
  level: number;
  totalXP: number;
  gamesPlayed: number;
  achievements: string[];
  
  // Liens sociaux
  socialLinks: SocialLink[];
  
  // Paramètres de profil
  isPublic: boolean;
  showOnLeaderboard: boolean;
  allowFriendRequests: boolean;
}

// Informations avatar
export interface AvatarInfo {
  url?: string;
  type: 'uploaded' | 'generated' | 'default';
  generatedSeed?: string;
  customization?: AvatarCustomization;
}

// Customisation avatar
export interface AvatarCustomization {
  style: string;
  backgroundColor: string;
  accessories: string[];
  mood: string;
}

// Lien social
export interface SocialLink {
  platform: string;
  url: string;
  isPublic: boolean;
}

// Rôle utilisateur
export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  EDUCATOR = 'educator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Permission
export interface Permission {
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

// Condition de permission
export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

// Statut d'abonnement
export enum SubscriptionStatus {
  FREE = 'free',
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Préférences utilisateur
export interface UserPreferences {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  gameReminders: boolean;
  
  // Communication
  allowDirectMessages: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  
  // Données
  autoSync: boolean;
  syncFrequency: number; // minutes
  dataRetention: number; // jours
  
  // Accessibilité
  reducedMotion: boolean;
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large';
  
  // Gameplay
  autoSave: boolean;
  pauseOnBlur: boolean;
  showHints: boolean;
}

// Paramètres de confidentialité
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showRealName: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showActivity: boolean;
  allowAnalytics: boolean;
  allowDataCollection: boolean;
  allowTargetedAds: boolean;
}

// Session d'authentification
export interface AuthSession {
  id: string;
  userId: string;
  
  // Session info
  startedAt: number;
  lastActiveAt: number;
  expiresAt: number;
  
  // Device info
  deviceId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: GeoLocation;
  
  // État
  isActive: boolean;
  isRevoked: boolean;
}

// Localisation géographique
export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

// API Response générique
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// Erreur API
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  traceId?: string;
}

// Métadonnées de réponse
export interface ResponseMeta {
  pagination?: PaginationInfo;
  timing?: TimingInfo;
  version: string;
}

// Information de pagination
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Information de timing
export interface TimingInfo {
  requestId: string;
  duration: number;
  cached: boolean;
  timestamp: number;
}

// Configuration de synchronisation
export interface SyncConfiguration {
  // Paramètres de base
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  
  // Données à synchroniser
  syncedDataTypes: SyncedDataType[];
  
  // Gestion des conflits
  conflictResolution: ConflictResolutionStrategy;
  maxConflictAge: number; // heures
  
  // Performance
  batchSize: number;
  maxRetries: number;
  retryDelay: number; // ms
  
  // Sécurité
  encryptData: boolean;
  requireAuth: boolean;
  
  // Offline
  enableOfflineMode: boolean;
  offlineStorageLimit: number; // MB
}

// Types de données synchronisées
export enum SyncedDataType {
  USER_PROFILE = 'user_profile',
  GAME_PROGRESS = 'game_progress',
  ACHIEVEMENTS = 'achievements',
  SETTINGS = 'settings',
  FRIENDS = 'friends',
  SCORES = 'scores',
  CUSTOM_CONTENT = 'custom_content',
  LEARNING_DATA = 'learning_data'
}

// Stratégies de résolution de conflits
export enum ConflictResolutionStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  LAST_MODIFIED_WINS = 'last_modified_wins',
  MANUAL_RESOLUTION = 'manual_resolution',
  MERGE_SMART = 'merge_smart'
}

// Élément de synchronisation
export interface SyncItem {
  id: string;
  type: SyncedDataType;
  
  // Données
  data: any;
  
  // Métadonnées
  version: number;
  lastModified: number;
  checksum: string;
  
  // Synchronisation
  syncStatus: SyncItemStatus;
  lastSyncAt?: number;
  syncRetries: number;
  
  // Conflit
  conflictData?: ConflictData;
}

// Statut d'élément de sync
export enum SyncItemStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  ERROR = 'error',
  DELETED = 'deleted'
}

// Données de conflit
export interface ConflictData {
  clientVersion: any;
  serverVersion: any;
  conflictType: ConflictType;
  detectedAt: number;
  resolvedAt?: number;
  resolution?: ConflictResolution;
}

// Types de conflits
export enum ConflictType {
  UPDATE_UPDATE = 'update_update',
  UPDATE_DELETE = 'update_delete',
  DELETE_UPDATE = 'delete_update',
  SCHEMA_MISMATCH = 'schema_mismatch'
}

// Résolution de conflit
export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolvedData: any;
  resolvedBy: string;
  resolvedAt: number;
  notes?: string;
}

// État de synchronisation
export interface SyncState {
  // État global
  status: SyncStatus;
  lastSync: number;
  nextSync: number;
  
  // Progression
  totalItems: number;
  syncedItems: number;
  pendingItems: number;
  conflictItems: number;
  errorItems: number;
  
  // Performance
  averageSyncTime: number;
  lastSyncDuration: number;
  
  // Erreurs
  lastError?: SyncError;
  errorCount: number;
  
  // Réseau
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
}

// Erreur de synchronisation
export interface SyncError {
  code: string;
  message: string;
  details: any;
  timestamp: number;
  recoverable: boolean;
  retryAfter?: number;
}

// Qualité de connexion
export enum ConnectionQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  OFFLINE = 'offline'
}

// Sauvegarde cloud
export interface CloudBackup {
  id: string;
  userId: string;
  
  // Métadonnées
  createdAt: number;
  size: number; // bytes
  version: string;
  
  // Contenu
  dataTypes: SyncedDataType[];
  checksum: string;
  
  // Storage
  storageProvider: string;
  storageKey: string;
  encryptionKey?: string;
  
  // État
  status: BackupStatus;
  progress: number; // 0-1
  
  // Restauration
  restorable: boolean;
  lastRestoreAt?: number;
}

// Statut de sauvegarde
export enum BackupStatus {
  CREATING = 'creating',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CORRUPTED = 'corrupted'
}

// Configuration de sauvegarde
export interface BackupConfiguration {
  // Automatique
  autoBackup: boolean;
  backupFrequency: number; // heures
  maxBackups: number;
  
  // Données
  includedDataTypes: SyncedDataType[];
  compressionLevel: number; // 0-9
  encryptionEnabled: boolean;
  
  // Stockage
  storageProvider: string;
  storageQuota: number; // MB
  
  // Nettoyage
  autoCleanup: boolean;
  retentionPeriod: number; // jours
}

// Événement d'analytics
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  
  // Événement
  type: AnalyticsEventType;
  name: string;
  category: string;
  
  // Données
  properties: Record<string, any>;
  value?: number;
  
  // Contexte
  timestamp: number;
  timezone: string;
  
  // Device/Session
  deviceInfo: DeviceInfo;
  userAgent: string;
  
  // Localisation
  location?: GeoLocation;
  
  // Performance
  performance?: PerformanceMetrics;
}

// Information device
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screenResolution: string;
  colorDepth: number;
  language: string;
  timezone: string;
}

// Métriques de performance
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Autres métriques
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkSpeed?: string;
}

// Données d'analytics agrégées
export interface AnalyticsData {
  // Période
  startDate: number;
  endDate: number;
  
  // Utilisateurs
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  
  // Sessions
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Engagement
  pageViews: number;
  uniquePageViews: number;
  eventsCount: number;
  
  // Performance
  averageLoadTime: number;
  performanceScore: number;
  
  // Géographie
  topCountries: CountryStats[];
  
  // Devices
  deviceBreakdown: DeviceStats[];
  
  // Événements populaires
  topEvents: EventStats[];
}

// Statistiques par pays
export interface CountryStats {
  country: string;
  users: number;
  sessions: number;
  percentage: number;
}

// Statistiques par device
export interface DeviceStats {
  deviceType: string;
  users: number;
  percentage: number;
  averageSessionDuration: number;
}

// Statistiques d'événements
export interface EventStats {
  eventName: string;
  count: number;
  uniqueUsers: number;
  percentage: number;
}

// Configuration API
export interface ApiConfiguration {
  // URLs
  baseUrl: string;
  authUrl: string;
  apiVersion: string;
  
  // Authentification
  clientId: string;
  clientSecret?: string;
  
  // Timeouts
  requestTimeout: number;
  retryTimeout: number;
  maxRetries: number;
  
  // Rate limiting
  rateLimitRequests: number;
  rateLimitWindow: number; // ms
  
  // Cache
  cacheEnabled: boolean;
  cacheTtl: number; // seconds
  
  // Sécurité
  enableCsrf: boolean;
  allowedOrigins: string[];
  
  // Monitoring
  enableMetrics: boolean;
  metricsEndpoint?: string;
}

// Client API
export interface ApiClient {
  // Configuration
  config: ApiConfiguration;
  
  // État
  isConnected: boolean;
  lastPing: number;
  latency: number;
  
  // Authentification
  authenticate(provider: AuthProvider, credentials: any): Promise<AuthenticatedUser>;
  refreshToken(refreshToken: string): Promise<string>;
  logout(): Promise<void>;
  
  // Données utilisateur
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile>;
  
  // Synchronisation
  sync(items: SyncItem[]): Promise<SyncResult>;
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
  
  // Sauvegarde
  createBackup(dataTypes: SyncedDataType[]): Promise<CloudBackup>;
  restoreBackup(backupId: string): Promise<void>;
  listBackups(userId: string): Promise<CloudBackup[]>;
  
  // Analytics
  trackEvent(event: AnalyticsEvent): Promise<void>;
  getAnalytics(userId: string, startDate: number, endDate: number): Promise<AnalyticsData>;
  
  // Utilitaires
  healthCheck(): Promise<HealthStatus>;
  getServerInfo(): Promise<ServerInfo>;
}

// Résultat de synchronisation
export interface SyncResult {
  success: boolean;
  syncedItems: SyncItem[];
  conflicts: ConflictData[];
  errors: SyncError[];
  statistics: SyncStatistics;
}

// Statistiques de synchronisation
export interface SyncStatistics {
  totalItems: number;
  successCount: number;
  errorCount: number;
  conflictCount: number;
  duration: number;
  bytesTransferred: number;
}

// État de santé
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: HealthCheck[];
}

// Vérification de santé
export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  details?: any;
}

// Information serveur
export interface ServerInfo {
  version: string;
  environment: string;
  region: string;
  capabilities: string[];
  limits: ServerLimits;
}

// Limites serveur
export interface ServerLimits {
  maxRequestSize: number;
  maxResponseSize: number;
  maxConcurrentRequests: number;
  rateLimits: RateLimit[];
}

// Limite de taux
export interface RateLimit {
  endpoint: string;
  requests: number;
  window: number; // seconds
}

// État du backend
export interface BackendState {
  // Authentification
  auth: {
    user: AuthenticatedUser | null;
    state: AuthState;
    error: string | null;
  };
  
  // Synchronisation
  sync: {
    state: SyncState;
    configuration: SyncConfiguration;
    conflicts: ConflictData[];
  };
  
  // Sauvegarde
  backup: {
    configuration: BackupConfiguration;
    backups: CloudBackup[];
    currentBackup: CloudBackup | null;
  };
  
  // Analytics
  analytics: {
    enabled: boolean;
    events: AnalyticsEvent[];
    data: AnalyticsData | null;
  };
  
  // API
  api: {
    client: ApiClient | null;
    connected: boolean;
    lastError: ApiError | null;
  };
}

// Actions du backend
export type BackendAction =
  | { type: 'AUTH_LOGIN_START'; payload: { provider: AuthProvider } }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { user: AuthenticatedUser } }
  | { type: 'AUTH_LOGIN_ERROR'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT'; payload: {} }
  | { type: 'SYNC_START'; payload: { type: SyncType } }
  | { type: 'SYNC_PROGRESS'; payload: { progress: number } }
  | { type: 'SYNC_SUCCESS'; payload: { result: SyncResult } }
  | { type: 'SYNC_ERROR'; payload: { error: SyncError } }
  | { type: 'BACKUP_CREATE'; payload: { dataTypes: SyncedDataType[] } }
  | { type: 'BACKUP_RESTORE'; payload: { backupId: string } }
  | { type: 'ANALYTICS_TRACK'; payload: { event: AnalyticsEvent } }
  | { type: 'API_CONNECT'; payload: { config: ApiConfiguration } }
  | { type: 'API_DISCONNECT'; payload: {} };

// Constantes
export const BACKEND_CONSTANTS = {
  // Authentification
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Synchronisation
  DEFAULT_SYNC_INTERVAL: 15, // minutes
  MAX_SYNC_RETRIES: 3,
  SYNC_BATCH_SIZE: 100,
  CONFLICT_RETENTION: 7 * 24 * 60 * 60 * 1000, // 7 jours
  
  // Sauvegarde
  DEFAULT_BACKUP_FREQUENCY: 24, // heures
  MAX_BACKUPS: 10,
  BACKUP_RETENTION: 30 * 24 * 60 * 60 * 1000, // 30 jours
  
  // Analytics
  EVENT_BATCH_SIZE: 50,
  EVENT_FLUSH_INTERVAL: 30 * 1000, // 30 secondes
  MAX_EVENT_PROPERTIES: 20,
  
  // API
  DEFAULT_REQUEST_TIMEOUT: 30 * 1000, // 30 secondes
  DEFAULT_RETRY_DELAY: 1000, // 1 seconde
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10 MB
  
  // Cache
  DEFAULT_CACHE_TTL: 5 * 60, // 5 minutes
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100 MB
  
  // Storage
  STORAGE_KEYS: {
    AUTH_USER: 'backend_auth_user',
    AUTH_TOKENS: 'backend_auth_tokens',
    SYNC_STATE: 'backend_sync_state',
    SYNC_QUEUE: 'backend_sync_queue',
    BACKUP_CONFIG: 'backend_backup_config',
    ANALYTICS_QUEUE: 'backend_analytics_queue',
    API_CONFIG: 'backend_api_config'
  }
} as const;