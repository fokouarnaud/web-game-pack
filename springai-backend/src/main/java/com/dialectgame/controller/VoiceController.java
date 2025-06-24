package com.dialectgame.controller;

import com.dialectgame.model.dto.voice.VoiceProcessingRequest;
import com.dialectgame.model.dto.voice.VoiceProcessingResponse;
import com.dialectgame.model.entity.User;
import com.dialectgame.service.voice.VoiceProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/voice")
@RequiredArgsConstructor
@Tag(name = "Voice Processing", description = "Voice recognition and analysis endpoints")
public class VoiceController {

    private final VoiceProcessingService voiceProcessingService;

    @PostMapping("/process")
    @Operation(summary = "Process audio file for speech recognition and analysis")
    public CompletableFuture<ResponseEntity<VoiceProcessingResponse>> processVoice(
            @Parameter(description = "Audio file to process") @RequestParam("audio") MultipartFile audioFile,
            @Parameter(description = "Voice processing options") @Valid @ModelAttribute VoiceProcessingRequest request,
            @AuthenticationPrincipal User user) {

        return voiceProcessingService.processVoiceAsync(audioFile, request, user)
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get voice session details")
    public ResponseEntity<VoiceProcessingResponse> getVoiceSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user) {
        
        // TODO: Implement get session by ID
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get user's voice sessions")
    public ResponseEntity<Object> getUserVoiceSessions(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // TODO: Implement get user sessions
        return ResponseEntity.ok().build();
    }
}