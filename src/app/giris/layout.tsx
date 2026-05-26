import { Suspense } from "react";

// Yükleme durumunda gösterilecek bileşen
function GirisLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-light">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<GirisLoading />}>
      {children}
    </Suspense>
  );
} 