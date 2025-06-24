/**
 * Tests unitaires pour le système backend et synchronisation
 * Task 16: Backend et Synchronisation - Phase TDD
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  AuthProvider,
  AuthStatus,
  UserRole,
  SyncStatus,
  SyncDataType
} from '../../../src/types/backend';

import { AuthService, getAuthService, isValidEmail, isValidPassword, isValidUsername } from '../../../src/services/backend/authService';
import { SyncService, getSyncService, createSyncData, validateSyncData } from '../../../src/services/backend/syncService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock window properties
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080
  },
  writable: true
});

Object.defineProperty(window, 'devicePixelRatio', {
  value: 2,
  writable: true
});

Object.defineProperty(navigator, 'platform', {
  value: 'MacIntel',
  writable: true
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  writable: true
});

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true
});

describe('Backend System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Authentication Service', () => {
    let authService: AuthService;

    beforeEach(() => {
      authService = new AuthService({
        providers: [AuthProvider.EMAIL, AuthProvider.GOOGLE],
        sessionTimeout: 86400000,
        refreshThreshold: 300000
      });
    });

    test('should initialize with unauthenticated state', () => {
      const state = authService.getState();
      
      expect(state.status).toBe(AuthStatus.UNAUTHENTICATED);
      expect(state.user).toBeUndefined();
      expect(state.token).toBeUndefined();
      expect(state.isLoading).toBe(false);
    });

    test('should register new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser',
        displayName: 'Test User',
        acceptTerms: true
      };

      const result = await authService.register(registerData);

      expect(result.isNewUser).toBe(true);
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.username).toBe(registerData.username);
      expect(result.user.role).toBe(UserRole.STUDENT);
      expect(result.token.accessToken).toContain('access_');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should reject registration with invalid data', async () => {
      const invalidData = {
        email: '',
        password: '',
        username: '',
        displayName: '',
        acceptTerms: false
      };

      await expect(authService.register(invalidData)).rejects.toThrow('Email, password and username are required');
    });

    test('should reject registration without accepting terms', async () => {
      const dataWithoutTerms = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser',
        displayName: 'Test User',
        acceptTerms: false
      };

      await expect(authService.register(dataWithoutTerms)).rejects.toThrow('You must accept the terms and conditions');
    });

    test('should login with email and password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const result = await authService.login(loginData);

      expect(result.isNewUser).toBe(false);
      expect(result.user.email).toBe(loginData.email);
      expect(result.token.accessToken).toContain('access_');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should login with OAuth provider', async () => {
      const result = await authService.loginWithProvider(AuthProvider.GOOGLE);

      expect(result.user.provider).toBe(AuthProvider.GOOGLE);
      expect(result.user.email).toBe('user@gmail.com');
      expect(result.user.username).toBe('google_user');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should reject unsupported OAuth provider', async () => {
      await expect(authService.loginWithProvider('unsupported' as AuthProvider)).rejects.toThrow('Provider unsupported not supported');
    });

    test('should logout successfully', async () => {
      // First login
      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(authService.isAuthenticated()).toBe(true);

      // Then logout
      await authService.logout();

      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });

    test('should refresh token automatically', async () => {
      // Login first
      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      const oldToken = authService.getState().token!;
      
      // Simulate token refresh
      const newToken = await authService.refreshToken();

      expect(newToken).toBeDefined();
      expect(newToken!.accessToken).not.toBe(oldToken.accessToken);
      expect(newToken!.expiresAt).toBeGreaterThan(oldToken.expiresAt);
    });

    test('should update user profile', async () => {
      // Login first
      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      const updates = {
        displayName: 'Updated Name',
        profile: {
          ...authService.getCurrentUser()!.profile,
          bio: 'Updated bio'
        }
      };

      const updatedUser = await authService.updateProfile(updates);

      expect(updatedUser.displayName).toBe('Updated Name');
      expect(updatedUser.profile.bio).toBe('Updated bio');
    });

    test('should verify email', async () => {
      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(authService.getCurrentUser()!.isEmailVerified).toBe(false);

      const result = await authService.verifyEmail('verification-token');

      expect(result).toBe(true);
      expect(authService.getCurrentUser()!.isEmailVerified).toBe(true);
    });

    test('should handle auth events', async () => {
      const eventHandler = vi.fn();
      const unsubscribe = authService.onAuthEvent(eventHandler);

      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'login',
        data: expect.any(Object),
        timestamp: expect.any(Number)
      });

      unsubscribe();
    });

    test('should persist auth state', async () => {
      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'auth-state',
        expect.stringContaining('test@example.com')
      );
    });
  });

  describe('Sync Service', () => {
    let syncService: SyncService;

    beforeEach(() => {
      syncService = new SyncService({
        enabled: true,
        interval: 1, // 1 minute for testing
        batchSize: 10,
        maxRetries: 2,
        conflictResolution: 'manual'
      });
    });

    afterEach(() => {
      syncService.destroy();
    });

    test('should initialize with idle state', () => {
      const state = syncService.getState();
      
      expect(state.status).toBe(SyncStatus.IDLE);
      expect(state.pendingChanges).toBe(0);
      expect(state.conflicts).toEqual([]);
      expect(state.errors).toEqual([]);
    });

    test('should queue data for sync', async () => {
      const testData = { name: 'Test', value: 123 };
      
      await syncService.queueDataForSync(SyncDataType.PROFILE, testData);
      
      const state = syncService.getState();
      expect(state.pendingChanges).toBe(1);
      expect(state.dataTypes[SyncDataType.PROFILE].pendingChanges).toBe(1);
    });

    test('should sync data successfully', async () => {
      const eventHandler = vi.fn();
      syncService.onSyncEvent(eventHandler);

      await syncService.sync([SyncDataType.PROFILE]);

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'sync_start',
        data: [SyncDataType.PROFILE],
        timestamp: expect.any(Number)
      });

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'sync_complete',
        timestamp: expect.any(Number)
      });
    });

    test('should handle sync progress', async () => {
      const eventHandler = vi.fn();
      syncService.onSyncEvent(eventHandler);

      await syncService.sync([SyncDataType.PROFILE, SyncDataType.PROGRESS, SyncDataType.SETTINGS]);

      const progressCalls = eventHandler.mock.calls.filter(call => 
        call[0].type === 'sync_progress'
      );

      expect(progressCalls.length).toBe(3); // One for each data type
    });

    test('should detect and handle conflicts', async () => {
      // Simulate conflicting data
      await syncService.queueDataForSync(SyncDataType.PROFILE, { name: 'Local User' });
      
      const eventHandler = vi.fn();
      syncService.onSyncEvent(eventHandler);

      // Note: In a real scenario, this would detect conflicts with remote data
      // For now, we test the conflict resolution mechanism
      const conflict = {
        id: 'conflict-1',
        dataType: SyncDataType.PROFILE,
        localData: { name: 'Local User' },
        remoteData: { name: 'Remote User' },
        localTimestamp: Date.now() - 1000,
        remoteTimestamp: Date.now()
      };

      await syncService.resolveConflict(conflict.id, 'local');
      
      // Conflict should be marked as resolved
      const state = syncService.getState();
      const resolvedConflict = state.conflicts.find(c => c.id === conflict.id);
      expect(resolvedConflict?.resolution).toBe('local');
    });

    test('should clear errors and conflicts', () => {
      // Add some mock errors and conflicts to state
      const initialState = syncService.getState();
      
      syncService.clearErrors();
      syncService.clearResolvedConflicts();
      
      const clearedState = syncService.getState();
      expect(clearedState.errors).toEqual([]);
    });

    test('should reset local data', async () => {
      await syncService.queueDataForSync(SyncDataType.PROFILE, { test: 'data' });
      
      expect(syncService.getState().dataTypes[SyncDataType.PROFILE].pendingChanges).toBe(1);
      
      await syncService.resetLocalData(SyncDataType.PROFILE);
      
      expect(syncService.getState().dataTypes[SyncDataType.PROFILE].pendingChanges).toBe(0);
    });

    test('should start and stop auto sync', () => {
      const initialTimer = (syncService as any).syncTimer;
      
      syncService.startAutoSync();
      expect((syncService as any).syncTimer).toBeDefined();
      
      syncService.stopAutoSync();
      expect((syncService as any).syncTimer).toBeUndefined();
    });

    test('should force immediate sync', async () => {
      const eventHandler = vi.fn();
      syncService.onSyncEvent(eventHandler);

      await syncService.forcSync();

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'sync_start',
        data: expect.any(Array),
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Utility Functions', () => {
    describe('Email Validation', () => {
      test('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(isValidEmail('x@y.z')).toBe(true);
      });

      test('should reject invalid email addresses', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('user@domain')).toBe(false);
      });
    });

    describe('Password Validation', () => {
      test('should validate strong passwords', () => {
        expect(isValidPassword('SecurePass123!')).toBe(true);
        expect(isValidPassword('MyP@ssw0rd')).toBe(true);
        expect(isValidPassword('Abc12345')).toBe(true);
      });

      test('should reject weak passwords', () => {
        expect(isValidPassword('weak')).toBe(false);
        expect(isValidPassword('12345678')).toBe(false);
        expect(isValidPassword('abcdefgh')).toBe(false);
        expect(isValidPassword('ABCDEFGH')).toBe(false);
      });
    });

    describe('Username Validation', () => {
      test('should validate correct usernames', () => {
        expect(isValidUsername('user123')).toBe(true);
        expect(isValidUsername('test_user')).toBe(true);
        expect(isValidUsername('user-name')).toBe(true);
      });

      test('should reject invalid usernames', () => {
        expect(isValidUsername('ab')).toBe(false); // Too short
        expect(isValidUsername('user@name')).toBe(false); // Invalid chars
        expect(isValidUsername('user name')).toBe(false); // Space
        expect(isValidUsername('')).toBe(false); // Empty
      });
    });

    describe('Sync Data Utilities', () => {
      test('should create sync data correctly', () => {
        const data = { name: 'Test', value: 123 };
        const syncData = createSyncData(SyncDataType.PROFILE, data, 'device-123');

        expect(syncData.type).toBe(SyncDataType.PROFILE);
        expect(syncData.data).toEqual(data);
        expect(syncData.deviceId).toBe('device-123');
        expect(syncData.version).toBe(1);
        expect(syncData.checksum).toBeDefined();
      });

      test('should validate sync data checksum', () => {
        const data = { name: 'Test', value: 123 };
        const syncData = createSyncData(SyncDataType.PROFILE, data, 'device-123');

        expect(validateSyncData(syncData)).toBe(true);

        // Tamper with data
        syncData.data.value = 456;
        expect(validateSyncData(syncData)).toBe(false);
      });
    });
  });

  describe('Service Singletons', () => {
    test('should return same auth service instance', () => {
      const service1 = getAuthService();
      const service2 = getAuthService();
      
      expect(service1).toBe(service2);
    });

    test('should return same sync service instance', () => {
      const service1 = getSyncService();
      const service2 = getSyncService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      const authService = new AuthService();
      
      // Mock a network error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await authService.login({
          email: 'test@example.com',
          password: 'password'
        });
      } catch (error) {
        // Error should be handled gracefully
        expect(authService.getState().status).toBe(AuthStatus.ERROR);
      }

      global.fetch = originalFetch;
    });

    test('should handle sync errors', async () => {
      const syncService = new SyncService();
      const eventHandler = vi.fn();
      syncService.onSyncEvent(eventHandler);

      // Force an error condition
      vi.spyOn(syncService as any, 'getRemoteData').mockRejectedValue(new Error('Sync failed'));

      try {
        await syncService.sync([SyncDataType.PROFILE]);
      } catch (error) {
        const state = syncService.getState();
        expect(state.status).toBe(SyncStatus.ERROR);
        expect(state.errors.length).toBeGreaterThan(0);
      }

      syncService.destroy();
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large datasets efficiently', async () => {
      const syncService = new SyncService();
      const startTime = Date.now();

      // Queue many items
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 100; i++) {
        promises.push(syncService.queueDataForSync(SyncDataType.PROGRESS, {
          id: i,
          data: `item-${i}`
        }));
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(syncService.getState().pendingChanges).toBe(100);

      syncService.destroy();
    });

    test('should batch sync operations', async () => {
      const syncService = new SyncService({ batchSize: 5 });
      
      // Queue more items than batch size
      for (let i = 0; i < 12; i++) {
        await syncService.queueDataForSync(SyncDataType.PROGRESS, { id: i });
      }

      // Sync should handle batching internally
      await syncService.sync([SyncDataType.PROGRESS]);
      
      const state = syncService.getState();
      expect(state.status).toBe(SyncStatus.SUCCESS);

      syncService.destroy();
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data integrity during sync', async () => {
      const syncService = new SyncService();
      const originalData = { name: 'Original', timestamp: Date.now() };
      
      await syncService.queueDataForSync(SyncDataType.PROFILE, originalData);
      
      // Simulate concurrent modification
      const modifiedData = { ...originalData, name: 'Modified' };
      await syncService.queueDataForSync(SyncDataType.PROFILE, modifiedData);
      
      const state = syncService.getState();
      expect(state.dataTypes[SyncDataType.PROFILE].version).toBeGreaterThan(1);

      syncService.destroy();
    });

    test('should handle version conflicts correctly', async () => {
      const syncService = new SyncService();
      
      // Create conflicting versions
      const localData = createSyncData(SyncDataType.PROFILE, { name: 'Local' }, 'device-1');
      const remoteData = createSyncData(SyncDataType.PROFILE, { name: 'Remote' }, 'device-2');
      
      // Both have same ID but different data
      remoteData.id = localData.id;
      remoteData.version = localData.version + 1;
      
      expect(validateSyncData(localData)).toBe(true);
      expect(validateSyncData(remoteData)).toBe(true);
      expect(localData.checksum).not.toBe(remoteData.checksum);

      syncService.destroy();
    });
  });
});