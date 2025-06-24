package com.dialectgame.model.dto.lesson;

import com.dialectgame.model.entity.LessonContent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonContentDto {

    // Phase 1: Situation
    private String situationContext;
    private String situationProblem;
    private String situationMotivation;
    private String situationImageUrl;

    // Phase 2: Vocabulary
    private List<LessonContent.VocabularyWord> vocabularyWords;

    // Phase 3: Exercises
    private List<LessonContent.Exercise> exercises;

    // Phase 4: Integration
    private String integrationScenario;
    private List<LessonContent.DialogueLine> integrationDialogue;
}