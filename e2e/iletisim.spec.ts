import { test, expect } from '@playwright/test';

test.describe('İletişim Sayfası Testi', () => {
  test('iletişim formu doldurulup gönderilebilmeli', async ({ page }) => {
    await page.goto('/iletisim');
    
    // Form elemanlarını doldur
    await page.fill('input[name="name"]', 'Playwright Test User');
    await page.fill('input[name="email"]', 'test@playwright.dev');
    await page.fill('input[name="phone"]', '05554443322');
    await page.selectOption('select[name="subject"]', 'info');
    await page.fill('textarea[name="message"]', 'Bu bir otomatik test mesajıdır.');
    
    // Formu gönder
    await page.click('button:has-text("Mesajı Gönder")');
    
    // Başarı mesajını bekle (Component'te 1.5s delay var)
    await expect(page.locator('text=Mesajınız Alındı!')).toBeVisible({ timeout: 5000 });
  });
});
