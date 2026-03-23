import { Card, CardContent } from '@/components/ui/card'
import { 
  Heart, 
  Play, 
  CloudRain, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  BookOpen,
  User,
  Link2,
  Feather,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getDailyPrayer } from '../../../execution/original_prayers_repository'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca perfil para nome e avatar
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('social_name, faith_name, avatar_url, display_name_preference')
    .eq('id', user.id)
    .single() : { data: null };

  const displayPref = profile?.display_name_preference || 'social';
  const displayName = displayPref === 'faith' && profile?.faith_name
    ? profile.faith_name
    : profile?.social_name || user?.user_metadata?.first_name || 'Amigo(a) Fiel';

  // Oração do Dia: seleção determinística por usuário e data
  const dailyPrayer = user ? await getDailyPrayer(user.id) : null;

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header em duas fileiras */}
      <div className="bg-[#fbf9f5]/95 backdrop-blur-md sticky top-0 z-20 border-b border-[#c1c8c2]/10 shadow-sm">
        
        {/* Fileira 1: Logo centralizada */}
        <div className="flex items-center justify-center px-5 pt-4 pb-1">
          <div className="flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[#042418] text-xl leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>spa</span>
            <span className="text-[1.25rem] font-['Newsreader',serif] font-medium italic text-[#1b3a2c] tracking-tight leading-none">Pray for Day</span>
          </div>
        </div>

        {/* Fileira 2: Saudação centralizada */}
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 px-5 pb-3 pt-1 group">
          <div className="w-7 h-7 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full overflow-hidden border border-[#e4e2de]/60 shadow-sm group-hover:scale-105 transition-all flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <span className="text-[9px] uppercase text-[#727974] font-sans font-bold tracking-widest leading-none">Bem-vindo(a)</span>
          <span className="text-sm font-sans font-bold text-[#042418] leading-none truncate max-w-[200px]">{displayName}</span>
        </Link>

      </div>

      <div className="flex flex-col gap-8 px-6 pt-6">

        {/* Hero Card: Oração do Dia */}
        <div className="flex flex-col gap-5">
          <h2 className="font-['Newsreader',serif] text-3xl font-light tracking-tight text-[#042418] text-center w-full">Oração do Dia</h2>
          
          {dailyPrayer ? (
            <Link href={`/dashboard/prayers/${dailyPrayer.id}`} className="group">
              <div className="relative w-full aspect-[4/4] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 border border-[#e4e2de]/50">
                {/* Imagem da oração (se existir) ou fallback */}
                {dailyPrayer.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dailyPrayer.image_url}
                    alt={dailyPrayer.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/images/bg-cross-sunset.png"
                    alt="Oração do dia"
                    fill
                    className="object-cover"
                  />
                )}
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#042418]/85 via-[#042418]/25 to-transparent" />

                {/* Badge de tema */}
                <div className="absolute top-5 left-5">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20">
                    {dailyPrayer.theme}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-7">
                  <h3 className="text-white font-['Newsreader',serif] text-3xl italic tracking-tight leading-tight">
                    {dailyPrayer.title}
                  </h3>
                  <p className="text-white/75 font-sans text-sm mt-2 line-clamp-2 leading-relaxed">
                    {dailyPrayer.content}
                  </p>
                  {/* Likes */}
                  {(dailyPrayer.likes_count ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Heart className="w-3.5 h-3.5 text-[#ffdea5]" fill="#ffdea5" />
                      <span className="text-[#ffdea5] text-xs font-sans font-bold">{dailyPrayer.likes_count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="w-full mt-4 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-[#ffdea5] font-sans text-xs font-bold uppercase tracking-[0.2em] py-5 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <Feather className="w-4 h-4" /> <span>LER ORAÇÃO COMPLETA</span>
              </div>
            </Link>
          ) : (
            /* Estado vazio: ainda sem orações cadastradas */
            <div className="relative w-full aspect-[4/4] rounded-[2rem] overflow-hidden shadow-sm border border-[#e4e2de]/50 flex flex-col items-center justify-center gap-4 bg-[#f5f3ef]">
              <BookOpen className="w-10 h-10 text-[#c1b89a]" />
              <div className="text-center px-8">
                <p className="font-['Newsreader',serif] text-xl text-[#042418]">Ainda sem orações</p>
                <p className="text-[#727974] text-sm font-sans mt-1">Seja o primeiro a compartilhar uma oração com a comunidade!</p>
              </div>
              <Link href="/dashboard/prayers/create"
                className="bg-[#042418] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full mt-2 hover:bg-[#1b3a2c] transition-all">
                + Criar Oração
              </Link>
            </div>
          )}
        </div>

        {/* Category Row: Temas (Paper nesting cards) */}
        <div className="flex flex-col gap-5 mt-2">
          <h2 className="text-lg font-['Newsreader',serif] font-medium text-[#042418] text-center w-full">Orações por Temas</h2>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { Icon: CloudRain, label: 'Ansiedade' },
              { Icon: Users, label: 'Família' },
              { Icon: Sparkles, label: 'Prosperidade' },
              { Icon: ShieldAlert, label: 'Provação' }
            ].map(({ Icon, label }, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer transition-all">
                <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-[#c1c8c2]/20 bg-[#f5f3ef] shadow-sm group-hover:bg-[#ffffff] transition-all duration-300 flex items-center justify-center relative">
                  <Icon className="w-6 h-6 text-[#775a19] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[#424844] text-[10px] font-bold font-['Manrope',sans-serif] uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Correntes de Oração */}
        <Link href="/dashboard/prayer-chains" className="bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <Link2 className="w-5 h-5 text-[#ffdea5]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-white text-base font-['Newsreader',serif] font-medium leading-none">Correntes de Oração</span>
              <span className="text-white/60 text-[11px] font-['Manrope',sans-serif] font-semibold uppercase tracking-wider">Ore junto com a comunidade</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </Link>

        {/* Bottom Card: Versículo do Dia */}
        <div className="bg-[#ffffff] border border-[#c1c8c2]/20 rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#f5f3ef] p-3 rounded-xl">
              <BookOpen className="w-5 h-5 text-[#775a19]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#042418] text-base font-['Newsreader',serif] font-medium leading-none">Versículo do Dia</span>
              <span className="text-[#727974] text-[11px] font-['Manrope',sans-serif] font-semibold uppercase tracking-wider">Receber mensagem</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#c1c8c2]" />
        </div>
      </div>
    </div>
  )
}
