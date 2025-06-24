/**
 * TDD Test Suite for React Router v7 Navigation
 * Tests the new React Router implementation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import AppRouter from '../../src/components/AppRouter'
import { Navigation, FixedNavigation, BreadcrumbNavigation } from '../../src/components/Navigation'
import useNavigation from '../../src/hooks/useNavigation'

// Mock components to avoid complex dependencies
vi.mock('../../src/components/LandingPage', () => ({
  LandingPage: ({ onPlayNow, onLearnMore }: any) => (
    <div data-testid="landing-page">
      <h1>Dialect Learning Game</h1>
      <button onClick={onPlayNow} data-testid="play-now-button">
        Start Playing Now
      </button>
      <button onClick={onLearnMore} data-testid="learn-more-button">
        Learn More
      </button>
    </div>
  )
}))

vi.mock('../../src/components/App', () => ({
  default: () => (
    <div data-testid="game-app">
      <h2>Game Interface</h2>
    </div>
  )
}))

vi.mock('../../src/components/game/GameDashboard', () => ({
  GameDashboard: () => (
    <div data-testid="game-dashboard">
      <h2>Game Dashboard</h2>
    </div>
  )
}))

vi.mock('../../src/components/MultiplayerLobby', () => ({
  MultiplayerLobby: () => (
    <div data-testid="multiplayer-lobby">
      <h2>Multiplayer Lobby</h2>
    </div>
  )
}))

vi.mock('../../src/components/TestPage', () => ({
  TestPage: () => (
    <div data-testid="test-page">
      <h2>Test Page</h2>
    </div>
  )
}))

// Test wrapper for navigation hooks
const NavigationTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('React Router v7 Navigation Tests', () => {
  beforeEach(() => {
    // Clear any mocks
    vi.clearAllMocks()
    
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AppRouter Component', () => {
    it('should render landing page on root route', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument()
        expect(screen.getByText('Dialect Learning Game')).toBeInTheDocument()
      })
    })

    it('should render game interface on /game route', async () => {
      render(
        <MemoryRouter initialEntries={['/game']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('game-app')).toBeInTheDocument()
        expect(screen.getByText('Game Interface')).toBeInTheDocument()
      })
    })

    it('should render dashboard on /dashboard route', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('game-dashboard')).toBeInTheDocument()
        expect(screen.getByText('Game Dashboard')).toBeInTheDocument()
      })
    })

    it('should render multiplayer lobby on /multiplayer route', async () => {
      render(
        <MemoryRouter initialEntries={['/multiplayer']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('multiplayer-lobby')).toBeInTheDocument()
        expect(screen.getByText('Multiplayer Lobby')).toBeInTheDocument()
      })
    })

    it('should render test page on /test route', async () => {
      render(
        <MemoryRouter initialEntries={['/test']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('test-page')).toBeInTheDocument()
        expect(screen.getByText('Test Page')).toBeInTheDocument()
      })
    })

    it('should redirect /home to root', async () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument()
      })
    })

    it('should redirect unknown routes to root', async () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Component', () => {
    it('should render navigation links', () => {
      render(
        <NavigationTestWrapper>
          <Navigation />
        </NavigationTestWrapper>
      )
      
      expect(screen.getByLabelText('Go to home page')).toBeInTheDocument()
      expect(screen.getByLabelText('Start game')).toBeInTheDocument()
      expect(screen.getByLabelText('View dashboard')).toBeInTheDocument()
      expect(screen.getByLabelText('Join multiplayer')).toBeInTheDocument()
    })

    it('should not show back button on home route', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Navigation />
        </MemoryRouter>
      )
      
      expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument()
    })

    it('should show back button on non-home routes', () => {
      render(
        <MemoryRouter initialEntries={['/game']}>
          <Navigation />
        </MemoryRouter>
      )
      
      expect(screen.getByLabelText('Go back')).toBeInTheDocument()
    })

    it('should handle custom back action', async () => {
      const customBackAction = vi.fn()
      const user = userEvent.setup()
      
      render(
        <MemoryRouter initialEntries={['/game']}>
          <Navigation customBackAction={customBackAction} />
        </MemoryRouter>
      )
      
      const backButton = screen.getByLabelText('Go back')
      await user.click(backButton)
      
      expect(customBackAction).toHaveBeenCalledOnce()
    })
  })

  describe('FixedNavigation Component', () => {
    it('should render with fixed positioning classes', () => {
      render(
        <NavigationTestWrapper>
          <FixedNavigation />
        </NavigationTestWrapper>
      )
      
      const fixedNav = document.querySelector('.fixed')
      expect(fixedNav).toBeInTheDocument()
      expect(fixedNav).toHaveClass('top-4', 'left-4', 'z-50')
    })
  })

  describe('BreadcrumbNavigation Component', () => {
    const breadcrumbItems = [
      { label: 'Home', path: '/' },
      { label: 'Game', path: '/game' },
      { label: 'Dashboard', path: '/dashboard', isActive: true }
    ]

    it('should render breadcrumb items', () => {
      render(
        <NavigationTestWrapper>
          <BreadcrumbNavigation items={breadcrumbItems} />
        </NavigationTestWrapper>
      )
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Game')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should mark active item correctly', () => {
      render(
        <NavigationTestWrapper>
          <BreadcrumbNavigation items={breadcrumbItems} />
        </NavigationTestWrapper>
      )
      
      const activeItem = screen.getByText('Dashboard')
      expect(activeItem).toHaveAttribute('aria-current', 'page')
    })

    it('should render separators between items', () => {
      render(
        <NavigationTestWrapper>
          <BreadcrumbNavigation items={breadcrumbItems} />
        </NavigationTestWrapper>
      )
      
      const separators = screen.getAllByText('/')
      expect(separators).toHaveLength(2) // Between 3 items = 2 separators
    })
  })

  describe('useNavigation Hook', () => {
    // Test component that uses the hook
    const NavigationHookTest = () => {
      const {
        goToHome,
        goToGame,
        goToDashboard,
        isOnHome,
        isOnGame,
        currentRoute,
        getQueryParam,
        setQueryParam
      } = useNavigation()

      return (
        <div>
          <div data-testid="current-path">{currentRoute.path}</div>
          <div data-testid="is-on-home">{isOnHome.toString()}</div>
          <div data-testid="is-on-game">{isOnGame.toString()}</div>
          <button onClick={() => goToHome()} data-testid="go-home">Go Home</button>
          <button onClick={() => goToGame()} data-testid="go-game">Go Game</button>
          <button onClick={() => goToDashboard()} data-testid="go-dashboard">Go Dashboard</button>
          <button onClick={() => setQueryParam('test', 'value')} data-testid="set-query">
            Set Query
          </button>
          <div data-testid="query-param">{getQueryParam('test')}</div>
        </div>
      )
    }

    it('should provide current route information', () => {
      render(
        <MemoryRouter initialEntries={['/game']}>
          <NavigationHookTest />
        </MemoryRouter>
      )
      
      expect(screen.getByTestId('current-path')).toHaveTextContent('/game')
      expect(screen.getByTestId('is-on-home')).toHaveTextContent('false')
      expect(screen.getByTestId('is-on-game')).toHaveTextContent('true')
    })

    it('should provide navigation functions', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter initialEntries={['/']}>
          <NavigationHookTest />
        </MemoryRouter>
      )
      
      // Initially on home
      expect(screen.getByTestId('is-on-home')).toHaveTextContent('true')
      
      // Navigate to game
      await user.click(screen.getByTestId('go-game'))
      
      await waitFor(() => {
        expect(screen.getByTestId('current-path')).toHaveTextContent('/game')
        expect(screen.getByTestId('is-on-game')).toHaveTextContent('true')
      })
    })

    it('should handle query parameters', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter initialEntries={['/']}>
          <NavigationHookTest />
        </MemoryRouter>
      )
      
      // Set query parameter
      await user.click(screen.getByTestId('set-query'))
      
      await waitFor(() => {
        expect(screen.getByTestId('query-param')).toHaveTextContent('value')
      })
    })
  })

  describe('Navigation Integration Tests', () => {
    it('should navigate between routes using navigation links', async () => {
      const user = userEvent.setup()
      
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      )
      
      // Start on landing page
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
      
      // Click play now button
      const playButton = await screen.findByTestId('play-now-button')
      await user.click(playButton)
      
      // Should navigate to game
      await waitFor(() => {
        expect(screen.getByTestId('game-app')).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', async () => {
      render(
        <NavigationTestWrapper>
          <Navigation />
        </NavigationTestWrapper>
      )
      
      const homeLink = screen.getByLabelText('Go to home page')
      
      // Focus and press Enter
      homeLink.focus()
      expect(homeLink).toHaveFocus()
      
      fireEvent.keyDown(homeLink, { key: 'Enter', code: 'Enter' })
      
      // Link should still be focused (navigation would happen in real scenario)
      expect(homeLink).toHaveFocus()
    })

    it('should maintain accessibility features', () => {
      render(
        <NavigationTestWrapper>
          <Navigation />
        </NavigationTestWrapper>
      )
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
      
      // All navigation links should have proper labels
      expect(screen.getByLabelText('Go to home page')).toBeInTheDocument()
      expect(screen.getByLabelText('Start game')).toBeInTheDocument()
      expect(screen.getByLabelText('View dashboard')).toBeInTheDocument()
      expect(screen.getByLabelText('Join multiplayer')).toBeInTheDocument()
    })
  })
})