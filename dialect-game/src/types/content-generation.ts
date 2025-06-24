/**
 * Types pour le système de génération de contenu IA
 * Task 22: Génération de Contenu IA - Phase 5
 */

// Types de contenu générables
export enum ContentType {
  QUESTION = 'question',
  STORY = 'story',
  EXERCISE = 'exercise',
  DIALOGUE = 'dialogue',
  VOCABULARY_LIST = 'vocabulary_list',
  GRAMMAR_LESSON = 'grammar_lesson',
  CULTURAL_NOTE = 'cultural_note',
  TRANSLATION_EXERCISE = 'translation_exercise',
  COMPREHENSION_TEXT = 'comprehension_text',
  CONVERSATION_STARTER = 'conversation_starter'
}

// Niveaux de difficulté
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  NATIVE = 'native'
}

// Types de questions
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  OPEN_ENDED = 'open_ended',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  AUDIO_COMPREHENSION = 'audio_comprehension',
  VISUAL_COMPREHENSION = 'visual_comprehension'
}

// Catégories d'exercices
export enum ExerciseCategory {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
  CULTURE = 'culture'
}

// Thèmes culturels
export enum CulturalTheme {
  FOOD = 'food',
  TRADITIONS = 'traditions',
  HOLIDAYS = 'holidays',
  SOCIAL_CUSTOMS = 'social_customs',
  HISTORY = 'history',
  ARTS = 'arts',
  BUSINESS = 'business',
  EDUCATION = 'education',
  FAMILY = 'family',
  DAILY_LIFE = 'daily_life'
}

// Types d'histoires
export enum StoryType {
  ADVENTURE = 'adventure',
  ROMANCE = 'romance',
  MYSTERY = 'mystery',
  COMEDY = 'comedy',
  DRAMA = 'drama',
  EDUCATIONAL = 'educational',
  HISTORICAL = 'historical',
  CONTEMPORARY = 'contemporary',
  FAIRY_TALE = 'fairy_tale',
  BIOGRAPHY = 'biography'
}

// Modes de génération
export enum GenerationMode {
  TEMPLATE_BASED = 'template_based',
  AI_CREATIVE = 'ai_creative',
  HYBRID = 'hybrid',
  ADAPTIVE = 'adaptive',
  PERSONALIZED = 'personalized'
}

// Configuration de génération de contenu
export interface ContentGenerationConfig {
  id: string;
  type: ContentType;
  difficulty: DifficultyLevel;
  language: string;
  targetLanguage: string;
  
  // Paramètres IA
  model: string;
  temperature: number; // 0-1, créativité
  maxTokens: number;
  
  // Contraintes de contenu
  length: ContentLength;
  style: ContentStyle;
  audience: AudienceProfile;
  
  // Personnalisation
  userProfile: UserProfile;
  learningObjectives: LearningObjective[];
  culturalContext: CulturalContext;
  
  // Métadonnées
  tags: string[];
  category: string;
  createdAt: number;
  updatedAt: number;
}

// Longueur de contenu
export interface ContentLength {
  wordCount?: { min: number; max: number };
  characterCount?: { min: number; max: number };
  sentenceCount?: { min: number; max: number };
  duration?: number; // for audio/video content
}

// Style de contenu
export interface ContentStyle {
  tone: 'formal' | 'informal' | 'friendly' | 'professional' | 'academic' | 'casual';
  register: 'colloquial' | 'standard' | 'literary' | 'technical';
  perspective: 'first_person' | 'second_person' | 'third_person';
  tense: 'present' | 'past' | 'future' | 'mixed';
}

// Profil d'audience
export interface AudienceProfile {
  ageGroup: 'children' | 'teenagers' | 'adults' | 'seniors' | 'mixed';
  interests: string[];
  culturalBackground: string[];
  learningGoals: string[];
  attention_span: 'short' | 'medium' | 'long';
}

// Profil utilisateur pour personnalisation
export interface UserProfile {
  id: string;
  nativeLanguage: string;
  currentLevel: DifficultyLevel;
  learningStyle: LearningStyle;
  interests: string[];
  weakAreas: string[];
  strongAreas: string[];
  progressHistory: ProgressEntry[];
}

// Style d'apprentissage
export interface LearningStyle {
  visual: number; // 0-1
  auditory: number; // 0-1
  kinesthetic: number; // 0-1
  reading: number; // 0-1
  preferences: StylePreference[];
}

// Préférence de style
export interface StylePreference {
  type: string;
  weight: number; // 0-1
  description: string;
}

// Entrée de progression
export interface ProgressEntry {
  date: number;
  skill: string;
  level: number; // 0-1
  performance: number; // 0-1
}

// Objectif d'apprentissage
export interface LearningObjective {
  id: string;
  description: string;
  skill: ExerciseCategory;
  targetLevel: DifficultyLevel;
  priority: 'low' | 'medium' | 'high';
  deadline?: number;
  measureCriteria: MeasureCriteria[];
}

// Critères de mesure
export interface MeasureCriteria {
  metric: string;
  target: number;
  current: number;
  unit: string;
}

// Contexte culturel
export interface CulturalContext {
  region: string;
  country: string;
  themes: CulturalTheme[];
  customs: CulturalCustom[];
  sensitivity: CulturalSensitivity;
}

// Coutume culturelle
export interface CulturalCustom {
  name: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  context: string[];
}

// Sensibilité culturelle
export interface CulturalSensitivity {
  level: 'low' | 'medium' | 'high';
  tabooTopics: string[];
  preferredApproach: string[];
  considerations: string[];
}

// Contenu généré par IA
export interface GeneratedContent {
  id: string;
  configId: string;
  type: ContentType;
  
  // Contenu principal
  title: string;
  content: ContentBody;
  metadata: ContentMetadata;
  
  // Évaluation et qualité
  quality: QualityAssessment;
  validation: ValidationResult;
  
  // Utilisation
  usageStats: UsageStatistics;
  feedback: ContentFeedback[];
  
  // Versions et historique
  version: number;
  parentId?: string; // for iterations
  variants: ContentVariant[];
  
  // Timestamps
  generatedAt: number;
  publishedAt?: number;
  updatedAt: number;
}

// Corps de contenu
export interface ContentBody {
  text: string;
  richText?: RichTextElement[];
  interactive?: InteractiveElement[];
  multimedia?: MultimediaElement[];
  exercises?: ExerciseElement[];
}

// Élément de texte riche
export interface RichTextElement {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code';
  content: string;
  formatting: TextFormatting;
  annotations: Annotation[];
}

// Formatage de texte
export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  size?: 'small' | 'normal' | 'large';
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

// Annotation
export interface Annotation {
  type: 'vocabulary' | 'grammar' | 'cultural' | 'pronunciation';
  text: string;
  explanation: string;
  position: { start: number; end: number };
  importance: 'low' | 'medium' | 'high';
}

// Élément interactif
export interface InteractiveElement {
  type: 'question' | 'poll' | 'quiz' | 'game' | 'simulation';
  id: string;
  content: any;
  config: InteractiveConfig;
}

// Configuration interactive
export interface InteractiveConfig {
  allowMultipleAttempts: boolean;
  showHints: boolean;
  timeLimit?: number;
  feedback: FeedbackConfig;
}

// Configuration de feedback
export interface FeedbackConfig {
  immediate: boolean;
  detailed: boolean;
  encouraging: boolean;
  corrective: boolean;
}

// Élément multimédia
export interface MultimediaElement {
  type: 'image' | 'audio' | 'video' | 'animation';
  url: string;
  alt?: string;
  caption?: string;
  metadata: MediaMetadata;
}

// Métadonnées média
export interface MediaMetadata {
  duration?: number;
  size: { width: number; height: number };
  format: string;
  quality: 'low' | 'medium' | 'high';
  accessibility: AccessibilityFeatures;
}

// Fonctionnalités d'accessibilité
export interface AccessibilityFeatures {
  subtitles?: boolean;
  audioDescription?: boolean;
  transcription?: string;
  alternativeText?: string;
}

// Élément d'exercice
export interface ExerciseElement {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
  difficulty: DifficultyLevel;
  skills: ExerciseCategory[];
}

// Métadonnées de contenu
export interface ContentMetadata {
  // Classification
  difficulty: DifficultyLevel;
  skills: ExerciseCategory[];
  topics: string[];
  keywords: string[];
  
  // Pédagogie
  learningObjectives: string[];
  prerequisites: string[];
  estimatedTime: number; // minutes
  cognitiveLoad: 'low' | 'medium' | 'high';
  
  // Qualité
  accuracy: number; // 0-1
  appropriateness: number; // 0-1
  engagement: number; // 0-1
  originality: number; // 0-1
  
  // Usage
  targetAudience: AudienceProfile;
  adaptability: number; // 0-1
  reusability: number; // 0-1
}

// Évaluation de qualité
export interface QualityAssessment {
  overall: number; // 0-1
  
  // Critères linguistiques
  grammar: number; // 0-1
  vocabulary: number; // 0-1
  style: number; // 0-1
  coherence: number; // 0-1
  
  // Critères pédagogiques
  pedagogicalValue: number; // 0-1
  difficulty: number; // 0-1
  relevance: number; // 0-1
  engagement: number; // 0-1
  
  // Critères culturels
  culturalAccuracy: number; // 0-1
  sensitivity: number; // 0-1
  inclusivity: number; // 0-1
  
  // Issues détectées
  issues: QualityIssue[];
  suggestions: ImprovementSuggestion[];
}

// Problème de qualité
export interface QualityIssue {
  type: 'grammar' | 'vocabulary' | 'cultural' | 'pedagogical' | 'style';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: { start: number; end: number };
  suggestion: string;
}

// Suggestion d'amélioration
export interface ImprovementSuggestion {
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
  expectedImpact: number; // 0-1
}

// Résultat de validation
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1
  
  // Validations spécifiques
  linguisticValidation: LinguisticValidation;
  pedagogicalValidation: PedagogicalValidation;
  culturalValidation: CulturalValidation;
  technicalValidation: TechnicalValidation;
  
  // Actions recommandées
  recommendations: ValidationRecommendation[];
}

// Validation linguistique
export interface LinguisticValidation {
  grammarCorrectness: number; // 0-1
  vocabularyAppropriate: number; // 0-1
  styleConsistency: number; // 0-1
  readabilityScore: number; // 0-1
  errors: LinguisticError[];
}

// Erreur linguistique
export interface LinguisticError {
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
  text: string;
  correction: string;
  explanation: string;
  confidence: number; // 0-1
}

// Validation pédagogique
export interface PedagogicalValidation {
  objectiveAlignment: number; // 0-1
  difficultyAppropriate: number; // 0-1
  instructionalDesign: number; // 0-1
  assessmentQuality: number; // 0-1
  learningEffectiveness: number; // 0-1
}

// Validation culturelle
export interface CulturalValidation {
  accuracy: number; // 0-1
  sensitivity: number; // 0-1
  inclusivity: number; // 0-1
  appropriateness: number; // 0-1
  concerns: CulturalConcern[];
}

// Préoccupation culturelle
export interface CulturalConcern {
  type: 'stereotype' | 'bias' | 'insensitivity' | 'inaccuracy';
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

// Validation technique
export interface TechnicalValidation {
  formatCompliance: number; // 0-1
  accessibility: number; // 0-1
  performance: number; // 0-1
  compatibility: number; // 0-1
  security: number; // 0-1
}

// Recommandation de validation
export interface ValidationRecommendation {
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  expectedOutcome: string;
}

// Statistiques d'utilisation
export interface UsageStatistics {
  views: number;
  completions: number;
  averageTime: number; // seconds
  successRate: number; // 0-1
  userRating: number; // 0-5
  
  // Engagement
  interactions: InteractionMetric[];
  dropoffPoints: DropoffPoint[];
  
  // Performance
  learningOutcomes: LearningOutcome[];
  retentionRate: number; // 0-1
  
  // Démographiques
  userDemographics: UserDemographic[];
}

// Métrique d'interaction
export interface InteractionMetric {
  type: string;
  count: number;
  averageDuration: number; // seconds
  successRate: number; // 0-1
}

// Point d'abandon
export interface DropoffPoint {
  location: string;
  percentage: number; // 0-1
  reasons: string[];
  commonness: number; // 0-1
}

// Résultat d'apprentissage
export interface LearningOutcome {
  skill: ExerciseCategory;
  improvement: number; // 0-1
  retention: number; // 0-1
  transferability: number; // 0-1
}

// Démographique utilisateur
export interface UserDemographic {
  attribute: string;
  value: string;
  count: number;
  performance: number; // 0-1
}

// Feedback de contenu
export interface ContentFeedback {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  categories: FeedbackCategory[];
  timestamp: number;
  helpful: boolean;
  verified: boolean;
}

// Catégorie de feedback
export interface FeedbackCategory {
  category: string;
  rating: number; // 1-5
  comment?: string;
}

// Variante de contenu
export interface ContentVariant {
  id: string;
  type: 'difficulty' | 'style' | 'length' | 'cultural' | 'personalized';
  description: string;
  differences: ContentDifference[];
  targetAudience: AudienceProfile;
  performance: VariantPerformance;
}

// Différence de contenu
export interface ContentDifference {
  aspect: string;
  original: string;
  variant: string;
  reason: string;
}

// Performance de variante
export interface VariantPerformance {
  engagement: number; // 0-1
  completion: number; // 0-1
  learning: number; // 0-1
  satisfaction: number; // 0-1
  preferenceScore: number; // 0-1
}

// Question générée
export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  category: ExerciseCategory;
  
  // Contenu
  question: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
  
  // Métadonnées
  difficulty: DifficultyLevel;
  skills: string[];
  topics: string[];
  estimatedTime: number; // seconds
  
  // Context
  context?: QuestionContext;
  
  // Qualité
  quality: QuestionQuality;
  variations: QuestionVariation[];
}

// Option de question
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  distractor?: DistractorInfo;
}

// Information de distracteur
export interface DistractorInfo {
  type: 'common_error' | 'plausible_alternative' | 'conceptual_confusion';
  reason: string;
  frequency: number; // 0-1, how often this mistake is made
}

// Contexte de question
export interface QuestionContext {
  scenario: string;
  background: string;
  relevantInfo: string[];
  multimedia?: MultimediaElement[];
}

// Qualité de question
export interface QuestionQuality {
  clarity: number; // 0-1
  difficulty: number; // 0-1
  discrimination: number; // 0-1
  reliability: number; // 0-1
  validity: number; // 0-1
  
  // Analyse psychométrique
  itemDifficulty: number; // 0-1
  itemDiscrimination: number; // 0-1
  distractorEffectiveness: number[]; // per option
}

// Variation de question
export interface QuestionVariation {
  id: string;
  type: 'rephrasing' | 'context_change' | 'difficulty_adjustment' | 'format_change';
  content: Partial<GeneratedQuestion>;
  useCase: string;
}

// Histoire interactive générée
export interface GeneratedStory {
  id: string;
  type: StoryType;
  title: string;
  
  // Structure narrative
  narrative: StoryNarrative;
  characters: StoryCharacter[];
  settings: StorySetting[];
  
  // Interactivité
  chapters: StoryChapter[];
  choices: StoryChoice[];
  branching: StoryBranching;
  
  // Éducation
  learningElements: LearningElement[];
  vocabulary: VocabularyItem[];
  culturalElements: CulturalElement[];
  
  // Métadonnées
  metadata: StoryMetadata;
  adaptations: StoryAdaptation[];
}

// Narratif d'histoire
export interface StoryNarrative {
  plot: PlotStructure;
  theme: string[];
  conflict: ConflictType;
  resolution: ResolutionType;
  tone: string;
  perspective: string;
}

// Structure d'intrigue
export interface PlotStructure {
  exposition: string;
  risingAction: string[];
  climax: string;
  fallingAction: string[];
  resolution: string;
}

// Type de conflit
export enum ConflictType {
  CHARACTER_VS_CHARACTER = 'character_vs_character',
  CHARACTER_VS_SELF = 'character_vs_self',
  CHARACTER_VS_SOCIETY = 'character_vs_society',
  CHARACTER_VS_NATURE = 'character_vs_nature',
  CHARACTER_VS_TECHNOLOGY = 'character_vs_technology'
}

// Type de résolution
export enum ResolutionType {
  HAPPY_ENDING = 'happy_ending',
  TRAGIC_ENDING = 'tragic_ending',
  OPEN_ENDING = 'open_ending',
  TWIST_ENDING = 'twist_ending',
  CIRCULAR_ENDING = 'circular_ending'
}

// Personnage d'histoire
export interface StoryCharacter {
  id: string;
  name: string;
  role: CharacterRole;
  personality: CharacterPersonality;
  background: CharacterBackground;
  development: CharacterDevelopment;
  culturalContext: CulturalContext;
}

// Rôle de personnage
export enum CharacterRole {
  PROTAGONIST = 'protagonist',
  ANTAGONIST = 'antagonist',
  SUPPORTING = 'supporting',
  MENTOR = 'mentor',
  COMIC_RELIEF = 'comic_relief',
  LOVE_INTEREST = 'love_interest'
}

// Personnalité de personnage
export interface CharacterPersonality {
  traits: string[];
  motivations: string[];
  fears: string[];
  strengths: string[];
  weaknesses: string[];
  quirks: string[];
}

// Arrière-plan de personnage
export interface CharacterBackground {
  age: number;
  occupation: string;
  family: string;
  education: string;
  culturalBackground: string;
  personalHistory: string[];
}

// Développement de personnage
export interface CharacterDevelopment {
  arc: string;
  growthPoints: string[];
  challenges: string[];
  relationships: CharacterRelationship[];
}

// Relation de personnage
export interface CharacterRelationship {
  characterId: string;
  type: RelationshipType;
  description: string;
  development: string;
}

// Type de relation
export enum RelationshipType {
  FRIEND = 'friend',
  ENEMY = 'enemy',
  FAMILY = 'family',
  ROMANTIC = 'romantic',
  MENTOR = 'mentor',
  COLLEAGUE = 'colleague',
  RIVAL = 'rival'
}

// Décor d'histoire
export interface StorySetting {
  id: string;
  name: string;
  description: string;
  timeframe: Timeframe;
  location: Location;
  atmosphere: Atmosphere;
  culturalSignificance: string;
}

// Période temporelle
export interface Timeframe {
  era: string;
  season: string;
  timeOfDay: string;
  duration: string;
  historicalContext: string;
}

// Lieu
export interface Location {
  type: LocationType;
  description: string;
  geography: string;
  climate: string;
  landmarks: string[];
}

// Type de lieu
export enum LocationType {
  URBAN = 'urban',
  RURAL = 'rural',
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  HISTORICAL = 'historical',
  FICTIONAL = 'fictional',
  CULTURAL = 'cultural'
}

// Atmosphère
export interface Atmosphere {
  mood: string;
  tension: number; // 0-1
  mystery: number; // 0-1
  romance: number; // 0-1
  danger: number; // 0-1
  comfort: number; // 0-1
}

// Chapitre d'histoire
export interface StoryChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  
  // Structure
  scenes: StoryScene[];
  
  // Interactivité
  choices: StoryChoice[];
  activities: LearningActivity[];
  
  // Progression
  objectives: ChapterObjective[];
  assessment: ChapterAssessment;
}

// Scène d'histoire
export interface StoryScene {
  id: string;
  description: string;
  dialogue: Dialogue[];
  action: string[];
  setting: string;
  characters: string[]; // character IDs
  purpose: ScenePurpose;
}

// Dialogue
export interface Dialogue {
  characterId: string;
  text: string;
  emotion: string;
  intention: string;
  subtext?: string;
}

// Objectif de scène
export enum ScenePurpose {
  EXPOSITION = 'exposition',
  CHARACTER_DEVELOPMENT = 'character_development',
  PLOT_ADVANCEMENT = 'plot_advancement',
  CONFLICT_INTRODUCTION = 'conflict_introduction',
  TENSION_BUILDING = 'tension_building',
  RESOLUTION = 'resolution'
}

// Choix d'histoire
export interface StoryChoice {
  id: string;
  text: string;
  consequences: ChoiceConsequence[];
  requiredLevel?: DifficultyLevel;
  learningValue: number; // 0-1
  branches: string[]; // chapter/scene IDs
}

// Conséquence de choix
export interface ChoiceConsequence {
  type: ConsequenceType;
  description: string;
  impact: ConsequenceImpact;
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

// Type de conséquence
export enum ConsequenceType {
  STORY_PROGRESSION = 'story_progression',
  CHARACTER_RELATIONSHIP = 'character_relationship',
  LEARNING_OPPORTUNITY = 'learning_opportunity',
  SKILL_DEVELOPMENT = 'skill_development',
  CULTURAL_INSIGHT = 'cultural_insight'
}

// Impact de conséquence
export interface ConsequenceImpact {
  magnitude: 'minor' | 'moderate' | 'major';
  valence: 'positive' | 'negative' | 'neutral';
  reversibility: 'reversible' | 'permanent';
}

// Branchement d'histoire
export interface StoryBranching {
  structure: BranchStructure;
  paths: StoryPath[];
  convergencePoints: ConvergencePoint[];
  endings: StoryEnding[];
}

// Structure de branche
export enum BranchStructure {
  LINEAR = 'linear',
  BRANCHING = 'branching',
  PARALLEL = 'parallel',
  CONVERGING = 'converging',
  CYCLICAL = 'cyclical'
}

// Chemin d'histoire
export interface StoryPath {
  id: string;
  name: string;
  description: string;
  chapters: string[]; // chapter IDs
  difficulty: DifficultyLevel;
  focus: PathFocus;
}

// Focus de chemin
export interface PathFocus {
  skills: ExerciseCategory[];
  themes: string[];
  culturalElements: string[];
  learningOutcomes: string[];
}

// Point de convergence
export interface ConvergencePoint {
  id: string;
  chapterId: string;
  description: string;
  conditions: ConvergenceCondition[];
}

// Condition de convergence
export interface ConvergenceCondition {
  type: 'choice_made' | 'skill_achieved' | 'time_elapsed' | 'chapter_completed';
  criteria: any;
  weight: number; // 0-1
}

// Fin d'histoire
export interface StoryEnding {
  id: string;
  type: ResolutionType;
  description: string;
  conditions: EndingCondition[];
  satisfaction: number; // 0-1
  learningValue: number; // 0-1
}

// Condition de fin
export interface EndingCondition {
  type: string;
  requirement: any;
  achieved: boolean;
}

// Élément d'apprentissage
export interface LearningElement {
  id: string;
  type: 'vocabulary' | 'grammar' | 'culture' | 'pronunciation' | 'idiom';
  content: string;
  explanation: string;
  examples: string[];
  exercises: ExerciseReference[];
  importance: 'low' | 'medium' | 'high';
}

// Référence d'exercice
export interface ExerciseReference {
  exerciseId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  context: string;
}

// Élément de vocabulaire
export interface VocabularyItem {
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation?: string;
  examples: VocabularyExample[];
  difficulty: DifficultyLevel;
  frequency: number; // 0-1
  cultural?: CulturalNote;
}

// Exemple de vocabulaire
export interface VocabularyExample {
  sentence: string;
  context: string;
  translation?: string;
  audio?: string;
}

// Note culturelle
export interface CulturalNote {
  description: string;
  significance: string;
  usage: string;
  cautions?: string[];
}

// Élément culturel
export interface CulturalElement {
  id: string;
  type: CulturalTheme;
  name: string;
  description: string;
  significance: CulturalSignificance;
  representation: CulturalRepresentation;
  sensitivity: CulturalSensitivity;
}

// Signification culturelle
export interface CulturalSignificance {
  historical: string;
  contemporary: string;
  regional: string[];
  universal: string;
}

// Représentation culturelle
export interface CulturalRepresentation {
  accuracy: number; // 0-1
  authenticity: number; // 0-1
  respectfulness: number; // 0-1
  diversity: number; // 0-1
}

// Métadonnées d'histoire
export interface StoryMetadata {
  wordCount: number;
  readingLevel: DifficultyLevel;
  estimatedTime: number; // minutes
  interactivity: number; // 0-1
  
  // Pédagogiques
  learningObjectives: string[];
  skills: ExerciseCategory[];
  culturalThemes: CulturalTheme[];
  
  // Qualité
  engagement: number; // 0-1
  educational: number; // 0-1
  narrative: number; // 0-1
  cultural: number; // 0-1
}

// Adaptation d'histoire
export interface StoryAdaptation {
  id: string;
  type: AdaptationType;
  targetAudience: AudienceProfile;
  changes: AdaptationChange[];
  rationale: string;
  effectiveness: number; // 0-1
}

// Type d'adaptation
export enum AdaptationType {
  DIFFICULTY_ADJUSTMENT = 'difficulty_adjustment',
  CULTURAL_LOCALIZATION = 'cultural_localization',
  LENGTH_MODIFICATION = 'length_modification',
  STYLE_ADAPTATION = 'style_adaptation',
  INTEREST_CUSTOMIZATION = 'interest_customization'
}

// Changement d'adaptation
export interface AdaptationChange {
  element: string;
  original: string;
  adapted: string;
  reason: string;
  impact: 'minor' | 'moderate' | 'major';
}

// Activité d'apprentissage
export interface LearningActivity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  instructions: string[];
  
  // Contenu
  content: ActivityContent;
  
  // Configuration
  settings: ActivitySettings;
  
  // Évaluation
  assessment: ActivityAssessment;
}

// Type d'activité
export enum ActivityType {
  VOCABULARY_PRACTICE = 'vocabulary_practice',
  GRAMMAR_EXERCISE = 'grammar_exercise',
  COMPREHENSION_CHECK = 'comprehension_check',
  CULTURAL_EXPLORATION = 'cultural_exploration',
  CREATIVE_WRITING = 'creative_writing',
  ROLE_PLAY = 'role_play',
  DISCUSSION = 'discussion'
}

// Contenu d'activité
export interface ActivityContent {
  materials: ActivityMaterial[];
  prompts: ActivityPrompt[];
  examples: ActivityExample[];
  resources: ActivityResource[];
}

// Matériel d'activité
export interface ActivityMaterial {
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive';
  content: any;
  purpose: string;
}

// Invite d'activité
export interface ActivityPrompt {
  text: string;
  type: 'open' | 'guided' | 'structured';
  hints?: string[];
  expectations: string[];
}

// Exemple d'activité
export interface ActivityExample {
  description: string;
  demonstration: any;
  explanation: string;
}

// Ressource d'activité
export interface ActivityResource {
  type: 'reference' | 'tool' | 'support' | 'extension';
  name: string;
  description: string;
  url?: string;
}

// Paramètres d'activité
export interface ActivitySettings {
  difficulty: DifficultyLevel;
  timeLimit?: number; // minutes
  collaboration: CollaborationMode;
  feedback: ActivityFeedback;
  adaptation: ActivityAdaptation;
}

// Mode de collaboration
export enum CollaborationMode {
  INDIVIDUAL = 'individual',
  PAIR = 'pair',
  SMALL_GROUP = 'small_group',
  LARGE_GROUP = 'large_group',
  FLEXIBLE = 'flexible'
}

// Feedback d'activité
export interface ActivityFeedback {
  timing: 'immediate' | 'delayed' | 'on_request';
  type: 'corrective' | 'confirmatory' | 'explanatory' | 'motivational';
  level: 'minimal' | 'moderate' | 'detailed';
}

// Adaptation d'activité
export interface ActivityAdaptation {
  allowDifficultyAdjustment: boolean;
  allowTimeExtension: boolean;
  allowHints: boolean;
  allowSkipping: boolean;
}

// Évaluation d'activité
export interface ActivityAssessment {
  criteria: AssessmentCriteria[];
  rubric?: AssessmentRubric;
  scoring: ScoringMethod;
  feedback: FeedbackStrategy;
}

// Critères d'évaluation
export interface AssessmentCriteria {
  name: string;
  description: string;
  weight: number; // 0-1
  levels: CriteriaLevel[];
}

// Niveau de critères
export interface CriteriaLevel {
  level: number;
  description: string;
  examples: string[];
  points: number;
}

// Rubrique d'évaluation
export interface AssessmentRubric {
  name: string;
  criteria: AssessmentCriteria[];
  totalPoints: number;
  passingScore: number;
}

// Méthode de notation
export interface ScoringMethod {
  type: 'points' | 'percentage' | 'rubric' | 'pass_fail';
  scale: ScoreScale;
  weighting: ScoreWeighting;
}

// Échelle de score
export interface ScoreScale {
  min: number;
  max: number;
  increment: number;
  labels?: ScoreLabel[];
}

// Label de score
export interface ScoreLabel {
  value: number;
  label: string;
  description: string;
}

// Pondération de score
export interface ScoreWeighting {
  components: ScoreComponent[];
  formula: string;
}

// Composant de score
export interface ScoreComponent {
  name: string;
  weight: number; // 0-1
  source: string;
}

// Stratégie de feedback
export interface FeedbackStrategy {
  immediate: ImmediateFeedback;
  summary: SummaryFeedback;
  improvement: ImprovementFeedback;
}

// Feedback immédiat
export interface ImmediateFeedback {
  enabled: boolean;
  type: 'correct_incorrect' | 'detailed' | 'hint_based';
  encouragement: boolean;
}

// Feedback de résumé
export interface SummaryFeedback {
  enabled: boolean;
  includeScore: boolean;
  includeStrengths: boolean;
  includeImprovements: boolean;
  includeNext: boolean;
}

// Feedback d'amélioration
export interface ImprovementFeedback {
  enabled: boolean;
  personalized: boolean;
  actionable: boolean;
  resourceLinks: boolean;
}

// Objectif de chapitre
export interface ChapterObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  measurable: boolean;
  criteria: ObjectiveCriteria;
}

// Type d'objectif
export enum ObjectiveType {
  KNOWLEDGE = 'knowledge',
  COMPREHENSION = 'comprehension',
  APPLICATION = 'application',
  ANALYSIS = 'analysis',
  SYNTHESIS = 'synthesis',
  EVALUATION = 'evaluation'
}

// Critères d'objectif
export interface ObjectiveCriteria {
  performance: string;
  condition: string;
  standard: string;
  measurement: MeasurementMethod;
}

// Méthode de mesure
export interface MeasurementMethod {
  type: 'quiz' | 'activity' | 'observation' | 'self_assessment';
  threshold: number;
  multiple: boolean;
}

// Évaluation de chapitre
export interface ChapterAssessment {
  objectives: ObjectiveAssessment[];
  activities: ActivityResult[];
  overall: OverallAssessment;
  next: NextSteps;
}

// Évaluation d'objectif
export interface ObjectiveAssessment {
  objectiveId: string;
  achieved: boolean;
  score: number; // 0-1
  evidence: string[];
  gaps: string[];
}

// Résultat d'activité
export interface ActivityResult {
  activityId: string;
  completed: boolean;
  score: number;
  time: number; // seconds
  attempts: number;
  feedback: string;
}

// Évaluation globale
export interface OverallAssessment {
  completion: number; // 0-1
  comprehension: number; // 0-1
  engagement: number; // 0-1
  retention: number; // 0-1
  mastery: number; // 0-1
}

// Prochaines étapes
export interface NextSteps {
  recommendations: string[];
  resources: LearningResource[];
  timeline: string;
  priorities: string[];
}

// Ressource d'apprentissage
export interface LearningResource {
  type: 'lesson' | 'exercise' | 'video' | 'article' | 'game';
  title: string;
  description: string;
  url?: string;
  difficulty: DifficultyLevel;
  estimatedTime: number; // minutes
}

// États du système de génération de contenu
export interface ContentGenerationState {
  // Contenus actifs
  generatedContent: Map<string, GeneratedContent>;
  configurations: Map<string, ContentGenerationConfig>;
  userProfiles: Map<string, UserProfile>;
  
  // Cache et performance
  contentCache: Map<string, CachedContent>;
  generationQueue: GenerationRequest[];
  
  // Statistiques globales
  globalStats: GlobalGenerationStats;
  
  // État système
  systemStatus: GenerationSystemStatus;
  
  // Erreurs et logs
  errors: GenerationError[];
  performanceLogs: PerformanceLog[];
}

// Contenu en cache
export interface CachedContent {
  content: GeneratedContent;
  cacheKey: string;
  expiry: number;
  hits: number;
  lastAccessed: number;
}

// Demande de génération
export interface GenerationRequest {
  id: string;
  configId: string;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: number;
  estimatedTime: number;
  progress: GenerationProgress;
}

// Progression de génération
export interface GenerationProgress {
  stage: GenerationStage;
  percentage: number; // 0-1
  currentTask: string;
  estimatedTimeRemaining: number; // seconds
  errors: GenerationError[];
}

// Étape de génération
export enum GenerationStage {
  QUEUED = 'queued',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  VALIDATING = 'validating',
  OPTIMIZING = 'optimizing',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Statistiques globales de génération
export interface GlobalGenerationStats {
  totalGenerated: number;
  totalRequests: number;
  averageGenerationTime: number; // seconds
  successRate: number; // 0-1
  
  // Par type
  byContentType: Record<ContentType, ContentTypeStats>;
  
  // Par difficulté
  byDifficulty: Record<DifficultyLevel, DifficultyStats>;
  
  // Qualité
  averageQuality: number; // 0-1
  userSatisfaction: number; // 0-5
  
  // Performance
  systemLoad: number; // 0-1
  queueLength: number;
  averageWaitTime: number; // seconds
}

// Statistiques par type de contenu
export interface ContentTypeStats {
  generated: number;
  averageTime: number; // seconds
  averageQuality: number; // 0-1
  successRate: number; // 0-1
  popularityScore: number; // 0-1
}

// Statistiques par difficulté
export interface DifficultyStats {
  generated: number;
  averageComplexity: number; // 0-1
  averageCompletionRate: number; // 0-1
  userPreference: number; // 0-1
}

// Statut du système de génération
export interface GenerationSystemStatus {
  isOnline: boolean;
  capacity: SystemCapacity;
  health: SystemHealth;
  maintenance: MaintenanceInfo;
}

// Capacité système
export interface SystemCapacity {
  maxConcurrent: number;
  currentActive: number;
  queueCapacity: number;
  currentQueue: number;
  utilizationRate: number; // 0-1
}

// Santé système
export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: ComponentHealth[];
  lastCheck: number;
  uptime: number; // seconds
}

// Santé des composants
export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  metrics: HealthMetric[];
  lastCheck: number;
}

// Métrique de santé
export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold: { warning: number; error: number };
  trend: 'improving' | 'stable' | 'degrading';
}

// Information de maintenance
export interface MaintenanceInfo {
  scheduled: MaintenanceWindow[];
  ongoing: MaintenanceActivity[];
  lastMaintenance: number;
  nextMaintenance: number;
}

// Fenêtre de maintenance
export interface MaintenanceWindow {
  start: number;
  end: number;
  type: 'routine' | 'emergency' | 'upgrade';
  description: string;
  impact: 'none' | 'minimal' | 'moderate' | 'severe';
}

// Activité de maintenance
export interface MaintenanceActivity {
  id: string;
  type: string;
  description: string;
  progress: number; // 0-1
  estimatedCompletion: number;
}

// Erreur de génération
export interface GenerationError {
  id: string;
  type: 'validation' | 'generation' | 'system' | 'timeout' | 'quota';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: number;
  requestId?: string;
  resolved: boolean;
}

// Log de performance
export interface PerformanceLog {
  timestamp: number;
  operation: string;
  duration: number; // milliseconds
  success: boolean;
  metadata: Record<string, any>;
}

// Actions du système de génération de contenu
export type ContentGenerationAction =
  | { type: 'GENERATE_CONTENT'; payload: { configId: string; userId: string } }
  | { type: 'VALIDATE_CONTENT'; payload: { contentId: string } }
  | { type: 'UPDATE_QUALITY'; payload: { contentId: string; assessment: QualityAssessment } }
  | { type: 'CACHE_CONTENT'; payload: { content: GeneratedContent; ttl: number } }
  | { type: 'PERSONALIZE_CONTENT'; payload: { contentId: string; userProfile: UserProfile } }
  | { type: 'GENERATE_VARIATIONS'; payload: { contentId: string; variationTypes: string[] } }
  | { type: 'UPDATE_STATS'; payload: { contentId: string; usage: UsageStatistics } };

// Constantes
export const CONTENT_GENERATION_CONSTANTS = {
  // Limites par défaut
  DEFAULT_LIMITS: {
    MAX_GENERATION_TIME: 300000, // 5 minutes
    MAX_QUEUE_SIZE: 1000,
    MAX_CONTENT_LENGTH: 10000, // characters
    MAX_VARIATIONS: 5
  },
  
  // Seuils de qualité
  QUALITY_THRESHOLDS: {
    MINIMUM_ACCEPTABLE: 0.6,
    GOOD: 0.75,
    EXCELLENT: 0.9
  },
  
  // Cache
  CACHE_SETTINGS: {
    DEFAULT_TTL: 3600000, // 1 hour
    MAX_CACHE_SIZE: 10000,
    CLEANUP_INTERVAL: 300000 // 5 minutes
  },
  
  // Performance
  PERFORMANCE_TARGETS: {
    AVERAGE_GENERATION_TIME: 30000, // 30 seconds
    SUCCESS_RATE: 0.95,
    USER_SATISFACTION: 4.0 // out of 5
  }
} as const;