/**
 * Tests TDD pour Performance Monitoring Service
 * Phase RED : Tests écrits AVANT l'implémentation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMonitor } from '../../src/services/performance/PerformanceMonitor';

describe('PerformanceMonitor - TDD RED Phase', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    // Mock de Performance API
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        memory: {
          usedJSHeapSize: 10000000,
          totalJSHeapSize: 20000000,
          jsHeapSizeLimit: 50000000
        }
      }
    });

    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Performance Tracking', () => {
    it('should track component render time', () => {
      const componentName = 'GameLessonEducational';
      
      // Mock performance.now to simulate time passing
      vi.mocked(performance.now)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
      
      performanceMonitor.startTracking(componentName);
      performanceMonitor.endTracking(componentName);
      
      const metrics = performanceMonitor.getMetrics(componentName);
      expect(metrics).toBeDefined();
      expect(metrics!.renderTime).toBe(50); // 150 - 100
    });

    it('should track memory usage', () => {
      const memoryMetrics = performanceMonitor.getMemoryMetrics();
      
      expect(memoryMetrics).toEqual({
        used: 10000000,
        total: 20000000,
        limit: 50000000,
        usage: 0.5 // 10MB / 20MB
      });
    });

    it('should detect performance issues', () => {
      const componentName = 'SlowComponent';
      
      // Mock slow render time
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(3000); // 3 seconds

      performanceMonitor.startTracking(componentName);
      performanceMonitor.endTracking(componentName);
      
      const issues = performanceMonitor.getPerformanceIssues();
      expect(issues).toContainEqual({
        type: 'slow_render',
        component: componentName,
        duration: 3000,
        severity: 'critical',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Bundle Size Monitoring', () => {
    it('should track bundle loading times', async () => {
      const bundleName = 'GameLessonEducational';
      
      performanceMonitor.trackBundleLoad(bundleName, 150000); // 150KB
      
      const bundleMetrics = performanceMonitor.getBundleMetrics();
      expect(bundleMetrics.get(bundleName)).toEqual({
        size: 150000,
        loadTime: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });

    it('should warn when bundle exceeds size limits', () => {
      const largeBundleName = 'LargeBundle';
      
      performanceMonitor.trackBundleLoad(largeBundleName, 600000); // 600KB (exceeds 500KB limit)
      
      const warnings = performanceMonitor.getWarnings();
      expect(warnings).toContainEqual({
        type: 'bundle_size_exceeded',
        bundle: largeBundleName,
        size: 600000,
        limit: 500000,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Real-time Monitoring', () => {
    it('should provide real-time performance dashboard data', () => {
      // Setup some metrics
      performanceMonitor.startTracking('Component1');
      performanceMonitor.endTracking('Component1');
      
      const dashboard = performanceMonitor.getDashboardData();
      
      expect(dashboard).toEqual({
        averageRenderTime: expect.any(Number),
        memoryUsage: expect.any(Object),
        activeComponents: expect.any(Number),
        performanceScore: expect.any(Number),
        issues: expect.any(Array),
        trends: expect.any(Array)
      });
    });

    it('should calculate performance score correctly', () => {
      // Mock optimal performance
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50); // 50ms render

      performanceMonitor.startTracking('FastComponent');
      performanceMonitor.endTracking('FastComponent');
      
      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeGreaterThan(80); // Good performance
    });
  });

  describe('Error Tracking Integration', () => {
    it('should track rendering errors', () => {
      const error = new Error('Component render failed');
      const componentName = 'BrokenComponent';
      
      performanceMonitor.trackError(componentName, error);
      
      const errors = performanceMonitor.getErrors();
      expect(errors).toContainEqual({
        component: componentName,
        error: error.message,
        timestamp: expect.any(Number),
        stack: expect.any(String)
      });
    });

    it('should correlate errors with performance issues', () => {
      const componentName = 'ProblematicComponent';
      
      // Track slow render + error
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(2500);

      performanceMonitor.startTracking(componentName);
      performanceMonitor.endTracking(componentName);
      performanceMonitor.trackError(componentName, new Error('Timeout'));
      
      const correlations = performanceMonitor.getPerformanceErrorCorrelations();
      expect(correlations).toContainEqual({
        component: componentName,
        hasPerformanceIssue: true,
        hasError: true,
        correlation: 'high'
      });
    });
  });

  describe('Optimization Suggestions', () => {
    it('should suggest optimizations for slow components', () => {
      const slowComponent = 'VerySlowComponent';
      
      // Mock very slow render
      vi.mocked(performance.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5000);

      performanceMonitor.startTracking(slowComponent);
      performanceMonitor.endTracking(slowComponent);
      
      const suggestions = performanceMonitor.getOptimizationSuggestions();
      expect(suggestions).toContainEqual({
        component: slowComponent,
        issue: 'slow_render',
        suggestions: [
          'Consider using React.memo',
          'Check for expensive operations in render',
          'Optimize state updates',
          'Use useMemo for expensive calculations'
        ],
        priority: 'high'
      });
    });

    it('should suggest memory optimizations', () => {
      // Mock high memory usage
      Object.defineProperty(global.performance, 'memory', {
        value: {
          usedJSHeapSize: 45000000, // 45MB
          totalJSHeapSize: 50000000, // 50MB
          jsHeapSizeLimit: 50000000  // 50MB limit
        }
      });

      const suggestions = performanceMonitor.getOptimizationSuggestions();
      expect(suggestions).toContainEqual({
        component: 'global',
        issue: 'high_memory_usage',
        suggestions: [
          'Check for memory leaks',
          'Clean up event listeners',
          'Optimize image loading',
          'Use lazy loading for large components'
        ],
        priority: 'critical' // 90% usage (45MB/50MB) should be critical
      });
    });
  });
});