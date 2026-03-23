import { createClient } from '@/lib/supabase/server';

export interface CommentItem {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

/**
 * Busca comentários de uma Oração Original
 */
export async function getCommentsForPrayer(prayerId: string): Promise<CommentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments_original_prayers')
    .select(`
      id,
      user_id,
      content,
      created_at,
      profiles (social_name, avatar_url)
    `)
    .eq('prayer_id', prayerId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Erro ao buscar comentários da oração:', error);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    user_name: c.profiles?.social_name || 'Usuário',
    user_avatar: c.profiles?.avatar_url || null,
  }));
}

/**
 * Adiciona um comentário a uma Oração (Somente Premium!)
 */
export async function addCommentToPrayer(prayerId: string, content: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Faça login para comentar.' };

  const currentUserId = userData.user.id;

  // 1. Verificar se é Premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', currentUserId)
    .single();

  if (!profile?.is_premium) {
    return { error: 'PREMIUM_LOCKED' };
  }

  // 2. Inserir comentário
  const { data, error } = await supabase
    .from('comments_original_prayers')
    .insert([{
      prayer_id: prayerId,
      user_id: currentUserId,
      content: content.trim()
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, comment: data };
}

/**
 * Busca comentários de uma Corrente de Oração
 */
export async function getCommentsForChain(chainId: string): Promise<CommentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments_prayer_chains')
    .select(`
      id,
      user_id,
      content,
      created_at,
      profiles (social_name, avatar_url)
    `)
    .eq('chain_id', chainId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Erro ao buscar comentários da corrente:', error);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    user_name: c.profiles?.social_name || 'Usuário',
    user_avatar: c.profiles?.avatar_url || null,
  }));
}

/**
 * Adiciona um comentário a uma Corrente (Somente Premium!)
 */
export async function addCommentToChain(chainId: string, content: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Faça login para comentar.' };

  const currentUserId = userData.user.id;

  // 1. Verificar se é Premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', currentUserId)
    .single();

  if (!profile?.is_premium) {
    return { error: 'PREMIUM_LOCKED' };
  }

  // 2. Inserir comentário
  const { data, error } = await supabase
    .from('comments_prayer_chains')
    .insert([{
      chain_id: chainId,
      user_id: currentUserId,
      content: content.trim()
    }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, comment: data };
}
