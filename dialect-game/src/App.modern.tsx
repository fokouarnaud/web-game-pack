/**
 * App moderne avec intégration complète
 * Toutes les APIs et composants modernes intégrés
 */

import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { GameDashboard } from './components/game/GameDashboard';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">🌍 Dialect Game</h1>
                <span className="text-sm text-muted-foreground">
                  Learn languages through interactive quizzes
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  Powered by free APIs
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <GameDashboard />
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/50 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8 text-sm">
              <div>
                <h3 className="font-semibold mb-2">🚀 Technologies</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>React 18 + TypeScript</li>
                  <li>TailwindCSS + shadcn/ui</li>
                  <li>Vite + Vitest (TDD)</li>
                  <li>Modern responsive design</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🌐 Free APIs</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Dictionary API (definitions)</li>
                  <li>LibreTranslate (15+ languages)</li>
                  <li>Unsplash + Pexels (images)</li>
                  <li>Lorem Picsum (fallbacks)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">✨ Features</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Multilingual quiz generation</li>
                  <li>Dynamic image themes</li>
                  <li>Adaptive difficulty</li>
                  <li>Offline-ready fallbacks</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
              <p>
                Built with ❤️ using modern web technologies and free APIs.
                <br />
                Perfect example of TDD, responsive design, and API integration.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;