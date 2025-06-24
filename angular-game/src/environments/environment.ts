export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/api/ws',
  appName: 'Dialect Game',
  version: '1.0.0',
  features: {
    voiceRecognition: true,
    offlineMode: false,
    analytics: false
  },
  voice: {
    maxRecordingTime: 30000, // 30 seconds
    silenceThreshold: 1000,  // 1 second
    supportedLanguages: ['fr-FR', 'en-US', 'es-ES', 'de-DE']
  },
  storage: {
    prefix: 'dialect-game-',
    version: '1.0'
  }
};