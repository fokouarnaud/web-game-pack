/**
 * Tests unitaires pour les utilitaires de thème
 * Task 1: Configuration TailwindCSS et système de design - Phase TDD
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { themeUtils, themes, defaultTheme } from '../../../src/styles/theme';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock document
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
  },
  body: {
    className: '',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

describe('themeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocument.body.className = '';
  });

  describe('getTheme', () => {
    test('should return default theme when no theme name provided', () => {
      const theme = themeUtils.getTheme();
      expect(theme).toBe(themes[defaultTheme]);
    });

    test('should return specified theme when valid name provided', () => {
      const theme = themeUtils.getTheme('gaming');
      expect(theme).toBe(themes.gaming);
      expect(theme.name).toBe('Gaming');
    });

    test('should return default theme when invalid name provided', () => {
      const theme = themeUtils.getTheme('invalid-theme');
      expect(theme).toBe(themes[defaultTheme]);
    });

    test('should return theme with correct structure', () => {
      const theme = themeUtils.getTheme('modern');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('fonts');
      expect(theme).toHaveProperty('effects');
    });
  });

  describe('getThemeClasses', () => {
    test('should return theme classes object', () => {
      const classes = themeUtils.getThemeClasses();
      expect(classes).toHaveProperty('primary');
      expect(classes).toHaveProperty('secondary');
      expect(classes).toHaveProperty('btnPrimary');
      expect(classes).toHaveProperty('textPrimary');
    });

    test('should generate correct primary classes', () => {
      const classes = themeUtils.getThemeClasses('modern');
      expect(classes.primary).toContain('bg-blue-500');
      expect(classes.primary).toContain('text-white');
    });

    test('should generate different classes for different themes', () => {
      const modernClasses = themeUtils.getThemeClasses('modern');
      const gamingClasses = themeUtils.getThemeClasses('gaming');
      
      expect(modernClasses.primary).not.toBe(gamingClasses.primary);
    });

    test('should include glassmorphism class when enabled', () => {
      const classes = themeUtils.getThemeClasses('modern');
      expect(classes.glass).toBe('glass');
    });

    test('should not include glassmorphism class when disabled', () => {
      const classes = themeUtils.getThemeClasses('academic');
      expect(classes.glass).toBe('');
    });

    test('should include glow effect when enabled', () => {
      const classes = themeUtils.getThemeClasses('gaming');
      expect(classes.glow).toBe('btn-glow');
    });

    test('should generate correct shadow classes', () => {
      const modernClasses = themeUtils.getThemeClasses('modern');
      const academicClasses = themeUtils.getThemeClasses('academic');
      
      expect(modernClasses.shadow).toBe('shadow-medium');
      expect(academicClasses.shadow).toBe('shadow-soft');
    });

    test('should generate correct border radius classes', () => {
      const modernClasses = themeUtils.getThemeClasses('modern');
      const playfulClasses = themeUtils.getThemeClasses('playful');
      
      expect(modernClasses.rounded).toBe('rounded-lg');
      expect(playfulClasses.rounded).toBe('rounded-2xl');
    });
  });

  describe('applyTheme', () => {
    test('should set CSS custom properties', () => {
      themeUtils.applyTheme('modern');
      
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--font-display',
        'Poppins'
      );
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--font-body',
        'Inter'
      );
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--font-mono',
        'JetBrains Mono'
      );
    });

    test('should add theme class to body', () => {
      themeUtils.applyTheme('gaming');
      
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith('theme-gaming');
    });

    test('should save theme to localStorage', () => {
      themeUtils.applyTheme('academic');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dialect-game-theme',
        'academic'
      );
    });

    test('should remove previous theme class', () => {
      mockDocument.body.className = 'some-class theme-old-theme other-class';
      
      themeUtils.applyTheme('modern');
      
      // Vérifier que la classe de thème précédente a été supprimée
      expect(mockDocument.body.className).not.toContain('theme-old-theme');
    });

    test('should use default theme when no theme specified', () => {
      themeUtils.applyTheme();
      
      expect(mockDocument.body.classList.add).toHaveBeenCalledWith(`theme-${defaultTheme}`);
    });
  });

  describe('getSavedTheme', () => {
    test('should return saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('gaming');
      
      const savedTheme = themeUtils.getSavedTheme();
      
      expect(savedTheme).toBe('gaming');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('dialect-game-theme');
    });

    test('should return default theme when no saved theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const savedTheme = themeUtils.getSavedTheme();
      
      expect(savedTheme).toBe(defaultTheme);
    });
  });

  describe('toggleDarkMode', () => {
    test('should add dark class when not present', () => {
      mockDocument.documentElement.classList.contains.mockReturnValue(false);
      
      themeUtils.toggleDarkMode();
      
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dialect-game-dark-mode',
        'true'
      );
    });

    test('should remove dark class when present', () => {
      mockDocument.documentElement.classList.contains.mockReturnValue(true);
      
      themeUtils.toggleDarkMode();
      
      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dialect-game-dark-mode',
        'false'
      );
    });
  });

  describe('initializeDarkMode', () => {
    test('should enable dark mode when saved preference is true', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      
      themeUtils.initializeDarkMode();
      
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    test('should not enable dark mode when saved preference is false', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      
      themeUtils.initializeDarkMode();
      
      expect(mockDocument.documentElement.classList.add).not.toHaveBeenCalledWith('dark');
    });

    test('should follow system preference when no saved preference', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('dark'),
        media: query,
      }));
      
      themeUtils.initializeDarkMode();
      
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    test('should not enable dark mode when system prefers light', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
      }));
      
      themeUtils.initializeDarkMode();
      
      expect(mockDocument.documentElement.classList.add).not.toHaveBeenCalledWith('dark');
    });
  });

  describe('Theme Validation', () => {
    test('should handle all available themes without errors', () => {
      Object.keys(themes).forEach(themeName => {
        expect(() => {
          const theme = themeUtils.getTheme(themeName);
          const classes = themeUtils.getThemeClasses(themeName);
          themeUtils.applyTheme(themeName);
        }).not.toThrow();
      });
    });

    test('should generate valid CSS classes for all themes', () => {
      Object.keys(themes).forEach(themeName => {
        const classes = themeUtils.getThemeClasses(themeName);
        
        // Vérifier que les classes principales sont générées
        expect(classes.primary).toBeTruthy();
        expect(classes.secondary).toBeTruthy();
        expect(classes.btnPrimary).toBeTruthy();
        
        // Vérifier que les classes contiennent des préfixes TailwindCSS valides
        expect(classes.primary).toMatch(/bg-\w+/);
        expect(classes.primary).toMatch(/text-\w+/);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should maintain consistency between theme config and generated classes', () => {
      Object.keys(themes).forEach(themeName => {
        const theme = themeUtils.getTheme(themeName);
        const classes = themeUtils.getThemeClasses(themeName);
        
        // Vérifier que les couleurs du thème sont reflétées dans les classes
        expect(classes.primary).toContain(theme.colors.primary);
        expect(classes.secondary).toContain(theme.colors.secondary);
      });
    });

    test('should properly handle theme switching sequence', () => {
      // Appliquer plusieurs thèmes en séquence
      themeUtils.applyTheme('modern');
      themeUtils.applyTheme('gaming');
      themeUtils.applyTheme('academic');
      
      // Vérifier que le dernier thème est correctement appliqué
      expect(mockDocument.body.classList.add).toHaveBeenLastCalledWith('theme-academic');
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'dialect-game-theme',
        'academic'
      );
    });
  });
});

describe('Theme Configuration Validation', () => {
  test('should have all required themes', () => {
    const requiredThemes = ['modern', 'gaming', 'academic', 'playful'];
    
    requiredThemes.forEach(themeName => {
      expect(themes).toHaveProperty(themeName);
    });
  });

  test('should have consistent theme structure', () => {
    Object.values(themes).forEach(theme => {
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('fonts');
      expect(theme).toHaveProperty('effects');
      
      // Vérifier la structure des couleurs
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
      expect(theme.colors).toHaveProperty('accent');
      expect(theme.colors).toHaveProperty('neutral');
      
      // Vérifier la structure des fonts
      expect(theme.fonts).toHaveProperty('display');
      expect(theme.fonts).toHaveProperty('body');
      expect(theme.fonts).toHaveProperty('mono');
      
      // Vérifier la structure des effets
      expect(theme.effects).toHaveProperty('glassmorphism');
      expect(theme.effects).toHaveProperty('animations');
      expect(theme.effects).toHaveProperty('shadows');
      expect(theme.effects).toHaveProperty('borderRadius');
    });
  });

  test('should have valid default theme', () => {
    expect(themes).toHaveProperty(defaultTheme);
    expect(typeof defaultTheme).toBe('string');
  });
});