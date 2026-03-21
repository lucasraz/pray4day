import { Home, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center p-6 font-sans relative pb-24">
      {/* Bounded App Container (Mobile viewport limit) */}
      <div className="w-full max-w-md flex flex-col gap-8 h-full">
        {children}
      </div>

      {/* Floating Sticky Bottom Navbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-[#e4e2de]/40 shadow-lg p-4 flex justify-around items-center z-30">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#042418] hover:text-[#775a19] transition-all">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Início</span>
        </Link>
        <Link href="/dashboard/original-prayers" className="flex flex-col items-center gap-1 text-[#727974] hover:text-[#775a19] transition-all">
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Originais</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 text-[#727974] hover:text-[#775a19] transition-all">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </div>
    </div>
  );
}
