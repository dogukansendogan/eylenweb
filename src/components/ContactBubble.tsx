'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon } from '@heroicons/react/24/solid';

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
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5 mr-2" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.977h.004c4.368 0 7.926-3.559 7.93-7.934A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.194-.588-1.378-.654-.185-.067-.32-.1-.452.1-.132.201-.51.655-.625.78-.115.125-.23.14-.432.039-.201-.101-.849-.313-1.619-.999-.599-.534-1.004-1.196-1.121-1.397-.117-.2-.012-.308.089-.408.09-.09.201-.23.301-.347.09-.117.13-.2.2-.331.066-.132.033-.248-.017-.348-.05-.1-.452-1.088-.619-1.492-.161-.39-.328-.337-.453-.337-.118-.007-.254-.007-.39-.007-.137 0-.36.051-.55.257-.19.205-.724.71-0.724 1.729 0 1.018.74 2.003.84 2.14 0.1 0.137 1.455 2.228 3.525 3.12 0.504.218.898.348 1.206.446 0.508.162.97.139 1.337.084 0.407-.06 1.195-.489 1.362-.96.166-.472.166-.875.117-.96-.05-.084-.185-.133-.39-.234z"/>
              </svg>
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