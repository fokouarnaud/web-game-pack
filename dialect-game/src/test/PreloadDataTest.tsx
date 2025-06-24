import React, { useEffect } from 'react';
import usePreloadData from '../hooks/usePreloadData';

// Interface pour données test
interface TestData {
  message: string;
  timestamp: number;
}

// Composant de test pour usePreloadData
export const PreloadDataTest: React.FC = () => {
  
  // Configuration du hook avec options complètes
  const {
    data,
    isLoading,
    error,
    lastUpdated,
    isCached,
    preloadData,
    refreshData,
    clearCache,
    performanceMetrics
  } = usePreloadData<TestData>({
    cacheKey: 'test-lesson-data',
    ttl: 60 * 1000, // 1 minute pour test
    retryAttempts: 2,
    retryDelay: 50,
    enablePerformanceTracking: true,
    fallbackData: { message: 'Fallback data', timestamp: 0 }
  });
  
  // Fonction simulant fetch de données
  const mockFetcher = async (): Promise<TestData> => {
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      message: 'Test data loaded successfully!',
      timestamp: Date.now()
    };
  };
  
  // Chargement initial
  useEffect(() => {
    preloadData(mockFetcher);
  }, []);
  
  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Test usePreloadData Hook</h2>
      
      {/* État du chargement */}
      <div className="space-y-2">
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Cached:</strong> {isCached ? 'Yes' : 'No'}</p>
        <p><strong>Last Updated:</strong> {lastUpdated?.toLocaleTimeString() || 'Never'}</p>
      </div>
      
      {/* Données */}
      {data && (
        <div className="bg-green-100 p-3 rounded">
          <p><strong>Data:</strong> {data.message}</p>
          <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
      
      {/* Erreur */}
      {error && (
        <div className="bg-red-100 p-3 rounded">
          <p><strong>Error:</strong> {error.message}</p>
        </div>
      )}
      
      {/* Métriques de performance */}
      <div className="bg-blue-100 p-3 rounded space-y-1">
        <p><strong>Load Time:</strong> {performanceMetrics.loadTime.toFixed(2)}ms</p>
        <p><strong>Cache Hit Rate:</strong> {performanceMetrics.cacheHitRate}%</p>
        <p><strong>Retry Count:</strong> {performanceMetrics.retryCount}</p>
      </div>
      
      {/* Actions */}
      <div className="space-x-2">
        <button 
          onClick={() => refreshData(mockFetcher)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          Refresh
        </button>
        <button 
          onClick={clearCache}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
};

export default PreloadDataTest;