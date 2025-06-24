/**
 * Enhanced React Router v7 Implementation for Dialect Learning Game
 * Integrates real components with improved navigation and UI/UX best practices
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, FixedNavigation, BreadcrumbNavigation } from './core/navigation/Navigation';
import { cn } from '@/lib/utils';
import { GameStoreProvider } from '@/stores/gameStore';

// Lazy load components for better performance - New Architecture
const LandingPage = lazy(() => import('./LandingPage').then(module => ({ default: module.LandingPage })));
const LandingPageGaming = lazy(() => import('./core/LandingPageGaming'));
const LessonsPageClean = lazy(() => import('./core/LessonsPageClean'));
const LessonPage = lazy(() => import('./LessonPage'));
// Legacy components temporarily disabled
// const GameLessonModern2025 = lazy(() => import('./archive/legacy-lessons/GameLessonModern2025'));
// const GameLessonAdvanced = lazy(() => import('./archive/legacy-lessons/GameLessonAdvanced'));
// const GameLessonZen = lazy(() => import('./archive/legacy-lessons/GameLessonZen'));
// const GameLessonChatZen = lazy(() => import('./archive/legacy-lessons/GameLessonChatZen'));
const GameLessonSituationChat = lazy(() => import('./GameLessonSituationChat'));
const GameLessonAdaptive = lazy(() => import('./GameLessonAdaptive'));
const GameLessonSimple = lazy(() => import('./GameLessonSimple'));
const GameLessonEducational = lazy(() => import('./core/lesson/GameLessonEducational'));
const LessonCompleteInterface = lazy(() => import('./LessonCompleteInterface'));
const LessonCompletePageEducational = lazy(() => import('./core/lesson/LessonCompletePageEducational'));
const ProgressPage = lazy(() => import('./ProgressPage'));
const GameDashboard = lazy(() => import('./game/GameDashboard').then(module => ({ default: module.GameDashboard })));
const TailwindTest = lazy(() => import('./TailwindTest'));
const TestComponents = lazy(() => import('./TestComponents'));
const Phase3Demo = lazy(() => import('./Phase3Demo'));
const ThemeValidator = lazy(() => import('./common/ThemeValidator').then(module => ({ default: module.ThemeValidator })));

// Loading component with enhanced UX
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Card className="w-full max-w-md mx-4">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  </div>
);

// 404 Not Found component with better UX
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FixedNavigation />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/')} className="flex-1">
              🏠 Go Home
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
              ← Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Layout wrapper with navigation
const Layout: React.FC<{ 
  children: React.ReactNode; 
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
  className?: string;
}> = ({ 
  children, 
  showNavigation = true, 
  showBreadcrumbs = false,
  className 
}) => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ label: 'Home', path: '/', isActive: path === '/' }];
    
    if (path === '/game') {
      breadcrumbs.push({ label: 'Game', path: '/game', isActive: true });
    } else if (path === '/lessons') {
      breadcrumbs.push({ label: 'Lessons', path: '/lessons', isActive: true });
    } else if (path.startsWith('/lesson/')) {
      breadcrumbs.push({ label: 'Lessons', path: '/lessons', isActive: false });
      breadcrumbs.push({ label: 'Current Lesson', path: path, isActive: true });
    } else if (path === '/progress') {
      breadcrumbs.push({ label: 'Progress', path: '/progress', isActive: true });
    } else if (path === '/dashboard') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard', isActive: true });
    } else if (path === '/phase3') {
      breadcrumbs.push({ label: 'Phase 3 - EdClub Integration', path: '/phase3', isActive: true });
    } else if (path === '/tailwind-test') {
      breadcrumbs.push({ label: 'Tailwind Test', path: '/tailwind-test', isActive: true });
    } else if (path === '/components-test') {
      breadcrumbs.push({ label: 'Components Test', path: '/components-test', isActive: true });
    }
    
    return breadcrumbs;
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showNavigation && <FixedNavigation />}
      
      {showBreadcrumbs && (
        <div className="container mx-auto px-4 pt-20 pb-4">
          <BreadcrumbNavigation items={getBreadcrumbs()} />
        </div>
      )}
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

// Gaming route wrappers
const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout showNavigation={false}>
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        <LandingPageGaming
          onGetStarted={() => navigate('/lessons')}
        />
      </Suspense>
    </Layout>
  );
};

const LessonsPageWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Loading lessons..." />}>
      <LessonsPageClean />
    </Suspense>
  </Layout>
);

const LessonPageWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Loading lesson..." />}>
      <LessonPage />
    </Suspense>
  </Layout>
);

const ProgressPageWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Loading progress..." />}>
      <ProgressPage />
    </Suspense>
  </Layout>
);

// Legacy wrappers temporarily disabled
// const GameLessonWrapper: React.FC = () => (
//   <Layout showNavigation={false}>
//     <Suspense fallback={<LoadingSpinner message="Loading game..." />}>
//       <GameLessonModern2025 />
//     </Suspense>
//   </Layout>
// );

// const GameLessonAdvancedWrapper: React.FC = () => (
//   <Layout showNavigation={false}>
//     <Suspense fallback={<LoadingSpinner message="Loading advanced lesson..." />}>
//       <GameLessonAdvanced />
//     </Suspense>
//   </Layout>
// );

// const GameLessonZenWrapper: React.FC = () => (
//   <Layout showNavigation={false}>
//     <Suspense fallback={<LoadingSpinner message="Preparing your zen learning experience..." />}>
//       <GameLessonZen />
//     </Suspense>
//   </Layout>
// );

// const GameLessonChatZenWrapper: React.FC = () => (
//   <Layout showNavigation={false}>
//     <Suspense fallback={<LoadingSpinner message="Starting your conversation with Emma..." />}>
//       <GameLessonChatZen />
//     </Suspense>
//   </Layout>
// );

const GameLessonSituationChatWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Loading immersive conversation experience..." />}>
      <GameLessonSituationChat />
    </Suspense>
  </Layout>
);

const GameLessonAdaptiveWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Preparing adaptive learning experience..." />}>
      <GameLessonAdaptive />
    </Suspense>
  </Layout>
);

const GameLessonSimpleWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Préparation de votre leçon..." />}>
      <GameLessonSimple />
    </Suspense>
  </Layout>
);

const GameLessonEducationalWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Préparation de votre parcours pédagogique..." />}>
      <GameLessonEducational />
    </Suspense>
  </Layout>
);

const LessonCompleteWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Loading results..." />}>
      <LessonCompleteInterface />
    </Suspense>
  </Layout>
);

const LessonCompleteEducationalWrapper: React.FC = () => (
  <Layout showNavigation={false}>
    <Suspense fallback={<LoadingSpinner message="Calcul de vos résultats..." />}>
      <LessonCompletePageEducational />
    </Suspense>
  </Layout>
);

const GamePageWrapper: React.FC = () => (
  <Layout showBreadcrumbs>
    <Suspense fallback={<LoadingSpinner message="Loading game dashboard..." />}>
      <div className="container mx-auto px-4 py-8 pt-24">
        <GameDashboard />
      </div>
    </Suspense>
  </Layout>
);

const DashboardPageWrapper: React.FC = () => (
  <Layout showBreadcrumbs>
    <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              📊 Learning Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="gaming-card hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-muted-foreground text-sm">
                    Monitor your learning achievements and milestones
                  </p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <p className="text-muted-foreground text-sm">
                    Detailed analytics of your performance
                  </p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-semibold mb-2">Achievements</h3>
                  <p className="text-muted-foreground text-sm">
                    Unlock badges and celebrate your progress
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  </Layout>
);

const TestPageWrapper: React.FC<{ component: React.ComponentType; title: string }> = ({ 
  component: Component, 
  title 
}) => (
  <Layout showBreadcrumbs>
    <Suspense fallback={<LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />}>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <Badge variant="outline" className="mb-2">🧪 Testing</Badge>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <Component />
      </div>
    </Suspense>
  </Layout>
);

// Main router configuration
export function AppRouter() {
  return (
    <GameStoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page route - Gaming Version */}
          <Route path="/" element={<LandingPageWrapper />} />
          
          {/* Main App Flow - Approche Pédagogique Complète */}
          <Route path="/lessons" element={<LessonsPageWrapper />} />
          <Route path="/lesson/:lessonId" element={<LessonPageWrapper />} />
          <Route path="/game-lesson" element={<GameLessonEducationalWrapper />} />
          <Route path="/game-lesson-simple" element={<GameLessonSimpleWrapper />} />
          <Route path="/game-lesson-adaptive" element={<GameLessonAdaptiveWrapper />} />
          <Route path="/game-lesson-situation" element={<GameLessonSituationChatWrapper />} />
          {/* Legacy routes temporarily disabled */}
          {/* <Route path="/game-lesson-chat" element={<GameLessonChatZenWrapper />} />
          <Route path="/game-lesson-zen" element={<GameLessonZenWrapper />} />
          <Route path="/game-lesson-advanced" element={<GameLessonAdvancedWrapper />} />
          <Route path="/game-lesson-legacy" element={<GameLessonWrapper />} /> */}
          <Route path="/lesson-complete" element={<LessonCompleteWrapper />} />
          <Route path="/lesson-complete-educational" element={<LessonCompleteEducationalWrapper />} />
          <Route path="/progress" element={<ProgressPageWrapper />} />
          
          {/* Legacy Game routes */}
          <Route path="/game" element={<GamePageWrapper />} />
          <Route path="/dashboard" element={<DashboardPageWrapper />} />
          
          {/* Phase 3 - EdClub Integration Demo */}
          <Route
            path="/phase3"
            element={<TestPageWrapper component={Phase3Demo} title="Phase 3 - EdClub Integration" />}
          />
          <Route
            path="/demo"
            element={<TestPageWrapper component={Phase3Demo} title="Interactive Demo" />}
          />
          
          {/* Test routes */}
          <Route
            path="/theme-validator"
            element={<TestPageWrapper component={ThemeValidator} title="Theme Validator" />}
          />
          <Route
            path="/tailwind-test"
            element={<TestPageWrapper component={TailwindTest} title="Tailwind CSS Test" />}
          />
          <Route
            path="/components-test"
            element={<TestPageWrapper component={TestComponents} title="shadcn/ui Components Test" />}
          />
          
          {/* Redirects for legacy routes */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/play" element={<Navigate to="/lessons" replace />} />
          <Route path="/learn" element={<Navigate to="/lessons" replace />} />
          <Route path="/stats" element={<Navigate to="/progress" replace />} />
          <Route path="/achievements" element={<Navigate to="/progress" replace />} />
          <Route path="/goals" element={<Navigate to="/progress" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GameStoreProvider>
  );
}

AppRouter.displayName = 'AppRouter';

export default AppRouter;