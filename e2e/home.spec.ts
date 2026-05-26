import { test, expect } from '@playwright/test';

test.describe('Anasayfa ve Navbar Testi', () => {
  test('sayfa başarıyla yüklenmeli ve başlık doğru olmalı', async ({ page }) => {
    await page.goto('/');
    
    // Uygulama logosunun/isminin görünürlüğünü kontrol et
    const logo = page.locator('text=Eyleniyoruzvillam');
    await expect(logo).toBeVisible();
  });

  test('navbar linkleri çalışmalı', async ({ page }) => {
    await page.goto('/');
    
    // Villalar linkine tıkla
    await page.click('text=Villalar');
    await expect(page).toHaveURL(/.*villalar/);
    
    // Hakkımızda linkine tıkla
    await page.click('text=Hakkımızda');
    await expect(page).toHaveURL(/.*hakkimizda/);
    
    // İletişim linkine tıkla
    await page.click('text=İletişim');
    await expect(page).toHaveURL(/.*iletisim/);
    
    // Anasayfaya geri dön
    await page.locator('nav').locator('text=Eyleniyoruzvillam').click();
    await expect(page).toHaveURL('/');
  });

  test('hero bölümü ve CTA butonları görünür olmalı', async ({ page }) => {
    await page.goto('/');
    
    // Hero bölümündeki bir başlık veya butonu kontrol et
    // Genellikle 'Hemen Keşfet' gibi butonlar olur, href kontrolü yapalım
    const exploreButton = page.locator('a[href="/villalar"]').first();
    await expect(exploreButton).toBeVisible();
  });
});
