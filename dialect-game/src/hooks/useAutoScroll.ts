/**
 * useAutoScroll - Hook personnalisé pour auto-scroll intelligent vers boutons CTA
 * Extension du pattern AutoScrollContainer existant pour cibler spécifiquement les boutons critiques
 * 
 * FONCTIONNALITÉS :
 * 1. Scroll smooth vers boutons d'action spécifiques
 * 2. Highlight temporaire avec ring pour feedback visuel
 * 3. Throttling intégré pour éviter appels multiples
 * 4. Gestion d'erreurs robuste
 * 5. Interface simple et réutilisable
 */

import React, { useCallback, useRef, useState } from 'react';

// Interface de retour du hook
export interface UseAutoScrollReturn {
  scrollToActionButton: (selector: string) => void;
  isScrolling: boolean;
}

// Configuration du hook
interface AutoScrollConfig {
  scrollDelay?: number;        // Délai avant scroll (défaut: 300ms)
  highlightDuration?: number;  // Durée du highlight (défaut: 2000ms)
  scrollBehavior?: ScrollBehavior; // Comportement scroll (défaut: 'smooth')
  scrollBlock?: ScrollLogicalPosition; // Position block (défaut: 'center')
}

/**
 * Hook useAutoScroll
 * Fournit une fonction pour faire défiler automatiquement vers un bouton
 * avec highlight temporaire pour améliorer l'UX
 */
export const useAutoScroll = (config: AutoScrollConfig = {}): UseAutoScrollReturn => {
  const {
    scrollDelay = 300,
    highlightDuration = 2000,
    scrollBehavior = 'smooth',
    scrollBlock = 'center'
  } = config;

  // État pour tracking du scroll en cours
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Ref pour throttling (éviter appels multiples)
  const lastScrollTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Fonction de cleanup pour le highlight
  const cleanupHighlight = useCallback((element: Element) => {
    element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-75');
  }, []);

  // Fonction d'ajout du highlight temporaire
  const addTemporaryHighlight = useCallback((element: Element) => {
    // Ajouter les classes de highlight
    element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-75');
    
    // Programmer la suppression du highlight
    setTimeout(() => {
      cleanupHighlight(element);
    }, highlightDuration);
  }, [highlightDuration, cleanupHighlight]);

  // Fonction principale de scroll vers bouton CTA
  const scrollToActionButton = useCallback((selector: string) => {
    // Vérification throttling : minimum 300ms entre appels
    const currentTime = Date.now();
    if (currentTime - lastScrollTimeRef.current < scrollDelay) {
      console.log('[useAutoScroll] Throttled - appel trop rapide');
      return;
    }
    
    // Mise à jour du timestamp pour throttling
    lastScrollTimeRef.current = currentTime;
    
    // Nettoyage du timeout précédent si existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Recherche de l'élément cible
    const targetElement = document.querySelector(selector);
    
    if (!targetElement) {
      console.warn(`[useAutoScroll] Élément non trouvé pour le sélecteur: ${selector}`);
      return;
    }

    // Démarrage de l'état scrolling
    setIsScrolling(true);

    // Délai avant scroll (comme dans AutoScrollContainer)
    timeoutRef.current = setTimeout(() => {
      try {
        // Scroll vers l'élément cible
        targetElement.scrollIntoView({
          behavior: scrollBehavior,
          block: scrollBlock,
          inline: 'nearest'
        });

        // Ajout du highlight temporaire
        addTemporaryHighlight(targetElement);
        
        console.log(`[useAutoScroll] Scroll vers: ${selector}`);
        
        // Fin de l'état scrolling après animation (estimation)
        setTimeout(() => {
          setIsScrolling(false);
        }, 800); // Durée approximative de l'animation smooth
        
      } catch (error) {
        console.error('[useAutoScroll] Erreur lors du scroll:', error);
        setIsScrolling(false);
      }
    }, scrollDelay);
    
  }, [scrollDelay, scrollBehavior, scrollBlock, addTemporaryHighlight]);
  // Cleanup lors du démontage du composant
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsScrolling(false);
  }, []);

  // Effect de cleanup au démontage
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Retour de l'interface du hook
  return {
    scrollToActionButton,
    isScrolling
  };
};

export default useAutoScroll;