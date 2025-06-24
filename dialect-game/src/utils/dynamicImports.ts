/**
 * TDD CYCLE 7 - GREEN PHASE
 * Utilitaires pour le chargement dynamique et code splitting avancé
 */

import React from 'react'

// Types pour le chargement dynamique
interface ComponentModule {
  default: React.ComponentType<any>
}

interface LoadComponentOptions {
  fallback?: React.ComponentType
  timeout?: number
  retries?: number
}

// Cache pour les composants chargés
const componentCache = new Map<string, ComponentModule>()

// Composants disponibles pour le chargement dynamique
const COMPONENT_MAP = {
  'UserProgression': () => import('../components/UserProgression'),
  'MultiplayerLobby': () => import('../components/MultiplayerLobby'),
  'GameVoiceIntegration': () => import('../components/GameVoiceIntegration'),
  'App': () => import('../components/App')
}

/**
 * Charge un composant de manière dynamique avec mise en cache
 */
export async function loadComponent(
  componentName: keyof typeof COMPONENT_MAP,
  options: LoadComponentOptions = {}
): Promise<ComponentModule> {
  const { timeout = 5000, retries = 3 } = options
  
  // Vérifier le cache d'abord
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!
  }
  
  const loadFunction = COMPONENT_MAP[componentName]
  if (!loadFunction) {
    throw new Error(`Component ${componentName} not found`)
  }
  
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startTime = performance.now()
      
      // Chargement avec timeout
      const modulePromise = loadFunction()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Component load timeout')), timeout)
      })
      
      const module = await Promise.race([modulePromise, timeoutPromise])
      const loadTime = performance.now() - startTime
      
      // Log performance
      console.log(`Component ${componentName} loaded in ${loadTime}ms (attempt ${attempt})`)
      
      // Mettre en cache
      componentCache.set(componentName, module)
      
      return module
    } catch (error) {
      lastError = error as Error
      console.warn(`Failed to load component ${componentName} (attempt ${attempt}):`, error)
      
      if (attempt < retries) {
        // Attendre avant retry avec backoff exponentiel
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw new Error(`Failed to load component ${componentName} after ${retries} attempts: ${lastError?.message}`)
}

/**
 * Précharge des composants en arrière-plan
 */
export async function preloadComponents(componentNames: (keyof typeof COMPONENT_MAP)[]): Promise<void> {
  const preloadPromises = componentNames.map(async (name) => {
    try {
      await loadComponent(name)
      console.log(`Preloaded component: ${name}`)
    } catch (error) {
      console.warn(`Failed to preload component: ${name}`, error)
    }
  })
  
  await Promise.allSettled(preloadPromises)
}

/**
 * Crée un composant React avec chargement paresseux
 */
export function createLazyComponent(
  componentName: keyof typeof COMPONENT_MAP,
  options: LoadComponentOptions = {}
): React.ComponentType {
  return React.lazy(async () => {
    const module = await loadComponent(componentName, options)
    return module
  })
}

/**
 * HOC pour le chargement conditionnel de composants
 */
export function withDynamicImport<P extends object>(
  componentName: keyof typeof COMPONENT_MAP,
  fallbackComponent?: React.ComponentType<P>
) {
  return function DynamicComponent(props: P) {
    const [Component, setComponent] = React.useState<React.ComponentType<P> | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)
    
    React.useEffect(() => {
      loadComponent(componentName)
        .then(module => {
          setComponent(() => module.default)
          setLoading(false)
        })
        .catch(err => {
          setError(err)
          setLoading(false)
        })
    }, [])
    
    if (loading) {
      return fallbackComponent ? React.createElement(fallbackComponent, props) : null
    }
    
    if (error) {
      console.error(`Failed to load component ${componentName}:`, error)
      return fallbackComponent ? React.createElement(fallbackComponent, props) : null
    }
    
    if (!Component) {
      return null
    }
    
    return React.createElement(Component, props)
  }
}

/**
 * Utilitaire pour mesurer les performances de chargement
 */
export class ComponentLoadingTracker {
  private metrics = new Map<string, {
    attempts: number
    totalTime: number
    successes: number
    failures: number
  }>()
  
  recordLoad(componentName: string, loadTime: number, success: boolean) {
    const existing = this.metrics.get(componentName) || {
      attempts: 0,
      totalTime: 0,
      successes: 0,
      failures: 0
    }
    
    existing.attempts++
    existing.totalTime += loadTime
    
    if (success) {
      existing.successes++
    } else {
      existing.failures++
    }
    
    this.metrics.set(componentName, existing)
  }
  
  getMetrics(componentName?: string) {
    if (componentName) {
      const metric = this.metrics.get(componentName)
      if (!metric) return null
      
      return {
        ...metric,
        averageLoadTime: metric.totalTime / metric.attempts,
        successRate: metric.successes / metric.attempts
      }
    }
    
    const allMetrics: Record<string, any> = {}
    for (const [name, metric] of this.metrics) {
      allMetrics[name] = {
        ...metric,
        averageLoadTime: metric.totalTime / metric.attempts,
        successRate: metric.successes / metric.attempts
      }
    }
    
    return allMetrics
  }
  
  reset() {
    this.metrics.clear()
  }
}

// Instance globale du tracker
export const loadingTracker = new ComponentLoadingTracker()

/**
 * Hook React pour le chargement dynamique de composants
 */
export function useDynamicComponent(componentName: keyof typeof COMPONENT_MAP) {
  const [component, setComponent] = React.useState<React.ComponentType | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  
  React.useEffect(() => {
    const startTime = performance.now()
    
    loadComponent(componentName)
      .then(module => {
        const loadTime = performance.now() - startTime
        loadingTracker.recordLoad(componentName, loadTime, true)
        setComponent(() => module.default)
        setError(null)
      })
      .catch(err => {
        const loadTime = performance.now() - startTime
        loadingTracker.recordLoad(componentName, loadTime, false)
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [componentName])
  
  return { component, loading, error }
}

/**
 * Nettoie le cache des composants (utile pour les tests)
 */
export function clearComponentCache() {
  componentCache.clear()
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats() {
  return {
    size: componentCache.size,
    components: Array.from(componentCache.keys())
  }
}