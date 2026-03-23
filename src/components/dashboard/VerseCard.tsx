'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { Verse } from '../../../execution/verses_repository'

interface VerseCardProps {
  verse: Verse | null
}

export default function VerseCard({ verse }: VerseCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!verse) return null

  return (
    <div 
      className={`bg-[#ffffff] border border-[#c1c8c2]/20 rounded-x x-22 lg:rounded-2xl p-5 flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 mb-6 overflow-hidden ${
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
        <ChevronDown className={`w-5 h-5 text-[#c1c8c2] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
