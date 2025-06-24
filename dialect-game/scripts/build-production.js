#!/usr/bin/env node
/**
 * Script de build production avec optimisations avancées
 * Task 18: Déploiement Production - Phase 4
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration du build
const BUILD_CONFIG = {
  // Directories
  sourceDir: 'src',
  buildDir: 'dist',
  publicDir: 'public',
  
  // Optimization flags
  minify: true,
  sourceMaps: process.env.NODE_ENV !== 'production',
  treeshaking: true,
  codesplitting: true,
  
  // Target browsers
  browserslist: [
    "> 0.5%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ],
  
  // Bundle analysis
  analyze: process.env.ANALYZE === 'true',
  
  // Environment
  env: process.env.NODE_ENV || 'production',
};

// Utilities
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  step: (msg) => console.log(chalk.cyan('▶'), chalk.bold(msg)),
};

// Mesurer le temps d'exécution
function timeExecution(name, fn) {
  const start = Date.now();
  log.step(`Starting ${name}...`);
  
  return Promise.resolve(fn()).then(result => {
    const duration = Date.now() - start;
    log.success(`${name} completed in ${duration}ms`);
    return result;
  }).catch(error => {
    const duration = Date.now() - start;
    log.error(`${name} failed after ${duration}ms: ${error.message}`);
    throw error;
  });
}

// Nettoyer le répertoire de build
async function cleanBuildDir() {
  return timeExecution('Clean build directory', async () => {
    try {
      await fs.rm(BUILD_CONFIG.buildDir, { recursive: true, force: true });
      await fs.mkdir(BUILD_CONFIG.buildDir, { recursive: true });
      log.info('Build directory cleaned');
    } catch (error) {
      log.warning('Could not clean build directory:', error.message);
    }
  });
}

// Générer les informations de build
async function generateBuildInfo() {
  return timeExecution('Generate build info', async () => {
    const buildInfo = {
      buildId: process.env.BUILD_ID || `build-${Date.now()}`,
      version: process.env.VERSION || require('../package.json').version,
      commitSha: process.env.GITHUB_SHA || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      branch: process.env.GITHUB_REF_NAME || execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
      buildTime: new Date().toISOString(),
      environment: BUILD_CONFIG.env,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    const buildInfoPath = path.join(BUILD_CONFIG.publicDir, 'build-info.json');
    await fs.writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
    log.info(`Build info generated: ${buildInfo.buildId}`);
    return buildInfo;
  });
}

// Build TypeScript et bundling
async function buildApplication() {
  return timeExecution('Build application', async () => {
    const buildCommand = [
      'npm run build',
      BUILD_CONFIG.minify ? '--minify' : '',
      BUILD_CONFIG.sourceMaps ? '--sourcemap' : '',
      BUILD_CONFIG.treeshaking ? '--treeshaking' : '',
      `--target=${BUILD_CONFIG.browserslist.join(',')}`,
    ].filter(Boolean).join(' ');

    try {
      execSync(buildCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: BUILD_CONFIG.env,
          ANALYZE: BUILD_CONFIG.analyze.toString(),
        }
      });
      log.success('Application built successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  });
}

// Optimiser les images
async function optimizeImages() {
  return timeExecution('Optimize images', async () => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
    const imagesDir = path.join(BUILD_CONFIG.buildDir, 'images');
    
    try {
      // Vérifier si le répertoire d'images existe
      await fs.access(imagesDir);
      
      // Optimiser avec imagemin (si disponible)
      try {
        execSync('npx imagemin "dist/images/**/*" --out-dir=dist/images --plugin=imagemin-mozjpeg --plugin=imagemin-pngquant --plugin=imagemin-svgo', {
          stdio: 'pipe'
        });
        log.success('Images optimized with imagemin');
      } catch (error) {
        log.warning('imagemin not available, skipping image optimization');
      }
      
    } catch (error) {
      log.info('No images directory found, skipping optimization');
    }
  });
}

// Optimiser les fonts
async function optimizeFonts() {
  return timeExecution('Optimize fonts', async () => {
    const fontsDir = path.join(BUILD_CONFIG.buildDir, 'fonts');
    
    try {
      await fs.access(fontsDir);
      
      // Générer les sous-ensembles de fonts si nécessaire
      const fontFiles = await fs.readdir(fontsDir);
      const woffFiles = fontFiles.filter(file => file.endsWith('.woff2') || file.endsWith('.woff'));
      
      log.info(`Found ${woffFiles.length} font files`);
      
      // Précharger les fonts critiques
      const preloadFonts = [
        'Inter-Regular.woff2',
        'Inter-Medium.woff2',
        'Inter-SemiBold.woff2',
      ];
      
      const preloadInfo = preloadFonts
        .filter(font => woffFiles.includes(font))
        .map(font => `<link rel="preload" href="/fonts/${font}" as="font" type="font/woff2" crossorigin="anonymous">`);
      
      // Sauvegarder les informations de préchargement
      await fs.writeFile(
        path.join(BUILD_CONFIG.buildDir, 'font-preload.html'),
        preloadInfo.join('\n')
      );
      
      log.success(`Font optimization completed (${preloadInfo.length} preload hints generated)`);
      
    } catch (error) {
      log.info('No fonts directory found, skipping optimization');
    }
  });
}

// Générer le manifest PWA
async function generateManifest() {
  return timeExecution('Generate PWA manifest', async () => {
    const manifest = {
      name: "Dialect Game - Apprentissage Collaboratif",
      short_name: "Dialect Game",
      description: "Plateforme d'apprentissage des langues collaborative et interactive",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#3b82f6",
      orientation: "portrait-primary",
      
      icons: [
        {
          src: "/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
          purpose: "maskable any"
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable any"
        }
      ],
      
      categories: ["education", "games", "social"],
      screenshots: [
        {
          src: "/screenshots/desktop-1.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "/screenshots/mobile-1.png",
          sizes: "750x1334",
          type: "image/png",
          form_factor: "narrow"
        }
      ],
      
      shortcuts: [
        {
          name: "Nouvelle Leçon",
          short_name: "Leçon",
          description: "Commencer une nouvelle leçon",
          url: "/lesson/new",
          icons: [{ src: "/icons/shortcut-lesson.png", sizes: "96x96" }]
        },
        {
          name: "Mode Collaboratif",
          short_name: "Collaboratif",
          description: "Rejoindre une session collaborative",
          url: "/collaborative",
          icons: [{ src: "/icons/shortcut-collaborative.png", sizes: "96x96" }]
        }
      ]
    };

    await fs.writeFile(
      path.join(BUILD_CONFIG.buildDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    log.success('PWA manifest generated');
  });
}

// Générer le Service Worker
async function generateServiceWorker() {
  return timeExecution('Generate Service Worker', async () => {
    const swContent = `
// Service Worker pour Dialect Game
// Generated at: ${new Date().toISOString()}

const CACHE_NAME = 'dialect-game-v${require('../package.json').version}';
const STATIC_CACHE_NAME = 'dialect-game-static-v${require('../package.json').version}';
const DYNAMIC_CACHE_NAME = 'dialect-game-dynamic-v${require('../package.json').version}';

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/css/main.css',
  '/js/main.js',
  '/fonts/Inter-Regular.woff2',
  '/fonts/Inter-Medium.woff2',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('dialect-game-') && 
                     cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Stratégie de cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  // Static assets: Cache First
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.match(/\\.(css|js|woff2?|png|jpg|svg)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // API requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // HTML pages: Stale While Revalidate
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default: Network First
  event.respondWith(networkFirst(request));
});

// Cache First strategy
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First strategy
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.error('[SW] Stale While Revalidate failed:', error);
      return cached;
    });
  
  return cached || fetchPromise;
}
`;

    await fs.writeFile(path.join(BUILD_CONFIG.buildDir, 'sw.js'), swContent);
    log.success('Service Worker generated');
  });
}

// Analyser la taille des bundles
async function analyzeBundleSize() {
  return timeExecution('Analyze bundle size', async () => {
    const buildPath = BUILD_CONFIG.buildDir;
    
    try {
      const files = await fs.readdir(buildPath, { recursive: true });
      const jsFiles = files.filter(file => file.endsWith('.js'));
      const cssFiles = files.filter(file => file.endsWith('.css'));
      
      let totalJsSize = 0;
      let totalCssSize = 0;
      
      for (const file of jsFiles) {
        const filePath = path.join(buildPath, file);
        const stats = await fs.stat(filePath);
        totalJsSize += stats.size;
      }
      
      for (const file of cssFiles) {
        const filePath = path.join(buildPath, file);
        const stats = await fs.stat(filePath);
        totalCssSize += stats.size;
      }
      
      const bundleInfo = {
        javascript: {
          files: jsFiles.length,
          totalSize: totalJsSize,
          totalSizeMB: Math.round(totalJsSize / 1024 / 1024 * 100) / 100,
        },
        css: {
          files: cssFiles.length,
          totalSize: totalCssSize,
          totalSizeMB: Math.round(totalCssSize / 1024 / 1024 * 100) / 100,
        },
        total: {
          size: totalJsSize + totalCssSize,
          sizeMB: Math.round((totalJsSize + totalCssSize) / 1024 / 1024 * 100) / 100,
        },
      };
      
      // Sauvegarder l'analyse
      await fs.writeFile(
        path.join(BUILD_CONFIG.buildDir, 'bundle-analysis.json'),
        JSON.stringify(bundleInfo, null, 2)
      );
      
      // Afficher les résultats
      log.info(`Bundle Analysis:`);
      log.info(`  JavaScript: ${bundleInfo.javascript.files} files, ${bundleInfo.javascript.totalSizeMB}MB`);
      log.info(`  CSS: ${bundleInfo.css.files} files, ${bundleInfo.css.totalSizeMB}MB`);
      log.info(`  Total: ${bundleInfo.total.sizeMB}MB`);
      
      // Avertissements de taille
      if (bundleInfo.total.sizeMB > 5) {
        log.warning(`Bundle size is large (${bundleInfo.total.sizeMB}MB). Consider code splitting.`);
      }
      
      return bundleInfo;
      
    } catch (error) {
      log.warning('Could not analyze bundle size:', error.message);
      return null;
    }
  });
}

// Générer le sitemap
async function generateSitemap() {
  return timeExecution('Generate sitemap', async () => {
    const baseUrl = process.env.BASE_URL || 'https://dialect-game.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/enhanced', priority: '0.9', changefreq: 'weekly' },
      { path: '/collaborative', priority: '0.8', changefreq: 'weekly' },
      { path: '/education', priority: '0.8', changefreq: 'weekly' },
      { path: '/progression', priority: '0.7', changefreq: 'weekly' },
      { path: '/multiplayer', priority: '0.7', changefreq: 'weekly' },
    ];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    await fs.writeFile(path.join(BUILD_CONFIG.buildDir, 'sitemap.xml'), sitemap);
    log.success('Sitemap generated');
  });
}

// Script principal
async function buildProduction() {
  console.log(chalk.bold.blue('🚀 Building Dialect Game for Production\n'));
  
  const startTime = Date.now();
  
  try {
    // Étapes de build
    await cleanBuildDir();
    const buildInfo = await generateBuildInfo();
    await buildApplication();
    await optimizeImages();
    await optimizeFonts();
    await generateManifest();
    await generateServiceWorker();
    await generateSitemap();
    const bundleInfo = await analyzeBundleSize();
    
    // Résumé final
    const totalTime = Date.now() - startTime;
    
    console.log('\n' + chalk.bold.green('✅ Production build completed successfully!'));
    console.log(chalk.gray(`   Total time: ${totalTime}ms`));
    console.log(chalk.gray(`   Build ID: ${buildInfo.buildId}`));
    console.log(chalk.gray(`   Version: ${buildInfo.version}`));
    
    if (bundleInfo) {
      console.log(chalk.gray(`   Bundle size: ${bundleInfo.total.sizeMB}MB`));
    }
    
    console.log(chalk.blue(`\n📁 Build output: ${BUILD_CONFIG.buildDir}/`));
    
  } catch (error) {
    console.log('\n' + chalk.bold.red('❌ Production build failed!'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Exécuter le build si ce script est appelé directement
if (require.main === module) {
  buildProduction();
}

module.exports = {
  buildProduction,
  BUILD_CONFIG,
};