import { getOriginalPrayers } from '../../../../execution/original_prayers_repository';
import { Heart, MessageSquare, Play, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { likePrayerAction } from './actions';
import PrayerCardFeed from './PrayerCardFeed';

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
    <div className="flex flex-col min-h-full pb-32">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#fbf9f5]/90 backdrop-blur-md sticky top-0 px-6 pt-6 pb-4 z-20 border-b border-[#c1c8c2]/10">
        <h1 className="text-2xl font-['Newsreader',serif] font-medium text-[#042418] tracking-tight">Orações Originais</h1>
        <div className="bg-[#f5f3ef] p-2 rounded-xl">
          <Heart className="w-5 h-5 text-[#775a19]" />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 pt-6 flex-1">
        {/* Filters & Search Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden w-[calc(100%+3rem)]">
          <form action="/dashboard/original-prayers" method="GET" className="flex-shrink-0 flex items-center bg-white border border-[#e4e2de]/80 rounded-full px-3 py-1.5 shadow-sm">
            <Search className="w-3.5 h-3.5 text-[#775a19]" />
            <input 
              type="text" 
              name="theme" 
              defaultValue={theme !== 'Todos' ? theme : ''} 
              placeholder="Buscar tema..." 
              className="w-[5.5rem] bg-transparent outline-none ml-2 text-xs font-sans font-bold text-[#1b1c1a] placeholder:text-[#727974] transition-all focus:w-[8rem]"
            />
          </form>

          {['Todos', 'Emoções', 'Direção', 'Relacionamentos', 'Trabalho', 'Saúde', 'Fé', 'Proteção', 'Gratidão', 'Dia a dia'].map((item) => {
            const isSelected = (!theme && item === 'Todos') || theme.toLowerCase() === item.toLowerCase();
            return (
              <Link
                key={item}
                href={`/dashboard/original-prayers${item === 'Todos' ? '' : `?theme=${encodeURIComponent(item)}`}`}
                className={`py-1.5 px-4 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#042418] border-[#042418] text-[#ffdea5] shadow-md'
                    : 'bg-[#f5f3ef] border-[#e4e2de]/60 text-[#727974] hover:bg-[#e4e2de]/40'
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        {/* Prayers Feed Scroll area */}
        <div className="flex flex-col gap-5 flex-1 mt-2">
        {prayers.length === 0 ? (
          <div className="text-center py-12 text-[#727974] font-sans text-sm">
            Nenhuma oração encontrada. Seja o primeiro a criar!
          </div>
        ) : (
          <PrayerCardFeed prayers={prayers} likeAction={likePrayerAction} />
        )}
      </div>

      {/* Floating Add Create Action absolute inside children viewport bounds */}
      <Link href="/dashboard/original-prayers/create" className="fixed bottom-28 right-8 w-14 h-14 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-95 z-20">
        <Plus className="w-6 h-6 text-[#ffdea5]" />
      </Link>
      </div>
    </div>
  );
}
