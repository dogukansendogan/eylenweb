'use client';

import { useState } from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function IletisimContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      setSubmitError('Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <main className="pt-32 pb-20 bg-[#0f172a] text-slate-200">
        <div className="relative h-80 mb-16">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
            alt="İletişim"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/60 to-[#0f172a]"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="bg-white/5 backdrop-blur-md px-10 py-8 rounded-2xl border border-white/10 shadow-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white tracking-wide">İletişim</h1>
              <div className="w-16 h-1 bg-accent mx-auto mb-4 rounded-full"></div>
              <p className="text-lg text-slate-300 font-light">Size nasıl yardımcı olabiliriz?</p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 sticky top-24 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-8 text-white tracking-wide">İletişim <span className="text-accent">Bilgilerimiz</span></h2>
                
                <div className="space-y-8">
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-3.5 rounded-xl mr-5 border border-white/10 group-hover:border-accent/50 transition-colors">
                      <PhoneIcon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white tracking-wide">Telefon</h3>
                      <p className="text-slate-400 text-sm mt-1">Pazartesi - Pazar: 09:00 - 20:00</p>
                      <a href="tel:+905321234567" className="text-accent hover:text-white transition-colors block mt-1 font-semibold">+90 532 123 45 67</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-3.5 rounded-xl mr-5 border border-white/10 group-hover:border-accent/50 transition-colors">
                      <EnvelopeIcon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white tracking-wide">E-posta</h3>
                      <p className="text-slate-400 text-sm mt-1">7/24 hizmetinizdeyiz</p>
                      <a href="mailto:info@egleniyoruzvillam.com" className="text-accent hover:text-white transition-colors block mt-1 font-semibold">info@egleniyoruzvillam.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-3.5 rounded-xl mr-5 border border-white/10 group-hover:border-accent/50 transition-colors">
                      <MapPinIcon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white tracking-wide">Adres</h3>
                      <p className="text-slate-400 text-sm mt-1">Merkez Ofisimiz</p>
                      <p className="text-white mt-1 text-sm leading-relaxed">Yalıkavak Mah. Marina Cad. No:12 <br />Bodrum, Muğla, Türkiye</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/10">
                  <h3 className="font-medium text-white mb-5 tracking-wide">Bizi Takip Edin</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-white/5 hover:bg-accent hover:text-white p-3 rounded-xl border border-white/10 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                    <a href="#" className="bg-white/5 hover:bg-accent hover:text-white p-3 rounded-xl border border-white/10 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 lg:p-10 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-8 text-white tracking-wide">Bize <span className="text-accent">Mesaj Gönderin</span></h2>
                
                {submitSuccess ? (
                  <div className="bg-white/5 border border-accent/30 rounded-xl p-8 text-center backdrop-blur-sm">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Mesajınız Alındı!</h3>
                    <p className="text-slate-400">
                      Mesajınız için teşekkür ederiz. Lüks kiralama ekibimiz en kısa sürede sizinle iletişime geçecektir.
                    </p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-6 bg-accent hover:bg-accent/90 text-white py-3 px-8 rounded-xl transition-all shadow-lg shadow-accent/20 font-medium"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-slate-300 font-medium mb-2 text-sm tracking-wide">Adınız Soyadınız</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors placeholder-slate-500"
                          placeholder="Adınız ve soyadınız"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-slate-300 font-medium mb-2 text-sm tracking-wide">E-posta Adresiniz</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors placeholder-slate-500"
                          placeholder="ornek@email.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-slate-300 font-medium mb-2 text-sm tracking-wide">Telefon Numaranız</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors placeholder-slate-500"
                          placeholder="0555 123 4567"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-slate-300 font-medium mb-2 text-sm tracking-wide">Konu</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors appearance-none"
                        >
                          <option value="" className="bg-[#0f172a] text-white">Konu Seçiniz</option>
                          <option value="reservation" className="bg-[#0f172a] text-white">Rezervasyon Yapmak İstiyorum</option>
                          <option value="info" className="bg-[#0f172a] text-white">Lüks Villalar Hakkında Bilgi</option>
                          <option value="support" className="bg-[#0f172a] text-white">Özel Destek Talebim Var</option>
                          <option value="other" className="bg-[#0f172a] text-white">Diğer</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <label htmlFor="message" className="block text-slate-300 font-medium mb-2 text-sm tracking-wide">Mesajınız</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none placeholder-slate-500"
                        placeholder="Size nasıl yardımcı olabiliriz?"
                      ></textarea>
                    </div>
                    
                    {submitError && (
                      <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm">
                        {submitError}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-accent hover:bg-accent/90 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center tracking-wide ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gönderiliyor...
                        </>
                      ) : 'Mesajı Gönder'}
                    </button>
                  </form>
                )}
              </div>
              
              <div className="mt-10 rounded-2xl overflow-hidden shadow-2xl h-96 relative border border-white/10">
                <div className="absolute inset-0 bg-accent/10 pointer-events-none z-10 mix-blend-overlay"></div>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50791.87351558821!2d27.368140299999998!3d37.035456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14be6c3878c7ef43%3A0xc84140d4679b66!2sBodrum%2C%20Mu%C4%9Fla!5e0!3m2!1str!2str!4v1695380895312!5m2!1str!2str" 
                  className="w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 transition-all duration-1000"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
          
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">Sık Sorulan <span className="text-accent">Sorular</span></h2>
              <div className="w-16 h-1 bg-white/20 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  question: "Rezervasyon için ne kadar önce başvurmalıyım?",
                  answer: "Özellikle yüksek sezon için (Haziran-Eylül ayları) en az 2-3 ay önceden rezervasyon yapmanızı öneririz. Erken rezervasyon ile lüks portföyümüzdeki en popüler villaları garantileyebilirsiniz."
                },

                {
                  question: "Rezervasyon iptali politikanız nedir?",
                  answer: "Rezervasyon tarihinden 30 gün öncesine kadar yapılan iptallerde kesintisiz iade yapılmaktadır. 15-30 gün arasında %50, 15 günden az kala yapılan iptallerde ise süreç sözleşme şartlarına tabidir."
                },
                {
                  question: "Villalarda evcil hayvan kabul ediliyor mu?",
                  answer: "Premium portföyümüzdeki bazı villalarımızda evcil dostlarımızı ağırlayabiliyoruz. Rezervasyon öncesi lüks danışmanlarımızla iletişime geçerek uygun villalarımız hakkında bilgi alabilirsiniz."
                },
              ].map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                  <h3 className="font-semibold text-lg mb-3 text-white flex items-center">
                    <span className="text-accent mr-3">❖</span>
                    {item.question}
                  </h3>
                  <p className="text-slate-400 pl-7 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}