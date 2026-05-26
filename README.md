# Eyleniyoruz Villam'da

Eyleniyoruz Villam'da, modern ve kullanıcı dostu arayüze sahip lüks villa kiralama platformudur. Kullanıcıların detaylı villa listelerine ulaşmasını, bölge bazlı filtreleme yapabilmesini, rezervasyon süreçlerini yönetmesini ve favori villalarını kaydetmesini sağlar.

## Kullanılan Teknolojiler

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Dil**: [TypeScript](https://www.typescriptlang.org/)
- **Stil Yönetimi**: [Tailwind CSS](https://tailwindcss.com/)
- **Veritabanı ve Servisler**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Test Araçları**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Birim/Entegrasyon), [Playwright](https://playwright.dev/) (Uçtan Uca E2E)
- **Diğer Kütüphaneler**: Heroicons (İkonlar), React Datepicker (Tarih Seçimi), React Hot Toast (Bildirimler)

## Özellikler

- **Gelişmiş Villa Listeleme**: Detaylı filtreleme (tarih, konuk sayısı, bölge).
- **Kullanıcı Kayıt & Giriş**: Güvenli e-posta/şifre tabanlı Firebase kimlik doğrulama.
- **Rezervasyon Yönetimi**: Seçilen tarihler için rezervasyon yapma ve geçmiş rezervasyonları profil sayfasında görüntüleme.
- **Favori Sistemi**: Beğenilen villaları favorilere ekleme ve hızlı erişim.
- **Dinamik Bölge Sayfaları**: Fethiye, Kaş, Bodrum gibi popüler tatil bölgelerine göre özel villa listeleri.
- **Yönetici Paneli Entegrasyonu**: Rezervasyon durumları ve villa yönetimi için arka plan servis desteği.

## Kurulum

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/dogukansendogan/eylenweb.git
   cd eylenweb
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini ayarlayın (aşağıdaki `.env.local` şablonuna bakın).

## .env.local Örneği

Projenin kök dizininde bir `.env.local` dosyası oluşturup aşağıdaki Firebase yapılandırma bilgilerini girmeniz gerekmektedir:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
```

## Çalıştırma Komutları

Geliştirme sunucusunu başlatmak için:
```bash
npm run dev
```

Projeyi üretim modunda çalıştırmak için:
```bash
npm run start
```

## Test Komutları

Birim ve entegrasyon testlerini çalıştırmak için:
```bash
npm run test
```

Uçtan Uca (E2E) Playwright testlerini çalıştırmak için:
```bash
npm run test:e2e
```

## Build Komutu

Projeyi canlıya (production) hazırlamak üzere derlemek için:
```bash
npm run build
```

## Proje Klasör Yapısı

```text
eylenweb/
├── .next/                  # Next.js derleme çıktıları
├── e2e/                    # Playwright E2E test dosyaları
├── public/                 # Statik varlıklar (resimler, ikonlar)
├── src/
│   ├── app/                # Next.js App Router sayfaları ve yönlendirmeleri
│   ├── components/         # Ortak React bileşenleri (Hero, Navbar, Footer, vb.)
│   ├── context/            # Auth ve global state context yapıları
│   ├── firebase/           # Firebase servisleri ve yapılandırması
│   ├── types/              # TypeScript tip tanımlamaları
│   └── utils/              # Yardımcı fonksiyonlar
├── eslint.config.mjs       # ESLint 9 yapılandırması
├── jest.config.ts          # Jest test ayarları
├── next.config.ts          # Next.js ayarları
├── tailwind.config.ts      # Tailwind CSS yapılandırması
└── tsconfig.json           # TypeScript derleme ayarları
```

## Geliştirici Bilgisi

Bu proje **Doğukan Şendoğan** tarafından geliştirilmektedir.
Herhangi bir soru, öneri veya hata bildirimi için GitHub issues üzerinden iletişime geçebilirsiniz.
