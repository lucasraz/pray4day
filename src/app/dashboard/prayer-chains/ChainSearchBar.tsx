'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

const CATEGORIES = ['Todas', 'Saúde', 'Família', 'Proteção', 'Fé', 'Gratidão', 'Direção', 'Trabalho', 'Geral'];

export default function ChainSearchBar({
  currentQuery,
  currentCategory,
}: {
  currentQuery: string;
  currentCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'Todas') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-3">
      {/* Campo de busca */}
      <div className="flex items-center gap-3 bg-white border border-[#e4e2de] rounded-2xl px-4 py-3 shadow-sm">
        <Search className="w-4 h-4 text-[#727974] flex-shrink-0" />
        <input
          type="text"
          defaultValue={currentQuery}
          onChange={e => updateParams('q', e.target.value)}
          placeholder="Buscar por título, propósito ou criador..."
          className="flex-1 text-sm font-sans bg-transparent focus:outline-none text-[#1b1c1a] placeholder:text-[#b0b5b1]"
        />
        {currentQuery && (
          <button onClick={() => updateParams('q', '')} className="text-[#727974] hover:text-[#ba1a1a] transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro de categoria — scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => updateParams('cat', cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold border transition-all ${
              (cat === 'Todas' && !currentCategory) || currentCategory === cat
                ? 'bg-[#042418] text-white border-[#042418]'
                : 'bg-white text-[#727974] border-[#e4e2de] hover:bg-[#f5f3ef]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
