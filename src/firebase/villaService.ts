import { collection, getDocs, getDoc, doc, query, where, limit } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Villa veri tipi
export interface Villa {
  id: string;
  ad: string;
  aciklama: string;
  fiyat: number;
  normalFiyat?: number;
  fiyatlar?: Record<string, number>;
  seasonalPrices?: Record<string, number>;
  specialDailyPrices?: Record<string, number>;
  konum: string;
  denizeUzaklik?: string;
  kapasite: number;
  banyo: number;
  yatak: number;
  ozellikler: string[];
  resimler: string[];
  gorseller?: string[];
  doluTarihler: string[];
  createdAt: string; // Timestamp yerine ISO string
  olusturulmaTarihi?: string; // Timestamp yerine ISO string
  havuzVar?: boolean;
  barbekuVar?: boolean;
  mustakilMi?: boolean;
  belgeNo?: string;
  mapEmbedUrl?: string;
  roomCount?: number;
  balconyCount?: number;
  showerCount?: number;
  toiletCount?: number;
  merkezeUzaklik?: string;
  havaalaninaUzaklik?: string;
}

// Timestamp'i ISO string'e çeviren yardımcı fonksiyon
const convertTimestampToISOString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  
  // Firestore timestamp objesi kontrolü
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Zaten Date objesi ise
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // seconds ve nanoseconds içeren obje ise
  if (timestamp && timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  
  // String ise
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toISOString();
  }
  
  // Hiçbiri değilse şimdiki zamanı dön
  return new Date().toISOString();
};

// Sezonluk fiyatları Türkçe ay isimleriyle fiyatlar nesnesine eşler
const convertSeasonalPricesToFiyatlar = (seasonalPrices: Record<string, number> = {}): Record<string, number> => {
  const mapping: Record<string, string> = {
    january: "Ocak",
    february: "Şubat",
    march: "Mart",
    april: "Nisan",
    may: "Mayıs",
    june: "Haziran",
    july: "Temmuz",
    august: "Ağustos",
    september: "Eylül",
    october: "Ekim",
    november: "Kasım",
    december: "Aralık"
  };
  
  const fiyatlar: Record<string, number> = {};
  Object.entries(seasonalPrices).forEach(([key, val]) => {
    const trKey = mapping[key.toLowerCase()] || key;
    fiyatlar[trKey] = val;
  });
  return fiyatlar;
};

// Aktif ayı veya en yakın ayı baz alarak kartta gösterilecek gecelik temel fiyatı hesaplar
const getCurrentOrNextPrice = (seasonalPrices: Record<string, number> = {}, baseFiyat: number = 0): number => {
  const monthsEng = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const currentMonthIndex = new Date().getMonth();
  for (let i = 0; i < 12; i++) {
    const idx = (currentMonthIndex + i) % 12;
    const engKey = monthsEng[idx];
    if (seasonalPrices[engKey] && seasonalPrices[engKey] > 0) {
      return seasonalPrices[engKey];
    }
  }
  return baseFiyat;
};

const convertAdminVillaToModel = (data: any, id: string): Villa => {
  const booleanFeatures: string[] = [];
  if (data.havuzVar) booleanFeatures.push("Özel Havuz");
  if (data.barbekuVar) booleanFeatures.push("Barbekü");
  if (data.mustakilMi) booleanFeatures.push("Müstakil Villa");
  
  let adminFeatures: string[] = [];
  
  // Hem dizi (array) hem de nesne (object) olarak gelen verileri topla
  ['features', 'ozellikler', 'amenities'].forEach(key => {
    if (Array.isArray(data[key])) {
      adminFeatures.push(...data[key]);
    } else if (data[key] && typeof data[key] === 'object') {
      Object.entries(data[key]).forEach(([k, v]) => {
        if (v === true) adminFeatures.push(k);
      });
    }
  });

  const ozellikler = [...new Set([...adminFeatures, ...booleanFeatures])].filter(Boolean);
  
  const seasonalPrices = data.seasonalPrices || {};
  const specialDailyPrices = data.specialDailyPrices || {};
  
  const calculatedFiyat = getCurrentOrNextPrice(seasonalPrices, data.fiyat || 0);
  const mappedFiyatlar = Object.keys(seasonalPrices).length > 0
    ? convertSeasonalPricesToFiyatlar(seasonalPrices)
    : (data.fiyatlar || {});
  
  return {
    id,
    ad: data.ad || "",
    aciklama: data.aciklama || "",
    fiyat: calculatedFiyat,
    normalFiyat: data.normalFiyat || 0,
    fiyatlar: mappedFiyatlar,
    seasonalPrices,
    specialDailyPrices,
    konum: data.konum || "",
    denizeUzaklik: data.denizeUzaklik || data.distanceToSea || "",
    kapasite: data.kapasite || 0,
    banyo: data.banyo || 1,
    yatak: data.yatak || 1,
    ozellikler,
    resimler: data.gorseller || [],
    gorseller: data.gorseller || [],
    doluTarihler: data.doluTarihler || [],
    createdAt: convertTimestampToISOString(data.olusturulmaTarihi),
    olusturulmaTarihi: convertTimestampToISOString(data.olusturulmaTarihi),
    havuzVar: data.havuzVar || false,
    barbekuVar: data.barbekuVar || false,
    mustakilMi: data.mustakilMi || false,
    belgeNo: data.belgeNo || "",
    mapEmbedUrl: data.mapEmbedUrl || data.haritaUrl || "",
    roomCount: data.roomCount || data.odaSayisi || 0,
    balconyCount: data.balconyCount || data.balkonSayisi || 0,
    showerCount: data.showerCount || data.dusSayisi || 0,
    toiletCount: data.toiletCount || data.tuvaletSayisi || data.lavaboSayisi || 0,
    merkezeUzaklik: data.merkezeUzaklik || data.distanceToCenter || "",
    havaalaninaUzaklik: data.havaalaninaUzaklik || data.distanceToAirport || ""
  };
};

// Tüm villaları getir
export const getVillalar = async (): Promise<Villa[]> => {
  try {
    const villalarRef = collection(db, "villalar");
    const snapshot = await getDocs(villalarRef);
    
    const villalar = snapshot.docs.map(doc => {
      const data = doc.data();
      return convertAdminVillaToModel(data, doc.id);
    });

    // Client-side sıralama (Firestore index gerektirmez)
    return villalar.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Villalar getirilirken hata oluştu:", error);
    return [];
  }
};

// ID'ye göre villa getir
export const getVillaById = async (id: string): Promise<Villa | null> => {
  try {
    const villaDoc = await getDoc(doc(db, "villalar", id));
    
    if (!villaDoc.exists()) {
      return null;
    }
    
    const data = villaDoc.data();
    return convertAdminVillaToModel(data, villaDoc.id);
  } catch (error) {
    console.error(`${id} ID'li villa getirilirken hata oluştu:`, error);
    return null;
  }
}; 