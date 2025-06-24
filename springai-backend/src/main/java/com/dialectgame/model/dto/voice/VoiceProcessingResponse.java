package com.dialectgame.model.dto.voice;

import com.dialectgame.model.entity.VoiceSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceProcessingResponse {

    private Long sessionId;
    private String transcribedText;
    private Double confidenceScore;
    private Double pronunciationScore;
    private Double accuracyScore;
    private Double fluencyScore;
    private VoiceSession.ProcessingStatus processingStatus;
    private Map<String, Object> aiFeedback;
    private String errorMessage;
    private LocalDateTime createdAt;
}