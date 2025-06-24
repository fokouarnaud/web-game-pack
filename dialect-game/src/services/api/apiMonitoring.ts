/**
 * Système de monitoring et analytics des APIs
 * Task 10: APIs Robustesse - Phase 3
 */

import type { ApiErrorType, ApiMetrics, SystemHealth, ApiHealthStatus } from './apiConfig';
import { persistentCache } from './persistentCache';

// Types pour le monitoring
export interface ApiCall {
  id: string;
  endpoint: string;
  method: string;
  url: string;
  timestamp: number;
  duration: number;
  status: number | null;
  success: boolean;
  errorType?: ApiErrorType;
  cached: boolean;
  retryCount: number;
  userAgent?: string;
  sessionId: string;
}

export interface EndpointHealth {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  lastError?: {
    timestamp: number;
    message: string;
    type: ApiErrorType;
  };
  trends: {
    hour: number[];
    day: number[];
    week: number[];
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: 'error_rate' | 'response_time' | 'availability' | 'custom';
  threshold: number;
  duration: number; // en ms
  enabled: boolean;
  endpoints: string[];
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'console' | 'notification' | 'callback';
  config: any;
}

export interface Alert {
  id: string;
  ruleId: string;
  endpoint: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

// Configuration du monitoring
export interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0
  maxStoredCalls: number;
  maxStoredAlerts: number;
  healthCheckInterval: number;
  alertCheckInterval: number;
  persistMetrics: boolean;
}

const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabled: true,
  sampleRate: 1.0, // 100% en développement
  maxStoredCalls: 10000,
  maxStoredAlerts: 1000,
  healthCheckInterval: 30000, // 30 secondes
  alertCheckInterval: 15000, // 15 secondes
  persistMetrics: true,
};

export class ApiMonitoring {
  private config: MonitoringConfig;
  private calls: ApiCall[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private healthCheckTimer?: NodeJS.Timeout;
  private alertCheckTimer?: NodeJS.Timeout;
  private sessionId: string;
  private startTime: number;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    // Charger les données persistées
    this.loadPersistedData();
    
    // Démarrer les timers
    this.startHealthChecks();
    this.startAlertChecks();
    
    // Nettoyer à la fermeture
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });

    // Configurer les alertes par défaut
    this.setupDefaultAlerts();
  }

  // Enregistrement d'un appel API
  recordApiCall(call: Omit<ApiCall, 'id' | 'sessionId'>): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const apiCall: ApiCall = {
      ...call,
      id: this.generateCallId(),
      sessionId: this.sessionId,
    };

    this.calls.push(apiCall);

    // Maintenir la limite de stockage
    if (this.calls.length > this.config.maxStoredCalls) {
      this.calls = this.calls.slice(-this.config.maxStoredCalls);
    }

    // Persister si activé
    if (this.config.persistMetrics) {
      this.persistCall(apiCall);
    }

    // Vérifier les alertes en temps réel pour les erreurs critiques
    if (!apiCall.success && this.shouldTriggerImmedateAlert(apiCall)) {
      this.checkAlertsForEndpoint(apiCall.endpoint);
    }
  }

  // Obtenir les métriques pour un endpoint
  getEndpointMetrics(endpoint: string, timeWindow: number = 3600000): ApiMetrics {
    const now = Date.now();
    const calls = this.calls.filter(
      call => call.endpoint === endpoint && now - call.timestamp <= timeWindow
    );

    const totalRequests = calls.length;
    const successRequests = calls.filter(call => call.success).length;
    const failedRequests = totalRequests - successRequests;
    
    const latencies = calls.map(call => call.duration);
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0;

    const errorsByType = calls
      .filter(call => !call.success && call.errorType)
      .reduce((acc, call) => {
        const type = call.errorType!;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<ApiErrorType, number>);

    return {
      totalRequests,
      successRequests,
      failedRequests,
      averageLatency,
      errorsByType,
      lastResetTime: this.startTime,
    };
  }

  // Obtenir la santé d'un endpoint
  getEndpointHealth(endpoint: string): EndpointHealth {
    const metrics = this.getEndpointMetrics(endpoint);
    const recentCalls = this.calls.filter(
      call => call.endpoint === endpoint && Date.now() - call.timestamp <= 300000 // 5 minutes
    );

    // Calculer les percentiles de temps de réponse
    const latencies = recentCalls.map(call => call.duration).sort((a, b) => a - b);
    const responseTime = {
      avg: metrics.averageLatency,
      p50: this.percentile(latencies, 0.5),
      p95: this.percentile(latencies, 0.95),
      p99: this.percentile(latencies, 0.99),
    };

    // Calculer le taux d'erreur
    const errorRate = metrics.totalRequests > 0 
      ? metrics.failedRequests / metrics.totalRequests 
      : 0;

    // Déterminer le statut
    let status: 'healthy' | 'degraded' | 'down';
    if (errorRate > 0.5 || responseTime.avg > 10000) {
      status = 'down';
    } else if (errorRate > 0.1 || responseTime.avg > 5000) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    // Calculer l'uptime
    const uptime = this.calculateUptime(endpoint);

    // Dernière erreur
    const lastErrorCall = recentCalls
      .filter(call => !call.success)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    const lastError = lastErrorCall ? {
      timestamp: lastErrorCall.timestamp,
      message: `${lastErrorCall.status || 'Network'} error`,
      type: lastErrorCall.errorType || 'UNKNOWN_ERROR' as ApiErrorType,
    } : undefined;

    // Tendances (simplifié pour l'exemple)
    const trends = {
      hour: this.calculateTrend(endpoint, 3600000, 12), // 12 points sur 1 heure
      day: this.calculateTrend(endpoint, 86400000, 24), // 24 points sur 1 jour
      week: this.calculateTrend(endpoint, 604800000, 7), // 7 points sur 1 semaine
    };

    return {
      endpoint,
      status,
      uptime,
      responseTime,
      errorRate,
      lastError,
      trends,
    };
  }

  // Obtenir la santé globale du système
  getSystemHealth(): SystemHealth {
    const endpoints = ['dictionary', 'translate', 'unsplash', 'pexels'];
    const endpointHealths = endpoints.reduce((acc, endpoint) => {
      acc[endpoint] = this.convertToApiHealthStatus(this.getEndpointHealth(endpoint));
      return acc;
    }, {} as Record<string, ApiHealthStatus>);

    // Calculer le score global
    const healthyCount = Object.values(endpointHealths).filter(h => h.healthy).length;
    const score = healthyCount / endpoints.length;

    return {
      dictionary: endpointHealths.dictionary,
      translate: endpointHealths.translate,
      unsplash: endpointHealths.unsplash,
      pexels: endpointHealths.pexels,
      overall: {
        healthy: score >= 0.75, // 75% des endpoints doivent être sains
        score,
        lastUpdate: Date.now(),
      },
    };
  }

  // Gestion des alertes
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateAlertRuleId(),
    };
    
    this.alertRules.push(alertRule);
    return alertRule.id;
  }

  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.alertRules.splice(index, 1);
      return true;
    }
    return false;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  // Méthodes privées
  private setupDefaultAlerts(): void {
    // Alerte pour taux d'erreur élevé
    this.addAlertRule({
      name: 'High Error Rate',
      condition: 'error_rate',
      threshold: 0.1, // 10%
      duration: 300000, // 5 minutes
      enabled: true,
      endpoints: ['dictionary', 'translate', 'unsplash', 'pexels'],
      actions: [
        { type: 'console', config: { level: 'warn' } },
      ],
    });

    // Alerte pour temps de réponse lent
    this.addAlertRule({
      name: 'Slow Response Time',
      condition: 'response_time',
      threshold: 5000, // 5 secondes
      duration: 300000, // 5 minutes
      enabled: true,
      endpoints: ['dictionary', 'translate'],
      actions: [
        { type: 'console', config: { level: 'info' } },
      ],
    });
  }

  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private startAlertChecks(): void {
    if (this.alertCheckTimer) {
      clearInterval(this.alertCheckTimer);
    }

    this.alertCheckTimer = setInterval(() => {
      this.checkAlerts();
    }, this.config.alertCheckInterval);
  }

  private performHealthCheck(): void {
    // Effectuer des vérifications de santé périodiques
    const systemHealth = this.getSystemHealth();
    
    if (!systemHealth.overall.healthy) {
      console.warn('System health degraded:', systemHealth);
    }
  }

  private checkAlerts(): void {
    for (const endpoint of ['dictionary', 'translate', 'unsplash', 'pexels']) {
      this.checkAlertsForEndpoint(endpoint);
    }
  }

  private checkAlertsForEndpoint(endpoint: string): void {
    const relevantRules = this.alertRules.filter(
      rule => rule.enabled && rule.endpoints.includes(endpoint)
    );

    for (const rule of relevantRules) {
      const shouldAlert = this.evaluateAlertRule(rule, endpoint);
      
      if (shouldAlert && !this.hasActiveAlert(rule.id, endpoint)) {
        this.triggerAlert(rule, endpoint);
      }
    }
  }

  private evaluateAlertRule(rule: AlertRule, endpoint: string): boolean {
    const metrics = this.getEndpointMetrics(endpoint, rule.duration);
      switch (rule.condition) {
      case 'error_rate': {
        const errorRate = metrics.totalRequests > 0 
          ? metrics.failedRequests / metrics.totalRequests 
          : 0;
        return errorRate > rule.threshold;
      }
        
      case 'response_time':
        return metrics.averageLatency > rule.threshold;
        
      case 'availability': {
        const availability = metrics.totalRequests > 0 
          ? metrics.successRequests / metrics.totalRequests 
          : 1;
        return availability < rule.threshold;
      }
        
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, endpoint: string): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      endpoint,
      message: `${rule.name} triggered for ${endpoint}`,
      severity: this.calculateSeverity(rule, endpoint),
      timestamp: Date.now(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Exécuter les actions
    for (const action of rule.actions) {
      this.executeAlertAction(action, alert);
    }

    // Maintenir la limite de stockage
    if (this.alerts.length > this.config.maxStoredAlerts) {
      this.alerts = this.alerts.slice(-this.config.maxStoredAlerts);
    }
  }

  private executeAlertAction(action: AlertAction, alert: Alert): void {
    switch (action.type) {
      case 'console':
        const level = action.config?.level || 'warn';
        const logMethod = level === 'error' ? console.error
                        : level === 'warn' ? console.warn
                        : level === 'info' ? console.info
                        : console.log;
        logMethod(`[API Alert] ${alert.message}`);
        break;
        
      case 'notification':
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('API Alert', {
            body: alert.message,
            icon: '/favicon.ico',
          });
        }
        break;
        
      case 'callback':
        if (typeof action.config?.callback === 'function') {
          action.config.callback(alert);
        }
        break;
    }
  }

  // Méthodes utilitaires
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const index = Math.ceil(values.length * p) - 1;
    return values[Math.max(0, index)] || 0;
  }

  private calculateUptime(endpoint: string): number {
    const recentCalls = this.calls.filter(
      call => call.endpoint === endpoint && Date.now() - call.timestamp <= 3600000 // 1 heure
    );

    if (recentCalls.length === 0) return 1;

    const successfulCalls = recentCalls.filter(call => call.success).length;
    return successfulCalls / recentCalls.length;
  }

  private calculateTrend(endpoint: string, timeWindow: number, points: number): number[] {
    const now = Date.now();
    const pointDuration = timeWindow / points;
    const trend: number[] = [];

    for (let i = 0; i < points; i++) {
      const startTime = now - timeWindow + (i * pointDuration);
      const endTime = startTime + pointDuration;
      
      const pointCalls = this.calls.filter(
        call => call.endpoint === endpoint && 
               call.timestamp >= startTime && 
               call.timestamp < endTime
      );

      const successRate = pointCalls.length > 0 
        ? pointCalls.filter(call => call.success).length / pointCalls.length 
        : 1;

      trend.push(successRate);
    }

    return trend;
  }

  private convertToApiHealthStatus(health: EndpointHealth): ApiHealthStatus {
    return {
      healthy: health.status === 'healthy',
      latency: health.responseTime.avg,
      lastCheck: Date.now(),
      errorRate: health.errorRate,
      availabilityScore: health.uptime,
    };
  }

  private shouldTriggerImmedateAlert(call: ApiCall): boolean {
    // Déclencher une alerte immédiate pour certains types d'erreurs
    return call.status === 500 || call.status === 503 || call.errorType === 'NETWORK_ERROR';
  }

  private hasActiveAlert(ruleId: string, endpoint: string): boolean {
    return this.alerts.some(
      alert => alert.ruleId === ruleId && 
              alert.endpoint === endpoint && 
              !alert.resolved &&
              Date.now() - alert.timestamp < 300000 // 5 minutes
    );
  }

  private calculateSeverity(rule: AlertRule, endpoint: string): Alert['severity'] {
    const metrics = this.getEndpointMetrics(endpoint);
    
    if (rule.condition === 'error_rate' && metrics.failedRequests / metrics.totalRequests > 0.5) {
      return 'critical';
    }
    
    if (rule.condition === 'response_time' && metrics.averageLatency > 10000) {
      return 'high';
    }
    
    return 'medium';
  }

  private async persistCall(call: ApiCall): Promise<void> {
    try {
      const key = `api_call_${call.id}`;
      await persistentCache.set(key, call, 86400000, 'monitoring'); // 24 heures
    } catch (error) {
      console.warn('Failed to persist API call:', error);
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      // Charger les appels persistés (simplifié pour l'exemple)
      const stats = await persistentCache.getStats();
      console.log('Loaded persisted monitoring data:', stats);
    } catch (error) {
      console.warn('Failed to load persisted monitoring data:', error);
    }
  }

  // Nettoyage
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    if (this.alertCheckTimer) {
      clearInterval(this.alertCheckTimer);
    }
    
    // Persister les données finales
    if (this.config.persistMetrics) {
      // Sauvegarder les métriques importantes
    }
  }

  // API publique pour l'administration
  getDebugInfo() {
    return {
      config: this.config,
      sessionId: this.sessionId,
      startTime: this.startTime,
      callsCount: this.calls.length,
      alertsCount: this.alerts.length,
      alertRulesCount: this.alertRules.length,
    };
  }
}

// Instance globale
export const apiMonitoring = new ApiMonitoring();