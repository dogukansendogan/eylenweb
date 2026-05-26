'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// AuthContext'teki User tipine uygun olarak Header için User tipini tanımlayalım
interface ExtendedUser {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Header bileşeninde kullanılan diğer özellikler için ek alanlar
  name: string | null; // null olabilir
  avatar: string | null; // null olabilir
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // User verilerini ExtendedUser formatına dönüştürelim
  const extendedUser: ExtendedUser | null = user ? {
    ...user,
    name: user.fullName, // fullName'i name olarak kullan
    avatar: user.photoURL, // photoURL'i avatar olarak kullan
  } : null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 shadow-md backdrop-blur-sm py-3' 
        : 'bg-white/80 backdrop-blur-sm py-5 shadow-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">Eyleniyoruzvillam<span className="text-accent">da</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-secondary hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <Link href="/villalar" className="font-medium text-secondary hover:text-primary transition-colors">
              Villalar
            </Link>
            <Link href="/bolgeler" className="font-medium text-secondary hover:text-primary transition-colors">
              Bölgeler
            </Link>
            <Link href="/hakkimizda" className="font-medium text-secondary hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="font-medium text-secondary hover:text-primary transition-colors">
              İletişim
            </Link>
            <Link href="/ara" className="font-medium text-secondary hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="ml-6 flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                    {extendedUser?.avatar ? (
                      <Image 
                        src={extendedUser.avatar} 
                        alt={extendedUser.name || 'Kullanıcı'} 
                        fill 
                        sizes="40px"
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {extendedUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-secondary">
                    {extendedUser?.name?.split(' ')[0] || 'Kullanıcı'}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-secondary transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
                    <div className="py-3 px-4 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Giriş yapıldı:</p>
                      <p className="font-medium truncate">{extendedUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/profil" 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profilim
                      </Link>
                      <Link 
                        href="/rezervasyonlarim" 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Rezervasyonlarım
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/giris" 
                className="ml-6 px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Giriş Yap
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden relative z-10 p-2 text-secondary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Mobile Navigation */}
          <div className={`fixed inset-0 bg-white z-0 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
            <div className="flex flex-col items-center justify-center h-full space-y-8 py-20">
              {isAuthenticated && (
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 mb-3">
                    {extendedUser?.avatar ? (
                      <Image 
                        src={extendedUser.avatar} 
                        alt={extendedUser.name || 'Kullanıcı'} 
                        width={80}
                        height={80}
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
                        {extendedUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-lg">{extendedUser?.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{extendedUser?.email}</p>
                  
                  <Link 
                    href="/profil" 
                    className="text-primary hover:underline text-sm mb-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profilim
                  </Link>
                  <Link 
                    href="/rezervasyonlarim" 
                    className="text-primary hover:underline text-sm mb-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Rezervasyonlarım
                  </Link>

                </div>
              )}
              
              <Link 
                href="/" 
                className="font-medium text-xl text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Anasayfa
              </Link>
              <Link 
                href="/villalar" 
                className="font-medium text-xl text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Villalar
              </Link>
              <Link 
                href="/bolgeler" 
                className="font-medium text-xl text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Bölgeler
              </Link>
              <Link 
                href="/hakkimizda" 
                className="font-medium text-xl text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/iletisim" 
                className="font-medium text-xl text-secondary hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                İletişim
              </Link>
              
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-6 px-8 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Çıkış Yap
                </button>
              ) : (
                <Link 
                  href="/giris" 
                  className="mt-6 px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 