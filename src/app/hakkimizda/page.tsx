import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Hakkımızda | Eyleniyoruzvillamda',
  description: 'Eyleniyoruzvillamda olarak lüks villa kiralama hizmetimiz hakkında bilgi edinin. Türkiye\'nin en güzel tatil bölgelerinde benzersiz tatil deneyimleri sunuyoruz.'
};

export default function HakkimizdaPage() {
  return (
    <>
      <main className="pt-32 pb-20 bg-[#0f172a] text-slate-200">
        <div className="relative h-96 mb-20">
          <Image
            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1200&auto=format&fit=crop"
            alt="Ekip Fotoğrafı"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
            <span className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Lüks Villa Kiralama</span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">Hakkımızda</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6 rounded-full"></div>
            <p className="text-xl md:text-2xl text-slate-300 font-light">Hayallerinizdeki tatili gerçeğe dönüştürüyoruz</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-white tracking-wide">Biz <span className="text-accent">Kimiz?</span></h2>
                
                <p className="text-slate-300 mb-6 leading-relaxed text-lg font-light">
                  <span className="font-semibold text-white">Eyleniyoruzvillam<span className="text-accent">da</span></span>, 2015 yılında Türkiye'nin eşsiz tatil bölgelerinde seçkin ve premium lüks villa kiralama hizmeti sunmak üzere kurulmuştur. Amacımız, misafirlerimize 5 yıldızlı otel konforunu, tamamen kendilerine ait bir evin mahremiyeti ve sıcaklığıyla birleştirerek eşsiz bir deneyim yaşatmaktır.
                </p>
                <p className="text-slate-300 mb-6 leading-relaxed font-light">
                  Portföyümüzdeki tüm villalar, sektördeki en yüksek kalite standartlarına göre özenle seçilmiş ve mimari açıdan kusursuz detaylarla donatılmıştır. Profesyonel ekibimiz, rezervasyon anından tatilinizin bitişine kadar size 7/24 kesintisiz VIP hizmet sunmaktadır.
                </p>
                <p className="text-slate-300 leading-relaxed font-light">
                  Modern konfor, nefes kesici manzaralar, sonsuzluk havuzları ve ultra lüks donanımları bir araya getiren özel villalarımızda ayrıcalıklı hissedeceğiniz bir tatil sizi bekliyor.
                </p>
              </div>
              
              <div className="relative h-96 md:h-full min-h-[400px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop" 
                  alt="Villa Yaşam"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-24">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-bold tracking-widest uppercase mb-2 block">Premium Yaklaşım</span>
              <h2 className="text-3xl font-bold text-white tracking-wide">Değerlerimiz ve <span className="text-accent">Misyonumuz</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Güvenilirlik & Mahremiyet</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  Şeffaflık ilkemiz ve mahremiyetinize duyduğumuz üst düzey saygı ile çalışırız. Özel hayatınızın gizliliği bizim için en önemli standarttır.
                </p>
              </div>
              
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Lüks ve Kalite</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  Taviz vermediğimiz kalite standartlarımızla, en lüks mimari detaylara ve donanımlara sahip premium villaları kullanımınıza sunarız.
                </p>
              </div>
              
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-all duration-300 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">7/24 Kesintisiz Destek</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  Tatiliniz boyunca ihtiyaç duyabileceğiniz her konuda, profesyonel ekibimizle 7/24 yanınızdayız. Kusursuz bir konaklama için detayları biz düşünüyoruz.
                </p>
              </div>
            </div>
          </div>
          

          <div className="rounded-3xl overflow-hidden relative border border-white/10 group">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop" 
                alt="Luxury Background" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm group-hover:bg-[#0f172a]/70 transition-colors duration-500"></div>
            </div>
            <div className="relative p-12 md:p-20 text-center z-10">
              <span className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Ayrıcalıklı Dünya</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Hayalinizdeki lüks tatile<br />gerçekten hazır mısınız?
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg font-light leading-relaxed">
                Premium koleksiyonumuzdaki kusursuz villalarımızla hayatınızın en unutulmaz tatil deneyimi için yerinizi ayırtın. Sınırlı sayıdaki lüks villalarımızı kaçırmayın.
              </p>
              <Link 
                href="/iletisim"
                className="inline-flex items-center justify-center bg-accent hover:bg-accent/90 text-white font-medium py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 tracking-wide text-lg"
              >
                VIP İletişim Hattı
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}