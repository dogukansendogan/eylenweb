'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

// ── Veri Tipi ─────────────────────────────────────────────────────────────────
export interface Kampanya {
  id: string;
  baslik: string;
  aciklama: string;
  kod?: string;          // kupon kodu (opsiyonel)
  tip: 'percentage' | 'fixed' | 'freenight' | 'diger';
  deger?: number;        // indirim değeri
  baslangicTarihi?: string;
  bitisTarihi?: string;
  isActive: boolean;
  renk?: string;         // opsiyonel tema rengi (hex veya tailwind class)
  gorsel?: string;       // opsiyonel banner görseli
}

// ── Yardımcı: Kampanya etiketi formatla ───────────────────────────────────────
function kampanyaEtiket(kampanya: Kampanya): string {
  if (kampanya.tip === 'percentage' && kampanya.deger)
    return `%${kampanya.deger} İndirim`;
  if (kampanya.tip === 'fixed' && kampanya.deger)
    return `${kampanya.deger.toLocaleString('tr-TR')} ₺ İndirim`;
  if (kampanya.tip === 'freenight')
    return 'Ücretsiz Gece';
  return 'Özel Fırsat';
}

// ── Yardımcı: Bitiş tarihi kalan gün ─────────────────────────────────────────
function kalanGun(bitisTarihi?: string): number | null {
  if (!bitisTarihi) return null;
  const fark = new Date(bitisTarihi).getTime() - Date.now();
  return Math.max(0, Math.ceil(fark / (1000 * 60 * 60 * 24)));
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface KampanyalarProps {
  /** Maks kaç kampanya gösterilsin? (varsayılan: sınırsız) */
  limit?: number;
  /** Sadece belirli bir kodu kopyalamak için tooltip göster */
  kopyalamaAktif?: boolean;
  /** Bileşenin kendi section/başlığını ekle mi? */
  baslikGoster?: boolean;
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function Kampanyalar({
  limit,
  kopyalamaAktif = true,
  baslikGoster = true,
}: KampanyalarProps) {
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  const [loading, setLoading] = useState(true);
  const [kopyalananKod, setKopyalananKod] = useState<string | null>(null);

  // ── Firebase'den kampanyaları çek ────────────────────────────────────────────
  useEffect(() => {
    const fetchKampanyalar = async () => {
      try {
        setLoading(true);
        const kampanyalarRef = collection(db, 'kampanyalar');
        // Sadece aktif kampanyaları getir, oluşturma tarihine göre sırala
        const aktifQuery = query(
          kampanyalarRef,
          where('isActive', '==', true),
          orderBy('baslangicTarihi', 'desc')
        );
        const snapshot = await getDocs(aktifQuery);

        let liste: Kampanya[] = snapshot.docs.map(doc => ({
          id: doc.id,
          baslik: doc.data().baslik ?? 'Kampanya',
          aciklama: doc.data().aciklama ?? '',
          kod: doc.data().kod ?? undefined,
          tip: doc.data().tip ?? 'diger',
          deger: doc.data().deger ?? undefined,
          baslangicTarihi: doc.data().baslangicTarihi ?? undefined,
          bitisTarihi: doc.data().bitisTarihi ?? undefined,
          isActive: doc.data().isActive ?? false,
          renk: doc.data().renk ?? undefined,
          gorsel: doc.data().gorsel ?? undefined,
        }));

        // Limit uygula
        if (limit && limit > 0) {
          liste = liste.slice(0, limit);
        }

        setKampanyalar(liste);
      } catch (err) {
        console.warn('Kampanyalar yüklenemedi:', err);
        setKampanyalar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKampanyalar();
  }, [limit]);

  // ── Kodu panoya kopyala ───────────────────────────────────────────────────────
  const handleKopyala = (kod: string) => {
    navigator.clipboard.writeText(kod).catch(() => {});
    setKopyalananKod(kod);
    setTimeout(() => setKopyalananKod(null), 2000);
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {baslikGoster && (
          <div className="h-8 w-48 bg-slate-200 rounded-full animate-pulse mb-8" />
        )}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] animate-pulse flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 rounded-full w-3/4" />
              <div className="h-3 bg-slate-200 rounded-full w-1/2" />
              <div className="h-8 bg-slate-100 rounded-xl w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────────
  if (kampanyalar.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6">
          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Şu An Aktif Kampanya Yok</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
          Yeni kampanya ve fırsatlardan haberdar olmak için bültenimize abone olabilirsiniz.
        </p>
      </div>
    );
  }

  // ── Kampanya Kartları ─────────────────────────────────────────────────────────
  return (
    <div>
      {baslikGoster && (
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-600 mb-2 flex items-center gap-2">
              <span className="inline-block w-5 h-px bg-amber-500" />
              Özel Fırsatlar
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Aktif Kampanyalar
            </h2>
          </div>
          <span className="text-sm text-slate-400 font-medium">
            {kampanyalar.length} kampanya bulundu
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {kampanyalar.map(kampanya => {
          const kalan = kalanGun(kampanya.bitisTarihi);
          const acil = kalan !== null && kalan <= 5;

          return (
            <div
              key={kampanya.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_4px_24px_rgb(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] transition-all duration-300"
            >
              {/* Üst renkli şerit */}
              <div className={`h-1.5 w-full ${acil ? 'bg-gradient-to-r from-rose-400 to-orange-400' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

              <div className="p-6">
                {/* Üst satır: İkon + Etiket */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* İkon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${acil ? 'bg-rose-50' : 'bg-amber-50'}`}>
                    <svg className={`w-6 h-6 ${acil ? 'text-rose-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>

                  {/* İndirim etiketi */}
                  <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${
                    acil
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {kampanyaEtiket(kampanya)}
                  </span>
                </div>

                {/* Başlık & Açıklama */}
                <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                  {kampanya.baslik}
                </h3>
                {kampanya.aciklama && (
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {kampanya.aciklama}
                  </p>
                )}

                {/* Bitiş tarihi */}
                {kalan !== null && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold mb-4 ${acil ? 'text-rose-600' : 'text-slate-500'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                    </svg>
                    {kalan === 0
                      ? 'Bugün bitiyor!'
                      : acil
                      ? `Son ${kalan} gün!`
                      : `${kalan} gün kaldı`}
                  </div>
                )}

                {/* Kupon Kodu Kopyalama */}
                {kampanya.kod && kopyalamaAktif && (
                  <div className="mt-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Kupon Kodu</p>
                    <button
                      onClick={() => handleKopyala(kampanya.kod!)}
                      className="w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-amber-400 px-4 py-2.5 rounded-xl transition-all group/btn"
                      title="Kopyalamak için tıklayın"
                    >
                      <span className="font-mono font-bold text-slate-800 tracking-widest text-sm">
                        {kampanya.kod}
                      </span>
                      <span className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                        kopyalananKod === kampanya.kod
                          ? 'text-green-600'
                          : 'text-amber-600 group-hover/btn:text-amber-700'
                      }`}>
                        {kopyalananKod === kampanya.kod ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                            Kopyala
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
