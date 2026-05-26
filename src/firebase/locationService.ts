import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getVillalar, Villa } from "./villaService";

// Bölge veri tipi
export interface Location {
  id: string;
  name: string;
  description: string;
  image: string;
  villaCount: number;
  featuredOrder?: number;
  active?: boolean;
}

// Firebase'den bölgeleri getir
export const getLocations = async (): Promise<Location[]> => {
  try {
    // Önce tüm villaları getir ve illerine göre grupla
    const villalar = await getVillalar();
    
    // İl bazlı villa sayılarını hesapla
    const villaCountsByIl = villalar.reduce((acc: Record<string, number>, villa) => {
      // @ts-ignore - eğer il alanı varsa kullan, yoksa konumdan parçala (Örn: "Bodrum, Muğla" -> "Muğla")
      let il = villa.il;
      if (!il) {
        const parts = (villa.konum || "").split(',');
        il = parts.length > 1 ? parts[parts.length - 1].trim() : villa.konum;
      }
      
      if (il) {
        acc[il] = (acc[il] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Villa olan her ili dinamik bir konuma çevir
    const dynamicLocations: Location[] = Object.keys(villaCountsByIl).map((ilName, index) => {
      const id = ilName.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '-');
      return {
        id,
        name: ilName,
        description: `${ilName} bölgesindeki eşsiz villalarımızı keşfedin.`,
        image: `https://source.unsplash.com/featured/?${ilName.toLowerCase()},vacation,turkey`,
        villaCount: villaCountsByIl[ilName],
        featuredOrder: index,
        active: true
      };
    });

    // En çok villa olan ili en başa al
    return dynamicLocations.sort((a, b) => b.villaCount - a.villaCount);
  } catch (error) {
    console.error("Bölgeler getirilirken hata oluştu:", error);
    return getDefaultLocations();
  }
};

// Bölge ID'sine göre villalar getir
export const getVillasByLocation = async (locationName: string): Promise<Villa[]> => {
  try {
    const villalar = await getVillalar();
    return villalar.filter(villa => {
      // @ts-ignore
      const il = villa.il || (villa.konum || "").split(',').pop()?.trim() || villa.konum;
      return il.toLowerCase().includes(locationName.toLowerCase()) || 
             villa.konum.toLowerCase().includes(locationName.toLowerCase());
    });
  } catch (error) {
    console.error(`${locationName} bölgesindeki villalar getirilirken hata oluştu:`, error);
    return [];
  }
};

// Varsayılan bölge verileri
export const getDefaultLocations = (villaCountsByLocation: Record<string, number> = {}): Location[] => {
  return [
    {
      id: 'bodrum',
      name: 'Bodrum',
      description: 'Turkuaz koylar, beyaz badanalı evler ve canlı gece hayatıyla Bodrum, lüks tatil için mükemmel bir destinasyon.',
      villaCount: villaCountsByLocation['Bodrum'] || 0,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      active: true
    },
    {
      id: 'fethiye',
      name: 'Fethiye',
      description: 'Tarihi kalıntılar, doğal güzellikler ve muhteşem plajlarıyla Fethiye, huzur arayanlar için ideal.',
      villaCount: villaCountsByLocation['Fethiye'] || 0,
      image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?q=80&w=800&auto=format&fit=crop',
      active: true
    },
    {
      id: 'kalkan',
      name: 'Kalkan',
      description: 'Mavi bayraklı plajları, zarif restoranları ve muhteşem manzarasıyla Kalkan, romantik bir kaçamak için mükemmel.',
      villaCount: villaCountsByLocation['Kalkan'] || 0,
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
      active: true
    },
    {
      id: 'kas',
      name: 'Kaş',
      description: 'Dalış cennetleri, sakin atmosferi ve otantik yapısıyla Kaş, doğa ile iç içe bir tatil deneyimi sunar.',
      villaCount: villaCountsByLocation['Kaş'] || 0,
      image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=800&auto=format&fit=crop',
      active: true
    },
  ];
}; 