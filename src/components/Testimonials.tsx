'use client';

import { useState } from 'react';
import Image from 'next/image';

type Testimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
};

const testimonials = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    role: 'İş Adamı',
    content: 'Ailecek harika bir tatil geçirdik. Villa beklentilerimizin ötesindeydi ve çocuklar da çok eğlendi. Rezervasyonumu bir hafta içinde attım, teşekkürler Eğleniyoruzvillam\'da.',
    avatar: '/avatar-1.jpg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Zeynep Kaya',
    role: 'Mimar',
    content: 'Villanın tasarımına profesyonel olarak bile hayran kaldım. Ayrıca Eğleniyoruzvillam\'da ekibinin ilgisi ve profesyonelliği tatilimizi kusursuz hale getirdi.',
    avatar: '/avatar-2.jpg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Mehmet Demir',
    role: 'Yazılım Geliştirici',
    content: 'Doğayla iç içe, teknolojiden uzak bir tatil arıyordum, tam da aradığımı buldum. Böyle bir konsepti sunan tek şirket Eğleniyoruzvillam\'da.',
    avatar: '/avatar-3.jpg',
    rating: 4,
  },
  {
    id: 4,
    name: 'Ayşe Demir',
    role: 'Doktor',
    content: 'İşimin yoğunluğundan uzaklaşmak için seçtiğim Villa Sunset, tam bir huzur kaynağıydı. Gün batımı manzarası eşsizdi ve personel çok ilgiliydi. Tüm stresimi bir hafta içinde attım, teşekkürler Eğleniyoruzvillam\'da.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
  },
  {
    id: 5,
    name: 'Emre Şahin',
    role: 'Yazılım Mühendisi',
    content: 'Uzaktan çalışma için tercih ettiğim villa hem konforluydu hem de internet altyapısı mükemmeldi. Gündüzleri çalışıp akşamları havuzun keyfini çıkardım. Böyle bir konsepti sunan tek şirket Eğleniyoruzvillam\'da.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <h3 className="font-bold text-secondary">{testimonial.name}</h3>
          <p className="text-sm text-tertiary">{testimonial.role}</p>
        </div>
      </div>
      
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${i < testimonial.rating ? 'text-accent' : 'text-gray-300'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <p className="text-tertiary flex-grow italic">"{testimonial.content}"</p>
    </div>
  );
};

const Testimonials = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  
  const displayedTestimonials = testimonials.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  return (
    <section className="py-20 bg-secondary text-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary text-center mb-2">
            Misafirlerimizin <span className="text-primary">Görüşleri</span>
          </h2>
          <p className="text-center text-tertiary mb-12">
            Misafirlerimizin deneyimlerini ve Eğleniyoruzvillam\'da geçirdikleri unutulmaz anları paylaşıyoruz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedTestimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentPage ? 'bg-accent' : 'bg-gray-500 hover:bg-gray-400'
                }`}
                aria-label={`Sayfa ${i + 1}`}
              />
            ))}
          </div>
        )}
        
        <div className="text-center mt-16 bg-accent/20 backdrop-blur-sm p-8 rounded-lg border border-accent/30">
          <h3 className="text-2xl font-bold mb-6">Ayrıcalıklı Hizmet Garantisi</h3>
          <p className="text-lg mb-6">
            Misafir memnuniyeti bizim için her şeyden önemlidir. Konforunuz ve mutluluğunuz 
            için en iyisini sunmaya söz veriyoruz.
          </p>
          <div className="flex justify-center text-accent">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8"
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 