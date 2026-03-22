import { Home, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#fbf9f5] flex flex-col items-center font-['Manrope',sans-serif] relative overflow-hidden w-full">
      {/* Bounded App Container (Mobile viewport limit) */}
      <div className="w-full max-w-md flex flex-col h-full relative text-[#1b1c1a] bg-[#fbf9f5] min-h-[100dvh]">
        {children}
      </div>

      {/* Floating Sticky Bottom Navbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-[#ffffff]/90 backdrop-blur-xl rounded-full border border-[#c1c8c2]/20 shadow-xl p-4 flex justify-around items-center z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#042418] hover:text-[#775a19] transition-all">
          <Home className="w-6 h-6" />
        </Link>
        <Link href="/dashboard/original-prayers" className="flex flex-col items-center gap-1 text-[#727974] hover:text-[#775a19] transition-all">
          <Heart className="w-6 h-6" />
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 text-[#727974] hover:text-[#775a19] transition-all">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
