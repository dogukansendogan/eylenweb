import Hero from '@/components/Hero';
import FeaturedVillas from '@/components/FeaturedVillas';
import Features from '@/components/Features';
import Locations from '@/components/Locations';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-pattern relative overflow-hidden">
      {/* Dekoratif şekiller */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-turquoise bg-opacity-30 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-coral bg-opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sand bg-opacity-40 blur-3xl"></div>
      </div>
      
      {/* Sayfa içeriği */}
      <div className="relative z-10">
        <Hero />
        <FeaturedVillas />
        <Features />
        <Locations />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
