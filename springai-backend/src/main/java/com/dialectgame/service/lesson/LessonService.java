package com.dialectgame.service.lesson;

import com.dialectgame.model.dto.lesson.LessonDto;
import com.dialectgame.model.entity.Lesson;
import com.dialectgame.model.entity.User;
import com.dialectgame.model.entity.UserProgress;
import com.dialectgame.repository.LessonRepository;
import com.dialectgame.repository.UserProgressRepository;
import com.dialectgame.service.mapper.LessonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserProgressRepository userProgressRepository;
    private final LessonMapper lessonMapper;

    @Transactional(readOnly = true)
    public Page<LessonDto> getAllLessons(String language, User.DifficultyLevel difficultyLevel, Long chapterId, Pageable pageable) {
        log.debug("Getting lessons with filters: language={}, difficulty={}, chapter={}", language, difficultyLevel, chapterId);

        Page<Lesson> lessons;
        
        if (chapterId != null) {
            lessons = lessonRepository.findByChapterIdAndIsActiveTrueOrderByOrderAsc(chapterId)
                    .stream()
                    .collect(Collectors.collectingAndThen(
                            Collectors.toList(),
                            list -> Page.empty(pageable) // TODO: Implement proper pagination
                    ));
        } else {
            List<Lesson> lessonList = lessonRepository.findLessonsWithFilters(language, difficultyLevel);
            lessons = Page.empty(pageable); // TODO: Convert list to page
        }

        return lessons.map(lessonMapper::toDto);
    }

    @Transactional(readOnly = true)
    public LessonDto getLessonById(Long id) {
        log.debug("Getting lesson by id: {}", id);

        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new LessonNotFoundException("Lesson not found with id: " + id));

        return lessonMapper.toDto(lesson);
    }

    @Transactional(readOnly = true)
    public LessonDto getLessonWithContent(Long id) {
        log.debug("Getting lesson with content by id: {}", id);

        Lesson lesson = lessonRepository.findByIdWithContent(id);
        if (lesson == null) {
            throw new LessonNotFoundException("Lesson not found with id: " + id);
        }

        return lessonMapper.toDtoWithContent(lesson);
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getRecommendationsForUser(User user, int limit) {
        log.debug("Getting recommendations for user: {}", user.getId());

        // Logique de recommandation simple
        // 1. Récupérer les leçons de la langue préférée de l'utilisateur
        // 2. Filtrer par niveau de difficulté
        // 3. Exclure les leçons déjà complétées
        
        List<Lesson> allLessons = lessonRepository.findByDifficultyLevelAndLanguageAndIsActiveTrueOrderByOrderAsc(
                user.getDifficultyLevel(), user.getPreferredLanguage());

        // Récupérer les progrès de l'utilisateur
        List<UserProgress> userProgress = userProgressRepository.findByUserIdAndStatus(
                user.getId(), UserProgress.CompletionStatus.COMPLETED);

        Set<Long> completedLessonIds = userProgress.stream()
                .map(progress -> progress.getLesson().getId())
                .collect(Collectors.toSet());

        // Filtrer les leçons non complétées
        List<Lesson> recommendations = allLessons.stream()
                .filter(lesson -> !completedLessonIds.contains(lesson.getId()))
                .limit(limit)
                .collect(Collectors.toList());

        return recommendations.stream()
                .map(lessonMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LessonDto getNextLessonForUser(User user) {
        log.debug("Getting next lesson for user: {}", user.getId());

        // Récupérer les progrès de l'utilisateur
        List<UserProgress> userProgress = userProgressRepository.findByUserIdWithLessons(user.getId());

        if (userProgress.isEmpty()) {
            // Premier utilisateur - retourner la première leçon
            List<Lesson> firstLessons = lessonRepository.findByDifficultyLevelAndLanguageAndIsActiveTrueOrderByOrderAsc(
                    user.getDifficultyLevel(), user.getPreferredLanguage());

            if (!firstLessons.isEmpty()) {
                return lessonMapper.toDto(firstLessons.get(0));
            }
        } else {
            // Trouver la prochaine leçon basée sur la progression
            UserProgress lastProgress = userProgress.stream()
                    .max((p1, p2) -> p1.getLesson().getOrder().compareTo(p2.getLesson().getOrder()))
                    .orElse(null);

            if (lastProgress != null) {
                if (lastProgress.getStatus() == UserProgress.CompletionStatus.COMPLETED) {
                    // Chercher la leçon suivante
                    Integer nextOrder = lastProgress.getLesson().getOrder() + 1;
                    List<Lesson> nextLessons = lessonRepository.findByLanguageAndIsActiveTrueOrderByOrderAsc(
                            user.getPreferredLanguage());

                    Lesson nextLesson = nextLessons.stream()
                            .filter(lesson -> lesson.getOrder().equals(nextOrder))
                            .findFirst()
                            .orElse(null);

                    if (nextLesson != null) {
                        return lessonMapper.toDto(nextLesson);
                    }
                } else {
                    // Continuer la leçon en cours
                    return lessonMapper.toDto(lastProgress.getLesson());
                }
            }
        }

        throw new LessonNotFoundException("No next lesson available for user");
    }

    public static class LessonNotFoundException extends RuntimeException {
        public LessonNotFoundException(String message) {
            super(message);
        }
    }
}