/**
 * Service de customisation avancée
 * Task 15: Customisation Avancée - Phase 3
 */

import {
  ThemeType,
  ColorCategory,
  SoundType,
  AdaptiveDifficultyMode,
  LearningMode,
  type CustomTheme,
  type ThemeColors,
  type AudioConfiguration,
  type CustomSound,
  type AdaptiveDifficultyConfig,
  type LearningPreferences,
  type ExportableConfiguration,
  type ThemeEditor,
  type CustomizationState,
  CUSTOMIZATION_CONSTANTS
} from '../../types/customization';

class CustomizationService {
  private currentTheme: CustomTheme | null = null;
  private audioConfig: AudioConfiguration | null = null;
  private adaptiveConfig: AdaptiveDifficultyConfig | null = null;
  private userPreferences: LearningPreferences | null = null;
  private themeEditor: ThemeEditor | null = null;
  private customThemes: Map<string, CustomTheme> = new Map();
  private customSounds: Map<string, CustomSound> = new Map();

  constructor() {
    this.initializeService();
  }

  // === INITIALISATION ===

  private initializeService(): void {
    this.loadFromStorage();
    this.initializeDefaultThemes();
    this.initializeDefaultAudio();
    this.initializeDefaultAdaptive();
    this.initializeDefaultPreferences();
  }

  private loadFromStorage(): void {
    try {
      // Charger le thème actuel
      const storedTheme = localStorage.getItem(CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.CURRENT_THEME);
      if (storedTheme) {
        this.currentTheme = JSON.parse(storedTheme);
      }

      // Charger les thèmes personnalisés
      const storedCustomThemes = localStorage.getItem(CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.CUSTOM_THEMES);
      if (storedCustomThemes) {
        const themes = JSON.parse(storedCustomThemes);
        themes.forEach((theme: CustomTheme) => {
          this.customThemes.set(theme.id, theme);
        });
      }

      // Charger la configuration audio
      const storedAudio = localStorage.getItem(CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.AUDIO_CONFIG);
      if (storedAudio) {
        this.audioConfig = JSON.parse(storedAudio);
      }

      // Charger la configuration adaptive
      const storedAdaptive = localStorage.getItem(CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.ADAPTIVE_CONFIG);
      if (storedAdaptive) {
        this.adaptiveConfig = JSON.parse(storedAdaptive);
      }

      // Charger les préférences utilisateur
      const storedPreferences = localStorage.getItem(CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES);
      if (storedPreferences) {
        this.userPreferences = JSON.parse(storedPreferences);
      }
    } catch (error) {
      console.error('Erreur chargement customisation:', error);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentTheme) {
        localStorage.setItem(
          CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.CURRENT_THEME,
          JSON.stringify(this.currentTheme)
        );
      }

      if (this.customThemes.size > 0) {
        const themes = Array.from(this.customThemes.values());
        localStorage.setItem(
          CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.CUSTOM_THEMES,
          JSON.stringify(themes)
        );
      }

      if (this.audioConfig) {
        localStorage.setItem(
          CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.AUDIO_CONFIG,
          JSON.stringify(this.audioConfig)
        );
      }

      if (this.adaptiveConfig) {
        localStorage.setItem(
          CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.ADAPTIVE_CONFIG,
          JSON.stringify(this.adaptiveConfig)
        );
      }

      if (this.userPreferences) {
        localStorage.setItem(
          CUSTOMIZATION_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES,
          JSON.stringify(this.userPreferences)
        );
      }
    } catch (error) {
      console.error('Erreur sauvegarde customisation:', error);
    }
  }

  // === GESTION DES THÈMES ===

  /**
   * Initialise les thèmes par défaut
   */
  private initializeDefaultThemes(): void {
    const defaultThemes = [
      this.createLightTheme(),
      this.createDarkTheme(),
      this.createHighContrastTheme(),
      this.createSepiaTheme()
    ];

    defaultThemes.forEach(theme => {
      this.customThemes.set(theme.id, theme);
    });

    // Définir le thème par défaut si aucun n'est défini
    if (!this.currentTheme) {
      this.currentTheme = defaultThemes[0];
    }
  }

  private createLightTheme(): CustomTheme {
    return {
      id: 'light',
      name: 'Thème Clair',
      description: 'Thème clair classique avec contrastes élevés',
      type: ThemeType.LIGHT,
      colors: this.createLightColors(),
      typography: this.createDefaultTypography(),
      spacing: this.createDefaultSpacing(),
      borders: this.createDefaultBorders(),
      shadows: this.createDefaultShadows(),
      animations: this.createDefaultAnimations(),
      author: 'DialectGame',
      version: '1.0',
      tags: ['light', 'classic', 'accessible'],
      isBuiltIn: true,
      isShared: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      minAppVersion: '1.0.0',
      supportedFeatures: ['all']
    };
  }

  private createDarkTheme(): CustomTheme {
    return {
      id: 'dark',
      name: 'Thème Sombre',
      description: 'Thème sombre moderne pour réduire la fatigue oculaire',
      type: ThemeType.DARK,
      colors: this.createDarkColors(),
      typography: this.createDefaultTypography(),
      spacing: this.createDefaultSpacing(),
      borders: this.createDefaultBorders(),
      shadows: this.createDarkShadows(),
      animations: this.createDefaultAnimations(),
      author: 'DialectGame',
      version: '1.0',
      tags: ['dark', 'modern', 'eye-friendly'],
      isBuiltIn: true,
      isShared: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      minAppVersion: '1.0.0',
      supportedFeatures: ['all']
    };
  }

  private createHighContrastTheme(): CustomTheme {
    return {
      id: 'high_contrast',
      name: 'Contraste Élevé',
      description: 'Thème à contraste élevé pour l\'accessibilité',
      type: ThemeType.HIGH_CONTRAST,
      colors: this.createHighContrastColors(),
      typography: this.createAccessibleTypography(),
      spacing: this.createDefaultSpacing(),
      borders: this.createStrongBorders(),
      shadows: this.createMinimalShadows(),
      animations: this.createReducedAnimations(),
      author: 'DialectGame',
      version: '1.0',
      tags: ['accessibility', 'high-contrast', 'wcag'],
      isBuiltIn: true,
      isShared: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      minAppVersion: '1.0.0',
      supportedFeatures: ['accessibility']
    };
  }

  private createSepiaTheme(): CustomTheme {
    return {
      id: 'sepia',
      name: 'Sépia',
      description: 'Thème sépia chaleureux pour une lecture confortable',
      type: ThemeType.SEPIA,
      colors: this.createSepiaColors(),
      typography: this.createDefaultTypography(),
      spacing: this.createDefaultSpacing(),
      borders: this.createDefaultBorders(),
      shadows: this.createWarmShadows(),
      animations: this.createDefaultAnimations(),
      author: 'DialectGame',
      version: '1.0',
      tags: ['sepia', 'warm', 'reading'],
      isBuiltIn: true,
      isShared: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      minAppVersion: '1.0.0',
      supportedFeatures: ['all']
    };
  }

  private createLightColors(): ThemeColors {
    return {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      accent: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843'
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      },
      info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      background: {
        default: '#ffffff',
        paper: '#f8fafc',
        surface: '#f1f5f9',
        elevated: '#e2e8f0'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        disabled: '#94a3b8',
        hint: '#cbd5e1',
        inverse: '#ffffff'
      },
      border: {
        default: '#e2e8f0',
        light: '#f1f5f9',
        strong: '#cbd5e1',
        focus: '#0ea5e9'
      },
      overlay: 'rgba(0, 0, 0, 0.5)',
      divider: '#e2e8f0',
      highlight: '#fef3c7',
      selection: '#bae6fd'
    };
  }

  private createDarkColors(): ThemeColors {
    return {
      primary: {
        50: '#0c4a6e',
        100: '#075985',
        200: '#0369a1',
        300: '#0284c7',
        400: '#0ea5e9',
        500: '#38bdf8',
        600: '#7dd3fc',
        700: '#bae6fd',
        800: '#e0f2fe',
        900: '#f0f9ff'
      },
      secondary: {
        50: '#0f172a',
        100: '#1e293b',
        200: '#334155',
        300: '#475569',
        400: '#64748b',
        500: '#94a3b8',
        600: '#cbd5e1',
        700: '#e2e8f0',
        800: '#f1f5f9',
        900: '#f8fafc'
      },
      accent: {
        50: '#831843',
        100: '#9d174d',
        200: '#be185d',
        300: '#db2777',
        400: '#ec4899',
        500: '#f472b6',
        600: '#f9a8d4',
        700: '#fbcfe8',
        800: '#fce7f3',
        900: '#fdf2f8'
      },
      success: {
        50: '#14532d',
        100: '#166534',
        200: '#15803d',
        300: '#16a34a',
        400: '#22c55e',
        500: '#4ade80',
        600: '#86efac',
        700: '#bbf7d0',
        800: '#dcfce7',
        900: '#f0fdf4'
      },
      warning: {
        50: '#78350f',
        100: '#92400e',
        200: '#b45309',
        300: '#d97706',
        400: '#f59e0b',
        500: '#fbbf24',
        600: '#fcd34d',
        700: '#fde68a',
        800: '#fef3c7',
        900: '#fffbeb'
      },
      error: {
        50: '#7f1d1d',
        100: '#991b1b',
        200: '#b91c1c',
        300: '#dc2626',
        400: '#ef4444',
        500: '#f87171',
        600: '#fca5a5',
        700: '#fecaca',
        800: '#fee2e2',
        900: '#fef2f2'
      },
      info: {
        50: '#0c4a6e',
        100: '#075985',
        200: '#0369a1',
        300: '#0284c7',
        400: '#0ea5e9',
        500: '#38bdf8',
        600: '#7dd3fc',
        700: '#bae6fd',
        800: '#e0f2fe',
        900: '#f0f9ff'
      },
      background: {
        default: '#0f172a',
        paper: '#1e293b',
        surface: '#334155',
        elevated: '#475569'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        disabled: '#64748b',
        hint: '#475569',
        inverse: '#0f172a'
      },
      border: {
        default: '#334155',
        light: '#1e293b',
        strong: '#475569',
        focus: '#38bdf8'
      },
      overlay: 'rgba(0, 0, 0, 0.7)',
      divider: '#334155',
      highlight: '#b45309',
      selection: '#0369a1'
    };
  }

  private createHighContrastColors(): ThemeColors {
    return {
      primary: {
        50: '#000000',
        100: '#000000',
        200: '#000000',
        300: '#000000',
        400: '#000000',
        500: '#000000',
        600: '#000000',
        700: '#000000',
        800: '#000000',
        900: '#000000'
      },
      secondary: {
        50: '#ffffff',
        100: '#ffffff',
        200: '#ffffff',
        300: '#ffffff',
        400: '#ffffff',
        500: '#ffffff',
        600: '#ffffff',
        700: '#ffffff',
        800: '#ffffff',
        900: '#ffffff'
      },
      accent: {
        50: '#ff0000',
        100: '#ff0000',
        200: '#ff0000',
        300: '#ff0000',
        400: '#ff0000',
        500: '#ff0000',
        600: '#ff0000',
        700: '#ff0000',
        800: '#ff0000',
        900: '#ff0000'
      },
      success: {
        50: '#00ff00',
        100: '#00ff00',
        200: '#00ff00',
        300: '#00ff00',
        400: '#00ff00',
        500: '#00ff00',
        600: '#00ff00',
        700: '#00ff00',
        800: '#00ff00',
        900: '#00ff00'
      },
      warning: {
        50: '#ffff00',
        100: '#ffff00',
        200: '#ffff00',
        300: '#ffff00',
        400: '#ffff00',
        500: '#ffff00',
        600: '#ffff00',
        700: '#ffff00',
        800: '#ffff00',
        900: '#ffff00'
      },
      error: {
        50: '#ff0000',
        100: '#ff0000',
        200: '#ff0000',
        300: '#ff0000',
        400: '#ff0000',
        500: '#ff0000',
        600: '#ff0000',
        700: '#ff0000',
        800: '#ff0000',
        900: '#ff0000'
      },
      info: {
        50: '#0000ff',
        100: '#0000ff',
        200: '#0000ff',
        300: '#0000ff',
        400: '#0000ff',
        500: '#0000ff',
        600: '#0000ff',
        700: '#0000ff',
        800: '#0000ff',
        900: '#0000ff'
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
        surface: '#ffffff',
        elevated: '#ffffff'
      },
      text: {
        primary: '#000000',
        secondary: '#000000',
        disabled: '#808080',
        hint: '#808080',
        inverse: '#ffffff'
      },
      border: {
        default: '#000000',
        light: '#000000',
        strong: '#000000',
        focus: '#ff0000'
      },
      overlay: 'rgba(0, 0, 0, 0.9)',
      divider: '#000000',
      highlight: '#ffff00',
      selection: '#0000ff'
    };
  }

  private createSepiaColors(): ThemeColors {
    return {
      primary: {
        50: '#fdf6e3',
        100: '#f7e8c2',
        200: '#f0d49e',
        300: '#e8bf7a',
        400: '#e0ab60',
        500: '#d89746',
        600: '#c4873f',
        700: '#ad7336',
        800: '#96602d',
        900: '#704820'
      },
      secondary: {
        50: '#fdf8f3',
        100: '#f9efe3',
        200: '#f4e4ce',
        300: '#edd8b8',
        400: '#e5cca6',
        500: '#dcc094',
        600: '#c8a884',
        700: '#b08f73',
        800: '#977663',
        900: '#7a5d4c'
      },
      accent: {
        50: '#f8e8d0',
        100: '#eecfa1',
        200: '#e3b472',
        300: '#d89946',
        400: '#cd7f1d',
        500: '#b86d0a',
        600: '#a05c09',
        700: '#884c08',
        800: '#703c07',
        900: '#582e05'
      },
      success: {
        50: '#f0f4e8',
        100: '#dde3c8',
        200: '#c9d2a6',
        300: '#b4c184',
        400: '#a3b36c',
        500: '#92a554',
        600: '#7e9749',
        700: '#67843d',
        800: '#507031',
        900: '#2d5820'
      },
      warning: {
        50: '#fdf2e9',
        100: '#f9dec7',
        200: '#f4c9a2',
        300: '#efb37d',
        400: '#eba262',
        500: '#e79147',
        600: '#d17f3e',
        700: '#b66a34',
        800: '#9b552a',
        900: '#743717'
      },
      error: {
        50: '#faeee8',
        100: '#f2d3c5',
        200: '#e8b5a0',
        300: '#de977b',
        400: '#d68161',
        500: '#ce6b47',
        600: '#b85e3e',
        700: '#9e4e33',
        800: '#843e28',
        900: '#5e2715'
      },
      info: {
        50: '#f0f6f7',
        100: '#dce8ea',
        200: '#c6dadd',
        300: '#b0ccd0',
        400: '#9fc1c6',
        500: '#8eb6bc',
        600: '#7ba5ab',
        700: '#659095',
        800: '#4f7c80',
        900: '#2b5f64'
      },
      background: {
        default: '#fdf6e3',
        paper: '#f7e8c2',
        surface: '#f0d49e',
        elevated: '#e8bf7a'
      },
      text: {
        primary: '#2d2a1f',
        secondary: '#5d5b4f',
        disabled: '#8e8c7f',
        hint: '#b8b6a9',
        inverse: '#fdf6e3'
      },
      border: {
        default: '#dcc094',
        light: '#e5cca6',
        strong: '#c8a884',
        focus: '#d89746'
      },
      overlay: 'rgba(45, 42, 31, 0.5)',
      divider: '#dcc094',
      highlight: '#f4c9a2',
      selection: '#e8bf7a'
    };
  }

  private createDefaultTypography(): any {
    return {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'JetBrains Mono, Consolas, monospace',
        display: 'Inter, system-ui, sans-serif'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      }
    };
  }

  private createAccessibleTypography(): any {
    const defaultTypo = this.createDefaultTypography();
    return {
      ...defaultTypo,
      fontSize: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem'
      },
      lineHeight: {
        none: 1.2,
        tight: 1.4,
        snug: 1.5,
        normal: 1.6,
        relaxed: 1.8,
        loose: 2.2
      }
    };
  }

  private createDefaultSpacing(): any {
    return {
      0: '0px',
      px: '1px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    };
  }

  private createDefaultBorders(): any {
    return {
      width: {
        0: '0px',
        DEFAULT: '1px',
        2: '2px',
        4: '4px',
        8: '8px'
      },
      radius: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
        double: 'double'
      }
    };
  }

  private createStrongBorders(): any {
    const defaultBorders = this.createDefaultBorders();
    return {
      ...defaultBorders,
      width: {
        0: '0px',
        DEFAULT: '2px',
        2: '3px',
        4: '5px',
        8: '10px'
      }
    };
  }

  private createDefaultShadows(): any {
    return {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: '0 0 #0000',
      colored: {
        primary: '0 4px 14px 0 rgb(14 165 233 / 0.39)',
        secondary: '0 4px 14px 0 rgb(100 116 139 / 0.39)',
        success: '0 4px 14px 0 rgb(34 197 94 / 0.39)',
        warning: '0 4px 14px 0 rgb(245 158 11 / 0.39)',
        error: '0 4px 14px 0 rgb(239 68 68 / 0.39)'
      }
    };
  }

  private createDarkShadows(): any {
    return {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
      none: '0 0 #0000',
      colored: {
        primary: '0 4px 14px 0 rgb(56 189 248 / 0.5)',
        secondary: '0 4px 14px 0 rgb(148 163 184 / 0.5)',
        success: '0 4px 14px 0 rgb(74 222 128 / 0.5)',
        warning: '0 4px 14px 0 rgb(251 191 36 / 0.5)',
        error: '0 4px 14px 0 rgb(248 113 113 / 0.5)'
      }
    };
  }

  private createMinimalShadows(): any {
    return {
      sm: 'none',
      DEFAULT: '0 2px 4px 0 rgb(0 0 0 / 0.8)',
      md: '0 4px 8px 0 rgb(0 0 0 / 0.8)',
      lg: '0 8px 16px 0 rgb(0 0 0 / 0.8)',
      xl: '0 12px 24px 0 rgb(0 0 0 / 0.8)',
      '2xl': '0 16px 32px 0 rgb(0 0 0 / 0.8)',
      inner: 'none',
      none: 'none',
      colored: {
        primary: 'none',
        secondary: 'none',
        success: 'none',
        warning: 'none',
        error: 'none'
      }
    };
  }

  private createWarmShadows(): any {
    return {
      sm: '0 1px 2px 0 rgb(112 72 32 / 0.2)',
      DEFAULT: '0 1px 3px 0 rgb(112 72 32 / 0.3), 0 1px 2px -1px rgb(112 72 32 / 0.3)',
      md: '0 4px 6px -1px rgb(112 72 32 / 0.3), 0 2px 4px -2px rgb(112 72 32 / 0.3)',
      lg: '0 10px 15px -3px rgb(112 72 32 / 0.3), 0 4px 6px -4px rgb(112 72 32 / 0.3)',
      xl: '0 20px 25px -5px rgb(112 72 32 / 0.3), 0 8px 10px -6px rgb(112 72 32 / 0.3)',
      '2xl': '0 25px 50px -12px rgb(112 72 32 / 0.4)',
      inner: 'inset 0 2px 4px 0 rgb(112 72 32 / 0.2)',
      none: '0 0 #0000',
      colored: {
        primary: '0 4px 14px 0 rgb(216 151 70 / 0.4)',
        secondary: '0 4px 14px 0 rgb(200 168 132 / 0.4)',
        success: '0 4px 14px 0 rgb(146 165 84 / 0.4)',
        warning: '0 4px 14px 0 rgb(231 145 71 / 0.4)',
        error: '0 4px 14px 0 rgb(206 107 71 / 0.4)'
      }
    };
  }

  private createDefaultAnimations(): any {
    return {
      duration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      },
      timing: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transition: {
        none: 'none',
        all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        DEFAULT: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
        }
      }
    };
  }

  private createReducedAnimations(): any {
    const defaultAnimations = this.createDefaultAnimations();
    return {
      ...defaultAnimations,
      duration: {
        75: '0ms',
        100: '0ms',
        150: '50ms',
        200: '50ms',
        300: '100ms',
        500: '200ms',
        700: '300ms',
        1000: '500ms'
      },
      transition: {
        none: 'none',
        all: 'all 50ms linear',
        DEFAULT: 'color, background-color, border-color 50ms linear',
        colors: 'color, background-color, border-color 50ms linear',
        opacity: 'opacity 50ms linear',
        shadow: 'none',
        transform: 'none'
      }
    };
  }

  /**
   * Applique un thème
   */
  async setTheme(themeId: string): Promise<void> {
    const theme = this.customThemes.get(themeId);
    if (!theme) {
      throw new Error(`Thème introuvable: ${themeId}`);
    }

    this.currentTheme = theme;
    this.applyThemeToDOM(theme);
    this.saveToStorage();
  }

  private applyThemeToDOM(theme: CustomTheme): void {
    const root = document.documentElement;
    
    // Appliquer les couleurs
    Object.entries(theme.colors.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
    
    Object.entries(theme.colors.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });

    // Appliquer les couleurs de fond
    Object.entries(theme.colors.background).forEach(([key, color]) => {
      root.style.setProperty(`--color-background-${key}`, color);
    });

    // Appliquer les couleurs de texte
    Object.entries(theme.colors.text).forEach(([key, color]) => {
      root.style.setProperty(`--color-text-${key}`, color);
    });

    // Appliquer la typographie
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      root.style.setProperty(`--font-size-${size}`, value);
    });

    // Appliquer les bordures
    Object.entries(theme.borders.radius).forEach(([size, value]) => {
      root.style.setProperty(`--border-radius-${size}`, value);
    });

    // Appliquer les ombres
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);

    // Marquer le thème actuel
    root.setAttribute('data-theme', theme.id);
  }

  /**
   * Crée un nouveau thème personnalisé
   */
  async createCustomTheme(
    name: string,
    baseThemeId: string = 'light',
    customizations: Partial<CustomTheme> = {}
  ): Promise<CustomTheme> {
    const baseTheme = this.customThemes.get(baseThemeId);
    if (!baseTheme) {
      throw new Error(`Thème de base introuvable: ${baseThemeId}`);
    }

    const newTheme: CustomTheme = {
      ...baseTheme,
      id: `custom_${Date.now()}`,
      name,
      type: ThemeType.CUSTOM,
      author: 'User',
      isBuiltIn: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...customizations
    };

    this.customThemes.set(newTheme.id, newTheme);
    this.saveToStorage();
    
    return newTheme;
  }

  // === GESTION AUDIO ===

  /**
   * Initialise la configuration audio par défaut
   */
  private initializeDefaultAudio(): void {
    if (!this.audioConfig) {
      this.audioConfig = {
        id: 'default_audio',
        name: 'Configuration Audio Standard',
        masterVolume: 0.7,
        volumes: this.createDefaultVolumes(),
        customSounds: this.createEmptyCustomSounds(),
        backgroundMusic: {
          enabled: true,
          volume: 0.3,
          tracks: [],
          playlistMode: 'adaptive',
          fadeTransitions: true,
          adaptiveVolume: true
        },
        spatialAudio: false,
        reverb: {
          enabled: false,
          type: 'room',
          wetness: 0.2,
          roomSize: 0.5,
          decay: 0.3
        },
        equalizer: {
          enabled: false,
          preset: 'flat',
          bands: []
        },
        visualIndicators: false,
        hapticFeedback: true,
        author: 'DialectGame',
        tags: ['default'],
        isBuiltIn: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
  }

  private createDefaultVolumes(): Record<SoundType, number> {
    return {
      [SoundType.CORRECT_ANSWER]: 0.8,
      [SoundType.WRONG_ANSWER]: 0.6,
      [SoundType.LEVEL_UP]: 0.9,
      [SoundType.ACHIEVEMENT]: 0.9,
      [SoundType.BUTTON_CLICK]: 0.5,
      [SoundType.NOTIFICATION]: 0.7,
      [SoundType.POWER_UP]: 0.8,
      [SoundType.GAME_START]: 0.8,
      [SoundType.GAME_END]: 0.8,
      [SoundType.BACKGROUND_MUSIC]: 0.3,
      [SoundType.AMBIENT]: 0.4,
      [SoundType.TYPING]: 0.3
    };
  }

  private createEmptyCustomSounds(): Record<SoundType, CustomSound> {
    const emptySound: CustomSound = {
      id: 'default',
      name: 'Default Sound',
      type: SoundType.BUTTON_CLICK,
      url: '',
      format: 'mp3',
      duration: 0,
      size: 0,
      volume: 1,
      pitch: 1,
      speed: 1,
      loop: false,
      fadeIn: 0,
      fadeOut: 0,
      delay: 0,
      triggers: [],
      conditions: [],
      tags: [],
      author: 'system',
      license: 'default',
    };

    return {
      [SoundType.CORRECT_ANSWER]: { ...emptySound, type: SoundType.CORRECT_ANSWER, id: 'correct_answer' },
      [SoundType.WRONG_ANSWER]: { ...emptySound, type: SoundType.WRONG_ANSWER, id: 'wrong_answer' },
      [SoundType.LEVEL_UP]: { ...emptySound, type: SoundType.LEVEL_UP, id: 'level_up' },
      [SoundType.ACHIEVEMENT]: { ...emptySound, type: SoundType.ACHIEVEMENT, id: 'achievement' },
      [SoundType.BUTTON_CLICK]: { ...emptySound, type: SoundType.BUTTON_CLICK, id: 'button_click' },
      [SoundType.NOTIFICATION]: { ...emptySound, type: SoundType.NOTIFICATION, id: 'notification' },
      [SoundType.POWER_UP]: { ...emptySound, type: SoundType.POWER_UP, id: 'power_up' },
      [SoundType.GAME_START]: { ...emptySound, type: SoundType.GAME_START, id: 'game_start' },
      [SoundType.GAME_END]: { ...emptySound, type: SoundType.GAME_END, id: 'game_end' },
      [SoundType.BACKGROUND_MUSIC]: { ...emptySound, type: SoundType.BACKGROUND_MUSIC, id: 'background_music' },
      [SoundType.AMBIENT]: { ...emptySound, type: SoundType.AMBIENT, id: 'ambient' },
      [SoundType.TYPING]: { ...emptySound, type: SoundType.TYPING, id: 'typing' }
    };
  }

  /**
   * Met à jour le volume d'un type de son
   */
  updateSoundVolume(soundType: SoundType, volume: number): void {
    if (!this.audioConfig) return;
    
    this.audioConfig.volumes[soundType] = Math.max(0, Math.min(1, volume));
    this.saveToStorage();
  }

  /**
   * Met à jour le volume principal
   */
  updateMasterVolume(volume: number): void {
    if (!this.audioConfig) return;
    
    this.audioConfig.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveToStorage();
  }

  // === DIFFICULTÉ ADAPTIVE ===

  /**
   * Initialise la configuration de difficulté adaptive
   */
  private initializeDefaultAdaptive(): void {
    if (!this.adaptiveConfig) {
      this.adaptiveConfig = {
        id: 'default_adaptive',
        name: 'Difficulté Adaptive Standard',
        mode: AdaptiveDifficultyMode.PERFORMANCE_BASED,
        sensitivity: 0.5,
        minDifficulty: 0.1,
        maxDifficulty: 0.9,
        factors: {
          accuracy: 0.4,
          speed: 0.3,
          streak: 0.2,
          confidence: 0.05,
          engagement: 0.03,
          fatigue: 0.02
        },
        adjustmentInterval: CUSTOMIZATION_CONSTANTS.DEFAULT_ADJUSTMENT_INTERVAL,
        evaluationPeriod: CUSTOMIZATION_CONSTANTS.DEFAULT_EVALUATION_PERIOD,
        performanceThresholds: {
          accuracyTooLow: 0.6,
          accuracyTooHigh: 0.9,
          speedTooSlow: 15,
          speedTooFast: 3,
          streakTarget: 5,
          streakTolerance: 2,
          minEngagement: 0.5,
          optimalEngagement: 0.8
        },
        adaptationRules: this.createDefaultAdaptationRules(),
        showDifficultyChanges: true,
        explanations: true,
        author: 'DialectGame',
        isBuiltIn: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
  }

  private createDefaultAdaptationRules() {
    return [
      {
        id: 'accuracy_too_low',
        name: 'Précision trop faible',
        condition: {
          metric: 'accuracy' as const,
          operator: 'less_than' as const,
          value: 0.6,
          duration: 5
        },
        action: {
          type: 'adjust_difficulty' as const,
          magnitude: -0.1,
          message: 'Difficulté réduite pour améliorer votre réussite'
        },
        priority: 1,
        enabled: true
      },
      {
        id: 'accuracy_too_high',
        name: 'Précision trop élevée',
        condition: {
          metric: 'accuracy' as const,
          operator: 'greater_than' as const,
          value: 0.9,
          duration: 5
        },
        action: {
          type: 'adjust_difficulty' as const,
          magnitude: 0.1,
          message: 'Difficulté augmentée pour maintenir le défi'
        },
        priority: 2,
        enabled: true
      }
    ];
  }

  /**
   * Calcule l'ajustement de difficulté basé sur la performance
   */
  calculateDifficultyAdjustment(performance: any): number {
    if (!this.adaptiveConfig || this.adaptiveConfig.mode === AdaptiveDifficultyMode.DISABLED) {
      return 0;
    }

    let adjustment = 0;
    const factors = this.adaptiveConfig.factors;
    const thresholds = this.adaptiveConfig.performanceThresholds;

    // Facteur de précision
    if (performance.accuracy < thresholds.accuracyTooLow) {
      adjustment -= factors.accuracy * this.adaptiveConfig.sensitivity;
    } else if (performance.accuracy > thresholds.accuracyTooHigh) {
      adjustment += factors.accuracy * this.adaptiveConfig.sensitivity;
    }

    // Facteur de vitesse
    if (performance.averageTime > thresholds.speedTooSlow) {
      adjustment -= factors.speed * this.adaptiveConfig.sensitivity;
    } else if (performance.averageTime < thresholds.speedTooFast) {
      adjustment += factors.speed * this.adaptiveConfig.sensitivity;
    }

    // Facteur de série
    const streakDiff = performance.currentStreak - thresholds.streakTarget;
    if (Math.abs(streakDiff) > thresholds.streakTolerance) {
      adjustment += (streakDiff / thresholds.streakTarget) * factors.streak * this.adaptiveConfig.sensitivity;
    }

    // Limiter l'ajustement
    return Math.max(-0.2, Math.min(0.2, adjustment));
  }

  // === PRÉFÉRENCES D'APPRENTISSAGE ===

  /**
   * Initialise les préférences par défaut
   */
  private initializeDefaultPreferences(): void {
    if (!this.userPreferences) {
      this.userPreferences = {
        id: 'default_preferences',
        userId: 'current_user',
        learningStyle: LearningMode.VISUAL,
        preferredPace: 'normal',
        contentTypes: [
          { type: 'vocabulary', weight: 0.8, enabled: true },
          { type: 'grammar', weight: 0.7, enabled: true },
          { type: 'pronunciation', weight: 0.6, enabled: true },
          { type: 'listening', weight: 0.5, enabled: true }
        ],
        difficultyPreference: 'balanced',
        feedbackStyle: 'immediate',
        hintUsage: 'when_stuck',
        sessionLength: 30,
        breakFrequency: 15,
        studyTimes: [],
        competitiveMode: false,
        gamificationLevel: 'balanced',
        achievementNotifications: true,
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          colorBlindness: 'none' as any,
          closedCaptions: false,
          signLanguage: false,
          audioDescriptions: false,
          keyboardNavigation: false,
          voiceControl: false,
          switchControl: false,
          reducedMotion: false,
          simplifiedUI: false,
          extendedTimeouts: false,
          customAccommodations: []
        },
        customSettings: {},
        lastUpdated: Date.now(),
        version: '1.0'
      };
    }
  }

  /**
   * Met à jour les préférences d'apprentissage
   */
  updateLearningPreferences(updates: Partial<LearningPreferences>): void {
    if (!this.userPreferences) {
      this.initializeDefaultPreferences();
    }

    this.userPreferences = {
      ...this.userPreferences!,
      ...updates,
      lastUpdated: Date.now()
    };

    this.saveToStorage();
  }

  // === GETTERS ===

  getCurrentTheme(): CustomTheme | null {
    return this.currentTheme;
  }

  getAvailableThemes(): CustomTheme[] {
    return Array.from(this.customThemes.values());
  }

  getAudioConfiguration(): AudioConfiguration | null {
    return this.audioConfig;
  }

  getAdaptiveConfiguration(): AdaptiveDifficultyConfig | null {
    return this.adaptiveConfig;
  }

  getUserPreferences(): LearningPreferences | null {
    return this.userPreferences;
  }

  getThemeEditor(): ThemeEditor | null {
    return this.themeEditor;
  }

  getCustomizationState(): CustomizationState {
    return {
      currentTheme: this.currentTheme!,
      availableThemes: this.getAvailableThemes(),
      currentAudioConfig: this.audioConfig!,
      availableAudioConfigs: [this.audioConfig!],
      currentAdaptiveConfig: this.adaptiveConfig!,
      availableAdaptiveConfigs: [this.adaptiveConfig!],
      userPreferences: this.userPreferences!,
      themeEditor: this.themeEditor,
      audioEditor: null,
      exportHistory: [],
      importQueue: [],
      cloudSync: false,
      lastSync: 0,
      errors: []
    };
  }

  // === ÉDITEUR DE THÈME ===

  /**
   * Ouvre l'éditeur de thème
   */
  openThemeEditor(themeId?: string): ThemeEditor {
    const baseTheme = themeId 
      ? this.customThemes.get(themeId) || this.currentTheme!
      : this.currentTheme!;

    this.themeEditor = {
      currentTheme: JSON.parse(JSON.stringify(baseTheme)),
      originalTheme: baseTheme,
      hasChanges: false,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      previewMode: false,
      previewElements: [],
      errors: [],
      warnings: [],
      exportFormats: ['json'],
      importSources: ['file', 'url']
    };

    return this.themeEditor;
  }

  /**
   * Met à jour le thème en cours d'édition
   */
  updateThemeInEditor(changes: Partial<CustomTheme>): void {
    if (!this.themeEditor) return;

    // Sauvegarder dans l'historique
    this.themeEditor.history.push({
      id: `snapshot_${Date.now()}`,
      theme: JSON.parse(JSON.stringify(this.themeEditor.currentTheme)),
      timestamp: Date.now()
    });

    // Appliquer les changements
    this.themeEditor.currentTheme = {
      ...this.themeEditor.currentTheme,
      ...changes,
      updatedAt: Date.now()
    };

    this.themeEditor.hasChanges = true;
    this.themeEditor.historyIndex = this.themeEditor.history.length - 1;

    // Appliquer en mode preview si activé
    if (this.themeEditor.previewMode) {
      this.applyThemeToDOM(this.themeEditor.currentTheme);
    }
  }

  /**
   * Sauvegarde le thème édité
   */
  saveThemeFromEditor(): CustomTheme {
    if (!this.themeEditor) {
      throw new Error('Aucun éditeur de thème ouvert');
    }

    const theme = this.themeEditor.currentTheme;
    this.customThemes.set(theme.id, theme);
    this.saveToStorage();

    this.themeEditor.hasChanges = false;
    this.themeEditor.originalTheme = JSON.parse(JSON.stringify(theme));

    return theme;
  }
}

// Instance singleton
export const customizationService = new CustomizationService();
export default customizationService;