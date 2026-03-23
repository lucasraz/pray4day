'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { Verse } from '../../../execution/verses_repository'

interface VerseCardProps {
  verse: Verse | null
}

export default function VerseCard({ verse }: VerseCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareOnWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir/fechar o card
    if (!verse) return;
    const shareText = `🕊️ *PRAY FOR DAY* -\n*Versículo do Dia*\n\n"${verse.text}"\n\n📖 _${verse.reference}_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  if (!verse) return null

  return (
    <div 
      className={`bg-[#ffffff] border border-[#c1c8c2]/20 rounded-2xl p-5 flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 mb-6 overflow-hidden ${
        isOpen ? 'bg-gradient-to-br from-[#fcfbf7] to-[#f5f3ef]' : ''
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="bg-[#f5f3ef] p-3 rounded-xl">
            <BookOpen className="w-5 h-5 text-[#775a19]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#042418] text-base font-['Newsreader',serif] font-medium leading-none">Versículo do Dia</span>
            <span className="text-[#727974] text-[10px] font-['Manrope',sans-serif] font-bold uppercase tracking-wider">
              {isOpen ? 'Recolher' : 'Receber mensagem'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão Whatsapp */}
          <button 
            onClick={shareOnWhatsapp}
            className="p-1.5 rounded-full hover:bg-green-50 text-green-600 active:scale-95 transition-all"
            aria-label="Compartilhar no Whatsapp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M187.58,153.6c-4.43-2.31-25.86-12.74-29.91-14.22s-7-2.18-10,2.18-11.45,14.22-14,17.14-5.18,3.28-9.62,1a61,61,0,0,1-35.67-44c-1.29-5.61,4-10.43,8.37-14.33,1.82-1.63,3.74-3.34,5.27-5.16,1.48-1.78,2.18-3.38,3.29-5.64a5.45,5.45,0,0,0-.28-5.18c-1.11-2.18-10-24.12-13.68-33s-7.16-7.46-10-7.61c-2.39-.12-5.1-.15-7.85-.15A15.1,15.1,0,0,0,62.4,51c-4.44,4.82-17,16.59-17,40.42S62.78,138,65,141s28.17,43.08,68.27,60.36c9.54,4.11,17,6.56,22.82,8.44A54.91,54.91,0,0,0,181.25,208c14.07-2.11,29.13-11.9,33.22-23.36s4.09-21.28,2.87-23.36S211,158.42,187.58,153.6ZM128,240a112,112,0,0,1-57.24-15.68l-43.14,14.12a8,8,0,0,1-10.06-10.06l14.12-43.14A112,112,0,1,1,128,240Z"></path>
            </svg>
          </button>
          
          <ChevronDown className={`w-5 h-5 text-[#c1c8c2] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col gap-3 pl-14 pr-2 pb-1">
          {verse.category && (
            <span className="bg-[#e9e5db] text-[#4a412c] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit">
              {verse.category}
            </span>
          )}
          
          <p className="font-['Newsreader',serif] text-xl text-[#1b3a2c] italic leading-relaxed tracking-tight">
            "{verse.text}"
          </p>
          
          <span className="text-xs text-[#727974] font-sans font-bold uppercase tracking-wide">
            {verse.reference}
          </span>
        </div>
      </div>
    </div>
  )
}
