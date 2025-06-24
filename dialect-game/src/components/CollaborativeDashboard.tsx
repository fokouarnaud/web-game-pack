/**
 * Dashboard collaboratif avec salles de classe et sessions temps réel
 * Task 17: Mode Collaboratif Avancé - Phase 4
 */

import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardTitle, EnhancedCardDescription } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { createToastHelpers, useToast } from './ui/toast';
import type { 
  VirtualClassroom,
  CollaborativeSession,
  ClassroomParticipant,
  ChatMessage,
  Assignment,
  Announcement,
  CollaborativeRole,
  SessionStatus
} from '../types/collaborative';
import { 
  CollaborativeRole as Role,
  SessionStatus as Status,
  Permission
} from '../types/collaborative';

import { getClassroomService } from '../services/collaborative/classroomService';

interface CollaborativeDashboardProps {
  className?: string;
}

export const CollaborativeDashboard: React.FC<CollaborativeDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const toastHelpers = createToastHelpers(toast);
  
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [currentClassroom, setCurrentClassroom] = useState<VirtualClassroom | null>(null);
  const [currentSession, setCurrentSession] = useState<CollaborativeSession | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'classroom' | 'session' | 'create'>('overview');
  const [userRole, setUserRole] = useState<CollaborativeRole>(Role.STUDENT);
  const [userId] = useState(`user-${Date.now()}`);
  const [chatMessage, setChatMessage] = useState('');
  const [newClassroomData, setNewClassroomData] = useState({
    name: '',
    description: '',
    maxStudents: 30
  });

  const classroomService = getClassroomService();

  // Initialisation et écoute des événements
  useEffect(() => {
    // Écouter les événements collaboratifs
    const unsubscribe = classroomService.onClassroomEvent((event) => {
      switch (event.type) {
        case 'participant_joined':
          toastHelpers.info('Nouveau participant', `${event.data.displayName} a rejoint la classe`);
          refreshClassrooms();
          break;
        case 'participant_left':
          toastHelpers.info('Participant parti', 'Un participant a quitté la classe');
          refreshClassrooms();
          break;
        case 'session_started':
          toastHelpers.success('Session démarrée', `"${event.data.title}" a commencé`);
          setCurrentSession(event.data);
          break;
        case 'session_ended':
          toastHelpers.info('Session terminée', 'La session collaborative est terminée');
          setCurrentSession(null);
          break;
        case 'chat_message':
          // Message déjà ajouté dans la session, pas besoin de toast pour éviter le spam
          refreshCurrentSession();
          break;
        case 'announcement_created':
          toastHelpers.warning('Nouvelle annonce', event.data.title);
          refreshClassrooms();
          break;
      }
    });

    // Charger les données initiales
    loadInitialData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Charger les données initiales
  const loadInitialData = async () => {
    try {
      // Créer quelques salles de classe de démonstration si aucune n'existe
      const userClassrooms = classroomService.getUserClassrooms(userId);
      if (userClassrooms.length === 0) {
        await createDemoClassrooms();
      }
      refreshClassrooms();
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible de charger les données initiales');
    }
  };

  // Créer des salles de classe de démonstration
  const createDemoClassrooms = async () => {
    // Classe comme enseignant
    setUserRole(Role.TEACHER);
    const teacherClassroom = await classroomService.createClassroom(
      'Français Avancé',
      'Cours de français pour niveau avancé avec exercices interactifs',
      userId
    );

    // Ajouter quelques étudiants de démonstration
    await classroomService.joinClassroom(
      teacherClassroom.id,
      'student-1',
      'marie_l',
      'Marie Leblanc',
      Role.STUDENT
    );

    await classroomService.joinClassroom(
      teacherClassroom.id,
      'student-2',
      'pierre_d',
      'Pierre Dubois',
      Role.STUDENT
    );

    // Créer une annonce
    await classroomService.createAnnouncement(
      teacherClassroom.id,
      'Bienvenue !',
      'Bienvenue dans le cours de français avancé. Nous utiliserons cette plateforme pour nos sessions collaboratives.',
      'info'
    );

    // Créer un devoir
    await classroomService.createAssignment(
      teacherClassroom.id,
      'Exercice de grammaire',
      'Complétez les exercices sur les temps du passé',
      Date.now() + 604800000, // Dans 7 jours
      100,
      {
        instructions: 'Répondez aux questions suivantes sur les temps du passé',
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'Quel est le passé composé de "aller" ?',
            options: ['je suis allé', 'j\'ai allé', 'je vais', 'j\'allais'],
            correctAnswer: 'je suis allé',
            points: 25,
            required: true
          }
        ],
        resources: []
      }
    );
  };

  // Rafraîchir la liste des salles de classe
  const refreshClassrooms = () => {
    const userClassrooms = classroomService.getUserClassrooms(userId);
    setClassrooms(userClassrooms);
  };

  // Rafraîchir la session actuelle
  const refreshCurrentSession = () => {
    if (currentSession) {
      const updatedSession = classroomService.getActiveSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
    }
  };

  // Créer une nouvelle salle de classe
  const handleCreateClassroom = async () => {
    if (!newClassroomData.name.trim()) {
      toastHelpers.error('Erreur', 'Le nom de la classe est requis');
      return;
    }

    try {
      const classroom = await classroomService.createClassroom(
        newClassroomData.name,
        newClassroomData.description,
        userId,
        { maxStudents: newClassroomData.maxStudents }
      );

      setClassrooms([...classrooms, classroom]);
      setNewClassroomData({ name: '', description: '', maxStudents: 30 });
      setCurrentView('overview');
      toastHelpers.success('Classe créée', `"${classroom.name}" a été créée avec succès`);
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible de créer la classe');
    }
  };

  // Rejoindre une salle de classe
  const handleJoinClassroom = async (classroom: VirtualClassroom) => {
    try {
      await classroomService.joinClassroom(
        classroom.id,
        userId,
        `user_${userId.slice(-4)}`,
        'Utilisateur Demo',
        Role.STUDENT
      );
      
      setCurrentClassroom(classroom);
      setCurrentView('classroom');
      refreshClassrooms();
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible de rejoindre la classe');
    }
  };

  // Démarrer une session
  const handleStartSession = async () => {
    if (!currentClassroom) return;

    try {
      const session = await classroomService.startSession(
        currentClassroom.id,
        `Session ${new Date().toLocaleDateString()}`,
        'Session collaborative de langue'
      );

      setCurrentSession(session);
      setCurrentView('session');
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible de démarrer la session');
    }
  };

  // Terminer une session
  const handleEndSession = async () => {
    if (!currentSession) return;

    try {
      await classroomService.endSession(currentSession.id);
      setCurrentSession(null);
      setCurrentView('classroom');
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible de terminer la session');
    }
  };

  // Envoyer un message de chat
  const handleSendMessage = async () => {
    if (!currentSession || !chatMessage.trim()) return;

    try {
      await classroomService.sendChatMessage(
        currentSession.id,
        userId,
        chatMessage.trim()
      );
      setChatMessage('');
    } catch (error) {
      toastHelpers.error('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  // Vue d'ensemble
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Mode Collaboratif Avancé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Salles de classe virtuelles avec sessions temps réel et correction collaborative
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Mes Classes</h3>
        <EnhancedButton onClick={() => setCurrentView('create')} variant="default">
          + Créer une classe
        </EnhancedButton>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <EnhancedCard 
            key={classroom.id}
            variant="interactive" 
            hover 
            className="cursor-pointer transform transition-all duration-200 hover:scale-105"
            onClick={() => {
              setCurrentClassroom(classroom);
              setCurrentView('classroom');
            }}
          >
            <EnhancedCardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <EnhancedCardTitle className="text-lg">{classroom.name}</EnhancedCardTitle>
                  <EnhancedCardDescription className="text-sm">
                    {classroom.description}
                  </EnhancedCardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {classroom.currentSession && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      EN COURS
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {classroom.teacherId === userId ? '👨‍🏫' : '👨‍🎓'}
                  </span>
                </div>
              </div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Étudiants:</span>
                  <span className="font-medium">{classroom.students.length}/{classroom.settings.maxStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sessions:</span>
                  <span className="font-medium">{classroom.sessions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Devoirs:</span>
                  <span className="font-medium">{classroom.assignments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annonces:</span>
                  <span className="font-medium">{classroom.announcements.length}</span>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        ))}

        {classrooms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold mb-2">Aucune classe trouvée</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Créez votre première classe ou rejoignez une classe existante
            </p>
            <EnhancedButton onClick={() => setCurrentView('create')}>
              Créer ma première classe
            </EnhancedButton>
          </div>
        )}
      </div>
    </div>
  );

  // Vue de création de classe
  const renderCreateClassroom = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Créer une nouvelle classe</h2>
        <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
          Retour
        </EnhancedButton>
      </div>

      <EnhancedCard className="max-w-2xl mx-auto">
        <EnhancedCardHeader>
          <EnhancedCardTitle>Informations de la classe</EnhancedCardTitle>
          <EnhancedCardDescription>
            Configurez votre nouvelle salle de classe virtuelle
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom de la classe *</label>
            <input
              type="text"
              placeholder="Ex: Français Débutant, Anglais Business..."
              value={newClassroomData.name}
              onChange={(e) => setNewClassroomData({ ...newClassroomData, name: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Décrivez le contenu et les objectifs de votre classe..."
              value={newClassroomData.description}
              onChange={(e) => setNewClassroomData({ ...newClassroomData, description: e.target.value })}
              className="w-full p-3 border rounded-lg h-24 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nombre maximum d'étudiants</label>
            <input
              type="number"
              min="1"
              max="100"
              value={newClassroomData.maxStudents}
              onChange={(e) => setNewClassroomData({ ...newClassroomData, maxStudents: parseInt(e.target.value) || 30 })}
              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <EnhancedButton onClick={handleCreateClassroom} className="flex-1">
              Créer la classe
            </EnhancedButton>
            <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" className="flex-1">
              Annuler
            </EnhancedButton>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );

  // Vue de classe
  const renderClassroom = () => {
    if (!currentClassroom) return null;

    const isTeacher = currentClassroom.teacherId === userId;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentClassroom.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{currentClassroom.description}</p>
          </div>
          <div className="flex gap-2">
            {isTeacher && !currentClassroom.currentSession && (
              <EnhancedButton onClick={handleStartSession}>
                Démarrer une session
              </EnhancedButton>
            )}
            {currentClassroom.currentSession && (
              <EnhancedButton onClick={() => setCurrentView('session')} variant="outline">
                Rejoindre la session
              </EnhancedButton>
            )}
            <EnhancedButton onClick={() => setCurrentView('overview')} variant="outline" size="sm">
              Retour
            </EnhancedButton>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Participants */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>Participants ({currentClassroom.students.length + 1})</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                  <span className="text-blue-600">👨‍🏫</span>
                  <span className="font-medium">{currentClassroom.teacher.displayName}</span>
                  <span className="text-xs text-blue-600">Enseignant</span>
                </div>
                {currentClassroom.students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2 p-2 border rounded">
                    <span className={student.isOnline ? '🟢' : '🔴'}></span>
                    <span>{student.displayName}</span>
                    <span className="text-xs text-gray-500">Étudiant</span>
                  </div>
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Annonces */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>Annonces récentes</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-3">
                {currentClassroom.announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{announcement.content}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {currentClassroom.announcements.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune annonce</p>
                )}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Devoirs */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>Devoirs</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-3">
                {currentClassroom.assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="border rounded p-3">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{assignment.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-orange-600">
                        À rendre: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {assignment.maxScore} pts
                      </span>
                    </div>
                  </div>
                ))}
                {currentClassroom.assignments.length === 0 && (
                  <p className="text-sm text-gray-500">Aucun devoir</p>
                )}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    );
  };

  // Vue de session
  const renderSession = () => {
    if (!currentSession) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentSession.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{currentSession.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span>👥 {currentSession.participants.length} participants</span>
              <span>⏱️ Depuis {new Date(currentSession.startTime).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {userRole === Role.TEACHER && (
              <EnhancedButton onClick={handleEndSession} variant="destructive">
                Terminer la session
              </EnhancedButton>
            )}
            <EnhancedButton onClick={() => setCurrentView('classroom')} variant="outline" size="sm">
              Retour à la classe
            </EnhancedButton>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Zone principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tableau blanc simulé */}
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>Tableau Collaboratif</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="h-64 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✏️</div>
                    <p className="text-gray-500">Tableau blanc collaboratif</p>
                    <p className="text-sm text-gray-400">Interface interactive en développement</p>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Contenu partagé */}
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>Contenu Partagé</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {currentSession.sharedContent.length > 0 ? (
                  <div className="space-y-2">
                    {currentSession.sharedContent.map((content) => (
                      <div key={content.id} className="flex items-center gap-3 p-3 border rounded">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-gray-500">
                            Partagé par {content.sharedBy} à {new Date(content.sharedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucun contenu partagé</p>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Chat et participants */}
          <div className="space-y-6">
            {/* Participants en ligne */}
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>Participants en ligne</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-2">
                  {currentSession.participants.filter(p => p.isPresent).map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm">{participant.displayName}</span>
                      {participant.role === Role.TEACHER && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                          Enseignant
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Chat */}
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>Chat de la session</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-3">
                  {/* Messages */}
                  <div className="h-48 overflow-y-auto space-y-2 border rounded p-2">
                    {currentSession.chat.map((message) => (
                      <div key={message.id} className="text-sm">
                        <span className="font-medium text-blue-600">{message.senderName}:</span>
                        <span className="ml-2">{message.content}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {currentSession.chat.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aucun message</p>
                    )}
                  </div>

                  {/* Zone de saisie */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600"
                    />
                    <EnhancedButton onClick={handleSendMessage} size="sm">
                      Envoyer
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {currentView === 'overview' && renderOverview()}
      {currentView === 'create' && renderCreateClassroom()}
      {currentView === 'classroom' && renderClassroom()}
      {currentView === 'session' && renderSession()}
    </div>
  );
};

export default CollaborativeDashboard;