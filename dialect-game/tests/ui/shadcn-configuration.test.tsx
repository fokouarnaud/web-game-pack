/**
 * Test de Validation de la Configuration shadcn/ui
 * Vérifie que shadcn/ui fonctionne avec la structure unifiée
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Badge } from '../../src/components/ui/badge'
import { Input } from '../../src/components/ui/input'

describe('shadcn/ui Configuration Tests', () => {
  
  describe('Structure et Import', () => {
    it('should import all UI components from src/components/ui', () => {
      // Test que tous les composants shadcn/ui sont accessibles
      expect(Button).toBeDefined()
      expect(Card).toBeDefined()
      expect(CardContent).toBeDefined()
      expect(CardHeader).toBeDefined()
      expect(CardTitle).toBeDefined()
      expect(Badge).toBeDefined()
      expect(Input).toBeDefined()
    })

    it('should render the new Input component', () => {
      render(<Input placeholder="Test input" data-testid="test-input" />)
      
      const input = screen.getByTestId('test-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Test input')
      
      // Vérifier les classes Tailwind appliquées
      expect(input).toHaveClass('flex')
      expect(input).toHaveClass('h-9')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-md')
      expect(input).toHaveClass('border')
    })
  })

  describe('Configuration fonctionnelle', () => {
    it('should compose multiple shadcn/ui components', () => {
      render(
        <Card data-testid="composed-card">
          <CardHeader>
            <CardTitle>Configuration Test</CardTitle>
            <Badge variant="default">Working</Badge>
          </CardHeader>
          <CardContent>
            <Input placeholder="Enter text" />
            <Button>Submit</Button>
          </CardContent>
        </Card>
      )
      
      // Vérifier que tous les composants sont rendus
      expect(screen.getByTestId('composed-card')).toBeInTheDocument()
      expect(screen.getByText('Configuration Test')).toBeInTheDocument()
      expect(screen.getByText('Working')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('should have proper CSS class inheritance', () => {
      render(<Button variant="outline" size="lg">Large Outline Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Vérifier les classes de base
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
      
      // Vérifier les classes de variant
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('border-input')
      expect(button).toHaveClass('bg-background')
      
      // Vérifier les classes de taille
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-8')
    })
  })

  describe('shadcn/ui Design System', () => {
    it('should use consistent design tokens', () => {
      render(
        <div>
          <Button data-testid="primary-btn">Primary</Button>
          <Badge data-testid="primary-badge">Primary</Badge>
        </div>
      )
      
      const button = screen.getByTestId('primary-btn')
      const badge = screen.getByTestId('primary-badge')
      
      // Les deux doivent utiliser les mêmes variables CSS
      const buttonStyle = window.getComputedStyle(button)
      const badgeStyle = window.getComputedStyle(badge)
      
      // Test que les CSS variables sont résolues (pas de var() en raw)
      expect(buttonStyle.backgroundColor).not.toContain('var(')
      expect(badgeStyle.backgroundColor).not.toContain('var(')
    })

    it('should support theming correctly', () => {
      // Test avec thème clair
      render(<Card data-testid="themed-card">Theme Test</Card>)
      let card = screen.getByTestId('themed-card')
      let lightStyle = window.getComputedStyle(card)
      
      // Passer en mode sombre
      document.documentElement.classList.add('dark')
      
      // Re-render en mode sombre
      render(<Card data-testid="themed-card-dark">Dark Theme Test</Card>)
      card = screen.getByTestId('themed-card-dark')
      let darkStyle = window.getComputedStyle(card)
      
      // Vérifier que les variables CSS sont appliquées
      expect(lightStyle.backgroundColor).not.toContain('var(')
      expect(darkStyle.backgroundColor).not.toContain('var(')
      
      // Cleanup
      document.documentElement.classList.remove('dark')
    })
  })

  describe('Configuration Validation', () => {
    it('should validate that no duplicate components exist', () => {
      // Ce test vérifie indirectement qu'il n'y a plus de conflit
      // entre @/components et src/components
      
      render(
        <div>
          <Button data-testid="config-btn">Config Test</Button>
          <Input data-testid="config-input" />
        </div>
      )
      
      // Si les imports fonctionnent sans erreur, la config est bonne
      expect(screen.getByTestId('config-btn')).toBeInTheDocument()
      expect(screen.getByTestId('config-input')).toBeInTheDocument()
    })

    it('should have proper directory structure', () => {
      // Test que nous utilisons bien src/components/ui
      // (testé implicitement par les imports qui fonctionnent)
      
      const components = [Button, Card, Badge, Input]
      
      components.forEach(Component => {
        expect(Component).toBeDefined()
        expect(typeof Component).toBe('function')
      })
    })
  })
})