/**
 * Configuration centralisée des thèmes pour le jeu de dialecte
 * Ce fichier permet de modifier facilement les couleurs, fonts et autres propriétés visuelles
 * 
 * USAGE:
 * - Pour changer le thème principal: modifier defaultTheme
 * - Pour ajouter un nouveau thème: ajouter dans themes object
 * - Pour modifier les couleurs: éditer les palettes dans chaque thème
 */

// Types pour la configuration des thèmes
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  effects: {
    glassmorphism: boolean;
    animations: boolean;
    shadows: 'soft' | 'medium' | 'strong';
    borderRadius: 'md' | 'lg' | 'xl' | '2xl';
    glow?: boolean;
  };
}

// Thèmes disponibles
export const themes: Record<string, ThemeConfig> = {
  // Thèmes de base requis par les tests
  light: {
    name: 'Light',
    colors: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'sky',
      neutral: 'gray',
      success: 'green',
      warning: 'yellow',
      error: 'red',
    },
    fonts: {
      display: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    effects: {
      glassmorphism: false,
      animations: true,
      shadows: 'soft',
      borderRadius: 'lg',
    },
  },
  
  dark: {
    name: 'Dark',
    colors: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'sky',
      neutral: 'gray',
      success: 'green',
      warning: 'yellow',
      error: 'red',
    },
    fonts: {
      display: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    effects: {
      glassmorphism: false,
      animations: true,
      shadows: 'soft',
      borderRadius: 'lg',
    },
  },

  // Thème par défaut - Moderne et professionnel
  modern: {
    name: 'Modern',
    colors: {
      primary: 'blue',
      secondary: 'purple',
      accent: 'cyan',
      neutral: 'slate',
      success: 'green',
      warning: 'yellow',
      error: 'red',
    },
    fonts: {
      display: 'Poppins',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    effects: {
      glassmorphism: true,
      animations: true,
      shadows: 'medium',
      borderRadius: 'lg',
    },
  },
  
  // Thème sombre gaming
  gaming: {
    name: 'Gaming',
    colors: {
      primary: 'emerald',
      secondary: 'teal',
      accent: 'cyan',
      neutral: 'zinc',
      success: 'green',
      warning: 'orange',
      error: 'red',
    },
    fonts: {
      display: 'Orbitron',
      body: 'Roboto',
      mono: 'Fira Code',
    },
    effects: {
      glassmorphism: false,
      animations: true,
      shadows: 'strong',
      borderRadius: 'xl',
      glow: true,
    },
  },
  
  // Thème académique
  academic: {
    name: 'Academic',
    colors: {
      primary: 'indigo',
      secondary: 'violet',
      accent: 'sky',
      neutral: 'gray',
      success: 'green',
      warning: 'amber',
      error: 'red',
    },
    fonts: {
      display: 'Playfair Display',
      body: 'Source Sans Pro',
      mono: 'Source Code Pro',
    },
    effects: {
      glassmorphism: false,
      animations: false,
      shadows: 'soft',
      borderRadius: 'md',
    },
  },
  
  // Thème coloré et ludique
  playful: {
    name: 'Playful',
    colors: {
      primary: 'pink',
      secondary: 'purple',
      accent: 'yellow',
      neutral: 'slate',
      success: 'lime',
      warning: 'orange',
      error: 'rose',
    },
    fonts: {
      display: 'Nunito',
      body: 'Nunito',
      mono: 'JetBrains Mono',
    },
    effects: {
      glassmorphism: true,
      animations: true,
      shadows: 'soft',
      borderRadius: '2xl',
    },
  },
};

// Thème par défaut
export const defaultTheme = 'modern';

// Types pour les classes CSS
export interface ThemeClasses {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderPrimary: string;
  borderSecondary: string;
  btnPrimary: string;
  btnSecondary: string;
  btnOutline: string;
  success: string;
  warning: string;
  error: string;
  glass: string;
  shadow: string;
  rounded: string;
  glow: string;
}

// Utilitaires pour la gestion des thèmes
export const themeUtils = {
  /**
   * Obtient la configuration du thème actuel
   */
  getTheme(themeName: string = defaultTheme): ThemeConfig {
    return themes[themeName] || themes[defaultTheme];
  },
  
  /**
   * Génère les classes CSS pour un thème donné
   */
  getThemeClasses(themeName: string = defaultTheme): ThemeClasses {
    const theme = this.getTheme(themeName);
    
    return {
      // Classes principales
      primary: `bg-${theme.colors.primary}-500 text-white`,
      primaryLight: `bg-${theme.colors.primary}-100 text-${theme.colors.primary}-900`,
      secondary: `bg-${theme.colors.secondary}-500 text-white`,
      accent: `bg-${theme.colors.accent}-500 text-white`,
      
      // Classes pour texte
      textPrimary: `text-${theme.colors.primary}-600 dark:text-${theme.colors.primary}-400`,
      textSecondary: `text-${theme.colors.secondary}-600 dark:text-${theme.colors.secondary}-400`,
      textMuted: `text-${theme.colors.neutral}-500 dark:text-${theme.colors.neutral}-400`,
      
      // Classes pour bordures
      borderPrimary: `border-${theme.colors.primary}-200 dark:border-${theme.colors.primary}-800`,
      borderSecondary: `border-${theme.colors.secondary}-200 dark:border-${theme.colors.secondary}-800`,
      
      // Classes pour boutons
      btnPrimary: `bg-${theme.colors.primary}-500 hover:bg-${theme.colors.primary}-600 text-white`,
      btnSecondary: `bg-${theme.colors.secondary}-500 hover:bg-${theme.colors.secondary}-600 text-white`,
      btnOutline: `border-2 border-${theme.colors.primary}-500 text-${theme.colors.primary}-500 hover:bg-${theme.colors.primary}-500 hover:text-white`,
      
      // Classes pour états
      success: `bg-${theme.colors.success}-500 text-white`,
      warning: `bg-${theme.colors.warning}-500 text-white`,
      error: `bg-${theme.colors.error}-500 text-white`,
      
      // Classes pour effets
      glass: theme.effects.glassmorphism ? 'glass' : '',
      shadow: `shadow-${theme.effects.shadows}`,
      rounded: `rounded-${theme.effects.borderRadius}`,
      glow: theme.effects.glow ? 'btn-glow' : '',
    };
  },
  
  /**
   * Applique un thème au document
   */
  applyTheme(themeName: string = defaultTheme): void {
    const theme = this.getTheme(themeName);
    const root = document.documentElement;
    
    // Applique les variables CSS personnalisées
    root.style.setProperty('--font-display', theme.fonts.display);
    root.style.setProperty('--font-body', theme.fonts.body);
    root.style.setProperty('--font-mono', theme.fonts.mono);
    
    // Ajoute la classe de thème au body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
    
    // Sauvegarde la préférence utilisateur
    localStorage.setItem('dialect-game-theme', themeName);
  },
  
  /**
   * Obtient le thème sauvegardé ou le thème par défaut
   */
  getSavedTheme(): string {
    return localStorage.getItem('dialect-game-theme') || defaultTheme;
  },
  
  /**
   * Bascule entre mode clair et sombre
   */
  toggleDarkMode(): void {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('dialect-game-dark-mode', 'false');
    } else {
      html.classList.add('dark');
      localStorage.setItem('dialect-game-dark-mode', 'true');
    }
  },
  
  /**
   * Initialise le mode sombre basé sur les préférences utilisateur
   */
  initializeDarkMode(): void {
    const savedDarkMode = localStorage.getItem('dialect-game-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  },
};

// Configuration responsive
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Configuration d'accessibilité
export const accessibility = {
  // Préférences d'animation
  respectReducedMotion: true,
  
  // Préférences de contraste
  highContrastSupport: true,
  
  // Tailles de police
  fontSizeScale: {
    small: 0.875, // 14px
    normal: 1,    // 16px
    large: 1.125, // 18px
    xlarge: 1.25, // 20px
  },
  
  // Navigation clavier
  focusVisibleSupport: true,
};

// Export par défaut avec configuration complète
export default {
  themes,
  defaultTheme,
  themeUtils,
  breakpoints,
  accessibility,
};
