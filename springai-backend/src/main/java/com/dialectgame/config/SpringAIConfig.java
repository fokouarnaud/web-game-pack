package com.dialectgame.config;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.audio.transcription.OpenAiTranscriptionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SpringAIConfig {

    @Value("${app.ai.provider:ollama}")
    private String primaryProvider;

    @Value("${app.ai.fallback-provider:openai}")
    private String fallbackProvider;

    @Value("${app.ai.enable-fallback:true}")
    private boolean enableFallback;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "ollama", matchIfMissing = true)
    public ChatModel primaryOllamaChatModel(OllamaChatModel ollamaChatModel) {
        return ollamaChatModel;
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
    public ChatModel primaryOpenAiChatModel(OpenAiChatModel openAiChatModel) {
        return openAiChatModel;
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.ai.provider", havingValue = "anthropic")
    public ChatModel primaryAnthropicChatModel(AnthropicChatModel anthropicChatModel) {
        return anthropicChatModel;
    }

    @Bean("fallbackChatModel")
    @ConditionalOnProperty(name = "app.ai.enable-fallback", havingValue = "true")
    public ChatModel fallbackChatModel(
            OpenAiChatModel openAiChatModel,
            OllamaChatModel ollamaChatModel,
            AnthropicChatModel anthropicChatModel) {
        
        return switch (fallbackProvider.toLowerCase()) {
            case "openai" -> openAiChatModel;
            case "anthropic" -> anthropicChatModel;
            case "ollama" -> ollamaChatModel;
            default -> openAiChatModel;
        };
    }

    @Bean
    public OpenAiTranscriptionModel transcriptionModel() {
        return new OpenAiTranscriptionModel();
    }
}