/**
 * Tests unitaires pour le composant Button shadcn/ui moderne
 * Task 1.5: Intégration shadcn/ui - Phase TDD
 */

import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../../src/components/ThemeProvider';
import { Button } from '../../../../src/components/ui/button';

// Wrapper pour les tests avec ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const renderWithTheme = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper });

describe('Button shadcn/ui Component', () => {
  describe('Rendering', () => {
    test('should render button with default props', () => {
      renderWithTheme(<Button>Click me</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('bg-primary');
    });

    test('should render button with variants', () => {
      const { rerender } = renderWithTheme(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary');
      
      rerender(<ThemeProvider><Button variant="outline">Outline</Button></ThemeProvider>);
      expect(screen.getByRole('button')).toHaveClass('border');
      
      rerender(<ThemeProvider><Button variant="ghost">Ghost</Button></ThemeProvider>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
    });

    test('should render button with different sizes', () => {
      const { rerender } = renderWithTheme(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<ThemeProvider><Button size="lg">Large</Button></ThemeProvider>);
      expect(screen.getByRole('button')).toHaveClass('h-10');

      rerender(<ThemeProvider><Button size="icon">Icon</Button></ThemeProvider>);
      expect(screen.getByRole('button')).toHaveClass('h-9', 'w-9');
    });

    test('should render disabled button', () => {
      renderWithTheme(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    test('should render button with children content', () => {
      renderWithTheme(
        <Button>
          <span data-testid="test-icon">🚀</span>
          With Icon
        </Button>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick} disabled>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should trigger click when enabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should handle keyboard events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('should have proper focus styles', () => {
      renderWithTheme(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-1');
    });

    test('should support custom ARIA labels', () => {
      renderWithTheme(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    test('should support ARIA attributes', () => {
      renderWithTheme(<Button aria-pressed="true">Toggle Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Styling', () => {
    test('should apply custom className', () => {
      renderWithTheme(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    test('should merge shadcn classes with custom classes', () => {
      renderWithTheme(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'custom-class');
    });
  });

  describe('shadcn/ui Features', () => {
    test('should use proper color variables', () => {
      renderWithTheme(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    test('should have proper transitions', () => {
      renderWithTheme(<Button>Animated</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });
  });
});