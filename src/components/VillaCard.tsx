'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  UserGroupIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Villa } from '@/firebase/villaService';

interface VillaCardProps {
  villa: Villa;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price);
};

const VillaCard = ({ villa }: VillaCardProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imgError, setImgError] = useState(false);
  
  const getLowestPrice = () => {
    // Eğer fiyat verisi bir nesneyse (Örn: { mayis: 5000, haziran: 7000 }) değerlerini diziye çevir
    // Eğer zaten bir diziyse direkt kullan
    const priceData = (villa as any)?.prices || (villa as any)?.monthlyPrices || villa?.fiyatlar || villa?.seasonalPrices;
    
    if (priceData) {
      const priceValues = typeof priceData === 'object' ? Object.values(priceData) : priceData;
      // Sayısal olan ve 0'dan büyük olan fiyatları filtrele, en küçüğünü bul
      const validPrices = (priceValues as any[]).filter(p => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        return Math.min(...validPrices);
      }
    }
    
    // Eğer yukarıdaki aylık fiyatlar yoksa veya boşsa, düz sabit fiyat alanına bak
    return (villa as any)?.pricePerNight || (villa as any)?.price || villa?.fiyat || 0;
  };

  const lowestPrice = getLowestPrice();
  

  // Villa resimlerini kullan, eğer yoksa örnek resim göster
  const images = villa.gorseller && villa.gorseller.length > 0 
    ? villa.gorseller 
    : villa.resimler && villa.resimler.length > 0
    ? villa.resimler
    : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop'];
  
  // Yedek resim URL'si
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop';
  
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImgError(false); // Resim değiştiğinde hata durumunu sıfırla
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImgError(false); // Resim değiştiğinde hata durumunu sıfırla
  };
  

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative group/card">
      <div className="relative">
        {/* Resim Galerisi */}
        <div className="relative h-64 overflow-hidden rounded-t-3xl">
          <Link href={`/villalar/${villa.id}`}>
            <Image
              src={imgError ? fallbackImageUrl : images[currentImage]}
              alt={villa.ad}
              fill
              className="object-cover transition-transform duration-700 group-hover/card:scale-105"
              onError={handleImageError}
              priority
            />
          </Link>

          {/* Subtle gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* Doğrulanmış Tesis Damgası — sadece belgeNo varsa */}
          {villa.belgeNo && (
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-amber-400/30 text-amber-800 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Belgeli Tesis</span>
              </div>
            </div>
          )}


          {/* Çoklu resim dot göstergesi */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setCurrentImage(i); setImgError(false); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentImage ? 'bg-white scale-125 shadow' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Öne/Arkaya Gezinme Butonları */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all opacity-0 group-hover/card:opacity-100 z-10"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all opacity-0 group-hover/card:opacity-100 z-10"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {/* Villa Bilgileri */}
        <div className="p-5">
          {/* Özellik Kategorisi Üst Yazı */}
          <div className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mb-1.5">
            {villa.ozellikler && villa.ozellikler.length > 0 ? villa.ozellikler[0] : "Lüks Villa"}
          </div>

          <div className="flex justify-between items-start gap-4 mb-2">
            <Link href={`/villalar/${villa.id}`} className="block flex-grow">
              <h3 className="text-lg font-bold text-slate-900 hover:text-primary transition-colors leading-snug">
                {villa.ad}
              </h3>
            </Link>
          </div>
          
          {/* Konum Bilgisi */}
          <div className="flex items-center justify-between text-slate-500 text-xs mb-4">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1 text-slate-400 flex-shrink-0" />
              <span>{villa.konum}</span>
            </div>
            {villa.denizeUzaklik && (
              <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                Denize {villa.denizeUzaklik}
              </span>
            )}
          </div>
          
          {/* Özellikler Etiketleri */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {villa.havuzVar && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                Özel Havuz
              </span>
            )}
            {villa.mustakilMi && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                Müstakil Villa
              </span>
            )}
            {villa.barbekuVar && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                Barbekü
              </span>
            )}
            {villa.belgeNo && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Belgeli
              </span>
            )}
          </div>
          
          {/* Müsaitlik Takvimi İncele Butonu */}
          {villa.doluTarihler && villa.doluTarihler.length > 0 && (
            <Link href={`/villalar/${villa.id}`} className="block mb-4">
              <div className="flex items-center justify-center gap-2 border border-amber-500/30 bg-amber-50/50 text-amber-700 text-xs py-2.5 rounded-xl text-center font-semibold hover:bg-amber-100/50 transition-all shadow-sm">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Müsaitlik Takvimini İncele</span>
              </div>
            </Link>
          )}
          
          {/* Fiyat Bilgisi */}
          <div className="mb-4 pt-1">
            {lowestPrice > 0 ? (
              <div className="flex flex-col mt-2">
                <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">Gecelik En Düşük</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    ₺{lowestPrice.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/60 ml-1">
                    'den başlayan fiyatlarla
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col mt-2">
                <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">Gecelik En Düşük</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm font-semibold text-slate-400 italic">
                    Fiyat İsteyin
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Alt Bilgiler */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <div className="flex items-center text-xs font-semibold text-slate-600 gap-1.5">
              <HomeIcon className="h-4 w-4 text-slate-400" />
              <span>{villa.yatak || 1} Yatak Odası</span>
            </div>

            <span className="w-px h-4 bg-slate-200" />

            <div className="flex items-center text-xs font-semibold text-slate-600 gap-1.5">
              <UserGroupIcon className="h-4 w-4 text-slate-400" />
              <span>{villa.kapasite} Kişi</span>
            </div>

            <span className="w-px h-4 bg-slate-200" />

            <Link
              href={`/villalar/${villa.id}`}
              className="text-xs font-bold text-primary hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              Detay
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillaCard; 