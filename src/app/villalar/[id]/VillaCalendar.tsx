'use client';

import { useState, useEffect, useMemo } from 'react';
import { tr } from 'date-fns/locale';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

const CalendarStatus = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked',
  SELECTED: 'selected',
  CHECKIN_CHECKOUT: 'checkin-checkout',
  UNPRICED: 'unpriced'
};

interface VillaCalendarProps {
  checkIn: Date | null;
  setCheckIn: (date: Date | null) => void;
  checkOut: Date | null;
  setCheckOut: (date: Date | null) => void;
  onPricesUpdate: (prices: Array<{date: string, price: number, monthName: string}>) => void;
  doluTarihler: string[];
  fiyatlar?: Record<string, number>;
  specialDailyPrices?: Record<string, number>;
  basePrice: number;
  onValidationError?: (error: string | null) => void;
}

export default function VillaCalendar({ 
  checkIn, 
  setCheckIn, 
  checkOut, 
  setCheckOut, 
  onPricesUpdate,
  doluTarihler = [],
  fiyatlar = {},
  specialDailyPrices = {},
  basePrice,
  onValidationError
}: VillaCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(addMonths(new Date(), 1));
  const [selectedDatesInfo, setSelectedDatesInfo] = useState<Array<{date: string, price: number, monthName: string}>>([]);
  
  const trMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  
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

  const getPriceForMonth = (monthName: string) => {
    if (!fiyatlar) return basePrice;
    const normalizedTarget = normalizeMonth(monthName);
    const matchedKey = Object.keys(fiyatlar).find(k => normalizeMonth(k) === normalizedTarget);
    return matchedKey ? fiyatlar[matchedKey] : basePrice;
  };

  const bookedDates = useMemo(() => {
    return doluTarihler.map(dateStr => format(new Date(dateStr), 'yyyy-MM-dd'));
  }, [doluTarihler]);

  const dateStatuses = useMemo(() => {
    const today = new Date();
    const sixMonthsLater = addMonths(today, 6);
    
    const allDates = eachDayOfInterval({ 
      start: today, 
      end: sixMonthsLater 
    });
    
    const statusMap: Record<string, {status: string, price: number}> = {};
    
    allDates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const monthName = trMonths[date.getMonth()];
      
      let price = getPriceForMonth(monthName);
      if (specialDailyPrices && specialDailyPrices[dateStr]) {
        price = specialDailyPrices[dateStr];
      }
      
      const isUnpriced = !price || price <= 0;
      
      statusMap[dateStr] = { 
        status: isUnpriced ? CalendarStatus.UNPRICED : CalendarStatus.AVAILABLE, 
        price: isUnpriced ? 0 : price 
      };
    });
    
    bookedDates.forEach(dateStr => {
      if (statusMap[dateStr]) {
        statusMap[dateStr].status = CalendarStatus.BOOKED;
        statusMap[dateStr].price = 0;
      }
    });
    
    return statusMap;
  }, [bookedDates, fiyatlar, specialDailyPrices, basePrice]);
  
  const { maxPrice, minPrice } = useMemo(() => {
    let max = -Infinity;
    let min = Infinity;
    Object.values(dateStatuses).forEach(d => {
      if (d.price > 0 && d.status !== CalendarStatus.BOOKED) {
        if (d.price > max) max = d.price;
        if (d.price < min) min = d.price;
      }
    });
    return { 
      maxPrice: max === -Infinity ? 0 : max, 
      minPrice: min === Infinity ? 0 : min 
    };
  }, [dateStatuses]);
  
  const selectedPricesTotal = useMemo(() => {
    return selectedDatesInfo.reduce((total, dateInfo) => total + dateInfo.price, 0);
  }, [selectedDatesInfo]);

  useEffect(() => {
    if (onPricesUpdate) {
      onPricesUpdate(selectedDatesInfo);
    }
  }, [selectedPricesTotal, selectedDatesInfo, onPricesUpdate]);

  const isUnavailable = (status: string | undefined) => status === CalendarStatus.BOOKED || status === CalendarStatus.UNPRICED;

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateStatus = dateStatuses[dateStr]?.status;
    const monthName = trMonths[date.getMonth()];
    
    if (!checkIn && isUnavailable(dateStatus)) {
      return;
    }
    
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return;
    }
    
    if (!checkIn) {
      setCheckIn(date);
      setSelectedDatesInfo([{ date: dateStr, price: dateStatuses[dateStr]?.price || getPriceForMonth(monthName), monthName }]);
      if (onValidationError) onValidationError(null);
    } else if (!checkOut) {
      if (date <= checkIn) {
        if (isUnavailable(dateStatus)) return;
        setCheckIn(date);
        setSelectedDatesInfo([{ date: dateStr, price: dateStatuses[dateStr]?.price || getPriceForMonth(monthName), monthName }]);
        if (onValidationError) onValidationError(null);
      } else {
        const start = new Date(checkIn);
        const end = new Date(date);
        let hasBookedDate = false;
        
        let currentDate = new Date(start);
        while (currentDate < end) {
          const currentDateStr = format(currentDate, 'yyyy-MM-dd');
          if (isUnavailable(dateStatuses[currentDateStr]?.status)) {
            hasBookedDate = true;
            break;
          }
          currentDate = addDays(currentDate, 1);
        }
        
        setCheckOut(date);
        
        const datesArray = [];
        let curr = new Date(start);
        while (curr < end) {
          const currStr = format(curr, 'yyyy-MM-dd');
          const mName = trMonths[curr.getMonth()];
          datesArray.push({
            date: currStr,
            price: dateStatuses[currStr]?.price || getPriceForMonth(mName),
            monthName: mName
          });
          curr = addDays(curr, 1);
        }
        
        setSelectedDatesInfo(datesArray);
        
        if (hasBookedDate) {
          if (onValidationError) onValidationError("Seçtiğiniz tarihlerin arasında dolu veya müsait olmayan günler bulunmaktadır.");
        } else {
          if (onValidationError) onValidationError(null);
        }
      }
    } else {
      if (isUnavailable(dateStatus)) return;
      setCheckIn(date);
      setCheckOut(null);
      setSelectedDatesInfo([{ date: dateStr, price: dateStatuses[dateStr]?.price || getPriceForMonth(monthName), monthName }]);
      if (onValidationError) onValidationError(null);
    }
  };

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let status = dateStatuses[dateStr]?.status || CalendarStatus.AVAILABLE;
    
    if (checkIn && isSameDay(date, checkIn)) {
      return checkOut ? CalendarStatus.CHECKIN_CHECKOUT : CalendarStatus.SELECTED;
    }
    
    if (checkOut && isSameDay(date, checkOut)) {
      return CalendarStatus.CHECKIN_CHECKOUT;
    }
    
    if (checkIn && checkOut && date > checkIn && date < checkOut) {
      return CalendarStatus.SELECTED;
    }
    
    return status;
  };

  const getDateClass = (date: Date, status: string) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const isPastDate = date < today;
    const baseClass = "flex flex-col items-center justify-between p-1.5 h-14 w-full relative transition-all";
    
    if (isPastDate) {
      return `${baseClass} bg-gray-200 text-gray-400 cursor-not-allowed`;
    }
    
    switch (status) {
      case CalendarStatus.UNPRICED:
        return `${baseClass} bg-gray-50 text-gray-400 cursor-not-allowed`;
      case CalendarStatus.BOOKED:
        return `${baseClass} bg-blue-500 text-white cursor-not-allowed`;
      case CalendarStatus.RESERVED:
        return `${baseClass} bg-orange-500 text-white`;
      case CalendarStatus.SELECTED:
        return `${baseClass} bg-green-600 text-white`;
      case CalendarStatus.CHECKIN_CHECKOUT:
        return `${baseClass} bg-green-800 text-white`;
      default:
        return `${baseClass} bg-white text-gray-900 hover:bg-gray-100 cursor-pointer`;
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newCurrentMonth = addMonths(prevMonth, -1);
      setNextMonth(addMonths(newCurrentMonth, 1));
      return newCurrentMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newCurrentMonth = addMonths(prevMonth, 1);
      setNextMonth(addMonths(newCurrentMonth, 1));
      return newCurrentMonth;
    });
  };

  const renderCalendarMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const daysOfWeek = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    
    return (
      <div className="flex-1">
        <div className="text-center py-3 text-lg font-semibold text-gray-800 uppercase bg-gray-100">
          {format(month, 'MMMM yyyy', { locale: tr })}
        </div>
        
        <div className="grid grid-cols-7 border-b border-gray-200">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {Array.from({ length: new Date(monthStart).getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="border border-gray-200 h-14"></div>
          ))}
          
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const status = getDateStatus(day);
            const originalStatus = dateStatuses[dateKey]?.status;
            const isPastDate = day < today;
            
            const monthName = trMonths[day.getMonth()];
            const displayPrice = dateStatuses[dateKey]?.price || getPriceForMonth(monthName);
 
            const isBooked = originalStatus === CalendarStatus.BOOKED || status === CalendarStatus.BOOKED;
            const isUnpriced = originalStatus === CalendarStatus.UNPRICED || status === CalendarStatus.UNPRICED;
            const showPrice = !isBooked && !isUnpriced && !isPastDate;
            const isSelected = status === CalendarStatus.SELECTED || status === CalendarStatus.CHECKIN_CHECKOUT;
            
            const isMaxPrice = displayPrice === maxPrice && maxPrice > minPrice;
            const isMinPrice = displayPrice === minPrice && maxPrice > minPrice;
            
            let priceColorClass = 'text-amber-600/90';
            if (isSelected) priceColorClass = 'text-white/90';
            else if (isMaxPrice) priceColorClass = 'text-red-600/90';
            else if (isMinPrice) priceColorClass = 'text-green-600/90';
            
            return (
              <div
                key={dateKey}
                className={`border border-gray-200 ${getDateClass(day, status)}`}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-xs font-semibold ${isSelected || status === CalendarStatus.BOOKED || status === CalendarStatus.RESERVED ? 'text-white' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </div>
                <div className={`text-[10px] font-bold tracking-tight mt-auto ${showPrice ? '' : 'invisible'} ${priceColorClass}`}>
                  ₺{displayPrice.toLocaleString('tr-TR')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInfoBox = () => {
    return (
      <div className="bg-orange-500 text-white p-4 rounded-lg mb-6 flex items-start">
        <div className="mr-4 text-4xl">
          <span className="inline-block animate-pulse">💡</span>
        </div>
        <div>
          <p className="mb-2">
            Yapmış olduğunuz ön rezervasyonunuz, sizden önce ve ya sonra yapılan
            rezervasyona dikkat edilerek alınması uygundur. Tarihler arasında boşluk
            olması durumunda rezervasyonunuz onaylanmayacaktır. Onay belgeniz
            gönderildiği taktirde rezervasyonunuz onaylanmış olacaktır.
          </p>
        </div>
      </div>
    );
  };

  const renderCalendarLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 mr-2 shadow-sm rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-800">Müsait</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2 shadow-sm rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-800">Dolu</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2 shadow-sm rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-800">Seçilen Tarih</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-700 mr-2 shadow-sm rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-800">Giriş/Çıkış</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 mr-2 shadow-sm rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-800">Geçmiş Tarih</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderInfoBox()}
      
      <div className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg p-4">
        {renderCalendarMonth(currentMonth)}
        {renderCalendarMonth(nextMonth)}
      </div>
      
      <div className="flex justify-between mt-4">
        <button 
          onClick={goToPreviousMonth}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <span className="mr-1">◀</span> Önceki Ay
        </button>
        <button 
          onClick={goToNextMonth}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
        >
          Sonraki Ay <span className="ml-1">▶</span>
        </button>
      </div>
      
      {renderCalendarLegend()}
      
      {checkIn && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Giriş Tarihi:</span> {format(checkIn, 'd MMMM yyyy', { locale: tr })}
            {checkOut && (
              <>
                <br />
                <span className="font-semibold">Çıkış Tarihi:</span> {format(checkOut, 'd MMMM yyyy', { locale: tr })}
                <br />
                <span className="font-semibold">Toplam:</span> {Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} gece
                <br />
                <span className="font-semibold">Seçilen Günlerin Toplam Fiyatı:</span> {selectedPricesTotal} ₺
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}