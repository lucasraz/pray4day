import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Heart, 
  Search, 
  Menu, 
  Play, 
  CloudRain, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  BookOpen,
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getPrayers } from '../../../execution/prayers_repository'

import { logout } from '@/app/login/actions'

export default async function DashboardPage() {
  const prayers = await getPrayers()
  
  // Use the first prayer fetched as Oração do Dia, or fallback to mock
  const dailyPrayer = prayers[0] || {
    id: "1",
    title: "Confie no Senhor",
    content: '"O que confia no Senhor é como o monte de Sião..."',
  }

  return (
    <>
      {/* Header - Transparent Backdrop style */}
      <div className="flex justify-between items-center bg-[#fbf9f5]/80 backdrop-blur-md sticky top-0 py-2 z-20">
        <form action={logout}>
          <button type="submit" className="text-[#1b1c1a] hover:text-[#727974] cursor-pointer flex items-center">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
        <div className="flex items-center gap-1">
          <Heart className="w-5 h-5 text-[#775a19]" /> {/* Gold Leaf Accent */}
          <span className="text-xl font-display font-medium text-[#042418]">Ore Hoje</span>
        </div>
        <Search className="w-6 h-6 text-[#1b1c1a] hover:text-[#727974] cursor-pointer" />
      </div>

      {/* Greetings - Small and Editorial Accent */}
      <div className="text-center font-sans tracking-wide">
        <span className="text-xs uppercase text-[#775a19] font-bold">Bem-vinda(o)!</span>
      </div>

      {/* Hero Card: Oração do Dia (The "Stone & Gold" Style) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-display font-display text-2xl text-[#042418] text-center w-full">Oração do Dia</h2>
        
        <Link href={`/dashboard/prayer/${dailyPrayer.id}`} className="group">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300">
            <Image 
              src="/images/bg-cross-sunset.png" 
              alt="Oração do dia" 
              fill 
              className="object-cover"
            />
            {/* Soft overlay using ambient shadow guidelines, no pure blacks */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#042418]/60 via-[#042418]/10 to-transparent" />
            
            {/* Text context placed with intentional asymmetry or simple spacing */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="text-white font-display text-2xl italic">
                {dailyPrayer.title}
              </h3>
              <p className="text-white/80 font-sans text-xs mt-1 truncate">
                {dailyPrayer.content.substring(0, 70)}...
              </p>
            </div>
          </div>

          {/* CTA Button: Dark green botanical overlay */}
          <div className="w-full mt-4 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans text-sm font-bold py-4 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all">
            <Play className="w-4 h-4 fill-white text-white" /> OUVIR ORAÇÃO
          </div>
        </Link>
      </div>

      {/* Category Row: Temas (Paper nesting cards) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-md font-display font-bold text-[#042418] text-center w-full">Orações por Temas</h2>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { Icon: CloudRain, label: 'Ansiedade' },
            { Icon: Users, label: 'Família' },
            { Icon: Sparkles, label: 'Prosperidade' },
            { Icon: ShieldAlert, label: 'Provação' }
          ].map(({ Icon, label }, index) => (
            <div key={index} className="flex flex-col items-center gap-1 group cursor-pointer transition-all">
              <div className="w-14 h-14 rounded-2xl border border-[#e4e2de]/40 bg-[#f5f3ef] shadow-sm group-hover:bg-[#e4e2de]/20 transition-all duration-300 flex items-center justify-center relative">
                <Icon className="w-6 h-6 text-[#775a19] transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[#1b1c1a] text-[11px] font-bold mt-1 font-sans">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Card: Versículo do Dia (The Digital Sanctuary stacking card) */}
      <div className="bg-[#ffffff] border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="bg-[#f0eeea] p-2.5 rounded-xl">
            <BookOpen className="w-5 h-5 text-[#775a19]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#042418] text-sm font-display font-medium">Versículo do Dia</span>
            <span className="text-[#727974] text-xs font-sans">Receber mensagem de Deus</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#727974]" />
      </div>
    </>
  )
}
