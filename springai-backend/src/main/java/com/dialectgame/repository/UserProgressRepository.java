package com.dialectgame.repository;

import com.dialectgame.model.entity.User;
import com.dialectgame.model.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    List<UserProgress> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<UserProgress> findByLessonIdOrderByOverallProgressDesc(Long lessonId);

    @Query("SELECT up FROM UserProgress up WHERE up.user.id = :userId AND up.status = :status ORDER BY up.updatedAt DESC")
    List<UserProgress> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") UserProgress.CompletionStatus status);

    @Query("SELECT AVG(up.overallProgress) FROM UserProgress up WHERE up.user.id = :userId")
    Double getAverageProgressByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user.id = :userId AND up.status = 'COMPLETED'")
    long countCompletedLessonsByUserId(@Param("userId") Long userId);

    @Query("SELECT up FROM UserProgress up JOIN FETCH up.lesson WHERE up.user.id = :userId ORDER BY up.lesson.order ASC")
    List<UserProgress> findByUserIdWithLessons(@Param("userId") Long userId);

    boolean existsByUserAndLesson(User user, com.dialectgame.model.entity.Lesson lesson);
}