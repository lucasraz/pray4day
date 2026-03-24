import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PrayerFilters from '../../src/app/dashboard/original-prayers/PrayerFilters';

// Mock do Next.js navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/dashboard/original-prayers',
  useSearchParams: () => new URLSearchParams(''),
}));

describe('UI: PrayerFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar os 3 chips de ordenação', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    expect(screen.getByText('Populares')).toBeInTheDocument();
    expect(screen.getByText('Recentes')).toBeInTheDocument();
    expect(screen.getByText('Minhas')).toBeInTheDocument();
  });

  it('deve renderizar todas as pills de tema', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Emoções')).toBeInTheDocument();
    expect(screen.getByText('Fé')).toBeInTheDocument();
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Gratidão')).toBeInTheDocument();
  });

  it('deve renderizar o campo de busca por palavra-chave', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    const input = screen.getByPlaceholderText('Buscar por título ou conteúdo...');
    expect(input).toBeInTheDocument();
  });

  it('deve navegar ao clicar num chip de ordenação', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    fireEvent.click(screen.getByText('Recentes'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('sort=recent'),
      { scroll: false }
    );
  });

  it('deve navegar ao clicar numa pill de tema', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    fireEvent.click(screen.getByText('Fé'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('theme=F'),
      { scroll: false }
    );
  });

  it('deve aplicar debounce na busca por keyword', async () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    const input = screen.getByPlaceholderText('Buscar por título ou conteúdo...');
    fireEvent.change(input, { target: { value: 'esperança' } });

    // Antes do debounce, não deve ter navegado
    expect(mockReplace).not.toHaveBeenCalled();

    // Depois do debounce (400ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('keyword=esperan'),
      { scroll: false }
    );
  });

  it('deve destacar o chip de ordenação ativo (Populares como padrão)', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="" currentSort="" />);

    const popularBtn = screen.getByText('Populares');
    // O botão ativo tem a classe bg-[#042418]
    expect(popularBtn.closest('button')).toHaveClass('bg-[#042418]');
  });

  it('deve mostrar botão X quando há keyword ativa', () => {
    render(<PrayerFilters currentTheme="" currentKeyword="test" currentSort="" />);

    // O botão X deve estar visível
    const clearButtons = screen.getAllByRole('button');
    // Um dos botões deve ser o X de limpar
    const clearBtn = clearButtons.find(b => b.querySelector('svg'));
    expect(clearBtn).toBeDefined();
  });
});
