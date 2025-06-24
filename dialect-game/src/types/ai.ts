/**
 * Types pour le système d'IA conversationnelle
 * Task 20: IA Conversationnelle - Phase 5
 */

// Providers d'IA
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
  HUGGING_FACE = 'hugging_face',
  LOCAL = 'local'
}

// Types de modèles IA
export enum AIModel {
  // OpenAI
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  
  // Anthropic
  CLAUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',
  
  // Google
  GEMINI_PRO = 'gemini-pro',
  GEMINI_PRO_VISION = 'gemini-pro-vision',
  
  // Local/Open Source
  LLAMA_2 = 'llama-2',
  MISTRAL_7B = 'mistral-7b'
}

// Types de conversations
export enum ConversationType {
  TUTORING = 'tutoring',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  CASUAL = 'casual',
  ROLE_PLAY = 'role_play',
  GRAMMAR_HELP = 'grammar_help',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation'
}

// Niveaux de langue
export enum LanguageLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  NATIVE = 'native'
}

// Modes de correction
export enum CorrectionMode {
  IMMEDIATE = 'immediate',
  DELAYED = 'delayed',
  ON_REQUEST = 'on_request',
  END_OF_SESSION = 'end_of_session'
}

// Types d'erreurs linguistiques
export enum ErrorType {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  SPELLING = 'spelling',
  SYNTAX = 'syntax',
  SEMANTICS = 'semantics',
  PRAGMATICS = 'pragmatics',
  STYLE = 'style'
}

// Personnalité du chatbot
export interface BotPersonality {
  name: string;
  avatar: string;
  description: string;
  traits: PersonalityTrait[];
  responseStyle: ResponseStyle;
  specializations: string[];
  languages: string[];
  culturalBackground?: string;
}

// Traits de personnalité
export interface PersonalityTrait {
  trait: string;
  intensity: number; // 0-1
  description: string;
}

// Style de réponse
export interface ResponseStyle {
  formality: 'formal' | 'informal' | 'neutral';
  encouragement: 'high' | 'medium' | 'low';
  patience: 'very_patient' | 'patient' | 'normal';
  humor: 'none' | 'light' | 'moderate' | 'high';
  verbosity: 'concise' | 'moderate' | 'detailed';
  adaptivity: 'static' | 'adaptive' | 'highly_adaptive';
}

// Configuration d'une conversation IA
export interface AIConversationConfig {
  id: string;
  type: ConversationType;
  language: string;
  targetLanguage: string;
  level: LanguageLevel;
  
  // Paramètres IA
  model: AIModel;
  provider: AIProvider;
  temperature: number; // 0-1, créativité
  maxTokens: number;
  
  // Personnalité
  botPersonality: BotPersonality;
  
  // Paramètres pédagogiques
  correctionMode: CorrectionMode;
  feedbackDetail: 'minimal' | 'moderate' | 'detailed';
  adaptiveDifficulty: boolean;
  
  // Contraintes
  topicConstraints: string[];
  prohibitedContent: string[];
  maxDuration: number; // minutes
  maxTurns: number;
  
  // Objectifs d'apprentissage
  learningObjectives: LearningObjective[];
  focusAreas: string[];
  
  // Métadonnées
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

// Objectif d'apprentissage
export interface LearningObjective {
  id: string;
  description: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency' | 'comprehension';
  priority: 'low' | 'medium' | 'high';
  measurable: boolean;
  criteria?: ObjectiveCriteria;
}

// Critères d'objectif
export interface ObjectiveCriteria {
  minimumAccuracy?: number; // %
  targetVocabularyCount?: number;
  requiredStructures?: string[];
  fluencyMetrics?: FluencyMetrics;
}

// Métriques de fluidité
export interface FluencyMetrics {
  wordsPerMinute?: number;
  pauseFrequency?: number;
  hesitationCount?: number;
  selfCorrectionRate?: number;
}

// Session de conversation IA
export interface AIConversationSession {
  id: string;
  configId: string;
  userId: string;
  
  // État de la session
  status: SessionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  
  // Progression
  currentTurn: number;
  messages: ConversationMessage[];
  
  // Contexte dynamique
  context: ConversationContext;
  
  // Évaluation continue
  liveAssessment: LiveAssessment;
  
  // Adaptations
  difficultyAdjustments: DifficultyAdjustment[];
  personalizations: Personalization[];
  
  // Résultats
  finalAssessment?: SessionAssessment;
  achievements?: Achievement[];
  
  // Métadonnées
  metadata: SessionMetadata;
}

// Statut de session
export enum SessionStatus {
  STARTING = 'starting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
  ERROR = 'error'
}

// Message de conversation
export interface ConversationMessage {
  id: string;
  sessionId: string;
  
  // Contenu
  content: string;
  originalContent?: string; // Avant correction
  language: string;
  
  // Métadonnées
  timestamp: number;
  sender: MessageSender;
  type: MessageType;
  
  // Analyse IA
  aiAnalysis?: MessageAnalysis;
  
  // Corrections et feedback
  corrections?: LanguageCorrection[];
  feedback?: AIFeedback;
  
  // Interaction
  reactions?: MessageReaction[];
  follow_ups?: FollowUpSuggestion[];
  
  // Contexte
  context: MessageContext;
}

// Expéditeur du message
export interface MessageSender {
  type: 'user' | 'ai' | 'system';
  id: string;
  name: string;
  avatar?: string;
}

// Type de message
export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  EXERCISE = 'exercise',
  CORRECTION = 'correction',
  FEEDBACK = 'feedback',
  QUESTION = 'question',
  SYSTEM = 'system'
}

// Analyse IA d'un message
export interface MessageAnalysis {
  // Analyse linguistique
  languageDetection: LanguageDetection;
  complexity: ComplexityAnalysis;
  sentiment: SentimentAnalysis;
  intent: IntentAnalysis;
  
  // Qualité linguistique
  errors: LanguageError[];
  proficiencyLevel: LanguageLevel;
  improvements: ImprovementSuggestion[];
  
  // Engagement
  engagement: EngagementMetrics;
  
  // Confiance de l'IA
  confidence: number; // 0-1
  uncertainties: string[];
}

// Détection de langue
export interface LanguageDetection {
  primary: string;
  confidence: number;
  alternatives?: LanguageAlternative[];
  mixed?: boolean;
}

// Alternative de langue
export interface LanguageAlternative {
  language: string;
  confidence: number;
  segments?: TextSegment[];
}

// Segment de texte
export interface TextSegment {
  text: string;
  start: number;
  end: number;
  language: string;
}

// Analyse de complexité
export interface ComplexityAnalysis {
  overall: number; // 0-1
  vocabulary: number;
  grammar: number;
  syntax: number;
  readabilityScore?: number;
  metrics: ComplexityMetrics;
}

// Métriques de complexité
export interface ComplexityMetrics {
  averageWordLength: number;
  averageSentenceLength: number;
  syllableCount: number;
  uniqueWordRatio: number;
  grammarStructures: string[];
}

// Analyse de sentiment
export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: EmotionScore[];
  tone: ToneAnalysis;
}

// Score d'émotion
export interface EmotionScore {
  emotion: string;
  intensity: number; // 0-1
}

// Analyse de ton
export interface ToneAnalysis {
  formality: number; // 0-1
  politeness: number; // 0-1
  enthusiasm: number; // 0-1
  certainty: number; // 0-1
}

// Analyse d'intention
export interface IntentAnalysis {
  primary: IntentType;
  confidence: number;
  alternatives?: IntentAlternative[];
  entities: Entity[];
}

// Type d'intention
export enum IntentType {
  QUESTION = 'question',
  STATEMENT = 'statement',
  REQUEST = 'request',
  GREETING = 'greeting',
  GOODBYE = 'goodbye',
  AGREEMENT = 'agreement',
  DISAGREEMENT = 'disagreement',
  CLARIFICATION = 'clarification',
  HELP = 'help',
  PRACTICE = 'practice'
}

// Alternative d'intention
export interface IntentAlternative {
  intent: IntentType;
  confidence: number;
}

// Entité extraite
export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

// Erreur linguistique
export interface LanguageError {
  id: string;
  type: ErrorType;
  severity: 'low' | 'medium' | 'high';
  
  // Position
  start: number;
  end: number;
  text: string;
  
  // Correction
  suggestion: string;
  alternatives?: string[];
  explanation: string;
  
  // Règle appliquée
  rule?: GrammarRule;
  
  // Contexte
  context: string;
  confidence: number;
}

// Règle de grammaire
export interface GrammarRule {
  id: string;
  name: string;
  category: string;
  description: string;
  examples: string[];
  references?: string[];
}

// Suggestion d'amélioration
export interface ImprovementSuggestion {
  type: 'vocabulary' | 'grammar' | 'style' | 'fluency';
  description: string;
  example: string;
  priority: 'low' | 'medium' | 'high';
  resources?: LearningResource[];
}

// Ressource d'apprentissage
export interface LearningResource {
  type: 'exercise' | 'lesson' | 'video' | 'article' | 'quiz';
  title: string;
  url?: string;
  description: string;
  estimatedTime: number; // minutes
}

// Métriques d'engagement
export interface EngagementMetrics {
  responseLength: number;
  responseTime: number; // ms
  participationLevel: number; // 0-1
  initiativeLevel: number; // 0-1
  followUpQuestions: number;
}

// Correction linguistique
export interface LanguageCorrection {
  id: string;
  errorId: string;
  
  // Correction
  original: string;
  corrected: string;
  explanation: string;
  
  // Catégorisation
  type: ErrorType;
  severity: 'minor' | 'major' | 'critical';
  
  // Pédagogie
  pedagogicalNote?: string;
  relatedRules?: string[];
  practiceExercises?: string[];
  
  // Métadonnées
  timestamp: number;
  confidence: number;
  aiModel: AIModel;
}

// Feedback IA
export interface AIFeedback {
  id: string;
  messageId: string;
  
  // Contenu du feedback
  type: FeedbackType;
  content: string;
  tone: 'encouraging' | 'neutral' | 'constructive';
  
  // Évaluation
  strengths: string[];
  improvements: string[];
  
  // Recommandations
  nextSteps: string[];
  resources: LearningResource[];
  
  // Adaptation
  difficultyAdjustment?: 'increase' | 'decrease' | 'maintain';
  focusShift?: string[];
  
  // Métadonnées
  timestamp: number;
  confidence: number;
}

// Type de feedback
export enum FeedbackType {
  POSITIVE = 'positive',
  CORRECTIVE = 'corrective',
  INFORMATIVE = 'informative',
  MOTIVATIONAL = 'motivational',
  STRATEGIC = 'strategic'
}

// Réaction à un message
export interface MessageReaction {
  type: 'like' | 'helpful' | 'unclear' | 'difficult' | 'easy';
  userId: string;
  timestamp: number;
}

// Suggestion de suivi
export interface FollowUpSuggestion {
  type: 'question' | 'exercise' | 'clarification' | 'practice';
  content: string;
  priority: number; // 0-1
  reasoning: string;
}

// Contexte de message
export interface MessageContext {
  previousMessages: string[]; // IDs des messages précédents
  topic: string;
  mood: string;
  learningPhase: 'introduction' | 'practice' | 'application' | 'assessment';
  difficultyLevel: number; // 0-1
}

// Contexte de conversation
export interface ConversationContext {
  // Historique
  topics: TopicHistory[];
  vocabulary: VocabularyTracker;
  grammar: GrammarTracker;
  
  // État actuel
  currentTopic: string;
  mood: ConversationMood;
  energy: number; // 0-1
  
  // Progression
  learningProgress: LearningProgress;
  achievements: string[];
  challenges: string[];
  
  // Adaptation
  adaptiveParameters: AdaptiveParameters;
  personalizations: PersonalizationState;
}

// Historique des sujets
export interface TopicHistory {
  topic: string;
  duration: number; // seconds
  engagement: number; // 0-1
  outcome: 'completed' | 'abandoned' | 'mastered' | 'needs_review';
  vocabulary_learned: string[];
}

// Suivi du vocabulaire
export interface VocabularyTracker {
  introduced: VocabularyItem[];
  practiced: VocabularyItem[];
  mastered: VocabularyItem[];
  struggling: VocabularyItem[];
}

// Élément de vocabulaire
export interface VocabularyItem {
  word: string;
  definition: string;
  examples: string[];
  difficulty: number; // 0-1
  frequency: number;
  lastSeen: number;
  masteryLevel: number; // 0-1
}

// Suivi de la grammaire
export interface GrammarTracker {
  rules_introduced: GrammarRule[];
  rules_practiced: GrammarRule[];
  rules_mastered: GrammarRule[];
  common_errors: ErrorPattern[];
}

// Pattern d'erreur
export interface ErrorPattern {
  type: ErrorType;
  pattern: string;
  frequency: number;
  lastOccurrence: number;
  improvement_rate: number; // 0-1
}

// Humeur de conversation
export interface ConversationMood {
  overall: 'enthusiastic' | 'engaged' | 'neutral' | 'frustrated' | 'bored';
  confidence: number; // 0-1
  motivation: number; // 0-1
  fatigue: number; // 0-1
}

// Progression d'apprentissage
export interface LearningProgress {
  overall: number; // 0-1
  bySkill: SkillProgress[];
  objectives: ObjectiveProgress[];
  milestones: Milestone[];
}

// Progression par compétence
export interface SkillProgress {
  skill: string;
  current: number; // 0-1
  target: number; // 0-1
  rate: number; // progression par minute
  confidence: number; // 0-1
}

// Progression d'objectif
export interface ObjectiveProgress {
  objectiveId: string;
  progress: number; // 0-1
  timeSpent: number; // minutes
  attempts: number;
  lastAttempt: number;
}

// Jalon d'apprentissage
export interface Milestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt?: number;
  requirements: MilestoneRequirement[];
}

// Exigence de jalon
export interface MilestoneRequirement {
  type: 'skill_level' | 'vocabulary_count' | 'conversation_duration' | 'accuracy';
  target: number;
  current: number;
}

// Paramètres adaptatifs
export interface AdaptiveParameters {
  difficultyLevel: number; // 0-1
  speakingSpeed: number; // 0-1
  vocabularyComplexity: number; // 0-1
  grammarComplexity: number; // 0-1
  topicComplexity: number; // 0-1
  feedbackFrequency: number; // 0-1
}

// État de personnalisation
export interface PersonalizationState {
  learningStyle: LearningStyle;
  preferences: UserPreferences;
  adaptations: Adaptation[];
  effectiveness: EffectivenessMetrics;
}

// Style d'apprentissage
export interface LearningStyle {
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  secondary?: string;
  preferences: StylePreference[];
}

// Préférence de style
export interface StylePreference {
  aspect: string;
  preference: string;
  strength: number; // 0-1
}

// Préférences utilisateur
export interface UserPreferences {
  correctionStyle: 'immediate' | 'gentle' | 'detailed' | 'minimal';
  feedbackTone: 'formal' | 'friendly' | 'encouraging' | 'direct';
  difficultyPreference: 'challenging' | 'comfortable' | 'easy';
  topicInterests: string[];
  avoidTopics: string[];
  culturalSensitivities: string[];
}

// Adaptation appliquée
export interface Adaptation {
  type: string;
  description: string;
  applied: number; // timestamp
  effectiveness: number; // 0-1
  reason: string;
}

// Métriques d'efficacité
export interface EffectivenessMetrics {
  engagement: number; // 0-1
  learning_rate: number; // 0-1
  retention: number; // 0-1
  satisfaction: number; // 0-1
  completion_rate: number; // 0-1
}

// Évaluation en direct
export interface LiveAssessment {
  currentLevel: LanguageLevel;
  skillLevels: SkillLevel[];
  progressIndicators: ProgressIndicator[];
  redFlags: RedFlag[];
  recommendations: Recommendation[];
}

// Niveau de compétence
export interface SkillLevel {
  skill: string;
  level: LanguageLevel;
  confidence: number; // 0-1
  evidence: string[];
  lastUpdated: number;
}

// Indicateur de progression
export interface ProgressIndicator {
  metric: string;
  value: number;
  trend: 'improving' | 'stable' | 'declining';
  significance: 'low' | 'medium' | 'high';
}

// Signal d'alarme
export interface RedFlag {
  type: 'frustration' | 'confusion' | 'disengagement' | 'difficulty';
  severity: 'low' | 'medium' | 'high';
  indicators: string[];
  suggestedActions: string[];
}

// Recommandation
export interface Recommendation {
  type: 'difficulty_adjustment' | 'topic_change' | 'break' | 'focus_shift';
  description: string;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

// Ajustement de difficulté
export interface DifficultyAdjustment {
  timestamp: number;
  from: number; // 0-1
  to: number; // 0-1
  reason: string;
  trigger: string;
  effectiveness?: number; // 0-1, évalué plus tard
}

// Personnalisation
export interface Personalization {
  type: string;
  description: string;
  timestamp: number;
  trigger: string;
  parameters: Record<string, any>;
}

// Évaluation de session
export interface SessionAssessment {
  // Scores globaux
  overallScore: number; // 0-1
  improvementScore: number; // 0-1
  engagementScore: number; // 0-1
  
  // Compétences
  skillAssessments: SkillAssessment[];
  
  // Objectifs
  objectivesAchieved: string[];
  objectivesPartial: string[];
  objectivesMissed: string[];
  
  // Analyses
  strengths: string[];
  weaknesses: string[];
  keyLearnings: string[];
  
  // Recommandations
  nextSessionFocus: string[];
  practiceRecommendations: LearningResource[];
  difficultyRecommendation: 'increase' | 'maintain' | 'decrease';
  
  // Métriques
  totalTime: number; // seconds
  activeTime: number; // seconds
  messageCount: number;
  errorCount: number;
  correctionAcceptanceRate: number; // 0-1
  
  // Comparaison
  comparedToPrevious?: AssessmentComparison;
  comparedToAverage?: AssessmentComparison;
}

// Évaluation de compétence
export interface SkillAssessment {
  skill: string;
  initialLevel: LanguageLevel;
  finalLevel: LanguageLevel;
  improvement: number; // 0-1
  confidence: number; // 0-1
  evidence: string[];
  recommendations: string[];
}

// Comparaison d'évaluation
export interface AssessmentComparison {
  overallImprovement: number; // -1 to 1
  skillImprovements: Record<string, number>;
  significantChanges: string[];
  trends: string[];
}

// Réussite/Achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: number;
  criteria: AchievementCriteria;
  rewards?: AchievementReward[];
}

// Critères de réussite
export interface AchievementCriteria {
  type: string;
  requirements: Record<string, any>;
  timeframe?: number; // ms
}

// Récompense de réussite
export interface AchievementReward {
  type: 'xp' | 'badge' | 'unlock' | 'discount';
  value: any;
  description: string;
}

// Métadonnées de session
export interface SessionMetadata {
  deviceInfo: DeviceInfo;
  browserInfo: BrowserInfo;
  networkInfo: NetworkInfo;
  userAgent: string;
  ip?: string;
  location?: GeolocationInfo;
  
  // Qualité technique
  audioQuality?: AudioQualityInfo;
  latency?: LatencyInfo;
  errors?: TechnicalError[];
}

// Information d'appareil
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  osVersion: string;
  screen: ScreenInfo;
  capabilities: DeviceCapabilities;
}

// Information d'écran
export interface ScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

// Capacités d'appareil
export interface DeviceCapabilities {
  microphone: boolean;
  camera: boolean;
  speakers: boolean;
  touch: boolean;
  keyboard: boolean;
}

// Information de navigateur
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  features: BrowserFeatures;
}

// Fonctionnalités de navigateur
export interface BrowserFeatures {
  webSpeech: boolean;
  webRTC: boolean;
  webGL: boolean;
  localStorage: boolean;
  indexedDB: boolean;
}

// Information réseau
export interface NetworkInfo {
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  speed: 'slow' | 'medium' | 'fast';
  latency: number; // ms
  bandwidth?: number; // Mbps
}

// Information de géolocalisation
export interface GeolocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  language: string;
}

// Information qualité audio
export interface AudioQualityInfo {
  sampleRate: number;
  bitrate: number;
  channels: number;
  duration: number;
  noiseLevel: number; // 0-1
  clarity: number; // 0-1
}

// Information de latence
export interface LatencyInfo {
  average: number; // ms
  min: number; // ms
  max: number; // ms
  jitter: number; // ms
  packetLoss: number; // 0-1
}

// Erreur technique
export interface TechnicalError {
  type: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  context: any;
}

// Générateur de questions IA
export interface QuestionGenerator {
  generateQuestions(config: QuestionGeneratorConfig): Promise<GeneratedQuestion[]>;
  adaptDifficulty(questions: GeneratedQuestion[], userLevel: LanguageLevel): GeneratedQuestion[];
  validateQuestion(question: GeneratedQuestion): ValidationResult;
}

// Configuration du générateur de questions
export interface QuestionGeneratorConfig {
  topic: string;
  difficulty: LanguageLevel;
  questionTypes: QuestionType[];
  count: number;
  language: string;
  constraints: QuestionConstraints;
}

// Type de question
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  TRUE_FALSE = 'true_false',
  OPEN_ENDED = 'open_ended',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  CONVERSATION_STARTER = 'conversation_starter'
}

// Contraintes de questions
export interface QuestionConstraints {
  maxLength: number;
  minLength: number;
  allowedTopics: string[];
  forbiddenTopics: string[];
  culturalSensitivities: string[];
  vocabularyLevel: string;
}

// Question générée
export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hints?: string[];
  
  // Métadonnées
  difficulty: LanguageLevel;
  topic: string;
  estimatedTime: number; // seconds
  learningObjectives: string[];
  
  // Évaluation
  confidence: number; // 0-1
  quality: number; // 0-1
  appropriateness: number; // 0-1
}

// Résultat de validation
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1
  issues: ValidationIssue[];
  suggestions: string[];
}

// Problème de validation
export interface ValidationIssue {
  type: 'grammar' | 'clarity' | 'appropriateness' | 'difficulty' | 'cultural';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
}

// États du système IA
export interface AISystemState {
  conversations: Map<string, AIConversationSession>;
  configs: Map<string, AIConversationConfig>;
  personalities: Map<string, BotPersonality>;
  
  // Statistiques globales
  totalSessions: number;
  totalMessages: number;
  totalUsers: number;
  averageSessionDuration: number;
  
  // Métriques d'efficacité
  learningEffectiveness: number; // 0-1
  userSatisfaction: number; // 0-1
  errorCorrectionAccuracy: number; // 0-1
  engagementRate: number; // 0-1
  
  // État système
  isOnline: boolean;
  lastUpdated: number;
  errors: string[];
}

// Actions du système IA
export type AIAction =
  | { type: 'START_CONVERSATION'; payload: { userId: string; configId: string } }
  | { type: 'SEND_MESSAGE'; payload: { sessionId: string; content: string } }
  | { type: 'END_CONVERSATION'; payload: { sessionId: string } }
  | { type: 'UPDATE_CONFIG'; payload: { configId: string; config: Partial<AIConversationConfig> } }
  | { type: 'APPLY_CORRECTION'; payload: { messageId: string; correction: LanguageCorrection } }
  | { type: 'ADJUST_DIFFICULTY'; payload: { sessionId: string; adjustment: DifficultyAdjustment } }
  | { type: 'PROVIDE_FEEDBACK'; payload: { messageId: string; feedback: AIFeedback } }
  | { type: 'GENERATE_QUESTIONS'; payload: { config: QuestionGeneratorConfig } };

// Configuration d'API IA
export interface AIServiceConfig {
  // Providers
  openai?: {
    apiKey: string;
    baseUrl?: string;
    organization?: string;
  };
  
  anthropic?: {
    apiKey: string;
    baseUrl?: string;
  };
  
  google?: {
    apiKey: string;
    projectId?: string;
  };
  
  // Paramètres par défaut
  defaultModel: AIModel;
  defaultTemperature: number;
  defaultMaxTokens: number;
  
  // Limites
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMinute: number;
  };
  
  // Cache
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  
  // Fallbacks
  fallbackProviders: AIProvider[];
  retryAttempts: number;
  timeout: number; // ms
}

// Métriques d'utilisation IA
export interface AIUsageMetrics {
  // Utilisation
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  
  // Par provider
  byProvider: Record<AIProvider, ProviderMetrics>;
  
  // Par modèle
  byModel: Record<AIModel, ModelMetrics>;
  
  // Temporel
  hourly: TimeSeries[];
  daily: TimeSeries[];
  
  // Qualité
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
}

// Métriques par provider
export interface ProviderMetrics {
  requests: number;
  tokens: number;
  cost: number;
  avgResponseTime: number;
  errorRate: number;
}

// Métriques par modèle
export interface ModelMetrics {
  requests: number;
  tokens: number;
  cost: number;
  avgQuality: number;
  avgAccuracy: number;
}

// Série temporelle
export interface TimeSeries {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

// Constantes
export const AI_CONSTANTS = {
  // Niveaux de confiance
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  },
  
  // Limites par défaut
  DEFAULT_LIMITS: {
    MAX_MESSAGE_LENGTH: 1000,
    MAX_SESSION_DURATION: 60 * 60, // 1 hour
    MAX_TURNS_PER_SESSION: 200,
    MAX_QUESTIONS_PER_BATCH: 10
  },
  
  // Temps d'attente
  TIMEOUTS: {
    MESSAGE_RESPONSE: 30000, // 30s
    ANALYSIS: 10000, // 10s
    GENERATION: 20000 // 20s
  },
  
  // Coûts estimés (USD per 1k tokens)
  ESTIMATED_COSTS: {
    [AIModel.GPT_4]: 0.03,
    [AIModel.GPT_3_5_TURBO]: 0.002,
    [AIModel.CLAUDE_3_OPUS]: 0.015,
    [AIModel.CLAUDE_3_SONNET]: 0.003,
    [AIModel.GEMINI_PRO]: 0.001
  }
} as const;