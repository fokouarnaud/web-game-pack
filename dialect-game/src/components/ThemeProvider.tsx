/**
 * ThemeProvider - Composant pour gérer les thèmes et le mode sombre
 * Utilise React Context pour partager l'état du thème dans toute l'application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeUtils, themes } from '../styles/theme';

// Types pour le contexte de thème
interface ThemeContextType {
  currentTheme: string;
  isDarkMode: boolean;
  setTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  themeClasses: ReturnType<typeof themeUtils.getThemeClasses>;
  availableThemes: typeof themes;
}

// Création du contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Props du ThemeProvider
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
}

// Composant ThemeProvider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  const [currentTheme, setCurrentTheme] = useState(
    initialTheme || themeUtils.getSavedTheme()
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialisation du thème et du mode sombre
  useEffect(() => {
    // Appliquer le thème sauvegardé
    themeUtils.applyTheme(currentTheme);
    
    // Initialiser le mode sombre
    themeUtils.initializeDarkMode();
    
    // Vérifier l'état initial du mode sombre
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedDarkMode = localStorage.getItem('dialect-game-dark-mode');
      if (savedDarkMode === null) {
        // Si aucune préférence sauvegardée, suivre la préférence système
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setIsDarkMode(true);
        } else {
          document.documentElement.classList.remove('dark');
          setIsDarkMode(false);
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [currentTheme]);

  // Fonction pour changer de thème
  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      themeUtils.applyTheme(themeName);
    } else {
      console.warn(`Theme "${themeName}" not found. Available themes:`, Object.keys(themes));
    }
  };

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    themeUtils.toggleDarkMode();
    setIsDarkMode(!isDarkMode);
  };

  // Obtenir les classes CSS du thème actuel
  const themeClasses = themeUtils.getThemeClasses(currentTheme);

  // Valeur du contexte
  const contextValue: ThemeContextType = {
    currentTheme,
    isDarkMode,
    setTheme,
    toggleDarkMode,
    themeClasses,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Composant d'utilité pour afficher le sélecteur de thème
export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <select
      value={currentTheme}
      onChange={(e) => setTheme(e.target.value)}
      className={`form-input ${className}`}
      aria-label="Sélectionner un thème"
    >
      {Object.entries(availableThemes).map(([key, theme]) => (
        <option key={key} value={key}>
          {theme.name}
        </option>
      ))}
    </select>
  );
};

// Composant pour basculer le mode sombre
export const DarkModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`btn btn-ghost ${className}`}
      aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeProvider;
