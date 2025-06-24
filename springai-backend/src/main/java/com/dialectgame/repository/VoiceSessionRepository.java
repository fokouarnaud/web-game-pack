package com.dialectgame.repository;

import com.dialectgame.model.entity.VoiceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoiceSessionRepository extends JpaRepository<VoiceSession, Long> {

    List<VoiceSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<VoiceSession> findByUserIdAndLessonIdOrderByCreatedAtDesc(Long userId, Long lessonId);

    List<VoiceSession> findByProcessingStatus(VoiceSession.ProcessingStatus status);

    @Query("SELECT vs FROM VoiceSession vs WHERE vs.user.id = :userId AND vs.sessionType = :sessionType ORDER BY vs.createdAt DESC")
    List<VoiceSession> findByUserIdAndSessionType(@Param("userId") Long userId, @Param("sessionType") VoiceSession.SessionType sessionType);

    @Query("SELECT AVG(vs.confidenceScore) FROM VoiceSession vs WHERE vs.user.id = :userId AND vs.processingStatus = 'COMPLETED'")
    Double getAverageConfidenceScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(vs.pronunciationScore) FROM VoiceSession vs WHERE vs.user.id = :userId AND vs.processingStatus = 'COMPLETED'")
    Double getAveragePronunciationScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(vs) FROM VoiceSession vs WHERE vs.user.id = :userId AND vs.createdAt >= :startDate")
    long countSessionsByUserIdSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT vs FROM VoiceSession vs WHERE vs.processingStatus = 'PENDING' AND vs.createdAt < :timeout")
    List<VoiceSession> findTimedOutSessions(@Param("timeout") LocalDateTime timeout);
}