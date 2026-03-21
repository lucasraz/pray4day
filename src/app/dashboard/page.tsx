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
  BookOpen
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[url('/images/bg-sunset.png')] bg-cover bg-center flex flex-col items-center p-4 relative overflow-hidden">
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

      {/* Main App Container (Mobile or scaled constraint for vibe) */}
      <div className="w-full max-w-md bg-stone-50/70 backdrop-blur-lg border border-white/40 rounded-[2.5rem] shadow-2xl p-6 flex flex-col gap-6 z-10 transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center text-amber-950">
          <Menu className="w-6 h-6 hover:text-amber-800 cursor-pointer" />
          <div className="flex items-center gap-1">
            <Heart className="w-5 h-5 text-amber-600" />
            <span className="font-serif text-xl font-bold">Ore Hoje</span>
          </div>
          <Search className="w-6 h-6 hover:text-amber-800 cursor-pointer" />
        </div>

        {/* Greetings */}
        <div className="text-center text-stone-700">
          <span className="text-sm">Bem-vinda(o)!</span>
        </div>

        {/* Card: Oração do Dia */}
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-lg font-bold text-amber-950 px-1">Oração do Dia</h2>
          <span className="text-xs text-stone-600 px-1 -mt-1">Deus quer falar com você hoje</span>
          
          <Link href="/dashboard/prayer/1" className="group">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-white/30 cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]">
              <Image 
                src="/images/bg-cross-sunset.png" 
                alt="Oração do dia" 
                fill 
                className="object-cover"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              
              {/* Text Context inside banner */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-2xl font-serif">Confie no Senhor</h3>
                <p className="text-white/80 text-xs mt-1">"O que confia no Senhor é como o monte de Sião..."</p>
              </div>
            </div>

            <div className="w-full mt-3 bg-white/90 hover:bg-white text-amber-950 font-semibold py-4 rounded-full shadow-sm flex items-center justify-center gap-2 border border-white/50 transition-all duration-300">
              <Play className="w-4 h-4 fill-amber-950 text-amber-950" /> OUVIR ORAÇÃO
            </div>
          </Link>
        </div>

        {/* Category Row: Temas */}
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-md font-bold text-amber-950 px-1">Orações por Temas</h2>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: CloudRain, label: 'Ansiedade' },
              { icon: Users, label: 'Família' },
              { icon: Sparkles, label: 'Prosperidade' },
              { icon: ShieldAlert, label: 'Provação' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/30 group-hover:bg-white/80 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-amber-700" />
                </div>
                <span className="text-stone-700 text-[11px] font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Card: Versículo do Dia */}
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-white/80 transition-all duration-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-stone-800 text-sm font-bold">Versículo do Dia</span>
              <span className="text-stone-500 text-xs">Receber mensagem de Deus</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </div>

      </div>
    </div>
  )
}
