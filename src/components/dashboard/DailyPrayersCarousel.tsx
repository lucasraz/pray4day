'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Feather, ChevronLeft, ChevronRight } from 'lucide-react';
import { OriginalPrayer } from '../../../execution/original_prayers_repository';

interface DailyPrayersCarouselProps {
  prayers: OriginalPrayer[];
}

export default function DailyPrayersCarousel({ prayers }: DailyPrayersCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const nextSlide = () => {
    if (activeIndex < prayers.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const prevSlide = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {prayers.map((prayer, index) => (
          <div 
            key={prayer.id} 
            className="group snap-center shrink-0 w-full flex flex-col"
          >
            <div className="relative w-full aspect-[4/4] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#e4e2de]/50 bg-[#042418]">
              {prayer.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prayer.image_url}
                  alt={prayer.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-50"
                />
              ) : (
                <Image
                  src="/images/bg-cross-sunset.png"
                  alt="Oração do dia"
                  fill
                  className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-50"
                />
              )}
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#042418]/85 via-[#042418]/25 to-transparent" />

              {/* Badge de tema */}
              <div className="absolute top-5 left-5">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20">
                  {prayer.theme}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-7">
                <h3 className="text-white font-['Newsreader',serif] text-2xl italic tracking-tight leading-tight line-clamp-2">
                  {prayer.title}
                </h3>
                <p className="text-white/75 font-sans text-sm mt-2 line-clamp-2 leading-relaxed">
                  {prayer.content}
                </p>
                {/* Likes */}
                {(prayer.likes_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <Heart className="w-3.5 h-3.5 text-[#ffdea5]" fill="#ffdea5" />
                    <span className="text-[#ffdea5] text-xs font-sans font-bold">{prayer.likes_count}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CTA Button Estático */}
      <Link 
        href={`/dashboard/original-prayers/${prayers[activeIndex]?.id}`} 
        className="w-full mt-4 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-[#ffdea5] font-sans text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Feather className="w-4 h-4" /> <span>LER ORAÇÃO</span>
      </Link>

      {/* Setas de Navegação (Flutuantes) */}
      {prayers.length > 1 && (
        <>
          {activeIndex > 0 && (
            <button 
              onClick={prevSlide}
              className="absolute left-2 top-[calc(50%-44px)] -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-all z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {activeIndex < prayers.length - 1 && (
            <button 
              onClick={nextSlide}
              className="absolute right-2 top-[calc(50%-44px)] -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-all z-10"
              aria-label="Próxima"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}

      {/* Paginação (Bolinhas) */}
      {prayers.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {prayers.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? 'w-4 bg-[#042418]' 
                  : 'w-1.5 bg-[#042418]/30'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
