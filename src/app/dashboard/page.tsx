import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Heart, 
  Search, 
  Play, 
  CloudRain, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  BookOpen,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPrayers } from '../../../execution/prayers_repository'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const prayers = await getPrayers()
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

  // Use the first prayer fetched as Oração do Dia, or fallback to mock
  const dailyPrayer = prayers[0] || {
    id: "1",
    title: "Confie no Senhor",
    content: '"O que confia no Senhor é como o monte de Sião..."',
  }

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header - com Avatar e Nome */}
      <div className="flex justify-between items-center bg-[#fbf9f5]/90 backdrop-blur-md sticky top-0 px-5 pt-5 pb-4 z-20 border-b border-[#c1c8c2]/10">
        
        {/* Avatar do usuário com link para o perfil */}
        <Link href="/dashboard/profile" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full overflow-hidden border border-[#e4e2de]/60 shadow-sm group-hover:scale-105 transition-all flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] uppercase text-[#727974] font-sans font-bold tracking-wider">Bem-vindo(a)</span>
            <span className="text-sm font-sans font-bold text-[#042418] leading-tight max-w-[100px] truncate">{displayName}</span>
          </div>
        </Link>

        {/* Logo central */}
        <div className="flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-[#042418] text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>spa</span>
          <span className="text-xl font-['Newsreader',serif] font-medium italic text-[#1b3a2c] tracking-tight leading-none">Pray for Day</span>
        </div>

        <Search className="w-6 h-6 text-[#1b1c1a] hover:text-[#727974] cursor-pointer" />
      </div>

      <div className="flex flex-col gap-8 px-6 pt-6">

        {/* Hero Card: Oração do Dia (The "Stone & Gold" Style) */}
        <div className="flex flex-col gap-5">
          <h2 className="font-['Newsreader',serif] text-3xl font-light tracking-tight text-[#042418] text-center w-full">Oração do Dia</h2>
          
          <Link href={`/dashboard/prayer/${dailyPrayer.id}`} className="group">
            <div className="relative w-full aspect-[4/4] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 border border-[#e4e2de]/50">
              <Image 
                src="/images/bg-cross-sunset.png" 
                alt="Oração do dia" 
                fill 
                className="object-cover"
              />
              {/* Soft overlay using ambient shadow guidelines, no pure blacks */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#042418]/80 via-[#042418]/20 to-[#042418]/5" />
              
              {/* Text context placed with intentional asymmetry or simple spacing */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-8">
                <h3 className="text-[#ffffff] font-['Newsreader',serif] text-3xl italic tracking-tight leading-tight">
                  {dailyPrayer.title}
                </h3>
                <p className="text-[#ffffff]/80 font-['Manrope',sans-serif] text-sm mt-2 line-clamp-2 leading-relaxed font-medium">
                  {dailyPrayer.content}
                </p>
              </div>
            </div>

            {/* CTA Button: Dark green botanical overlay */}
            <div className="w-full mt-5 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-[#ffdea5] font-['Manrope',sans-serif] text-xs font-bold uppercase tracking-[0.2em] py-5 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all">
              <Play className="w-4 h-4" fill="currentColor" /> <span>OUVIR ORAÇÃO</span>
            </div>
          </Link>
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

        {/* Bottom Card: Versículo do Dia (The Digital Sanctuary stacking card) */}
        <div className="bg-[#ffffff] border border-[#c1c8c2]/20 rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 mt-4 mb-6">
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
