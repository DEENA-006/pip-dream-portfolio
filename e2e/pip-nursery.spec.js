import { test, expect } from '@playwright/test';

test.describe('Pip Midnight Nursery — End-to-End Suite', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock/stub Web Audio API so tests never hang or throw in headless CI
    await page.addInitScript(() => {
      class MockAudioParam {
        constructor(val = 0) {
          this.value = val;
        }
        setValueAtTime() { return this; }
        exponentialRampToValueAtTime() { return this; }
        linearRampToValueAtTime() { return this; }
        setTargetAtTime() { return this; }
      }

      class MockGainNode {
        constructor() {
          this.gain = new MockAudioParam(1);
        }
        connect() { return this; }
        disconnect() {}
      }

      class MockOscillatorNode {
        constructor() {
          this.frequency = new MockAudioParam(440);
          this.type = 'sine';
        }
        connect() { return this; }
        disconnect() {}
        start() {}
        stop() {}
      }

      class MockAudioContext {
        constructor() {
          this.state = 'running';
          this.currentTime = 0;
          this.destination = {};
        }
        createGain() { return new MockGainNode(); }
        createOscillator() { return new MockOscillatorNode(); }
        resume() { return Promise.resolve(); }
        close() { return Promise.resolve(); }
      }

      window.AudioContext = MockAudioContext;
      window.webkitAudioContext = MockAudioContext;
    });

    // 2. Navigate and ensure clean isolated localStorage state before each test
    await page.goto('/');
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
      } catch {}
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Global State & Navigation Flow: Sticky Topbar, Midnight Torch, and Chaos Mode', async ({ page }) => {
    // 1. Verify the sticky Topbar loads correctly
    const topbar = page.getByTestId('topbar');
    await expect(topbar).toBeVisible();

    // 2. Click the "Midnight Torch" toggle and verify dark mode activation
    const darkToggle = page.getByTestId('dark-toggle');
    await expect(darkToggle).toBeVisible();
    await darkToggle.click();

    // Verify 'dark' class applied to html element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Verify the CSS radial flashlight mask activates in the DOM
    const torchMask = page.getByTestId('midnight-torch-mask');
    await expect(torchMask).toBeVisible();

    // 3. Click the "Chaos Mode" toggle and verify 'chaos-active' class on the layout
    const chaosToggle = page.getByTestId('chaos-toggle');
    await expect(chaosToggle).toBeVisible();
    await chaosToggle.click();

    const appContainer = page.getByTestId('app-container');
    await expect(appContainer).toHaveClass(/chaos-active/);
  });

  test('2. The Hero Easter Egg Flow: Boop Pip 3 times to unlock Secret Rattle Master & +5 Dreams', async ({ page }) => {
    // 1. Locate the interactive Pip skull element
    const skull = page.getByTestId('pip-skull-boop');
    await expect(skull).toBeVisible();

    // Verify initial baseline odometer (1492 formatted as 0,001,492)
    const odometer = page.getByTestId('odometer-hero');
    await expect(odometer).toContainText('1,492');

    // 2. Simulate clicking the skull/pink bow exactly 3 times
    await skull.click();
    await skull.click();
    await skull.click();

    // 3. Assert that the "Secret Rattle Unlocked" badge appears in the DOM
    const secretBadge = page.getByTestId('secret-rattle-badge');
    await expect(secretBadge).toBeVisible();
    await expect(secretBadge).toContainText('Starlight Rattle Master');

    // 4. Assert that the Odometer score increments by 5 (1492 + 5 = 1497)
    await expect(odometer).toContainText('1,497');
  });

  test('3. Project 3: Rooftop Glider flight completion and Odometer persistence via localStorage', async ({ page }) => {
    // Scroll down to project section
    const gliderBtn = page.getByTestId('launch-glider-btn');
    await gliderBtn.scrollIntoViewIfNeeded();
    await expect(gliderBtn).toBeVisible();

    // Baseline odometer check
    const odometer = page.getByTestId('odometer-hero');
    await expect(odometer).toContainText('1,492');

    // 1. Click "Launch Cloud Glider" button
    await gliderBtn.click();

    // Verify flight is in progress
    await expect(gliderBtn).toBeDisabled();

    // 2. Wait for the flight interval to complete (3 steps * 560ms ≈ 1.8s)
    // Odometer should increment by 3 (1492 + 3 = 1495)
    await expect(odometer).toContainText('1,495', { timeout: 6000 });
    await expect(gliderBtn).toBeEnabled({ timeout: 6000 });

    // 3. Verify value is written to localStorage
    const savedCount = await page.evaluate(() => localStorage.getItem('pip_odometer_count'));
    expect(savedCount).toBe('1495');

    // 4. Reload the page and assert that the Odometer value persists correctly
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const reloadedOdometer = page.getByTestId('odometer-hero');
    await expect(reloadedOdometer).toContainText('1,495');
  });

  test('4. Guestbook Submission Flow: Avatar selection, input validation, and wall appending', async ({ page }) => {
    // Scroll down to guestbook section
    const submitBtn = page.getByTestId('guestbook-submit-btn');
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();

    // 1. Select an avatar from the dropdown
    const avatarSelect = page.getByTestId('guestbook-avatar-select');
    await expect(avatarSelect).toBeVisible();
    await avatarSelect.selectOption('🌙');

    // 2. Fill in the "Name" and "Wish" input fields
    const nameInput = page.getByTestId('guestbook-name-input');
    const wishInput = page.getByTestId('guestbook-wish-input');

    const testName = 'Starlight Voyager';
    const testWish = 'May your dreams be full of warm amber glow! ✨';

    await nameInput.fill(testName);
    await wishInput.fill(testWish);

    // 3. Submit the form
    await submitBtn.click();

    // 4. Assert that the new entry appears at the top of the guestbook list
    const entriesWall = page.getByTestId('guestbook-entries');
    await expect(entriesWall).toBeVisible();

    const topEntry = page.getByTestId('guestbook-entry').first();
    await expect(topEntry).toBeVisible();
    await expect(topEntry.getByTestId('entry-name')).toHaveText(testName);
    await expect(topEntry.getByTestId('entry-wish')).toContainText(testWish);
    await expect(topEntry.getByTestId('entry-avatar')).toHaveText('🌙');

    // 5. Assert that the form inputs clear after submission
    await expect(nameInput).toHaveValue('');
    await expect(wishInput).toHaveValue('');
  });
});
