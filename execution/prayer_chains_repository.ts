import { createClient } from '@/lib/supabase/server';

export interface PredefinedPrayer {
  id: string;
  name: string;
  category: string;
  content: string;
}

export interface PrayerChainItem {
  id: string;
  chain_id: string;
  predefined_prayer_id: string | null;
  custom_prayer_name: string | null;
  custom_prayer_text: string | null;
  quantity: number;
  order_index: number;
  predefined_prayers?: PredefinedPrayer | null;
}

export interface PrayerChain {
  id: string;
  user_id: string;
  title: string;
  purpose: string | null;
  category: string;
  start_date: string;
  end_date: string | null;
  execution_time: string;
  periodicity: string[];
  is_active: boolean;
  created_at: string;
  creator_name?: string;       // nome do criador (do perfil)
  creator_avatar?: string;     // avatar do criador
  prayer_chain_items?: PrayerChainItem[];
  participant_count?: number;
  has_joined?: boolean;
}

/**
 * Busca todas as orações pré-definidas agrupadas por categoria
 */
export async function getPredefinedPrayers(): Promise<PredefinedPrayer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('predefined_prayers')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    console.error('Erro ao buscar orações pré-definidas:', error.message);
    return [];
  }
  return data as PredefinedPrayer[];
}

/**
 * Busca todas as correntes de oração (feed público) com contagem de participantes e nome do criador
 * NOTA: Usa duas queries porque prayer_chains.user_id referencia auth.users, não public.profiles
 */
export async function getPrayerChains(): Promise<PrayerChain[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  // 1ª query: correntes com itens e participantes
  const { data, error } = await supabase
    .from('prayer_chains')
    .select(`
      *,
      prayer_chain_items (
        id, quantity, order_index,
        predefined_prayer_id, custom_prayer_name,
        predefined_prayers (id, name, category)
      ),
      prayer_chain_participants (user_id)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar correntes:', error.message);
    return [];
  }

  // 2ª query: busca perfis dos criadores
  const creatorIds = [...new Set((data as any[]).map(c => c.user_id))];
  const { data: profiles } = creatorIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, social_name, faith_name, display_name_preference, avatar_url')
        .in('id', creatorIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profiles || []).map((p: any) => [p.id, p])
  );

  return (data as any[]).map(chain => {
    const profile = profileMap[chain.user_id];
    const pref = profile?.display_name_preference || 'social';
    const creatorName = (pref === 'faith' && profile?.faith_name)
      ? profile.faith_name
      : profile?.social_name || 'Anônimo';

    return {
      ...chain,
      creator_name: creatorName,
      creator_avatar: profile?.avatar_url || null,
      participant_count: chain.prayer_chain_participants?.length ?? 0,
      has_joined: userId ? chain.prayer_chain_participants?.some((p: any) => p.user_id === userId) : false,
      prayer_chain_participants: undefined,
    };
  }) as PrayerChain[];
}

/**
 * Busca uma corrente específica pelo ID com contagem de participantes
 */
export async function getPrayerChainById(id: string): Promise<PrayerChain | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data, error } = await supabase
    .from('prayer_chains')
    .select(`
      *,
      prayer_chain_items (
        id, quantity, order_index,
        predefined_prayer_id, custom_prayer_name, custom_prayer_text,
        predefined_prayers (id, name, category, content)
      ),
      prayer_chain_participants (user_id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Erro ao buscar corrente:', error?.message);
    return null;
  }

  const chain = data as any;
  return {
    ...chain,
    participant_count: chain.prayer_chain_participants?.length ?? 0,
    has_joined: userId ? chain.prayer_chain_participants?.some((p: any) => p.user_id === userId) : false,
    prayer_chain_participants: undefined,
  } as PrayerChain;
}

/**
 * Aderir a uma corrente
 */
export async function joinPrayerChain(chainId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error } = await supabase
    .from('prayer_chain_participants')
    .insert({ chain_id: chainId, user_id: userData.user.id });

  return !error;
}

/**
 * Sair de uma corrente
 */
export async function leavePrayerChain(chainId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error } = await supabase
    .from('prayer_chain_participants')
    .delete()
    .eq('chain_id', chainId)
    .eq('user_id', userData.user.id);

  return !error;
}

/**
 * Cria uma nova corrente com seus itens em transação
 */
export async function createPrayerChain(payload: {
  title: string;
  purpose?: string;
  category: string;
  start_date: string;
  end_date?: string;
  execution_time: string;
  periodicity: string[];
  items: {
    predefined_prayer_id?: string;
    custom_prayer_name?: string;
    custom_prayer_text?: string;
    quantity: number;
    order_index: number;
  }[];
}): Promise<PrayerChain> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Não autenticado');

  // 1. Cria a corrente
  const { data: chain, error: chainError } = await supabase
    .from('prayer_chains')
    .insert({
      user_id: userData.user.id,
      title: payload.title,
      purpose: payload.purpose || null,
      category: payload.category,
      start_date: payload.start_date,
      end_date: payload.end_date || null,
      execution_time: payload.execution_time,
      periodicity: payload.periodicity,
    })
    .select()
    .single();

  if (chainError || !chain) throw chainError;

  // 2. Insere os itens
  if (payload.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('prayer_chain_items')
      .insert(
        payload.items.map(item => ({
          chain_id: chain.id,
          predefined_prayer_id: item.predefined_prayer_id || null,
          custom_prayer_name: item.custom_prayer_name || null,
          custom_prayer_text: item.custom_prayer_text || null,
          quantity: item.quantity,
          order_index: item.order_index,
        }))
      );
    if (itemsError) throw itemsError;
  }

  return chain as PrayerChain;
}

/**
 * Deleta uma corrente (apenas o autor)
 */
export async function deletePrayerChain(chainId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error } = await supabase
    .from('prayer_chains')
    .delete()
    .eq('id', chainId)
    .eq('user_id', userData.user.id);

  return !error;
}
