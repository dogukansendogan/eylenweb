'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocations, Location as LocationType } from '@/firebase/locationService';

// Yükleme durumu için basit bir iskelet bileşeni
const LocationSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-200 animate-pulse h-72"></div>
  );
};

// Kart bileşeni
const LocationCard = ({ location }: { location: LocationType }) => {
  // Açıklama kısaltma fonksiyonu
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white group border border-slate-100/50">
      {/* Layered overlay that shifts on hover */}
      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/45 transition-colors duration-500 z-10 pointer-events-none" />
      {/* Arka plan resmi */}
      <div className="h-72 relative overflow-hidden">
        <img
          src={location.image && typeof location.image === 'string' && location.image.trim() !== '' ? location.image : "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop"}
          alt={location.name || 'Bölge'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Karanlık gradient kaplama */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent z-10"></div>
      </div>
      
      {/* İçerik */}
      <div className="absolute bottom-0 left-0 p-6 text-white w-full z-20">
        <h3 className="text-2xl font-bold mb-2 font-serif tracking-tight">{location.name}</h3>
        <p className="text-xs text-slate-200/90 mb-4 line-clamp-2 leading-relaxed">
          {truncateDescription(location.description, 60)}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            {location.villaCount > 0 ? location.villaCount : '5+'} Villa
          </span>
          <Link 
            href={`/bolgeler/${location.id}`}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
          >
            Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
};

const Locations = () => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getLocations();
        setLocations(data);
        setLoading(false);
      } catch (err) {
        console.error("Bölgeler yüklenirken hata oluştu:", err);
        setError("Bölgeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Hata durumunu kontrol et
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-[#f8f9fa] to-white relative overflow-hidden">
      {/* Decorative background texture */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layered slanted background pane */}
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-amber-500/[0.01] to-transparent transform skew-x-12 translate-x-24 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Başlık */}
        <div className="text-center mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 block">
            Popüler Destinasyonlar
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            En Popüler <span className="font-serif italic font-normal text-amber-600">Tatil Bölgeleri</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
            Türkiye'nin en güzel tatil bölgelerinde lüks villa seçeneklerimizi keşfedin. 
            Her bölge, benzersiz bir deneyim ve unutulmaz anılar sunuyor.
          </p>
        </div>
        
        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {loading ? (
            // Yükleme durumunda iskelet göster
            [...Array(4)].map((_, index) => <LocationSkeleton key={index} />)
          ) : (
            // Yükleme tamamlandığında bölgeleri göster
            locations.map(location => (
              <LocationCard key={location.id} location={location} />
            ))
          )}
        </div>
        
        {/* Alt buton */}
        <div className="text-center mt-12">
          <Link 
            href="/bolgeler"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Tüm Bölgeleri Görüntüle
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Locations; 