package com.dialectgame.repository;

import com.dialectgame.model.entity.Lesson;
import com.dialectgame.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByLanguageAndIsActiveTrueOrderByOrderAsc(String language);

    List<Lesson> findByDifficultyLevelAndLanguageAndIsActiveTrueOrderByOrderAsc(
        User.DifficultyLevel difficultyLevel, String language);

    List<Lesson> findByChapterIdAndIsActiveTrueOrderByOrderAsc(Long chapterId);

    @Query("SELECT l FROM Lesson l WHERE l.isActive = true AND " +
           "(:language IS NULL OR l.language = :language) AND " +
           "(:difficultyLevel IS NULL OR l.difficultyLevel = :difficultyLevel) " +
           "ORDER BY l.order ASC")
    List<Lesson> findLessonsWithFilters(
        @Param("language") String language,
        @Param("difficultyLevel") User.DifficultyLevel difficultyLevel);

    @Query("SELECT l FROM Lesson l LEFT JOIN FETCH l.content WHERE l.id = :id AND l.isActive = true")
    Lesson findByIdWithContent(@Param("id") Long id);

    boolean existsByLanguageAndOrderAndIsActiveTrue(String language, Integer order);
}