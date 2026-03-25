'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 1200);
    const unmountTimer = setTimeout(() => setIsVisible(false), 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className={`fixed inset-0 bg-[#fbf9f5] z-[9999] flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out ${
        isFading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="p-5 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-3xl shadow-2xl animate-scaleIn flex items-center justify-center">
            <span className="material-symbols-outlined text-[#ffdea5] text-4xl leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 40" }}>spa</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-['Newsreader',serif] text-4xl font-medium text-[#042418] tracking-tight">
              Pray for Day
            </h1>
            <p className="text-[#a0a5a2] font-sans text-xs tracking-wider uppercase font-bold">
              Seu refúgio diário de fé
            </p>
          </div>
          <div className="mt-8 flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#775a19] animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#775a19] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#775a19] animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
    </>
  );
}
