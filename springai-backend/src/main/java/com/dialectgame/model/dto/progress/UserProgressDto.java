package com.dialectgame.model.dto.progress;

import com.dialectgame.model.entity.UserProgress;
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
public class UserProgressDto {

    private Long id;
    private Long userId;
    private Long lessonId;
    private String lessonTitle;
    private UserProgress.Phase currentPhase;
    private Integer currentStep;
    private Double phaseProgress;
    private Double overallProgress;
    private UserProgress.CompletionStatus status;
    private Integer score;
    private Integer timeSpent;
    private Integer attemptsCount;
    private Integer mistakesCount;
    private Map<String, Double> phaseScores;
    private Map<String, Object> detailedProgress;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}