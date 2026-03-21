import { createPrayerAction } from '../actions';
import { ChevronLeft, Lock, Youtube, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AudioRecorder from '@/components/ui/AudioRecorder';
import { getUserPrayerLimits } from '../../../../../execution/original_prayers_repository';

export default async function CreateOriginalPrayerPage() {
  const limits = await getUserPrayerLimits();

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header Modal-like */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard/original-prayers" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-lg text-[#042418]">Criar Oração</span>
        <div className="w-10"></div> {/* Placeholder to center the Title */}
      </div>

      {/* Form Content */}
      <div className="p-6 flex-1 flex flex-col gap-6 w-full max-w-md mx-auto">
        <form action={createPrayerAction} className="flex flex-col gap-6 w-full">
          
          {/* Status Bar */}
          <div className="bg-[#f0eeea] rounded-xl p-3 flex justify-between items-center px-4 border border-[#e4e2de]/60">
            <span className="text-xs font-sans font-bold text-[#727974] uppercase tracking-wider">Orações Criadas</span>
            <span className={`text-sm font-bold ${limits.canCreate ? 'text-[#042418]' : 'text-[#ba1a1a]'}`}>
              {limits.count} / {limits.maxLimit}
            </span>
          </div>

          {/* Title input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-sans font-bold text-[#042418]">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ex: Oração para Paz Interior"
              required
              disabled={!limits.canCreate}
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] placeholder:text-[#727974] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all disabled:opacity-50"
            />
          </div>

          {/* Theme select */}
          <div className="flex flex-col gap-2">
            <label htmlFor="theme" className="text-sm font-sans font-bold text-[#042418]">
              Tema
            </label>
            <select
              id="theme"
              name="theme"
              required
              defaultValue=""
              disabled={!limits.canCreate}
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all appearance-none disabled:opacity-50"
            >
              <option value="" disabled className="text-[#727974]">Selecione um tema...</option>
              <option value="Ansiedade">Ansiedade</option>
              <option value="Família">Família</option>
              <option value="Prosperidade">Prosperidade</option>
              <option value="Provação">Provação</option>
            </select>
          </div>

          {/* Content textarea */}
          <div className="flex flex-col gap-2">
            <label htmlFor="content" className="text-sm font-sans font-bold text-[#042418]">
              Sua Oração
            </label>
            <textarea
              id="content"
              name="content"
              rows={5}
              placeholder="Escreva as palavras do seu coração..."
              required
              disabled={!limits.canCreate}
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] placeholder:text-[#727974] resize-none focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all disabled:opacity-50"
            ></textarea>
          </div>

          {!limits.canCreate ? (
            /* Premium Banner (Paywall Block) */
            <div className="bg-gradient-to-br from-[#1b3a2c] to-[#042418] rounded-2xl p-6 mt-4 shadow-lg text-center flex flex-col gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
               <Sparkles className="w-8 h-8 text-[#775a19] self-center" />
               <div className="flex flex-col gap-1">
                 <h3 className="font-display font-medium text-white text-xl">Elevar para Plano Fé</h3>
                 <p className="text-white/80 font-sans text-sm px-2">Você atingiu seu limite gratuito de orações originais. Ative sua assinatura mensal para criar mais e revelar ferramentas exclusivas como Links do Youtube.</p>
               </div>
               
               <Link href="/api/checkout" className="bg-white text-[#042418] font-bold font-sans text-sm py-4 px-6 rounded-xl hover:bg-[#f0eeea] transition-all flex items-center justify-center gap-2 mt-2 shadow-xl border border-[#775a19]/30">
                 ASSINAR POR R$ 12,90 / MÊS
               </Link>
            </div>
          ) : (
            <>
              {/* Audio Recorder Component */}
              <AudioRecorder />

              {/* Youtube Link (Premium Upsell / Locked Field) */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="youtube_url" className="text-sm font-sans font-bold text-[#042418] flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-[#ba1a1a]" /> Embasamento em Vídeo
                  </label>
                  {!limits.isPremium && <span className="bg-[#775a19]/10 text-[#775a19] text-[10px] px-2 py-0.5 rounded-full font-bold">PREMIUM</span>}
                </div>
                
                <div className="relative">
                  <input
                    type="url"
                    id="youtube_url"
                    name="youtube_url"
                    placeholder={limits.isPremium ? "Cole o link longo do YouTube..." : "Tornar minha Oração guiada por um vídeo"}
                    readOnly={!limits.isPremium}
                    className={`w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans transition-all ${!limits.isPremium ? 'text-transparent bg-[#f5f3ef]/50 cursor-pointer select-none border-dashed' : 'text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19]'}`}
                  />
                  {!limits.isPremium && (
                    <Link href="/api/checkout" className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1.5px] rounded-xl border border-transparent hover:bg-white/40 transition-all cursor-pointer group">
                      <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-[#775a19]/20 group-hover:scale-105 transition-all">
                        <Lock className="w-3.5 h-3.5 text-[#775a19]" />
                        <span className="text-[#775a19] text-xs font-bold font-sans">Desbloquear Link</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-6 w-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans text-base font-bold py-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
              >
                PUBLICAR ORAÇÃO
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
