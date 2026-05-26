import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Rezervasyon veri tipi
export interface Reservation {
  villaId: string;
  villaAd: string;
  musteriAd: string;
  musteriSoyad: string;
  musteriTelefon: string;
  musteriEmail: string;
  girisTarihi: Date;
  cikisTarihi: Date;
  kisiSayisi: number;
  toplamFiyat: number;
  durum: 'beklemede' | 'onaylandi' | 'iptal';
  createdAt: any;
  id?: string; // Doküman ID'si
}

// Tarihler arasındaki tüm günleri hesaplayan yardımcı fonksiyon
// GİRİŞ tarihi dahil, ÇIKIŞ tarihi HARİÇ (çıkış günü başka misafirin giriş günü olabilir)
const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
  const dateArray: string[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);
  
  // Bitiş tarihi HARİÇ - çıkış günü bir sonraki giriş günü olabilir
  while (currentDate < lastDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dateArray.push(`${year}-${month}-${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
};

// Villa dolu tarihlerini güncelleme (sadece giriş-çıkış arası, çıkış günü hariç)
const updateVillaBookedDates = async (villaId: string, startDate: Date, endDate: Date): Promise<void> => {
  const dateRange = getDatesInRange(startDate, endDate);
  if (dateRange.length === 0) return;
  
  const villaRef = doc(db, "villalar", villaId);
  // Firestore arrayUnion max 500 öğe alır, gruplar halinde ekle
  const chunkSize = 100;
  for (let i = 0; i < dateRange.length; i += chunkSize) {
    const chunk = dateRange.slice(i, i + chunkSize);
    await updateDoc(villaRef, {
      doluTarihler: arrayUnion(...chunk)
    });
  }
};

// Admin panel için veri çevirici
const convertToAdminFormat = (data: Omit<Reservation, 'createdAt' | 'durum'>, userId?: string) => {
  return {
    villaId: data.villaId,
    villaName: data.villaAd,
    fullName: `${data.musteriAd} ${data.musteriSoyad}`,
    email: data.musteriEmail,
    phone: data.musteriTelefon,
    startDate: data.girisTarihi,
    endDate: data.cikisTarihi,
    guests: data.kisiSayisi,
    totalPrice: data.toplamFiyat,
    status: 'pending', // Admin paneldeki durum adları ingilizce
    createdAt: serverTimestamp(),
    userId: userId || null, // Kullanıcı ID'sini ekle (varsa)
    source: 'web',
  };
};

// Rezervasyon oluştur
export const createReservation = async (
  reservation: Omit<Reservation, 'createdAt' | 'durum'>, 
  userId?: string
): Promise<string> => {
  try {
    // Admin panel formatına çevir
    const adminFormatData = convertToAdminFormat(reservation, userId);

    // Admin panelin beklediği koleksiyon adı: "reservations"
    const docRef = await addDoc(collection(db, "reservations"), adminFormatData);
    
    // Eğer kullanıcı giriş yapmamışsa, localStorage'a kaydet
    if (!userId) {
      saveReservationToLocalStorage({
        ...reservation,
        id: docRef.id,
        durum: 'beklemede',
        createdAt: new Date(),
      });
    }
    
    console.log("Rezervasyon başarıyla oluşturuldu. ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Rezervasyon oluşturulurken hata oluştu:", error);
    throw new Error("Rezervasyon oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
  }
};

// Kullanıcı ID'ye göre rezervasyonları getir
export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  try {
    // Firebase'de kullanıcının rezervasyonlarını sorgula
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const reservations: Reservation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Firebase'den gelen timestamps'leri Date nesnesine çevir
      const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate);
      const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      
      // Admin formatından client formatına çevir
      reservations.push({
        id: doc.id,
        villaId: data.villaId,
        villaAd: data.villaName,
        musteriAd: data.fullName.split(' ')[0] || '',
        musteriSoyad: data.fullName.split(' ')[1] || '',
        musteriTelefon: data.phone,
        musteriEmail: data.email,
        girisTarihi: startDate,
        cikisTarihi: endDate,
        kisiSayisi: data.guests,
        toplamFiyat: data.totalPrice,
        durum: convertStatusTurkish(data.status),
        createdAt: createdAt,
      });
    });
    
    // LocalStorage'dan kaydedilmiş rezervasyonları al ve birleştir
    const localReservations = getLocalStorageReservations();
    
    return [...reservations, ...localReservations];
  } catch (error) {
    console.error("Rezervasyonlar getirilirken hata oluştu:", error);
    throw new Error("Rezervasyonlar getirilemedi. Lütfen daha sonra tekrar deneyin.");
  }
};

// LocalStorage'a rezervasyon kaydet
export const saveReservationToLocalStorage = (reservation: Reservation) => {
  try {
    // Mevcut rezervasyonları al
    const existingReservations = localStorage.getItem('pendingReservations');
    const reservations = existingReservations ? JSON.parse(existingReservations) : [];
    
    // Yeni rezervasyonu ekle
    reservations.push({
      ...reservation,
      girisTarihi: reservation.girisTarihi.toString(), // Tarihleri string'e çevir
      cikisTarihi: reservation.cikisTarihi.toString(),
      createdAt: new Date().toString(),
    });
    
    // LocalStorage'a kaydet
    localStorage.setItem('pendingReservations', JSON.stringify(reservations));
    
    console.log("Rezervasyon başarıyla localStorage'a kaydedildi.");
  } catch (error) {
    console.error("Rezervasyon localStorage'a kaydedilirken hata:", error);
  }
};

// LocalStorage'dan rezervasyonları getir
export const getLocalStorageReservations = (): Reservation[] => {
  try {
    const reservationsJson = localStorage.getItem('pendingReservations');
    if (!reservationsJson) return [];
    
    const reservations = JSON.parse(reservationsJson);
    
    // Stringleştirilmiş tarihleri Date nesnelerine çevir
    return reservations.map((res: any) => ({
      ...res,
      girisTarihi: new Date(res.girisTarihi),
      cikisTarihi: new Date(res.cikisTarihi),
      createdAt: new Date(res.createdAt),
    }));
  } catch (error) {
    console.error("LocalStorage'dan rezervasyonlar alınırken hata:", error);
    return [];
  }
};

// LocalStorage'daki rezervasyonları kullanıcıya aktar
export const associateLocalReservationsWithUser = async (userId: string) => {
  try {
    const localReservations = getLocalStorageReservations();
    if (localReservations.length === 0) return;
    
    // Her rezervasyon için Firebase'e userId ekle
    for (const reservation of localReservations) {
      const reservationRef = doc(db, "reservations", reservation.id || '');
      await updateDoc(reservationRef, { userId });
    }
    
    // Başarılı olursa localStorage'ı temizle
    localStorage.removeItem('pendingReservations');
    
    console.log(`${localReservations.length} rezervasyon kullanıcıya aktarıldı.`);
  } catch (error) {
    console.error("Rezervasyonlar kullanıcıya aktarılırken hata:", error);
  }
};

// İngilizce durumları Türkçeye çevir
const convertStatusTurkish = (status: string): 'beklemede' | 'onaylandi' | 'iptal' => {
  switch (status) {
    case 'pending': return 'beklemede';
    case 'approved': return 'onaylandi';
    case 'rejected': return 'iptal';
    default: return 'beklemede';
  }
};

// Rezervasyon durumunu güncelle ve villa doluluğunu işaretle
export const updateReservationStatus = async (
  reservationId: string,
  newStatus: 'pending' | 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    // Rezervasyon belgesini al
    const reservationRef = doc(db, "reservations", reservationId);
    const reservationDoc = await getDoc(reservationRef);
    
    if (!reservationDoc.exists()) {
      throw new Error(`Rezervasyon bulunamadı: ${reservationId}`);
    }
    
    const reservationData = reservationDoc.data();
    
    // Rezervasyon durumunu güncelle
    await updateDoc(reservationRef, {
      status: newStatus
    });
    
    // Eğer rezervasyon onaylandıysa, dolu tarihleri güncelleyelim
    if (newStatus === 'approved') {
      const villaId = reservationData.villaId;
      const startDate = reservationData.startDate.toDate ? 
                        reservationData.startDate.toDate() : 
                        new Date(reservationData.startDate);
      const endDate = reservationData.endDate.toDate ? 
                      reservationData.endDate.toDate() : 
                      new Date(reservationData.endDate);
      
      // Başlangıç ve bitiş tarihleri arasındaki tüm günleri hesapla
      const dateRange = getDatesInRange(startDate, endDate);
      
      // Villa belgesini al
      const villaRef = doc(db, "villalar", villaId);
      const villaDoc = await getDoc(villaRef);
      
      if (!villaDoc.exists()) {
        console.error(`Villa bulunamadı: ${villaId}`);
        return false;
      }
      
      // Villa belgesindeki doluTarihler alanını güncelle
      await updateDoc(villaRef, {
        doluTarihler: arrayUnion(...dateRange)
      });
      
      console.log(`${villaId} ID'li villa için ${dateRange.length} tarih dolu olarak işaretlendi`);
    }
    
    return true;
  } catch (error) {
    console.error("Rezervasyon durumu güncellenirken hata oluştu:", error);
    throw new Error("Rezervasyon durumu güncellenemedi.");
  }
}; 