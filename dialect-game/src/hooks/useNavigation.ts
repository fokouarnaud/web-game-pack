/**
 * Custom Navigation Hook for React Router v7
 * Provides navigation utilities and route management
 */

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

export interface RouteInfo {
  path: string;
  isActive: boolean;
  params: Record<string, string | undefined>;
}

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Navigation functions
  const goToHome = useCallback((options?: NavigationOptions) => {
    navigate('/', options);
  }, [navigate]);

  const goToGame = useCallback((options?: NavigationOptions) => {
    navigate('/game', options);
  }, [navigate]);

  const goToDashboard = useCallback((options?: NavigationOptions) => {
    navigate('/dashboard', options);
  }, [navigate]);

  const goToMultiplayer = useCallback((options?: NavigationOptions) => {
    navigate('/multiplayer', options);
  }, [navigate]);

  const goToTest = useCallback((options?: NavigationOptions) => {
    navigate('/test', options);
  }, [navigate]);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  // Route information
  const currentRoute: RouteInfo = useMemo(() => ({
    path: location.pathname,
    isActive: true,
    params,
  }), [location.pathname, params]);

  // Route checkers
  const isOnRoute = useCallback((path: string): boolean => {
    return location.pathname === path;
  }, [location.pathname]);

  const isOnHome = useMemo(() => isOnRoute('/'), [isOnRoute]);
  const isOnGame = useMemo(() => isOnRoute('/game'), [isOnRoute]);
  const isOnDashboard = useMemo(() => isOnRoute('/dashboard'), [isOnRoute]);
  const isOnMultiplayer = useMemo(() => isOnRoute('/multiplayer'), [isOnRoute]);
  const isOnTest = useMemo(() => isOnRoute('/test'), [isOnRoute]);

  // Query parameters
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const getQueryParam = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  const setQueryParam = useCallback((key: string, value: string, options?: NavigationOptions) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set(key, value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, options);
  }, [navigate, location.pathname, location.search]);

  const removeQueryParam = useCallback((key: string, options?: NavigationOptions) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete(key);
    const search = newSearchParams.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ''}`, options);
  }, [navigate, location.pathname, location.search]);

  // Navigation with state
  const navigateWithState = useCallback((path: string, state: any, options?: NavigationOptions) => {
    navigate(path, { ...options, state });
  }, [navigate]);

  return {
    // Navigation functions
    goToHome,
    goToGame,
    goToDashboard,
    goToMultiplayer,
    goToTest,
    goBack,
    goForward,
    navigateWithState,
    
    // Route information
    currentRoute,
    isOnRoute,
    isOnHome,
    isOnGame,
    isOnDashboard,
    isOnMultiplayer,
    isOnTest,
    
    // Query parameters
    searchParams,
    getQueryParam,
    setQueryParam,
    removeQueryParam,
    
    // Raw router hooks
    navigate,
    location,
    params,
  };
}

export default useNavigation;