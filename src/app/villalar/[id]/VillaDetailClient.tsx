'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';
import VillaCalendar from './VillaCalendar';
import { 
  MapPinIcon, 
  HomeIcon, 
  HomeModernIcon, 
  UserGroupIcon,
  CheckIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Villa } from '@/firebase/villaService';
import { createReservation } from '@/firebase/reservationService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

// İndirim kuponu veri tipi
interface Discount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  endDate: string;
}

interface VillaDetailClientProps {
  villa: Villa | null;
  id: string;
}

export default function VillaDetailClient({ villa, id }: VillaDetailClientProps) {
  // Yedek resim URL'si
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop';
  
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<{[key: number]: boolean}>({});
  
  const [mainImage, setMainImage] = useState(
    villa?.gorseller && villa?.gorseller?.length > 0 
      ? villa?.gorseller[0] 
      : villa?.resimler && villa?.resimler?.length > 0 
        ? villa?.resimler[0] 
        : fallbackImageUrl
  );
  
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [selectedDatesPrices, setSelectedDatesPrices] = useState<Array<{date: string, price: number, monthName: string}>>([]);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  
  // Payment step states
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Gelen villa konum verisini konsola yazdır (Debugging)
  // Sunucu ve İstemci Uyumlu URL Yakalayıcı (Pure Link Extractor)
  const extractGoogleMapsUrl = (input: string | null | undefined): string | null => {
    if (!input || typeof input !== 'string') return null;
    const cleanInput = input.trim();
    
    // Eğer veri zaten direkt link olarak başladıysa olduğu gibi döndür
    if (cleanInput.startsWith('http')) return cleanInput;
    
    // String içinde https:// ile başlayan ve tırnak, boşluk veya ters eğik çizgiyle bitmeyen URL'yi cımbızla çek
    const urlMatch = cleanInput.match(/https?:\/\/[^"'\s\\]+/);
    return urlMatch ? urlMatch[0] : null;
  };

  // State ve Render Mantığı
  const finalMapUrl = useMemo(() => {
    if (!villa?.mapEmbedUrl) return null;
    return extractGoogleMapsUrl(villa.mapEmbedUrl) || villa.mapEmbedUrl;
  }, [villa]);


  
  // Rezervasyon formu state'leri
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Kupon / İndirim Kodu State'leri
  const [couponCode, setCouponCode] = useState('');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Discount | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Firebase'den aktif kuponları çek
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const couponsRef = collection(db, 'kuponlar');
        const activeQuery = query(couponsRef, where('isActive', '==', true));
        const snapshot = await getDocs(activeQuery);
        const fetched: Discount[] = snapshot.docs.map(doc => ({
          code: doc.data().code ?? '',
          type: doc.data().type ?? 'percentage',
          value: doc.data().value ?? 0,
          isActive: doc.data().isActive ?? false,
          endDate: doc.data().endDate ?? '',
        }));
        setDiscounts(fetched);
      } catch (err) {
        // Sessizce hata yut — kupon sistemi opsiyonel
        console.warn('Kupon verileri yüklenemedi:', err);
      }
    };
    fetchDiscounts();
  }, []);
  
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Kullanıcı bilgilerini form alanlarına doldur
  useEffect(() => {
    if (isAuthenticated && user) {
      const fullName = user.fullName || '';
      const nameParts = fullName.split(' ');
      
      // İsim ve soyismi ayır
      if (nameParts.length > 0) {
        setName(nameParts[0]);
        if (nameParts.length > 1) {
          setSurname(nameParts.slice(1).join(' '));
        }
      }
      
      // Email ve telefon
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [isAuthenticated, user]);
  
  // Konaklamanın gün sayısını hesaplama
  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateDays();
  
  // Seçilen günlerin toplam fiyatını hesapla (Ara Toplam)
  const subtotal = useMemo(() => {
    if (selectedDatesPrices.length > 0) {
      const datesTotal = selectedDatesPrices.reduce((total, info) => total + info.price, 0);
      return datesTotal;
    } else if (days > 0 && villa) {
      return villa.fiyat * days;
    }
    return 0;
  }, [selectedDatesPrices, days, villa?.fiyat]);

  // Kupon İndirim Miktarını Hesapla
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === "fixed") {
      return appliedCoupon.value;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // Nihai Ödenecek Toplam Tutar
  const totalPrice = useMemo(() => {
    const finalTotal = subtotal - discountAmount;
    return finalTotal > 0 ? finalTotal : 0;
  }, [subtotal, discountAmount]);
  
  const priceBreakdown = useMemo(() => {
    if (selectedDatesPrices.length === 0) return null;
    
    const breakdown: Record<string, { nights: number, pricePerNight: number, monthName: string, total: number }> = {};
    
    selectedDatesPrices.forEach(info => {
      const key = `${info.monthName}-${info.price}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          nights: 0,
          pricePerNight: info.price,
          monthName: info.monthName,
          total: 0
        };
      }
      breakdown[key].nights += 1;
      breakdown[key].total += info.price;
    });
    
    return Object.values(breakdown);
  }, [selectedDatesPrices]);
  
  // Güçlü ay eşleştirme (case ve accent insensitive)
  const normalizeMonth = (m: string) => {
    return m.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();
  };

  // Aylara göre fiyat listesi kronolojik olarak
  const sortedMonthlyPrices = useMemo(() => {
    if (!villa) return [];
    
    const trMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const dbMonths = villa.fiyatlar ? Object.keys(villa.fiyatlar) : [];
    
    const today = new Date();
    const currentMonth = trMonths[today.getMonth()];
    const nextMonth = trMonths[(today.getMonth() + 1) % 12];
    
    // Tüm ayları standart formata çevirerek birleştir
    const normalizedMap = new Map<string, string>(); // normalized -> original
    
    dbMonths.forEach(m => normalizedMap.set(normalizeMonth(m), m));
    normalizedMap.set(normalizeMonth(currentMonth), currentMonth);
    normalizedMap.set(normalizeMonth(nextMonth), nextMonth);
    
    const currentIdx = today.getMonth();
    
    // Kronolojik sıralama
    const sortedNormalized = Array.from(normalizedMap.keys()).sort((a, b) => {
      const idxA = trMonths.findIndex(m => normalizeMonth(m) === a);
      const idxB = trMonths.findIndex(m => normalizeMonth(m) === b);
      
      const adjA = idxA !== -1 && idxA >= currentIdx ? idxA - currentIdx : (idxA !== -1 ? idxA - currentIdx + 12 : 99);
      const adjB = idxB !== -1 && idxB >= currentIdx ? idxB - currentIdx : (idxB !== -1 ? idxB - currentIdx + 12 : 99);
      
      return adjA - adjB;
    });
    
    return sortedNormalized.map(normAy => {
      const originalAy = normalizedMap.get(normAy) || normAy;
      // Doğru TR ay ismini bul (gösterim için)
      const displayAy = trMonths.find(m => normalizeMonth(m) === normAy) || originalAy;
      return {
        ay: displayAy,
        fiyat: (villa.fiyatlar && villa.fiyatlar[originalAy]) ? villa.fiyatlar[originalAy] : villa.fiyat
      };
    });
  }, [villa]);

  // onPricesUpdate fonksiyonu referans kararlılığını sağlamak için useCallback ile sarmalanıyor
  const handlePricesUpdate = useCallback((prices: Array<{date: string, price: number, monthName: string}>) => {
    setSelectedDatesPrices(prices);
  }, []);

  // İndirim Kuponunu Uygulama ve Doğrulama (Firebase'den çekilen discounts listesini kullanır)
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponMessage({ text: 'Lütfen bir indirim kodu girin.', isError: true });
      return;
    }

    if (discounts.length === 0) {
      setCouponMessage({ text: 'İndirim kodu sistemi şu an kullanılabilir değil.', isError: true });
      return;
    }

    const found = discounts.find(
      c => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    );

    if (!found) {
      setCouponMessage({ text: 'Böyle bir indirim kodu bulunamadı.', isError: true });
      return;
    }

    if (!found.isActive) {
      setCouponMessage({ text: 'Bu indirim kodu artık aktif değil.', isError: true });
      return;
    }

    // Son kullanma tarihi kontrolü
    const endDate = new Date(found.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (endDate < today) {
      setCouponMessage({ text: 'Bu indirim kodunun süresi dolmuştur.', isError: true });
      return;
    }

    // Başarıyla kuponu uygula
    setAppliedCoupon(found);
    setCouponMessage({
      text: `"${found.code}" kuponu başarıyla uygulandı! ${found.type === 'percentage' ? `%${found.value}` : `${found.value} ₺`} indirim kazandınız.`,
      isError: false,
    });
  };

  // İndirim Kuponunu Kaldırma
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
  };
  
  // Resim hata işleyicileri
  const handleMainImageError = () => {
    setMainImageError(true);
  };
  
  const handleThumbnailError = (index: number) => {
    setThumbnailErrors(prev => ({...prev, [index]: true}));
  };
  
  // Ödeme ve onay durumunu takip eden state
  const [reservationStatus, setReservationStatus] = useState('pending'); // pending, awaiting_approval, approved
  
  // Galeri modu durumu
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  

  
  if (!villa) {
    return (
      <>
        <main className="pt-32 pb-20 bg-light">
          <div className="container-custom">
            <div className="text-center py-20">
              <h2 className="text-2xl mb-4 text-secondary font-bold">Villa verisi yükleniyor veya bulunamadı...</h2>
              <p className="mb-8 text-tertiary">Lütfen bekleyin veya farklı bir villayı deneyin.</p>
              <Link 
                href="/villalar"
                className="btn-primary"
              >
                Tüm Villalara Dön
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Villa resimleri
  const images = villa.gorseller && villa.gorseller.length > 0 
    ? villa.gorseller 
    : villa.resimler && villa.resimler.length > 0
      ? villa.resimler
      : [fallbackImageUrl];



  // Galerinin sonraki/önceki resme geçiş işlemleri
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // Galeri görüntüsünü açma
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
    // Kaydırmayı engelle
    document.body.style.overflow = 'hidden';
  };
  
  // Galeri görüntüsünü kapatma
  const closeGallery = () => {
    setIsGalleryOpen(false);
    // Kaydırmayı yeniden etkinleştir
    document.body.style.overflow = 'auto';
  };

  // Rezervasyon oluşturma fonksiyonu
  const handleReservation = async () => {
    // Form doğrulama
    if (!checkIn || !checkOut || !name || !surname || !phone || !email) {
      setFormError("Tüm alanları doldurunuz.");
      return;
    }
    
    if (checkIn >= checkOut) {
      setFormError("Giriş tarihi, çıkış tarihinden önce olmalıdır.");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Rezervasyon verisini hazırla
      const reservationData = {
        villaId: id,
        villaAd: villa?.ad || "",
        musteriAd: name,
        musteriSoyad: surname,
        musteriTelefon: phone,
        musteriEmail: email,
        girisTarihi: checkIn,
        cikisTarihi: checkOut,
        kisiSayisi: guests,
        toplamFiyat: totalPrice
      };
      
      // Firebase'e rezervasyon kaydı oluştur
      // Eğer kullanıcı giriş yapmışsa userID'yi gönder
      const resId = await createReservation(reservationData, isAuthenticated ? user?.id : undefined);
      
      // Başarılı olduğunda
      setCreatedReservationId(resId);
      setShowPaymentStep(true);
      
    } catch (error) {
      console.error("Rezervasyon oluşturulurken hata:", error);
      setFormError("Rezervasyon oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error("Lütfen PDF, PNG veya JPG formatında bir dosya yükleyin.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText("TR91 0001 2009 3847 5630 1928 47");
    toast.success("IBAN kopyalandı!");
  };

  const handleCopyCode = () => {
    if (createdReservationId) {
      navigator.clipboard.writeText(createdReservationId);
      toast.success("Rezervasyon Kodu kopyalandı!");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Lütfen dekont dosyanızı yükleyin.");
      return;
    }

    if (!createdReservationId) return;

    setIsUploading(true);

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      const reservationRef = doc(db, "reservations", createdReservationId);
      await updateDoc(reservationRef, {
        status: "pending_approval",
        receiptUrl: base64String
      });

      setFormSuccess(true);
      setShowPaymentStep(false);
      
      setName('');
      setSurname('');
      setPhone('');
      setEmail('');
      setCheckIn(null);
      setCheckOut(null);
      
      toast.success("Ödeme bildiriminiz başarıyla iletildi!");
    } catch (error) {
      console.error("Ödeme bildirimi güncellenirken hata:", error);
      toast.error("Ödeme bildirimi iletilirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <>
      <main className="pt-32 pb-20 bg-light">
        <div className="container-custom">
          {/* Geri Dönüş Linki */}
          <div className="mb-6">
            <Link 
              href="/villalar" 
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Tüm Villalara Dön
            </Link>
          </div>
          
          {/* Başlık ve Konum Bilgisi */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">{villa.ad}</h1>
            <div className="flex flex-wrap items-center gap-4 text-tertiary">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-1" />
                {villa.konum}
                {villa.denizeUzaklik && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Denize {villa.denizeUzaklik}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Villa Fotoğrafları */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 relative rounded-lg overflow-hidden h-[400px] md:h-[500px] cursor-pointer" onClick={() => openGallery(images.indexOf(mainImage) !== -1 ? images.indexOf(mainImage) : 0)}>
              <Image
                src={mainImageError ? fallbackImageUrl : mainImage}
                alt={villa.ad}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                onError={handleMainImageError}
                priority
              />
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                Tüm Fotoğrafları Görüntüle
              </div>
            </div>
            <div className="flex lg:flex-col overflow-x-auto space-x-4 lg:space-x-0 lg:space-y-4 lg:h-[500px] pb-2">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className="relative rounded-lg overflow-hidden h-[120px] w-[180px] lg:w-full lg:h-[156px] flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setMainImage(image);
                    setMainImageError(false);
                    openGallery(index);
                  }}
                >
                  <Image
                    src={thumbnailErrors[index] ? fallbackImageUrl : image}
                    alt={`${villa.ad} - ${index + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-300 ${mainImage === image ? 'opacity-100 ring-2 ring-primary' : 'opacity-80 hover:opacity-100'}`}
                    sizes="(max-width: 768px) 180px, (max-width: 1200px) 33vw, 25vw"
                    onError={() => handleThumbnailError(index)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Villa Detayları ve Rezervasyon Bölümü */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Villa Detayları */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary mb-4">Villa Hakkında</h2>
                <p className="text-tertiary mb-6">{villa.aciklama}</p>
                
                {villa.belgeNo && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 border-2 border-slate-300/80 rounded-3xl p-6 md:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 border border-slate-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)] shadow-slate-400 flex items-center justify-center">
                      <div className="w-1.5 h-[1px] bg-slate-500 rotate-45"></div>
                    </div>
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 border border-slate-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)] shadow-slate-400 flex items-center justify-center">
                      <div className="w-1.5 h-[1px] bg-slate-500 -rotate-45"></div>
                    </div>
                    <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 border border-slate-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)] shadow-slate-400 flex items-center justify-center">
                      <div className="w-1.5 h-[1px] bg-slate-500 -rotate-45"></div>
                    </div>
                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 border border-slate-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)] shadow-slate-400 flex items-center justify-center">
                      <div className="w-1.5 h-[1px] bg-slate-500 rotate-45"></div>
                    </div>

                    <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
                      <Image
                        src="/images/ministry-logo.svg"
                        alt="T.C. Kültür ve Turizm Bakanlığı"
                        width={90}
                        height={90}
                        className="object-contain"
                        priority
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="text-[11px] font-extrabold tracking-widest text-[#C21A1A] uppercase">
                        T.C. KÜLTÜR VE TURİZM BAKANLIĞI
                      </div>
                      <h3 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight mt-1 uppercase">
                        TURİZM AMAÇLI KONUT
                      </h3>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        İZİN BELGESİ
                      </div>
                      <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mt-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Belge No:
                        </span>
                        <span className="text-sm font-extrabold text-[#C21A1A] font-mono bg-white border-2 border-slate-300 px-3.5 py-1 rounded-xl shadow-md tracking-wider">
                          {(villa as any)?.licenseNo || villa?.belgeNo || '48-13475'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-3 italic">
                        Bu konut 7464 sayılı Kanun kapsamında Bakanlık denetimine tabidir.
                      </div>
                    </div>
                  </div>
                ) }
                
                {/* Teknik Özellikler Grid */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-6">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3">
                    <HomeIcon className="h-5 w-5 text-amber-500" />
                    Teknik Özellikler
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center">
                        <HomeIcon className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-600 ml-3">Oda Sayısı</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                        {villa?.roomCount || 0} Oda
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center">
                        <svg className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm font-medium text-slate-600 ml-3">Balkon Sayısı</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                        {villa?.balconyCount || 0} Balkon
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center">
                        <svg className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.2 6H16m.5 0a1.5 1.5 0 10-3 0M4 9h16m-2 4h.01M16 17h.01M12 19h.01M8 17h.01M6 13h.01" />
                        </svg>
                        <span className="text-sm font-medium text-slate-600 ml-3">Duş Sayısı</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                        {villa?.showerCount || 0} Duş
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center">
                        <svg className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium text-slate-600 ml-3">Lavabo Sayısı</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                        {villa?.toiletCount || 0} Lavabo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {villa?.ozellikler && villa.ozellikler.length > 0 && (
                <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-secondary mb-4">Özellikler</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 mt-6">
                    {[...new Set(villa.ozellikler)].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 py-1 group">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all text-[11px] font-bold">
                          ✓
                        </div>
                        <span className="text-sm font-medium text-slate-700 tracking-wide capitalize">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Konum ve Ulaşım Bölümü */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                  Konum ve Ulaşım
                </h2>
                {villa?.mapEmbedUrl ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <iframe 
                      src={extractGoogleMapsUrl(villa.mapEmbedUrl) || villa.mapEmbedUrl} 
                      width="100%" 
                      height="450" 
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade" 
                      className="w-full h-[350px] md:h-[450px] rounded-xl shadow-sm"
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4 shadow-inner">
                      <MapPinIcon className="h-10 w-10" />
                    </div>
                    <p className="text-slate-500 font-semibold text-center max-w-sm">
                      Bu villaya ait tam konum bilgisi henüz eklenmemiştir.
                    </p>
                  </div>
                )}
                {(villa?.denizeUzaklik || villa?.merkezeUzaklik || villa?.havaalaninaUzaklik) && (
                  <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3">
                      <MapPinIcon className="h-5 w-5 text-amber-500" />
                      Önemli Mesafe Bilgileri
                    </h3>
                    <div className="space-y-1">
                      {villa?.denizeUzaklik && (
                        <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                          <div className="flex items-center">
                            <MapPinIcon className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-600 ml-3">Denize Uzaklık</span>
                          </div>
                          <span className="text-sm font-semibold text-amber-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                            {villa.denizeUzaklik}
                          </span>
                        </div>
                      )}
                      {villa?.merkezeUzaklik && (
                        <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                          <div className="flex items-center">
                            <MapPinIcon className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-600 ml-3">Merkeze Uzaklık</span>
                          </div>
                          <span className="text-sm font-semibold text-amber-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                            {villa.merkezeUzaklik}
                          </span>
                        </div>
                      )}
                      {villa?.havaalaninaUzaklik && (
                        <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                          <div className="flex items-center">
                            <MapPinIcon className="text-amber-500 text-lg h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-600 ml-3">Havalimanına Uzaklık</span>
                          </div>
                          <span className="text-sm font-semibold text-amber-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-mono">
                            {villa.havaalaninaUzaklik}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Uygunluk / Fiyatlar Bölümü */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary">Uygunluk / Fiyatlar</h2>
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-bold text-secondary">{villa?.fiyat} ₺ <span className="text-sm font-normal text-tertiary">/ gece</span></div>
                    {villa?.normalFiyat && villa.normalFiyat > villa.fiyat && (
                      <div className="text-sm line-through text-gray-500">{villa.normalFiyat} ₺</div>
                    )}
                  </div>
                </div>
                

                
                <div className="mb-4">
                  <VillaCalendar 
                    checkIn={checkIn}
                    setCheckIn={setCheckIn}
                    checkOut={checkOut}
                    setCheckOut={setCheckOut}
                    onPricesUpdate={handlePricesUpdate}
                    doluTarihler={villa?.doluTarihler || []}
                    fiyatlar={villa?.fiyatlar}
                    specialDailyPrices={villa?.specialDailyPrices}
                    basePrice={villa?.fiyat || 0}
                    onValidationError={setCalendarError}
                  />
                </div>
              </div>
            </div>
            
            {/* Rezervasyon Kartı */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6 sticky top-24">
                {formSuccess ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4 shadow-sm border border-green-100">
                      <CheckIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ödeme Bildirimi Alındı</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Rezervasyon talebiniz ve ödeme dekontunuz başarıyla sistemimize ulaşmıştır. Tesis sahibinin onayından sonra onay belgeniz e-posta adresinize gönderilecektir.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 text-xs text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-400">Rezervasyon Kodu:</span>
                        <span className="font-mono font-bold text-slate-900">{createdReservationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-400">Durum:</span>
                        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">Onay Bekliyor</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFormSuccess(false);
                        setCreatedReservationId(null);
                        setSelectedFile(null);
                      }}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                    >
                      Yeni Rezervasyon Yap
                    </button>
                  </div>
                ) : showPaymentStep ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Ödeme Adımı</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Rezervasyonunuzun kesinleşmesi için lütfen toplam tutarı aşağıdaki resmi IBAN hesabına transfer ediniz ve dekontunuzu yükleyiniz.
                      </p>
                    </div>

                    {/* Açıklama Kodu */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider font-extrabold text-amber-800">Açıklama Kodu</span>
                        <span className="block font-mono text-xs font-bold text-slate-950 mt-0.5 select-all truncate">
                          {createdReservationId}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleCopyCode}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                      >
                        Kopyala
                      </button>
                    </div>

                    {/* Lüks IBAN Kopyalama Kartı */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative space-y-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Banka Adı</span>
                        <span className="block font-bold text-slate-800 text-sm">Ziraat Bankası</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Alıcı Adı</span>
                        <span className="block font-semibold text-slate-800 text-sm">Eğleniyoruz Villam Da Turizm Ltd. Şti.</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">IBAN</span>
                          <span className="block font-mono text-[10px] font-bold text-slate-900 mt-1 select-all truncate">
                            TR91 0001 2009 3847 5630 1928 47
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleCopyIban}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>

                    {/* Toplam Tutar Bilgisi */}
                    <div className="flex justify-between items-center px-2">
                      <span className="text-sm font-semibold text-slate-500">Transfer Edilecek Tutar</span>
                      <span className="text-lg font-bold text-primary">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                    </div>

                    {/* Sürükle-Bırak Dekont Yükleme Alanı */}
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-600">Dekont Yükle</span>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          isDragActive 
                            ? 'border-primary bg-primary/5' 
                            : selectedFile 
                            ? 'border-green-500 bg-green-50/10' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block">
                          {selectedFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3 border border-green-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                              <span className="text-sm font-bold text-green-700 block">Dekont Başarıyla Seçildi</span>
                              <span className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{selectedFile.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                              </svg>
                              <span className="text-sm font-semibold text-slate-700">Dosya Sürükleyin veya Seçin</span>
                              <span className="text-xs text-slate-400 mt-1">PDF, PNG, JPG formatlarında</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Gönderim Butonu */}
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={isUploading || !selectedFile}
                      className={`w-full py-4 rounded-xl font-bold text-white transition-all text-center flex items-center justify-center gap-2 ${
                        isUploading || !selectedFile 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : 'bg-slate-900 hover:bg-amber-600'
                      }`}
                    >
                      {isUploading ? 'Yükleniyor...' : 'Ödemeyi Tamamladım ve Bildir'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-secondary mb-3">Rezervasyon</h3>
                      
                      {checkIn && checkOut ? (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Giriş:</span> {checkIn && checkIn.toLocaleDateString('tr-TR')}
                            <br />
                            <span className="font-semibold">Çıkış:</span> {checkOut && checkOut.toLocaleDateString('tr-TR')}
                            <br />
                            <span className="font-semibold">Toplam:</span> {days} gece
                          </p>
                        </div>
                      ) : (
                        <p className="text-tertiary mb-4 text-sm">Rezervasyon yapmak için lütfen tarihleri seçin.</p>
                      )}
                    </div>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">Ad</label>
                        <input 
                          type="text" 
                          id="name" 
                          className="w-full py-2 px-4 block shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md text-secondary"
                          placeholder="Adınız"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="surname" className="block text-sm font-medium text-secondary mb-1">Soyad</label>
                        <input 
                          type="text" 
                          id="surname" 
                          className="w-full py-2 px-4 block shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md text-secondary"
                          placeholder="Soyadınız"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1">Telefon</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          className="w-full py-2 px-4 block shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md text-secondary"
                          placeholder="05XX XXX XX XX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">E-posta</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="w-full py-2 px-4 block shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md text-secondary"
                          placeholder="ornek@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="guests" className="block text-sm font-medium text-secondary mb-1">Misafir Sayısı</label>
                        <div className="relative">
                          <select 
                            id="guests" 
                            className="bg-white pl-4 pr-10 py-2 block w-full shadow-sm focus:ring-primary focus:border-primary border-gray-300 rounded-md text-secondary appearance-none"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                          >
                            {[...Array(villa.kapasite)].map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1} {i === 0 ? 'Misafir' : 'Misafir'}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <UserGroupIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      {days > 0 && !calendarError && (
                        <div className="mt-6 mb-4 p-5 rounded-xl border border-slate-700/30 bg-white/60 backdrop-blur-md shadow-sm">
                          <div className="space-y-3 mb-4">
                            {priceBreakdown && priceBreakdown.length > 0 ? (
                              priceBreakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-600">{item.nights} Gece x {item.pricePerNight.toLocaleString('tr-TR')} ₺ ({item.monthName})</span>
                                  <span className="font-medium text-slate-800">{item.total.toLocaleString('tr-TR')} ₺</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">{days} Gece x {villa.fiyat.toLocaleString('tr-TR')} ₺</span>
                                <span className="font-medium text-slate-800">{(villa.fiyat * days).toLocaleString('tr-TR')} ₺</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Ara Toplam, İndirim ve Toplam Tutar Kırılımı */}
                          <div className="pt-3 border-t border-slate-700/20 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 font-medium">Ara Toplam</span>
                              <span className="font-semibold text-slate-800">{subtotal.toLocaleString('tr-TR')} ₺</span>
                            </div>
                            
                            {appliedCoupon && (
                              <div className="flex justify-between items-center text-sm text-green-700 font-medium bg-green-50/50 px-2 py-1 rounded border border-green-200/50">
                                <span className="flex items-center gap-1">
                                  İndirim (Kupon: {appliedCoupon.code})
                                  <button 
                                    type="button" 
                                    onClick={handleRemoveCoupon}
                                    className="text-red-500 hover:text-red-700 ml-1 p-0.5 rounded-full hover:bg-red-50 transition-colors"
                                    title="Kuponu Kaldır"
                                  >
                                    <XMarkIcon className="h-3.5 w-3.5" />
                                  </button>
                                </span>
                                <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-dashed border-slate-700/10 flex justify-between items-center">
                              <span className="font-bold text-slate-800">Toplam Tutar</span>
                              <span className="font-bold text-primary">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* İndirim Kodu Giriş Alanı */}
                      {days > 0 && !calendarError && (
                        <div className="mb-6 p-4 rounded-xl border border-slate-700/30 bg-white/40 backdrop-blur-md shadow-sm space-y-3">
                          <label htmlFor="coupon" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">İndirim Kodu</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              id="coupon" 
                              placeholder="KOD20" 
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 py-1.5 px-3 block text-sm border border-gray-300 rounded-md text-secondary uppercase placeholder:normal-case shadow-sm focus:ring-primary focus:border-primary"
                            />
                            <button 
                              type="button"
                              onClick={handleApplyCoupon}
                              className="py-1.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-semibold shadow transition-colors"
                            >
                              Uygula
                            </button>
                          </div>
                          
                          {couponMessage && (
                            <p className={`text-xs font-semibold ${couponMessage.isError ? 'text-red-600' : 'text-green-700'}`}>
                              {couponMessage.text}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {calendarError && (
                        <div className="mt-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800 font-medium">
                            {calendarError}
                          </p>
                        </div>
                      )}

                      <button 
                        type="button"
                        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${checkIn && checkOut && !calendarError && name && surname && phone && email ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!checkIn || !checkOut || !!calendarError || !name || !surname || !phone || !email || isSubmitting}
                        onClick={handleReservation}
                      >
                        {isSubmitting ? 'İşleniyor...' : 'Rezervasyon Yap'}
                      </button>
                      
                      {formError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800 font-medium">
                            {formError}
                          </p>
                        </div>
                      )}
                    </form>
                  </>
                )}
                

              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Tam Ekran Galeri Modu */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col touch-pan-y">
          {/* Galeri Başlık ve Kapatma Butonu */}
          <div className="flex justify-between items-center px-4 py-3 bg-black/80 backdrop-blur-sm">
            <h3 className="text-white font-medium">
              {villa.ad} - {currentImageIndex + 1}/{images.length}
            </h3>
            <button 
              onClick={closeGallery}
              className="text-white p-2 rounded-full hover:bg-white/20"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Galeri Ana İçerik */}
          <div className="flex-1 relative">
            {/* Ana Resim */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={thumbnailErrors[currentImageIndex] ? fallbackImageUrl : images[currentImageIndex]}
                alt={`${villa.ad} - ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                onError={() => handleThumbnailError(currentImageIndex)}
              />
            </div>
            
            {/* Önceki/Sonraki Navigasyon Butonları */}
            <button 
              onClick={goToPrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            
            <button 
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Küçük Resimler */}
          <div className="bg-black/80 backdrop-blur-sm p-2">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`relative h-[60px] w-[90px] flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-opacity ${index === currentImageIndex ? 'ring-2 ring-primary' : 'opacity-70'}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={thumbnailErrors[index] ? fallbackImageUrl : image}
                    alt={`${villa.ad} - ${index + 1} küçük resim`}
                    fill
                    className="object-cover"
                    sizes="90px"
                    onError={() => handleThumbnailError(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
} 