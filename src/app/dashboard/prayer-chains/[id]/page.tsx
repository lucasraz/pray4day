import { getPrayerChainById } from '../../../../../execution/prayer_chains_repository';
import { ChevronLeft, Clock, Calendar, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deletePrayerChainAction, joinPrayerChainAction, leavePrayerChainAction } from '../actions';
import PrayerItemAccordion from './PrayerItemAccordion';
import { createClient } from '@/lib/supabase/server';
import CommentsSection from '@/components/dashboard/CommentsSection';

const WEEKDAY_LABELS: Record<string, string> = {
  daily: 'Todos os dias',
  mon: 'Segunda', tue: 'Terça', wed: 'Quarta',
  thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo'
};

export default async function PrayerChainDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chain = await getPrayerChainById(id);

  if (!chain) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === chain.user_id;
  const hasJoined = chain.has_joined ?? false;
  const participantCount = chain.participant_count ?? 0;

  const periodicityLabel = chain.periodicity.includes('daily')
    ? 'Todos os dias'
    : chain.periodicity.map(d => WEEKDAY_LABELS[d] || d).join(', ');

  const sortedItems = (chain.prayer_chain_items || [])
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f5] pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard/prayer-chains" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-base text-[#042418] text-center leading-tight px-2 line-clamp-1">{chain.title}</span>
        {isAuthor ? (
          <form action={deletePrayerChainAction}>
            <input type="hidden" name="chainId" value={chain.id} />
            <button type="submit" className="p-2 rounded-full text-[#ba1a1a] bg-[#ffe4e4]/40 hover:bg-[#ffe4e4] transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div className="flex flex-col gap-5 p-5 max-w-md mx-auto w-full">

        {/* Info Card */}
        <div className="bg-white border border-[#e4e2de]/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase text-[#775a19] tracking-wider">{chain.category}</span>
            <h1 className="font-display font-medium text-2xl text-[#042418] mt-1 leading-tight">{chain.title}</h1>
          </div>

          {chain.purpose && (
            <p className="text-[#1b1c1a] font-sans text-sm leading-relaxed border-l-2 border-[#775a19]/30 pl-3 italic">
              {chain.purpose}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-[#e4e2de]/40">
            <div className="flex items-center gap-2 text-[#727974]">
              <Clock className="w-4 h-4 flex-shrink-0 text-[#775a19]" />
              <span className="text-sm font-sans">Orações às <strong className="text-[#042418]">{chain.execution_time.slice(0, 5)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#727974]">
              <Calendar className="w-4 h-4 flex-shrink-0 text-[#775a19]" />
              <span className="text-sm font-sans"><strong className="text-[#042418]">{periodicityLabel}</strong></span>
            </div>
            {chain.start_date && (
              <div className="flex items-center gap-2 text-[#727974]">
                <span className="text-xs font-sans">
                  De <strong className="text-[#042418]">{new Date(chain.start_date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                  {chain.end_date && <> até <strong className="text-[#042418]">{new Date(chain.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></>}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Users className="w-4 h-4 text-[#775a19]" />
              <span className="text-sm font-sans">
                <strong className="text-[#042418]">{participantCount}</strong>
                {' '}{participantCount === 1 ? 'pessoa participando' : 'pessoas participando'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Aderir / Sair */}
        {!isAuthor && (
          <form action={hasJoined ? leavePrayerChainAction : joinPrayerChainAction}>
            <input type="hidden" name="chainId" value={chain.id} />
            <button type="submit"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-sans font-bold text-sm shadow-sm active:scale-[0.98] transition-all ${
                hasJoined
                  ? 'bg-[#f0eeea] text-[#727974] border border-[#e4e2de]'
                  : 'bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white shadow-md hover:shadow-lg'
              }`}>
              <Users className="w-5 h-5" />
              {hasJoined ? 'Sair da Corrente' : 'Participar da Corrente'}
            </button>
          </form>
        )}

        {/* Lista de Orações */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs uppercase font-bold text-[#775a19] tracking-wider">Orações da Corrente</h2>

          {sortedItems.length === 0 ? (
            <p className="text-[#727974] text-sm font-sans text-center py-6">Nenhuma oração adicionada.</p>
          ) : (
            sortedItems.map((item, index) => {
              const name = item.predefined_prayers?.name || item.custom_prayer_name || 'Oração';
              const content = item.predefined_prayers?.content || item.custom_prayer_text || '';
              return (
                <PrayerItemAccordion
                  key={item.id}
                  index={index + 1}
                  name={name}
                  content={content}
                  quantity={item.quantity}
                />
              );
            })
          )}
        </div>

        {/* 📚 Comentários da Corrente */}
        <CommentsSection chainId={chain.id} />
        
      </div>
    </div>
  );
}
