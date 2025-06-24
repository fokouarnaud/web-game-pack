/**
 * Types pour le système collaboratif avancé
 * Task 17: Mode Collaboratif Avancé - Phase 4
 */

// Types de rôles collaboratifs
export enum CollaborativeRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ASSISTANT = 'assistant',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OBSERVER = 'observer'
}

// Statuts de session collaborative
export enum SessionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

// Types d'activités collaboratives
export enum ActivityType {
  LESSON = 'lesson',
  EXERCISE = 'exercise',
  QUIZ = 'quiz',
  DISCUSSION = 'discussion',
  PRESENTATION = 'presentation',
  GROUP_WORK = 'group_work',
  ASSESSMENT = 'assessment',
  BREAK = 'break'
}

// Types de contenu partagé
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  WHITEBOARD = 'whiteboard',
  SCREEN_SHARE = 'screen_share',
  EXERCISE = 'exercise'
}

// Modes de communication
export enum CommunicationMode {
  TEXT_ONLY = 'text_only',
  VOICE_ONLY = 'voice_only',
  VIDEO_CALL = 'video_call',
  SCREEN_SHARE = 'screen_share',
  WHITEBOARD = 'whiteboard'
}

// Permissions collaboratives
export enum Permission {
  VIEW = 'view',
  INTERACT = 'interact',
  EDIT = 'edit',
  SHARE = 'share',
  MODERATE = 'moderate',
  ADMIN = 'admin'
}

// Salle de classe virtuelle
export interface VirtualClassroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacher: ClassroomParticipant;
  students: ClassroomParticipant[];
  assistants: ClassroomParticipant[];
  settings: ClassroomSettings;
  currentSession?: CollaborativeSession;
  sessions: CollaborativeSession[];
  resources: ClassroomResource[];
  assignments: Assignment[];
  announcements: Announcement[];
  statistics: ClassroomStatistics;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
}

// Participant de salle de classe
export interface ClassroomParticipant {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: CollaborativeRole;
  permissions: Permission[];
  isOnline: boolean;
  lastActiveAt: number;
  joinedAt: number;
  progress: StudentProgress;
  preferences: ParticipantPreferences;
  metadata: ParticipantMetadata;
}

// Session collaborative
export interface CollaborativeSession {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  teacherId: string;
  participants: SessionParticipant[];
  activities: SessionActivity[];
  currentActivity?: SessionActivity;
  settings: SessionSettings;
  status: SessionStatus;
  startTime: number;
  endTime?: number;
  duration: number;
  recording?: SessionRecording;
  chat: ChatMessage[];
  whiteboard: WhiteboardData;
  sharedContent: SharedContent[];
  analytics: SessionAnalytics;
  createdAt: number;
  updatedAt: number;
}

// Participant de session
export interface SessionParticipant {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  role: CollaborativeRole;
  isPresent: boolean;
  joinedAt: number;
  leftAt?: number;
  interactions: ParticipantInteraction[];
  currentStatus: ParticipantStatus;
  permissions: Permission[];
  preferences: SessionPreferences;
}

// Activité de session
export interface SessionActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  content: ActivityContent;
  duration: number;
  startTime?: number;
  endTime?: number;
  isActive: boolean;
  participants: string[]; // participant IDs
  results: ActivityResult[];
  settings: ActivitySettings;
  materials: ActivityMaterial[];
  instructions: string[];
  objectives: string[];
}

// Contenu d'activité
export interface ActivityContent {
  type: ContentType;
  data: any;
  metadata: ContentMetadata;
  version: number;
  checksum: string;
  permissions: ContentPermission[];
}

// Résultat d'activité
export interface ActivityResult {
  participantId: string;
  activityId: string;
  responses: ActivityResponse[];
  score?: number;
  feedback?: TeacherFeedback;
  completedAt: number;
  timeSpent: number;
  attempts: number;
}

// Réponse d'activité
export interface ActivityResponse {
  questionId: string;
  answer: any;
  isCorrect?: boolean;
  timestamp: number;
  timeSpent: number;
  attempts: number;
}

// Contenu partagé
export interface SharedContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  data: any;
  metadata: ContentMetadata;
  shareId: string;
  sharedBy: string;
  sharedAt: number;
  permissions: ContentPermission[];
  viewers: ContentViewer[];
  comments: ContentComment[];
  versions: ContentVersion[];
}

// Message de chat
export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: CollaborativeRole;
  content: string;
  type: 'text' | 'emoji' | 'file' | 'system';
  timestamp: number;
  replyTo?: string;
  reactions: MessageReaction[];
  isPrivate: boolean;
  recipients?: string[];
  metadata: MessageMetadata;
}

// Données de tableau blanc
export interface WhiteboardData {
  id: string;
  sessionId: string;
  elements: WhiteboardElement[];
  collaborators: WhiteboardCollaborator[];
  history: WhiteboardHistoryEntry[];
  settings: WhiteboardSettings;
  currentTool: WhiteboardTool;
  zoom: number;
  viewport: WhiteboardViewport;
  lastUpdatedAt: number;
  lastUpdatedBy: string;
}

// Élément de tableau blanc
export interface WhiteboardElement {
  id: string;
  type: 'pen' | 'text' | 'shape' | 'image' | 'sticky_note';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: any;
  style: ElementStyle;
  layer: number;
  locked: boolean;
  visible: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// Devoir/Assignment
export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  instructions: string[];
  content: AssignmentContent;
  dueDate: number;
  maxScore: number;
  submissions: AssignmentSubmission[];
  rubric?: AssignmentRubric;
  settings: AssignmentSettings;
  statistics: AssignmentStatistics;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
}

// Soumission de devoir
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: SubmissionContent;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  submittedAt?: number;
  grade?: number;
  feedback?: TeacherFeedback;
  rubricScores?: RubricScore[];
  attachments: SubmissionAttachment[];
  history: SubmissionHistory[];
  timeSpent: number;
  attempts: number;
}

// Feedback enseignant
export interface TeacherFeedback {
  id: string;
  teacherId: string;
  teacherName: string;
  content: string;
  type: 'text' | 'audio' | 'video' | 'annotation';
  score?: number;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  createdAt: number;
  isPrivate: boolean;
  attachments: FeedbackAttachment[];
}

// Annonce
export interface Announcement {
  id: string;
  classroomId: string;
  title: string;
  content: string;
  type: 'info' | 'assignment' | 'reminder' | 'urgent';
  authorId: string;
  authorName: string;
  targetAudience: CollaborativeRole[];
  isVisible: boolean;
  isPinned: boolean;
  scheduledFor?: number;
  expiresAt?: number;
  attachments: AnnouncementAttachment[];
  reactions: AnnouncementReaction[];
  comments: AnnouncementComment[];
  createdAt: number;
  updatedAt: number;
}

// Ressource de salle de classe
export interface ClassroomResource {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  type: ContentType;
  category: string;
  tags: string[];
  data: any;
  metadata: ResourceMetadata;
  permissions: ResourcePermission[];
  usage: ResourceUsage;
  versions: ResourceVersion[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
}

// Progrès étudiant
export interface StudentProgress {
  studentId: string;
  classroomId: string;
  overallScore: number;
  completedActivities: number;
  totalActivities: number;
  timeSpent: number;
  lastActivity: number;
  achievements: ProgressAchievement[];
  skills: SkillProgress[];
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
  goals: LearningGoal[];
  streaks: ProgressStreak[];
}

// Paramètres de salle de classe
export interface ClassroomSettings {
  isPublic: boolean;
  allowSelfEnrollment: boolean;
  maxStudents: number;
  defaultPermissions: Permission[];
  moderationEnabled: boolean;
  recordingSetting: 'always' | 'teacher_only' | 'never';
  chatSettings: ChatSettings;
  whiteboardSettings: WhiteboardSettings;
  breakoutRoomsEnabled: boolean;
  handsUpEnabled: boolean;
  pollsEnabled: boolean;
  annotationsEnabled: boolean;
  fileUploadEnabled: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  timezone: string;
  language: string;
  theme: string;
}

// Paramètres de session
export interface SessionSettings {
  autoRecording: boolean;
  participantVideo: boolean;
  participantAudio: boolean;
  participantChat: boolean;
  participantScreenShare: boolean;
  waitingRoom: boolean;
  lobbyEnabled: boolean;
  muteOnJoin: boolean;
  raiseHandEnabled: boolean;
  reactionEnabled: boolean;
  breakoutRoomsEnabled: boolean;
  maxDuration?: number;
  autoEndEnabled: boolean;
  notificationsEnabled: boolean;
}

// Paramètres d'activité
export interface ActivitySettings {
  timeLimit?: number;
  allowRetries: boolean;
  maxAttempts: number;
  showAnswers: 'never' | 'after_submission' | 'after_due_date';
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  requireCamera: boolean;
  preventCheating: boolean;
  allowCollaboration: boolean;
  groupSize?: number;
  autoGrade: boolean;
  feedbackMode: 'immediate' | 'after_submission' | 'manual';
}

// Statistiques de salle de classe
export interface ClassroomStatistics {
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  totalHours: number;
  averageAttendance: number;
  completionRate: number;
  averageScore: number;
  engagementMetrics: EngagementMetrics;
  popularResources: PopularResource[];
  timeDistribution: TimeDistribution;
  performanceByTopic: TopicPerformance[];
  retentionRate: number;
  lastUpdated: number;
}

// Métriques d'engagement
export interface EngagementMetrics {
  chatMessages: number;
  questionsAsked: number;
  resourceViews: number;
  whiteboardInteractions: number;
  pollParticipation: number;
  averageSessionDuration: number;
  returnRate: number;
  activeParticipationRate: number;
}

// Analytics de session
export interface SessionAnalytics {
  totalParticipants: number;
  peakParticipants: number;
  averageAttendanceTime: number;
  chatActivity: number;
  whiteboardActivity: number;
  screenshareTime: number;
  questionCount: number;
  pollResponses: number;
  technicalIssues: TechnicalIssue[];
  participantFeedback: ParticipantFeedback[];
  engagementScore: number;
  completionRate: number;
}

// Problème technique
export interface TechnicalIssue {
  id: string;
  type: 'audio' | 'video' | 'connection' | 'screen_share' | 'other';
  description: string;
  participantId: string;
  timestamp: number;
  resolved: boolean;
  resolution?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Feedback de participant
export interface ParticipantFeedback {
  participantId: string;
  rating: number;
  comment?: string;
  categories: FeedbackCategory[];
  timestamp: number;
  isAnonymous: boolean;
}

// Catégorie de feedback
export interface FeedbackCategory {
  name: string;
  rating: number;
  comment?: string;
}

// Métadonnées de participant
export interface ParticipantMetadata {
  deviceInfo: DeviceInfo;
  connectionQuality: ConnectionQuality;
  preferences: ParticipantPreferences;
  accessibility: AccessibilitySettings;
  joinHistory: JoinHistory[];
  interactionHistory: InteractionHistory[];
}

// Qualité de connexion
export interface ConnectionQuality {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  lastChecked: number;
}

// Préférences de participant
export interface ParticipantPreferences {
  notifications: boolean;
  soundEffects: boolean;
  autoCamera: boolean;
  autoMicrophone: boolean;
  preferredView: 'grid' | 'speaker' | 'gallery';
  chatBubbles: boolean;
  reactionAnimations: boolean;
  backgroundBlur: boolean;
  language: string;
  timezone: string;
}

// Préférences de session
export interface SessionPreferences extends ParticipantPreferences {
  reminderMinutes: number;
  autoJoin: boolean;
  recordingConsent: boolean;
  sharePresence: boolean;
}

// Interaction de participant
export interface ParticipantInteraction {
  type: 'chat' | 'reaction' | 'poll' | 'whiteboard' | 'hand_raise' | 'question';
  timestamp: number;
  data: any;
  context?: string;
}

// Statut de participant
export interface ParticipantStatus {
  isActive: boolean;
  isTyping: boolean;
  handsRaised: boolean;
  currentTool?: string;
  lastInteraction: number;
  attentionLevel: number;
  participationScore: number;
  needsHelp: boolean;
}

// Historique de session
export interface JoinHistory {
  sessionId: string;
  joinedAt: number;
  leftAt?: number;
  duration: number;
  disconnections: number;
  interactions: number;
}

// Historique d'interaction
export interface InteractionHistory {
  date: string;
  chatMessages: number;
  questionsAsked: number;
  pollsParticipated: number;
  whiteboardTime: number;
  handsRaised: number;
  helpRequests: number;
}

// Enregistrement de session
export interface SessionRecording {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  duration: number;
  fileUrl: string;
  fileSize: number;
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high';
  hasTranscript: boolean;
  transcript?: SessionTranscript;
  chapters: RecordingChapter[];
  accessibility: RecordingAccessibility;
  permissions: RecordingPermission[];
  views: RecordingView[];
  createdAt: number;
}

// Transcription de session
export interface SessionTranscript {
  id: string;
  recordingId: string;
  language: string;
  entries: TranscriptEntry[];
  confidence: number;
  isEdited: boolean;
  editedBy?: string;
  editedAt?: number;
}

// Entrée de transcription
export interface TranscriptEntry {
  startTime: number;
  endTime: number;
  speakerId: string;
  speakerName: string;
  text: string;
  confidence: number;
  isEdited: boolean;
}

// Chapitre d'enregistrement
export interface RecordingChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
  thumbnail?: string;
  activities: string[];
  keyMoments: KeyMoment[];
}

// Moment clé
export interface KeyMoment {
  timestamp: number;
  type: 'question' | 'answer' | 'poll' | 'activity' | 'important';
  description: string;
  participants: string[];
}

// Collaborateur tableau blanc
export interface WhiteboardCollaborator {
  participantId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  tool: WhiteboardTool;
  isActive: boolean;
  permissions: Permission[];
}

// Outil tableau blanc
export interface WhiteboardTool {
  type: 'pen' | 'eraser' | 'text' | 'shape' | 'select' | 'zoom';
  size: number;
  color: string;
  opacity: number;
  style?: any;
}

// Vue tableau blanc
export interface WhiteboardViewport {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

// Entrée historique tableau blanc
export interface WhiteboardHistoryEntry {
  id: string;
  action: 'add' | 'edit' | 'delete' | 'move';
  elementId: string;
  participantId: string;
  timestamp: number;
  previousState?: any;
  newState?: any;
}

// Style d'élément
export interface ElementStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: string;
}

// Paramètres tableau blanc
export interface WhiteboardSettings {
  enabled: boolean;
  maxElements: number;
  allowGuests: boolean;
  permissions: Permission[];
  tools: WhiteboardTool[];
  canvasSize: { width: number; height: number };
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  historySize: number;
  autoSave: boolean;
  saveInterval: number;
}

// Paramètres de chat
export interface ChatSettings {
  enabled: boolean;
  allowPrivateMessages: boolean;
  allowFileSharing: boolean;
  allowEmojis: boolean;
  allowReactions: boolean;
  moderationEnabled: boolean;
  bannedWords: string[];
  messageLimit: number;
  rateLimitEnabled: boolean;
  translationEnabled: boolean;
  persistHistory: boolean;
  maxHistorySize: number;
}

// Réaction de message
export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

// Métadonnées de message
export interface MessageMetadata {
  edited: boolean;
  editedAt?: number;
  deleted: boolean;
  deletedAt?: number;
  flagged: boolean;
  flaggedBy?: string[];
  translated?: boolean;
  originalLanguage?: string;
  confidence?: number;
}

// Types supplémentaires pour compléter l'architecture
export interface ContentMetadata {
  size: number;
  format: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  checksum: string;
  uploadedAt: number;
  uploadedBy: string;
  version: number;
  tags: string[];
  language?: string;
  accessibility: AccessibilityInfo;
}

export interface ContentPermission {
  role: CollaborativeRole;
  permissions: Permission[];
  restrictions?: string[];
}

export interface ContentViewer {
  participantId: string;
  viewedAt: number;
  duration: number;
  completed: boolean;
}

export interface ContentComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
  replies: ContentComment[];
  reactions: MessageReaction[];
}

export interface ContentVersion {
  version: number;
  changes: string;
  createdBy: string;
  createdAt: number;
  data: any;
}

export interface AccessibilityInfo {
  hasAltText: boolean;
  hasTranscript: boolean;
  hasCaptions: boolean;
  hasAudioDescription: boolean;
  colorContrast?: number;
  screenReaderCompatible: boolean;
}

export interface DeviceInfo {
  id: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  capabilities: DeviceCapabilities;
}

export interface DeviceCapabilities {
  camera: boolean;
  microphone: boolean;
  speakers: boolean;
  touchScreen: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  captions: boolean;
  audioDescriptions: boolean;
  keyboardNavigation: boolean;
}

// Actions du store collaboratif
export type CollaborativeAction =
  | { type: 'JOIN_CLASSROOM'; payload: { classroomId: string; participant: ClassroomParticipant } }
  | { type: 'LEAVE_CLASSROOM'; payload: { classroomId: string; participantId: string } }
  | { type: 'START_SESSION'; payload: CollaborativeSession }
  | { type: 'END_SESSION'; payload: { sessionId: string } }
  | { type: 'UPDATE_ACTIVITY'; payload: { sessionId: string; activity: SessionActivity } }
  | { type: 'SEND_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_WHITEBOARD'; payload: { sessionId: string; elements: WhiteboardElement[] } }
  | { type: 'SHARE_CONTENT'; payload: SharedContent }
  | { type: 'SUBMIT_ASSIGNMENT'; payload: AssignmentSubmission }
  | { type: 'UPDATE_PARTICIPANT_STATUS'; payload: { participantId: string; status: ParticipantStatus } }
  | { type: 'CREATE_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'UPDATE_PROGRESS'; payload: StudentProgress };

// État du système collaboratif
export interface CollaborativeState {
  currentClassroom?: VirtualClassroom;
  currentSession?: CollaborativeSession;
  joinedClassrooms: VirtualClassroom[];
  ownedClassrooms: VirtualClassroom[];
  participant?: ClassroomParticipant;
  isConnected: boolean;
  connectionQuality: ConnectionQuality;
  notifications: CollaborativeNotification[];
  errors: CollaborativeError[];
}

export interface CollaborativeNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  primary: boolean;
}

export interface CollaborativeError {
  id: string;
  type: 'connection' | 'permission' | 'technical' | 'validation';
  message: string;
  details?: any;
  timestamp: number;
  resolved: boolean;
}

// Constantes
export const DEFAULT_CLASSROOM_SETTINGS: ClassroomSettings = {
  isPublic: false,
  allowSelfEnrollment: false,
  maxStudents: 30,
  defaultPermissions: [Permission.VIEW, Permission.INTERACT],
  moderationEnabled: true,
  recordingSetting: 'teacher_only',
  chatSettings: {
    enabled: true,
    allowPrivateMessages: false,
    allowFileSharing: true,
    allowEmojis: true,
    allowReactions: true,
    moderationEnabled: true,
    bannedWords: [],
    messageLimit: 500,
    rateLimitEnabled: true,
    translationEnabled: false,
    persistHistory: true,
    maxHistorySize: 1000
  },
  whiteboardSettings: {
    enabled: true,
    maxElements: 1000,
    allowGuests: false,
    permissions: [Permission.VIEW, Permission.EDIT],
    tools: [],
    canvasSize: { width: 1920, height: 1080 },
    backgroundColor: '#ffffff',
    gridEnabled: true,
    snapToGrid: false,
    historySize: 100,
    autoSave: true,
    saveInterval: 30000
  },
  breakoutRoomsEnabled: true,
  handsUpEnabled: true,
  pollsEnabled: true,
  annotationsEnabled: true,
  fileUploadEnabled: true,
  maxFileSize: 10485760, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png', 'gif'],
  timezone: 'UTC',
  language: 'en',
  theme: 'default'
};

// Types manquants pour compléter
export interface AssignmentContent {
  instructions: string;
  questions: AssignmentQuestion[];
  resources: AssignmentResource[];
  rubric?: AssignmentRubric;
}

export interface AssignmentQuestion {
  id: string;
  type: 'multiple_choice' | 'essay' | 'short_answer' | 'file_upload';
  question: string;
  options?: string[];
  correctAnswer?: any;
  points: number;
  required: boolean;
}

export interface AssignmentResource {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  description?: string;
}

export interface AssignmentRubric {
  id: string;
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number;
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface RubricScore {
  criterionId: string;
  levelId: string;
  points: number;
  comment?: string;
}

export interface AssignmentSettings {
  allowLateSubmissions: boolean;
  maxAttempts: number;
  timeLimit?: number;
  peerReview: boolean;
  anonymousGrading: boolean;
  groupSubmission: boolean;
  plagiarismCheck: boolean;
}

export interface AssignmentStatistics {
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  submissionRate: number;
  onTimeRate: number;
  averageTimeSpent: number;
  scoreDistribution: number[];
}

export interface SubmissionContent {
  text?: string;
  files?: SubmissionFile[];
  answers?: { [questionId: string]: any };
}

export interface SubmissionFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: number;
}

export interface SubmissionAttachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
}

export interface SubmissionHistory {
  timestamp: number;
  action: 'created' | 'updated' | 'submitted' | 'graded' | 'returned';
  userId: string;
  changes?: any;
}

export interface FeedbackAttachment {
  id: string;
  filename: string;
  type: 'audio' | 'video' | 'document' | 'image';
  url: string;
  duration?: number;
}

export interface AnnouncementAttachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
}

export interface AnnouncementReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface AnnouncementComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
  replies: AnnouncementComment[];
}

export interface ResourceMetadata extends ContentMetadata {
  category: string;
  difficulty: string;
  estimatedDuration: number;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface ResourcePermission {
  role: CollaborativeRole;
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canShare: boolean;
}

export interface ResourceUsage {
  views: number;
  downloads: number;
  shares: number;
  avgRating: number;
  ratingCount: number;
  lastAccessed: number;
}

export interface ResourceVersion {
  version: number;
  changes: string;
  createdBy: string;
  createdAt: number;
  fileUrl: string;
  fileSize: number;
}

export interface ProgressAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: string;
  value: number;
  comparison: 'gte' | 'lte' | 'eq';
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  level: number;
  experience: number;
  maxExperience: number;
  masteryPercentage: number;
  lastPracticed: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: number;
  progress: number;
  isCompleted: boolean;
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
}

export interface ProgressStreak {
  type: string;
  current: number;
  longest: number;
  lastUpdate: number;
}

export interface PopularResource {
  resourceId: string;
  title: string;
  views: number;
  rating: number;
}

export interface TimeDistribution {
  byHour: number[];
  byDay: number[];
  byWeek: number[];
  byMonth: number[];
}

export interface TopicPerformance {
  topic: string;
  averageScore: number;
  completionRate: number;
  timeSpent: number;
  difficulty: number;
}

export interface ActivityMaterial {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  required: boolean;
}

export interface RecordingAccessibility {
  hasTranscript: boolean;
  hasCaptions: boolean;
  hasAudioDescription: boolean;
  languages: string[];
}

export interface RecordingPermission {
  role: CollaborativeRole;
  canView: boolean;
  canDownload: boolean;
  canShare: boolean;
}

export interface RecordingView {
  viewerId: string;
  viewedAt: number;
  duration: number;
  completed: boolean;
}