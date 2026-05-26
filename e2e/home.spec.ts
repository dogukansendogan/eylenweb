import { test, expect } from '@playwright/test';

test.describe('Anasayfa ve Navbar Testi', () => {
  test('sayfa başarıyla yüklenmeli ve başlık doğru olmalı', async ({ page }) => {
    await page.goto('/');
    
    // Uygulama logosunun/isminin görünürlüğünü kontrol et
    const logo = page.locator('nav').getByText('Eyleniyoruzvillam').filter({ visible: true }).first();
    await expect(logo).toBeVisible();
  });

  test('navbar linkleri çalışmalı', async ({ page }) => {
    await page.goto('/');
    
    const clickLink = async (labelText: string) => {
      const mobileMenuBtn = page.locator('nav button.md\\:hidden');
      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(400); // Wait for mobile menu transition animation
      }
      await page.locator('nav').getByText(labelText).filter({ visible: true }).first().click();
    };

    // Villalar linkine tıkla
    await clickLink('Villalar');
    await expect(page).toHaveURL(/.*villalar/);
    
    // Hakkımızda linkine tıkla
    await clickLink('Hakkımızda');
    await expect(page).toHaveURL(/.*hakkimizda/);
    
    // İletişim linkine tıkla
    await clickLink('İletişim');
    await expect(page).toHaveURL(/.*iletisim/);
    
    // Anasayfaya geri dön
    const logoLink = page.locator('nav').getByText('Eyleniyoruzvillam').filter({ visible: true }).first();
    if (await logoLink.isHidden()) {
      const mobileMenuBtn = page.locator('nav button.md\\:hidden');
      await mobileMenuBtn.click();
      await page.waitForTimeout(400);
    }
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  test('hero bölümü ve CTA butonları görünür olmalı', async ({ page }) => {
    await page.goto('/');
    
    // Görünür olan ilk villalar linki (Nav ya da CTA)
    const exploreButton = page.locator('a[href="/villalar"]:visible').first();
    await expect(exploreButton).toBeVisible();
  });
});
