'use client';

import { useEffect, useState, ReactNode } from 'react';

// Client-side rendering için bir wrapper komponent
// useSearchParams gibi sadece client tarafında çalışan hookları kullanan komponentleri sarmalar
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // İlk render sırasında null dön (SSR sırasında)
  if (!mounted) {
    return null;
  }

  // Client'da render edildiğinde children'ı dön
  return <>{children}</>;
} 