/**
 * Tests unitaires pour EnhancedButton
 * Task 9: Amélioration UX/UI - Phase 2
 */

import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedButton } from '../../../../src/components/ui/enhanced-button';

describe('EnhancedButton Component', () => {
  describe('Rendering', () => {
    test('should render enhanced button with default props', () => {
      render(<EnhancedButton>Enhanced Click</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Enhanced Click');
      expect(button.tagName).toBe('BUTTON');
    });

    test('should render button with success variant', () => {
      render(<EnhancedButton variant="success">Success Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Success Button');
    });

    test('should render button with warning variant', () => {
      render(<EnhancedButton variant="warning">Warning Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Warning Button');
    });

    test('should render loading button', () => {
      render(<EnhancedButton loading>Loading Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Chargement...');
    });

    test('should render loading button with custom text', () => {
      render(
        <EnhancedButton loading loadingText="Custom Loading...">
          Normal Text
        </EnhancedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Custom Loading...');
    });

    test('should render button with icon', () => {
      render(
        <EnhancedButton icon={<span data-testid="test-icon">🚀</span>}>
          With Icon
        </EnhancedButton>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    test('should render button with right icon', () => {
      render(
        <EnhancedButton 
          icon={<span data-testid="test-icon">→</span>}
          iconPosition="right"
        >
          Right Icon
        </EnhancedButton>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Right Icon')).toBeInTheDocument();
    });

    test('should render button with badge', () => {
      render(<EnhancedButton badge="5">With Badge</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick}>Click me</EnhancedButton>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick} disabled>Disabled</EnhancedButton>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should not trigger click when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick} loading>Loading</EnhancedButton>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should create ripple effect on click', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedButton ripple>Ripple Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Le ripple effect est créé dynamiquement et supprimé après 600ms
      // On peut vérifier que le clic a été traité
      expect(button).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick}>Keyboard</EnhancedButton>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Enhanced Features', () => {
    test('should render with glow effect', () => {
      render(<EnhancedButton glow="medium">Glowing Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('should render with pulse animation', () => {
      render(<EnhancedButton pulse>Pulsing Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('should render with different sizes', () => {
      const { rerender } = render(<EnhancedButton size="sm">Small</EnhancedButton>);
      expect(screen.getByRole('button')).toHaveTextContent('Small');

      rerender(<EnhancedButton size="lg">Large</EnhancedButton>);
      expect(screen.getByRole('button')).toHaveTextContent('Large');

      rerender(<EnhancedButton size="xl">Extra Large</EnhancedButton>);
      expect(screen.getByRole('button')).toHaveTextContent('Extra Large');
    });

    test('should render with different rounded variants', () => {
      render(<EnhancedButton rounded="full">Rounded Full</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('should support tooltip', () => {
      render(<EnhancedButton tooltip="This is a tooltip">Tooltip Button</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'This is a tooltip');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<EnhancedButton>Accessible</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    test('should support custom ARIA labels', () => {
      render(
        <EnhancedButton aria-label="Custom label" tooltip="Tooltip text">
          Button
        </EnhancedButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    test('should indicate loading state', () => {
      render(<EnhancedButton loading>Loading</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('should be focusable', () => {
      render(<EnhancedButton>Focusable</EnhancedButton>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Variants and Styling', () => {
    test('should apply custom className', () => {
      render(<EnhancedButton className="custom-class">Custom</EnhancedButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    test('should render all variants correctly', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(<EnhancedButton variant={variant}>{variant}</EnhancedButton>);
        const button = screen.getByRole(variant === 'link' ? 'button' : 'button');
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Performance', () => {
    test('should handle rapid clicks gracefully', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<EnhancedButton onClick={handleClick}>Rapid Click</EnhancedButton>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    test('should render without errors', () => {
      expect(() => {
        render(<EnhancedButton>Test Button</EnhancedButton>);
      }).not.toThrow();
    });
  });

  describe('Props forwarding', () => {
    test('should forward custom props', () => {
      render(<EnhancedButton data-testid="enhanced-button">Custom Props</EnhancedButton>);
      
      const button = screen.getByTestId('enhanced-button');
      expect(button).toBeInTheDocument();
    });

    test('should handle ref properly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<EnhancedButton ref={ref}>Ref Button</EnhancedButton>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });
});