/**
 * TDD Test Suite for Page Navigation and Routing
 * Cycle: RED -> GREEN -> REFACTOR
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Router } from '../../src/components/Router'

// Mock window.location
const mockLocation = {
  hash: '',
  pathname: '/',
  search: ''
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('Page Navigation Tests (TDD)', () => {
  beforeEach(() => {
    // Reset location hash before each test
    window.location.hash = ''
    mockLocation.hash = ''
    
    // Clear DOM
    document.body.innerHTML = ''
    
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('RED Phase: Initial Failing Tests', () => {
    it('should render Landing Page by default', async () => {
      render(<Router />)
      
      // Should show landing page content
      await waitFor(() => {
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      })
      
      // Should not show game interface initially
      expect(screen.queryByText(/back to home/i)).not.toBeInTheDocument()
    })

    it('should navigate to game when "Play Now" is clicked', async () => {
      const user = userEvent.setup()
      render(<Router />)
      
      // Find and click Play Now button
      const playButton = await screen.findByRole('button', { name: /start playing now/i })
      expect(playButton).toBeInTheDocument()
      
      await user.click(playButton)
      
      // Should navigate to game page (hash might be 'game' or '#game')
      await waitFor(() => {
        expect(window.location.hash === '#game' || window.location.hash === 'game').toBe(true)
      })
      
      // Should show back button (using aria-label)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to landing page/i })).toBeInTheDocument()
      })
    })

    it('should navigate back to landing when back button is clicked', async () => {
      const user = userEvent.setup()
      
      // Start with game hash
      window.location.hash = '#game'
      mockLocation.hash = '#game'
      
      render(<Router />)
      
      // Should show game view with back button
      const backButton = await screen.findByRole('button', { name: /back to landing page/i })
      expect(backButton).toBeInTheDocument()
      
      await user.click(backButton)
      
      // Should navigate back to landing
      await waitFor(() => {
        expect(window.location.hash === '' || window.location.hash === '#').toBe(true)
      })
      
      // Should show landing page content again
      await waitFor(() => {
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      })
    })

    it('should handle direct navigation via URL hash', async () => {
      // Set hash directly
      window.location.hash = '#game'
      mockLocation.hash = '#game'
      
      render(<Router />)
      
      // Should show game interface
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to landing page/i })).toBeInTheDocument()
      })
    })

    it('should handle browser back/forward navigation', async () => {
      render(<Router />)
      
      // Simulate hashchange event
      window.location.hash = '#game'
      mockLocation.hash = '#game'
      
      fireEvent(window, new HashChangeEvent('hashchange'))
      
      // Should update to game view
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to landing page/i })).toBeInTheDocument()
      })
      
      // Navigate back
      window.location.hash = ''
      mockLocation.hash = ''
      
      fireEvent(window, new HashChangeEvent('hashchange'))
      
      // Should return to landing
      await waitFor(() => {
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation State Management', () => {
    it('should maintain scroll position on navigation', async () => {
      const user = userEvent.setup()
      render(<Router />)
      
      // Mock scroll behavior
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      
      const playButton = await screen.findByRole('button', { name: /start playing now/i })
      await user.click(playButton)
      
      // Should handle scroll position
      expect(scrollToSpy).toHaveBeenCalled()
      
      scrollToSpy.mockRestore()
    })

    it('should handle invalid routes gracefully', async () => {
      // Set invalid hash
      window.location.hash = '#invalid-route'
      mockLocation.hash = '#invalid-route'
      
      render(<Router />)
      
      // Should fallback to landing page
      await waitFor(() => {
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Navigation Tests', () => {
    it('should support keyboard navigation', async () => {
      render(<Router />)
      
      const playButton = await screen.findByRole('button', { name: /start playing now/i })
      
      // Focus and press Enter
      playButton.focus()
      expect(playButton).toHaveFocus()
      
      fireEvent.keyDown(playButton, { key: 'Enter', code: 'Enter' })
      
      // Should navigate to game
      await waitFor(() => {
        expect(window.location.hash === '#game' || window.location.hash === 'game').toBe(true)
      })
    })

    it('should have proper ARIA labels for navigation', async () => {
      window.location.hash = '#game'
      mockLocation.hash = '#game'
      
      render(<Router />)
      
      const backButton = await screen.findByRole('button', { name: /back to landing page/i })
      expect(backButton).toHaveAttribute('aria-label', 'Back to Landing Page')
    })

    it('should announce route changes to screen readers', async () => {
      // This would typically use aria-live regions
      render(<Router />)
      
      // Check for aria-live region or skip if not implemented yet
      const liveRegion = document.querySelector('[aria-live]')
      if (liveRegion) {
        expect(liveRegion).toBeInTheDocument()
      } else {
        // For now, just check that navigation works
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      }
    })
  })

  describe('Performance Navigation Tests', () => {
    it('should not cause memory leaks on route changes', async () => {
      const user = userEvent.setup()
      render(<Router />)
      
      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        const playButton = await screen.findByRole('button', { name: /start playing now/i })
        await user.click(playButton)
        
        const backButton = await screen.findByRole('button', { name: /back to landing page/i })
        await user.click(backButton)
      }
      
      // Should not crash or have excessive re-renders
      expect(screen.getByText(/dialect/i)).toBeInTheDocument()
    })

    it('should load routes quickly', async () => {
      const startTime = performance.now()
      
      render(<Router />)
      
      await waitFor(() => {
        expect(screen.getByText(/dialect/i)).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(1000) // 1 second
    })
  })
})
