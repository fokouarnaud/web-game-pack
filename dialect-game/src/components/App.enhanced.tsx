import React, { useState, useEffect } from 'react';
import ProgressionDashboard from './ProgressionDashboard';
import MultiplayerDashboard from './MultiplayerDashboard';
import CustomizationPanel from './CustomizationPanel';
import BackendDashboard from './BackendDashboard';

type GameState = 'menu' | 'playing' | 'paused' | 'ended';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXP: number;
  gamesPlayed: number;
  achievements: any[];
  preferences: any;
  createdAt: number;
  lastActiveAt: number;
}

interface AppEnhancedState {
  currentView: string;
  gameState: GameState;
  userProfile: UserProfile;
  achievements: any[];
  settings: any;
}

const AppEnhanced: React.FC = () => {
  const [appState, setAppState] = useState<AppEnhancedState>({
    currentView: 'dashboard',
    gameState: 'menu' as GameState,
    userProfile: {
      id: 'user_1',
      name: 'Utilisateur Test',
      email: 'user@example.com',
      level: 1,
      totalXP: 0,
      gamesPlayed: 0,
      achievements: [],
      preferences: {},
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    },
    achievements: [],
    settings: {}
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadUserData();
        await initializeServices();
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      }
    };

    initializeApp();
  }, []);

  const loadUserData = async () => {
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const initializeServices = async () => {
    return new Promise(resolve => setTimeout(resolve, 300));
  };

  const handleViewChange = (view: string) => {
    setAppState(prev => ({ ...prev, currentView: view }));
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'progression':
        return <ProgressionDashboard />;
      case 'multiplayer':
        return <MultiplayerDashboard />;
      case 'customization':
        return <CustomizationPanel />;
      case 'backend':
        return <BackendDashboard />;
      default:
        return <DashboardView />;
    }
  };

  const DashboardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">📈 Progression</h3>
        <p className="text-gray-600 mb-4">Système de progression avancé</p>
        <button 
          onClick={() => handleViewChange('progression')}
          className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors"
        >
          Progression
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">🎮 Multijoueur</h3>
        <p className="text-gray-600 mb-4">Modes multijoueur locaux</p>
        <button 
          onClick={() => handleViewChange('multiplayer')}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
        >
          Multijoueur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">🎨 Customisation</h3>
        <p className="text-gray-600 mb-4">Customisation avancée</p>
        <button 
          onClick={() => handleViewChange('customization')}
          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors"
        >
          Customiser
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">🗄️ Backend</h3>
        <p className="text-gray-600 mb-4">Backend et synchronisation</p>
        <button 
          onClick={() => handleViewChange('backend')}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600 transition-colors"
        >
          Backend
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">🎮 Jeu Principal</h3>
        <p className="text-gray-600 mb-4">Jouez au jeu de dialectes avec reconnaissance vocale</p>
        <button 
          className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
          disabled
        >
          Bientôt disponible
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">📚 Contenu Éducatif</h3>
        <p className="text-gray-600 mb-4">Explorez les leçons et exercices</p>
        <button 
          className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
          disabled
        >
          Bientôt disponible
        </button>
      </div>
    </div>
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Chargement de Dialect Game...</h2>
          <p className="text-gray-500 mt-2">Initialisation des services avancés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                🗣️ Dialect Game <span className="text-sm text-blue-600">Enhanced</span>
              </h1>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => handleViewChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  appState.currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Niveau {appState.userProfile.level}</span>
                <span>•</span>
                <span>{appState.userProfile.totalXP} XP</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6">
        {renderCurrentView()}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Dialect Game - Plateforme d'apprentissage linguistique avancée</p>
            <p className="mt-1">Phase 4: Backend et Synchronisation | Version Enhanced</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppEnhanced;