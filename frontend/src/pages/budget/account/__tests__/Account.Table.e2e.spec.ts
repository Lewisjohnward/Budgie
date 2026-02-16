import { test, expect } from '@playwright/test';
import { manyTransactionsAccountData, baseMockCategoryData } from './__helpers__/mockData';

const API_URL = 'http://localhost:3000/api';

test.describe('Account Table - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route(`${API_URL}/budget/account`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(manyTransactionsAccountData),
      });
    });

    await page.route(`${API_URL}/budget/category`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(baseMockCategoryData),
      });
    });

    await page.goto('/budget/account/acc1');
  });

  test('header should remain sticky when scrolling to bottom', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Get header position before scroll
    const firstHeader = page.locator('th').first();
    const initialBox = await firstHeader.boundingBox();
    
    if (!initialBox) {
      throw new Error('Header not found');
    }

    // Scroll the table container to bottom
    await page.evaluate(() => {
      const table = document.querySelector('table');
      const container = table?.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    // Wait a bit for scroll to complete
    await page.waitForTimeout(200);
    
    // Get header position after scroll
    const scrolledBox = await firstHeader.boundingBox();
    
    if (!scrolledBox) {
      throw new Error('Header not found after scroll');
    }

    // Header should stay in same viewport position (sticky worked)
    expect(scrolledBox.y).toBe(initialBox.y);
    
    // Verify header is still visible
    await expect(firstHeader).toBeVisible();
  });
});
