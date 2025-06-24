# 🚀 Guide de Déploiement

Guide complet pour déployer le Dialect Learning Game en production avec différentes plateformes et configurations.

## 📋 Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [Préparation](#préparation)
- [Build de Production](#build-de-production)
- [Déploiement Vercel](#déploiement-vercel)
- [Déploiement Netlify](#déploiement-netlify)
- [Déploiement GitHub Pages](#déploiement-github-pages)
- [Docker & Containers](#docker--containers)
- [Configuration Serveur](#configuration-serveur)
- [Performance & Monitoring](#performance--monitoring)
- [CI/CD](#cicd)

## 🎯 Vue d'ensemble

Le Dialect Game est une **Single Page Application (SPA)** optimisée pour le déploiement sur les plateformes modernes :

### Caractéristiques
- ✅ **Static Build** - Aucun serveur backend requis
- ✅ **APIs Externes** - Pas de base de données
- ✅ **PWA Ready** - Support offline partiel
- ✅ **CDN Friendly** - Assets optimisés pour la distribution
- ✅ **Multi-Platform** - Compatible avec tous les hébergeurs statiques

### Prérequis
- Node.js 18+
- npm/yarn/pnpm
- Git
- Variables d'environnement configurées

## 🔧 Préparation

### 1. Variables d'Environnement
```bash
# .env.production
VITE_APP_TITLE=Dialect Learning Game
VITE_APP_VERSION=1.0.0
VITE_BASE_URL=/

# APIs (optionnelles, fallbacks inclus)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
VITE_PEXELS_API_KEY=your_pexels_key

# Configuration
VITE_DEFAULT_LANGUAGE=en
VITE_CACHE_DURATION=3600000
VITE_ENABLE_ANALYTICS=true

# Performance
VITE_PRELOAD_IMAGES=true
VITE_LAZY_LOADING=true
VITE_SERVICE_WORKER=true
```

### 2. Configuration Build
```typescript
// vite.config.ts - Production optimisé
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // Désactiver en production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-button', '@radix-ui/react-card'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### 3. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "NODE_ENV=production npm run build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-analyzer dist/assets/*.js"
  }
}
```

## 🏗️ Build de Production

### 1. Build Standard
```bash
# Nettoyer les dépendances
npm ci

# Type check
npm run type-check

# Linting
npm run lint

# Tests unitaires
npm run test

# Build de production
npm run build:prod

# Vérifier le build
npm run preview
```

### 2. Optimisations Avancées
```bash
# Analyser le bundle
npm run analyze

# Vérifier la taille
du -sh dist/

# Tester les performances
npx lighthouse http://localhost:4173 --only-categories=performance --chrome-flags="--headless"
```

### 3. Structure de Build
```
dist/
├── index.html              # Point d'entrée
├── assets/                 # Assets statiques
│   ├── index-[hash].js    # JavaScript principal
│   ├── index-[hash].css   # CSS principal
│   ├── vendor-[hash].js   # Dépendances
│   └── ui-[hash].js       # Composants UI
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── favicon.ico            # Favicon
```

## ☁️ Déploiement Vercel

### 1. Setup Rapide
```bash
# Installation Vercel CLI
npm i -g vercel

# Login
vercel login

# Déploiement
vercel

# Production
vercel --prod
```

### 2. Configuration vercel.json
```json
{
  "version": 2,
  "name": "dialect-learning-game",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_APP_TITLE": "Dialect Learning Game",
    "VITE_BASE_URL": "/"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Variables d'Environnement Vercel
```bash
# Via CLI
vercel env add VITE_UNSPLASH_ACCESS_KEY production
vercel env add VITE_PEXELS_API_KEY production

# Via Dashboard
# Aller sur vercel.com > Projet > Settings > Environment Variables
```

### 4. Domaine Personnalisé
```bash
# Ajouter un domaine
vercel domains add dialect-game.com

# Configurer DNS
# A record: @ -> 76.76.19.61
# CNAME: www -> cname.vercel-dns.com
```

## 🌐 Déploiement Netlify

### 1. Drag & Drop Deploy
```bash
# Build local
npm run build

# Uploader dist/ sur netlify.com/drop
```

### 2. Git-based Deploy
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
```

### 3. Configuration CLI
```bash
# Installation
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### 4. Variables d'Environnement
```bash
# Via CLI
netlify env:set VITE_UNSPLASH_ACCESS_KEY "your-key"
netlify env:set VITE_PEXELS_API_KEY "your-key"

# Via Dashboard
# Aller sur app.netlify.com > Site > Site settings > Environment variables
```

## 📄 Déploiement GitHub Pages

### 1. Configuration Repository
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test
      
    - name: Build
      run: npm run build
      env:
        VITE_BASE_URL: /${{ github.event.repository.name }}/
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. Configuration Vite
```typescript
// vite.config.ts pour GitHub Pages
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  // ... autres configurations
});
```

### 3. Settings Repository
```bash
# Activer GitHub Pages
# GitHub.com > Repository > Settings > Pages
# Source: Deploy from a branch
# Branch: gh-pages / root
```

## 🐳 Docker & Containers

### 1. Dockerfile
```dockerfile
# Multi-stage build pour optimisation
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./
RUN npm ci --only=production

# Copier source et build
COPY . .
RUN npm run build

# Stage production avec nginx
FROM nginx:alpine

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les assets buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Santé check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Configuration Nginx
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Cache des assets statiques
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
            
            # Headers de sécurité
            add_header X-Frame-Options "DENY" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header X-XSS-Protection "1; mode=block" always;
            add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        }
        
        # Gestion des erreurs
        error_page 404 /index.html;
    }
}
```

### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  dialect-game:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dialect-game.rule=Host(`dialect-game.com`)"
      - "traefik.http.routers.dialect-game.tls=true"
      - "traefik.http.routers.dialect-game.tls.certresolver=letsencrypt"

  # Optionnel: Reverse proxy avec SSL
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
```

### 4. Commandes Docker
```bash
# Build
docker build -t dialect-game .

# Run
docker run -p 80:80 dialect-game

# Docker Compose
docker-compose up -d

# Logs
docker-compose logs -f dialect-game
```

## ⚙️ Configuration Serveur

### 1. Apache (.htaccess)
```apache
# .htaccess pour SPA routing
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache des assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 2. Serveur Node.js/Express
```javascript
// server.js - Serveur simple pour hébergement
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.dictionaryapi.dev", "https://libretranslate.de", "https://api.unsplash.com", "https://api.pexels.com"]
    }
  }
}));

// Compression
app.use(compression());

// Assets statiques avec cache
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true
}));

// Autres fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 📊 Performance & Monitoring

### 1. Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 2. Configuration Lighthouse
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["http://localhost/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 3. Monitoring avec Sentry
```typescript
// src/utils/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

export function trackPerformance(name: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name} took ${duration}ms`,
    level: 'info'
  });
}
```

## 🔄 CI/CD

### 1. GitHub Actions Complete
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Type check
      run: npm run type-check
      
    - name: Unit tests
      run: npm run test
      
    - name: E2E tests
      run: npm run test:e2e
      
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_APP_VERSION: ${{ github.sha }}
        
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist
        path: dist/
        
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### 2. Semantic Release
```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github"
    ]
  }
}
```

### 3. Environment Management
```bash
# Staging
VITE_API_BASE_URL=https://staging-api.dialect-game.com
VITE_SENTRY_DSN=staging-dsn

# Production  
VITE_API_BASE_URL=https://api.dialect-game.com
VITE_SENTRY_DSN=production-dsn
```

## 🔐 Sécurité

### 1. Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  connect-src 'self' https://api.dictionaryapi.dev https://libretranslate.de https://api.unsplash.com https://api.pexels.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### 2. Environment Variables Security
```bash
# NE JAMAIS committer en Git
.env.local
.env.production

# Utiliser des secrets pour CI/CD
VERCEL_TOKEN
NETLIFY_AUTH_TOKEN
SENTRY_DSN
```

---

**🚀 Votre Dialect Game est maintenant prêt pour la production !**

Choisissez la plateforme qui correspond le mieux à vos besoins et suivez les guides spécifiques pour un déploiement optimal.