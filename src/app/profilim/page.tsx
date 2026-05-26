'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { getUserReservations, associateLocalReservationsWithUser, Reservation } from '@/firebase/reservationService';
import { getUserFavorites, Favorite, removeFavorite } from '@/firebase/favoriteService';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { HomeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Kampanyalar from '@/components/Kampanyalar';

type Tab = 'rezervasyonlar' | 'favoriler' | 'kampanyalar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, firebaseUser, logout, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('rezervasyonlar');

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Form verilerini kullanıcıdan doldur
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      if (user.id) {
        associateLocalReservationsWithUser(user.id)
          .then(() => {
            loadUserReservations(user.id);
            loadUserFavorites(user.id);
          })
          .catch(err => console.error('Rezervasyonlar ilişkilendirilirken hata:', err));
      }
    }
  }, [user]);

  const loadUserReservations = async (userId: string) => {
    setReservationsLoading(true);
    try {
      const data = await getUserReservations(userId);
      setReservations(data);
    } catch (err) {
      console.error('Rezervasyonlar yüklenirken hata:', err);
    } finally {
      setReservationsLoading(false);
    }
  };

  const loadUserFavorites = async (userId: string) => {
    setFavoritesLoading(true);
    try {
      const data = await getUserFavorites(userId);
      setFavorites(data);
    } catch (err) {
      console.error('Favoriler yüklenirken hata:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/giris');
  }, [isLoading, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseUser) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { fullName: formData.fullName, phone: formData.phone, updatedAt: new Date() });
      if (formData.fullName !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: formData.fullName });
      }
      setSuccess('Profil bilgileriniz başarıyla güncellendi.');
      setEditing(false);
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };

  const getReservationStatusText = (status: string) => {
    switch (status) {
      case 'beklemede': return { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
      case 'onaylandi': return { text: 'Onaylandı', color: 'bg-green-100 text-green-800' };
      case 'iptal': return { text: 'İptal Edildi', color: 'bg-red-100 text-red-800' };
      default: return { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'rezervasyonlar', label: 'Rezervasyonlarım' },
    { key: 'favoriler', label: 'Favorilerim' },
    { key: 'kampanyalar', label: 'Kampanyalar' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Hesabım</h1>
        <p className="text-tertiary mt-2">Profil bilgilerinizi görüntüleyebilir ve güncelleyebilirsiniz.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* ── Sidebar ── */}
          <div className="md:w-1/3 bg-gradient-to-br from-primary to-blue-700 text-white p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-6 overflow-hidden shadow-inner">
                {user?.fullName ? (
                  <span className="text-white text-5xl font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
                ) : (
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">{user?.fullName || 'Kullanıcı'}</h2>
              <p className="text-blue-100 text-sm mb-6">{user?.email}</p>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="mb-3 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary bg-white hover:bg-blue-50 focus:outline-none transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Profili Düzenle
                </button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-5 py-2.5 border border-white/30 rounded-lg text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış Yap
              </button>
            </div>

            <div className="mt-10 border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold mb-4">Hesap Bilgileri</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center opacity-90">
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user?.email}
                </div>
                <div className="flex items-center opacity-90">
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {user?.phone || 'Telefon numarası eklenmemiş'}
                </div>
                <div className="flex items-center opacity-90">
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {user?.createdAt ? (
                    <span>Üyelik: {user.createdAt.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  ) : 'Üyelik tarihi bilinmiyor'}
                </div>
              </div>
            </div>
          </div>

          {/* ── Ana İçerik ── */}
          <div className="md:w-2/3 p-8">
            {!editing ? (
              <>
                {/* Sekme Navigasyonu */}
                <div className="flex border-b border-slate-100 mb-8 gap-1">
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                        activeTab === tab.key
                          ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Rezervasyonlar Sekmesi ── */}
                {activeTab === 'rezervasyonlar' && (
                  <div>
                    {reservationsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-b-2"></div>
                      </div>
                    ) : reservations.length > 0 ? (
                      <div className="space-y-5">
                        {reservations.map((reservation, index) => (
                          <div key={index} className="bg-light rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-lg text-secondary">{reservation.villaAd}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getReservationStatusText(reservation.durum).color}`}>
                                {getReservationStatusText(reservation.durum).text}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-tertiary">Giriş – Çıkış Tarihi</p>
                                <p className="font-medium text-secondary">
                                  {formatDate(reservation.girisTarihi)} – {formatDate(reservation.cikisTarihi)}
                                </p>
                              </div>
                              <div>
                                <p className="text-tertiary">Misafir Sayısı</p>
                                <p className="font-medium text-secondary">{reservation.kisiSayisi} Kişi</p>
                              </div>
                              <div>
                                <p className="text-tertiary">Toplam Ücret</p>
                                <p className="font-medium text-secondary">{reservation.toplamFiyat.toLocaleString('tr-TR')} ₺</p>
                              </div>
                              <div>
                                <p className="text-tertiary">Oluşturma Tarihi</p>
                                <p className="font-medium text-secondary">{formatDate(reservation.createdAt)}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                              <Link href={`/villalar/${reservation.villaId}`} className="text-primary hover:text-primary/80 text-sm font-medium">
                                Villa Detaylarını Görüntüle
                              </Link>
                              {reservation.durum === 'beklemede' && (
                                <span className="text-xs text-amber-600 font-medium">Villa sahibinin onayı bekleniyor</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-light rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-tertiary">Henüz hiç rezervasyonunuz bulunmuyor.</p>
                        <Link href="/villalar" className="mt-4 inline-flex items-center text-primary hover:text-primary/80">
                          Villaları Keşfet
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Favoriler Sekmesi ── */}
                {activeTab === 'favoriler' && (
                  <div>
                    {favoritesLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-b-2"></div>
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {favorites.map((favorite) => (
                          <div key={favorite.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] transition-all duration-300 border border-slate-100">
                            <Link href={`/villalar/${favorite.villaId}`}>
                              <div className="relative h-44 w-full">
                                {favorite.villaResim ? (
                                  <Image src={favorite.villaResim} alt={favorite.villaAd || 'Villa'} fill className="object-cover" />
                                ) : (
                                  <div className="bg-slate-100 h-full w-full flex items-center justify-center">
                                    <HomeIcon className="h-12 w-12 text-slate-300" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-1.5">
                                <Link href={`/villalar/${favorite.villaId}`}>
                                  <h3 className="text-base font-bold text-slate-900 hover:text-primary transition-colors">
                                    {favorite.villaAd || 'İsimsiz Villa'}
                                  </h3>
                                </Link>
                                <button
                                  onClick={async () => {
                                    if (user) {
                                      try {
                                        await removeFavorite(user.id, favorite.villaId);
                                        setFavorites(favorites.filter(f => f.id !== favorite.id));
                                        toast.success('Villa favorilerinizden çıkarıldı');
                                      } catch (error) {
                                        console.error('Favori kaldırılırken hata:', error);
                                        toast.error('Favori kaldırılırken bir hata oluştu');
                                      }
                                    }
                                  }}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                                </button>
                              </div>
                              {favorite.villaKonum && (
                                <div className="flex items-center text-slate-500 text-xs mb-2">
                                  <MapPinIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                  <span>{favorite.villaKonum}</span>
                                </div>
                              )}
                              {favorite.villaFiyat && (
                                <div className="flex items-baseline gap-1 mt-2">
                                  <span className="font-extrabold text-slate-950 text-base">{formatPrice(favorite.villaFiyat)} ₺</span>
                                  <span className="text-xs text-slate-400">/ gece</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-light rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <p className="mt-4 text-tertiary">Henüz favori villa eklemediniz.</p>
                        <Link href="/villalar" className="mt-4 inline-flex items-center text-primary hover:text-primary/80">
                          Villaları Keşfet
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Kampanyalar Sekmesi ── */}
                {activeTab === 'kampanyalar' && (
                  <div>
                    <Kampanyalar baslikGoster={false} kopyalamaAktif />
                  </div>
                )}
              </>
            ) : (
              /* Profil Düzenleme Formu */
              <div className="mb-6">
                <div className="flex items-center mb-5">
                  <div className="w-1 h-8 bg-primary rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold text-primary">Profili Düzenle</h2>
                </div>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-lg text-sm border-l-4 border-red-500">{error}</div>
                )}
                {success && (
                  <div className="mb-5 p-4 bg-green-50 text-green-700 rounded-lg text-sm border-l-4 border-green-500">{success}</div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-secondary mb-2">Ad Soyad</label>
                    <input
                      type="text" id="fullName" name="fullName"
                      value={formData.fullName} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">E-posta Adresi</label>
                    <input
                      type="email" id="email" name="email"
                      value={formData.email}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-sm text-tertiary">E-posta adresiniz değiştirilemez.</p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-2">Telefon Numarası</label>
                    <input
                      type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                      placeholder="5xx xxx xxxx"
                    />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button" onClick={() => setEditing(false)}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Kaydediliyor...
                        </>
                      ) : 'Değişiklikleri Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}