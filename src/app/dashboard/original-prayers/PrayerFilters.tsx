'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Search, X, Flame, Clock, User } from 'lucide-react';

const THEME_MAP: { label: string; emoji: string }[] = [
  { label: 'Todos',           emoji: '✦' },
  { label: 'Emoções',         emoji: '💛' },
  { label: 'Direção',         emoji: '🧭' },
  { label: 'Relacionamentos', emoji: '🤝' },
  { label: 'Trabalho',        emoji: '💼' },
  { label: 'Saúde',           emoji: '🌿' },
  { label: 'Fé',              emoji: '✝️' },
  { label: 'Proteção',        emoji: '🛡️' },
  { label: 'Gratidão',        emoji: '🙏' },
  { label: 'Dia a dia',       emoji: '☀️' },
];

const SORT_OPTIONS = [
  { key: 'popular',  label: 'Populares',  icon: Flame },
  { key: 'recent',   label: 'Recentes',   icon: Clock },
  { key: 'mine',     label: 'Minhas',     icon: User },
] as const;

export default function PrayerFilters({
  currentTheme,
  currentKeyword,
  currentSort,
}: {
  currentTheme: string;
  currentKeyword: string;
  currentSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'Todos') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams('keyword', e.target.value);
    }, 400);
  };

  const activeSort = currentSort || 'popular';
  const hasActiveFilters = !!currentTheme || !!currentKeyword || !!currentSort;

  return (
    <div className="flex flex-col gap-3">
      {/* 🔍 Busca por Palavra-Chave */}
      <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
        isFocused ? 'border-[#775a19]/50 shadow-md ring-2 ring-[#775a19]/10' : 'border-[#e4e2de]'
      }`}>
        <Search className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
          isFocused ? 'text-[#775a19]' : 'text-[#b0b5b1]'
        }`} />
        <input
          type="text"
          defaultValue={currentKeyword}
          onChange={handleKeywordChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Buscar por título ou conteúdo..."
          className="flex-1 text-sm font-sans bg-transparent focus:outline-none text-[#1b1c1a] placeholder:text-[#b0b5b1]"
        />
        {currentKeyword && (
          <button
            onClick={() => updateParams('keyword', '')}
            className="p-1 rounded-full text-[#727974] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 📊 Chips de Ordenação */}
      <div className="flex items-center gap-2">
        {SORT_OPTIONS.map(({ key, label, icon: Icon }) => {
          const isActive = activeSort === key;
          return (
            <button
              key={key}
              onClick={() => updateParams('sort', key === 'popular' ? '' : key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold border transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#042418] text-[#ffdea5] border-[#042418] shadow-md'
                  : 'bg-white text-[#727974] border-[#e4e2de] hover:bg-[#f5f3ef] hover:border-[#c1c8c2]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'animate-pulse' : ''}`} />
              {label}
            </button>
          );
        })}

        {/* Limpar tudo */}
        {hasActiveFilters && (
          <button
            onClick={() => router.replace(pathname, { scroll: false })}
            className="ml-auto flex items-center gap-1 text-[10px] font-sans font-bold text-[#ba1a1a] hover:text-[#ba1a1a]/80 transition-all"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* 🏷️ Pills de Tema — scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {THEME_MAP.map(({ label, emoji }) => {
          const isSelected = (!currentTheme && label === 'Todos') || currentTheme.toLowerCase() === label.toLowerCase();
          return (
            <button
              key={label}
              onClick={() => updateParams('theme', label)}
              className={`flex-shrink-0 flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all duration-200 border active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#775a19] to-[#a0780a] border-[#775a19] text-white shadow-sm'
                  : 'bg-[#f5f3ef] border-[#e4e2de]/60 text-[#727974] hover:bg-[#e4e2de]/60 hover:border-[#c1c8c2]'
              }`}
            >
              <span className="text-[10px]">{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
