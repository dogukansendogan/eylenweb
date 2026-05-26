import Image from 'next/image';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Özel Havuzlar',
    description: 'Tüm villalarımızda size özel havuzlar bulunmaktadır. Dilediğiniz zaman serinleyebilir ve mahremiyet içinde güneşlenebilirsiniz.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'Lüks Tasarım',
    description: 'Modern mimari ve şık iç tasarım ile donatılmış villalarımız konforunuz için her ayrıntıyı düşünüyor.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Premium Hizmetler',
    description: 'Villa temizliğinden özel şefe, araç kiralama hizmetinden tekne turlarına kadar her türlü isteğinize yanıt veriyoruz.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Muhteşem Konumlar',
    description: 'Villalarımız en özel ve eşsiz manzaralara sahip konumlarda bulunur. Deniz, dağ ve doğa manzaralarının keyfini çıkarın.',
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-[#f8f9fa] to-slate-50 relative overflow-hidden">
      {/* Dekoratif şekiller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layered slanted background pane */}
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-amber-500/[0.015] to-transparent transform -skew-x-12 -translate-x-20 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-amber-100 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 rounded-full bg-sky-100 opacity-20 blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16 space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 block">
            Neden Eğleniyoruzvillam?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Benzersiz Bir Tatilin <span className="font-serif italic font-normal text-amber-600">Ayrıcalıklı Adımları</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
            Eğleniyoruzvillam olarak, size sadece bir konaklama değil, hayatınız boyunca hatırlayacağınız lüks bir tatil deneyimi sunuyoruz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="relative group">
              {/* Layered hover card glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none" />
              <div className="relative bg-white/80 backdrop-blur-md p-7 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:bg-white hover:border-slate-100/80 transition-all duration-500">
                <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50/60 p-3 rounded-2xl w-14 h-14 flex items-center justify-center border border-amber-100/50">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-slate-800">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        

      </div>
    </section>
  );
};

export default Features; 