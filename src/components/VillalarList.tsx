'use client';

import { useState, useEffect } from 'react';
import { getVillalar, Villa } from '@/firebase/villaService';
import VillaCard from './VillaCard';
import { useSearchParams } from 'next/navigation';
import { 
  MapPinIcon, 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getLocations } from '@/firebase/locationService';

export default function VillalarList() {
  const searchParams = useSearchParams();
  
  const [villalar, setVillalar] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredVillalar, setFilteredVillalar] = useState<Villa[]>([]);
  
  // URL'den gelen parametreleri al
  const urlKonum = searchParams.get('konum');
  const urlGiris = searchParams.get('giris');
  const urlCikis = searchParams.get('cikis');
  const urlMisafir = searchParams.get('misafir');
  
  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(urlKonum || '');
  const [checkIn, setCheckIn] = useState(urlGiris || '');
  const [checkOut, setCheckOut] = useState(urlCikis || '');
  const [guests, setGuests] = useState(urlMisafir || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Gelişmiş Filtre State'leri
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterPool, setFilterPool] = useState(false);
  const [filterBarbecue, setFilterBarbecue] = useState(false);
  const [filterPrivate, setFilterPrivate] = useState(false);
  const [minBedrooms, setMinBedrooms] = useState('');
  const [minBathrooms, setMinBathrooms] = useState('');
  
  // Konum listesi
  const [locationOptions, setLocationOptions] = useState<{id: string, name: string}[]>([]);
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    // Firebase'den konumları async olarak çek
    const fetchAll = async () => {
      try {
        const locs = await getLocations();
        setLocations(locs);
        setLocationOptions(locs.map(loc => ({ id: loc.id, name: loc.name })));
      } catch (err) {
        console.warn('Konumlar yüklenemedi:', err);
      }
    };

    const fetchVillalar = async () => {
      try {
        setLoading(true);
        const data = await getVillalar();
        setVillalar(data);
        setFilteredVillalar(data);
        setLoading(false);
      } catch (err) {
        console.error("Villalar yüklenirken hata oluştu:", err);
        setError("Villalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    };

    fetchAll();
    fetchVillalar();
  }, []);
  
  // Arama ve filtreleme
  useEffect(() => {
    if (villalar.length === 0) return;
    
    let filtered = [...villalar];
    
    // İsim arama
    if (searchTerm) {
      filtered = filtered.filter(villa => 
        villa.ad.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Konum filtresi
    if (selectedLocation) {
      // Seçilen konum ID'sini bul ve uygun villaları filtrele
      const selectedLocationName = locations.find(loc => loc.id === selectedLocation)?.name;
      if (selectedLocationName) {
        filtered = filtered.filter(villa => 
          villa.konum.toLowerCase().includes(selectedLocationName.toLowerCase())
        );
      }
    }
    
    // Misafir sayısı filtresi
    if (guests) {
      const guestCount = parseInt(guests);
      filtered = filtered.filter(villa => villa.kapasite >= guestCount);
    }
    
    // Giriş-çıkış tarihi filtreleme işlemleri
    if (checkIn && checkOut) {
      const giris = new Date(checkIn);
      const cikis = new Date(checkOut);
      
      filtered = filtered.filter(villa => {
        if (!villa.doluTarihler || villa.doluTarihler.length === 0) return true;
        
        const hasConflict = villa.doluTarihler.some(doluTarih => {
          const doluDate = new Date(doluTarih);
          return doluDate >= giris && doluDate <= cikis;
        });
        
        return !hasConflict;
      });
    }
    
    // Gelişmiş Fiyat Filtresi
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(villa => villa.fiyat >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(villa => villa.fiyat <= max);
    }
    
    // Gelişmiş Özellik Filtreleri
    if (filterPool) {
      filtered = filtered.filter(villa => villa.havuzVar);
    }
    if (filterBarbecue) {
      filtered = filtered.filter(villa => villa.barbekuVar);
    }
    if (filterPrivate) {
      filtered = filtered.filter(villa => villa.mustakilMi);
    }
    
    // Gelişmiş Oda ve Banyo Filtreleri
    if (minBedrooms) {
      const beds = parseInt(minBedrooms);
      filtered = filtered.filter(villa => (villa.yatak || 1) >= beds);
    }
    if (minBathrooms) {
      const baths = parseInt(minBathrooms);
      filtered = filtered.filter(villa => (villa.banyo || 1) >= baths);
    }
    
    setFilteredVillalar(filtered);
  }, [
    searchTerm, 
    selectedLocation, 
    checkIn, 
    checkOut, 
    guests, 
    minPrice, 
    maxPrice, 
    filterPool, 
    filterBarbecue, 
    filterPrivate, 
    minBedrooms, 
    minBathrooms, 
    villalar, 
    locations
  ]);
  
  return (
    <div className="text-slate-200">
      {/* Filtreleme Bölümü */}
      <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
              </div>
              <input
                type="text"
                className="bg-[#0f172a]/50 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full pl-12 p-3.5 transition-all"
                placeholder="Villa adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
              </div>
              <select
                className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full pl-12 p-3.5 transition-all appearance-none"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="" className="bg-[#0f172a] text-white">Tüm Konumlar</option>
                {locationOptions.map(location => (
                  <option key={location.id} value={location.id} className="bg-[#0f172a] text-white">{location.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            className={`flex items-center px-6 py-3.5 rounded-xl text-sm font-medium transition-all shadow-lg ${showFilters ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent hover:bg-accent/90 text-white shadow-accent/20'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filtreler
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 gap-8 animate-fadeIn">
            {/* 1. Satır: Tarih ve Misafir */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giriş Tarihi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    type="date"
                    className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full pl-12 p-3.5 transition-all"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Çıkış Tarihi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    type="date"
                    className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full pl-12 p-3.5 transition-all"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Misafir Sayısı</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                  </div>
                  <select
                    className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full pl-12 p-3.5 transition-all appearance-none"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="" className="bg-[#0f172a] text-white">Tümü</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num.toString()} className="bg-[#0f172a] text-white">{num} Misafir</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Satır: Fiyat ve Oda/Banyo Sayısı */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Min. Gece Fiyatı (₺)</label>
                <input
                  type="number"
                  placeholder="örn: 3000"
                  className="bg-[#0f172a]/50 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full p-3.5 transition-all"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max. Gece Fiyatı (₺)</label>
                <input
                  type="number"
                  placeholder="örn: 15000"
                  className="bg-[#0f172a]/50 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full p-3.5 transition-all"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Min. Yatak Odası</label>
                  <select
                    className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full p-3.5 transition-all appearance-none"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value)}
                  >
                    <option value="" className="bg-[#0f172a] text-white">Seçiniz</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num.toString()} className="bg-[#0f172a] text-white">{num}+ Odalı</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Min. Banyo Sayısı</label>
                  <select
                    className="bg-[#0f172a]/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-accent focus:border-accent block w-full p-3.5 transition-all appearance-none"
                    value={minBathrooms}
                    onChange={(e) => setMinBathrooms(e.target.value)}
                  >
                    <option value="" className="bg-[#0f172a] text-white">Seçiniz</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num.toString()} className="bg-[#0f172a] text-white">{num}+ Banyolu</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Satır: Özel Nitelikler (Checkboxes) */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Villa Tipi ve Öne Çıkan Özellikler</label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex items-center gap-2 px-5 py-2.5 rounded-full border cursor-pointer select-none transition-all shadow-sm ${filterPool ? 'bg-accent/20 border-accent text-white' : 'bg-[#0f172a]/50 border-white/10 text-slate-300 hover:border-white/30'}`}>
                  <input
                    type="checkbox"
                    checked={filterPool}
                    onChange={(e) => setFilterPool(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium">Özel Havuzlu</span>
                </label>

                <label className={`flex items-center gap-2 px-5 py-2.5 rounded-full border cursor-pointer select-none transition-all shadow-sm ${filterBarbecue ? 'bg-accent/20 border-accent text-white' : 'bg-[#0f172a]/50 border-white/10 text-slate-300 hover:border-white/30'}`}>
                  <input
                    type="checkbox"
                    checked={filterBarbecue}
                    onChange={(e) => setFilterBarbecue(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium">Barbekülü</span>
                </label>

                <label className={`flex items-center gap-2 px-5 py-2.5 rounded-full border cursor-pointer select-none transition-all shadow-sm ${filterPrivate ? 'bg-accent/20 border-accent text-white' : 'bg-[#0f172a]/50 border-white/10 text-slate-300 hover:border-white/30'}`}>
                  <input
                    type="checkbox"
                    checked={filterPrivate}
                    onChange={(e) => setFilterPrivate(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium">Müstakil Villa</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sonuçlar */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl relative shadow-lg" role="alert">
          <strong className="font-bold mr-2">Hata!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : filteredVillalar.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <p className="text-slate-300 mb-4 text-lg font-light">Aramanıza uygun lüks villa bulunamadı.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedLocation('');
              setCheckIn('');
              setCheckOut('');
              setGuests('');
              setMinPrice('');
              setMaxPrice('');
              setFilterPool(false);
              setFilterBarbecue(false);
              setFilterPrivate(false);
              setMinBedrooms('');
              setMinBathrooms('');
            }}
            className="text-accent hover:text-white transition-colors font-medium border-b border-accent/30 hover:border-white pb-1"
          >
            Tüm filtreleri temizle
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-medium text-white tracking-wide">
              Arama Sonuçları
            </h2>
            <p className="text-slate-400 bg-white/5 px-4 py-2 rounded-full text-sm border border-white/10">
              <span className="text-white font-bold">{filteredVillalar.length}</span> lüks villa bulundu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVillalar.map(villa => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 