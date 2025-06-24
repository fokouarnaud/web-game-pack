/**
 * Tableau de bord API pour monitoring en temps réel
 * Task 10: APIs Robustesse - Phase 3
 */

import React, { useState, useEffect } from 'react';
import { EnhancedCard } from './ui/enhanced-card';
import { EnhancedButton } from './ui/enhanced-button';
import { robustHttpClient } from '../services/api/robustHttpClient';
import { apiMonitoring } from '../services/api/apiMonitoring';
import { persistentCache } from '../services/api/persistentCache';

interface ApiDashboardProps {
  className?: string;
}

export const ApiDashboard: React.FC<ApiDashboardProps> = ({ className = '' }) => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [health, cache, activeAlerts, debug] = await Promise.all([
        robustHttpClient.getSystemHealth(),
        robustHttpClient.getPersistentCacheStats(),
        robustHttpClient.getActiveAlerts(),
        robustHttpClient.getDebugInfo(),
      ]);
      
      setSystemHealth(health);
      setCacheStats(cache);
      setAlerts(activeAlerts);
      setDebugInfo(debug);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    try {
      await robustHttpClient.clearPersistentCache();
      await refreshData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthScore = (score: number) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.7) return 'Good';
    if (score >= 0.5) return 'Fair';
    return 'Poor';
  };

  if (!systemHealth) {
    return (
      <EnhancedCard className={className} variant="elevated" loading>
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">Loading API Dashboard...</div>
        </div>
      </EnhancedCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API Monitoring Dashboard
        </h2>
        <EnhancedButton
          onClick={refreshData}
          loading={isRefreshing}
          variant="outline"
          size="sm"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Refresh
        </EnhancedButton>
      </div>

      {/* System Health Overview */}
      <EnhancedCard variant="glass" className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            systemHealth.overall.healthy ? 'bg-green-500' : 'bg-red-500'
          }`} />
          System Health
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(systemHealth).map(([key, value]: [string, any]) => {
            if (key === 'overall') return null;
            
            return (
              <div key={key} className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {key}
                </div>
                <div className={`text-lg font-bold ${value.healthy ? 'text-green-600' : 'text-red-600'}`}>
                  {value.healthy ? 'Healthy' : 'Degraded'}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(value.latency)}ms avg
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-lg font-bold text-blue-600">
              {getHealthScore(systemHealth.overall.score)} ({Math.round(systemHealth.overall.score * 100)}%)
            </span>
          </div>
        </div>
      </EnhancedCard>

      {/* Cache Statistics */}
      {cacheStats && (
        <EnhancedCard variant="interactive" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Cache Performance</h3>
            <EnhancedButton
              onClick={handleClearCache}
              variant="destructive"
              size="sm"
            >
              Clear Cache
            </EnhancedButton>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheStats.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(cacheStats.hitRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(cacheStats.totalSize / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {cacheStats.oldestEntry ? 
                  Math.round((Date.now() - cacheStats.oldestEntry) / 1000 / 60) : 0}m
              </div>
              <div className="text-sm text-gray-600">Oldest Entry</div>
            </div>
          </div>
        </EnhancedCard>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <EnhancedCard variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Active Alerts ({alerts.length})
          </h3>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.endpoint} • {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <EnhancedCard variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Robust Client</h4>
              <div className="text-sm space-y-1">
                <div>Cache Size: {debugInfo.robustClient?.cacheSize || 0}</div>
                <div>Monitoring: {debugInfo.robustClient?.config?.monitoring?.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Persistent Cache</h4>
              <div className="text-sm space-y-1">
                <div>Hits: {debugInfo.persistentCache?.hits || 0}</div>
                <div>Misses: {debugInfo.persistentCache?.misses || 0}</div>
                <div>Hit Rate: {Math.round((debugInfo.persistentCache?.hitRate || 0) * 100)}%</div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Monitoring</h4>
              <div className="text-sm space-y-1">
                <div>Session ID: {debugInfo.monitoring?.sessionId?.slice(-8) || 'N/A'}</div>
                <div>Calls: {debugInfo.monitoring?.callsCount || 0}</div>
                <div>Alerts: {debugInfo.monitoring?.alertsCount || 0}</div>
              </div>
            </div>
          </div>
        </EnhancedCard>
      )}
    </div>
  );
};

export default ApiDashboard;