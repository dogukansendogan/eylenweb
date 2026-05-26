'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getLocations } from '@/firebase/locationService';

const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const TURKISH_WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const Hero = () => {
  const router = useRouter();

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [locations, setLocations] = useState<{ id: string; name: string; description: string; image: string; villaCount: number }[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    getLocations()
      .then(locs => setLocations(locs))
      .catch(err => console.warn(err));
  }, []);

  const getGuestsLabel = () => {
    let label = `${adults} Yetişkin`;
    if (children > 0) {
      label += `, ${children} Çocuk`;
    }
    return label;
  };

  const handleDateClick = (day: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (day > checkIn) {
        setCheckOut(day);
        setCalendarOpen(false);
      } else {
        setCheckIn(day);
      }
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const startingDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const toggleLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocationOpen(!locationOpen);
    setCalendarOpen(false);
    setGuestsOpen(false);
  };

  const toggleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarOpen(!calendarOpen);
    setLocationOpen(false);
    setGuestsOpen(false);
  };

  const toggleGuests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuestsOpen(!guestsOpen);
    setLocationOpen(false);
    setCalendarOpen(false);
  };

  useEffect(() => {
    const closeAll = () => {
      setLocationOpen(false);
      setCalendarOpen(false);
      setGuestsOpen(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location) {
      params.append('konum', location);
    }

    if (checkIn) {
      const yyyy = checkIn.getFullYear();
      const mm = String(checkIn.getMonth() + 1).padStart(2, '0');
      const dd = String(checkIn.getDate()).padStart(2, '0');
      params.append('giris', `${yyyy}-${mm}-${dd}`);
    }

    if (checkOut) {
      const yyyy = checkOut.getFullYear();
      const mm = String(checkOut.getMonth() + 1).padStart(2, '0');
      const dd = String(checkOut.getDate()).padStart(2, '0');
      params.append('cikis', `${yyyy}-${mm}-${dd}`);
    }

    const totalGuests = adults + children;
    params.append('misafir', String(totalGuests));

    router.push(`/villalar?${params.toString()}`);
  };

  return (
    <div className="relative w-full min-h-[90vh] md:h-[85vh] flex items-center justify-center py-20 md:py-0 overflow-visible bg-slate-950 z-20">
      <Image
        src="/images/hero-bg.png"
        alt="Lüks Villa Kiralama"
        fill
        priority
        className="object-cover object-center z-0 pointer-events-none"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-slate-950/90 z-10 pointer-events-none" />

      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-4 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] font-bold leading-tight mb-6 tracking-tight">
          Rüya Gibi Bir Tatil İçin <br />
          <span className="text-accent">Lüks Villalar</span>
        </h1>
        <p className="text-sm sm:text-base md:text-xl max-w-3xl mx-auto mb-10 text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] font-medium leading-relaxed">
          Eşsiz manzaralar ve konforlu konaklama seçenekleriyle özel bir tatil deneyimi yaşayın.
          Hayalinizdeki villayı keşfedin.
        </p>

        <div className="w-full max-w-5xl bg-slate-950/50 md:bg-white/10 backdrop-blur-xl border border-white/10 md:border-white/20 rounded-3xl md:rounded-full p-2.5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 relative z-30 transition-all">
          <div className="relative flex-1 md:flex-initial md:w-1/4">
            <div
              onClick={toggleLocation}
              className="px-6 py-3 rounded-2xl md:rounded-full hover:bg-white/10 cursor-pointer transition-all text-left group"
            >
              <span className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-1">Konum</span>
              <div className="flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="block text-sm font-bold truncate">
                  {locationLabel || "Bölge Seçin"}
                </span>
              </div>
            </div>

            {locationOpen && (
              <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn text-slate-800">
                <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Popüler Bölgeler</div>
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(loc.id);
                      setLocationLabel(loc.name);
                      setLocationOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-primary transition-colors text-left group/item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400 group-hover/item:text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-sm">{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-white/20" />

          <div className="relative flex-1 md:flex-initial md:w-1/5">
            <div
              onClick={toggleCalendar}
              className="px-6 py-3 rounded-2xl md:rounded-full hover:bg-white/10 cursor-pointer transition-all text-left group"
            >
              <span className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-1">Giriş Tarihi</span>
              <div className="flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="block text-sm font-bold">
                  {checkIn ? checkIn.toLocaleDateString('tr-TR') : "Giriş Seçin"}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-white/20" />

          <div className="relative flex-1 md:flex-initial md:w-1/5">
            <div
              onClick={toggleCalendar}
              className="px-6 py-3 rounded-2xl md:rounded-full hover:bg-white/10 cursor-pointer transition-all text-left group"
            >
              <span className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-1">Çıkış Tarihi</span>
              <div className="flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="block text-sm font-bold">
                  {checkOut ? checkOut.toLocaleDateString('tr-TR') : "Çıkış Seçin"}
                </span>
              </div>
            </div>

            {calendarOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-50 animate-fadeIn text-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prev = new Date(currentMonthDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentMonthDate(prev);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="font-bold text-sm">
                    {TURKISH_MONTHS[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = new Date(currentMonthDate);
                      next.setMonth(next.getMonth() + 1);
                      setCurrentMonthDate(next);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                  {TURKISH_WEEKDAYS.map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonthDate).map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isCheckIn = checkIn && day.toDateString() === checkIn.toDateString();
                    const isCheckOut = checkOut && day.toDateString() === checkOut.toDateString();
                    const isInRange = checkIn && checkOut && day > checkIn && day < checkOut;

                    let dayClasses = "h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ";

                    if (isPast) {
                      dayClasses += "text-slate-300 cursor-not-allowed";
                    } else if (isCheckIn || isCheckOut) {
                      dayClasses += "bg-primary text-white shadow-md shadow-primary/20 scale-110 cursor-pointer";
                    } else if (isInRange) {
                      dayClasses += "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20";
                    } else {
                      dayClasses += "text-slate-700 hover:bg-slate-100 cursor-pointer";
                    }

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={isPast}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(day);
                        }}
                        className={dayClasses}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                {checkIn && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Giriş:</span>{" "}
                      <span className="font-bold text-slate-700">{checkIn.toLocaleDateString('tr-TR')}</span>
                    </div>
                    {checkOut && (
                      <div>
                        <span className="text-slate-400">Çıkış:</span>{" "}
                        <span className="font-bold text-slate-700">{checkOut.toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckIn(null);
                        setCheckOut(null);
                      }}
                      className="text-primary font-bold hover:underline"
                    >
                      Temizle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-white/20" />

          <div className="relative flex-1 md:flex-initial md:w-1/4">
            <div
              onClick={toggleGuests}
              className="px-6 py-3 rounded-2xl md:rounded-full hover:bg-white/10 cursor-pointer transition-all text-left group"
            >
              <span className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-1">Misafir Sayısı</span>
              <div className="flex items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="block text-sm font-bold truncate">
                  {getGuestsLabel()}
                </span>
              </div>
            </div>

            {guestsOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-50 animate-fadeIn text-slate-800">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <div className="font-bold text-sm text-slate-800">Yetişkinler</div>
                    <div className="text-xs text-slate-400">Yaş 13 ve üzeri</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      disabled={adults <= 1}
                      onClick={(e) => { e.stopPropagation(); setAdults(adults - 1); }}
                      className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors ${adults <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{adults}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAdults(adults + 1); }}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="font-bold text-sm text-slate-800">Çocuklar</div>
                    <div className="text-xs text-slate-400">Yaş 2 - 12</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      disabled={children <= 0}
                      onClick={(e) => { e.stopPropagation(); setChildren(children - 1); }}
                      className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors ${children <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{children}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setChildren(children + 1); }}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setGuestsOpen(false);
                    }}
                    className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/95 shadow-sm"
                  >
                    Tamam
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-1.5 md:p-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleSearch(); }}
              className="w-full md:w-auto bg-gradient-to-r from-primary to-coral text-white font-bold px-8 py-4 rounded-2xl md:rounded-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary/30 hover:scale-[1.04] transition-all duration-300 whitespace-nowrap active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Villa Ara</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;