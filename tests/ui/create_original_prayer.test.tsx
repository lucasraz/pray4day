import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateOriginalPrayerPage from '../../src/app/dashboard/original-prayers/create/page';

// Mocks do Next.js App Router
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: any) => <a href={href}>{children}</a>
  };
});

// Nossa página está usando uma Action customizada (Server Action) no "action" do form.
// No DOM renderizado pelo React Testing Library em modo cliente, a Action é ignorada ou tratada como função.
// Não precisamos mockar os hooks de navegação a menos que testássemos o submit propriamente dito.

describe('UI: CreateOriginalPrayerPage', () => {
  it('deve renderizar o formulário de criação de oração com todos os campos', () => {
    // Renderiza a página
    render(<CreateOriginalPrayerPage />);

    // Verifica o Header
    expect(screen.getByText('Criar Oração')).toBeInTheDocument();

    // Verifica os inputs buscando pelos labels
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tema/i)).toBeInTheDocument();
    
    // O textarea pela label 'Sua Oração'
    expect(screen.getByLabelText(/sua oração/i)).toBeInTheDocument();

    // Verifica o botão de Salvar/Publicar
    const submitButton = screen.getByRole('button', { name: /publicar oração/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('deve requerer os campos corretamente (estado HTML5)', () => {
    render(<CreateOriginalPrayerPage />);

    const titleInput = screen.getByLabelText(/título/i);
    const themeSelect = screen.getByLabelText(/tema/i);
    const contentTextarea = screen.getByLabelText(/sua oração/i);

    // Conferindo requisição nativa dos form inputs no HTML
    expect(titleInput).toBeRequired();
    expect(themeSelect).toBeRequired();
    expect(contentTextarea).toBeRequired();
  });
});
