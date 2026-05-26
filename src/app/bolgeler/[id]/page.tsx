import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { getLocations, getVillasByLocation } from '@/firebase/locationService';
import { Villa } from '@/firebase/villaService';

// Metadata oluşturucu
export async function generateMetadata({ params }: { params: { id: string } }) {
  const locations = await getLocations();
  const location = locations.find(loc => loc.id === params.id);
  
  if (!location) {
    return {
      title: 'Bölge Bulunamadı | Eyleniyoruzvillamda',
      description: 'Aradığınız bölge bulunamadı.'
    };
  }
  
  return {
    title: `${location.name} Villaları | Eyleniyoruzvillamda`,
    description: `${location.name} bölgesindeki lüks villalarımızı keşfedin. ${location.description}`
  };
}

// Villa kartı bileşeni
const VillaCard = ({ villa }: { villa: Villa }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-transform hover:translate-y-[-5px] duration-300">
      <div className="relative h-48">
        <Image
          src={villa.resimler && villa.resimler.length > 0 ? villa.resimler[0] : '/placeholder-villa.jpg'}
          alt={villa.ad}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
          {villa.fiyat.toLocaleString('tr-TR')} ₺/gece
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{villa.ad}</h3>
        <p className="text-gray-500 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {villa.konum}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {villa.kapasite} Misafir
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {villa.yatak} Yatak Odası
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {villa.banyo} Banyo
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-accent-500">
            {villa.havuzVar && (
              <div className="flex items-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Havuzlu
              </div>
            )}
          </div>
          <Link 
            href={`/villalar/${villa.id}`} 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Detaylar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default async function LocationDetailPage({ params }: { params: { id: string } }) {
  // Tüm bölgeleri getir
  const locations = await getLocations();
  
  // URL parametresinden gelen ID'ye göre bölgeyi bul
  const location = locations.find(loc => loc.id === params.id);
  
  // Bölge bulunamazsa 404 sayfasına yönlendir
  if (!location) {
    notFound();
  }
  
  // Bu bölgedeki villaları getir
  const regionVillas = await getVillasByLocation(location.name);
  
  return (
    <>
      <main className="pt-32 pb-20">
        {/* Hero Banner */}
        <div className="relative h-96 mb-12">
          <Image
            src={location.image}
            alt={location.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-turquoise/50 via-black/50 to-primary/30"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-md">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{location.name}</h1>
              <p className="text-xl max-w-2xl mx-auto text-white">{location.description}</p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Bilgi Kısmı */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6"><span className="text-dark">{location.name}</span> <span className="text-primary">Hakkında</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4">
                  {location.description} Bu bölgede toplam {location.villaCount} lüks kiralık villa bulunmaktadır.
                </p>
                <p className="text-gray-700 mb-4">
                  Türkiye'nin en güzel tatil destinasyonlarından biri olan <span className="text-dark font-medium">{location.name}</span>, ziyaretçilerine unutulmaz bir tatil deneyimi sunuyor. Muhteşem doğal güzellikler, berrak deniz ve eşsiz koylar, bu bölgeyi özel kılan özelliklerden sadece birkaçı.
                </p>
                <p className="text-gray-700">
                  Eyleniyoruzvillam<span className="text-accent">da</span> olarak, <span className="text-dark font-medium">{location.name}</span> bölgesindeki en özel villaları sizler için seçtik. Tatil planınızı bu eşsiz villalarda konaklayarak taçlandırabilirsiniz.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-ocean/10 p-5 rounded-xl border border-ocean/20">
                  <h3 className="font-bold text-ocean mb-3 text-lg">Konum Özellikleri</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>En yakın havaalanına mesafe: ~45 km</li>
                    <li>Merkeze uzaklık: 5-15 km</li>
                    <li>Plajlara uzaklık: 0.5-5 km</li>
                    <li>Deniz suyu sıcaklığı: 22-26°C (yaz)</li>
                  </ul>
                </div>
                
                <div className="bg-turquoise/10 p-5 rounded-xl border border-turquoise/20">
                  <h3 className="font-bold text-turquoise mb-3 text-lg">Görülmesi Gereken Yerler</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Tarihi merkezler ve antik kentler</li>
                    <li>Doğal koylar ve plajlar</li>
                    <li>Milli parklar ve doğa alanları</li>
                    <li>Yerel pazarlar ve restoranlar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Villa Listesi */}
          <h2 className="text-2xl font-bold mb-6"><span className="text-dark">{location.name}</span> <span className="text-primary">Bölgesindeki Villalar</span></h2>
          
          {regionVillas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {regionVillas.map(villa => (
                <VillaCard key={villa.id} villa={villa} />
              ))}
            </div>
          ) : (
            <div className="bg-sand/20 border border-sand/30 p-6 rounded-xl mb-12">
              <h3 className="text-lg font-bold text-coral mb-3">Bu bölgede henüz villa bulunmuyor</h3>
              <p className="text-gray-700">
                <span className="text-dark font-medium">{location.name}</span> bölgesinde şu anda müsait villa bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin veya diğer bölgelerdeki villalarımıza göz atın.
              </p>
              <Link 
                href="/villalar" 
                className="inline-block mt-5 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                Tüm Villaları Görüntüle
              </Link>
            </div>
          )}
          
          {/* Bölgelerarası Navigasyon */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-5">Diğer <span className="text-accent">Tatil Bölgeleri</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {locations
                .filter(loc => loc.id !== location.id)
                .map(loc => (
                  <Link 
                    key={loc.id} 
                    href={`/bolgeler/${loc.id}`}
                    className="bg-light hover:bg-sand/10 p-4 rounded-xl text-center transition-all duration-300 border border-gray-100 hover:border-accent/30 hover:shadow-md"
                  >
                    <h4 className="font-bold text-dark">{loc.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{loc.villaCount} Villa</p>
                  </Link>
                ))
              }
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 