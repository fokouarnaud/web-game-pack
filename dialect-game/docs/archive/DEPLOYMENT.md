# 🚀 Guide de Déploiement - Dialect Game

## 📋 Checklist de Déploiement

### ✅ Pré-déploiement
- [ ] Tests passent (`npm run test`)
- [ ] Build de production réussit (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Services externes configurés
- [ ] Certificats SSL en place
- [ ] Monitoring configuré

### ✅ Variables d'Environnement Obligatoires

```bash
# .env.production
VITE_API_URL=https://api.dialectgame.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### ✅ Services Externes Requis

#### 1. **Google OAuth 2.0**
- Console: https://console.cloud.google.com/
- API: Google Sign-In API
- Scope: `profile`, `email`

#### 2. **Speech Recognition API**
- **Azure Cognitive Services** (Recommandé)
  - Service: Speech Services
  - Région: East US ou Europe West
- **Alternative**: Google Speech-to-Text API

#### 3. **Analytics & Monitoring**
- **Google Analytics 4**: Tracking des événements
- **Sentry**: Monitoring des erreurs en production

#### 4. **Base de Données** (Optionnel)
- **Supabase** (Recommandé): PostgreSQL + Auth
- **Alternative**: Firebase Firestore

## 🌐 Déploiement par Plateforme

### 🎯 Vercel (Production Recommandée)

```bash
# Installation
npm i -g vercel

# Configuration des variables
vercel env add VITE_API_URL production
vercel env add VITE_GOOGLE_CLIENT_ID production
vercel env add VITE_ANALYTICS_ID production
vercel env add VITE_SENTRY_DSN production

# Déploiement
vercel --prod
```

**Configuration vercel.json:**
```json
{
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
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
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

### 🌊 Netlify

```bash
# Build local
npm run build

# Configuration netlify.toml
```

**Configuration netlify.toml:**
```toml
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
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### 🐳 Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
    restart: unless-stopped
```

## 🔧 Configuration des Services

### Google OAuth Setup

1. **Créer un projet Google Cloud**
   ```bash
   # URL: https://console.cloud.google.com/
   ```

2. **Configurer OAuth 2.0**
   ```
   - APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized origins: https://votre-domaine.com
   - Authorized redirect URIs: https://votre-domaine.com/auth/callback
   ```

3. **Récupérer les clés**
   ```bash
   VITE_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
   ```

### Azure Speech Services Setup

1. **Créer une ressource Speech**
   ```bash
   # Azure Portal > Create Resource > Cognitive Services > Speech
   ```

2. **Configuration**
   ```bash
   VITE_SPEECH_API_KEY=your-azure-speech-key
   VITE_SPEECH_SERVICE_REGION=eastus
   ```

### Sentry Monitoring Setup

1. **Créer un projet Sentry**
   ```bash
   # URL: https://sentry.io/
   ```

2. **Configuration**
   ```bash
   VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
   ```

## 📊 Monitoring et Performance

### Core Web Vitals Targets
- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1
- **TTFB**: < 800ms

### Monitoring des Métriques

```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    // Send to analytics
    gtag('event', 'web_vital', {
      name: entry.name,
      value: entry.value,
      delta: entry.delta,
    });
  });
});

observer.observe({ entryTypes: ['web-vital'] });
```

## 🔒 Sécurité en Production

### Headers de Sécurité
```nginx
# nginx.conf
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### Variables Sensibles
- ⚠️ **Ne jamais exposer** les clés privées côté client
- ✅ **Utiliser** les variables VITE_ pour le frontend uniquement
- 🔒 **Stocker** les secrets dans les variables d'environnement du serveur

## 🚨 Dépannage

### Erreurs Communes

#### 1. **Build Failed**
```bash
# Vérifier Node.js version
node --version  # Doit être 18+

# Nettoyer les caches
rm -rf node_modules package-lock.json
npm install
```

#### 2. **Variables d'Environnement Non Reconnues**
```bash
# Vérifier le préfixe VITE_
echo $VITE_API_URL

# Redémarrer le serveur de dev
npm run dev
```

#### 3. **Erreurs CORS**
```javascript
// Configurer les headers CORS sur votre API
Access-Control-Allow-Origin: https://votre-domaine.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Logs de Débogage

```bash
# Activer les logs détaillés
VITE_DEBUG_MODE=true npm run dev

# Vérifier les erreurs Sentry
# Dashboard: https://sentry.io/organizations/your-org/issues/
```

## 📈 Optimisations Post-Déploiement

### 1. **CDN Setup**
- Configurer Cloudflare ou AWS CloudFront
- Cache des assets statiques (24h+)
- Compression Gzip/Brotli

### 2. **Database Optimization**
- Index sur les requêtes fréquentes
- Connection pooling
- Cache Redis pour les sessions

### 3. **Monitoring Alerts**
```yaml
# Alerts Sentry
- Error rate > 1%
- Response time > 2s
- Memory usage > 80%
```

## 🎯 Checklist Final

- [ ] ✅ Application accessible via HTTPS
- [ ] ✅ PWA installable sur mobile
- [ ] ✅ Performance Score > 90 (Lighthouse)
- [ ] ✅ Accessibilité Score > 95
- [ ] ✅ SEO Score > 90
- [ ] ✅ Monitoring actif (Sentry + Analytics)
- [ ] ✅ Backup automatique configuré
- [ ] ✅ SSL/TLS Grade A+ (SSL Labs)

---

**🚀 Votre application Dialect Game est prête pour la production !**

Pour toute question ou problème de déploiement, consultez les logs ou créez une issue sur le repository.