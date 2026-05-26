import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { getLocations } from '@/firebase/locationService';

export const metadata = {
  title: 'Tüm Bölgeler | Eyleniyoruzvillamda',
  description: 'Türkiye\'nin en güzel tatil bölgelerindeki lüks villa seçeneklerimizi keşfedin. Bodrum, Fethiye, Kalkan, Kaş ve daha fazlası!'
};

const LocationCard = ({ location }: { location: any }) => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group">
      {/* Arka plan resmi */}
      <div className="h-80 relative">
        <img
          src={location.image && typeof location.image === 'string' && location.image.trim() !== '' ? location.image : "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop"}
          alt={location.name || 'Bölge'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Karanlık gradient kaplama */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
      </div>
      
      {/* İçerik */}
      <div className="absolute bottom-0 left-0 p-6 text-white w-full">
        <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
        <p className="text-sm opacity-90 mb-4 line-clamp-2">
          {location.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {location.villaCount} Villa
          </span>
          <Link 
            href={`/bolgeler/${location.id}`}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default async function BolgelerPage() {
  // Server Component'te doğrudan async/await kullanabiliyoruz
  const locations = await getLocations();
  
  return (
    <>
      <main className="pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Başlık */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              Tüm <span className="text-primary">Bölgeler</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Türkiye'nin en güzel tatil bölgelerindeki lüks villalarımızı keşfedin. 
              Her bölge benzersiz bir deneyim ve unutulmaz anılar sunar.
            </p>
          </div>
          
          {/* İçerik */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map(location => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
          
          {/* Ek bilgi */}
          <div className="mt-16 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Bölge Seçimi Nasıl Yapılır?</h2>
            <p className="text-gray-700 mb-4">
              Her tatil bölgesinin kendine özgü özellikleri vardır. Bölge seçerken şunlara dikkat edebilirsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><span className="font-medium">Deniz ve Plajlar:</span> Eğer deniz tatili istiyorsanız, Bodrum ve Fethiye harika seçeneklerdir.</li>
              <li><span className="font-medium">Doğa ve Sakinlik:</span> Daha sakin ve doğal bir ortam için Kaş ve Kalkan idealdir.</li>
              <li><span className="font-medium">Tarihi Yerler:</span> Tarihi yerler görmek istiyorsanız, Fethiye ve çevresi birçok antik kent barındırır.</li>
              <li><span className="font-medium">Gece Hayatı:</span> Eğlence arıyorsanız, Bodrum canlı gece hayatıyla ünlüdür.</li>
            </ul>
            <p className="text-gray-700">
              Hangi bölgeyi seçerseniz seçin, Eyleniyoruzvillam<span className="text-accent">da</span> ile unutulmaz bir tatil deneyimi sizi bekliyor!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 