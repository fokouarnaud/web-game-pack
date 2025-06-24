// tests/unit/analytics/PrivacyFirstAnalytics.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrivacyFirstAnalytics } from '../../../src/services/analytics/PrivacyFirstAnalytics';

describe('PrivacyFirstAnalytics - Phase RED TDD', () => {
  let analytics: PrivacyFirstAnalytics;

  beforeEach(() => {
    analytics = new PrivacyFirstAnalytics();
  });

  describe('Tracking & Aggregation', () => {
    it('should track an event and return true', async () => {
      const event = { type: 'lesson_start', userId: 'u1' };
      // To be implemented in GREEN phase
      await expect(analytics.trackEvent(event)).resolves.toBe(true);
    });

    it('should aggregate federated data correctly', async () => {
      const data = [{ score: 10 }, { score: 20 }];
      // To be implemented in GREEN phase
      await expect(analytics.federatedAggregate(data)).resolves.toBeDefined();
    });
  });

  describe('Encryption & Privacy', () => {
    it('should encrypt data and return a string', async () => {
      const data = { sensitive: 'info' };
      // To be implemented in GREEN phase
      await expect(analytics.encryptData(data)).resolves.toMatch(/.+/);
    });

    it('should check GDPR compliance and return true', async () => {
      // To be implemented in GREEN phase
      await expect(analytics.checkGDPRCompliance()).resolves.toBe(true);
    });
  });

  describe('Robustesse et gestion des erreurs', () => {
    it('should throw error on invalid event', async () => {
      await expect(analytics.trackEvent(null as any)).rejects.toThrow('Invalid event');
    });

    it('should throw error on invalid federated data', async () => {
      await expect(analytics.federatedAggregate(null as any)).rejects.toThrow('Invalid federated data');
    });

    it('should throw error on invalid data for encryption', async () => {
      await expect(analytics.encryptData(undefined as any)).rejects.toThrow('Invalid data');
    });
  });

  describe('Performance', () => {
    it('should track event in less than 100ms', async () => {
      const event = { type: 'lesson_end', userId: 'u2' };
      const start = Date.now();
      try { await analytics.trackEvent(event); } catch {}
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});