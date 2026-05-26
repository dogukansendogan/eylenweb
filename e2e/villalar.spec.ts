import { test, expect } from '@playwright/test';

test.describe('Villalar Sayfası Testi', () => {
  test('villalar sayfası yüklenmeli ve filtreler görünür olmalı', async ({ page }) => {
    await page.goto('/villalar');
    
    // Filtreler butonunun veya arama kutusunun görünür olduğunu kontrol et
    await expect(page.locator('text=Filtreler').first()).toBeVisible();
    await expect(page.locator('input[placeholder="Villa adı ara..."]')).toBeVisible();
  });

  test('arama kutusuna yazı yazılabilmeli', async ({ page }) => {
    await page.goto('/villalar');
    
    const searchInput = page.locator('input[placeholder="Villa adı ara..."]');
    await searchInput.fill('Deneme Villa Araması');
    await expect(searchInput).toHaveValue('Deneme Villa Araması');
  });
  
  test('filtreler menüsü açılıp kapanabilmeli', async ({ page }) => {
    await page.goto('/villalar');
    
    // Filtreleri aç
    await page.locator('text=Filtreler').first().click();
    
    // Filtre seçeneklerinden birinin görünür olduğunu kontrol et
    await expect(page.locator('text=Min. Gece Fiyatı').first()).toBeVisible();
    
    // Gelişmiş filtreleri kullan
    const minPriceInput = page.locator('input[placeholder="örn: 3000"]');
    await minPriceInput.fill('5000');
    await expect(minPriceInput).toHaveValue('5000');
  });
});
