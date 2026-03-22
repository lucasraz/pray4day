'use client';

import { useState } from 'react';

export default function ThemeSelector({ disabled }: { disabled?: boolean }) {
  const [selected, setSelected] = useState('');
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <select
        id="theme_dropdown"
        name="theme_dropdown"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={disabled}
        required
        className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all appearance-none disabled:opacity-50"
      >
        <option value="" disabled className="text-[#727974]">Selecione um tema...</option>
        <option value="Emoções">Emoções</option>
        <option value="Direção">Direção</option>
        <option value="Relacionamentos">Relacionamentos</option>
        <option value="Trabalho">Trabalho</option>
        <option value="Saúde">Saúde</option>
        <option value="Fé">Fé</option>
        <option value="Proteção">Proteção</option>
        <option value="Gratidão">Gratidão</option>
        <option value="Dia a dia">Dia a dia</option>
        <option value="Outras">Outras (digite abaixo)</option>
      </select>
      
      {/* Hidden input to ensure the correct 'theme' field is always present for formData */}
      {selected !== 'Outras' && selected !== '' && (
        <input type="hidden" name="theme" value={selected} />
      )}

      {selected === 'Outras' && (
        <input
          type="text"
          id="custom_theme"
          name="theme"
          placeholder="Digite a categoria personalizada..."
          required
          disabled={disabled}
          className="w-full mt-1 bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] placeholder:text-[#727974] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all disabled:opacity-50 animate-in fade-in slide-in-from-top-1"
        />
      )}
    </div>
  );
}
