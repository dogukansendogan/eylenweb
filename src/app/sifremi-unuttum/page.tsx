'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from '@/firebase/firebaseConfig';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const auth = getAuth(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setError('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.');
      } else if (code === 'auth/invalid-email') {
        setError('Lütfen geçerli bir e-posta adresi giriniz.');
      } else if (code === 'auth/too-many-requests') {
        setError('Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.');
      } else {
        setError('Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch">
      {/* Mobil Görünümdeki Görsel Header */}
      <div className="md:hidden relative">
        <div className="h-40 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-900/90 z-10"></div>
          <div className="absolute inset-0 opacity-30 bg-[url('/images/pattern.svg')] bg-center z-0"></div>
          <Image 
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914" 
            alt="Lüks Villa" 
            fill
            quality={70}
            className="object-cover object-center opacity-40"
          />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span className="text-3xl font-bold text-white">Şifremi Unuttum</span>
            <p className="text-white/80 text-center mt-1 px-4 text-sm">
              E-posta adresinizi girin ve size sıfırlama bağlantısı gönderelim
            </p>
          </div>
        </div>
        
        {/* Dalga Şekli */}
        <div className="h-12 bg-gray-50 relative overflow-hidden">
          <svg className="absolute bottom-0 w-full text-primary" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-primary"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-primary"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-primary"></path>
          </svg>
        </div>
      </div>
      
      {/* Sol Taraf - Resim ve Bilgi (Sadece Masaüstü) */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-900/90 z-10"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('/images/pattern.svg')] bg-center z-0"></div>
        <Image 
          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914" 
          alt="Lüks Villa" 
          fill
          quality={80}
          className="object-cover object-center opacity-40"
        />
        
        <div className="relative z-20 flex flex-col justify-center p-12 h-full text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="block text-white/80 mb-2">Endişelenmeyin</span>
            Şifrenizi Kolayca Sıfırlayın
          </h1>
          
          <p className="text-lg text-white/80 max-w-md mb-10">
            Şifrenizi mi unuttunuz? Sorun değil. E-posta adresinizi girin ve 
            size şifre sıfırlama bağlantısı gönderelim.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Hızlı İşlem</h3>
                <p className="text-white/70">Sıfırlama bağlantısı anında e-posta adresinize gönderilir</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Güvenli Sıfırlama</h3>
                <p className="text-white/70">Sadece size özel ve sınırlı süreli güvenli bağlantı</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Kolay Erişim</h3>
                <p className="text-white/70">Yeni şifrenizi belirledikten sonra hesabınıza hemen erişim sağlayın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sağ Taraf - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-4 sm:px-6 py-10 md:py-0">
        <div className="w-full max-w-md">
          {/* Mobil görünümde üst bilgi artık header'a taşındı */}
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 md:p-10">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-secondary">
                      Şifrenizi mi Unuttunuz?
                    </h2>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                      E-posta adresinizi girin ve size sıfırlama bağlantısı gönderelim
                    </p>
                  </div>
                  
                  {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-posta Adresi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                          placeholder="ornek@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base mt-4"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          İşleniyor...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Sıfırlama Bağlantısı Gönder
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">E-posta Gönderildi!</h3>
                  <p className="text-gray-600 mb-8 text-sm sm:text-base">
                    Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. 
                    <br />Lütfen gelen kutunuzu kontrol edin.
                  </p>
                  <button
                    onClick={() => router.push('/giris')}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 text-base"
                  >
                    <span className="flex items-center justify-center">
                      Giriş Sayfasına Dön
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              )}
              
              <div className="mt-8 text-center">
                <Link href="/giris" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-primary">
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Anasayfaya dön
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 