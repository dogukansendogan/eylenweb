'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getVillalar, Villa } from '@/firebase/villaService';
import VillaCard from './VillaCard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const FeaturedVillas = () => {
  const [villalar, setVillalar] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVillalar = async () => {
      try {
        const data = await getVillalar();
        // Sadece ilk 6 villayı göster
        setVillalar(data.slice(0, 6));
        setLoading(false);
      } catch (err) {
        console.error("Villalar yüklenirken hata oluştu:", err);
        setError("Villalar yüklenirken bir hata oluştu.");
        setLoading(false);
      }
    };

    fetchVillalar();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50/80 via-[#f8f9fa] to-white relative overflow-hidden">
      {/* Ultra-subtle decorative background texture */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layered slanted background pane */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.02] to-transparent transform skew-x-12 translate-x-20 pointer-events-none" />
        {/* Devasa bir lüks amber/turuncu parıltı (gradient blur radial) katmanı */}
        <div className="absolute top-12 left-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />
        {/* Large ambient glow — top right */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-100/30 blur-3xl" />
        {/* Smaller glow — bottom left */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-sky-500/[0.04] blur-[140px]" />
      </div>

      <div className="container-custom relative z-10">

        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 block">
              Küratörümüzün Seçtikleri
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Rüya Gibi Bir Tatilin <span className="font-serif italic font-normal text-amber-600">Özel Adresleri</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mt-2 leading-relaxed">
              Sizin için her detayını incelikle doğruladığımız, Hatay'dan Muğla'ya uzanan en seçkin lüks yaşam alanları.
            </p>
          </div>

          {/* Desktop CTA */}
          <Link
            href="/villalar"
            className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap mb-2"
          >
            Tüm Villaları Gör
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Cards Grid ── */}
        {loading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
                <div className="h-64 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-slate-200 rounded-full" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded-full" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-6 w-20 bg-slate-100 rounded-md" />
                    <div className="h-6 w-20 bg-slate-100 rounded-md" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <div className="h-4 w-28 bg-slate-200 rounded-full" />
                    <div className="h-4 w-20 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-slate-500">{error}</p>
          </div>
        ) : villalar.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Henüz villa bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {villalar.map(villa => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        )}

        {/* ── Mobile CTA ── */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/villalar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Tüm Villaları Gör
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedVillas;