import { getPrayerChains } from '../../../../execution/prayer_chains_repository';
import { ChevronLeft, Plus, Clock, Calendar, Link2, Users } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ChainSearchBar from './ChainSearchBar';

const WEEKDAY_LABELS: Record<string, string> = {
  daily: 'Todos os dias',
  mon: 'Seg', tue: 'Ter', wed: 'Qua',
  thu: 'Qui', fri: 'Sex', sat: 'Sáb', sun: 'Dom'
};

const CATEGORY_COLORS: Record<string, string> = {
  'Saúde': 'bg-[#e6f4ec] text-[#2e7d52]',
  'Família': 'bg-[#fff4e0] text-[#a0640a]',
  'Proteção': 'bg-[#f0eeff] text-[#5c3fa3]',
  'Fé': 'bg-[#fde8f0] text-[#a0195a]',
  'Gratidão': 'bg-[#e8f4fd] text-[#145a8a]',
  'Direção': 'bg-[#f0f8ec] text-[#3a6e1a]',
  'Trabalho': 'bg-[#fff8e0] text-[#8a6200]',
  'Geral': 'bg-[#f0eeea] text-[#727974]',
};

export default async function PrayerChainsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = '', cat = '' } = await searchParams;
  const allChains = await getPrayerChains();

  // Filtragem server-side
  const chains = allChains.filter(chain => {
    const query = q.toLowerCase();
    const matchesQuery = !q ||
      chain.title.toLowerCase().includes(query) ||
      (chain.purpose || '').toLowerCase().includes(query) ||
      (chain.creator_name || '').toLowerCase().includes(query);
    const matchesCategory = !cat || chain.category === cat;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f5] pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-display font-medium text-lg text-[#042418]">Correntes de Oração</span>
          <span className="text-[10px] text-[#727974] uppercase tracking-wider font-sans font-bold">
            {chains.length} encontrada{chains.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Link href="/dashboard/prayer-chains/create" className="p-2 -mr-2 rounded-xl text-[#042418] bg-[#f0eeea] hover:bg-[#e4e2de] transition-all">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex flex-col gap-4 p-5 max-w-md mx-auto w-full">

        {/* Barra de busca */}
        <Suspense>
          <ChainSearchBar currentQuery={q} currentCategory={cat} />
        </Suspense>

        {/* Lista */}
        {chains.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-10 text-center px-6">
            <div className="w-20 h-20 bg-[#f0eeea] rounded-full flex items-center justify-center">
              <Link2 className="w-9 h-9 text-[#775a19]" />
            </div>
            <h2 className="font-display text-xl font-medium text-[#042418]">
              {q || cat ? 'Nenhuma corrente encontrada' : 'Nenhuma corrente ativa'}
            </h2>
            <p className="text-[#727974] font-sans text-sm leading-relaxed">
              {q || cat
                ? 'Tente outros termos ou limpe o filtro.'
                : 'Crie uma corrente de oração e convide a comunidade a orar junto!'}
            </p>
            {!q && !cat && (
              <Link href="/dashboard/prayer-chains/create"
                className="mt-2 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
                + CRIAR CORRENTE
              </Link>
            )}
          </div>
        ) : (
          chains.map(chain => {
            const colorClass = CATEGORY_COLORS[chain.category] || CATEGORY_COLORS['Geral'];
            const periodicityLabel = chain.periodicity.includes('daily')
              ? 'Todos os dias'
              : chain.periodicity.map(d => WEEKDAY_LABELS[d] || d).join(' · ');

            const prayerNames = (chain.prayer_chain_items || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map(item => item.predefined_prayers?.name || item.custom_prayer_name || 'Oração')
              .slice(0, 3);

            return (
              <Link key={chain.id} href={`/dashboard/prayer-chains/${chain.id}`}
                className="bg-white border border-[#e4e2de]/40 rounded-3xl p-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex flex-col gap-3">

                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full self-start ${colorClass}`}>
                      {chain.category}
                    </span>
                    <h3 className="font-display font-medium text-[#042418] text-base leading-snug">{chain.title}</h3>
                    {chain.purpose && (
                      <p className="text-[#727974] font-sans text-xs leading-relaxed line-clamp-2">{chain.purpose}</p>
                    )}
                  </div>
                </div>

                {/* Criador */}
                <div className="flex items-center gap-2">
                  {chain.creator_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chain.creator_avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-[#e4e2de]/60" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">
                        {(chain.creator_name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-[#727974] font-sans">
                    Por <span className="font-bold text-[#042418]">{chain.creator_name || 'Anônimo'}</span>
                  </span>
                </div>

                {/* Orações da corrente */}
                {prayerNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {prayerNames.map((name, i) => (
                      <span key={i} className="bg-[#f5f3ef] text-[#042418] text-[11px] font-sans font-bold px-2.5 py-1 rounded-full border border-[#e4e2de]/60">
                        {name}
                      </span>
                    ))}
                    {(chain.prayer_chain_items?.length || 0) > 3 && (
                      <span className="bg-[#f5f3ef] text-[#727974] text-[11px] font-sans px-2.5 py-1 rounded-full border border-[#e4e2de]/60">
                        +{(chain.prayer_chain_items?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Info bar */}
                <div className="flex items-center gap-3 pt-1 border-t border-[#e4e2de]/30">
                  <div className="flex items-center gap-1.5 text-[#727974]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-sans">{chain.execution_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#727974]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-sans">{periodicityLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Users className="w-3.5 h-3.5 text-[#775a19]" />
                    <span className="text-xs font-sans font-bold text-[#775a19]">{chain.participant_count ?? 0}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
