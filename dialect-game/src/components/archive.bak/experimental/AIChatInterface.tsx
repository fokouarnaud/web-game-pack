/**
 * Interface de chat IA conversationnelle
 * Task 20: IA Conversationnelle - Phase 5
 */

import React, { useState, useEffect, useRef } from 'react';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardTitle } from './ui/enhanced-card';
import { EnhancedButton } from './ui/enhanced-button';
import { createToastHelpers, useToast } from './ui/toast';

interface AIChatInterfaceProps {
  className?: string;
}

// Types simplifiés pour l'interface
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  type: 'text' | 'correction' | 'feedback';
  corrections?: Correction[];
  analysis?: MessageAnalysis;
}

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation';
}

interface MessageAnalysis {
  errors: number;
  complexity: number;
  engagement: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface BotPersonality {
  id: string;
  name: string;
  avatar: string;
  description: string;
  style: 'friendly' | 'formal' | 'encouraging';
}

const BOT_PERSONALITIES: BotPersonality[] = [
  {
    id: 'sofia',
    name: 'Sofia',
    avatar: '👩‍🏫',
    description: 'Tutrice patiente spécialisée en grammaire',
    style: 'encouraging'
  },
  {
    id: 'alex',
    name: 'Alex',
    avatar: '🗣️',
    description: 'Partenaire de conversation décontracté',
    style: 'friendly'
  },
  {
    id: 'marie',
    name: 'Marie',
    avatar: '👩‍💼',
    description: 'Professeure formelle pour français professionnel',
    style: 'formal'
  }
];

// Service IA simulé
class MockAIService {
  private currentPersonality: BotPersonality = BOT_PERSONALITIES[0];
  private conversationHistory: ChatMessage[] = [];
  
  setPersonality(personality: BotPersonality) {
    this.currentPersonality = personality;
  }
  
  async analyzeMessage(content: string): Promise<MessageAnalysis> {
    // Simulation d'analyse
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    const wordCount = content.split(' ').length;
    const hasQuestionMark = content.includes('?');
    const complexity = Math.min(1, wordCount / 20);
    
    return {
      errors: Math.floor(Math.random() * 3),
      complexity,
      engagement: hasQuestionMark ? 0.8 : 0.6,
      level: complexity < 0.3 ? 'beginner' : complexity < 0.7 ? 'intermediate' : 'advanced'
    };
  }
  
  async generateResponse(userMessage: string, analysis: MessageAnalysis): Promise<{
    response: string;
    corrections: Correction[];
  }> {
    // Simulation de génération de réponse
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const corrections: Correction[] = [];
    
    // Générer corrections si des erreurs sont détectées
    if (analysis.errors > 0) {
      corrections.push({
        original: 'je suis',
        corrected: 'Je suis',
        explanation: 'Les phrases commencent par une majuscule',
        type: 'grammar'
      });
    }
    
    // Générer réponse contextuelle
    const responses = this.getContextualResponses(userMessage, analysis);
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return { response, corrections };
  }
  
  private getContextualResponses(userMessage: string, analysis: MessageAnalysis): string[] {
    const isQuestion = userMessage.includes('?');
    const style = this.currentPersonality.style;
    
    const baseResponses = {
      friendly: [
        "C'est super intéressant ! Dis-moi en plus 😊",
        "J'adore cette conversation ! Continue comme ça !",
        "Ah oui ? Et qu'est-ce que tu en penses ?",
        "Cool ! Moi aussi j'aimerais savoir ça !"
      ],
      encouraging: [
        "Excellente question ! Laissez-moi vous expliquer...",
        "Très bien ! Vous faites de bons progrès !",
        "C'est exactement le bon type de question à poser.",
        "Bravo ! Continuons sur cette lancée."
      ],
      formal: [
        "C'est une observation pertinente. Pouvez-vous développer ?",
        "Je vous remercie pour cette question intéressante.",
        "Permettez-moi de vous donner des précisions sur ce point.",
        "Votre réflexion est tout à fait justifiée."
      ]
    };
    
    const responses = baseResponses[style] || baseResponses.friendly;
    
    // Adapter selon le niveau
    if (analysis.level === 'beginner') {
      responses.push("C'est très bien pour commencer ! 👍");
      responses.push("Continuez, vous apprenez vite !");
    } else if (analysis.level === 'advanced') {
      responses.push("Votre niveau de français est impressionnant !");
      responses.push("Nous pouvons aborder des sujets plus complexes si vous voulez.");
    }
    
    if (isQuestion) {
      responses.push("Quelle excellente question ! Voici ma réponse...");
    }
    
    return responses;
  }
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const toastHelpers = createToastHelpers(toast);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState<BotPersonality>(BOT_PERSONALITIES[0]);
  const [sessionStats, setSessionStats] = useState({
    messageCount: 0,
    errorsCount: 0,
    averageComplexity: 0,
    sessionDuration: 0
  });
  const [showCorrections, setShowCorrections] = useState(true);
  const [conversationMode, setConversationMode] = useState<'practice' | 'tutoring' | 'casual'>('practice');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useRef(new MockAIService());
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    // Message de bienvenue initial
    if (messages.length === 0) {
      addWelcomeMessage();
    }
  }, [currentPersonality]);

  useEffect(() => {
    // Auto-scroll vers le bas
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mettre à jour la personnalité dans le service
    aiService.current.setPersonality(currentPersonality);
  }, [currentPersonality]);

  const addWelcomeMessage = () => {
    const welcomeMessages = {
      practice: `Salut ! Je suis ${currentPersonality.name} ${currentPersonality.avatar}. Prêt pour une conversation en français ? Parle-moi de ta journée !`,
      tutoring: `Bonjour ! Je suis ${currentPersonality.name}, votre tutrice IA. Je suis là pour vous aider à améliorer votre français. Par quoi souhaitez-vous commencer ?`,
      casual: `Hey ! Je suis ${currentPersonality.name} ! De quoi as-tu envie de parler aujourd'hui ? 😊`
    };

    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: welcomeMessages[conversationMode],
      sender: 'ai',
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Analyser le message utilisateur
      const analysis = await aiService.current.analyzeMessage(inputMessage);
      
      // Générer réponse IA
      const { response, corrections } = await aiService.current.generateResponse(inputMessage, analysis);
      
      // Ajouter l'analyse au message utilisateur
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, analysis, corrections: corrections.length > 0 ? corrections : undefined }
          : msg
      ));

      // Ajouter la réponse IA
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        content: response,
        sender: 'ai',
        timestamp: Date.now(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Mettre à jour les statistiques
      setSessionStats(prev => ({
        messageCount: prev.messageCount + 1,
        errorsCount: prev.errorsCount + analysis.errors,
        averageComplexity: (prev.averageComplexity * prev.messageCount + analysis.complexity) / (prev.messageCount + 1),
        sessionDuration: Date.now() - sessionStartTime.current
      }));

      // Afficher les corrections si nécessaire
      if (corrections.length > 0 && showCorrections) {
        setTimeout(() => {
          toastHelpers.info('Corrections disponibles', 'J\'ai repéré quelques améliorations possibles !');
        }, 1000);
      }

    } catch (error) {
      toastHelpers.error('Erreur IA', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setSessionStats({
      messageCount: 0,
      errorsCount: 0,
      averageComplexity: 0,
      sessionDuration: 0
    });
    sessionStartTime.current = Date.now();
    addWelcomeMessage();
    toastHelpers.success('Conversation réinitialisée', 'Nouvelle conversation démarrée !');
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity < 0.3) return 'text-green-600';
    if (complexity < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header avec configuration */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IA Conversationnelle
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Conversez avec {currentPersonality.name} pour améliorer votre français
          </p>
        </div>

        <div className="flex gap-2">
          <EnhancedButton onClick={resetConversation} variant="ghost" size="sm">
            🔄 Nouveau
          </EnhancedButton>
          <EnhancedButton 
            onClick={() => setShowCorrections(!showCorrections)} 
            variant="ghost" 
            size="sm"
            className={showCorrections ? 'bg-blue-100' : ''}
          >
            {showCorrections ? '✅' : '❌'} Corrections
          </EnhancedButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Configuration latérale */}
        <div className="lg:col-span-1 space-y-4">
          {/* Personnalités */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-lg">Tuteur IA</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-3">
              {BOT_PERSONALITIES.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => setCurrentPersonality(personality)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    currentPersonality.id === personality.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{personality.avatar}</span>
                    <span className="font-medium">{personality.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {personality.description}
                  </p>
                </button>
              ))}
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Mode de conversation */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-lg">Mode</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-2">
                {[
                  { id: 'practice', label: '🗣️ Pratique', desc: 'Conversation libre' },
                  { id: 'tutoring', label: '👩‍🏫 Tutorat', desc: 'Leçons guidées' },
                  { id: 'casual', label: '😊 Décontracté', desc: 'Discussion amicale' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setConversationMode(mode.id as any);
                      resetConversation();
                    }}
                    className={`w-full p-2 rounded border text-left ${
                      conversationMode === mode.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-gray-600">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Statistiques */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="text-lg">Session</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="font-mono">{sessionStats.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Erreurs:</span>
                <span className="font-mono text-red-600">{sessionStats.errorsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Complexité:</span>
                <span className={`font-mono ${getComplexityColor(sessionStats.averageComplexity)}`}>
                  {(sessionStats.averageComplexity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Durée:</span>
                <span className="font-mono">{formatDuration(sessionStats.sessionDuration)}</span>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>

        {/* Interface de chat */}
        <div className="lg:col-span-3">
          <EnhancedCard className="h-[600px] flex flex-col">
            {/* Zone de messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                    {/* Message principal */}
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Analyse du message */}
                      {message.analysis && message.sender === 'user' && (
                        <div className="mt-2 text-xs opacity-75">
                          <div className="flex gap-4">
                            <span>Niveau: {message.analysis.level}</span>
                            <span>Erreurs: {message.analysis.errors}</span>
                            <span>Engagement: {(message.analysis.engagement * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Corrections */}
                    {message.corrections && message.corrections.length > 0 && showCorrections && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          💡 Corrections suggérées:
                        </div>
                        {message.corrections.map((correction, index) => (
                          <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                            <span className="line-through">{correction.original}</span>
                            {' → '}
                            <span className="font-medium">{correction.corrected}</span>
                            <div className="text-xs mt-1">{correction.explanation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-right text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'order-2 ml-2 bg-blue-500 text-white' 
                      : 'order-1 mr-2 bg-gray-200'
                  }`}>
                    {message.sender === 'user' ? '👤' : currentPersonality.avatar}
                  </div>
                </div>
              ))}

              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span>{currentPersonality.avatar}</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Tapez votre message à ${currentPersonality.name}...`}
                  className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isTyping}
                />
                <EnhancedButton
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6"
                >
                  {isTyping ? '⏳' : '📤'} Envoyer
                </EnhancedButton>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Appuyez sur Entrée pour envoyer, Maj+Entrée pour un retour à la ligne
              </div>
            </div>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;