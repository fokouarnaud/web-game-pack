package com.dialectgame.service.voice;

import com.dialectgame.model.dto.voice.VoiceProcessingRequest;
import com.dialectgame.model.dto.voice.VoiceProcessingResponse;
import com.dialectgame.model.entity.User;
import com.dialectgame.model.entity.VoiceSession;
import com.dialectgame.repository.VoiceSessionRepository;
import com.dialectgame.service.ai.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.openai.audio.transcription.OpenAiTranscriptionModel;
import org.springframework.ai.openai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.openai.audio.transcription.AudioTranscriptionResponse;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceProcessingService {

    private final OpenAiTranscriptionModel transcriptionModel;
    private final VoiceSessionRepository voiceSessionRepository;
    private final AIService aiService;

    @Async
    @Transactional
    public CompletableFuture<VoiceProcessingResponse> processVoiceAsync(
            MultipartFile audioFile,
            VoiceProcessingRequest request,
            User user) {

        log.info("Starting voice processing for user {} with session type {}", 
                user.getId(), request.getSessionType());

        // Créer une session voice
        VoiceSession session = VoiceSession.builder()
                .user(user)
                .sessionType(request.getSessionType())
                .expectedText(request.getExpectedText())
                .language(request.getLanguage())
                .processingStatus(VoiceSession.ProcessingStatus.PROCESSING)
                .build();

        try {
            // Sauvegarder le fichier audio
            String audioFilePath = saveAudioFile(audioFile);
            session.setAudioFilePath(audioFilePath);
            session.setDurationMs(calculateAudioDuration(audioFile));

            // Sauvegarder la session
            session = voiceSessionRepository.save(session);

            // Transcrire l'audio
            String transcribedText = transcribeAudio(audioFile, request.getLanguage());
            session.setTranscribedText(transcribedText);

            // Calculer les scores
            calculateScores(session, request);

            // Générer le feedback IA si demandé
            if (request.getEnableFeedback()) {
                generateAIFeedback(session);
            }

            // Marquer comme complété
            session.setProcessingStatus(VoiceSession.ProcessingStatus.COMPLETED);
            session = voiceSessionRepository.save(session);

            log.info("Voice processing completed successfully for session {}", session.getId());

            return CompletableFuture.completedFuture(mapToResponse(session));

        } catch (Exception e) {
            log.error("Error processing voice for user {}: {}", user.getId(), e.getMessage(), e);
            
            session.setProcessingStatus(VoiceSession.ProcessingStatus.FAILED);
            session.setErrorMessage(e.getMessage());
            voiceSessionRepository.save(session);

            return CompletableFuture.completedFuture(
                VoiceProcessingResponse.builder()
                    .sessionId(session.getId())
                    .processingStatus(VoiceSession.ProcessingStatus.FAILED)
                    .errorMessage(e.getMessage())
                    .createdAt(session.getCreatedAt())
                    .build()
            );
        }
    }

    private String transcribeAudio(MultipartFile audioFile, String language) throws IOException {
        try {
            // Créer la ressource audio
            Resource audioResource = audioFile.getResource();
            
            // Configurer la requête de transcription
            AudioTranscriptionPrompt transcriptionRequest = new AudioTranscriptionPrompt(audioResource);
            
            // Effectuer la transcription
            AudioTranscriptionResponse response = transcriptionModel.call(transcriptionRequest);
            
            String transcribedText = response.getResult().getOutput();
            log.debug("Audio transcribed successfully: {}", transcribedText);
            
            return transcribedText;
            
        } catch (Exception e) {
            log.error("Error during audio transcription: {}", e.getMessage(), e);
            throw new VoiceProcessingException("Failed to transcribe audio", e);
        }
    }

    private void calculateScores(VoiceSession session, VoiceProcessingRequest request) {
        String transcribedText = session.getTranscribedText();
        String expectedText = request.getExpectedText();

        if (transcribedText != null && expectedText != null) {
            // Calculer le score de précision (similarité de texte)
            double accuracyScore = calculateTextSimilarity(transcribedText, expectedText);
            session.setAccuracyScore(accuracyScore);

            // Score de confiance basé sur la clarté de la transcription
            double confidenceScore = calculateConfidenceScore(transcribedText);
            session.setConfidenceScore(confidenceScore);

            // Score de prononciation (combinaison des deux)
            double pronunciationScore = (accuracyScore + confidenceScore) / 2.0;
            session.setPronunciationScore(pronunciationScore);

            // Score de fluidité basé sur la durée et le contenu
            double fluencyScore = calculateFluencyScore(session);
            session.setFluencyScore(fluencyScore);
        }
    }

    private double calculateTextSimilarity(String text1, String text2) {
        // Implémentation simple de similarité de texte
        // Pour une implémentation plus avancée, utiliser des bibliothèques comme Apache Commons Text
        if (text1 == null || text2 == null) return 0.0;
        
        text1 = text1.toLowerCase().trim();
        text2 = text2.toLowerCase().trim();
        
        if (text1.equals(text2)) return 1.0;
        
        // Calcul de distance de Levenshtein simplifiée
        int maxLength = Math.max(text1.length(), text2.length());
        if (maxLength == 0) return 1.0;
        
        int distance = levenshteinDistance(text1, text2);
        return 1.0 - (double) distance / maxLength;
    }

    private int levenshteinDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        
        for (int i = 0; i <= a.length(); i++) {
            for (int j = 0; j <= b.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[a.length()][b.length()];
    }

    private double calculateConfidenceScore(String transcribedText) {
        if (transcribedText == null || transcribedText.trim().isEmpty()) {
            return 0.0;
        }
        
        // Score basé sur la longueur et la cohérence du texte
        int wordCount = transcribedText.split("\\s+").length;
        double lengthScore = Math.min(1.0, wordCount / 10.0); // Normaliser sur 10 mots
        
        // Score basé sur la présence de caractères spéciaux (indication de confusion)
        long specialCharCount = transcribedText.chars().filter(ch -> !Character.isLetterOrDigit(ch) && !Character.isWhitespace(ch)).count();
        double clarityScore = Math.max(0.0, 1.0 - (specialCharCount / (double) transcribedText.length()));
        
        return (lengthScore + clarityScore) / 2.0;
    }

    private double calculateFluencyScore(VoiceSession session) {
        if (session.getDurationMs() == null || session.getTranscribedText() == null) {
            return 0.5; // Score neutre si pas assez d'informations
        }
        
        int wordCount = session.getTranscribedText().split("\\s+").length;
        double durationSeconds = session.getDurationMs() / 1000.0;
        
        // Vitesse de parole optimale: 150-200 mots par minute
        double wordsPerMinute = (wordCount / durationSeconds) * 60;
        
        if (wordsPerMinute >= 150 && wordsPerMinute <= 200) {
            return 1.0;
        } else if (wordsPerMinute >= 100 && wordsPerMinute <= 250) {
            return 0.8;
        } else {
            return 0.6;
        }
    }

    private void generateAIFeedback(VoiceSession session) {
        try {
            String feedback = aiService.generateVoiceFeedback(
                session.getTranscribedText(),
                session.getExpectedText(),
                session.getConfidenceScore()
            );
            
            Map<String, Object> aiFeedback = new HashMap<>();
            aiFeedback.put("feedback", feedback);
            aiFeedback.put("generatedAt", LocalDateTime.now());
            
            session.setAiFeedback(aiFeedback);
            
        } catch (Exception e) {
            log.warn("Failed to generate AI feedback for session {}: {}", session.getId(), e.getMessage());
        }
    }

    private String saveAudioFile(MultipartFile audioFile) throws IOException {
        String fileName = "audio_" + System.currentTimeMillis() + "_" + audioFile.getOriginalFilename();
        Path audioPath = Path.of("uploads/audio", fileName);
        
        // Créer le répertoire s'il n'existe pas
        Files.createDirectories(audioPath.getParent());
        
        // Sauvegarder le fichier
        Files.copy(audioFile.getInputStream(), audioPath, StandardCopyOption.REPLACE_EXISTING);
        
        return audioPath.toString();
    }

    private Long calculateAudioDuration(MultipartFile audioFile) {
        // Implémentation simplifiée - dans un vrai projet, utiliser une bibliothèque audio
        return audioFile.getSize() / 16000L; // Estimation approximative
    }

    private VoiceProcessingResponse mapToResponse(VoiceSession session) {
        return VoiceProcessingResponse.builder()
                .sessionId(session.getId())
                .transcribedText(session.getTranscribedText())
                .confidenceScore(session.getConfidenceScore())
                .pronunciationScore(session.getPronunciationScore())
                .accuracyScore(session.getAccuracyScore())
                .fluencyScore(session.getFluencyScore())
                .processingStatus(session.getProcessingStatus())
                .aiFeedback(session.getAiFeedback())
                .createdAt(session.getCreatedAt())
                .build();
    }

    public static class VoiceProcessingException extends RuntimeException {
        public VoiceProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}