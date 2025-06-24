/**
 * Simple Router Component for Landing Page and Game Navigation
 * Using hash-based routing to avoid the need for react-router-dom
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './LandingPage';
import App from './App';

type Route = 'landing' | 'game';

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('landing');

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash === 'game') {
        setCurrentRoute('game');
      } else {
        setCurrentRoute('landing');
      }
    };

    // Set initial route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateToGame = () => {
    window.location.hash = 'game';
    setCurrentRoute('game');
  };

  const navigateToLanding = () => {
    window.location.hash = '';
    setCurrentRoute('landing');
  };

  if (currentRoute === 'game') {
    return (
      <div>
        <nav className="fixed top-4 left-4 z-50">
          <button
            onClick={navigateToLanding}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
            aria-label="Back to Landing Page"
          >
            ← Back to Home
          </button>
        </nav>
        <App />
      </div>
    );
  }

  return (
    <LandingPage 
      onPlayNow={navigateToGame}
      onLearnMore={() => {
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    />
  );
}

export default Router;
