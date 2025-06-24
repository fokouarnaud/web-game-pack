/**
 * Service de salle de classe virtuelle avec gestion collaborative
 * Task 17: Mode Collaboratif Avancé - Phase 4
 */

import type {
  VirtualClassroom,
  CollaborativeSession,
  ClassroomParticipant,
  SessionParticipant,
  ChatMessage,
  SharedContent,
  Assignment,
  Announcement,
  StudentProgress,
  ClassroomSettings,
  SessionSettings,
  CollaborativeRole,
  SessionStatus,
  ActivityType,
  Permission
} from '../../types/collaborative';

import {
  CollaborativeRole as Role,
  SessionStatus as Status,
  ActivityType as Activity,
  Permission as Perm,
  DEFAULT_CLASSROOM_SETTINGS
} from '../../types/collaborative';

// Configuration du service
interface ClassroomConfig {
  maxParticipants: number;
  sessionTimeout: number;
  chatHistory: number;
  autoSave: boolean;
  realTimeSync: boolean;
  baseUrl: string;
}

// Gestionnaire d'événements
type ClassroomEventHandler = (event: ClassroomEvent) => void;

// Événement de salle de classe
interface ClassroomEvent {
  type: 'participant_joined' | 'participant_left' | 'session_started' | 'session_ended' | 
        'chat_message' | 'content_shared' | 'activity_updated' | 'announcement_created';
  data?: any;
  timestamp: number;
  classroomId: string;
  participantId?: string;
}

// Génération d'IDs uniques
function generateId(prefix: string = 'classroom'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Service de salle de classe
export class ClassroomService {
  private config: ClassroomConfig;
  private classrooms: Map<string, VirtualClassroom> = new Map();
  private activeSessions: Map<string, CollaborativeSession> = new Map();
  private eventHandlers: ClassroomEventHandler[] = [];
  private currentUser?: ClassroomParticipant;

  constructor(config: Partial<ClassroomConfig> = {}) {
    this.config = {
      maxParticipants: 100,
      sessionTimeout: 3600000, // 1 hour
      chatHistory: 1000,
      autoSave: true,
      realTimeSync: true,
      baseUrl: 'https://api.dialect-game.com',
      ...config
    };
  }

  // Créer une salle de classe
  async createClassroom(
    name: string,
    description: string,
    teacherId: string,
    settings: Partial<ClassroomSettings> = {}
  ): Promise<VirtualClassroom> {
    const classroomId = generateId('classroom');
    
    const teacher: ClassroomParticipant = {
      id: generateId('participant'),
      userId: teacherId,
      username: `teacher_${teacherId}`,
      displayName: 'Enseignant',
      role: Role.TEACHER,
      permissions: [Perm.VIEW, Perm.INTERACT, Perm.EDIT, Perm.SHARE, Perm.MODERATE, Perm.ADMIN],
      isOnline: true,
      lastActiveAt: Date.now(),
      joinedAt: Date.now(),
      progress: this.createEmptyProgress(teacherId, classroomId),
      preferences: this.createDefaultPreferences(),
      metadata: this.createDefaultMetadata()
    };

    const classroom: VirtualClassroom = {
      id: classroomId,
      name,
      description,
      teacherId,
      teacher,
      students: [],
      assistants: [],
      settings: { ...DEFAULT_CLASSROOM_SETTINGS, ...settings },
      sessions: [],
      resources: [],
      assignments: [],
      announcements: [],
      statistics: this.createEmptyStatistics(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false
    };

    this.classrooms.set(classroomId, classroom);
    
    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    return classroom;
  }

  // Rejoindre une salle de classe
  async joinClassroom(
    classroomId: string,
    userId: string,
    username: string,
    displayName: string,
    role: CollaborativeRole = Role.STUDENT
  ): Promise<ClassroomParticipant> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    if (classroom.students.length >= classroom.settings.maxStudents && role === Role.STUDENT) {
      throw new Error('Classroom is full');
    }

    const participant: ClassroomParticipant = {
      id: generateId('participant'),
      userId,
      username,
      displayName,
      role,
      permissions: this.getDefaultPermissions(role),
      isOnline: true,
      lastActiveAt: Date.now(),
      joinedAt: Date.now(),
      progress: this.createEmptyProgress(userId, classroomId),
      preferences: this.createDefaultPreferences(),
      metadata: this.createDefaultMetadata()
    };

    // Ajouter le participant selon son rôle
    switch (role) {
      case Role.STUDENT:
        classroom.students.push(participant);
        break;
      case Role.ASSISTANT:
        classroom.assistants.push(participant);
        break;
    }

    classroom.updatedAt = Date.now();
    this.currentUser = participant;

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    this.emitEvent({
      type: 'participant_joined',
      data: participant,
      timestamp: Date.now(),
      classroomId,
      participantId: participant.id
    });

    return participant;
  }

  // Quitter une salle de classe
  async leaveClassroom(classroomId: string, participantId: string): Promise<void> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    // Retirer le participant
    classroom.students = classroom.students.filter(p => p.id !== participantId);
    classroom.assistants = classroom.assistants.filter(p => p.id !== participantId);
    
    classroom.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    this.emitEvent({
      type: 'participant_left',
      data: { participantId },
      timestamp: Date.now(),
      classroomId,
      participantId
    });
  }

  // Démarrer une session
  async startSession(
    classroomId: string,
    title: string,
    description: string,
    settings: Partial<SessionSettings> = {}
  ): Promise<CollaborativeSession> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const sessionId = generateId('session');
    const allParticipants = [classroom.teacher, ...classroom.students, ...classroom.assistants];
    
    const session: CollaborativeSession = {
      id: sessionId,
      classroomId,
      title,
      description,
      teacherId: classroom.teacherId,
      participants: allParticipants.map(p => this.toSessionParticipant(p)),
      activities: [],
      settings: {
        autoRecording: false,
        participantVideo: true,
        participantAudio: true,
        participantChat: true,
        participantScreenShare: false,
        waitingRoom: false,
        lobbyEnabled: false,
        muteOnJoin: false,
        raiseHandEnabled: true,
        reactionEnabled: true,
        breakoutRoomsEnabled: true,
        autoEndEnabled: false,
        notificationsEnabled: true,
        ...settings
      },
      status: Status.ACTIVE,
      startTime: Date.now(),
      duration: 0,
      chat: [],
      whiteboard: this.createEmptyWhiteboard(sessionId),
      sharedContent: [],
      analytics: this.createEmptyAnalytics(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    classroom.currentSession = session;
    classroom.sessions.push(session);
    this.activeSessions.set(sessionId, session);

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    this.emitEvent({
      type: 'session_started',
      data: session,
      timestamp: Date.now(),
      classroomId,
      participantId: classroom.teacherId
    });

    return session;
  }

  // Terminer une session
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const classroom = this.classrooms.get(session.classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    session.status = Status.ENDED;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    session.updatedAt = Date.now();

    classroom.currentSession = undefined;
    this.activeSessions.delete(sessionId);

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    this.emitEvent({
      type: 'session_ended',
      data: { sessionId, duration: session.duration },
      timestamp: Date.now(),
      classroomId: session.classroomId,
      participantId: session.teacherId
    });
  }

  // Envoyer un message de chat
  async sendChatMessage(
    sessionId: string,
    senderId: string,
    content: string,
    isPrivate: boolean = false,
    recipients: string[] = []
  ): Promise<ChatMessage> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const sender = session.participants.find(p => p.userId === senderId);
    if (!sender) {
      throw new Error('Sender not found in session');
    }

    const message: ChatMessage = {
      id: generateId('message'),
      sessionId,
      senderId,
      senderName: sender.displayName,
      senderRole: sender.role,
      content,
      type: 'text',
      timestamp: Date.now(),
      reactions: [],
      isPrivate,
      recipients: isPrivate ? recipients : undefined,
      metadata: {
        edited: false,
        deleted: false,
        flagged: false
      }
    };

    session.chat.push(message);
    
    // Limiter l'historique du chat
    if (session.chat.length > this.config.chatHistory) {
      session.chat = session.chat.slice(-this.config.chatHistory);
    }

    session.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveSession(session);
    }

    this.emitEvent({
      type: 'chat_message',
      data: message,
      timestamp: Date.now(),
      classroomId: session.classroomId,
      participantId: senderId
    });

    return message;
  }

  // Partager du contenu
  async shareContent(
    sessionId: string,
    shareId: string,
    title: string,
    type: any,
    data: any,
    permissions: any[] = []
  ): Promise<SharedContent> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const content: SharedContent = {
      id: generateId('content'),
      type,
      title,
      data,
      metadata: {
        size: JSON.stringify(data).length,
        format: typeof data,
        checksum: this.generateChecksum(data),
        uploadedAt: Date.now(),
        uploadedBy: shareId,
        version: 1,
        tags: [],
        accessibility: {
          hasAltText: false,
          hasTranscript: false,
          hasCaptions: false,
          hasAudioDescription: false,
          screenReaderCompatible: true
        }
      },
      shareId,
      sharedBy: shareId,
      sharedAt: Date.now(),
      permissions,
      viewers: [],
      comments: [],
      versions: []
    };

    session.sharedContent.push(content);
    session.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveSession(session);
    }

    this.emitEvent({
      type: 'content_shared',
      data: content,
      timestamp: Date.now(),
      classroomId: session.classroomId,
      participantId: shareId
    });

    return content;
  }

  // Créer un devoir
  async createAssignment(
    classroomId: string,
    title: string,
    description: string,
    dueDate: number,
    maxScore: number,
    content: any
  ): Promise<Assignment> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const assignment: Assignment = {
      id: generateId('assignment'),
      classroomId,
      title,
      description,
      instructions: [description],
      content,
      dueDate,
      maxScore,
      submissions: [],
      settings: {
        allowLateSubmissions: true,
        maxAttempts: 1,
        peerReview: false,
        anonymousGrading: false,
        groupSubmission: false,
        plagiarismCheck: false
      },
      statistics: {
        totalSubmissions: 0,
        gradedSubmissions: 0,
        averageScore: 0,
        submissionRate: 0,
        onTimeRate: 0,
        averageTimeSpent: 0,
        scoreDistribution: []
      },
      createdBy: classroom.teacherId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false
    };

    classroom.assignments.push(assignment);
    classroom.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    return assignment;
  }

  // Créer une annonce
  async createAnnouncement(
    classroomId: string,
    title: string,
    content: string,
    type: 'info' | 'assignment' | 'reminder' | 'urgent' = 'info',
    targetAudience: CollaborativeRole[] = [Role.STUDENT]
  ): Promise<Announcement> {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const announcement: Announcement = {
      id: generateId('announcement'),
      classroomId,
      title,
      content,
      type,
      authorId: classroom.teacherId,
      authorName: classroom.teacher.displayName,
      targetAudience,
      isVisible: true,
      isPinned: type === 'urgent',
      attachments: [],
      reactions: [],
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    classroom.announcements.push(announcement);
    classroom.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveClassroom(classroom);
    }

    this.emitEvent({
      type: 'announcement_created',
      data: announcement,
      timestamp: Date.now(),
      classroomId,
      participantId: classroom.teacherId
    });

    return announcement;
  }

  // Obtenir une salle de classe
  getClassroom(classroomId: string): VirtualClassroom | undefined {
    return this.classrooms.get(classroomId);
  }

  // Obtenir une session active
  getActiveSession(sessionId: string): CollaborativeSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Obtenir les salles de classe d'un utilisateur
  getUserClassrooms(userId: string): VirtualClassroom[] {
    return Array.from(this.classrooms.values()).filter(classroom => 
      classroom.teacherId === userId ||
      classroom.students.some(s => s.userId === userId) ||
      classroom.assistants.some(a => a.userId === userId)
    );
  }

  // Enregistrer un gestionnaire d'événements
  onClassroomEvent(handler: ClassroomEventHandler): () => void {
    this.eventHandlers.push(handler);
    
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  // Mettre à jour le statut d'un participant
  async updateParticipantStatus(
    sessionId: string,
    participantId: string,
    updates: Partial<SessionParticipant>
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participantIndex = session.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }

    session.participants[participantIndex] = {
      ...session.participants[participantIndex],
      ...updates
    };

    session.updatedAt = Date.now();

    if (this.config.autoSave) {
      await this.saveSession(session);
    }
  }

  // Méthodes privées

  private toSessionParticipant(participant: ClassroomParticipant): SessionParticipant {
    return {
      id: participant.id,
      userId: participant.userId,
      username: participant.username,
      displayName: participant.displayName,
      role: participant.role,
      isPresent: participant.isOnline,
      joinedAt: Date.now(),
      interactions: [],
      currentStatus: {
        isActive: true,
        isTyping: false,
        handsRaised: false,
        lastInteraction: Date.now(),
        attentionLevel: 1.0,
        participationScore: 0,
        needsHelp: false
      },
      permissions: participant.permissions,
      preferences: {
        notifications: true,
        soundEffects: true,
        autoCamera: false,
        autoMicrophone: false,
        preferredView: 'grid',
        chatBubbles: true,
        reactionAnimations: true,
        backgroundBlur: false,
        language: 'fr',
        timezone: 'UTC',
        reminderMinutes: 15,
        autoJoin: false,
        recordingConsent: false,
        sharePresence: true
      }
    };
  }

  private createEmptyProgress(userId: string, classroomId: string): StudentProgress {
    return {
      studentId: userId,
      classroomId,
      overallScore: 0,
      completedActivities: 0,
      totalActivities: 0,
      timeSpent: 0,
      lastActivity: Date.now(),
      achievements: [],
      skills: [],
      weakAreas: [],
      strongAreas: [],
      recommendations: [],
      goals: [],
      streaks: []
    };
  }

  private createDefaultPreferences(): any {
    return {
      notifications: true,
      soundEffects: true,
      autoCamera: false,
      autoMicrophone: false,
      preferredView: 'grid',
      chatBubbles: true,
      reactionAnimations: true,
      backgroundBlur: false,
      language: 'fr',
      timezone: 'UTC'
    };
  }

  private createDefaultMetadata(): any {
    return {
      deviceInfo: {
        id: generateId('device'),
        type: 'desktop',
        os: navigator.platform,
        browser: navigator.userAgent.split(' ').pop() || 'unknown',
        capabilities: {
          camera: true,
          microphone: true,
          speakers: true,
          touchScreen: false,
          accelerometer: false,
          gyroscope: false
        }
      },
      connectionQuality: {
        bandwidth: 1000,
        latency: 50,
        packetLoss: 0,
        quality: 'good' as const,
        lastChecked: Date.now()
      },
      preferences: this.createDefaultPreferences(),
      accessibility: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        captions: false,
        audioDescriptions: false,
        keyboardNavigation: true
      },
      joinHistory: [],
      interactionHistory: []
    };
  }

  private createEmptyStatistics(): any {
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalSessions: 0,
      totalHours: 0,
      averageAttendance: 0,
      completionRate: 0,
      averageScore: 0,
      engagementMetrics: {
        chatMessages: 0,
        questionsAsked: 0,
        resourceViews: 0,
        whiteboardInteractions: 0,
        pollParticipation: 0,
        averageSessionDuration: 0,
        returnRate: 0,
        activeParticipationRate: 0
      },
      popularResources: [],
      timeDistribution: {
        byHour: new Array(24).fill(0),
        byDay: new Array(7).fill(0),
        byWeek: new Array(52).fill(0),
        byMonth: new Array(12).fill(0)
      },
      performanceByTopic: [],
      retentionRate: 0,
      lastUpdated: Date.now()
    };
  }

  private createEmptyWhiteboard(sessionId: string): any {
    return {
      id: generateId('whiteboard'),
      sessionId,
      elements: [],
      collaborators: [],
      history: [],
      settings: DEFAULT_CLASSROOM_SETTINGS.whiteboardSettings,
      currentTool: {
        type: 'pen',
        size: 2,
        color: '#000000',
        opacity: 1
      },
      zoom: 1,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
        rotation: 0
      },
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: ''
    };
  }

  private createEmptyAnalytics(): any {
    return {
      totalParticipants: 0,
      peakParticipants: 0,
      averageAttendanceTime: 0,
      chatActivity: 0,
      whiteboardActivity: 0,
      screenshareTime: 0,
      questionCount: 0,
      pollResponses: 0,
      technicalIssues: [],
      participantFeedback: [],
      engagementScore: 0,
      completionRate: 0
    };
  }

  private getDefaultPermissions(role: CollaborativeRole): Permission[] {
    switch (role) {
      case Role.TEACHER:
        return [Perm.VIEW, Perm.INTERACT, Perm.EDIT, Perm.SHARE, Perm.MODERATE, Perm.ADMIN];
      case Role.ASSISTANT:
        return [Perm.VIEW, Perm.INTERACT, Perm.EDIT, Perm.SHARE, Perm.MODERATE];
      case Role.STUDENT:
        return [Perm.VIEW, Perm.INTERACT];
      case Role.OBSERVER:
        return [Perm.VIEW];
      default:
        return [Perm.VIEW];
    }
  }

  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private emitEvent(event: ClassroomEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Classroom event handler error:', error);
      }
    });
  }

  private async saveClassroom(classroom: VirtualClassroom): Promise<void> {
    try {
      // Simulation sauvegarde - en réalité, appel API
      localStorage.setItem(`classroom-${classroom.id}`, JSON.stringify(classroom));
    } catch (error) {
      console.error('Failed to save classroom:', error);
    }
  }

  private async saveSession(session: CollaborativeSession): Promise<void> {
    try {
      // Simulation sauvegarde - en réalité, appel API
      localStorage.setItem(`session-${session.id}`, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Méthodes de simulation pour les tests
  private async simulateApiCall(delay: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Nettoyage
  destroy(): void {
    this.eventHandlers = [];
    this.classrooms.clear();
    this.activeSessions.clear();
  }
}

// Instance singleton
let classroomServiceInstance: ClassroomService | null = null;

// Obtenir l'instance du service de salle de classe
export function getClassroomService(config?: Partial<ClassroomConfig>): ClassroomService {
  if (!classroomServiceInstance) {
    classroomServiceInstance = new ClassroomService(config);
  }
  return classroomServiceInstance;
}

// Fonctions utilitaires
export function validateClassroomName(name: string): boolean {
  return name.length >= 3 && name.length <= 100;
}

export function validateSessionTitle(title: string): boolean {
  return title.length >= 1 && title.length <= 200;
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function calculateEngagementScore(participants: SessionParticipant[]): number {
  if (participants.length === 0) return 0;
  
  const totalScore = participants.reduce((sum, p) => sum + p.currentStatus.participationScore, 0);
  return totalScore / participants.length;
}

export function isValidRole(role: string): role is CollaborativeRole {
  return Object.values(Role).includes(role as CollaborativeRole);
}

// Export du service par défaut
export default ClassroomService;