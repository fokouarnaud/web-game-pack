package com.dialectgame.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ChatModel primaryChatModel;
    
    @Qualifier("fallbackChatModel")
    private final ChatModel fallbackChatModel;

    @Value("${app.ai.enable-fallback:true}")
    private boolean enableFallback;

    public String generateConversationResponse(String userMessage, String context, String language) {
        String template = """
            Tu es un assistant pédagogique pour l'apprentissage du français.
            
            Contexte de la leçon: {context}
            Langue d'apprentissage: {language}
            Message de l'utilisateur: {userMessage}
            
            Réponds de manière naturelle et pédagogique en français, en adaptant ton niveau de langue.
            Corrige les erreurs si nécessaire et encourage l'apprenant.
            """;

        PromptTemplate promptTemplate = new PromptTemplate(template);
        Prompt prompt = promptTemplate.create(Map.of(
            "context", context,
            "language", language,
            "userMessage", userMessage
        ));

        return callAIWithFallback(prompt);
    }

    public String generateVoiceFeedback(String transcribedText, String expectedText, double confidenceScore) {
        String template = """
            Analyse de la prononciation:
            - Texte attendu: {expectedText}
            - Texte transcrit: {transcribedText}
            - Score de confiance: {confidenceScore}
            
            Génère un feedback constructif en français sur la prononciation.
            Sois encourageant et donne des conseils spécifiques.
            """;

        PromptTemplate promptTemplate = new PromptTemplate(template);
        Prompt prompt = promptTemplate.create(Map.of(
            "expectedText", expectedText,
            "transcribedText", transcribedText,
            "confidenceScore", String.valueOf(confidenceScore)
        ));

        return callAIWithFallback(prompt);
    }

    public String generateLessonContent(String topic, String difficultyLevel, String language) {
        String template = """
            Génère le contenu d'une leçon de langue française.
            
            Sujet: {topic}
            Niveau de difficulté: {difficultyLevel}
            Langue cible: {language}
            
            Crée:
            1. Un contexte de situation réaliste
            2. Une liste de 5-8 mots de vocabulaire avec définitions
            3. 3-5 exercices pratiques
            4. Un dialogue d'intégration
            
            Format JSON structuré.
            """;

        PromptTemplate promptTemplate = new PromptTemplate(template);
        Prompt prompt = promptTemplate.create(Map.of(
            "topic", topic,
            "difficultyLevel", difficultyLevel,
            "language", language
        ));

        return callAIWithFallback(prompt);
    }

    private String callAIWithFallback(Prompt prompt) {
        try {
            log.debug("Calling primary AI model");
            ChatResponse response = primaryChatModel.call(prompt);
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.warn("Primary AI model failed: {}", e.getMessage());
            
            if (enableFallback && fallbackChatModel != null) {
                try {
                    log.debug("Calling fallback AI model");
                    ChatResponse response = fallbackChatModel.call(prompt);
                    return response.getResult().getOutput().getContent();
                } catch (Exception fallbackException) {
                    log.error("Fallback AI model also failed: {}", fallbackException.getMessage());
                    throw new AIServiceException("Both primary and fallback AI models failed", fallbackException);
                }
            } else {
                throw new AIServiceException("AI model failed and no fallback configured", e);
            }
        }
    }

    public static class AIServiceException extends RuntimeException {
        public AIServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}