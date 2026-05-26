import { Metadata } from 'next';
import VillaDetailClient from './VillaDetailClient';
import { getVillaById } from '@/firebase/villaService';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Metadata oluşturma (Server Component)
export async function generateMetadata({ params }: PageProps) {
  try {
    // params'ı await kullanarak bekletin
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    // Firebase'den villa verilerini çek
    const villa = await getVillaById(id);
    
    if (!villa) {
      return {
        title: 'Villa Bulunamadı | Eyleniyoruzvillam\'da',
        description: 'Aradığınız villa bulunamadı.'
      };
    }
    
    return {
      title: `${villa.ad} | Eyleniyoruzvillam\'da`,
      description: `${villa.aciklama?.substring(0, 160)}...` || 'Villa detayları'
    };
  } catch (error) {
    console.error("Metadata oluşturulurken hata:", error);
    return {
      title: 'Hata | Eyleniyoruzvillam\'da',
      description: 'Villa detayları yüklenirken bir hata oluştu.'
    };
  }
}

// Ana Sayfa Component (Server Component)
export default async function VillaDetailPage({ params }: PageProps) {
  try {
    // params'ı await kullanarak bekletin
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    // Firebase'den villa verilerini çek
    const villa = await getVillaById(id);
    
    // Verileri client component'e iletiyoruz
    return <VillaDetailClient villa={villa} id={id} />;
  } catch (error) {
    console.error("Villa detail sayfası yüklenirken hata:", error);
    return <VillaDetailClient villa={null} id="" />;
  }
}