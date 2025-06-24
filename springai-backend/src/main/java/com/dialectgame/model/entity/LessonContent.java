package com.dialectgame.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "lesson_contents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    // Phase 1: Situation
    @Column(name = "situation_context", columnDefinition = "TEXT")
    private String situationContext;

    @Column(name = "situation_problem", columnDefinition = "TEXT")
    private String situationProblem;

    @Column(name = "situation_motivation", columnDefinition = "TEXT")
    private String situationMotivation;

    @Column(name = "situation_image_url")
    private String situationImageUrl;

    // Phase 2: Vocabulary
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "vocabulary_words", columnDefinition = "jsonb")
    private List<VocabularyWord> vocabularyWords;

    // Phase 3: Exercises
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "exercises", columnDefinition = "jsonb")
    private List<Exercise> exercises;

    // Phase 4: Integration
    @Column(name = "integration_scenario", columnDefinition = "TEXT")
    private String integrationScenario;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "integration_dialogue", columnDefinition = "jsonb")
    private List<DialogueLine> integrationDialogue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyWord {
        private String word;
        private String pronunciation;
        private String translation;
        private String definition;
        private String example;
        private String audioUrl;
        private String imageUrl;
        private String difficulty;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Exercise {
        private String id;
        private String type; // PRONUNCIATION, TRANSLATION, COMPREHENSION
        private String question;
        private String expectedAnswer;
        private List<String> options;
        private String audioUrl;
        private String imageUrl;
        private Map<String, Object> metadata;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DialogueLine {
        private String id;
        private String speaker; // USER, NPC
        private String text;
        private String translation;
        private String audioUrl;
        private boolean isUserTurn;
        private List<String> possibleResponses;
        private Map<String, Object> metadata;
    }
}