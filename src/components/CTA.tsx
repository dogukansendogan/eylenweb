import Link from 'next/link';
import Image from 'next/image';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&auto=format&fit=crop"
          alt="Villa Manzarası"
          fill
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gray-900/60 z-10"></div>
      </div>
      <div className="container-custom relative z-20">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Hayalinizdeki Tatili <span className="font-serif italic font-normal text-primary">Planlamaya Başlayın</span>
          </h2>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Lüks villalarımızda unutulmaz bir tatil deneyimi sizi bekliyor.
            Konfor, mahremiyet ve eşsiz manzaralar ile rezervasyonunuzu hemen yapın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/villalar"
              className="bg-primary text-white hover:bg-primary/90 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5"
            >
              Villaları Keşfet
            </Link>
            <Link
              href="mailto:info@egleniyoruzvillam.com"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Bizimle İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;