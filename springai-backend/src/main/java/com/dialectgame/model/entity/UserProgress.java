package com.dialectgame.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "user_progress", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "current_phase")
    @Enumerated(EnumType.STRING)
    private Phase currentPhase;

    @Column(name = "current_step")
    @Builder.Default
    private Integer currentStep = 0;

    @Column(name = "phase_progress")
    @Builder.Default
    private Double phaseProgress = 0.0;

    @Column(name = "overall_progress")
    @Builder.Default
    private Double overallProgress = 0.0;

    @Column(name = "completion_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CompletionStatus status = CompletionStatus.IN_PROGRESS;

    @Column(name = "score")
    private Integer score;

    @Column(name = "time_spent")
    private Integer timeSpent; // en secondes

    @Column(name = "attempts_count")
    @Builder.Default
    private Integer attemptsCount = 0;

    @Column(name = "mistakes_count")
    @Builder.Default
    private Integer mistakesCount = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "phase_scores", columnDefinition = "jsonb")
    private Map<String, Double> phaseScores;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detailed_progress", columnDefinition = "jsonb")
    private Map<String, Object> detailedProgress;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Phase {
        SITUATION, VOCABULARY, EXERCISES, INTEGRATION
    }

    public enum CompletionStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, FAILED
    }
}