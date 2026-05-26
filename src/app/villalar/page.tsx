import Footer from '@/components/Footer';
import { Metadata } from 'next';
import VillalarList from '@/components/VillalarList';
import { Suspense } from 'react';

export const metadata = {
  title: 'Tüm Villalar | Eğleniyoruzvillam\'da',
  description: 'En güzel tatil villaları ve kiralık yazlıklar - Eğleniyoruzvillam\'da ile lüks villalarda unutulmaz bir tatil deneyimi yaşayın.',
};

// Yükleme durumunda gösterilecek bileşen
function VillalarLoading() {
  return (
    <div className="container-custom pt-32 pb-20 bg-[#0f172a] min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">Tüm <span className="text-accent">Villalar</span></h1>
      <p className="text-slate-300 text-lg mb-12 max-w-3xl font-light">
        Premium portföyümüzdeki en seçkin tatil villaları ve kiralık lüks yazlıklar arasından size en uygun olanı seçin.
      </p>
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    </div>
  );
}

export default function VillalarPage() {
  return (
    <>
      <main className="pt-32 pb-20 bg-[#0f172a] min-h-screen text-slate-200">
        <Suspense fallback={<VillalarLoading />}>
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">Tüm <span className="text-accent">Villalar</span></h1>
            <p className="text-slate-300 text-lg mb-12 max-w-3xl font-light leading-relaxed">
              Premium portföyümüzdeki en seçkin tatil villaları ve kiralık lüks yazlıklar arasından size en uygun olanı seçin ve eşsiz bir tatil için rezervasyonunuzu yapın.
            </p>
            
            <VillalarList />
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
} 