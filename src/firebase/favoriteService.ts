import { 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  doc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Villa } from './villaService';

// Favori villa veri tipi
export interface Favorite {
  id?: string;          // Favori belgesi ID'si
  userId: string;       // Kullanıcı ID'si
  villaId: string;      // Villa ID'si
  villaAd?: string;     // Villa adı
  villaResim?: string;  // Villa resmi
  villaKonum?: string;  // Villa konumu
  villaFiyat?: number;  // Villa fiyatı
  createdAt: any;       // Eklenme tarihi
}

// Favori villa ekleme
export const addFavorite = async (userId: string, villa: Villa): Promise<string> => {
  try {
    // Favori nesnesi oluştur
    const favoriteData: Favorite = {
      userId,
      villaId: villa.id,
      villaAd: villa.ad,
      villaResim: villa.gorseller && villa.gorseller.length > 0 
        ? villa.gorseller[0] 
        : villa.resimler && villa.resimler.length > 0 
          ? villa.resimler[0] 
          : '',
      villaKonum: villa.konum,
      villaFiyat: villa.fiyat,
      createdAt: serverTimestamp()
    };

    // Firestore'a ekle
    const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
    console.log('Villa favorilere eklendi. ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Favori eklenirken hata oluştu:', error);
    throw new Error('Villa favorilere eklenemedi. Lütfen daha sonra tekrar deneyin.');
  }
};

// Favori villayı kaldırma
export const removeFavorite = async (userId: string, villaId: string): Promise<boolean> => {
  try {
    // Önce ilgili favori belgesini bul
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, 
      where('userId', '==', userId),
      where('villaId', '==', villaId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn('Bu villa favorilerde bulunamadı.');
      return false;
    }
    
    // Bulunan belgeyi sil
    await deleteDoc(doc(db, 'favorites', querySnapshot.docs[0].id));
    console.log('Villa favorilerden kaldırıldı.');
    return true;
  } catch (error) {
    console.error('Favori kaldırılırken hata oluştu:', error);
    throw new Error('Villa favorilerden kaldırılamadı. Lütfen daha sonra tekrar deneyin.');
  }
};

// Kullanıcının tüm favori villalarını getir
export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites: Favorite[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Tarih alanını düzelt
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      
      favorites.push({
        id: doc.id,
        userId: data.userId,
        villaId: data.villaId,
        villaAd: data.villaAd,
        villaResim: data.villaResim,
        villaKonum: data.villaKonum,
        villaFiyat: data.villaFiyat,
        createdAt: createdAt
      });
    });
    
    return favorites;
  } catch (error) {
    console.error('Favoriler getirilirken hata oluştu:', error);
    throw new Error('Favoriler getirilemedi. Lütfen daha sonra tekrar deneyin.');
  }
};

// Villa favoride mi kontrol et
export const isVillaFavorited = async (userId: string, villaId: string): Promise<boolean> => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, 
      where('userId', '==', userId),
      where('villaId', '==', villaId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Favori kontrolünde hata oluştu:', error);
    return false;
  }
}; 