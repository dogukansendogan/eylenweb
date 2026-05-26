'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from 'firebase/auth';

// Firebase hata mesajlarını Türkçe'ye çevirme
function translateFirebaseError(error: AuthError): string {
  const errorCode = error.code;
  
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-disabled': 'Bu kullanıcı hesabı devre dışı bırakılmıştır.',
    'auth/user-not-found': 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı. Lütfen önce kayıt olun.',
    'auth/wrong-password': 'Hatalı şifre girdiniz.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/operation-not-allowed': 'Bu işlem şu anda izin verilmiyor.',
    'auth/account-exists-with-different-credential': 'Bu e-posta başka bir giriş yöntemiyle zaten kullanılıyor.',
    'auth/popup-closed-by-user': 'Giriş penceresi kullanıcı tarafından kapatıldı.',
    'auth/popup-blocked': 'Giriş penceresi tarayıcınız tarafından engellendi.',
    'auth/cancelled-popup-request': 'Giriş isteği iptal edildi.',
    'auth/network-request-failed': 'Ağ bağlantısı sırasında bir hata oluştu.',
    'auth/timeout': 'İşlem zaman aşımına uğradı.',
    'auth/invalid-credential': 'Bu bilgilerle kayıtlı bir hesap bulunamadı. Lütfen kayıt olun veya bilgilerinizi kontrol edin.'
  };
  
  return errorMessages[errorCode] || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showVerificationSentModal, setShowVerificationSentModal] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, loginWithGoogle, loginWithFacebook, resendVerification, isAuthenticated: authIsAuthenticated } = useAuth();

  // URL'den register parametresini kontrol et
  useEffect(() => {
    const registerParam = searchParams.get('register');
    if (registerParam === 'true') {
      setIsLoginMode(false);
    }
  }, [searchParams]);

  // Kullanıcı zaten giriş yapmışsa anasayfaya yönlendir
  useEffect(() => {
    if (authIsAuthenticated) {
      router.push('/');
    }
  }, [authIsAuthenticated, router]);

  // Başarılı giriş/kayıt sonrası yönlendirme
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (isLoginMode) {
        // Giriş yap
        try {
          const result = await login(email, password);
          if (result && result.success) {
            setIsAuthenticated(true);
          } else {
            const errorCode = result?.code;
            const errorMessage = result?.error || "";
            
            if (errorCode === 'auth/email-not-verified' || errorMessage === "E-posta adresiniz doğrulanmadı." || errorMessage.includes("doğrulanmadı")) {
              setError('email-not-verified');
            } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
              setError("E-posta adresiniz veya şifreniz hatalı. Lütfen bilgilerinizi kontrol edin.");
            } else if (errorCode === 'auth/invalid-email') {
              setError("Lütfen geçerli bir e-posta adresi giriniz.");
            } else if (errorCode === 'auth/too-many-requests') {
              setError("Çok fazla hatalı giriş denemesi yaptınız. Lütfen hesabınızın güvenliği için biraz bekleyip tekrar deneyin.");
            } else {
              setError("Giriş yapılırken beklenmedik bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
          }
        } catch (err: any) {
          console.error('Giriş hatası:', err);
          const errorCode = err?.code;
          const errorMessage = err?.message || "";
          
          if (errorCode === 'auth/email-not-verified' || errorMessage === "E-posta adresiniz doğrulanmadı." || errorMessage.includes("doğrulanmadı")) {
            setError('email-not-verified');
          } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
            setError("E-posta adresiniz veya şifreniz hatalı. Lütfen bilgilerinizi kontrol edin.");
          } else if (errorCode === 'auth/invalid-email') {
            setError("Lütfen geçerli bir e-posta adresi giriniz.");
          } else if (errorCode === 'auth/too-many-requests') {
            setError("Çok fazla hatalı giriş denemesi yaptınız. Lütfen hesabınızın güvenliği için biraz bekleyip tekrar deneyin.");
          } else {
            setError("Giriş yapılırken beklenmedik bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
          }
        }
      } else {
        // Kayıt ol
        if (name.trim().length < 3) {
          setError('Adınız en az 3 karakter olmalıdır.');
          setIsLoading(false);
          return;
        }
        
        try {
          // Telefon numarasını doğrudan register fonksiyonuna gönderiyoruz
          success = await register(name, email, password, phone);
          
          if (success) {
            setShowVerificationSentModal(true);
          }
        } catch (err: any) {
          console.error('Kayıt hatası:', err);
          const errorCode = err?.code;
          const errorMessage = err?.message || "";
          
          if (errorCode === 'auth/email-not-verified' || errorMessage === "E-posta adresiniz doğrulanmadı." || errorMessage.includes("doğrulanmadı")) {
            setError('email-not-verified');
          } else if (err && 'code' in err) {
            setError(translateFirebaseError(err as AuthError));
          } else {
            setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
          }
        }
      }
    } catch (outerErr: any) {
      console.error('Kritik giriş/kayıt hatası:', outerErr);
      const errorCode = outerErr?.code;
      const errorMessage = outerErr?.message || "";
      if (errorCode === 'auth/email-not-verified' || errorMessage === "E-posta adresiniz doğrulanmadı." || errorMessage.includes("doğrulanmadı")) {
        setError('email-not-verified');
      } else {
        setError("Hatalı giriş denemesi veya sistem hatası.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sosyal medya ile giriş fonksiyonu
  const handleSocialLogin = async (provider: string) => {
    setError('');
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (provider === 'googleLogin') {
        success = await loginWithGoogle();
      } else if (provider === 'facebookLogin') {
        success = await loginWithFacebook();
      }
      
      if (success) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Sosyal giriş hatası:', err);
      if (err instanceof Error && 'code' in err) {
        setError(translateFirebaseError(err as AuthError));
      } else {
        setError(`${provider === 'googleLogin' ? 'Google' : 'Facebook'} ile giriş sırasında bir hata oluştu.`);
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
            <span className="text-3xl font-bold text-white">Eğleniyoruzvillam'da</span>
            <p className="text-white/80 text-center mt-1 px-4 text-sm">
              {isLoginMode ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
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
          <div className="flex items-center mb-10">
            <span className="text-3xl font-bold text-white">Eğleniyoruzvillam'da</span>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Eğleniyoruzvillam'da'ya Hoş Geldiniz
            </h1>
          </div>
          
          <p className="text-lg text-white/80 max-w-md mb-10">
            Rüya gibi bir tatil için en özel villaları keşfedin, 
            rezervasyon yapın ve unutulmaz anılar biriktirin.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Özel Seçilmiş Villalar</h3>
                <p className="text-white/70">Tümü kalite kontrolünden geçmiş benzersiz konaklama seçenekleri</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">7/24 Destek</h3>
                <p className="text-white/70">Tatil sürecinizde size her zaman destek olmak için buradayız</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Güvenli Ödeme</h3>
                <p className="text-white/70">Tüm ödemeleriniz %100 güvenli ve şifrelenmiş olarak gerçekleşir</p>
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
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary">
                  {isLoginMode ? 'Hoş Geldiniz' : 'Hemen Kaydolun'}
                </h2>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {isLoginMode 
                    ? 'Hesabınıza giriş yaparak lüks villalarımızı keşfedin' 
                    : 'Üyelik oluşturarak ayrıcalıklı fırsatları kaçırmayın'}
                </p>
              </div>
              
              {error === 'email-not-verified' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center my-4">
                  <span className="text-2xl block mb-2">✉️</span>
                  <h4 className="text-sm font-bold text-slate-800">E-posta Adresiniz Doğrulanmadı</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Rezervasyon yapabilmek için lütfen e-postanıza gönderilen onay linkine tıklayın.
                  </p>
                  <button 
                    type="button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const result = await resendVerification(email, password);
                        if (result && result.success) {
                          alert("Doğrulama e-postası başarıyla gönderildi.");
                        } else {
                          const errCode = result?.error;
                          if (errCode === 'auth/too-many-requests') {
                            alert("Çok fazla doğrulama e-postası gönderilmeye çalışıldı. Lütfen bir süre sonra tekrar deneyin.");
                          } else {
                            alert("Doğrulama e-postası gönderilirken bir hata oluştu.");
                          }
                        }
                      } catch (err) {
                        alert("Doğrulama e-postası gönderilirken bir hata oluştu.");
                      } finally {
                        setIsLoading(false);
                      }
                    }} 
                    className="mt-3 text-xs font-semibold text-amber-700 underline hover:text-amber-800"
                  >
                    Tekrar Doğrulama E-postası Gönder
                  </button>
                </div>
              ) : error ? (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLoginMode && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Ad Soyad
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                          placeholder="Ad Soyad"
                          required={!isLoginMode}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Telefon Numarası
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                          placeholder="5xx xxx xxxx"
                        />
                      </div>
                    </div>
                  </>
                )}
                
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
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Şifre
                    </label>
                    {isLoginMode && (
                      <Link href="/sifremi-unuttum" className="text-sm text-primary hover:underline font-medium">
                        Şifremi unuttum
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLoginMode ? 'Giriş yapılıyor...' : 'Kaydediliyor...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
              
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">veya</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('googleLogin')}
                    className="group relative flex justify-center items-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path
                          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                          fill="#EA4335"
                        />
                        <path
                          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.95 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9554 21.095L16.0854 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                          fill="#34A853"
                        />
                      </svg>
                    </span>
                    Google ile Giriş
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebookLogin')}
                    className="group relative flex justify-center items-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-[#1877F2]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </span>
                    Facebook ile Giriş
                  </button>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isLoginMode 
                    ? 'Hesabınız yok mu? Hemen kayıt olun' 
                    : 'Zaten hesabınız var mı? Giriş yapın'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-primary">
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Giriş yapmadan anasayfaya dön
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {showVerificationSentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-950 mb-2">Doğrulama E-postası Gönderildi</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              E-posta adresinize bir doğrulama linki gönderildi. Lütfen gelen kutunuzu (ve gereksiz kutusunu) kontrol edin.
            </p>
            <button
              onClick={() => {
                setShowVerificationSentModal(false);
                setIsLoginMode(true);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 