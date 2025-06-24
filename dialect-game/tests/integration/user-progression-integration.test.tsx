/**
 * TDD CYCLE 4 - PHASE GREEN
 * Tests pour fonctionnalités utilisateur avancées : Progression & Achievements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserProgression from '../../src/components/UserProgression'

// Mock du service de progression
const mockProgressionService = {
  getCurrentLevel: vi.fn().mockReturnValue(1),
  getExperience: vi.fn().mockReturnValue(50),
  getAchievements: vi.fn().mockReturnValue([]),
  unlockAchievement: vi.fn(),
  addExperience: vi.fn(),
  levelUp: vi.fn()
}

// Mock du service d'achievements
const mockAchievementService = {
  checkAchievements: vi.fn(),
  getUnlockedAchievements: vi.fn().mockReturnValue([]),
  getAvailableAchievements: vi.fn().mockReturnValue([
    { id: 'first_word', name: 'Premier Mot', description: 'Prononcer votre premier mot' },
    { id: 'speed_demon', name: 'Rapide', description: 'Compléter 5 mots en moins de 10s' }
  ])
}

describe('User Progression Integration Tests (TDD CYCLE 4 GREEN Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Phase GREEN - Tests qui doivent maintenant passer', () => {
    it('should display current user level and experience', () => {
      render(<UserProgression />)
      
      // Tests de base qui passent maintenant
      expect(screen.getByTestId('user-progression-container')).toBeInTheDocument()
      expect(screen.getByTestId('level-display')).toHaveTextContent('Level: 1')
      expect(screen.getByTestId('experience-display')).toHaveTextContent('XP: 50/100')
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    })

    it('should show experience progress bar with correct percentage', () => {
      render(<UserProgression />)
      
      // Test progress bar maintenant implémenté
      const progressBar = screen.getByTestId('experience-progress')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      
      // Vérifier le pourcentage visuel
      expect(progressBar).toHaveStyle('width: 50%')
    })

    it('should display available achievements', () => {
      render(<UserProgression />)
      
      // Tests achievements maintenant implémentés
      expect(screen.getByTestId('achievements-section')).toBeInTheDocument()
      expect(screen.getByTestId('achievement-first_word')).toBeInTheDocument()
      expect(screen.getByTestId('achievement-speed_demon')).toBeInTheDocument()
      
      // Vérifier que les achievements ne sont pas encore débloqués
      expect(screen.getByTestId('achievement-first_word')).not.toHaveClass('unlocked')
    })

    it('should handle level up animation and notification', async () => {
      render(<UserProgression />)
      
      // Simuler gain d'expérience pour level up
      const addXpButton = screen.getByTestId('add-xp-button')
      fireEvent.click(addXpButton)
      
      // Tests level up maintenant implémentés
      await waitFor(() => {
        expect(screen.getByTestId('level-up-notification')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('level-up-animation')).toBeInTheDocument()
      expect(screen.getByTestId('level-display')).toHaveTextContent('Level: 2')
    })

    it('should unlock and display new achievements', async () => {
      render(<UserProgression />)
      
      // Simuler déblocage d'achievement
      const completeWordButton = screen.getByTestId('complete-word-button')
      fireEvent.click(completeWordButton)
      
      // Tests achievement unlock maintenant implémentés
      await waitFor(() => {
        expect(screen.getByTestId('achievement-unlocked-modal')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('achievement-first_word')).toHaveClass('unlocked')
    })

    it('should show detailed statistics', () => {
      render(<UserProgression />)
      
      // Tests statistiques détaillées maintenant implémentés
      expect(screen.getByTestId('stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('total-words-stat')).toHaveTextContent('Total Words: 0')
      expect(screen.getByTestId('accuracy-stat')).toHaveTextContent('Accuracy: 0%')
      expect(screen.getByTestId('average-time-stat')).toHaveTextContent('Avg Time: 0.0s')
    })

    it('should handle daily challenges', () => {
      render(<UserProgression />)
      
      // Tests challenges quotidiens maintenant implémentés
      expect(screen.getByTestId('daily-challenge-section')).toBeInTheDocument()
      expect(screen.getByTestId('challenge-progress')).toBeInTheDocument()
      expect(screen.getByTestId('challenge-reward')).toBeInTheDocument()
      expect(screen.getByTestId('challenge-reward')).toHaveTextContent('Reward: 50 XP')
    })

    it('should update statistics when completing words', () => {
      render(<UserProgression />)
      
      const completeWordButton = screen.getByTestId('complete-word-button')
      
      // État initial
      expect(screen.getByTestId('total-words-stat')).toHaveTextContent('Total Words: 0')
      
      // Compléter un mot
      fireEvent.click(completeWordButton)
      
      // Vérifier la mise à jour
      expect(screen.getByTestId('total-words-stat')).toHaveTextContent('Total Words: 1')
    })

    it('should progress daily challenge when completing words', () => {
      render(<UserProgression />)
      
      const completeWordButton = screen.getByTestId('complete-word-button')
      
      // Compléter plusieurs mots
      fireEvent.click(completeWordButton)
      fireEvent.click(completeWordButton)
      
      // Vérifier progression du challenge
      const challengeProgress = screen.getByTestId('challenge-progress')
      const progressBar = challengeProgress.querySelector('div')
      expect(progressBar).toHaveStyle('width: 20%') // 2/10 = 20%
    })
  })

  describe('Performance et Accessibility', () => {
    it('should maintain smooth animations during level transitions', async () => {
      const startTime = performance.now()
      
      render(<UserProgression />)
      
      // Simuler level up
      const addXpButton = screen.getByTestId('add-xp-button')
      fireEvent.click(addXpButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('level-up-animation')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(500) // Animation fluide < 500ms
    })

    it('should announce progression changes to screen readers', async () => {
      render(<UserProgression />)
      
      // Tests accessibility maintenant implémentés
      const announcements = screen.getByRole('status')
      expect(announcements).toHaveAttribute('aria-live', 'polite')
      
      // Simuler level up
      const addXpButton = screen.getByTestId('add-xp-button')
      fireEvent.click(addXpButton)
      
      await waitFor(() => {
        expect(announcements).toHaveTextContent('Level up! You reached level 2')
      })
    })

    it('should handle progress bar accessibility', () => {
      render(<UserProgression />)
      
      const progressBar = screen.getByTestId('experience-progress')
      expect(progressBar).toHaveAttribute('role', 'progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('should auto-dismiss modals after timeout', async () => {
      render(<UserProgression />)
      
      const completeWordButton = screen.getByTestId('complete-word-button')
      fireEvent.click(completeWordButton)
      
      // Modal apparaît
      await waitFor(() => {
        expect(screen.getByTestId('achievement-unlocked-modal')).toBeInTheDocument()
      })
      
      // Modal disparaît après timeout (simulé avec un wait plus long)
      await waitFor(() => {
        expect(screen.queryByTestId('achievement-unlocked-modal')).not.toBeInTheDocument()
      }, { timeout: 4000 })
    })
  })
})