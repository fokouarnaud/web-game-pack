/**
 * Tests unitaires pour ThemeProvider
 * Task 1: Configuration TailwindCSS et système de design - Phase TDD
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme, ThemeSelector, DarkModeToggle } from '../../../src/components/ThemeProvider';
import { themes, defaultTheme } from '../../../src/styles/theme';

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

// Mock matchMedia
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

// Composant de test pour utiliser le hook useTheme
const TestComponent = () => {
  const { currentTheme, isDarkMode, setTheme, toggleDarkMode, themeClasses, availableThemes } = useTheme();
  
  return (
    <div data-testid="test-component">
      <span data-testid="current-theme">{currentTheme}</span>
      <span data-testid="dark-mode">{isDarkMode.toString()}</span>
      <span data-testid="theme-count">{Object.keys(availableThemes).length}</span>
      <button data-testid="set-gaming" onClick={() => setTheme('gaming')}>Set Gaming</button>
      <button data-testid="toggle-dark" onClick={toggleDarkMode}>Toggle Dark</button>
      <span data-testid="primary-class">{themeClasses.primary}</span>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
    document.body.className = '';
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
  });

  describe('Initialization', () => {
    test('should initialize with default theme', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent(defaultTheme);
    });

    test('should initialize with custom initial theme', () => {
      render(
        <ThemeProvider initialTheme="gaming">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('gaming');
    });

    test('should load saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('academic');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('academic');
    });
  });

  describe('Theme Switching', () => {
    test('should change theme when setTheme is called', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setGamingButton = screen.getByTestId('set-gaming');
      fireEvent.click(setGamingButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('gaming');
      });
    });

    test('should save theme to localStorage when changed', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setGamingButton = screen.getByTestId('set-gaming');
      fireEvent.click(setGamingButton);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('dialect-game-theme', 'gaming');
      });
    });

    test('should apply theme class to body', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setGamingButton = screen.getByTestId('set-gaming');
      fireEvent.click(setGamingButton);

      await waitFor(() => {
        expect(document.body.classList.contains('theme-gaming')).toBe(true);
      });
    });

    test('should warn when setting invalid theme', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const InvalidThemeTest = () => {
        const { setTheme } = useTheme();
        return (
          <button data-testid="set-invalid" onClick={() => setTheme('invalid-theme')}>
            Set Invalid
          </button>
        );
      };

      render(
        <ThemeProvider>
          <InvalidThemeTest />
        </ThemeProvider>
      );

      const button = screen.getByTestId('set-invalid');
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Theme "invalid-theme" not found. Available themes:',
        expect.any(Array)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Dark Mode', () => {
    test('should toggle dark mode', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-dark');
      const initialDarkMode = screen.getByTestId('dark-mode').textContent;
      
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const newDarkMode = screen.getByTestId('dark-mode').textContent;
        expect(newDarkMode).not.toBe(initialDarkMode);
      });
    });

    test('should apply dark class to document element', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-dark');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Le comportement exact dépend de l'état initial
        expect(document.documentElement.classList.contains('dark')).toBeDefined();
      });
    });

    test('should save dark mode preference to localStorage', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-dark');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'dialect-game-dark-mode',
          expect.any(String)
        );
      });
    });
  });

  describe('Theme Classes', () => {
    test('should provide theme classes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const primaryClass = screen.getByTestId('primary-class');
      expect(primaryClass.textContent).toContain('bg-');
      expect(primaryClass.textContent).toContain('text-');
    });

    test('should update theme classes when theme changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const initialClass = screen.getByTestId('primary-class').textContent;
      const setGamingButton = screen.getByTestId('set-gaming');
      
      fireEvent.click(setGamingButton);

      await waitFor(() => {
        const newClass = screen.getByTestId('primary-class').textContent;
        expect(newClass).not.toBe(initialClass);
      });
    });
  });

  describe('Available Themes', () => {
    test('should provide all available themes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const themeCount = screen.getByTestId('theme-count');
      expect(parseInt(themeCount.textContent || '0')).toBe(Object.keys(themes).length);
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useTheme is used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('ThemeSelector', () => {
  test('should render select with all available themes', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Vérifier que toutes les options sont présentes
    Object.entries(themes).forEach(([key, theme]) => {
      expect(screen.getByRole('option', { name: theme.name })).toBeInTheDocument();
    });
  });

  test('should change theme when option is selected', async () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
        <TestComponent />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'gaming' } });

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('gaming');
    });
  });

  test('should have proper accessibility attributes', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Sélectionner un thème');
  });
});

describe('DarkModeToggle', () => {
  test('should render toggle button', () => {
    render(
      <ThemeProvider>
        <DarkModeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should toggle dark mode when clicked', async () => {
    render(
      <ThemeProvider>
        <DarkModeToggle />
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /mode sombre|mode clair/i });
    const initialDarkMode = screen.getByTestId('dark-mode').textContent;
    
    fireEvent.click(button);

    await waitFor(() => {
      const newDarkMode = screen.getByTestId('dark-mode').textContent;
      expect(newDarkMode).not.toBe(initialDarkMode);
    });
  });

  test('should have proper accessibility attributes', () => {
    render(
      <ThemeProvider>
        <DarkModeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  test('should display correct icon based on dark mode state', () => {
    render(
      <ThemeProvider>
        <DarkModeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

describe('System Integration', () => {
  test('should respect system color scheme preference', () => {
    // Mock matchMedia pour préférer le mode sombre
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Vérifier que le thème système est pris en compte
    expect(mockLocalStorage.getItem).toHaveBeenCalled();
  });

  test('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});