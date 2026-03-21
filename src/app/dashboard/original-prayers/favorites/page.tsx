import { getFavoritePrayers } from '../../../../../execution/original_prayers_repository';
import { Heart, Play, Navigation, ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { likePrayerAction, favoritePrayerAction } from '../actions';

export default async function FavoritePrayersPage() {
  const prayers = await getFavoritePrayers();

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header Modal-like */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard/profile" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-lg text-[#042418]">Meus Favoritos</span>
        <div className="w-10"></div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#e4e2de]/60 shadow-sm">
           <div className="bg-[#f0eeea] p-3 rounded-full">
             <Star className="w-5 h-5 text-[#775a19]" />
           </div>
           <div className="flex flex-col">
             <span className="text-[#042418] font-sans font-bold text-sm">Biblioteca Pessoal</span>
             <span className="text-[#727974] font-sans text-xs">Exclusivo: Guarde suas preces guiadas preferidas.</span>
           </div>
        </div>

        {/* Favorite Prayers List */}
        <div className="flex flex-col gap-4">
          {prayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white/50 border border-[#e4e2de]/40 rounded-2xl text-center gap-3">
              <Star className="w-8 h-8 text-[#e4e2de]" />
              <p className="text-[#727974] font-sans text-sm">Sua biblioteca está vazia. Comece a explorar e salvar suas orações guiadas favoritas!</p>
              <Link href="/dashboard/original-prayers" className="mt-2 text-[#775a19] text-sm font-bold underline">
                Explorar Feed
              </Link>
            </div>
          ) : (
            prayers.map((prayer: any) => (
              <div 
                key={prayer.id} 
                className="bg-white border border-[#e4e2de]/60 shadow-sm rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Header: Theme and Play Button */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase font-bold text-[#775a19] tracking-wider">{prayer.theme}</span>
                  {prayer.audio_url && (
                    <Link href={`/dashboard/original-prayers/${prayer.id}`} className="w-8 h-8 rounded-full bg-[#042418] flex items-center justify-center cursor-pointer shadow-md">
                      <Play className="w-3 h-3 fill-white text-white translate-x-[1px]" />
                    </Link>
                  )}
                </div>

                {/* Content */}
                <Link href={`/dashboard/original-prayers/${prayer.id}`}>
                  <h2 className="text-display font-display font-medium text-xl text-[#042418] mb-2">{prayer.title}</h2>
                </Link>
                <Link href={`/dashboard/original-prayers/${prayer.id}`}>
                  <p className="text-[#727974] font-sans text-sm line-clamp-3 leading-relaxed italic">
                    {prayer.content}
                  </p>
                </Link>

                {/* Footer Actions */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#e4e2de]/40">
                  <form action={likePrayerAction} className="flex gap-2">
                    <input type="hidden" name="prayerId" value={prayer.id} />
                    <button type="submit" className="flex items-center gap-1.5 focus:outline-none group">
                       <Heart className={`w-4 h-4 transition-all ${prayer.has_liked ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#727974] group-hover:text-[#ba1a1a]'}`} />
                       <span className={`text-xs font-sans font-bold ${prayer.has_liked ? 'text-[#ba1a1a]' : 'text-[#727974]'}`}>
                         {prayer.likes_count || 0}
                       </span>
                    </button>
                  </form>

                  <div className="flex gap-2">
                    <form action={favoritePrayerAction}>
                       <input type="hidden" name="prayerId" value={prayer.id} />
                       <button type="submit" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all bg-[#ffe4e4] border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ffcdcd]">
                         <Star className="w-3.5 h-3.5 fill-[#ba1a1a]" />
                         Remover
                       </button>
                    </form>
                    <Link href={`/dashboard/original-prayers/${prayer.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eeea] text-[#042418] font-sans text-[10px] font-bold hover:bg-[#e4e2de] transition-all">
                      <Navigation className="w-3 h-3" /> Abrir
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
