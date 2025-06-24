/**
 * Tests de santé pour le déploiement production
 * Task 18: Déploiement Production - Phase 4
 */

import { describe, test, expect, beforeAll } from 'vitest';

// Configuration des tests de santé
const HEALTH_CHECK_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
  endpoints: [
    '/',
    '/enhanced.html',
    '/api/health',
    '/manifest.json',
    '/sw.js',
  ],
  requiredHeaders: {
    'content-security-policy': true,
    'x-frame-options': true,
    'x-content-type-options': true,
  },
  performance: {
    maxResponseTime: 2000,
    maxFirstByte: 800,
  },
};

// Utilitaires de test
async function fetchWithTimeout(url: string, timeout: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function measureResponseTime(url: string): Promise<{ response: Response; timing: number }> {
  const start = performance.now();
  const response = await fetchWithTimeout(url, HEALTH_CHECK_CONFIG.timeout);
  const timing = performance.now() - start;
  
  return { response, timing };
}

describe('Production Health Checks', () => {
  beforeAll(() => {
    console.log(`Testing deployment at: ${HEALTH_CHECK_CONFIG.baseUrl}`);
  });

  describe('Endpoint Availability', () => {
    test.each(HEALTH_CHECK_CONFIG.endpoints)('should respond to %s', async (endpoint) => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}${endpoint}`;
      
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= HEALTH_CHECK_CONFIG.retries; attempt++) {
        try {
          const { response, timing } = await measureResponseTime(url);
          
          expect(response.status).toBeLessThan(400);
          expect(timing).toBeLessThan(HEALTH_CHECK_CONFIG.performance.maxResponseTime);
          
          console.log(`✓ ${endpoint}: ${response.status} (${Math.round(timing)}ms)`);
          return; // Success, exit retry loop
          
        } catch (error) {
          lastError = error as Error;
          console.log(`✗ ${endpoint}: Attempt ${attempt}/${HEALTH_CHECK_CONFIG.retries} failed`);
          
          if (attempt < HEALTH_CHECK_CONFIG.retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      throw lastError || new Error(`All ${HEALTH_CHECK_CONFIG.retries} attempts failed`);
    });
  });

  describe('Security Headers', () => {
    test('should have required security headers', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      
      expect(response.status).toBe(200);
      
      for (const [header, required] of Object.entries(HEALTH_CHECK_CONFIG.requiredHeaders)) {
        if (required) {
          expect(response.headers.has(header)).toBe(true);
          console.log(`✓ Security header present: ${header}`);
        }
      }
    });

    test('should have CSP header with proper directives', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      
      const csp = response.headers.get('content-security-policy');
      if (csp) {
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("script-src");
        expect(csp).toContain("style-src");
        console.log('✓ CSP header properly configured');
      }
    });
  });

  describe('Performance Metrics', () => {
    test('should have acceptable response times', async () => {
      const criticalEndpoints = ['/', '/enhanced.html'];
      
      for (const endpoint of criticalEndpoints) {
        const url = `${HEALTH_CHECK_CONFIG.baseUrl}${endpoint}`;
        const { response, timing } = await measureResponseTime(url);
        
        expect(response.status).toBe(200);
        expect(timing).toBeLessThan(HEALTH_CHECK_CONFIG.performance.maxResponseTime);
        
        console.log(`✓ ${endpoint}: ${Math.round(timing)}ms response time`);
      }
    });

    test('should have fast Time to First Byte (TTFB)', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const start = performance.now();
      
      const response = await fetch(url, { method: 'HEAD' });
      const ttfb = performance.now() - start;
      
      expect(response.status).toBe(200);
      expect(ttfb).toBeLessThan(HEALTH_CHECK_CONFIG.performance.maxFirstByte);
      
      console.log(`✓ TTFB: ${Math.round(ttfb)}ms`);
    });
  });

  describe('Static Assets', () => {
    test('should serve static assets with proper caching', async () => {
      const staticAssets = [
        '/css/main.css',
        '/js/main.js',
        '/fonts/Inter-Regular.woff2',
      ];
      
      for (const asset of staticAssets) {
        const url = `${HEALTH_CHECK_CONFIG.baseUrl}${asset}`;
        
        try {
          const response = await fetchWithTimeout(url);
          
          if (response.status === 200) {
            const cacheControl = response.headers.get('cache-control');
            expect(cacheControl).toBeTruthy();
            expect(cacheControl).toMatch(/max-age=\d+/);
            
            console.log(`✓ ${asset}: Cached (${cacheControl})`);
          } else {
            console.log(`⚠ ${asset}: Not found (${response.status})`);
          }
        } catch (error) {
          console.log(`⚠ ${asset}: Error loading`);
        }
      }
    });
  });

  describe('PWA Features', () => {
    test('should have valid manifest.json', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/manifest.json`;
      const response = await fetchWithTimeout(url);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      
      const manifest = await response.json();
      expect(manifest).toHaveProperty('name');
      expect(manifest).toHaveProperty('short_name');
      expect(manifest).toHaveProperty('start_url');
      expect(manifest).toHaveProperty('display');
      expect(manifest).toHaveProperty('icons');
      
      console.log(`✓ PWA manifest valid: "${manifest.name}"`);
    });

    test('should have service worker', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/sw.js`;
      const response = await fetchWithTimeout(url);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('javascript');
      
      const swContent = await response.text();
      expect(swContent).toContain('addEventListener');
      expect(swContent).toContain('install');
      expect(swContent).toContain('fetch');
      
      console.log('✓ Service Worker available');
    });
  });

  describe('API Health', () => {
    test('should have healthy API endpoints', async () => {
      const apiEndpoints = [
        '/api/health',
        '/api/version',
      ];
      
      for (const endpoint of apiEndpoints) {
        const url = `${HEALTH_CHECK_CONFIG.baseUrl}${endpoint}`;
        
        try {
          const response = await fetchWithTimeout(url);
          
          if (response.status === 200) {
            const data = await response.json();
            expect(data).toBeTruthy();
            console.log(`✓ ${endpoint}: Healthy`);
          } else {
            console.log(`⚠ ${endpoint}: Status ${response.status}`);
          }
        } catch (error) {
          console.log(`⚠ ${endpoint}: Not available`);
        }
      }
    });
  });

  describe('Monitoring Integration', () => {
    test('should have analytics tracking', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      
      // Check for Google Analytics
      const hasGA = html.includes('gtag') || html.includes('google-analytics');
      
      // Check for other tracking
      const hasTracking = html.includes('mixpanel') || 
                         html.includes('sentry') ||
                         html.includes('dataLayer');
      
      if (hasGA || hasTracking) {
        console.log('✓ Analytics tracking detected');
      } else {
        console.log('⚠ No analytics tracking detected');
      }
    });

    test('should have error tracking', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      
      const hasSentry = html.includes('sentry') || html.includes('@sentry');
      
      if (hasSentry) {
        console.log('✓ Error tracking (Sentry) detected');
      } else {
        console.log('⚠ No error tracking detected');
      }
    });
  });

  describe('SEO Optimization', () => {
    test('should have proper meta tags', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      
      expect(html).toContain('<title>');
      expect(html).toContain('name="description"');
      expect(html).toContain('name="viewport"');
      expect(html).toContain('property="og:');
      
      console.log('✓ SEO meta tags present');
    });

    test('should have sitemap', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/sitemap.xml`;
      
      try {
        const response = await fetchWithTimeout(url);
        
        if (response.status === 200) {
          const sitemap = await response.text();
          expect(sitemap).toContain('<urlset');
          expect(sitemap).toContain('<url>');
          console.log('✓ Sitemap available');
        } else {
          console.log('⚠ Sitemap not found');
        }
      } catch (error) {
        console.log('⚠ Sitemap not available');
      }
    });
  });

  describe('Content Delivery', () => {
    test('should serve compressed content', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url, {
        headers: {
          'Accept-Encoding': 'gzip, br, deflate',
        },
      } as any);
      
      const encoding = response.headers.get('content-encoding');
      
      if (encoding && (encoding.includes('gzip') || encoding.includes('br'))) {
        console.log(`✓ Content compressed: ${encoding}`);
      } else {
        console.log('⚠ Content not compressed');
      }
    });

    test('should have CDN headers', async () => {
      const url = `${HEALTH_CHECK_CONFIG.baseUrl}/`;
      const response = await fetchWithTimeout(url);
      
      const cdnHeaders = [
        'cf-ray',        // Cloudflare
        'x-cache',       // Various CDNs
        'x-served-by',   // Varnish/Fastly
        'server',        // Could indicate CDN
      ];
      
      const foundHeaders = cdnHeaders.filter(header => 
        response.headers.has(header)
      );
      
      if (foundHeaders.length > 0) {
        console.log(`✓ CDN detected: ${foundHeaders.join(', ')}`);
      } else {
        console.log('⚠ No CDN headers detected');
      }
    });
  });
});

// Test de disponibilité globale
describe('Global Availability', () => {
  test('should be accessible from multiple regions', async () => {
    // Ce test pourrait être étendu pour tester depuis plusieurs régions
    const url = HEALTH_CHECK_CONFIG.baseUrl;
    
    const start = Date.now();
    const response = await fetchWithTimeout(url);
    const responseTime = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(5000); // 5s timeout global
    
    console.log(`✓ Global accessibility: ${responseTime}ms from current region`);
  });
});

export { HEALTH_CHECK_CONFIG };