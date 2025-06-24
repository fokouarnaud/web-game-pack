package com.dialectgame.model.dto.lesson;

import com.dialectgame.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {

    private Long id;
    private String title;
    private String description;
    private User.DifficultyLevel difficultyLevel;
    private String language;
    private Integer order;
    private Long chapterId;
    private Integer estimatedDuration;
    private Boolean isActive;
    private LessonContentDto content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}