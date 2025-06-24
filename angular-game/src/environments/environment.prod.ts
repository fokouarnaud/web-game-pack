export const environment = {
  production: true,
  apiUrl: 'https://api.dialectgame.com/api',
  wsUrl: 'wss://api.dialectgame.com/api/ws',
  appName: 'Dialect Game',
  version: '1.0.0',
  features: {
    voiceRecognition: true,
    offlineMode: true,
    analytics: true
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