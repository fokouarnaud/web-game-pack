/**
 * Types pour le système de reconnaissance vocale avancée
 * Task 21: Reconnaissance Vocale Avancée - Phase 5
 */

// Technologies de reconnaissance vocale
export enum SpeechProvider {
  WEB_SPEECH_API = 'web_speech_api',
  GOOGLE_SPEECH = 'google_speech',
  AZURE_SPEECH = 'azure_speech',
  AWS_TRANSCRIBE = 'aws_transcribe',
  IBM_SPEECH = 'ibm_speech',
  MOZILLA_DEEPSPEECH = 'mozilla_deepspeech'
}

// Langues supportées
export enum SpeechLanguage {
  FRENCH_FR = 'fr-FR',
  ENGLISH_US = 'en-US',
  ENGLISH_GB = 'en-GB',
  SPANISH_ES = 'es-ES',
  GERMAN_DE = 'de-DE',
  ITALIAN_IT = 'it-IT',
  PORTUGUESE_PT = 'pt-PT'
}

// Types d'exercices de pronunciation
export enum PronunciationExerciseType {
  WORD_REPETITION = 'word_repetition',
  SENTENCE_READING = 'sentence_reading',
  PHONEME_PRACTICE = 'phoneme_practice',
  INTONATION_PRACTICE = 'intonation_practice',
  RHYTHM_PRACTICE = 'rhythm_practice',
  ACCENT_REDUCTION = 'accent_reduction',
  CONVERSATION_PRACTICE = 'conversation_practice'
}

// Niveaux de pronunciation
export enum PronunciationLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  NATIVE_LIKE = 'native_like'
}

// Types d'accents
export enum AccentType {
  STANDARD = 'standard',
  REGIONAL = 'regional',
  FOREIGN = 'foreign',
  PROFESSIONAL = 'professional',
  CASUAL = 'casual'
}

// Émotions détectables dans la voix
export enum VoiceEmotion {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  EXCITED = 'excited',
  NERVOUS = 'nervous',
  CONFIDENT = 'confident',
  FRUSTRATED = 'frustrated',
  CALM = 'calm',
  ENTHUSIASTIC = 'enthusiastic'
}

// Caractéristiques phonétiques
export enum PhonemeCategory {
  VOWELS = 'vowels',
  CONSONANTS = 'consonants',
  DIPHTHONGS = 'diphthongs',
  NASALS = 'nasals',
  FRICATIVES = 'fricatives',
  PLOSIVES = 'plosives',
  LIQUIDS = 'liquids',
  GLIDES = 'glides'
}

// Configuration de reconnaissance vocale
export interface SpeechRecognitionConfig {
  id: string;
  provider: SpeechProvider;
  language: SpeechLanguage;
  targetAccent: AccentType;
  
  // Paramètres de reconnaissance
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  
  // Qualité audio
  sampleRate: number;
  channels: number;
  bitRate: number;
  
  // Seuils de détection
  confidenceThreshold: number;
  volumeThreshold: number;
  silenceTimeout: number; // ms
  
  // Fonctionnalités avancées
  enableEmotionDetection: boolean;
  enablePronunciationAnalysis: boolean;
  enableIntonationAnalysis: boolean;
  enableAccentCoaching: boolean;
  
  // Personnalisation
  adaptToUser: boolean;
  learningMode: boolean;
  feedbackLevel: 'minimal' | 'moderate' | 'detailed';
  
  // Métadonnées
  createdAt: number;
  updatedAt: number;
}

// Session de reconnaissance vocale
export interface SpeechRecognitionSession {
  id: string;
  configId: string;
  userId: string;
  exerciseId?: string;
  
  // État de la session
  status: SessionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  
  // Enregistrements
  recordings: AudioRecording[];
  transcriptions: Transcription[];
  analyses: PronunciationAnalysis[];
  
  // Progression temps réel
  liveMetrics: LiveSpeechMetrics;
  feedback: SpeechFeedback[];
  
  // Résultats finaux
  finalAssessment?: SpeechAssessment;
  improvements: ImprovementSuggestion[];
  achievements: SpeechAchievement[];
  
  // Métadonnées
  metadata: SessionMetadata;
}

// Statut de session
export enum SessionStatus {
  INITIALIZING = 'initializing',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

// Enregistrement audio
export interface AudioRecording {
  id: string;
  sessionId: string;
  
  // Données audio
  audioBlob: Blob;
  duration: number; // ms
  fileSize: number; // bytes
  mimeType: string;
  
  // Qualité audio
  quality: AudioQuality;
  waveform: WaveformData;
  
  // Timestamps
  startTime: number;
  endTime: number;
  
  // Contexte
  context: RecordingContext;
  
  // Processing
  isProcessed: boolean;
  processingTime?: number;
}

// Qualité audio
export interface AudioQuality {
  overall: number; // 0-1
  clarity: number; // 0-1
  volume: number; // 0-1
  noise: number; // 0-1
  distortion: number; // 0-1
  
  // Métriques techniques
  snr: number; // Signal-to-noise ratio
  thd: number; // Total harmonic distortion
  dynamicRange: number;
  
  // Recommandations
  isAcceptable: boolean;
  issues: AudioIssue[];
  suggestions: string[];
}

// Problème audio
export interface AudioIssue {
  type: 'volume' | 'noise' | 'distortion' | 'clipping' | 'silence';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timeRange?: { start: number; end: number };
  suggestion: string;
}

// Données de forme d'onde
export interface WaveformData {
  samples: number[];
  peaks: number[];
  rms: number[];
  fundamentalFrequency: number[];
  spectralCentroid: number[];
}

// Contexte d'enregistrement
export interface RecordingContext {
  exerciseType: PronunciationExerciseType;
  targetText?: string;
  targetPhonemes?: string[];
  difficulty: PronunciationLevel;
  environment: RecordingEnvironment;
  deviceInfo: AudioDeviceInfo;
}

// Environnement d'enregistrement
export interface RecordingEnvironment {
  noiseLevel: number; // dB
  roomType: 'quiet' | 'normal' | 'noisy' | 'outdoor';
  acoustics: 'good' | 'average' | 'poor';
  interruptions: Interruption[];
}

// Interruption
export interface Interruption {
  type: 'background_noise' | 'silence' | 'overlap' | 'device_issue';
  startTime: number;
  endTime: number;
  severity: 'low' | 'medium' | 'high';
}

// Information dispositif audio
export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  capabilities: MediaTrackCapabilities;
  settings: MediaTrackSettings;
}

// Transcription
export interface Transcription {
  id: string;
  recordingId: string;
  
  // Contenu transcrit
  text: string;
  confidence: number; // 0-1
  alternatives: TranscriptionAlternative[];
  
  // Segmentation
  words: WordTranscription[];
  phrases: PhraseTranscription[];
  
  // Timing
  processingTime: number; // ms
  provider: SpeechProvider;
  
  // Métadonnées
  language: SpeechLanguage;
  metadata: TranscriptionMetadata;
}

// Alternative de transcription
export interface TranscriptionAlternative {
  text: string;
  confidence: number;
  likelihood: number;
}

// Transcription de mot
export interface WordTranscription {
  word: string;
  confidence: number;
  startTime: number; // ms
  endTime: number; // ms
  phonemes: PhonemeTranscription[];
  stress: StressPattern;
}

// Transcription de phonème
export interface PhonemeTranscription {
  phoneme: string;
  ipa: string; // International Phonetic Alphabet
  confidence: number;
  startTime: number;
  endTime: number;
  quality: PhonemeQuality;
}

// Qualité de phonème
export interface PhonemeQuality {
  accuracy: number; // 0-1
  clarity: number; // 0-1
  duration: number; // ms
  pitch: number; // Hz
  formants: number[]; // F1, F2, F3, etc.
  issues: PhonemeIssue[];
}

// Problème de phonème
export interface PhonemeIssue {
  type: 'substitution' | 'deletion' | 'insertion' | 'distortion';
  expected: string;
  actual: string;
  severity: 'minor' | 'moderate' | 'severe';
  explanation: string;
}

// Pattern d'accent
export interface StressPattern {
  syllables: SyllableStress[];
  overall: 'correct' | 'incorrect' | 'partial';
  naturalness: number; // 0-1
}

// Accent de syllabe
export interface SyllableStress {
  syllable: string;
  isStressed: boolean;
  expectedStress: boolean;
  intensity: number; // 0-1
  pitch: number; // Hz
  duration: number; // ms
}

// Transcription de phrase
export interface PhraseTranscription {
  phrase: string;
  confidence: number;
  startTime: number;
  endTime: number;
  intonation: IntonationPattern;
  rhythm: RhythmPattern;
}

// Pattern d'intonation
export interface IntonationPattern {
  type: 'rising' | 'falling' | 'flat' | 'rising_falling' | 'falling_rising';
  naturalness: number; // 0-1
  pitchRange: { min: number; max: number }; // Hz
  contour: PitchContour[];
  appropriateness: number; // 0-1 pour le contexte
}

// Contour de hauteur
export interface PitchContour {
  time: number; // ms
  frequency: number; // Hz
  confidence: number;
}

// Pattern de rythme
export interface RhythmPattern {
  tempo: number; // syllables per minute
  regularity: number; // 0-1
  pauses: PauseInfo[];
  naturalness: number; // 0-1
}

// Information de pause
export interface PauseInfo {
  startTime: number;
  duration: number;
  type: 'natural' | 'hesitation' | 'breath' | 'thinking';
  appropriateness: number; // 0-1
}

// Métadonnées de transcription
export interface TranscriptionMetadata {
  modelVersion: string;
  processingDate: number;
  audioQuality: number;
  backgroundNoise: number;
  speakerCount: number;
  language: SpeechLanguage;
  customVocabulary?: string[];
}

// Analyse de pronunciation
export interface PronunciationAnalysis {
  id: string;
  transcriptionId: string;
  
  // Scores globaux
  overallScore: number; // 0-1
  accuracy: number; // 0-1
  fluency: number; // 0-1
  completeness: number; // 0-1
  
  // Analyses détaillées
  phonemeAnalysis: PhonemeAnalysisResult[];
  wordAnalysis: WordAnalysisResult[];
  prosodyAnalysis: ProsodyAnalysisResult;
  
  // Comparaison avec natif
  nativeComparison: NativeComparison;
  
  // Détection d'accent
  accentDetection: AccentDetectionResult;
  
  // Émotions détectées
  emotionAnalysis: EmotionAnalysisResult;
  
  // Recommandations
  recommendations: PronunciationRecommendation[];
  
  // Métadonnées
  analysisTime: number;
  confidence: number;
}

// Résultat d'analyse de phonème
export interface PhonemeAnalysisResult {
  phoneme: string;
  ipa: string;
  category: PhonemeCategory;
  
  // Scores
  accuracy: number;
  clarity: number;
  duration: number;
  
  // Problèmes détectés
  issues: PhonemeIssue[];
  
  // Suggestions d'amélioration
  improvements: PhonemeImprovement[];
  
  // Comparaison native
  nativeExample?: AudioReference;
}

// Amélioration de phonème
export interface PhonemeImprovement {
  type: 'articulation' | 'tongue_position' | 'lip_shape' | 'airflow' | 'voicing';
  description: string;
  exercise: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
}

// Référence audio
export interface AudioReference {
  url: string;
  speaker: 'native_male' | 'native_female' | 'learner_model';
  accent: AccentType;
  quality: 'high' | 'medium' | 'low';
}

// Résultat d'analyse de mot
export interface WordAnalysisResult {
  word: string;
  pronunciation: string; // IPA
  
  // Scores
  accuracy: number;
  stress: number;
  rhythm: number;
  
  // Problèmes
  stressErrors: StressError[];
  rhythmErrors: RhythmError[];
  
  // Suggestions
  practiceExercises: string[];
}

// Erreur d'accent
export interface StressError {
  syllable: number; // index
  expected: boolean;
  actual: boolean;
  impact: 'low' | 'medium' | 'high';
  explanation: string;
}

// Erreur de rythme
export interface RhythmError {
  type: 'too_fast' | 'too_slow' | 'irregular' | 'choppy';
  location: { start: number; end: number };
  severity: 'minor' | 'moderate' | 'severe';
  suggestion: string;
}

// Résultat d'analyse de prosodie
export interface ProsodyAnalysisResult {
  // Intonation
  intonation: IntonationAnalysis;
  
  // Rythme
  rhythm: RhythmAnalysis;
  
  // Accent
  stress: StressAnalysis;
  
  // Naturalité globale
  naturalness: number; // 0-1
  expressiveness: number; // 0-1
  
  // Problèmes prosodiques
  issues: ProsodyIssue[];
}

// Analyse d'intonation
export interface IntonationAnalysis {
  pattern: IntonationPattern;
  appropriateness: number;
  range: number; // semitones
  variation: number;
  issues: IntonationIssue[];
}

// Problème d'intonation
export interface IntonationIssue {
  type: 'monotone' | 'inappropriate_rise' | 'inappropriate_fall' | 'excessive_variation';
  location: { start: number; end: number };
  severity: 'minor' | 'moderate' | 'severe';
  impact: string;
  suggestion: string;
}

// Analyse de rythme
export interface RhythmAnalysis {
  tempo: TempoAnalysis;
  regularity: number;
  pausing: PausingAnalysis;
  syllableTiming: SyllableTimingAnalysis;
}

// Analyse de tempo
export interface TempoAnalysis {
  syllablesPerMinute: number;
  wordsPerMinute: number;
  appropriateness: number; // 0-1
  consistency: number; // 0-1
  comparison: 'too_fast' | 'too_slow' | 'appropriate';
}

// Analyse de pause
export interface PausingAnalysis {
  frequency: number; // pauses per minute
  averageDuration: number; // ms
  appropriateness: number; // 0-1
  breathingPoints: number;
  hesitations: number;
}

// Analyse timing des syllabes
export interface SyllableTimingAnalysis {
  regularity: number; // 0-1
  stressedVsUnstressed: number; // ratio
  naturalness: number; // 0-1
  isochrony: number; // 0-1 (stress-timed vs syllable-timed)
}

// Analyse d'accent
export interface StressAnalysis {
  wordStress: WordStressAnalysis[];
  sentenceStress: SentenceStressAnalysis;
  overall: number; // 0-1
}

// Analyse accent de mot
export interface WordStressAnalysis {
  word: string;
  expectedPattern: boolean[];
  actualPattern: boolean[];
  accuracy: number;
  naturalness: number;
}

// Analyse accent de phrase
export interface SentenceStressAnalysis {
  contentWords: number; // correctly stressed
  functionWords: number; // correctly unstressed
  rhythm: number; // 0-1
  naturalness: number; // 0-1
}

// Problème prosodique
export interface ProsodyIssue {
  type: 'intonation' | 'rhythm' | 'stress' | 'tempo' | 'pausing';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  impact: string;
  exerciseRecommendation: string;
}

// Comparaison avec natif
export interface NativeComparison {
  overallSimilarity: number; // 0-1
  
  // Comparaisons spécifiques
  phoneticSimilarity: number;
  prosodySimilarity: number;
  rhythmSimilarity: number;
  intonationSimilarity: number;
  
  // Différences principales
  majorDifferences: NativeDifference[];
  
  // Progression vers natif
  progressToNative: number; // 0-1
  estimatedTime: number; // hours to native-like
}

// Différence avec natif
export interface NativeDifference {
  aspect: 'phoneme' | 'stress' | 'intonation' | 'rhythm';
  difference: string;
  impact: 'low' | 'medium' | 'high';
  priority: number; // 1-10
  practiceExercise: string;
}

// Résultat détection d'accent
export interface AccentDetectionResult {
  detectedAccent: AccentType;
  confidence: number;
  nativeLanguageInfluence?: string;
  
  // Caractéristiques d'accent
  characteristics: AccentCharacteristic[];
  
  // Coaching recommandé
  coachingPlan: AccentCoachingPlan;
}

// Caractéristique d'accent
export interface AccentCharacteristic {
  feature: string;
  description: string;
  strength: number; // 0-1
  typical: boolean; // typical of this accent
  improvement: AccentImprovement;
}

// Amélioration d'accent
export interface AccentImprovement {
  target: string;
  exercise: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  priority: 'low' | 'medium' | 'high';
}

// Plan de coaching d'accent
export interface AccentCoachingPlan {
  targetAccent: AccentType;
  currentLevel: PronunciationLevel;
  targetLevel: PronunciationLevel;
  
  // Plan d'exercices
  exercises: AccentExercise[];
  timeline: CoachingTimeline;
  
  // Suivi progression
  milestones: AccentMilestone[];
  assessmentSchedule: AssessmentSchedule;
}

// Exercice d'accent
export interface AccentExercise {
  id: string;
  name: string;
  type: PronunciationExerciseType;
  description: string;
  
  // Contenu
  targetSounds: string[];
  practiceWords: string[];
  practiceSentences: string[];
  
  // Difficulté et timing
  difficulty: PronunciationLevel;
  estimatedDuration: number; // minutes
  repetitions: number;
  
  // Feedback
  successCriteria: SuccessCriteria;
  commonMistakes: string[];
  tips: string[];
}

// Critères de succès
export interface SuccessCriteria {
  accuracyThreshold: number; // 0-1
  consistencyThreshold: number; // 0-1
  naturalness: number; // 0-1
  requiredRepetitions: number;
}

// Timeline de coaching
export interface CoachingTimeline {
  totalDuration: number; // weeks
  sessionsPerWeek: number;
  sessionDuration: number; // minutes
  phases: CoachingPhase[];
}

// Phase de coaching
export interface CoachingPhase {
  name: string;
  duration: number; // weeks
  focus: string[];
  exercises: string[]; // exercise IDs
  goals: string[];
}

// Jalon d'accent
export interface AccentMilestone {
  name: string;
  description: string;
  criteria: SuccessCriteria;
  estimatedWeek: number;
  exercises: string[];
}

// Planning d'évaluation
export interface AssessmentSchedule {
  initialAssessment: boolean;
  weeklyChecks: boolean;
  monthlyEvaluations: boolean;
  finalAssessment: boolean;
  customSchedule?: AssessmentPoint[];
}

// Point d'évaluation
export interface AssessmentPoint {
  week: number;
  type: 'check' | 'evaluation' | 'milestone';
  focus: string[];
  duration: number; // minutes
}

// Résultat analyse d'émotion
export interface EmotionAnalysisResult {
  primaryEmotion: VoiceEmotion;
  confidence: number;
  
  // Émotions détectées
  emotions: EmotionScore[];
  
  // Caractéristiques vocales
  voiceCharacteristics: VoiceCharacteristics;
  
  // Impact sur apprentissage
  learningImpact: LearningImpact;
  
  // Recommandations
  emotionalFeedback: EmotionalFeedback[];
}

// Score d'émotion
export interface EmotionScore {
  emotion: VoiceEmotion;
  intensity: number; // 0-1
  confidence: number; // 0-1
  timeSegments: EmotionSegment[];
}

// Segment d'émotion
export interface EmotionSegment {
  startTime: number;
  endTime: number;
  emotion: VoiceEmotion;
  intensity: number;
}

// Caractéristiques vocales
export interface VoiceCharacteristics {
  pitch: PitchCharacteristics;
  energy: EnergyCharacteristics;
  tempo: TempoCharacteristics;
  quality: VoiceQualityCharacteristics;
}

// Caractéristiques de hauteur
export interface PitchCharacteristics {
  mean: number; // Hz
  range: number; // semitones
  variation: number; // standard deviation
  contour: 'rising' | 'falling' | 'stable' | 'variable';
}

// Caractéristiques d'énergie
export interface EnergyCharacteristics {
  mean: number; // dB
  variation: number;
  dynamic: 'low' | 'medium' | 'high';
  consistency: number; // 0-1
}

// Caractéristiques de tempo
export interface TempoCharacteristics {
  rate: number; // words per minute
  variability: number;
  pauses: number; // frequency
  fluency: number; // 0-1
}

// Caractéristiques qualité vocale
export interface VoiceQualityCharacteristics {
  breathiness: number; // 0-1
  roughness: number; // 0-1
  tension: number; // 0-1
  resonance: number; // 0-1
  clarity: number; // 0-1
}

// Impact sur apprentissage
export interface LearningImpact {
  motivation: number; // 0-1
  confidence: number; // 0-1
  engagement: number; // 0-1
  stress: number; // 0-1
  
  // Recommandations
  shouldContinue: boolean;
  suggestedBreak: number; // minutes
  encouragementNeeded: boolean;
  adjustmentSuggestions: string[];
}

// Feedback émotionnel
export interface EmotionalFeedback {
  type: 'encouragement' | 'motivation' | 'relaxation' | 'confidence';
  message: string;
  tone: 'supportive' | 'energetic' | 'calming' | 'positive';
  timing: 'immediate' | 'end_of_session' | 'next_session';
}

// Recommandation de pronunciation
export interface PronunciationRecommendation {
  id: string;
  type: 'phoneme' | 'word' | 'prosody' | 'accent' | 'fluency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Description
  title: string;
  description: string;
  explanation: string;
  
  // Exercices recommandés
  exercises: RecommendedExercise[];
  
  // Progression estimée
  estimatedImprovement: number; // 0-1
  timeToMastery: number; // hours
  
  // Ressources
  resources: LearningResource[];
  examples: AudioExample[];
}

// Exercice recommandé
export interface RecommendedExercise {
  name: string;
  type: PronunciationExerciseType;
  duration: number; // minutes
  repetitions: number;
  description: string;
  difficulty: PronunciationLevel;
}

// Ressource d'apprentissage
export interface LearningResource {
  type: 'video' | 'article' | 'exercise' | 'audio' | 'diagram';
  title: string;
  url: string;
  description: string;
  duration?: number; // minutes
  difficulty: PronunciationLevel;
}

// Exemple audio
export interface AudioExample {
  description: string;
  audioUrl: string;
  speaker: 'native' | 'learner' | 'synthetic';
  accent: AccentType;
  speed: 'slow' | 'normal' | 'fast';
}

// Métriques temps réel
export interface LiveSpeechMetrics {
  // Métriques instantanées
  currentVolume: number; // 0-1
  currentPitch: number; // Hz
  speechRate: number; // words per minute
  
  // Qualité temps réel
  clarity: number; // 0-1
  confidence: number; // 0-1
  stability: number; // 0-1
  
  // Détection problèmes
  activeIssues: LiveIssue[];
  warnings: LiveWarning[];
  
  // Progression session
  progressMetrics: ProgressMetrics;
}

// Problème temps réel
export interface LiveIssue {
  type: 'volume' | 'pitch' | 'speed' | 'clarity' | 'pronunciation';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  startTime: number;
}

// Avertissement temps réel
export interface LiveWarning {
  type: 'background_noise' | 'microphone_issue' | 'speech_too_quiet' | 'speech_too_fast';
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

// Métriques de progression
export interface ProgressMetrics {
  sessionProgress: number; // 0-1
  exerciseCompletion: number; // 0-1
  accuracyTrend: number[]; // recent accuracy scores
  improvementRate: number; // improvement per minute
  
  // Comparaisons
  vsLastSession: number; // improvement
  vsAverage: number; // vs user average
  vsTarget: number; // vs target level
}

// Feedback vocal
export interface SpeechFeedback {
  id: string;
  timestamp: number;
  type: FeedbackType;
  
  // Contenu
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'pronunciation' | 'fluency' | 'accuracy' | 'prosody' | 'technical';
  
  // Recommandations
  suggestion: string;
  exercise?: RecommendedExercise;
  
  // Présentation
  displayMode: 'text' | 'audio' | 'visual' | 'haptic';
  duration: number; // ms to display
  priority: number; // 1-10
}

// Type de feedback
export enum FeedbackType {
  IMMEDIATE_CORRECTION = 'immediate_correction',
  POSITIVE_REINFORCEMENT = 'positive_reinforcement',
  TECHNIQUE_SUGGESTION = 'technique_suggestion',
  PRACTICE_REMINDER = 'practice_reminder',
  PROGRESS_UPDATE = 'progress_update',
  MOTIVATION = 'motivation',
  WARNING = 'warning',
  ERROR = 'error'
}

// Évaluation finale de session
export interface SpeechAssessment {
  // Scores globaux
  overallScore: number; // 0-1
  pronunciation: number; // 0-1
  fluency: number; // 0-1
  accuracy: number; // 0-1
  prosody: number; // 0-1
  confidence: number; // 0-1
  
  // Analyses détaillées
  phonemeAccuracy: PhonemeAccuracySummary[];
  prosodyAssessment: ProsodyAssessmentSummary;
  emotionalState: EmotionalStateSummary;
  
  // Progression
  improvement: ImprovementSummary;
  nextSteps: NextStepsSummary;
  
  // Comparaisons
  comparedToTarget: ComparisonResult;
  comparedToPrevious: ComparisonResult;
  comparedToNative: ComparisonResult;
  
  // Temps et effort
  timeSpent: number; // minutes
  effortLevel: number; // 0-1
  engagement: number; // 0-1
}

// Résumé précision phonème
export interface PhonemeAccuracySummary {
  category: PhonemeCategory;
  accuracy: number; // 0-1
  improvement: number; // vs last session
  problematicSounds: string[];
  strengths: string[];
}

// Résumé évaluation prosodie
export interface ProsodyAssessmentSummary {
  intonation: number; // 0-1
  rhythm: number; // 0-1
  stress: number; // 0-1
  naturalness: number; // 0-1
  expressiveness: number; // 0-1
  
  // Problèmes principaux
  mainIssues: string[];
  improvements: string[];
}

// Résumé état émotionnel
export interface EmotionalStateSummary {
  overallMood: VoiceEmotion;
  confidence: number; // 0-1
  motivation: number; // 0-1
  stress: number; // 0-1
  
  // Tendances
  moodProgression: EmotionScore[];
  stressPoints: number[]; // timestamps of high stress
  confidenceBoosts: number[]; // timestamps of confidence gains
}

// Résumé amélioration
export interface ImprovementSummary {
  sessionImprovement: number; // 0-1
  weeklyTrend: number; // 0-1
  monthlyTrend: number; // 0-1
  
  // Points d'amélioration
  mostImproved: string[];
  leastImproved: string[];
  consistentAreas: string[];
  
  // Prédictions
  projectedImprovement: number; // next week
  timeToTarget: number; // weeks
}

// Résumé prochaines étapes
export interface NextStepsSummary {
  priorityAreas: string[];
  recommendedExercises: RecommendedExercise[];
  suggestedFrequency: number; // sessions per week
  estimatedDuration: number; // minutes per session
  
  // Objectifs
  shortTermGoals: string[]; // next week
  mediumTermGoals: string[]; // next month
  longTermGoals: string[]; // next quarter
}

// Résultat de comparaison
export interface ComparisonResult {
  overall: number; // -1 to 1 (improvement)
  pronunciation: number;
  fluency: number;
  accuracy: number;
  
  // Détails
  significantChanges: string[];
  consistentAreas: string[];
  regressionAreas: string[];
  
  // Confiance
  reliability: number; // 0-1
  sampleSize: number; // sessions compared
}

// Suggestion d'amélioration
export interface ImprovementSuggestion {
  area: 'pronunciation' | 'fluency' | 'prosody' | 'confidence' | 'technical';
  description: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Plan d'action
  actionPlan: ActionStep[];
  estimatedTime: number; // hours
  expectedImprovement: number; // 0-1
  
  // Ressources
  resources: LearningResource[];
  exercises: RecommendedExercise[];
}

// Étape d'action
export interface ActionStep {
  step: number;
  description: string;
  duration: number; // minutes
  frequency: string; // "daily", "3x per week", etc.
  success_criteria: string;
}

// Achievement vocal
export interface SpeechAchievement {
  id: string;
  name: string;
  description: string;
  category: 'pronunciation' | 'fluency' | 'accuracy' | 'consistency' | 'improvement';
  
  // Critères
  criteria: AchievementCriteria;
  progress: number; // 0-1
  unlocked: boolean;
  unlockedAt?: number;
  
  // Récompenses
  rewards: AchievementReward[];
  
  // Rareté
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedBy: number; // percentage of users
}

// Critères d'achievement
export interface AchievementCriteria {
  type: 'accuracy' | 'consistency' | 'improvement' | 'duration' | 'frequency';
  threshold: number;
  duration?: number; // sessions/days
  category?: string; // specific phoneme/word category
}

// Récompense d'achievement
export interface AchievementReward {
  type: 'badge' | 'points' | 'unlock' | 'discount' | 'feature';
  value: any;
  description: string;
}

// Métadonnées de session
export interface SessionMetadata {
  // Environnement
  deviceInfo: AudioDeviceInfo;
  browserInfo: BrowserCapabilities;
  networkInfo: NetworkQuality;
  
  // Qualité technique
  overallAudioQuality: number; // 0-1
  technicalIssues: TechnicalIssue[];
  calibrationData: CalibrationData;
  
  // Contexte utilisateur
  userContext: UserContext;
  
  // Performance système
  systemPerformance: SystemPerformance;
}

// Capacités navigateur
export interface BrowserCapabilities {
  webSpeechAPI: boolean;
  webRTC: boolean;
  audioContext: boolean;
  mediaRecorder: boolean;
  features: string[];
  limitations: string[];
}

// Qualité réseau
export interface NetworkQuality {
  bandwidth: number; // Mbps
  latency: number; // ms
  stability: number; // 0-1
  connectionType: string;
}

// Problème technique
export interface TechnicalIssue {
  type: 'audio' | 'network' | 'processing' | 'browser' | 'device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  resolved: boolean;
  impact: string;
}

// Données de calibration
export interface CalibrationData {
  microphoneLevel: number; // 0-1
  backgroundNoise: number; // dB
  roomAcoustics: number; // 0-1
  calibratedAt: number;
  calibrationQuality: number; // 0-1
}

// Contexte utilisateur
export interface UserContext {
  nativeLanguage: string;
  learningGoals: string[];
  experience: PronunciationLevel;
  preferences: UserPreferences;
  motivation: number; // 0-1
}

// Préférences utilisateur
export interface UserPreferences {
  feedbackStyle: 'immediate' | 'gentle' | 'detailed' | 'minimal';
  difficultyPreference: 'challenging' | 'comfortable' | 'easy';
  voiceCoach: 'male' | 'female' | 'neutral';
  feedbackLanguage: string;
  privacyLevel: 'high' | 'medium' | 'low';
}

// Performance système
export interface SystemPerformance {
  processingTime: ProcessingTimes;
  memoryUsage: MemoryUsage;
  cpuUsage: number; // 0-1
  batteryImpact: number; // 0-1
  errors: SystemError[];
}

// Temps de traitement
export interface ProcessingTimes {
  transcription: number; // ms
  analysis: number; // ms
  feedback: number; // ms
  total: number; // ms
}

// Utilisation mémoire
export interface MemoryUsage {
  peak: number; // MB
  average: number; // MB
  audioBuffers: number; // MB
  analysisData: number; // MB
}

// Erreur système
export interface SystemError {
  type: string;
  message: string;
  timestamp: number;
  stack?: string;
  context: any;
}

// État du système de reconnaissance vocale
export interface SpeechRecognitionState {
  // Sessions actives
  activeSessions: Map<string, SpeechRecognitionSession>;
  
  // Configurations
  configs: Map<string, SpeechRecognitionConfig>;
  
  // Cache audio
  audioCache: Map<string, AudioRecording>;
  
  // Statistiques globales
  globalStats: GlobalSpeechStats;
  
  // État système
  systemStatus: SystemStatus;
  
  // Erreurs
  errors: SystemError[];
}

// Statistiques globales
export interface GlobalSpeechStats {
  totalSessions: number;
  totalRecordings: number;
  totalAnalyses: number;
  
  // Moyennes
  averageAccuracy: number;
  averageSessionDuration: number;
  averageImprovement: number;
  
  // Utilisation
  popularExercises: ExerciseUsage[];
  commonIssues: IssueFrequency[];
  userSatisfaction: number; // 0-1
}

// Utilisation d'exercice
export interface ExerciseUsage {
  exerciseType: PronunciationExerciseType;
  frequency: number;
  averageScore: number;
  userRating: number; // 0-1
}

// Fréquence de problème
export interface IssueFrequency {
  issue: string;
  frequency: number;
  severity: number; // 0-1
  category: string;
}

// Statut système
export interface SystemStatus {
  isOnline: boolean;
  processingCapacity: number; // 0-1
  queueLength: number;
  averageProcessingTime: number; // ms
  lastMaintenance: number;
  nextMaintenance: number;
}

// Actions du système de reconnaissance vocale
export type SpeechAction =
  | { type: 'START_RECORDING'; payload: { sessionId: string; config: SpeechRecognitionConfig } }
  | { type: 'STOP_RECORDING'; payload: { sessionId: string } }
  | { type: 'PROCESS_AUDIO'; payload: { recordingId: string } }
  | { type: 'ANALYZE_SPEECH'; payload: { transcriptionId: string } }
  | { type: 'PROVIDE_FEEDBACK'; payload: { analysisId: string; feedbackType: FeedbackType } }
  | { type: 'UPDATE_LIVE_METRICS'; payload: { sessionId: string; metrics: LiveSpeechMetrics } }
  | { type: 'COMPLETE_SESSION'; payload: { sessionId: string } }
  | { type: 'CALIBRATE_MICROPHONE'; payload: { deviceId: string } };

// Constantes
export const SPEECH_CONSTANTS = {
  // Seuils de qualité
  QUALITY_THRESHOLDS: {
    EXCELLENT: 0.9,
    GOOD: 0.7,
    ACCEPTABLE: 0.5,
    POOR: 0.3
  },
  
  // Limites audio
  AUDIO_LIMITS: {
    MAX_RECORDING_DURATION: 300000, // 5 minutes
    MIN_RECORDING_DURATION: 1000, // 1 second
    SAMPLE_RATE: 16000, // Hz
    BIT_DEPTH: 16,
    CHANNELS: 1
  },
  
  // Seuils de feedback
  FEEDBACK_THRESHOLDS: {
    IMMEDIATE_CORRECTION: 0.3, // accuracy below this triggers immediate feedback
    POSITIVE_REINFORCEMENT: 0.8, // accuracy above this triggers praise
    DIFFICULTY_ADJUSTMENT: 0.6 // consistent performance below this adjusts difficulty
  },
  
  // Timing
  TIMING_CONSTANTS: {
    SILENCE_TIMEOUT: 3000, // ms
    FEEDBACK_DELAY: 500, // ms
    LIVE_UPDATE_INTERVAL: 100, // ms
    ANALYSIS_TIMEOUT: 30000 // ms
  }
} as const;