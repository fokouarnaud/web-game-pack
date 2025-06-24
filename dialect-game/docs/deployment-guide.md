# 🚀 Production Deployment Guide

## 📋 Pre-deployment Checklist

### **✅ Code Quality Validation**
```bash
# Run complete test suite
npm run test              # Unit & Integration tests
npm run test:e2e          # End-to-end tests
npm run test:performance  # Performance validation
npm run test:coverage     # Coverage verification (target: >85%)

# Code quality checks
npm run lint              # ESLint validation
npm run type-check        # TypeScript strict validation
npm run format            # Prettier formatting

# Build validation
npm run build             # Production build
npm run preview           # Local production preview
```

### **✅ Performance Validation**
```bash
# Performance benchmarks to meet:
✅ Build time: < 60s
✅ CSS bundle: < 10kB
✅ JS bundle: < 500kB gzipped
✅ Load time: < 2s (3G connection)
✅ Core Web Vitals: Green scores
✅ Lighthouse: >90 Performance score
```

### **✅ Security Validation**
```bash
# Security checklist:
✅ HTTPS enforced
✅ CSP headers configured
✅ CSRF protection enabled
✅ Input sanitization active
✅ Rate limiting configured
✅ Error messages sanitized
✅ Sensitive data filtered
```

## 🌐 Environment Configuration

### **Production Environment Variables**
```bash
# .env.production
VITE_API_URL=https://api.dialectgame.com
VITE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_APP_ENV=production
VITE_PWA_ENABLED=true
VITE_CACHE_VERSION=v1.0.0
```

### **Build Configuration**
```typescript
// vite.config.ts - Production optimizations
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*']
        }
      }
    }
  },
  plugins: [
    react(),
    // PWA plugin for production
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

## 🏗️ Deployment Platforms

### **Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Configure custom domain
vercel domains add dialectgame.com
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### **Option 2: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### **Option 3: AWS S3 + CloudFront**
```bash
# Build for production
npm run build

# Install AWS CLI
aws configure

# Upload to S3
aws s3 sync dist/ s3://dialectgame-production --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id EXXXXXXXX --paths "/*"
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist
        path: dist/
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📊 Monitoring & Analytics

### **Performance Monitoring Setup**
```typescript
// src/utils/monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Web Vitals monitoring
function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true
    })
  }
}

// Initialize monitoring
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### **Error Monitoring with Sentry**
```typescript
// src/utils/errorMonitoring.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.exception) {
      const error = hint.originalException
      // Custom error filtering logic
    }
    return event
  }
})
```

### **Analytics Setup (GDPR Compliant)**
```html
<!-- Google Analytics 4 with consent management -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Default to denied
  gtag('consent', 'default', {
    'analytics_storage': 'denied'
  });
  
  gtag('js', new Date());
  gtag('config', 'GA-XXXXXXXXX', {
    anonymize_ip: true
  });
</script>
```

## 🔒 Security Configuration

### **Content Security Policy**
```html
<!-- meta tag in index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.dialectgame.com;">
```

### **Security Headers Middleware**
```javascript
// Express.js security headers (if using custom server)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
```

## 📱 PWA Deployment

### **Service Worker Registration**
```typescript
// src/utils/pwaUtils.ts
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            // Show update notification
            showUpdateNotification()
          }
        })
      })
    } catch (error) {
      console.log('SW registration failed: ', error)
    }
  })
}
```

### **App Install Prompt**
```typescript
// src/utils/installPrompt.ts
let deferredPrompt: any

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})

export async function promptInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    return outcome === 'accepted'
  }
  return false
}
```

## 📈 Performance Optimization

### **Bundle Analysis**
```bash
# Analyze bundle size
npm run build:analyze

# Bundle analyzer report
npx vite-bundle-analyzer dist
```

### **Lighthouse CI**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@0.11.x
        lhci autorun
```

**Lighthouse Configuration** (`.lighthouserc.js`):
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npm run preview',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
}
```

## 🔄 Post-Deployment Validation

### **Health Check Script**
```typescript
// scripts/healthCheck.ts
async function validateDeployment() {
  const checks = [
    { name: 'Homepage', url: 'https://dialectgame.com' },
    { name: 'API Health', url: 'https://api.dialectgame.com/health' },
    { name: 'PWA Manifest', url: 'https://dialectgame.com/manifest.json' },
    { name: 'Service Worker', url: 'https://dialectgame.com/sw.js' }
  ]
  
  for (const check of checks) {
    try {
      const response = await fetch(check.url)
      console.log(`✅ ${check.name}: ${response.status}`)
    } catch (error) {
      console.log(`❌ ${check.name}: Failed`)
    }
  }
}

validateDeployment()
```

### **Smoke Tests**
```bash
# Run post-deployment smoke tests
npm run test:smoke

# Check Core Web Vitals
npm run test:performance:production
```

## 🚨 Rollback Strategy

### **Quick Rollback**
```bash
# Vercel rollback to previous deployment
vercel rollback <deployment-url>

# Netlify rollback
netlify deploy --prod --dir=previous-build

# Manual rollback (if using Git tags)
git tag v1.0.1
git push origin v1.0.1
```

### **Rollback Checklist**
1. ✅ Verify issue impact and severity
2. ✅ Communicate rollback to stakeholders
3. ✅ Execute rollback procedure
4. ✅ Validate rollback success
5. ✅ Monitor for 30 minutes post-rollback
6. ✅ Update incident documentation

## 📞 Production Support

### **Monitoring Alerts**
- **Error Rate**: > 1% for 5 minutes
- **Response Time**: > 2s for 10 minutes
- **Availability**: < 99% for 1 minute
- **Core Web Vitals**: Degradation > 20%

### **Incident Response**
1. **Immediate**: Check monitoring dashboard
2. **5 minutes**: Assess impact and severity
3. **15 minutes**: Implement quick fix or rollback
4. **30 minutes**: Full investigation and resolution
5. **24 hours**: Post-mortem and prevention measures

---

**🎯 Deployment Success Criteria:**
- ✅ All tests passing (>85% coverage)
- ✅ Performance targets met (Lighthouse >90)
- ✅ Security headers configured
- ✅ Monitoring and alerting active
- ✅ PWA installation working
- ✅ Analytics and error tracking operational

**🚀 Ready for production deployment with confidence!**