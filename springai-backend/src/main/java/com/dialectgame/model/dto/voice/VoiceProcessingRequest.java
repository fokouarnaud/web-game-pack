package com.dialectgame.model.dto.voice;

import com.dialectgame.model.entity.VoiceSession;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceProcessingRequest {

    @NotNull
    private VoiceSession.SessionType sessionType;

    private String expectedText;

    private String language;

    private Long lessonId;

    @Builder.Default
    private Boolean enableFeedback = true;

    @Builder.Default
    private Boolean enableScoring = true;
}