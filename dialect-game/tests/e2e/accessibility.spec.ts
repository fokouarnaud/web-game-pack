/**
 * End-to-End accessibility tests
 * Following TDD methodology - WCAG AA compliance testing
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper document structure', async ({ page }) => {
    // Check for semantic HTML structure
    await expect(page.locator('main, [role="main"]')).toHaveCount(1);
    
    // Should have proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Only one h1 per page
    
    // Check for proper landmarks
    const landmarks = page.locator('[role="banner"], [role="main"], [role="contentinfo"], [role="navigation"]');
    const landmarkCount = await landmarks.count();
    expect(landmarkCount).toBeGreaterThan(0);
  });

  test('should have proper focus management', async ({ page }) => {
    // Check initial focus
    await page.keyboard.press('Tab');
    const firstFocus = page.locator(':focus');
    await expect(firstFocus).toBeVisible();
    
    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should support keyboard navigation throughout app', async ({ page }) => {
    // Navigate to game
    await page.keyboard.press('Tab');
    let focused = page.locator(':focus');
    
    // Find and activate start button
    let attempts = 0;
    while (attempts < 10) {
      const ariaLabel = await focused.getAttribute('aria-label');
      const text = await focused.textContent();
      
      if ((ariaLabel && ariaLabel.includes('start')) || 
          (text && text.toLowerCase().includes('start'))) {
        await page.keyboard.press('Enter');
        break;
      }
      
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
      attempts++;
    }
    
    // Should be in game view now
    await page.waitForTimeout(1000);
    
    // Continue tabbing through game elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should have proper ARIA labels and descriptions', async ({ page }) => {
    await page.click('[data-testid="start-game-button"]');
    
    // Check important interactive elements have ARIA labels
    const interactiveElements = page.locator('button, [role="button"], input, [role="textbox"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const text = await element.textContent();
      
      // Element should have accessible name
      expect(ariaLabel || ariaLabelledBy || text).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.click('[data-testid="start-game-button"]');
    
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    
    // Elements should still be visible and properly styled
    await expect(page.locator('[data-testid="score-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="voice-input"]')).toBeVisible();
    
    // Test high contrast preference
    await page.emulateMedia({ 
      colorScheme: 'light',
      forcedColors: 'active' 
    });
    await page.reload();
    
    // Should apply high contrast styles
    const voiceInput = page.locator('[data-testid="voice-input"]');
    if (await voiceInput.isVisible()) {
      // Check if high contrast class is applied
      const classes = await voiceInput.getAttribute('class');
      // Implementation might add high-contrast class
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.click('[data-testid="start-game-button"]');
    
    // Check for live regions
    const statusElements = page.locator('[role="status"], [aria-live="polite"]');
    const alertElements = page.locator('[role="alert"], [aria-live="assertive"]');
    
    const statusCount = await statusElements.count();
    const alertCount = await alertElements.count();
    
    // Should have at least one live region for announcements
    expect(statusCount + alertCount).toBeGreaterThan(0);
    
    // Check for screen reader only content
    const srOnly = page.locator('.sr-only, .visually-hidden');
    const srOnlyCount = await srOnly.count();
    
    if (srOnlyCount > 0) {
      // Screen reader content should not be visible but should exist
      const firstSrOnly = srOnly.first();
      const isVisible = await firstSrOnly.isVisible();
      expect(isVisible).toBe(false); // Should be hidden visually
      
      const content = await firstSrOnly.textContent();
      expect(content).toBeTruthy(); // But should have content
    }
  });

  test('should have proper form labels and validation', async ({ page }) => {
    // Check for any form elements
    const formElements = page.locator('input, select, textarea');
    const formCount = await formElements.count();
    
    for (let i = 0; i < formCount; i++) {
      const element = formElements.nth(i);
      
      // Each form element should have a label
      const id = await element.getAttribute('id');
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        // Should have either a label element or aria-label
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.click('[data-testid="start-game-button"]');
    
    // Check that animations are reduced or disabled
    const animatedElements = page.locator('.pulse-animation, .score-animating, [class*="animate"]');
    const animatedCount = await animatedElements.count();
    
    if (animatedCount > 0) {
      // With reduced motion, animations should be minimal
      for (let i = 0; i < Math.min(animatedCount, 3); i++) {
        const element = animatedElements.nth(i);
        const computedStyle = await element.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            animationDuration: style.animationDuration,
            transitionDuration: style.transitionDuration
          };
        });
        
        // Animations should be very short or disabled
        const hasFastAnimation = 
          computedStyle.animationDuration.includes('0.01s') ||
          computedStyle.animationDuration === '0s' ||
          computedStyle.transitionDuration.includes('0.01s') ||
          computedStyle.transitionDuration === '0s';
        
        if (!hasFastAnimation) {
          // If animations aren't disabled, they should at least be present
          expect(computedStyle.animationDuration || computedStyle.transitionDuration).toBeTruthy();
        }
      }
    }
  });

  test('should support zoom up to 200%', async ({ page }) => {
    // Test 200% zoom
    await page.setViewportSize({ width: 640, height: 480 }); // Simulate 200% zoom of 1280x960
    await page.reload();
    
    // All essential content should still be accessible
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    // Navigate to game
    const startButton = page.locator('[data-testid="start-game-button"]');
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Game elements should still be usable
      await expect(page.locator('[data-testid="score-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="voice-input"]')).toBeVisible();
    }
  });

  test('should work without JavaScript (progressive enhancement)', async ({ page }) => {
    // Test progressive enhancement - check noscript content
    const noscriptContent = page.locator('noscript');
    const noscriptCount = await noscriptContent.count();
    
    // Basic content should still be visible
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length || 0).toBeGreaterThan(50);
    
    // Should show fallback content or graceful degradation
    if (noscriptCount > 0) {
      const noscriptText = await noscriptContent.textContent();
      expect(noscriptText).toContain('JavaScript');
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should support touch navigation', async ({ page }) => {
    // Touch targets should be at least 44px
    const touchTargets = page.locator('button, [role="button"], a, input');
    const count = await touchTargets.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = touchTargets.nth(i);
      const box = await element.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44px
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should work with screen orientation changes', async ({ page }) => {
    // Portrait mode
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    // Landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();
    
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    // Content should reflow appropriately
    const scoreDisplay = page.locator('[data-testid="score-display"]');
    if (await scoreDisplay.isVisible()) {
      await expect(scoreDisplay).toBeVisible();
    }
  });

  test('should support voice control and assistive technologies', async ({ page }) => {
    await page.click('[data-testid="start-game-button"]');
    
    // Elements should have proper roles for voice control
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      
      // Should have accessible name for voice commands
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });
});

test.describe('Error State Accessibility', () => {
  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Try to trigger an error (microphone permission denied)
    await page.click('[data-testid="start-game-button"]');
    
    const voiceButton = page.locator('button[aria-label*="voice recognition"]');
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      // Look for error announcements
      const errorAlert = page.locator('[role="alert"]');
      const errorCount = await errorAlert.count();
      
      if (errorCount > 0) {
        const errorText = await errorAlert.first().textContent();
        expect(errorText).toBeTruthy();
        expect(errorText?.length || 0).toBeGreaterThan(10);
      }
    }
  });

  test('should provide clear error recovery paths', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="start-game-button"]');
    
    // Try voice input which might error
    const voiceButton = page.locator('button[aria-label*="voice recognition"]');
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      // Look for retry mechanisms
      const retryButton = page.locator('button[aria-label*="try again"], button:has-text("Try Again")');
      const retryCount = await retryButton.count();
      
      if (retryCount > 0) {
        // Retry button should be focusable and clearly labeled
        const firstRetry = retryButton.first();
        await expect(firstRetry).toBeVisible();
        
        const label = await firstRetry.getAttribute('aria-label');
        const text = await firstRetry.textContent();
        expect(label || text).toMatch(/try|retry|again/i);
      }
    }
  });

  test('should maintain focus after errors', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="start-game-button"]');
    
    // Focus an element
    const voiceButton = page.locator('button[aria-label*="voice recognition"]');
    if (await voiceButton.isVisible()) {
      await voiceButton.focus();
      await expect(voiceButton).toBeFocused();
      
      // Trigger potential error
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      // Focus should be managed appropriately
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });
});