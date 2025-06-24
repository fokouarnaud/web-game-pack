/**
 * Basic React Router v7 Tests
 * Simple tests to verify React Router integration
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

// Simple mock components
const MockLandingPage = ({ onPlayNow }: { onPlayNow: () => void }) => (
  <div data-testid="landing-page">
    <h1>Landing Page</h1>
    <button onClick={onPlayNow} data-testid="play-button">Play</button>
  </div>
)

const MockGameApp = () => (
  <div data-testid="game-app">
    <h1>Game App</h1>
  </div>
)

// Mock the complex components
vi.mock('../../src/components/LandingPage', () => ({
  LandingPage: MockLandingPage
}))

vi.mock('../../src/components/App', () => ({
  default: MockGameApp
}))

vi.mock('../../src/components/game/GameDashboard', () => ({
  GameDashboard: () => <div data-testid="dashboard">Dashboard</div>
}))

vi.mock('../../src/components/MultiplayerLobby', () => ({
  MultiplayerLobby: () => <div data-testid="multiplayer">Multiplayer</div>
}))

vi.mock('../../src/components/TestPage', () => ({
  TestPage: () => <div data-testid="test-page">Test Page</div>
}))

describe('Basic Router Tests', () => {
  it('should render without errors', async () => {
    // Dynamic import to avoid mocking issues
    const { default: AppRouter } = await import('../../src/components/AppRouter')
    
    expect(() => {
      render(
        <MemoryRouter>
          <AppRouter />
        </MemoryRouter>
      )
    }).not.toThrow()
  })

  it('should show landing page on root route', async () => {
    const { default: AppRouter } = await import('../../src/components/AppRouter')
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('should show game on /game route', async () => {
    const { default: AppRouter } = await import('../../src/components/AppRouter')
    
    render(
      <MemoryRouter initialEntries={['/game']}>
        <AppRouter />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('game-app')).toBeInTheDocument()
  })

  it('should redirect unknown routes to home', async () => {
    const { default: AppRouter } = await import('../../src/components/AppRouter')
    
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <AppRouter />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })
})