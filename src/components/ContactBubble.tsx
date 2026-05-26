'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { FaWhatsapp } from 'react-icons/fa';

const ContactBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const phoneNumber = "+905443079456";
  const formattedPhone = "0544 307 94 56";
  
  const whatsappMessage = encodeURIComponent("Merhaba, Eyleniyoruzvillamda üzerinden villa rezervasyonu yapmak istiyorum. Yardımcı olabilir misiniz?");
  const whatsappLink = `https://api.whatsapp.com/send?phone=905443079456&text=${whatsappMessage}`;
  
  useEffect(() => {
    if (isOpen) {
      setIsPulsing(false);
    } else {
      const timer = setTimeout(() => {
        setIsPulsing(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4 w-72 border border-primary/20 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-dark text-lg">Bize Ulaşın</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Rezervasyon yapmak veya bilgi almak için bizimle iletişime geçin.
          </p>
          
          <div className="space-y-3">
            <a 
              href={`tel:${phoneNumber}`}
              className="flex items-center justify-center bg-primary hover:bg-coral text-white py-3 px-4 rounded-xl transition-colors w-full font-medium"
            >
              <PhoneIcon className="h-5 w-5 mr-2" />
              <span>Bizi Arayın: {formattedPhone}</span>
            </a>
            
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors w-full font-medium"
            >
              <FaWhatsapp className="h-5 w-5 mr-2" />
              <span>WhatsApp'tan Yazın</span>
            </a>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              7/24 Hizmetinizdeyiz!
            </p>
          </div>
        </div>
      )}
      
      <div className="relative">
        {isPulsing && !isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-coral/40"></span>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center rounded-full w-16 h-16 shadow-md transition-all duration-300 ${
            isOpen ? 'bg-coral text-white rotate-0' : 'bg-primary text-white hover:rotate-12'
          }`}
          aria-label="İletişime geç"
        >
          {isOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <PhoneIcon className="h-7 w-7" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ContactBubble;