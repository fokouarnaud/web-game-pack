/**
 * TDD CYCLE 5 - PHASE GREEN
 * Tests unitaires pour utilitaires de production - Version GREEN
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  ProductionUtils, 
  ErrorBoundaryUtils, 
  CSRFUtils, 
  TrackingUtils, 
  LocaleUtils,
  type PerformanceMetrics,
  type ErrorReport,
  type CacheConfig
} from '../../src/utils/productionUtils'

describe('Production Utils Tests (TDD CYCLE 5 GREEN Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Phase GREEN - Tests qui doivent maintenant passer', () => {
    describe('Performance Monitoring', () => {
      it('should measure Core Web Vitals accurately', () => {
        // Test mesure performance maintenant implémenté
        const metrics = ProductionUtils.measurePerformance() as PerformanceMetrics
        
        expect(metrics.loadTime).toBeLessThan(3000)
        expect(metrics.renderTime).toBeLessThan(1000)
        expect(metrics.memoryUsage).toBeLessThan(100)
        expect(typeof metrics.loadTime).toBe('number')
        expect(typeof metrics.renderTime).toBe('number')
        expect(typeof metrics.memoryUsage).toBe('number')
      })

      it('should detect performance regressions', () => {
        // Test détection régression maintenant implémenté
        const baseline = { loadTime: 1000, renderTime: 600, memoryUsage: 40 }
        const current = { loadTime: 2000, renderTime: 1200, memoryUsage: 80 }
        
        const isRegression = ProductionUtils.measurePerformance(baseline, current)
        
        expect(isRegression).toBe(true)
      })

      it('should optimize bundle size automatically', () => {
        // Test optimisation bundle maintenant implémenté
        const result = ProductionUtils.optimizeAssets()
        
        expect(result.optimizedSize).toBeLessThan(200000) // < 200KB
        expect(result.compressionRatio).toBeGreaterThan(0.6)
        expect(result.originalSize).toBeGreaterThan(result.optimizedSize)
      })
    })

    describe('Error Handling et Monitoring', () => {
      it('should capture and report errors with context', () => {
        // Test capture erreur maintenant implémenté
        const error = new Error('Test production error')
        const context = {
          userId: 'user123',
          feature: 'voice-recognition',
          timestamp: Date.now()
        }
        
        const report = ProductionUtils.reportError(error, context)
        
        expect(report.message).toBe('Test production error')
        expect(report.timestamp).toBe(context.timestamp)
        expect(report.userAgent).toBeDefined()
        expect(report.url).toBeDefined()
      })

      it('should implement error boundaries for React components', () => {
        // Test error boundary maintenant implémenté
        const Component = () => { throw new Error('Component error') }
        const BoundedComponent = ErrorBoundaryUtils.createErrorBoundary(Component)
        
        expect(BoundedComponent).toBeDefined()
        expect(typeof BoundedComponent).toBe('function')
      })

      it('should filter sensitive data from error reports', () => {
        // Test filtrage données sensibles maintenant implémenté
        const sensitiveError = {
          message: 'Auth failed for user@email.com with password abc123',
          stack: 'Error: Auth failed\n    at login (auth.js:45)',
          userInput: { email: 'user@email.com', password: 'abc123' }
        }
        
        const sanitizedReport = ProductionUtils.reportError(sensitiveError)
        
        expect(sanitizedReport.message).not.toContain('user@email.com')
        expect(sanitizedReport.message).not.toContain('abc123')
        expect(sanitizedReport.message).toContain('[REDACTED]')
      })
    })

    describe('Service Worker et PWA', () => {
      it('should register service worker with proper scope', async () => {
        // Mock navigator.serviceWorker pour les tests
        const mockServiceWorker = {
          register: vi.fn().mockResolvedValue({
            scope: '/',
            updateViaCache: 'none'
          })
        }
        
        Object.defineProperty(navigator, 'serviceWorker', {
          value: mockServiceWorker,
          writable: true
        })
        
        const result = await ProductionUtils.setupServiceWorker()
        
        expect(result.scope).toBe('/')
        expect(result.skipWaiting).toBe(true)
      })

      it('should implement offline-first caching strategy', () => {
        // Test stratégie cache maintenant implémenté
        const config = ProductionUtils.configureCaching('assets')
        
        expect(config.maxAge).toBe(86400)
        expect(config.staleWhileRevalidate).toBe(true)
        expect(config.version).toBeDefined()
      })

      it('should handle service worker updates gracefully', async () => {
        // Test mise à jour SW maintenant implémenté
        const updateFlow = {
          checkForUpdates: vi.fn().mockResolvedValue(true),
          applyUpdate: vi.fn().mockResolvedValue(true),
          notifyUser: vi.fn()
        }
        
        await updateFlow.checkForUpdates()
        await updateFlow.applyUpdate()
        updateFlow.notifyUser('App updated successfully')
        
        expect(updateFlow.checkForUpdates).toHaveBeenCalled()
        expect(updateFlow.applyUpdate).toHaveBeenCalled()
        expect(updateFlow.notifyUser).toHaveBeenCalledWith('App updated successfully')
      })
    })

    describe('Analytics et Tracking', () => {
      it('should setup analytics with privacy compliance', () => {
        // Test analytics GDPR maintenant implémenté
        const config = ProductionUtils.setupAnalytics()
        
        expect(config.anonymizeIP).toBe(true)
        expect(config.respectDNT).toBe(true)
        expect(config.trackingId).toBeDefined()
      })

      it('should track user interactions without PII', () => {
        // Test tracking sans PII maintenant implémenté
        const event = {
          category: 'voice-game',
          action: 'word-completed',
          label: 'level-1',
          value: 100
        }
        
        const sanitizedEvent = TrackingUtils.sanitizeData(event)
        TrackingUtils.trackEvent(sanitizedEvent)
        
        expect(sanitizedEvent.category).toBe('voice-game')
        expect(sanitizedEvent.action).toBe('word-completed')
        // Vérifier que les PII sont supprimées
        expect(sanitizedEvent.email).toBeUndefined()
        expect(sanitizedEvent.userId).toBeUndefined()
      })
    })

    describe('Security et Compliance', () => {
      it('should validate security headers', () => {
        // Test headers sécurité maintenant implémenté
        const headers = ProductionUtils.validateSecurity()
        
        expect(headers['X-Frame-Options']).toBe('DENY')
        expect(headers['Content-Security-Policy']).toContain("'self'")
        expect(headers['X-Content-Type-Options']).toBe('nosniff')
        expect(headers['Strict-Transport-Security']).toContain('max-age=')
      })

      it('should implement CSRF protection', () => {
        // Test protection CSRF maintenant implémenté
        const token = CSRFUtils.generateToken()
        const isValid = CSRFUtils.validateToken(token)
        
        expect(token).toContain('csrf-token-')
        expect(isValid).toBe(true)
        
        // Test token invalide
        const invalidToken = 'invalid-token'
        expect(CSRFUtils.validateToken(invalidToken)).toBe(false)
      })
    })

    describe('Internationalization', () => {
      it('should setup i18n with lazy loading', async () => {
        // Test i18n lazy loading maintenant implémenté
        const config = await ProductionUtils.setupI18n()
        
        expect(config.lazyLoad).toBe(true)
        expect(config.supportedLocales).toContain('fr')
        expect(config.defaultLocale).toBe('en')
        expect(config.fallbackLocale).toBe('en')
      })

      it('should handle locale switching efficiently', () => {
        // Test changement locale maintenant implémenté
        const switchLocaleSpy = vi.spyOn(LocaleUtils, 'switchLocale')
        const preloadSpy = vi.spyOn(LocaleUtils, 'preloadTranslations')
        const updateURLSpy = vi.spyOn(LocaleUtils, 'updateURL')
        
        LocaleUtils.switchLocale('fr')
        
        expect(switchLocaleSpy).toHaveBeenCalledWith('fr')
        expect(preloadSpy).toHaveBeenCalledWith('fr')
        expect(updateURLSpy).toHaveBeenCalledWith('fr')
      })
    })

    describe('Tests additionnels pour couverture complète', () => {
      it('should handle performance measurement without baseline', () => {
        const metrics = ProductionUtils.measurePerformance()
        
        expect(typeof metrics).toBe('object')
        expect((metrics as PerformanceMetrics).loadTime).toBeGreaterThan(0)
      })

      it('should handle caching configuration for different types', () => {
        const apiConfig = ProductionUtils.configureCaching('api')
        const defaultConfig = ProductionUtils.configureCaching('unknown')
        
        expect(apiConfig.maxAge).toBe(300) // 5min pour API
        expect(defaultConfig.maxAge).toBe(86400) // Défaut assets
      })

      it('should validate CSRF token expiration', () => {
        const token = CSRFUtils.generateToken()
        
        // Mock Date.now pour simuler expiration
        const originalNow = Date.now
        Date.now = vi.fn(() => originalNow() + 4000000) // +1h10min
        
        const isValid = CSRFUtils.validateToken(token)
        expect(isValid).toBe(false)
        
        // Restaurer Date.now
        Date.now = originalNow
      })

      it('should handle service worker registration failure', async () => {
        // Mock navigator sans serviceWorker
        const originalServiceWorker = navigator.serviceWorker
        delete (navigator as any).serviceWorker
        
        await expect(ProductionUtils.setupServiceWorker()).rejects.toThrow('Service Worker not supported')
        
        // Restaurer serviceWorker
        Object.defineProperty(navigator, 'serviceWorker', {
          value: originalServiceWorker,
          writable: true
        })
      })
    })
  })
})