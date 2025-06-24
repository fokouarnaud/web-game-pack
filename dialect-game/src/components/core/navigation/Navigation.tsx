/**
 * Enhanced Navigation Component with shadcn/ui and React Router v7
 * Provides consistent navigation with modern UI/UX best practices
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import useNavigation from '../../../hooks/useNavigation';
import { ThemeToggle } from '../../theme/ThemeToggleSimple';

interface NavigationProps {
  showBackButton?: boolean;
  customBackAction?: () => void;
  className?: string;
}

const navigationItems = [
  {
    path: '/',
    label: 'Home',
    icon: '🏠',
    description: 'Landing page'
  },
  {
    path: '/game',
    label: 'Play Game',
    icon: '🎮',
    description: 'Start playing'
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'View progress'
  }
];

export const Navigation: React.FC<NavigationProps> = ({
  showBackButton = true,
  customBackAction,
  className = ''
}) => {
  const { goBack, isOnHome } = useNavigation();
  const location = useLocation();

  const handleBackClick = () => {
    if (customBackAction) {
      customBackAction();
    } else {
      goBack();
    }
  };

  return (
    <nav
      className={cn("flex items-center gap-2", className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {showBackButton && !isOnHome && (
        <Button
          onClick={handleBackClick}
          variant="outline"
          size="sm"
          className="gaming-button"
          aria-label="Go back"
        >
          ← Back
        </Button>
      )}
      
      <div className="flex items-center gap-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "gaming-button touch-optimized",
                isActive && "pointer-events-none"
              )}
            >
              <Link
                to={item.path}
                className="flex items-center gap-1.5"
                aria-label={item.description}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

// Enhanced fixed navigation with glass effect
export const FixedNavigation: React.FC<NavigationProps> = (props) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
      <Card className="glass-container p-2">
        <CardContent className="p-0">
          <Navigation {...props} />
        </CardContent>
      </Card>
      
      {/* Quick actions on the right */}
      <div className="flex gap-2">
        {/* Theme Toggle */}
        <div className="glass p-1 rounded-md">
          <ThemeToggle />
        </div>
        
        <Button
          asChild
          variant="outline"
          size="sm"
          className="glass gaming-button"
        >
          <Link to="/tailwind-test" aria-label="Test Tailwind CSS">
            🎨
          </Link>
        </Button>
        
        <Button
          asChild
          variant="outline"
          size="sm"
          className="glass gaming-button"
        >
          <Link to="/components-test" aria-label="Test Components">
            🔧
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Enhanced breadcrumb navigation
interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
  icon?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav
      className={cn("flex items-center", className)}
      aria-label="Breadcrumb"
    >
      <Card className="glass-card">
        <CardContent className="p-2">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-muted-foreground" aria-hidden="true">
                    /
                  </span>
                )}
                
                {item.isActive ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </Badge>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                  >
                    <Link to={item.path} className="flex items-center gap-1">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </nav>
  );
};

// Mobile-optimized bottom navigation
export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      <Card className="glass-container">
        <CardContent className="p-2">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-col h-auto py-2 px-3 gaming-button touch-optimized",
                    isActive && "pointer-events-none"
                  )}
                >
                  <Link
                    to={item.path}
                    className="flex flex-col items-center gap-1"
                    aria-label={item.description}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Navigation;