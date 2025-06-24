/**
 * ConfirmDialog - Composant modal moderne pour confirmations
 * Standards UX/UI 2025 : Accessibilité WCAG AA + micro-interactions
 * 
 * FONCTIONNALITÉS IMPLÉMENTÉES :
 * ✅ Focus management automatique (trap + restore)
 * ✅ Keyboard navigation (Escape, Tab, Enter)
 * ✅ Overlay avec backdrop blur
 * ✅ Animations subtiles (scale + fade)
 * ✅ Boutons différenciés par variant
 * ✅ Mobile responsive avec touch-friendly
 * ✅ Cohérence design avec LESSON_THEME
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { X, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info';
}

const VARIANT_CONFIG = {
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  warning: {
    icon: HelpCircle,
    iconColor: 'text-orange-500',
    confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderColor: 'border-blue-200 dark:border-blue-800'
  }
} as const;

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'warning'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  // Focus management et keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder l'élément actif avant ouverture
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus automatique sur bouton annuler (UX safe)
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);

      // Trap focus dans le dialog
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {          e.preventDefault();
          onClose();
        }
        
        if (e.key === 'Tab') {
          // Cycle focus entre les deux boutons
          const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);
          const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
          
          if (e.shiftKey) {
            // Tab + Shift : précédent
            const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
            e.preventDefault();
            focusableElements[prevIndex]?.focus();
          } else {
            // Tab : suivant
            const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
            e.preventDefault();
            focusableElements[nextIndex]?.focus();
          }
        }

        if (e.key === 'Enter' && document.activeElement === confirmButtonRef.current) {
          e.preventDefault();
          onConfirm();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll

      return () => {        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        
        // Restore focus sur l'élément précédent
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose, onConfirm]);

  // Handler pour clic sur overlay (fermeture)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handler pour confirmer avec feedback tactile
  const handleConfirm = () => {
    // Micro-animation feedback avant confirmation
    if (confirmButtonRef.current) {
      confirmButtonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.style.transform = 'scale(1)';
        }
        onConfirm();
      }, 150);
    } else {
      onConfirm();
    }
  };

  if (!isOpen) return null;
  // Portal pour render en dehors de l'arbre React principal
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Overlay avec blur et animation fade */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm
                      animate-in fade-in duration-300" />
      
      {/* Dialog container avec animation scale */}
      <div
        ref={dialogRef}
        className={`
          relative w-full max-w-md mx-auto
          bg-white dark:bg-gray-800 
          border-2 ${config.borderColor}
          rounded-2xl shadow-2xl
          p-6 space-y-6
          animate-in zoom-in-95 fade-in duration-300
          transform-gpu
        `}
      >
        {/* Header avec icône et titre */}
        <div className="flex items-start space-x-4">
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-full 
            bg-gray-100 dark:bg-gray-700
            flex items-center justify-center
          `}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>          
          <div className="flex-1 min-w-0">
            <h3 
              id="dialog-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-6"
            >
              {title}
            </h3>
            <p 
              id="dialog-description"
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Bouton fermeture (optionnel, déjà géré par Escape) */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors duration-200 focus:outline-none focus:ring-2 
                       focus:ring-gray-400 dark:focus:ring-gray-500"
            aria-label="Fermer le dialog"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Actions avec boutons différenciés */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          {/* Bouton Annuler (neutral, focus par défaut) */}
          <Button
            ref={cancelButtonRef}
            variant="outline"            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium
                       border-gray-300 dark:border-gray-600
                       hover:bg-gray-50 dark:hover:bg-gray-700
                       focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
                       transition-all duration-200"
          >
            {cancelText}
          </Button>

          {/* Bouton Confirmer (variant specific) */}
          <Button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`
              w-full sm:w-auto px-6 py-2.5 text-sm font-medium
              ${config.confirmButton}
              focus:ring-2 focus:ring-offset-2 focus:ring-current
              transition-all duration-200
              transform active:scale-95
            `}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;