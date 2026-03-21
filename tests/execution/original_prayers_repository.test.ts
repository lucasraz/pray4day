import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleLikeOriginalPrayer, getOriginalPrayers } from '../../execution/original_prayers_repository';

// Faz o mock do cliente do supabase
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

import { createClient } from '@/lib/supabase/server';

describe('original_prayers_repository', () => {
  let mockSupabase: any;
  let builder: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // O builder é quem tem métodos encadeados e devolve promessas
    builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      then: function(resolve: any) { resolve({ data: null, error: null }); }
    };

    // Configura o mock base do supabase
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'mock-user-123' } } }),
      },
      from: vi.fn().mockReturnValue(builder),
    };

    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it('deve curtir uma oração se ainda não curtiu', async () => {
    builder.single.mockResolvedValueOnce({ data: null });
    // O await builder que será disparado via insert() retorna vazio com sucesso
    builder.then = function(resolve: any) { resolve({ error: null }); };

    const result = await toggleLikeOriginalPrayer('prayer-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('likes_original_prayers');
    expect(builder.select).toHaveBeenCalledWith('id');
    expect(builder.insert).toHaveBeenCalledWith([{ prayer_id: 'prayer-1', user_id: 'mock-user-123' }]);
    expect(result).toEqual({ success: true, action: 'liked' });
  });

  it('deve descurtir uma oração se já havia curtido', async () => {
    builder.single.mockResolvedValueOnce({ data: { id: 'like-1' } });
    builder.then = function(resolve: any) { resolve({ error: null }); };

    const result = await toggleLikeOriginalPrayer('prayer-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('likes_original_prayers');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'like-1');
    expect(result).toEqual({ success: true, action: 'unliked' });
  });

  it('deve retornar contagem correta e has_liked ao buscar orações', async () => {
    builder.then = function(resolve: any) {
      resolve({
        data: [
          {
            id: 'prayer-1',
            title: 'Oração Teste',
            likes_original_prayers: [
              { user_id: 'mock-user-123' },
              { user_id: 'other-user-456' }
            ]
          }
        ],
        error: null
      });
    };

    const result = await getOriginalPrayers();

    expect(result).toHaveLength(1);
    expect(result[0].likes_count).toBe(2);
    expect(result[0].has_liked).toBe(true);
  });
});
