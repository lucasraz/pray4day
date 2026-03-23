'use client'
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  index: number;
  name: string;
  content: string;
  quantity: number;
}

export default function PrayerItemAccordion({ index, name, content, quantity }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#e4e2de]/40 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#f5f3ef] transition-all"
      >
        {/* Número */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-sans font-bold">{index}</span>
        </div>

        {/* Nome */}
        <span className="flex-1 text-sm font-sans font-bold text-[#042418]">{name}</span>

        {/* Vezes */}
        {quantity > 1 && (
          <span className="bg-[#fff4e0] text-[#a0640a] text-xs font-sans font-bold px-2 py-0.5 rounded-full border border-[#f0d08a]/60">
            {quantity}×
          </span>
        )}

        {/* Seta */}
        {content ? (
          open
            ? <ChevronUp className="w-4 h-4 text-[#727974] flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-[#727974] flex-shrink-0" />
        ) : null}
      </button>

      {open && content && (
        <div className="px-5 pb-5 bg-[#fbf9f5] border-t border-[#e4e2de]/40">
          <p className="text-[#1b1c1a] font-sans text-sm leading-relaxed italic whitespace-pre-wrap pt-4">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
