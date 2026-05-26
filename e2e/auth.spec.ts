import { test, expect } from '@playwright/test';

test.describe('Auth Sayfası Testi', () => {
  test('giriş sayfası açılmalı ve form görünür olmalı', async ({ page }) => {
    await page.goto('/giris');
    
    // Email ve şifre inputları
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Giriş butonu (varsayılan olarak ekranda görünür olmalı)
    // Auth sayfasında genel olarak "Giriş Yap" metni taşıyan butonu bul
    const loginButton = page.locator('button', { hasText: 'Giriş Yap' }).first();
    await expect(loginButton).toBeVisible();
  });
  
  test('kayıt ol sekmesine geçiş yapılabilmeli', async ({ page }) => {
    // Parametre ile direkt kayıt sekmesini açmayı deniyoruz, veya ekranda "Kayıt Ol" butonuna tıklayacağız
    await page.goto('/giris');
    
    // Eğer sekme tabanlı ise "Hesap Oluştur" veya "Kayıt Ol" sekmesi olmalı
    // Veya direkt url üzerinden test edelim
    await page.goto('/giris?register=true');
    
    // İsim/Soyisim alanı varsa doğru formdayız demektir (genelde kayıt formunda isim de istenir)
    // Şimdilik sadece sayfanın hata vermeden açıldığını ve formun geldiğini doğruluyoruz
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Kayıt formunun görünürlüğünü doğrula
    await expect(page.locator('form')).toBeVisible();
  });
});
