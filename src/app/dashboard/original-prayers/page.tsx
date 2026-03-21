import { getOriginalPrayers } from '../../../../execution/original_prayers_repository';
import { Heart, MessageSquare, Play, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { likePrayerAction } from './actions';

export default async function OriginalPrayersPage({
  searchParams,
}: {
  searchParams: { theme?: string; keyword?: string };
}) {
  const theme = searchParams.theme || '';
  const keyword = searchParams.keyword || '';

  // Buscar dados com filtros aplicados via URL query strings
  const prayers = await getOriginalPrayers({ theme, keyword });

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center bg-[#fbf9f5]/80 backdrop-blur-md sticky top-0 py-2 z-20">
        <h1 className="text-xl font-display font-medium text-[#042418]">Orações Originais</h1>
        <div className="bg-[#f0eeea] p-2 rounded-xl">
          <Search className="w-5 h-5 text-[#727974]" />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 [&::-webkit-scrollbar]:hidden">
        {['Todos', 'Ansiedade', 'Família', 'Prosperidade', 'Provação'].map((item) => {
          const isSelected = (!theme && item === 'Todos') || theme === item;
          return (
            <Link
              key={item}
              href={`/dashboard/original-prayers${item === 'Todos' ? '' : `?theme=${item}`}`}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-[#fed488] border-[#fed488] text-[#1b1c1a]'
                  : 'bg-[#f5f3ef] border-[#e4e2de]/40 text-[#727974]'
              }`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      {/* Prayers Feed Scroll area */}
      <div className="flex flex-col gap-4 flex-1">
        {prayers.length === 0 ? (
          <div className="text-center py-12 text-[#727974] font-sans text-sm">
            Nenhuma oração encontrada. Seja o primeiro a criar!
          </div>
        ) : (
          prayers.map((prayer) => (
            <div key={prayer.id} className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              {/* Top Details */}
              <div className="flex justify-between items-start">
                <Link href={`/dashboard/original-prayers/${prayer.id}`} className="group-hover:opacity-80 transition-opacity">
                  <span className="text-[10px] uppercase font-bold text-[#775a19] tracking-wide">{prayer.theme}</span>
                  <h3 className="text-display font-display font-medium text-lg text-[#042418] group-hover:underline underline-offset-4 decoration-[#775a19]/40">{prayer.title}</h3>
                </Link>
                {prayer.audio_url && (
                  <div className="w-8 h-8 rounded-full bg-[#042418] flex items-center justify-center cursor-pointer shadow-md">
                    <Play className="w-3 h-3 fill-white text-white translate-x-[1px]" />
                  </div>
                )}
              </div>

              {/* Text Context Content */}
              <Link href={`/dashboard/original-prayers/${prayer.id}`} className="group-hover:opacity-80 transition-opacity">
                <p className="text-[#1b1c1a] font-sans text-sm leading-relaxed line-clamp-3">
                  {prayer.content}
                </p>
              </Link>

              {/* Bottom Actions Footer */}
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-[#e4e2de]/30">
                <form action={likePrayerAction}>
                  <input type="hidden" name="prayerId" value={prayer.id} />
                  <button type="submit" className="flex items-center gap-1.5 text-[#727974] hover:text-[#ba1a1a] transition-all">
                    <Heart className={`w-4 h-4 ${prayer.has_liked ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
                    <span className="text-xs font-bold">{prayer.likes_count || 0}</span>
                  </button>
                </form>

                <button className="flex items-center gap-1.5 text-[#727974] hover:text-[#042418] transition-all">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold">Ouvir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Create Action absolute inside children viewport bounds */}
      <Link href="/dashboard/original-prayers/create" className="fixed bottom-28 right-8 w-14 h-14 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-95 z-20">
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </>
  );
}
