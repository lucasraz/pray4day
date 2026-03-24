import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChainSearchBar from '../../src/app/dashboard/prayer-chains/ChainSearchBar';

// Mock do Next.js navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/dashboard/prayer-chains',
  useSearchParams: () => new URLSearchParams(''),
}));

describe('UI: ChainSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar os 4 chips de ordenação', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    expect(screen.getByText('Recentes')).toBeInTheDocument();
    expect(screen.getByText('Mais Participantes')).toBeInTheDocument();
    expect(screen.getByText('Minhas')).toBeInTheDocument();
    expect(screen.getByText('Participando')).toBeInTheDocument();
  });

  it('deve renderizar todas as pills de categoria', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Família')).toBeInTheDocument();
    expect(screen.getByText('Proteção')).toBeInTheDocument();
    expect(screen.getByText('Fé')).toBeInTheDocument();
    expect(screen.getByText('Gratidão')).toBeInTheDocument();
    expect(screen.getByText('Direção')).toBeInTheDocument();
    expect(screen.getByText('Trabalho')).toBeInTheDocument();
    expect(screen.getByText('Geral')).toBeInTheDocument();
  });

  it('deve renderizar o campo de busca', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    const input = screen.getByPlaceholderText('Buscar por título, propósito ou criador...');
    expect(input).toBeInTheDocument();
  });

  it('deve navegar ao clicar no chip "Mais Participantes"', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    fireEvent.click(screen.getByText('Mais Participantes'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('sort=participants'),
      { scroll: false }
    );
  });

  it('deve navegar ao clicar no chip "Minhas"', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    fireEvent.click(screen.getByText('Minhas'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('sort=mine'),
      { scroll: false }
    );
  });

  it('deve navegar ao clicar no chip "Participando"', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    fireEvent.click(screen.getByText('Participando'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('sort=joined'),
      { scroll: false }
    );
  });

  it('deve navegar ao clicar numa pill de categoria', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    fireEvent.click(screen.getByText('Família'));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('cat=Fam'),
      { scroll: false }
    );
  });

  it('deve aplicar debounce na busca de texto', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    const input = screen.getByPlaceholderText('Buscar por título, propósito ou criador...');
    fireEvent.change(input, { target: { value: 'adoração' } });

    // Antes do debounce
    expect(mockReplace).not.toHaveBeenCalled();

    // Depois do debounce (400ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('q=adora'),
      { scroll: false }
    );
  });

  it('deve destacar "Recentes" como chip ativo por padrão', () => {
    render(<ChainSearchBar currentQuery="" currentCategory="" currentSort="" />);

    const recentBtn = screen.getByText('Recentes');
    expect(recentBtn.closest('button')).toHaveClass('bg-[#042418]');
  });
});
