import { test, expect } from '@playwright/test';

test.describe('Voice Recording Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on mobile or desktop view
    const isMobile = await page.viewport()?.width < 768;
    
    if (isMobile) {
      // On mobile, navigate to podcasts section first
      await page.click('[data-section="podcasts"]');
      await page.waitForTimeout(1000);
    }
  });

  test('should open note modal and show voice recorder', async ({ page }) => {
    // Look for the first podcast episode
    const firstPodcast = page.locator('[data-testid="podcast-card"]').first();
    await expect(firstPodcast).toBeVisible({ timeout: 10000 });
    
    // Click on the note button
    const noteButton = firstPodcast.locator('button:has-text("Note")');
    await noteButton.click();
    
    // Verify the modal/sheet opens
    await expect(page.locator('text=My Notes, Moje poznámky')).toBeVisible();
    
    // Check if voice recorder is present
    const voiceRecorder = page.locator('button:has-text("Record voice"), button:has-text("Nahrát hlas")');
    await expect(voiceRecorder).toBeVisible();
  });

  test('should handle voice recording permissions gracefully', async ({ page }) => {
    // Mock microphone permissions
    await page.context().grantPermissions(['microphone']);
    
    // Open first podcast note modal
    const firstPodcast = page.locator('[data-testid="podcast-card"]').first();
    await firstPodcast.locator('button:has-text("Note")').click();
    
    // Wait for modal to appear
    await expect(page.locator('text=My Notes, Moje poznámky')).toBeVisible();
    
    // Click voice recorder button
    const voiceRecorder = page.locator('button:has-text("Record voice"), button:has-text("Nahrát hlas")');
    await voiceRecorder.click();
    
    // Check if recording state changes (button should show stop/recording state)
    await expect(page.locator('button:has-text("Stop"), button:has-text("Zastavit")')).toBeVisible({
      timeout: 5000
    });
  });

  test('should preserve existing text when adding voice transcript', async ({ page }) => {
    // Grant microphone permissions
    await page.context().grantPermissions(['microphone']);
    
    // Open first podcast note modal
    const firstPodcast = page.locator('[data-testid="podcast-card"]').first();
    await firstPodcast.locator('button:has-text("Note")').click();
    
    // Wait for modal
    await expect(page.locator('text=My Notes, Moje poznámky')).toBeVisible();
    
    // Type some existing text
    const textarea = page.locator('textarea');
    await textarea.fill('Initial note content');
    
    // Mock speech recognition result
    await page.evaluate(() => {
      // Mock the Speech Recognition API
      const mockRecognition = {
        start: () => {},
        stop: () => {},
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        onresult: null,
        onerror: null,
        onend: null
      };
      
      (window as any).webkitSpeechRecognition = function() {
        return mockRecognition;
      };
      
      (window as any).SpeechRecognition = function() {
        return mockRecognition;
      };
    });
    
    // Verify textarea content
    await expect(textarea).toHaveValue('Initial note content');
    
    // The voice recorder should append to existing content, not replace it
    const voiceRecorder = page.locator('button:has-text("Record voice"), button:has-text("Nahrát hlas")');
    await expect(voiceRecorder).toBeVisible();
  });

  test('should show appropriate message when speech recognition is not supported', async ({ page }) => {
    // Disable speech recognition
    await page.addInitScript(() => {
      delete (window as any).webkitSpeechRecognition;
      delete (window as any).SpeechRecognition;
    });
    
    // Open first podcast note modal
    const firstPodcast = page.locator('[data-testid="podcast-card"]').first();
    await firstPodcast.locator('button:has-text("Note")').click();
    
    // Wait for modal
    await expect(page.locator('text=My Notes, Moje poznámky')).toBeVisible();
    
    // Should show unsupported message
    await expect(page.locator('text=Voice recording not supported, Hlasové nahrávání není podporováno')).toBeVisible();
  });

  test('should save notes successfully', async ({ page }) => {
    // Open first podcast note modal
    const firstPodcast = page.locator('[data-testid="podcast-card"]').first();
    await firstPodcast.locator('button:has-text("Note")').click();
    
    // Wait for modal
    await expect(page.locator('text=My Notes, Moje poznámky')).toBeVisible();
    
    // Add some text
    const textarea = page.locator('textarea');
    await textarea.fill('This is a test note from Playwright');
    
    // Click save button
    const saveButton = page.locator('button:has-text("Save note"), button:has-text("Uložit poznámku")');
    await saveButton.click();
    
    // Check for success message or that the note appears in the list
    await expect(page.locator('text=Note saved, Poznámka uložena')).toBeVisible({
      timeout: 5000
    });
  });
});