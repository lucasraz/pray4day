import { CommentItem } from './comments_types';
import { createClient } from '@/lib/supabase/server';

/**
 * Busca comentários de uma Oração Original
 */
export async function getCommentsForPrayer(prayerId: string): Promise<CommentItem[]> {
  const supabase = await createClient();

  // 1. Buscar comentários
  const { data: comments, error: commentsError } = await supabase
    .from('comments_original_prayers')
    .select('id, user_id, content, created_at')
    .eq('prayer_id', prayerId)
    .order('created_at', { ascending: false });

  if (commentsError || !comments) {
    console.error('Erro ao buscar comentários da oração:', commentsError);
    return [];
  }

  if (comments.length === 0) return [];

  // 2. Buscar perfis dos usuários que comentaram
  const userIds = [...new Set(comments.map(c => c.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, social_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Erro ao buscar perfis dos comentários:', profilesError);
  }

  // 3. Cruzar dados
  return comments.map((c) => {
    const p = profiles?.find(p => p.id === c.user_id);
    return {
      id: c.id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      user_name: p?.social_name || 'Usuário',
      user_avatar: p?.avatar_url || null,
    };
  });
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

  // 1. Buscar comentários
  const { data: comments, error: commentsError } = await supabase
    .from('comments_prayer_chains')
    .select('id, user_id, content, created_at')
    .eq('chain_id', chainId)
    .order('created_at', { ascending: false });

  if (commentsError || !comments) {
    console.error('Erro ao buscar comentários da corrente:', commentsError);
    return [];
  }

  if (comments.length === 0) return [];

  // 2. Buscar perfis dos usuários que comentaram
  const userIds = [...new Set(comments.map(c => c.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, social_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Erro ao buscar perfis dos comentários:', profilesError);
  }

  // 3. Cruzar dados
  return comments.map((c) => {
    const p = profiles?.find(p => p.id === c.user_id);
    return {
      id: c.id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      user_name: p?.social_name || 'Usuário',
      user_avatar: p?.avatar_url || null,
    };
  });
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

/**
 * Deleta um comentário de uma Oração
 */
export async function deleteCommentFromPrayer(commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('comments_original_prayers')
    .delete()
    .eq('id', commentId);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Deleta um comentário de uma Corrente
 */
export async function deleteCommentFromChain(commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('comments_prayer_chains')
    .delete()
    .eq('id', commentId);

  if (error) return { error: error.message };
  return { success: true };
}
