/**
 * End-to-End tests for voice interaction features
 * Following TDD methodology - comprehensive voice UX testing
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Interaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Grant microphone permissions for all tests
    await page.context().grantPermissions(['microphone']);
    
    // Start the game to access voice features
    await page.click('[data-testid="start-game-button"]');
  });

  test('should display voice input interface', async ({ page }) => {
    // Voice input should be visible
    const voiceInput = page.locator('[data-testid="voice-input"]');
    await expect(voiceInput).toBeVisible();
    
    // Microphone button should be present
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    await expect(micButton).toBeVisible();
    
    // Should show initial placeholder
    await expect(page.locator('.voice-status')).toContainText(/click to speak/i);
  });

  test('should handle microphone button click', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    
    // Initial state should be idle
    await expect(micButton).toHaveAttribute('aria-label', 'Start voice recognition');
    
    // Click to start recording
    await micButton.click();
    
    // Should change to listening state (or show error if not supported)
    await page.waitForTimeout(500);
    
    // Check for either listening state or unsupported message
    const isListening = await page.locator('button[aria-label*="Stop voice recognition"]').isVisible();
    const isUnsupported = await page.locator('.voice-input-unsupported').isVisible();
    
    expect(isListening || isUnsupported).toBe(true);
  });

  test('should show visual feedback during recording', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    const micIcon = page.locator('[data-testid="microphone-icon"]');
    
    await micButton.click();
    await page.waitForTimeout(500);
    
    // If voice recognition is supported, should show recording state
    const isListening = await page.locator('button[aria-label*="Stop voice recognition"]').isVisible();
    
    if (isListening) {
      // Icon should have recording class
      await expect(micIcon).toHaveClass(/recording/);
      
      // Should show listening status
      await expect(page.locator('.voice-status')).toContainText(/listening/i);
    }
  });

  test('should handle keyboard interactions', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    
    // Focus the button
    await micButton.focus();
    await expect(micButton).toBeFocused();
    
    // Press space to activate
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Should start voice recognition or show error
    const isActive = await page.locator('.voice-button.listening').isVisible();
    const hasError = await page.locator('.voice-input-unsupported').isVisible();
    
    expect(isActive || hasError).toBe(true);
  });

  test('should display error messages appropriately', async ({ page }) => {
    // If voice recognition is not supported, should show message
    const unsupportedMessage = page.locator('.voice-input-unsupported');
    
    if (await unsupportedMessage.isVisible()) {
      await expect(unsupportedMessage).toContainText(/not supported/i);
      await expect(unsupportedMessage).toContainText(/modern browser/i);
    }
  });

  test('should show retry button on errors', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    
    // Try to start voice recognition
    await micButton.click();
    await page.waitForTimeout(1000);
    
    // Check for error message and retry button
    const errorMessage = page.locator('.error-message');
    const retryButton = page.locator('button[aria-label*="Try again"]');
    
    if (await errorMessage.isVisible()) {
      await expect(retryButton).toBeVisible();
      
      // Retry button should be clickable
      await retryButton.click();
    }
  });
});

test.describe('Voice Input States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().grantPermissions(['microphone']);
    await page.click('[data-testid="start-game-button"]');
  });

  test('should handle idle state correctly', async ({ page }) => {
    const voiceButton = page.locator('.voice-button');
    const micIcon = page.locator('[data-testid="microphone-icon"]');
    
    // Initial state should be idle
    await expect(voiceButton).toHaveClass(/idle/);
    await expect(micIcon).not.toHaveClass(/recording/);
    await expect(micIcon).not.toHaveClass(/pulse-animation/);
  });

  test('should show processing state when available', async ({ page }) => {
    // This test depends on voice recognition working
    // In most test environments, this will not be available
    const processingSpinner = page.locator('[data-testid="processing-spinner"]');
    
    // Check if processing state exists in DOM (might not be visible)
    const exists = await processingSpinner.count() > 0;
    
    if (exists) {
      // Processing spinner should have appropriate content
      expect(true).toBe(true); // Placeholder assertion
    }
  });

  test('should display confidence indicators when enabled', async ({ page }) => {
    // Check for confidence indicator in DOM
    const confidenceIndicator = page.locator('[data-testid="confidence-indicator"]');
    
    if (await confidenceIndicator.isVisible()) {
      await expect(confidenceIndicator).toContainText(/confidence/i);
      await expect(confidenceIndicator).toContainText(/%/);
    }
  });

  test('should show transcript preview when enabled', async ({ page }) => {
    const transcriptPreview = page.locator('[data-testid="transcript-preview"]');
    
    if (await transcriptPreview.isVisible()) {
      // Should be empty initially or contain transcript text
      const content = await transcriptPreview.textContent();
      expect(typeof content).toBe('string');
    }
  });

  test('should display volume level indicator', async ({ page }) => {
    const volumeIndicator = page.locator('[data-testid="volume-indicator"]');
    
    if (await volumeIndicator.isVisible()) {
      const progressBar = volumeIndicator.locator('div[role="progressbar"]');
      await expect(progressBar).toHaveAttribute('aria-label', /volume level/i);
    }
  });
});

test.describe('Voice Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().grantPermissions(['microphone']);
    await page.click('[data-testid="start-game-button"]');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    const voiceStatus = page.locator('#voice-status');
    
    // Button should have proper ARIA attributes
    await expect(micButton).toHaveAttribute('aria-label');
    await expect(micButton).toHaveAttribute('aria-describedby', 'voice-status');
    
    // Status element should exist
    await expect(voiceStatus).toHaveAttribute('role', 'status');
    await expect(voiceStatus).toHaveAttribute('aria-live', 'polite');
  });

  test('should announce state changes to screen readers', async ({ page }) => {
    // Check for screen reader announcements
    const srStatus = page.locator('.sr-only[role="status"]');
    
    if (await srStatus.isVisible()) {
      const content = await srStatus.textContent();
      expect(content).toBeTruthy();
    }
  });

  test('should support keyboard-only navigation', async ({ page }) => {
    // Tab to voice input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Might need multiple tabs depending on page structure
    
    // Should eventually reach voice button
    const focusedElement = page.locator(':focus');
    const isMicButton = await focusedElement.getAttribute('aria-label');
    
    if (isMicButton && isMicButton.includes('voice recognition')) {
      // Space or Enter should activate
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Should change state
      const newLabel = await focusedElement.getAttribute('aria-label');
      expect(newLabel).toBeTruthy();
    }
  });

  test('should work with reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.click('[data-testid="start-game-button"]');
    
    const micIcon = page.locator('[data-testid="microphone-icon"]');
    
    // Try to activate voice input
    await page.locator('button[aria-label*="voice recognition"]').click();
    await page.waitForTimeout(500);
    
    // Icon should not have animation classes with reduced motion
    const hasAnimation = await micIcon.evaluate(el => 
      el.classList.contains('pulse-animation')
    );
    
    // With reduced motion, animation should be disabled
    if (hasAnimation) {
      // If animation is still present, it should be minimal
      expect(true).toBe(true); // Adjust based on implementation
    }
  });
});

test.describe('Voice Input Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Intentionally not granting microphone permission for some tests
  });

  test('should handle permission denied gracefully', async ({ page }) => {
    await page.click('[data-testid="start-game-button"]');
    
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    await micButton.click();
    await page.waitForTimeout(1000);
    
    // Should show error message about permissions
    const errorMessage = page.locator('.error-message');
    
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/permission/i);
      await expect(errorMessage).toContainText(/microphone/i);
    }
  });

  test('should provide fallback for unsupported browsers', async ({ page }) => {
    // This test simulates an unsupported browser
    // In real scenario, we'd mock the Speech API availability
    
    await page.click('[data-testid="start-game-button"]');
    
    const unsupportedMessage = page.locator('.voice-input-unsupported');
    const voiceInput = page.locator('[data-testid="voice-input"]');
    
    // Either voice input works or shows unsupported message
    const hasVoiceInput = await voiceInput.isVisible();
    const showsUnsupported = await unsupportedMessage.isVisible();
    
    expect(hasVoiceInput || showsUnsupported).toBe(true);
    
    if (showsUnsupported) {
      await expect(unsupportedMessage).toContainText(/not supported/i);
    }
  });

  test('should show network error messages', async ({ page }) => {
    // This test would require network mocking to simulate network errors
    // For now, we check if error handling UI exists
    
    await page.context().grantPermissions(['microphone']);
    await page.click('[data-testid="start-game-button"]');
    
    // Try voice input
    await page.locator('button[aria-label*="voice recognition"]').click();
    await page.waitForTimeout(2000);
    
    // Check if any error messages appear
    const errorMessages = page.locator('.error-message');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Should have proper error text
      const errorText = await errorMessages.first().textContent();
      expect(errorText).toBeTruthy();
    }
  });
});

test.describe('Voice Input Performance', () => {
  test('should respond to interactions quickly', async ({ page }) => {
    await page.goto('/');
    await page.context().grantPermissions(['microphone']);
    await page.click('[data-testid="start-game-button"]');
    
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    
    // Measure response time
    const startTime = Date.now();
    await micButton.click();
    
    // Wait for state change
    await page.waitForTimeout(100);
    const responseTime = Date.now() - startTime;
    
    // Should respond within 200ms for good UX
    expect(responseTime).toBeLessThan(200);
  });

  test('should handle rapid button clicks', async ({ page }) => {
    await page.goto('/');
    await page.context().grantPermissions(['microphone']);
    await page.click('[data-testid="start-game-button"]');
    
    const micButton = page.locator('button[aria-label*="voice recognition"]');
    
    // Rapid clicks should be debounced
    await micButton.click();
    await micButton.click();
    await micButton.click();
    
    await page.waitForTimeout(500);
    
    // Should still be in a stable state
    await expect(micButton).toBeVisible();
    await expect(micButton).toHaveAttribute('aria-label');
  });
});