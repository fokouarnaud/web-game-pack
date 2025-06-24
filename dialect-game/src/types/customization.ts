/**
 * Types pour le système de customisation avancée
 * Task 15: Customisation Avancée - Phase 3
 */

// Types de thèmes
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high_contrast',
  SEPIA = 'sepia',
  CUSTOM = 'custom'
}

// Catégories de couleurs
export enum ColorCategory {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ACCENT = 'accent',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  BACKGROUND = 'background',
  SURFACE = 'surface',
  TEXT = 'text',
  BORDER = 'border'
}

// Types de sons
export enum SoundType {
  CORRECT_ANSWER = 'correct_answer',
  WRONG_ANSWER = 'wrong_answer',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT = 'achievement',
  BUTTON_CLICK = 'button_click',
  NOTIFICATION = 'notification',
  POWER_UP = 'power_up',
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  BACKGROUND_MUSIC = 'background_music',
  AMBIENT = 'ambient',
  TYPING = 'typing'
}

// Types de difficulté adaptive
export enum AdaptiveDifficultyMode {
  DISABLED = 'disabled',
  PERFORMANCE_BASED = 'performance_based',
  TIME_BASED = 'time_based',
  STREAK_BASED = 'streak_based',
  MIXED = 'mixed'
}

// Modes d'apprentissage
export enum LearningMode {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing'
}

// Thème personnalisé
export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  type: ThemeType;
  
  // Couleurs
  colors: ThemeColors;
  
  // Typographie
  typography: ThemeTypography;
  
  // Espacement
  spacing: ThemeSpacing;
  
  // Bordures et rayons
  borders: ThemeBorders;
  
  // Ombres
  shadows: ThemeShadows;
  
  // Animations
  animations: ThemeAnimations;
  
  // Métadonnées
  author: string;
  version: string;
  tags: string[];
  isBuiltIn: boolean;
  isShared: boolean;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  
  // Compatibilité
  minAppVersion: string;
  supportedFeatures: string[];
}

// Couleurs du thème
export interface ThemeColors {
  // Couleurs principales
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  
  // Couleurs sémantiques
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  info: ColorShades;
  
  // Couleurs de fond
  background: {
    default: string;
    paper: string;
    surface: string;
    elevated: string;
  };
  
  // Couleurs de texte
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
    inverse: string;
  };
  
  // Couleurs de bordure
  border: {
    default: string;
    light: string;
    strong: string;
    focus: string;
  };
  
  // Couleurs spécialisées
  overlay: string;
  divider: string;
  highlight: string;
  selection: string;
}

// Nuances de couleur
export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Couleur principale
  600: string;
  700: string;
  800: string;
  900: string;
  A100?: string;
  A200?: string;
  A400?: string;
  A700?: string;
}

// Typographie du thème
export interface ThemeTypography {
  // Familles de polices
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
    display: string;
  };
  
  // Tailles de police
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  // Poids de police
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  
  // Hauteurs de ligne
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Espacement des lettres
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

// Espacement du thème
export interface ThemeSpacing {
  // Espaces de base
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

// Bordures du thème
export interface ThemeBorders {
  // Largeurs de bordure
  width: {
    0: string;
    DEFAULT: string;
    2: string;
    4: string;
    8: string;
  };
  
  // Rayons de bordure
  radius: {
    none: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  
  // Styles de bordure
  style: {
    solid: string;
    dashed: string;
    dotted: string;
    double: string;
  };
}

// Ombres du thème
export interface ThemeShadows {
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
  
  // Ombres colorées
  colored: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Animations du thème
export interface ThemeAnimations {
  // Durées
  duration: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  
  // Fonctions de timing
  timing: {
    linear: string;
    in: string;
    out: string;
    'in-out': string;
  };
  
  // Transitions
  transition: {
    none: string;
    all: string;
    DEFAULT: string;
    colors: string;
    opacity: string;
    shadow: string;
    transform: string;
  };
  
  // Animations personnalisées
  keyframes: {
    [key: string]: {
      [key: string]: any;
    };
  };
}

// Configuration audio
export interface AudioConfiguration {
  id: string;
  name: string;
  description?: string;
  
  // Volume global
  masterVolume: number; // 0-1
  
  // Volumes par catégorie
  volumes: Record<SoundType, number>;
  
  // Sons personnalisés
  customSounds: Record<SoundType, CustomSound>;
  
  // Musique de fond
  backgroundMusic: BackgroundMusicConfig;
  
  // Effets spéciaux
  spatialAudio: boolean;
  reverb: ReverbConfig;
  equalizer: EqualizerConfig;
  
  // Accessibilité
  visualIndicators: boolean;
  hapticFeedback: boolean;
  
  // Métadonnées
  author: string;
  tags: string[];
  isBuiltIn: boolean;
  createdAt: number;
  updatedAt: number;
}

// Son personnalisé
export interface CustomSound {
  id: string;
  name: string;
  type: SoundType;
  
  // Fichier audio
  url: string;
  format: 'mp3' | 'wav' | 'ogg' | 'webm';
  duration: number;
  size: number;
  
  // Propriétés audio
  volume: number;
  pitch: number;
  speed: number;
  loop: boolean;
  
  // Effets
  fadeIn: number;
  fadeOut: number;
  delay: number;
  
  // Conditions de lecture
  triggers: SoundTrigger[];
  conditions: SoundCondition[];
  
  // Métadonnées
  tags: string[];
  author: string;
  license: string;
  attribution?: string;
}

// Déclencheur de son
export interface SoundTrigger {
  event: string;
  element?: string;
  condition?: any;
  probability?: number; // 0-1
}

// Condition de son
export interface SoundCondition {
  type: 'score' | 'level' | 'time' | 'streak' | 'setting';
  operator: 'equals' | 'greater' | 'less' | 'between';
  value: any;
}

// Configuration musique de fond
export interface BackgroundMusicConfig {
  enabled: boolean;
  volume: number;
  tracks: BackgroundTrack[];
  playlistMode: 'sequential' | 'shuffle' | 'single' | 'adaptive';
  fadeTransitions: boolean;
  adaptiveVolume: boolean; // Baisse pendant les exercices
}

// Piste de fond
export interface BackgroundTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  mood: 'calm' | 'energetic' | 'focus' | 'celebration' | 'ambient';
  situations: string[]; // Quand jouer cette piste
  volume: number;
  loop: boolean;
}

// Configuration réverbération
export interface ReverbConfig {
  enabled: boolean;
  type: 'room' | 'hall' | 'cathedral' | 'studio' | 'custom';
  wetness: number; // 0-1
  roomSize: number; // 0-1
  decay: number; // 0-1
}

// Configuration égaliseur
export interface EqualizerConfig {
  enabled: boolean;
  preset: 'flat' | 'bass_boost' | 'treble_boost' | 'vocal' | 'custom';
  bands: EqualizerBand[];
}

// Bande d'égaliseur
export interface EqualizerBand {
  frequency: number; // Hz
  gain: number; // dB
  q: number; // Facteur de qualité
}

// Configuration difficulté adaptive
export interface AdaptiveDifficultyConfig {
  id: string;
  name: string;
  description?: string;
  
  // Mode d'adaptation
  mode: AdaptiveDifficultyMode;
  
  // Sensibilité
  sensitivity: number; // 0-1
  
  // Limites
  minDifficulty: number; // 0-1
  maxDifficulty: number; // 0-1
  
  // Facteurs d'ajustement
  factors: AdaptiveDifficultyFactors;
  
  // Intervalles d'ajustement
  adjustmentInterval: number; // questions
  evaluationPeriod: number; // minutes
  
  // Paramètres spécifiques
  performanceThresholds: PerformanceThresholds;
  adaptationRules: AdaptationRule[];
  
  // Feedback utilisateur
  showDifficultyChanges: boolean;
  explanations: boolean;
  
  // Métadonnées
  author: string;
  isBuiltIn: boolean;
  createdAt: number;
  updatedAt: number;
}

// Facteurs de difficulté adaptive
export interface AdaptiveDifficultyFactors {
  accuracy: number; // Poids de la précision
  speed: number; // Poids de la vitesse
  streak: number; // Poids de la série
  confidence: number; // Poids de la confiance
  engagement: number; // Poids de l'engagement
  fatigue: number; // Poids de la fatigue
}

// Seuils de performance
export interface PerformanceThresholds {
  // Seuils de précision
  accuracyTooLow: number; // < X = trop facile
  accuracyTooHigh: number; // > X = trop difficile
  
  // Seuils de vitesse
  speedTooSlow: number; // > X secondes = trop difficile
  speedTooFast: number; // < X secondes = trop facile
  
  // Seuils de série
  streakTarget: number; // Série cible
  streakTolerance: number; // Tolérance
  
  // Seuils d'engagement
  minEngagement: number; // Engagement minimum
  optimalEngagement: number; // Engagement optimal
}

// Règle d'adaptation
export interface AdaptationRule {
  id: string;
  name: string;
  condition: AdaptationCondition;
  action: AdaptationAction;
  priority: number;
  enabled: boolean;
}

// Condition d'adaptation
export interface AdaptationCondition {
  metric: 'accuracy' | 'speed' | 'streak' | 'engagement' | 'fatigue';
  operator: 'less_than' | 'greater_than' | 'equals' | 'between';
  value: number | [number, number];
  duration?: number; // Sur combien de questions
}

// Action d'adaptation
export interface AdaptationAction {
  type: 'adjust_difficulty' | 'change_question_type' | 'add_hint' | 'remove_distractor';
  magnitude: number; // -1 à 1
  message?: string; // Message à l'utilisateur
}

// Préférences d'apprentissage
export interface LearningPreferences {
  id: string;
  userId: string;
  
  // Style d'apprentissage
  learningStyle: LearningMode;
  preferredPace: 'slow' | 'normal' | 'fast';
  
  // Préférences de contenu
  contentTypes: ContentPreference[];
  difficultyPreference: 'easier' | 'balanced' | 'challenging';
  
  // Préférences d'interaction
  feedbackStyle: 'immediate' | 'delayed' | 'summary';
  hintUsage: 'never' | 'when_stuck' | 'always_available';
  
  // Préférences temporelles
  sessionLength: number; // minutes
  breakFrequency: number; // minutes
  studyTimes: TimeSlot[];
  
  // Préférences motivationnelles
  competitiveMode: boolean;
  gamificationLevel: 'minimal' | 'balanced' | 'maximum';
  achievementNotifications: boolean;
  
  // Préférences d'accessibilité
  accessibility: AccessibilityPreferences;
  
  // Préférences personnalisées
  customSettings: Record<string, any>;
  
  // Métadonnées
  lastUpdated: number;
  version: string;
}

// Préférence de contenu
export interface ContentPreference {
  type: string;
  weight: number; // 0-1
  enabled: boolean;
  customization?: any;
}

// Créneau horaire
export interface TimeSlot {
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  timezone: string;
  enabled: boolean;
}

// Préférences d'accessibilité
export interface AccessibilityPreferences {
  // Vision
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  colorBlindness: ColorBlindnessType;
  
  // Audition
  closedCaptions: boolean;
  signLanguage: boolean;
  audioDescriptions: boolean;
  
  // Moteur
  keyboardNavigation: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  
  // Cognitif
  reducedMotion: boolean;
  simplifiedUI: boolean;
  extendedTimeouts: boolean;
  
  // Personnalisé
  customAccommodations: string[];
}

// Types de daltonisme
export enum ColorBlindnessType {
  NONE = 'none',
  PROTANOPIA = 'protanopia', // Rouge-vert
  DEUTERANOPIA = 'deuteranopia', // Rouge-vert
  TRITANOPIA = 'tritanopia', // Bleu-jaune
  ACHROMATOPSIA = 'achromatopsia' // Monochrome
}

// Configuration exportable
export interface ExportableConfiguration {
  id: string;
  name: string;
  description?: string;
  
  // Composants
  theme?: CustomTheme;
  audio?: AudioConfiguration;
  adaptiveDifficulty?: AdaptiveDifficultyConfig;
  learningPreferences?: LearningPreferences;
  
  // Paramètres de jeu
  gameSettings?: GameCustomSettings;
  
  // Métadonnées
  version: string;
  appVersion: string;
  exportedAt: number;
  author: string;
  tags: string[];
  
  // Validation
  checksum: string;
  signature?: string;
}

// Paramètres de jeu personnalisables
export interface GameCustomSettings {
  // Interface
  showAnimations: boolean;
  particleEffects: boolean;
  backgroundEffects: boolean;
  
  // Gameplay
  autoAdvance: boolean;
  skipIntro: boolean;
  fastMode: boolean;
  
  // Feedback
  vibration: boolean;
  soundEffects: boolean;
  visualFeedback: boolean;
  
  // Performance
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  frameRate: 30 | 60 | 120;
  
  // Avancé
  debugMode: boolean;
  experimentalFeatures: string[];
}

// Éditeur de thème
export interface ThemeEditor {
  // État actuel
  currentTheme: CustomTheme;
  originalTheme: CustomTheme;
  hasChanges: boolean;
  
  // Historique
  history: ThemeSnapshot[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Preview
  previewMode: boolean;
  previewElements: string[];
  
  // Validation
  errors: ThemeValidationError[];
  warnings: ThemeValidationWarning[];
  
  // Export/Import
  exportFormats: string[];
  importSources: string[];
}

// Instantané de thème
export interface ThemeSnapshot {
  id: string;
  theme: CustomTheme;
  timestamp: number;
  description?: string;
}

// Erreur de validation de thème
export interface ThemeValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

// Avertissement de validation de thème
export interface ThemeValidationWarning {
  path: string;
  message: string;
  impact: 'accessibility' | 'performance' | 'compatibility';
  recommendation: string;
}

// État du système de customisation
export interface CustomizationState {
  // Thème actuel
  currentTheme: CustomTheme;
  availableThemes: CustomTheme[];
  
  // Audio
  currentAudioConfig: AudioConfiguration;
  availableAudioConfigs: AudioConfiguration[];
  
  // Difficulté adaptive
  currentAdaptiveConfig: AdaptiveDifficultyConfig;
  availableAdaptiveConfigs: AdaptiveDifficultyConfig[];
  
  // Préférences
  userPreferences: LearningPreferences;
  
  // Éditeurs
  themeEditor: ThemeEditor | null;
  audioEditor: any | null;
  
  // Import/Export
  exportHistory: ExportableConfiguration[];
  importQueue: any[];
  
  // Synchronisation
  cloudSync: boolean;
  lastSync: number;
  
  // Erreurs
  errors: CustomizationError[];
}

// Erreur de customisation
export interface CustomizationError {
  id: string;
  type: 'theme' | 'audio' | 'adaptive' | 'preferences' | 'import' | 'export';
  message: string;
  details?: any;
  timestamp: number;
  resolved: boolean;
}

// Actions de customisation
export type CustomizationAction =
  | { type: 'SET_THEME'; payload: { themeId: string } }
  | { type: 'UPDATE_THEME'; payload: { changes: Partial<CustomTheme> } }
  | { type: 'CREATE_THEME'; payload: { theme: CustomTheme } }
  | { type: 'DELETE_THEME'; payload: { themeId: string } }
  | { type: 'SET_AUDIO_CONFIG'; payload: { configId: string } }
  | { type: 'UPDATE_AUDIO'; payload: { changes: Partial<AudioConfiguration> } }
  | { type: 'SET_ADAPTIVE_CONFIG'; payload: { configId: string } }
  | { type: 'UPDATE_PREFERENCES'; payload: { changes: Partial<LearningPreferences> } }
  | { type: 'EXPORT_CONFIG'; payload: { components: string[]; name: string } }
  | { type: 'IMPORT_CONFIG'; payload: { config: ExportableConfiguration } }
  | { type: 'RESET_TO_DEFAULTS'; payload: {} };

// Constantes
export const CUSTOMIZATION_CONSTANTS = {
  // Thèmes par défaut
  DEFAULT_THEMES: ['light', 'dark', 'high_contrast', 'sepia'],
  
  // Limites
  MAX_CUSTOM_THEMES: 50,
  MAX_CUSTOM_SOUNDS: 100,
  MAX_EXPORT_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Validation
  COLOR_CONTRAST_RATIO: 4.5, // WCAG AA
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 72,
  
  // Audio
  MAX_SOUND_DURATION: 30000, // 30 secondes
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'ogg', 'webm'],
  
  // Performance
  THEME_CACHE_SIZE: 10,
  PREVIEW_DEBOUNCE: 300, // ms
  
  // Stockage
  STORAGE_KEYS: {
    CURRENT_THEME: 'customization_current_theme',
    CUSTOM_THEMES: 'customization_custom_themes',
    AUDIO_CONFIG: 'customization_audio_config',
    ADAPTIVE_CONFIG: 'customization_adaptive_config',
    USER_PREFERENCES: 'customization_user_preferences',
    EXPORT_HISTORY: 'customization_export_history'
  },
  
  // Export
  EXPORT_VERSION: '1.0',
  SUPPORTED_FORMATS: ['json', 'zip'],
  
  // Adaptive Difficulty
  DEFAULT_ADJUSTMENT_INTERVAL: 5, // questions
  DEFAULT_EVALUATION_PERIOD: 10, // minutes
  MIN_SENSITIVITY: 0.1,
  MAX_SENSITIVITY: 1.0
} as const;