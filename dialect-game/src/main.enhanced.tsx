/**
 * Point d'entrée pour la démonstration Task 9: Amélioration UX/UI
 * Mode Enhanced avec animations et micro-interactions avancées
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import AppEnhanced from './components/App.enhanced.tsx'
import './index.css'

// Mode développement avec logs détaillés
if (import.meta.env.DEV) {
  console.log('🚀 Dialect Game Enhanced - Task 9 Demo');
  console.log('✨ Nouvelles fonctionnalités:');
  console.log('  • EnhancedButton avec ripple effects');
  console.log('  • EnhancedCard avec animations hover');
  console.log('  • Toast notifications avancées');
  console.log('  • Système d\'onboarding interactif');
  console.log('  • Micro-interactions et feedback haptique');
  console.log('  • Animations TailwindCSS personnalisées');
}

// Performance monitoring pour les animations
const observePerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Observer les métriques de performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('animation')) {
          console.log(`🎨 Animation "${entry.name}": ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Mesurer les temps de réponse des interactions
    let interactionStart = 0;
    document.addEventListener('click', () => {
      interactionStart = performance.now();
      performance.mark('interaction-start');
    });

    document.addEventListener('transitionend', () => {
      if (interactionStart > 0) {
        const duration = performance.now() - interactionStart;
        if (duration < 100) {
          console.log(`⚡ Interaction ultra-rapide: ${duration.toFixed(2)}ms`);
        }
      }
    });
  }
};

// Support des animations réduites
const setupReducedMotion = () => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      document.documentElement.classList.add('reduce-motion');
      console.log('♿ Mode animations réduites activé');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  mediaQuery.addEventListener('change', handleReducedMotion);
  handleReducedMotion(mediaQuery);
};

// Gestion des gestes tactiles pour mobile
const setupTouchGestures = () => {
  if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
    console.log('📱 Optimisations tactiles activées');

    // Support du feedback haptique
    if ('vibrate' in navigator) {
      console.log('📳 Feedback haptique disponible');
    }
  }
};

// Initialisation
const init = async () => {
  // Setup de l'environnement
  observePerformance();
  setupReducedMotion();
  setupTouchGestures();

  // Styles CSS avancés pour les animations
  const style = document.createElement('style');
  style.textContent = `
    /* Animations globales */
    * {
      scroll-behavior: smooth;
    }
    
    .reduce-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    /* Focus visible amélioré */
    *:focus-visible {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
      border-radius: 4px;
    }
    
    /* Curseurs personnalisés */
    .cursor-grab {
      cursor: grab;
    }
    
    .cursor-grab:active {
      cursor: grabbing;
    }
    
    /* Transitions fluides pour tous les éléments interactifs */
    button, a, [role="button"] {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Animation d'entrée pour la page */
    body {
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Styles pour les toast notifications */
    [data-toast-viewport] {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 100;
      max-width: 100vw;
      margin: 0;
      padding: 1rem;
      list-style: none;
      outline: none;
    }
  `;
  document.head.appendChild(style);

  // Message de bienvenue dans la console
  console.log(`
🎨 TASK 9 - AMÉLIORATIONS UX/UI CHARGÉES
═══════════════════════════════════════

✅ Enhanced Button - Ripple effects + animations
✅ Enhanced Card - Hover states + micro-interactions  
✅ Toast System - Notifications animées + auto-dismiss
✅ Onboarding - Guided tours + spotlight effects
✅ TailwindCSS - Animations personnalisées + utilities
✅ Performance - Monitoring temps réel + optimisations

🚀 Interface prête pour les démonstrations !
  `);

  // Rendu de l'application
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppEnhanced />
    </React.StrictMode>,
  );
};

// Démarrer l'application
init().catch(console.error);