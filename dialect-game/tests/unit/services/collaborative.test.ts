/**
 * Tests unitaires pour le système collaboratif avancé
 * Task 17: Mode Collaboratif Avancé - Phase TDD
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CollaborativeRole,
  SessionStatus,
  ActivityType,
  Permission,
  DEFAULT_CLASSROOM_SETTINGS
} from '../../../src/types/collaborative';

import {
  ClassroomService,
  getClassroomService,
  validateClassroomName,
  validateSessionTitle,
  formatDuration,
  calculateEngagementScore,
  isValidRole
} from '../../../src/services/collaborative/classroomService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock navigator
Object.defineProperty(navigator, 'platform', {
  value: 'MacIntel',
  writable: true
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  writable: true
});

describe('Collaborative System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Classroom Service', () => {
    let classroomService: ClassroomService;

    beforeEach(() => {
      classroomService = new ClassroomService({
        maxParticipants: 50,
        sessionTimeout: 1800000, // 30 minutes
        chatHistory: 500,
        autoSave: true,
        realTimeSync: true
      });
    });

    afterEach(() => {
      classroomService.destroy();
    });

    test('should create classroom successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'A test classroom for unit testing',
        'teacher-123'
      );

      expect(classroom.name).toBe('Test Classroom');
      expect(classroom.description).toBe('A test classroom for unit testing');
      expect(classroom.teacherId).toBe('teacher-123');
      expect(classroom.teacher.role).toBe(CollaborativeRole.TEACHER);
      expect(classroom.students).toEqual([]);
      expect(classroom.assistants).toEqual([]);
      expect(classroom.isArchived).toBe(false);
      expect(classroom.settings).toMatchObject(DEFAULT_CLASSROOM_SETTINGS);
    });

    test('should validate classroom name', () => {
      expect(validateClassroomName('Test')).toBe(true);
      expect(validateClassroomName('My Awesome Classroom')).toBe(true);
      expect(validateClassroomName('ab')).toBe(false); // Too short
      expect(validateClassroomName('a'.repeat(101))).toBe(false); // Too long
    });

    test('should join classroom as student', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const participant = await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      expect(participant.userId).toBe('student-456');
      expect(participant.username).toBe('student456');
      expect(participant.displayName).toBe('Student Name');
      expect(participant.role).toBe(CollaborativeRole.STUDENT);
      expect(participant.isOnline).toBe(true);
      expect(participant.permissions).toContain(Permission.VIEW);
      expect(participant.permissions).toContain(Permission.INTERACT);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.students).toHaveLength(1);
      expect(updatedClassroom?.students[0].userId).toBe('student-456');
    });

    test('should join classroom as assistant', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const participant = await classroomService.joinClassroom(
        classroom.id,
        'assistant-789',
        'assistant789',
        'Assistant Name',
        CollaborativeRole.ASSISTANT
      );

      expect(participant.role).toBe(CollaborativeRole.ASSISTANT);
      expect(participant.permissions).toContain(Permission.MODERATE);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.assistants).toHaveLength(1);
      expect(updatedClassroom?.assistants[0].userId).toBe('assistant-789');
    });

    test('should reject joining full classroom', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      // Mock classroom as full
      const classroomData = classroomService.getClassroom(classroom.id)!;
      classroomData.settings.maxStudents = 1;
      
      // First student joins successfully
      await classroomService.joinClassroom(
        classroom.id,
        'student-1',
        'student1',
        'Student 1',
        CollaborativeRole.STUDENT
      );

      // Second student should be rejected
      await expect(classroomService.joinClassroom(
        classroom.id,
        'student-2',
        'student2',
        'Student 2',
        CollaborativeRole.STUDENT
      )).rejects.toThrow('Classroom is full');
    });

    test('should leave classroom successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const participant = await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      await classroomService.leaveClassroom(classroom.id, participant.id);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.students).toHaveLength(0);
    });

    test('should start session successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'A test collaborative session'
      );

      expect(session.title).toBe('Test Session');
      expect(session.description).toBe('A test collaborative session');
      expect(session.classroomId).toBe(classroom.id);
      expect(session.teacherId).toBe('teacher-123');
      expect(session.status).toBe(SessionStatus.ACTIVE);
      expect(session.participants).toHaveLength(2); // Teacher + student
      expect(session.chat).toEqual([]);
      expect(session.sharedContent).toEqual([]);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.currentSession?.id).toBe(session.id);
    });

    test('should end session successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      // Simulate some time passing
      vi.advanceTimersByTime(5000);

      await classroomService.endSession(session.id);

      const endedSession = classroomService.getActiveSession(session.id);
      expect(endedSession).toBeUndefined(); // Should be removed from active sessions

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.currentSession).toBeUndefined();
      expect(updatedClassroom?.sessions).toHaveLength(1);
      expect(updatedClassroom?.sessions[0].status).toBe(SessionStatus.ENDED);
      expect(updatedClassroom?.sessions[0].endTime).toBeDefined();
      expect(updatedClassroom?.sessions[0].duration).toBeGreaterThan(0);
    });

    test('should send chat message successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      const message = await classroomService.sendChatMessage(
        session.id,
        'teacher-123',
        'Hello everyone!',
        false
      );

      expect(message.content).toBe('Hello everyone!');
      expect(message.senderId).toBe('teacher-123');
      expect(message.senderRole).toBe(CollaborativeRole.TEACHER);
      expect(message.type).toBe('text');
      expect(message.isPrivate).toBe(false);

      const updatedSession = classroomService.getActiveSession(session.id);
      expect(updatedSession?.chat).toHaveLength(1);
      expect(updatedSession?.chat[0].content).toBe('Hello everyone!');
    });

    test('should send private chat message', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const student = await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      const message = await classroomService.sendChatMessage(
        session.id,
        'teacher-123',
        'Private message for you',
        true,
        ['student-456']
      );

      expect(message.isPrivate).toBe(true);
      expect(message.recipients).toEqual(['student-456']);
    });

    test('should share content successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      const testData = { 
        slides: ['Slide 1', 'Slide 2'], 
        currentSlide: 0 
      };

      const content = await classroomService.shareContent(
        session.id,
        'teacher-123',
        'Lesson Slides',
        'presentation',
        testData
      );

      expect(content.title).toBe('Lesson Slides');
      expect(content.type).toBe('presentation');
      expect(content.data).toEqual(testData);
      expect(content.sharedBy).toBe('teacher-123');

      const updatedSession = classroomService.getActiveSession(session.id);
      expect(updatedSession?.sharedContent).toHaveLength(1);
    });

    test('should create assignment successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const dueDate = Date.now() + 86400000; // 24 hours from now
      const assignmentContent = {
        instructions: 'Complete the exercises',
        questions: [],
        resources: [],
      };

      const assignment = await classroomService.createAssignment(
        classroom.id,
        'Homework Assignment',
        'Complete exercises 1-10',
        dueDate,
        100,
        assignmentContent
      );

      expect(assignment.title).toBe('Homework Assignment');
      expect(assignment.description).toBe('Complete exercises 1-10');
      expect(assignment.dueDate).toBe(dueDate);
      expect(assignment.maxScore).toBe(100);
      expect(assignment.createdBy).toBe('teacher-123');
      expect(assignment.isPublished).toBe(false);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.assignments).toHaveLength(1);
    });

    test('should create announcement successfully', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const announcement = await classroomService.createAnnouncement(
        classroom.id,
        'Important Notice',
        'Please review the material before next class',
        'info',
        [CollaborativeRole.STUDENT]
      );

      expect(announcement.title).toBe('Important Notice');
      expect(announcement.content).toBe('Please review the material before next class');
      expect(announcement.type).toBe('info');
      expect(announcement.targetAudience).toEqual([CollaborativeRole.STUDENT]);
      expect(announcement.authorId).toBe('teacher-123');
      expect(announcement.isVisible).toBe(true);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.announcements).toHaveLength(1);
    });

    test('should get user classrooms correctly', async () => {
      const classroom1 = await classroomService.createClassroom(
        'Classroom 1',
        'Description 1',
        'teacher-123'
      );

      const classroom2 = await classroomService.createClassroom(
        'Classroom 2',
        'Description 2',
        'teacher-456'
      );

      await classroomService.joinClassroom(
        classroom2.id,
        'teacher-123',
        'teacher123',
        'Teacher as Student',
        CollaborativeRole.STUDENT
      );

      const userClassrooms = classroomService.getUserClassrooms('teacher-123');
      expect(userClassrooms).toHaveLength(2);
      expect(userClassrooms.map(c => c.id)).toContain(classroom1.id);
      expect(userClassrooms.map(c => c.id)).toContain(classroom2.id);
    });

    test('should handle events correctly', async () => {
      const eventHandler = vi.fn();
      const unsubscribe = classroomService.onClassroomEvent(eventHandler);

      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'participant_joined',
        data: expect.any(Object),
        timestamp: expect.any(Number),
        classroomId: classroom.id,
        participantId: expect.any(String)
      });

      unsubscribe();
    });

    test('should update participant status', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const participant = await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      await classroomService.updateParticipantStatus(
        session.id,
        participant.id,
        { isPresent: false }
      );

      const updatedSession = classroomService.getActiveSession(session.id);
      const updatedParticipant = updatedSession?.participants.find(p => p.id === participant.id);
      expect(updatedParticipant?.isPresent).toBe(false);
    });

    test('should limit chat history', async () => {
      const classroomServiceWithLimit = new ClassroomService({
        chatHistory: 3
      });

      const classroom = await classroomServiceWithLimit.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomServiceWithLimit.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      // Send more messages than the limit
      for (let i = 1; i <= 5; i++) {
        await classroomServiceWithLimit.sendChatMessage(
          session.id,
          'teacher-123',
          `Message ${i}`
        );
      }

      const updatedSession = classroomServiceWithLimit.getActiveSession(session.id);
      expect(updatedSession?.chat).toHaveLength(3);
      expect(updatedSession?.chat[0].content).toBe('Message 3');
      expect(updatedSession?.chat[2].content).toBe('Message 5');

      classroomServiceWithLimit.destroy();
    });
  });

  describe('Utility Functions', () => {
    test('should validate session title', () => {
      expect(validateSessionTitle('Valid Title')).toBe(true);
      expect(validateSessionTitle('A')).toBe(true);
      expect(validateSessionTitle('')).toBe(false);
      expect(validateSessionTitle('a'.repeat(201))).toBe(false);
    });

    test('should format duration correctly', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(3665000)).toBe('1h 1m');
      expect(formatDuration(7325000)).toBe('2h 2m');
    });

    test('should calculate engagement score', () => {
      const participants = [
        {
          id: '1',
          userId: 'user1',
          username: 'user1',
          displayName: 'User 1',
          role: CollaborativeRole.STUDENT,
          isPresent: true,
          joinedAt: Date.now(),
          interactions: [],
          currentStatus: {
            isActive: true,
            isTyping: false,
            handsRaised: false,
            lastInteraction: Date.now(),
            attentionLevel: 0.8,
            participationScore: 0.7,
            needsHelp: false
          },
          permissions: [Permission.VIEW],
          preferences: {
            notifications: true,
            soundEffects: true,
            autoCamera: false,
            autoMicrophone: false,
            preferredView: 'grid' as const,
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
        },
        {
          id: '2',
          userId: 'user2',
          username: 'user2',
          displayName: 'User 2',
          role: CollaborativeRole.STUDENT,
          isPresent: true,
          joinedAt: Date.now(),
          interactions: [],
          currentStatus: {
            isActive: true,
            isTyping: false,
            handsRaised: false,
            lastInteraction: Date.now(),
            attentionLevel: 0.9,
            participationScore: 0.9,
            needsHelp: false
          },
          permissions: [Permission.VIEW],
          preferences: {
            notifications: true,
            soundEffects: true,
            autoCamera: false,
            autoMicrophone: false,
            preferredView: 'grid' as const,
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
        }
      ];

      const score = calculateEngagementScore(participants);
      expect(score).toBe(0.8); // (0.7 + 0.9) / 2

      expect(calculateEngagementScore([])).toBe(0);
    });

    test('should validate role correctly', () => {
      expect(isValidRole('student')).toBe(true);
      expect(isValidRole('teacher')).toBe(true);
      expect(isValidRole('assistant')).toBe(true);
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('invalid_role')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('Service Singleton', () => {
    test('should return same classroom service instance', () => {
      const service1 = getClassroomService();
      const service2 = getClassroomService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('Error Handling', () => {
    let classroomService: ClassroomService;

    beforeEach(() => {
      classroomService = new ClassroomService();
    });

    afterEach(() => {
      classroomService.destroy();
    });

    test('should handle invalid classroom ID', async () => {
      await expect(classroomService.joinClassroom(
        'invalid-id',
        'user-123',
        'username',
        'Display Name'
      )).rejects.toThrow('Classroom not found');
    });

    test('should handle invalid session ID', async () => {
      await expect(classroomService.sendChatMessage(
        'invalid-session-id',
        'user-123',
        'Hello'
      )).rejects.toThrow('Session not found');
    });

    test('should handle sender not in session', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      await expect(classroomService.sendChatMessage(
        session.id,
        'unknown-user',
        'Hello'
      )).rejects.toThrow('Sender not found in session');
    });

    test('should handle invalid participant for status update', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      await expect(classroomService.updateParticipantStatus(
        session.id,
        'invalid-participant-id',
        { isPresent: false }
      )).rejects.toThrow('Participant not found');
    });
  });

  describe('Performance and Scalability', () => {
    let classroomService: ClassroomService;

    beforeEach(() => {
      classroomService = new ClassroomService({
        maxParticipants: 100,
        chatHistory: 1000
      });
    });

    afterEach(() => {
      classroomService.destroy();
    });

    test('should handle many participants efficiently', async () => {
      const classroom = await classroomService.createClassroom(
        'Large Classroom',
        'Description',
        'teacher-123'
      );

      const startTime = Date.now();

      // Add many participants
      const joinPromises: Promise<any>[] = [];
      for (let i = 1; i <= 50; i++) {
        joinPromises.push(classroomService.joinClassroom(
          classroom.id,
          `student-${i}`,
          `student${i}`,
          `Student ${i}`,
          CollaborativeRole.STUDENT
        ));
      }

      await Promise.all(joinPromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000);

      const updatedClassroom = classroomService.getClassroom(classroom.id);
      expect(updatedClassroom?.students).toHaveLength(50);
    });

    test('should handle many chat messages efficiently', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      const startTime = Date.now();

      // Send many messages
      const messagePromises: Promise<any>[] = [];
      for (let i = 1; i <= 100; i++) {
        messagePromises.push(classroomService.sendChatMessage(
          session.id,
          'teacher-123',
          `Message ${i}`
        ));
      }

      await Promise.all(messagePromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000);

      const updatedSession = classroomService.getActiveSession(session.id);
      expect(updatedSession?.chat).toHaveLength(100);
    });
  });

  describe('Data Persistence', () => {
    let classroomService: ClassroomService;

    beforeEach(() => {
      classroomService = new ClassroomService({ autoSave: true });
    });

    afterEach(() => {
      classroomService.destroy();
    });

    test('should save classroom to localStorage', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `classroom-${classroom.id}`,
        expect.stringContaining('Test Classroom')
      );
    });

    test('should save session to localStorage', async () => {
      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      await classroomService.sendChatMessage(
        session.id,
        'teacher-123',
        'Hello'
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `session-${session.id}`,
        expect.stringContaining('Test Session')
      );
    });
  });

  describe('Real-time Features', () => {
    let classroomService: ClassroomService;

    beforeEach(() => {
      classroomService = new ClassroomService({ realTimeSync: true });
    });

    afterEach(() => {
      classroomService.destroy();
    });

    test('should emit events for real-time updates', async () => {
      const eventHandler = vi.fn();
      classroomService.onClassroomEvent(eventHandler);

      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      const session = await classroomService.startSession(
        classroom.id,
        'Test Session',
        'Description'
      );

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'session_started',
        data: session,
        timestamp: expect.any(Number),
        classroomId: classroom.id,
        participantId: 'teacher-123'
      });

      await classroomService.sendChatMessage(
        session.id,
        'teacher-123',
        'Hello'
      );

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'chat_message',
        data: expect.objectContaining({ content: 'Hello' }),
        timestamp: expect.any(Number),
        classroomId: classroom.id,
        participantId: 'teacher-123'
      });
    });

    test('should handle event handler errors gracefully', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = vi.fn();

      classroomService.onClassroomEvent(errorHandler);
      classroomService.onClassroomEvent(goodHandler);

      const classroom = await classroomService.createClassroom(
        'Test Classroom',
        'Description',
        'teacher-123'
      );

      await classroomService.joinClassroom(
        classroom.id,
        'student-456',
        'student456',
        'Student Name',
        CollaborativeRole.STUDENT
      );

      // Both handlers should be called despite error in first one
      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
    });
  });
});