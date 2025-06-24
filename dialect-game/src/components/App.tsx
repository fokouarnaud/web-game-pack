/**
 * TDD CYCLE 6 - GREEN PHASE
 * Composant principal d'application intégrant toutes les fonctionnalités
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import UserProgression from './UserProgression'
import MultiplayerLobby from './MultiplayerLobby'
import GameVoiceIntegration from './GameVoiceIntegration'

// Types pour l'application principale
interface AppState {
  currentTab: 'game' | 'progression' | 'multiplayer'
  isAuthenticated: boolean
  user: User | null
  theme: 'light' | 'dark'
  language: 'en' | 'fr' | 'es'
  isOffline: boolean
  pwaInstallPrompt: any
}

interface User {
  id: string
  email: string
  name: string
  level: number
  experience: number
}

export const App: React.FC = () => {
  // État principal de l'application
  const [appState, setAppState] = useState<AppState>({
    currentTab: 'game',
    isAuthenticated: false,
    user: null,
    theme: 'light',
    language: 'en',
    isOffline: false,
    pwaInstallPrompt: null
  })

  const [showCookieConsent, setShowCookieConsent] = useState(true)
  const [showPWAInstall, setShowPWAInstall] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced')

  // Gestion des onglets
  const handleTabChange = (tab: 'game' | 'progression' | 'multiplayer') => {
    setAppState(prev => ({ ...prev, currentTab: tab }))
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tab_change', {
        event_category: 'navigation',
        event_label: tab
      })
    }
  }

  // Gestion de l'authentification
  const handleLogin = async (email: string, password: string) => {
    try {
      // Simuler authentification
      const user: User = {
        id: 'user123',
        email,
        name: email.split('@')[0],
        level: 1,
        experience: 50
      }
      
      setAppState(prev => ({
        ...prev,
        isAuthenticated: true,
        user
      }))
      
      setSyncStatus('synced')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleGoogleLogin = async () => {
    // Simuler OAuth Google
    const user: User = {
      id: 'google123',
      email: 'user@gmail.com',
      name: 'Google User',
      level: 2,
      experience: 150
    }
    
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      user
    }))
  }

  const handleLogout = () => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null
    }))
    
    // Nettoyer les données locales
    localStorage.removeItem('dialect-game-progress')
  }

  // Gestion du thème
  const toggleTheme = () => {
    const newTheme = appState.theme === 'light' ? 'dark' : 'light'
    setAppState(prev => ({ ...prev, theme: newTheme }))
    
    // Appliquer le thème
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('dialect-game-theme', newTheme)
  }

  // Gestion de la langue
  const changeLanguage = (language: 'en' | 'fr' | 'es') => {
    setAppState(prev => ({ ...prev, language }))
    
    // Changer l'URL si nécessaire
    const newPath = `/${language}${window.location.pathname.substring(3)}`
    window.history.pushState({}, '', newPath)
  }

  // Gestion PWA
  const handlePWAInstall = async () => {
    if (appState.pwaInstallPrompt) {
      const result = await appState.pwaInstallPrompt.prompt()
      if (result.outcome === 'accepted') {
        setShowPWAInstall(false)
        setAppState(prev => ({ ...prev, pwaInstallPrompt: null }))
      }
    }
  }

  // Gestion du consentement cookies
  const handleAcceptAnalytics = () => {
    setShowCookieConsent(false)
    localStorage.setItem('dialect-game-analytics-consent', 'true')
    
    // Initialiser analytics
    if (typeof window !== 'undefined') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  // Gestion de la synchronisation
  const handleSync = async () => {
    setSyncStatus('pending')
    
    try {
      // Simuler synchronisation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSyncStatus('synced')
    } catch (error) {
      setSyncStatus('offline')
    }
  }

  // Effets de côté
  useEffect(() => {
    // Détecter le mode hors ligne
    const handleOnline = () => setAppState(prev => ({ ...prev, isOffline: false }))
    const handleOffline = () => setAppState(prev => ({ ...prev, isOffline: true }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Détecter l'événement d'installation PWA
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setAppState(prev => ({ ...prev, pwaInstallPrompt: e }))
      setShowPWAInstall(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('dialect-game-theme') as 'light' | 'dark'
    if (savedTheme) {
      setAppState(prev => ({ ...prev, theme: savedTheme }))
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Textes i18n
  const t = {
    en: {
      title: 'Dialect Game',
      game: 'Game',
      progression: 'Progression',
      multiplayer: 'Multiplayer',
      login: 'Login',
      logout: 'Logout',
      installApp: 'Install App',
      sync: 'Sync'
    },
    fr: {
      title: 'Jeu de Dialecte',
      game: 'Jeu',
      progression: 'Progression',
      multiplayer: 'Multijoueur',
      login: 'Connexion',
      logout: 'Déconnexion',
      installApp: 'Installer App',
      sync: 'Synchroniser'
    },
    es: {
      title: 'Juego de Dialecto',
      game: 'Juego',
      progression: 'Progreso',
      multiplayer: 'Multijugador',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      installApp: 'Instalar App',
      sync: 'Sincronizar'
    }
  }[appState.language]

  return (
    <div data-testid="app-container" className="min-h-screen bg-background text-foreground">
      {/* Header principal */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            
            <div className="flex items-center gap-4">
              {/* Sélecteur de langue */}
              <select
                data-testid="language-selector"
                value={appState.language}
                onChange={(e) => changeLanguage(e.target.value as any)}
                className="px-3 py-1 border rounded"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
              
              {/* Toggle thème */}
              <Button
                data-testid="dark-mode-toggle"
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {appState.theme === 'light' ? '🌙' : '☀️'}
              </Button>
              
              {/* Statut de synchronisation */}
              <div data-testid="sync-status" className="flex items-center gap-2">
                <Button
                  data-testid="sync-button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  className={`
                    ${syncStatus === 'synced' ? 'text-green-600' : ''}
                    ${syncStatus === 'pending' ? 'text-yellow-600' : ''}
                    ${syncStatus === 'offline' ? 'text-red-600' : ''}
                  `}
                >
                  {syncStatus === 'synced' && '✓ Synced'}
                  {syncStatus === 'pending' && '⏳ Syncing...'}
                  {syncStatus === 'offline' && '❌ Offline'}
                </Button>
              </div>
              
              {/* Authentification */}
              {!appState.isAuthenticated ? (
                <Button
                  data-testid="login-button"
                  onClick={() => handleLogin('test@example.com', 'password123')}
                >
                  {t.login}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div data-testid="user-profile" className="text-sm">
                    {appState.user?.email}
                  </div>
                  <Button
                    data-testid="logout-button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    {t.logout}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation principale */}
      <nav data-testid="main-navigation" className="border-b bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <Button
              data-testid="game-tab"
              variant={appState.currentTab === 'game' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('game')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              {t.game}
            </Button>
            <Button
              data-testid="progression-tab"
              variant={appState.currentTab === 'progression' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('progression')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              {t.progression}
            </Button>
            <Button
              data-testid="multiplayer-tab"
              variant={appState.currentTab === 'multiplayer' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('multiplayer')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              {t.multiplayer}
            </Button>
          </div>
        </div>
      </nav>

      {/* Indicateur hors ligne */}
      {appState.isOffline && (
        <div data-testid="offline-indicator" className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center">
          You are currently offline. Some features may be limited.
        </div>
      )}

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6">
        {appState.currentTab === 'game' && (
          <div data-testid="game-voice-container">
            <GameVoiceIntegration />
          </div>
        )}
        
        {appState.currentTab === 'progression' && (
          <div data-testid="user-progression-container">
            <UserProgression />
          </div>
        )}
        
        {appState.currentTab === 'multiplayer' && (
          <div data-testid="multiplayer-lobby-container">
            <MultiplayerLobby />
          </div>
        )}
      </main>

      {/* Modal de connexion */}
      {!appState.isAuthenticated && (
        <div data-testid="login-form" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <div className="space-y-4">
              <input
                data-testid="email-input"
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                defaultValue="test@example.com"
              />
              <input
                data-testid="password-input"
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
                defaultValue="password123"
              />
              <Button
                data-testid="submit-login"
                onClick={() => handleLogin('test@example.com', 'password123')}
                className="w-full"
              >
                Login
              </Button>
              <Button
                data-testid="google-login"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
              >
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Consentement cookies */}
      {showCookieConsent && (
        <div data-testid="cookie-consent" className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm">
              We use cookies to improve your experience and for analytics.
            </p>
            <Button
              data-testid="accept-analytics"
              onClick={handleAcceptAnalytics}
              size="sm"
            >
              Accept
            </Button>
          </div>
        </div>
      )}

      {/* Bouton d'installation PWA */}
      {showPWAInstall && (
        <div data-testid="pwa-install-prompt" className="fixed top-4 right-4 bg-card border rounded-lg p-4 shadow-lg z-50">
          <p className="text-sm mb-2">Install Dialect Game for a better experience</p>
          <div className="flex gap-2">
            <Button
              data-testid="pwa-install-button"
              onClick={handlePWAInstall}
              size="sm"
            >
              {t.installApp}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPWAInstall(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App