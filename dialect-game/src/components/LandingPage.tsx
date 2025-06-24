/**
 * LandingPage - Page d'accueil moderne et attractive
 * Point d'entrée principal à la racine du site (http://localhost:5174/)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme/ThemeToggleSimple';
import { useNavigate } from 'react-router-dom';

// Types pour les props du composant
export interface LandingPageProps {
  className?: string;
  onPlayNow?: () => void;
  onLearnMore?: () => void;
}

// Composant HeroSection temporaire (sera remplacé par un composant dédié)
const HeroSection: React.FC<{ onPlayNow?: () => void; onLearnMore?: () => void }> = ({ onPlayNow, onLearnMore }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 fade-in-up">
          {/* Hero Content */}
          <div className="space-y-6">
            <Badge variant="outline" className="text-sm font-medium pulse-glow">
              🎮 Interactive Language Learning
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient leading-tight floating-animation">
              Master Languages Through Gaming
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of language learning with voice recognition, 
              interactive gameplay, and adaptive difficulty across 15+ languages.
            </p>
          </div>          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={onPlayNow}
            >
              🚀 Start Playing Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full hover-lift"
              onClick={onLearnMore}
            >
              📖 Learn More
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Languages', value: '15+', icon: '🌍' },
              { label: 'Free APIs', value: '100%', icon: '🆓' },
              { label: 'Responsive', value: 'Mobile First', icon: '📱' },
              { label: 'Accessibility', value: 'WCAG 2.1', icon: '♿' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center glass-container p-4 rounded-lg hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 text-4xl floating-animation opacity-20">🎮</div>
      <div className="absolute bottom-20 right-10 text-3xl floating-animation opacity-20" style={{ animationDelay: '2s' }}>🎯</div>
      <div className="absolute top-1/2 left-5 text-2xl floating-animation opacity-20" style={{ animationDelay: '4s' }}>🌟</div>
    </section>
  );
};

// Composant FeaturesSection temporaire
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Adaptive Learning',
      description: 'AI-powered difficulty adjustment based on your progress and performance'
    },
    {
      icon: '🎤',
      title: 'Voice Recognition',
      description: 'Practice pronunciation with real-time speech recognition technology'
    },
    {
      icon: '🌍',
      title: 'Multilingual Support',
      description: 'Learn from 15+ languages with native speaker pronunciations'
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Perfect gaming experience on all devices with touch gestures'
    },
    {
      icon: '🎮',
      title: 'Gamified Experience',
      description: 'Unlock achievements, level up, and compete with friends'
    },
    {
      icon: '⚡',
      title: 'Offline Ready',
      description: 'Continue learning even without internet connection'
    }
  ];
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            ✨ Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Choose Our Language Game?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the most advanced language learning platform with cutting-edge technology
          </p>
        </div>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 floating-animation">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant GamePreview temporaire
const GamePreviewSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            🎮 Preview
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a glimpse of the immersive gaming experience that awaits you
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎮</div>
                <h3 className="text-2xl font-semibold">Interactive Game Preview</h3>
                <p className="text-muted-foreground">
                  Screenshots and demo will be integrated here
                </p>
                <Button className="mt-4">
                  Try Demo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Composant Footer
const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-sm">
          {/* Technologies */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">🚀 Technologies</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>React 18 + TypeScript</li>
              <li>TailwindCSS + shadcn/ui</li>
              <li>Vite + Vitest (TDD)</li>
              <li>Modern responsive design</li>
            </ul>
          </div>
          
          {/* APIs */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">🌐 Free APIs</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Dictionary API (definitions)</li>
              <li>LibreTranslate (15+ languages)</li>
              <li>Unsplash + Pexels (images)</li>
              <li>Lorem Picsum (fallbacks)</li>
            </ul>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">✨ Features</h3>
            <ul className="space-y-2 text-muted-foreground">
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
  );
};

// Composant principal LandingPage
export const LandingPage: React.FC<LandingPageProps> = ({ className, onPlayNow, onLearnMore }) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn("min-h-screen bg-background text-foreground", className)}
      role="main"
      aria-label="Dialect Learning Game Landing Page"
    >
      {/* Header with Navigation and Theme Toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="text-2xl">🎮</div>
              <span className="text-xl font-bold text-foreground">Dialect Game</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate('/lessons')}>
                Lessons
              </Button>
              <Button variant="ghost" onClick={() => navigate('/game')}>
                Play Game
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </nav>
            
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                className="hidden sm:flex"
                onClick={() => navigate('/lessons')}
              >
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Add padding to account for fixed header */}
      <div className="pt-20">
        {/* Sections principales */}
        <HeroSection onPlayNow={onPlayNow} onLearnMore={onLearnMore} />
        <FeaturesSection />
        <GamePreviewSection />
        
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Accessibilité - Screen Reader */}
      <div className="sr-only">
        <h1>Dialect Learning Game - Interactive Language Learning Platform</h1>
        <p>
          Experience the future of language learning with voice recognition, 
          gaming elements, and support for 15+ languages.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
