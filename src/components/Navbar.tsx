'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/villalar', label: 'Villalar' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' }
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  }, [logout]);

  const isHomepage = pathname === '/';
  const isTransparent = isHomepage && !scrolled;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isTransparent 
          ? 'bg-slate-950/75 backdrop-blur-md border-b border-white/10 py-4 md:py-5' 
          : 'bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] border-b border-slate-100 py-3 md:py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 md:space-x-3 group relative z-10 animate-fadeIn"
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary to-amber-500 opacity-60 blur-md group-hover:opacity-80 transition-opacity duration-300 ${!isTransparent ? 'scale-75' : 'scale-90'}`}></div>
              <div className={`relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-all duration-300 ${!isTransparent ? 'bg-slate-900 text-white' : 'bg-white/10 text-white border border-white/20'}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4.5 w-4.5 md:h-5 md:w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-base md:text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                !isTransparent ? 'text-slate-900' : 'text-white'
              }`}>
                Eyleniyoruzvillam<span className="text-primary font-serif italic">da</span>
              </span>
              <span className={`text-[8px] md:text-[10px] font-extrabold tracking-wider uppercase transition-colors duration-300 ${
                !isTransparent ? 'text-slate-500' : 'text-white/70'
              }`}>
                Premium Luxury Villas
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1.5">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/25' 
                      : isTransparent 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-slate-800 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2.5 focus:outline-none group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md transition-transform group-hover:scale-105 border-2 border-white/30">
                      {user?.fullName ? (
                        user.fullName.charAt(0).toUpperCase()
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-bold transition-colors ${
                      !isTransparent ? 'text-slate-800 group-hover:text-primary' : 'text-white group-hover:text-white/80'
                    }`}>
                      {user?.fullName?.split(' ')[0] || 'Hesabım'}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''} ${!isTransparent ? 'text-slate-600' : 'text-white/90'}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-100 z-50 transition-all duration-300 animate-fadeIn">
                      <div className="py-4 px-5 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoş Geldiniz</p>
                        <p className="font-semibold text-slate-800 text-sm truncate">{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        <Link href="/profilim" className="flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                          Profilim
                        </Link>
                        <Link href="/profilim#reservations" className="flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                          Rezervasyonlarım
                        </Link>

                        <hr className="my-1.5 border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                        >
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/giris" 
                    className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 px-4.5 py-2 rounded-full border ${
                      isTransparent 
                        ? 'text-white border-white/30 hover:bg-white/10' 
                        : 'text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/giris?register=true" 
                    className="inline-flex items-center justify-center px-4.5 py-2 rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/95 transition-all duration-300 shadow-primary/10 hover:shadow-primary/20"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
            
            <button
              className={`md:hidden rounded-full p-2 transition-all duration-300 focus:outline-none ${
                !isTransparent 
                  ? 'text-slate-800 hover:bg-slate-100' 
                  : 'text-white hover:bg-white/15'
              } ${mobileMenuOpen ? 'bg-slate-100 text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-[600px] opacity-100 mt-3' 
              : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className={`p-3 rounded-2xl shadow-2xl border ${
            !isTransparent 
              ? 'bg-white border-slate-100' 
              : 'bg-slate-950/95 backdrop-blur-lg border-white/10'
          }`}>
            <div className="space-y-1">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex items-center py-3 px-4 rounded-xl text-sm font-bold transition-colors ${
                      isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : !isTransparent 
                          ? 'text-slate-800 hover:bg-slate-50' 
                          : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            {isAuthenticated ? (
              <div className="mt-3 pt-3 border-t border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center space-x-3 px-4 py-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate ${!isTransparent ? 'text-slate-900' : 'text-white'}`}>
                      {user?.fullName || 'Kullanıcı'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href="/profilim" className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-bold ${!isTransparent ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-200 hover:bg-white/10'}`}>
                    Profilim
                  </Link>
                  <Link href="/profilim#reservations" className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-bold ${!isTransparent ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-200 hover:bg-white/10'}`}>
                    Rezervasyonlarım
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full py-2.5 px-4 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-slate-100/50 dark:border-slate-800/50 grid grid-cols-2 gap-2.5">
                <Link 
                  href="/giris" 
                  className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
                    !isTransparent 
                      ? 'text-slate-800 border-slate-200 hover:bg-slate-50' 
                      : 'text-white border-white/20 hover:bg-white/10'
                  }`}
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/giris?register=true" 
                  className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/95 shadow-sm shadow-primary/10 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}