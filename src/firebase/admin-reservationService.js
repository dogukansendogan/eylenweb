/**
 * Bu dosya, admin panelde rezervasyon durumunu güncellemek için kullanılır.
 * Admin panelde bu dosyayı import ederek kullanabilirsiniz.
 */

import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * İki tarih arasındaki tüm günleri YYYY-MM-DD formatında döndürür.
 * GİRİŞ tarihi dahil, ÇIKIŞ tarihi HARİÇ - çıkış günü
 * bir sonraki misafirin giriş günü olabilir.
 */
export const getDatesInRange = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);
  
  // Başlangıç tarihi dahil, bitiş tarihi HARİÇ
  while (currentDate < lastDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dateArray.push(`${year}-${month}-${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
};

/**
 * Rezervasyon onaylandığında, villanın doluTarihler alanını günceller
 * Admin panelde bu fonksiyonu kullanarak, onaylanan rezervasyonların tarihlerini
 * villanın doluTarihler alanına ekleyebilirsiniz.
 */
export const updateVillaBookedDates = async (villaId, startDate, endDate) => {
  try {
    if (!villaId || !startDate || !endDate) {
      throw new Error("Villa ID, başlangıç tarihi ve bitiş tarihi gereklidir");
    }
    
    // Tarihler arasındaki tüm günleri hesapla
    const dateRange = getDatesInRange(startDate, endDate);
    
    console.log("Eklenecek tarihler:", dateRange);
    
    // Villa belgesini al
    const villaRef = doc(db, "villalar", villaId);
    const villaDoc = await getDoc(villaRef);
    
    if (!villaDoc.exists()) {
      throw new Error(`Villa bulunamadı: ${villaId}`);
    }
    
    // Mevcut doluTarihler'i al (eğer varsa)
    const villaData = villaDoc.data();
    console.log("Mevcut villa doluTarihler:", villaData.doluTarihler || []);
    
    // Villa belgesindeki doluTarihler alanını güncelle
    // NOT: arrayUnion kullanarak her tarihi tek tek ekliyoruz, 
    // çünkü ...dateRange şeklinde kullanırsak maksimum 500 öğelik sınıra takılabiliriz
    for (const dateStr of dateRange) {
      await updateDoc(villaRef, {
        doluTarihler: arrayUnion(dateStr)
      });
    }
    
    console.log(`${villaId} ID'li villa için ${dateRange.length} tarih dolu olarak işaretlendi`);
    return true;
  } catch (error) {
    console.error("Villa doluluk tarihleri güncellenirken hata oluştu:", error);
    throw error;
  }
};

/**
 * Admin panelde bu fonksiyonu güncelleyerek, rezervasyonun durumunu değiştirebilir
 * ve onaylandığında dolu tarihleri otomatik olarak güncelleyebilirsiniz.
 */
export const adminUpdateReservation = async (reservationId, updateData, updateBookedDates = false) => {
  try {
    // Rezervasyon belgesini güncelle
    const reservationRef = doc(db, "reservations", reservationId);
    await updateDoc(reservationRef, updateData);
    
    // Eğer "approved" durumuna geçildiyse ve doluluk tarihlerini güncellemek isteniyorsa
    if (updateData.status === "approved" && updateBookedDates) {
      await updateVillaBookedDates(
        updateData.villaId,
        updateData.startDate instanceof Date ? updateData.startDate : new Date(updateData.startDate),
        updateData.endDate instanceof Date ? updateData.endDate : new Date(updateData.endDate)
      );
    }
    
    return true;
  } catch (error) {
    console.error("Rezervasyon güncellenirken hata oluştu:", error);
    throw error;
  }
}; 