import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ChevronLeft, 
  Play, 
  Heart, 
  Share2 
} from 'lucide-react'
import Link from 'next/link'

interface PrayerDetailPageProps {
  params: {
    id: string
  }
}

export default function PrayerDetailPage({ params }: PrayerDetailPageProps) {
  return (
    <div className="min-h-screen bg-[url('/images/bg-sunset.png')] bg-cover bg-center flex flex-col items-center p-4 relative overflow-hidden">
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

      {/* Main App Container */}
      <div className="w-full max-w-md bg-stone-50/70 backdrop-blur-lg border border-white/40 rounded-[2.5rem] shadow-2xl p-6 flex flex-col gap-6 z-10">
        
        {/* Header with Back button */}
        <div className="flex justify-between items-center text-amber-950">
          <Link href="/dashboard" className="p-2 hover:bg-white/30 rounded-full transition-all">
            <ChevronLeft className="w-6 h-6 text-amber-950" />
          </Link>
          <span className="font-serif text-lg font-bold">Oração de Hoje</span>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* content Card */}
        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/30 flex-1 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
          
          <h1 className="font-serif text-2xl font-bold text-amber-950">
            Confie no Senhor
          </h1>
          
          <div className="w-12 h-[1px] bg-amber-700/30" />

          {/* Prayer Text */}
          <p className="text-stone-800 text-md leading-relaxed font-medium px-2 max-w-sm italic">
            "Senhor, eu entrego minhas preocupações em Tuas mãos. Me ajuda a confiar no Teu plano e dá paz ao meu coração. Sei que Tu estás comigo em todo tempo."
          </p>

          <span className="font-serif font-bold text-amber-900 text-lg">Amém.</span>

          {/* Audio Button */}
          <button className="w-full mt-6 bg-white/90 hover:bg-white text-amber-950 font-semibold py-5 rounded-full shadow-md flex items-center justify-center gap-3 border border-white/60 transition-all duration-300 transform hover:scale-[1.02]">
            <Play className="w-5 h-5 fill-amber-950 text-amber-950" /> OUVIR ORAÇÃO
          </button>
        </div>

        {/* Bottom Actions Row */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button className="bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-2xl py-4 flex items-center justify-center gap-2 border border-white/30 text-stone-800 font-bold shadow-sm transition-all duration-300">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Favoritar
          </button>
          <button className="bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-2xl py-4 flex items-center justify-center gap-2 border border-white/30 text-stone-800 font-bold shadow-sm transition-all duration-300">
            <Share2 className="w-5 h-5 text-amber-700" /> Compartilhar
          </button>
        </div>

      </div>
    </div>
  )
}
