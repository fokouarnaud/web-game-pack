package com.dialectgame.controller;

import com.dialectgame.model.dto.lesson.LessonDto;
import com.dialectgame.model.entity.User;
import com.dialectgame.service.lesson.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Lesson management endpoints")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    @Operation(summary = "Get all lessons with optional filters")
    public ResponseEntity<Page<LessonDto>> getAllLessons(
            @Parameter(description = "Language filter") @RequestParam(required = false) String language,
            @Parameter(description = "Difficulty level filter") @RequestParam(required = false) User.DifficultyLevel difficultyLevel,
            @Parameter(description = "Chapter ID filter") @RequestParam(required = false) Long chapterId,
            Pageable pageable) {
        
        Page<LessonDto> lessons = lessonService.getAllLessons(language, difficultyLevel, chapterId, pageable);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson by ID")
    public ResponseEntity<LessonDto> getLessonById(@PathVariable Long id) {
        LessonDto lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    @GetMapping("/{id}/content")
    @Operation(summary = "Get lesson content by ID")
    public ResponseEntity<LessonDto> getLessonWithContent(@PathVariable Long id) {
        LessonDto lesson = lessonService.getLessonWithContent(id);
        return ResponseEntity.ok(lesson);
    }

    @GetMapping("/user-recommendations")
    @Operation(summary = "Get personalized lesson recommendations")
    public ResponseEntity<List<LessonDto>> getUserRecommendations(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "5") int limit) {
        
        List<LessonDto> recommendations = lessonService.getRecommendationsForUser(user, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/next")
    @Operation(summary = "Get next lesson for user")
    public ResponseEntity<LessonDto> getNextLesson(@AuthenticationPrincipal User user) {
        LessonDto nextLesson = lessonService.getNextLessonForUser(user);
        return ResponseEntity.ok(nextLesson);
    }
}