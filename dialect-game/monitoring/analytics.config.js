/**
 * Configuration Analytics et métriques pour monitoring production
 * Task 18: Déploiement Production - Phase 4
 */

// Configuration Google Analytics 4
export const GA4_CONFIG = {
  measurementId: process.env.GA4_MEASUREMENT_ID,
  config: {
    // Basic configuration
    page_title: document.title,
    page_location: window.location.href,
    
    // Enhanced ecommerce (pour les futures fonctionnalités premium)
    send_page_view: true,
    anonymize_ip: true,
    
    // Custom dimensions
    custom_map: {
      custom_dimension_1: 'user_type',
      custom_dimension_2: 'language_level',
      custom_dimension_3: 'subscription_type',
      custom_dimension_4: 'device_type',
      custom_dimension_5: 'feature_usage',
    },
    
    // Enhanced measurement
    enhanced_measurement: {
      scroll: true,
      outbound_clicks: true,
      site_search: true,
      video_engagement: true,
      file_downloads: true,
    },
  },
};

// Configuration Mixpanel
export const MIXPANEL_CONFIG = {
  token: process.env.MIXPANEL_TOKEN,
  config: {
    debug: process.env.NODE_ENV !== 'production',
    track_pageview: true,
    persistence: 'localStorage',
    ip: false, // RGPD compliance
    property_blacklist: ['$current_url', '$initial_referrer'],
    
    // Batch configuration
    batch_requests: true,
    batch_size: 50,
    batch_flush_interval_ms: 5000,
  },
};

// Configuration Web Vitals
export const WEB_VITALS_CONFIG = {
  // Core Web Vitals thresholds
  thresholds: {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  },
  
  // Reporting configuration
  reportAllChanges: false,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
};

// Initialiser Google Analytics
export function initGoogleAnalytics() {
  if (!GA4_CONFIG.measurementId) {
    console.warn('[Analytics] Google Analytics ID not configured');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_CONFIG.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_CONFIG.measurementId, GA4_CONFIG.config);

  console.log('[Analytics] Google Analytics initialized');
}

// Initialiser Mixpanel
export function initMixpanel() {
  if (!MIXPANEL_CONFIG.token) {
    console.warn('[Analytics] Mixpanel token not configured');
    return;
  }

  // Load Mixpanel script
  (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);

  // Initialize Mixpanel
  window.mixpanel.init(MIXPANEL_CONFIG.token, MIXPANEL_CONFIG.config);

  console.log('[Analytics] Mixpanel initialized');
}

// Initialiser Web Vitals monitoring
export function initWebVitals() {
  // Dynamic import for Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getINP }) => {
    // Core Web Vitals
    getCLS(onWebVital);
    getFID(onWebVital);
    getLCP(onWebVital);
    
    // Other important metrics
    getFCP(onWebVital);
    getTTFB(onWebVital);
    getINP(onWebVital);

    console.log('[Analytics] Web Vitals monitoring initialized');
  }).catch(error => {
    console.error('[Analytics] Failed to load Web Vitals:', error);
  });
}

// Handler pour les métriques Web Vitals
function onWebVital(metric) {
  const { name, value, rating, delta, id } = metric;
  const threshold = WEB_VITALS_CONFIG.thresholds[name];
  
  // Determiner le rating basé sur nos seuils
  let customRating = 'good';
  if (threshold) {
    if (value > threshold.poor) {
      customRating = 'poor';
    } else if (value > threshold.good) {
      customRating = 'needs-improvement';
    }
  }

  // Envoyer à Google Analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      custom_map: {
        metric_rating: customRating,
        metric_delta: delta,
      },
    });
  }

  // Envoyer à Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track('Web Vital Measured', {
      metric_name: name,
      metric_value: value,
      metric_rating: customRating,
      metric_delta: delta,
      metric_id: id,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent,
    });
  }

  // Envoyer à Sentry si configuré
  if (window.Sentry && customRating === 'poor') {
    window.Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `Poor ${name}: ${value}`,
      level: 'warning',
      data: { name, value, rating: customRating, delta, id },
    });
  }

  console.log(`[Web Vitals] ${name}: ${value} (${customRating})`);
}

// API publique pour tracking custom events
export const analytics = {
  // Identifier un utilisateur
  identify: (userId, traits = {}) => {
    if (window.gtag) {
      window.gtag('config', GA4_CONFIG.measurementId, {
        user_id: userId,
        custom_map: traits,
      });
    }
    
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      window.mixpanel.people.set(traits);
    }
  },

  // Tracker un événement
  track: (eventName, properties = {}) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: properties.category || 'User Interaction',
        event_label: properties.label,
        value: properties.value,
        ...properties,
      });
    }
    
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.pathname,
        page_title: document.title,
      });
    }
    
    console.log(`[Analytics] Event tracked: ${eventName}`, properties);
  },

  // Tracker une page vue
  pageView: (path, title = document.title) => {
    if (window.gtag) {
      window.gtag('config', GA4_CONFIG.measurementId, {
        page_path: path,
        page_title: title,
      });
    }
    
    if (window.mixpanel) {
      window.mixpanel.track('Page Viewed', {
        page_path: path,
        page_title: title,
        referrer: document.referrer,
      });
    }
  },

  // Tracker les erreurs d'application
  trackError: (error, context = {}) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        ...context,
      });
    }
    
    if (window.mixpanel) {
      window.mixpanel.track('Application Error', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    }
  },

  // Tracker les conversions
  trackConversion: (conversionName, value = 0, currency = 'EUR') => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${GA4_CONFIG.measurementId}/${conversionName}`,
        value: value,
        currency: currency,
      });
    }
    
    if (window.mixpanel) {
      window.mixpanel.track('Conversion', {
        conversion_name: conversionName,
        conversion_value: value,
        currency: currency,
      });
    }
  },

  // Tracker l'engagement utilisateur
  trackEngagement: (action, category, label, value) => {
    analytics.track('User Engagement', {
      category: category,
      action: action,
      label: label,
      value: value,
      engagement_time: getEngagementTime(),
    });
  },

  // Tracker les performances de features
  trackFeatureUsage: (featureName, action, properties = {}) => {
    analytics.track('Feature Usage', {
      feature_name: featureName,
      feature_action: action,
      ...properties,
    });
  },

  // Tracker les métriques business
  trackBusinessMetric: (metricName, value, properties = {}) => {
    analytics.track('Business Metric', {
      metric_name: metricName,
      metric_value: value,
      ...properties,
    });
  },
};

// Fonctions utilitaires
function getEngagementTime() {
  return performance.now() - (window.pageLoadTime || 0);
}

// Initialiser tous les systèmes d'analytics
export function initAllAnalytics() {
  try {
    // Store page load time
    window.pageLoadTime = performance.now();
    
    // Initialize systems
    initGoogleAnalytics();
    initMixpanel();
    initWebVitals();
    
    // Set up automatic page view tracking for SPA
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        analytics.pageView(currentPath);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('[Analytics] All analytics systems initialized');
  } catch (error) {
    console.error('[Analytics] Failed to initialize analytics:', error);
  }
}

// Configuration A/B Testing
export const AB_TESTING_CONFIG = {
  // Feature flags pour A/B testing
  features: {
    new_onboarding: {
      enabled: true,
      variants: ['control', 'variant_a', 'variant_b'],
      weights: [0.33, 0.33, 0.34],
      sampleRate: 1.0,
    },
    premium_pricing: {
      enabled: false,
      variants: ['current', 'new_pricing'],
      weights: [0.5, 0.5],
      sampleRate: 0.1,
    },
    collaborative_features: {
      enabled: true,
      variants: ['basic', 'advanced'],
      weights: [0.7, 0.3],
      sampleRate: 1.0,
    },
  },
};

// A/B Testing utilities
export const abTesting = {
  // Obtenir la variante pour un utilisateur
  getVariant: (featureName, userId) => {
    const feature = AB_TESTING_CONFIG.features[featureName];
    if (!feature || !feature.enabled) {
      return 'control';
    }
    
    // Génerer un hash basé sur userId et featureName
    const hash = hashCode(userId + featureName) / 2147483647;
    
    // Vérifier le sample rate
    if (hash > feature.sampleRate) {
      return 'control';
    }
    
    // Assigner une variante basée sur les poids
    let cumulative = 0;
    for (let i = 0; i < feature.variants.length; i++) {
      cumulative += feature.weights[i];
      if (hash <= cumulative) {
        return feature.variants[i];
      }
    }
    
    return 'control';
  },
  
  // Tracker l'exposition à une variante
  trackExposure: (featureName, variant, userId) => {
    analytics.track('A/B Test Exposure', {
      feature_name: featureName,
      variant: variant,
      user_id: userId,
    });
  },
};

// Fonction de hash simple
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default {
  initAllAnalytics,
  analytics,
  abTesting,
  GA4_CONFIG,
  MIXPANEL_CONFIG,
  WEB_VITALS_CONFIG,
  AB_TESTING_CONFIG,
};