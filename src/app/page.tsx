import Hero from '@/components/Hero';
import FeaturedVillas from '@/components/FeaturedVillas';
import Features from '@/components/Features';
import Locations from '@/components/Locations';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedVillas />
      <Features />
      <Locations />
      <CTA />
      <Footer />
    </main>
  );
}
