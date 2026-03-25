import { getOriginalPrayers } from '../../../../execution/original_prayers_repository';
import { Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { likePrayerAction } from './actions';
import PrayerCardFeed from './PrayerCardFeed';
import PrayerFilters from './PrayerFilters';

export default async function OriginalPrayersPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; keyword?: string; sort?: string; hasAudio?: string; hasVideo?: string }>;
}) {
  const { theme = '', keyword = '', sort = '', hasAudio = '', hasVideo = '' } = await searchParams;

  // Buscar dados com filtros aplicados via URL query strings
  const prayers = await getOriginalPrayers({ theme, keyword, sort, hasAudio, hasVideo });

  return (
    <div className="flex flex-col min-h-full pb-32">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#fbf9f5]/90 backdrop-blur-md sticky top-0 px-6 pt-6 pb-4 z-20 border-b border-[#c1c8c2]/10">
        <h1 className="text-2xl font-['Newsreader',serif] font-medium text-[#042418] tracking-tight">Orações Originais</h1>
        <div className="bg-[#f5f3ef] p-2 rounded-xl">
          <Heart className="w-5 h-5 text-[#775a19]" />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 pt-5 flex-1">
        {/* Filtros Inteligentes (Client Component) */}
        <Suspense>
          <PrayerFilters 
            currentTheme={theme} 
            currentKeyword={keyword} 
            currentSort={sort} 
            hasAudio={hasAudio}
            hasVideo={hasVideo}
          />
        </Suspense>

        {/* Prayers Feed Scroll area */}
        <div className="flex flex-col gap-5 flex-1 mt-1">
          {prayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-16 h-16 bg-[#f0eeea] rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-[#775a19]" />
              </div>
              <p className="text-[#727974] font-sans text-sm">
                {keyword || theme || sort === 'mine'
                  ? 'Nenhuma oração encontrada. Tente outros filtros!'
                  : 'Nenhuma oração encontrada. Seja o primeiro a criar!'}
              </p>
            </div>
          ) : (
            <PrayerCardFeed prayers={prayers} likeAction={likePrayerAction} />
          )}
        </div>

        {/* Floating Create Action */}
        <Link href="/dashboard/original-prayers/create" className="fixed bottom-28 right-8 w-14 h-14 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-95 z-20">
          <Plus className="w-6 h-6 text-[#ffdea5]" />
        </Link>
      </div>
    </div>
  );
}
