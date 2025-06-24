/**
 * Service d'authentification
 * Task 16: Backend et Synchronisation - Phase 4
 */

import {
  AuthProvider,
  AuthState,
  type AuthenticatedUser,
  type UserProfile,
  UserRole,
  SubscriptionStatus,
  type AuthSession,
  type ApiResponse,
  BACKEND_CONSTANTS
} from '../../types/backend';

class AuthService {
  private currentUser: AuthenticatedUser | null = null;
  private authState: AuthState = AuthState.UNAUTHENTICATED;
  private currentSession: AuthSession | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeService();
  }

  // === INITIALISATION ===

  private initializeService(): void {
    this.loadFromStorage();
    this.setupSessionMonitoring();
  }

  private loadFromStorage(): void {
    try {
      // Charger l'utilisateur depuis le stockage
      const storedUser = localStorage.getItem(BACKEND_CONSTANTS.STORAGE_KEYS.AUTH_USER);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (this.isTokenValid(user.tokenExpiry)) {
          this.currentUser = user;
          this.authState = AuthState.AUTHENTICATED;
          this.startTokenRefreshTimer();
        } else {
          this.logout();
        }
      }
    } catch (error) {
      console.error('Erreur chargement authentification:', error);
      this.logout();
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(
          BACKEND_CONSTANTS.STORAGE_KEYS.AUTH_USER,
          JSON.stringify(this.currentUser)
        );
      } else {
        localStorage.removeItem(BACKEND_CONSTANTS.STORAGE_KEYS.AUTH_USER);
      }
    } catch (error) {
      console.error('Erreur sauvegarde authentification:', error);
    }
  }

  // === AUTHENTIFICATION ===

  /**
   * Connexion avec email et mot de passe
   */
  async loginWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
    this.setAuthState(AuthState.AUTHENTICATING);

    try {
      // Simuler l'authentification email (en production, appel API)
      const response = await this.simulateEmailAuth(email, password);
      
      if (response.success && response.data) {
        const user = response.data;
        await this.handleSuccessfulLogin(user);
        return user;
      } else {
        throw new Error(response.error?.message || 'Échec de l\'authentification');
      }
    } catch (error) {
      this.setAuthState(AuthState.ERROR);
      throw error;
    }
  }

  /**
   * Connexion avec provider OAuth
   */
  async loginWithProvider(provider: AuthProvider): Promise<AuthenticatedUser> {
    this.setAuthState(AuthState.AUTHENTICATING);

    try {
      // Simuler l'authentification OAuth (en production, intégration réelle)
      const response = await this.simulateOAuthLogin(provider);
      
      if (response.success && response.data) {
        const user = response.data;
        await this.handleSuccessfulLogin(user);
        return user;
      } else {
        throw new Error(response.error?.message || 'Échec de l\'authentification OAuth');
      }
    } catch (error) {
      this.setAuthState(AuthState.ERROR);
      throw error;
    }
  }

  /**
   * Inscription avec email
   */
  async registerWithEmail(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<AuthenticatedUser> {
    this.setAuthState(AuthState.AUTHENTICATING);

    try {
      // Simuler l'inscription (en production, appel API)
      const response = await this.simulateEmailRegistration(email, password, displayName);
      
      if (response.success && response.data) {
        const user = response.data;
        await this.handleSuccessfulLogin(user);
        return user;
      } else {
        throw new Error(response.error?.message || 'Échec de l\'inscription');
      }
    } catch (error) {
      this.setAuthState(AuthState.ERROR);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      // Révoquer la session côté serveur
      if (this.currentSession) {
        await this.revokeSession(this.currentSession.id);
      }

      // Nettoyer l'état local
      this.currentUser = null;
      this.currentSession = null;
      this.setAuthState(AuthState.UNAUTHENTICATED);
      
      // Arrêter les timers
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Nettoyer le stockage
      this.saveToStorage();
      
      this.emitEvent('logout', {});
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // === GESTION DES TOKENS ===

  /**
   * Rafraîchissement du token
   */
  async refreshToken(): Promise<string> {
    if (!this.currentUser?.refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    this.setAuthState(AuthState.REFRESHING);

    try {
      // Simuler le rafraîchissement (en production, appel API)
      const response = await this.simulateTokenRefresh(this.currentUser.refreshToken);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, expiresIn } = response.data;
        
        // Mettre à jour les tokens
        this.currentUser.accessToken = accessToken;
        this.currentUser.refreshToken = refreshToken;
        this.currentUser.tokenExpiry = Date.now() + (expiresIn * 1000);
        
        this.setAuthState(AuthState.AUTHENTICATED);
        this.saveToStorage();
        this.startTokenRefreshTimer();
        
        this.emitEvent('token_refreshed', { accessToken });
        
        return accessToken;
      } else {
        throw new Error('Impossible de rafraîchir le token');
      }
    } catch (error) {
      this.setAuthState(AuthState.EXPIRED);
      this.logout();
      throw error;
    }
  }

  private isTokenValid(tokenExpiry: number): boolean {
    return Date.now() < (tokenExpiry - BACKEND_CONSTANTS.TOKEN_REFRESH_THRESHOLD);
  }

  private startTokenRefreshTimer(): void {
    if (!this.currentUser) return;

    const timeUntilRefresh = this.currentUser.tokenExpiry - Date.now() - BACKEND_CONSTANTS.TOKEN_REFRESH_THRESHOLD;
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(error => {
          console.error('Erreur rafraîchissement automatique:', error);
        });
      }, timeUntilRefresh);
    }
  }

  // === GESTION DU PROFIL ===

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      // Simuler la mise à jour (en production, appel API)
      const response = await this.simulateProfileUpdate(this.currentUser.id, updates);
      
      if (response.success && response.data) {
        const updatedProfile = response.data;
        this.currentUser.profile = updatedProfile;
        this.saveToStorage();
        
        this.emitEvent('profile_updated', { profile: updatedProfile });
        
        return updatedProfile;
      } else {
        throw new Error('Impossible de mettre à jour le profil');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      // Simuler le changement de mot de passe (en production, appel API)
      const response = await this.simulatePasswordChange(
        this.currentUser.id, 
        currentPassword, 
        newPassword
      );
      
      if (response.success) {
        this.emitEvent('password_changed', {});
      } else {
        throw new Error(response.error?.message || 'Impossible de changer le mot de passe');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      throw error;
    }
  }

  // === GESTION DES SESSIONS ===

  /**
   * Récupération des sessions actives
   */
  async getActiveSessions(): Promise<AuthSession[]> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      // Simuler la récupération des sessions (en production, appel API)
      const response = await this.simulateGetSessions(this.currentUser.id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Impossible de récupérer les sessions');
      }
    } catch (error) {
      console.error('Erreur récupération sessions:', error);
      throw error;
    }
  }

  /**
   * Révocation d'une session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      // Simuler la révocation (en production, appel API)
      const response = await this.simulateRevokeSession(sessionId);
      
      if (response.success) {
        this.emitEvent('session_revoked', { sessionId });
      } else {
        throw new Error('Impossible de révoquer la session');
      }
    } catch (error) {
      console.error('Erreur révocation session:', error);
      throw error;
    }
  }

  // === MÉTHODES DE SIMULATION ===

  private async simulateEmailAuth(email: string, password: string): Promise<ApiResponse<AuthenticatedUser>> {
    // Simuler un délai réseau
    await this.delay(1500);

    // Simuler une validation
    if (email === 'test@example.com' && password === 'password123') {
      return {
        success: true,
        data: this.createMockUser(email, AuthProvider.EMAIL)
      };
    } else {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect',
          details: null,
          timestamp: Date.now()
        }
      };
    }
  }

  private async simulateOAuthLogin(provider: AuthProvider): Promise<ApiResponse<AuthenticatedUser>> {
    // Simuler un délai réseau
    await this.delay(2000);

    // Simuler le succès pour la démo
    return {
      success: true,
      data: this.createMockUser(`user@${provider}.com`, provider)
    };
  }

  private async simulateEmailRegistration(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<ApiResponse<AuthenticatedUser>> {
    // Simuler un délai réseau
    await this.delay(2000);

    // Simuler une validation d'email
    if (email.includes('@')) {
      const user = this.createMockUser(email, AuthProvider.EMAIL);
      user.displayName = displayName;
      user.profile.firstName = displayName.split(' ')[0];
      user.profile.lastName = displayName.split(' ')[1] || '';
      
      return {
        success: true,
        data: user
      };
    } else {
      return {
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Adresse email invalide',
          details: null,
          timestamp: Date.now()
        }
      };
    }
  }

  private async simulateTokenRefresh(refreshToken: string): Promise<ApiResponse<any>> {
    // Simuler un délai réseau
    await this.delay(500);

    return {
      success: true,
      data: {
        accessToken: `new_access_token_${Date.now()}`,
        refreshToken: `new_refresh_token_${Date.now()}`,
        expiresIn: 3600 // 1 heure
      }
    };
  }

  private async simulateProfileUpdate(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    // Simuler un délai réseau
    await this.delay(1000);

    const currentProfile = this.currentUser?.profile;
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates };
      return {
        success: true,
        data: updatedProfile
      };
    } else {
      return {
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profil utilisateur introuvable',
          details: null,
          timestamp: Date.now()
        }
      };
    }
  }

  private async simulatePasswordChange(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<void>> {
    // Simuler un délai réseau
    await this.delay(1500);

    // Simuler une validation du mot de passe actuel
    if (currentPassword === 'wrongpassword') {
      return {
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Mot de passe actuel incorrect',
          details: null,
          timestamp: Date.now()
        }
      };
    }

    return { success: true };
  }

  private async simulateGetSessions(userId: string): Promise<ApiResponse<AuthSession[]>> {
    // Simuler un délai réseau
    await this.delay(800);

    const sessions: AuthSession[] = [
      {
        id: 'session_1',
        userId,
        startedAt: Date.now() - 3600000, // 1 heure
        lastActiveAt: Date.now() - 300000, // 5 minutes
        expiresAt: Date.now() + 86400000, // 24 heures
        deviceId: 'device_1',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        ipAddress: '192.168.1.100',
        isActive: true,
        isRevoked: false
      },
      {
        id: 'session_2',
        userId,
        startedAt: Date.now() - 7200000, // 2 heures
        lastActiveAt: Date.now() - 1800000, // 30 minutes
        expiresAt: Date.now() + 82800000, // 23 heures
        deviceId: 'device_2',
        deviceType: 'mobile',
        browser: 'Safari',
        os: 'iOS 15',
        ipAddress: '192.168.1.101',
        isActive: true,
        isRevoked: false
      }
    ];

    return {
      success: true,
      data: sessions
    };
  }

  private async simulateRevokeSession(sessionId: string): Promise<ApiResponse<void>> {
    // Simuler un délai réseau
    await this.delay(500);

    return { success: true };
  }

  private createMockUser(email: string, provider: AuthProvider): AuthenticatedUser {
    const userId = `user_${Date.now()}`;
    const now = Date.now();
    
    return {
      id: userId,
      email,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      
      profile: {
        firstName: email.split('@')[0],
        lastName: '',
        username: email.split('@')[0],
        bio: 'Nouvel utilisateur de Dialect Game',
        location: 'France',
        timezone: 'Europe/Paris',
        language: 'fr',
        
        avatar: {
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          type: 'generated',
          generatedSeed: email
        },
        
        level: 1,
        totalXP: 0,
        gamesPlayed: 0,
        achievements: [],
        
        socialLinks: [],
        
        isPublic: true,
        showOnLeaderboard: true,
        allowFriendRequests: true
      },
      
      provider,
      providerId: `${provider}_${userId}`,
      
      accessToken: `access_token_${now}`,
      refreshToken: `refresh_token_${now}`,
      tokenExpiry: now + (3600 * 1000), // 1 heure
      
      roles: [UserRole.USER],
      permissions: [
        {
          resource: 'profile',
          actions: ['read', 'update']
        },
        {
          resource: 'game',
          actions: ['play', 'save']
        }
      ],
      
      createdAt: now,
      lastLoginAt: now,
      lastActiveAt: now,
      
      emailVerified: provider !== AuthProvider.EMAIL,
      twoFactorEnabled: false,
      subscriptionStatus: SubscriptionStatus.FREE,
      
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        gameReminders: true,
        allowDirectMessages: true,
        allowFriendRequests: true,
        showOnlineStatus: true,
        autoSync: true,
        syncFrequency: 15,
        dataRetention: 30,
        reducedMotion: false,
        highContrast: false,
        textSize: 'medium',
        autoSave: true,
        pauseOnBlur: true,
        showHints: true
      },
      
      privacy: {
        profileVisibility: 'public',
        showRealName: false,
        showEmail: false,
        showLocation: false,
        showActivity: true,
        allowAnalytics: true,
        allowDataCollection: true,
        allowTargetedAds: false
      }
    };
  }

  // === GESTION D'ÉTAT ===

  private setAuthState(state: AuthState): void {
    const previousState = this.authState;
    this.authState = state;
    
    this.emitEvent('auth_state_changed', { 
      previousState, 
      currentState: state 
    });
  }

  private async handleSuccessfulLogin(user: AuthenticatedUser): Promise<void> {
    this.currentUser = user;
    this.setAuthState(AuthState.AUTHENTICATED);
    this.saveToStorage();
    this.startTokenRefreshTimer();
    
    // Créer une session
    this.currentSession = await this.createSession(user);
    
    this.emitEvent('login_success', { user });
  }

  private async createSession(user: AuthenticatedUser): Promise<AuthSession> {
    const deviceInfo = this.getDeviceInfo();
    
    return {
      id: `session_${Date.now()}`,
      userId: user.id,
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      expiresAt: Date.now() + BACKEND_CONSTANTS.SESSION_TIMEOUT,
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: '127.0.0.1', // En production, obtenir la vraie IP
      isActive: true,
      isRevoked: false
    };
  }

  private getDeviceInfo() {
    return {
      deviceId: this.getDeviceId(),
      deviceType: this.getDeviceType(),
      browser: this.getBrowserName(),
      os: this.getOSName()
    };
  }

  private getDeviceId(): string {
    // En production, utiliser une méthode plus robuste
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private setupSessionMonitoring(): void {
    // Mettre à jour l'activité de session périodiquement
    setInterval(() => {
      if (this.currentSession && this.authState === AuthState.AUTHENTICATED) {
        this.currentSession.lastActiveAt = Date.now();
      }
    }, 60000); // Toutes les minutes
  }

  // === UTILITAIRES ===

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

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUser;
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  isAuthenticated(): boolean {
    return this.authState === AuthState.AUTHENTICATED && this.currentUser !== null;
  }

  getAccessToken(): string | null {
    return this.currentUser?.accessToken || null;
  }

  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.roles.includes(role) || false;
  }

  hasPermission(resource: string, action: string): boolean {
    if (!this.currentUser) return false;
    
    return this.currentUser.permissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action)
    );
  }
}

// Instance singleton
export const authService = new AuthService();
export default authService;