import { createClient } from '@/lib/supabase/server';

export interface OriginalPrayer {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  content: string;
  audio_url: string | null;
  youtube_url: string | null;
  image_url: string | null;
  duration: number;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
  has_favorited?: boolean;
  is_author?: boolean;
}

/**
 * Busca todas as orações originais com filtros de tema, keyword e ordenação.
 * sort: 'popular' (likes desc), 'recent' (created_at desc), 'mine' (do usuário logado)
 */
export async function getOriginalPrayers(filters?: { theme?: string; keyword?: string; sort?: string }) {
  const supabase = await createClient();
  
  // 1. Pegar usuário logado para verificar se ele deu like
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id;

  // 2. Query Principal
  let query = supabase
    .from('original_prayers')
    .select(`
      *,
      likes_original_prayers(user_id),
      comments_original_prayers(id)
    `);

  if (filters?.theme) {
    query = query.eq('theme', filters.theme);
  }

  if (filters?.keyword) {
    query = query.or(`title.ilike.%${filters.keyword}%,content.ilike.%${filters.keyword}%`);
  }

  // Filtro "Minhas Orações" — filtra pelo usuário logado
  if (filters?.sort === 'mine' && currentUserId) {
    query = query.eq('user_id', currentUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar orações originais:', error);
    return [];
  }

  // 3. Formatar dados incluindo total de likes e flag has_liked
  const formattedData: OriginalPrayer[] = (data || []).map((p: any) => {
    const likes = p.likes_original_prayers || [];
    const comments = p.comments_original_prayers || [];
    return {
      ...p,
      likes_count: likes.length,
      comments_count: comments.length,
      has_liked: likes.some((l: any) => l.user_id === currentUserId),
      is_author: p.user_id === currentUserId
    };
  });

  // 4. Ordenar conforme o filtro escolhido
  const sortMode = filters?.sort || 'popular';

  if (sortMode === 'recent' || sortMode === 'mine') {
    return formattedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Padrão: popular (por likes decrescente)
  return formattedData.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
}

/**
 * Busca uma oração original específica pelo ID, junto com seu estado de curtidas.
 */
export async function getOriginalPrayerById(id: string) {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id;

  const { data, error } = await supabase
    .from('original_prayers')
    .select(`
      *,
      likes_original_prayers(user_id),
      favorite_prayers(user_id),
      comments_original_prayers(id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Erro ao buscar oração original:', error);
    return null;
  }

  const likes = data.likes_original_prayers || [];
  const favs = data.favorite_prayers || [];
  const comments = data.comments_original_prayers || [];

  return {
    ...data,
    likes_count: likes.length,
    comments_count: comments.length,
    has_liked: likes.some((l: any) => l.user_id === currentUserId),
    has_favorited: favs.some((f: any) => f.user_id === currentUserId),
    is_author: data.user_id === currentUserId
  } as OriginalPrayer & { likes_count: number; comments_count: number; has_liked: boolean; has_favorited: boolean; is_author: boolean };
}

/**
 * Da Favorite ou Retira Favorite de uma oração
 * (Apenas construtor ou usuário Premium, mas aqui destrancamos se passar DB)
 */
export async function toggleFavoriteActionLogic(prayerId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Faça login para favoritar.' };

  const currentUserId = userData.user.id;

  // Verificar se usuário é Premium antes de deixar favoritar
  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', currentUserId).single();
  if (!profile?.is_premium) {
    return { error: 'FAVORITES_LOCKED' };
  }

  // Verificar se já favoritou
  const { data: existingFav } = await supabase
    .from('favorite_prayers')
    .select('id')
    .eq('prayer_id', prayerId)
    .eq('user_id', currentUserId)
    .single();

  if (existingFav) {
    const { error } = await supabase
      .from('favorite_prayers')
      .delete()
      .eq('id', existingFav.id);
    
    if (error) return { error: error.message };
    return { success: true, action: 'unfavorited' };
  } else {
    const { error } = await supabase
      .from('favorite_prayers')
      .insert([{ prayer_id: prayerId, user_id: currentUserId }]);

    if (error) return { error: error.message };
    return { success: true, action: 'favorited' };
  }
}

/**
 * Cria uma nova oração original
 */
export async function createOriginalPrayer(payload: {
  title: string;
  theme: string;
  content: string;
  audio_url?: string;
  youtube_url?: string | null;
  image_url?: string;
  duration?: number;
}) {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Usuário não autenticado.');

  // 1. Verificar Status Premium do Usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userData.user.id)
    .single();

  const isPremium = profile?.is_premium || false;

  // 2. Contar quantas orações esse usuário já criou
  const { count } = await supabase
    .from('original_prayers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id);

  // 3. Travar regra de negócios do Paywall/Plano Premium (Max 10 Free, Ilimitadas Pro)
  const maxLimit = isPremium ? Infinity : 10;

  if (count !== null && count >= maxLimit) {
    if (!isPremium) {
      throw new Error('PAYWALL_LIMIT_REACHED'); // Gatilho visual no Front End para R$ 11,90
    } else {
      throw new Error('O limite máximo de 10 orações Premium foi atingido.');
    }
  }

  // 4. Inserir a nova oração após passar pelas barreiras de limite
  const { data, error } = await supabase
    .from('original_prayers')
    .insert([{
      user_id: userData.user.id,
      ...payload
    }])
    .select()
    .single();

  if (error) throw error;
  return data as OriginalPrayer;
}

/**
 * Da Like ou Retira Like de uma oração
 */
export async function toggleLikeOriginalPrayer(prayerId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Faça login para curtir.' };

  const currentUserId = userData.user.id;

  // Verificar se já existe like
  const { data: existingLike } = await supabase
    .from('likes_original_prayers')
    .select('id')
    .eq('prayer_id', prayerId)
    .eq('user_id', currentUserId)
    .single();

  if (existingLike) {
    // Se já curtiu, descurtir (Remover)
    const { error } = await supabase
      .from('likes_original_prayers')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) return { error: error.message };
    return { success: true, action: 'unliked' };
  } else {
    // Se não curtiu, curtir (Inserir)
    const { error } = await supabase
      .from('likes_original_prayers')
      .insert([{ prayer_id: prayerId, user_id: currentUserId }]);

    if (error) return { error: error.message };
    return { success: true, action: 'liked' };
  }
}

/**
 * Retorna os limites de criação da sessão atual do usuário
 */
export async function getUserPrayerLimits() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { count: 0, isPremium: false, maxLimit: 3, canCreate: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userData.user.id)
    .single();

  const isPremium = profile?.is_premium || false;

  const { count } = await supabase
    .from('original_prayers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id);

  const maxLimit = isPremium ? Infinity : 10;
  const currentCount = count || 0;

  return {
    count: currentCount,
    isPremium,
    maxLimit,
    canCreate: currentCount < maxLimit
  };
}

/**
 * Busca apenas as orações favoritadas do usuário autenticado.
 */
export async function getFavoritePrayers() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('favorite_prayers')
    .select(`
      prayer_id,
      original_prayers (
        id, title, theme, content, audio_url, youtube_url, duration, created_at,
        likes_original_prayers (user_id),
        favorite_prayers (user_id)
      )
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const currentUserId = userData.user.id;

  // Formata o array com dados amigáveis e as contagens
  return data.map((favRow: any) => {
    const prayer = favRow.original_prayers;
    if (!prayer) return null;

    const likes = prayer.likes_original_prayers || [];
    const favs = prayer.favorite_prayers || [];

    return {
      ...prayer,
      likes_count: likes.length,
      has_liked: likes.some((l: any) => l.user_id === currentUserId),
      has_favorited: favs.some((f: any) => f.user_id === currentUserId),
    } as OriginalPrayer & { likes_count: number; has_liked: boolean; has_favorited: boolean };
  }).filter(Boolean);
}

/**
 * Deleta uma oração (apenas se for o autor)
 */
export async function deleteOriginalPrayer(prayerId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Não autenticado');

  // Verifica se é o autor
  const { data: prayer } = await supabase.from('original_prayers').select('user_id').eq('id', prayerId).single();
  if (!prayer || prayer.user_id !== userData.user.id) {
    throw new Error('Sem premissão para excluir.');
  }

  const { error } = await supabase.from('original_prayers').delete().eq('id', prayerId);
  if (error) throw error;
  return true;
}

/**
 * Atualiza uma oração (apenas se for o autor)
 */
export async function updateOriginalPrayer(
  prayerId: string, 
  payload: { title: string; theme: string; content: string; youtube_url?: string | null; image_url?: string }
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Não autenticado');

  const { data: prayer } = await supabase.from('original_prayers').select('user_id').eq('id', prayerId).single();
  if (!prayer || prayer.user_id !== userData.user.id) {
    throw new Error('Sem premissão para editar.');
  }

  const { error } = await supabase
    .from('original_prayers')
    .update({
      title: payload.title,
      theme: payload.theme,
      content: payload.content,
      youtube_url: payload.youtube_url || null,
      image_url: payload.image_url ?? undefined,
    })
    .eq('id', prayerId);

  if (error) throw error;
  return true;
}

/**
 * Seleciona deterministicamente a Oração do Dia para um usuário específico.
 * Algoritmo: (diasDesdeEpoch + hash(userId)) % totalOrações
 * → Diferente por pessoa, muda diariamente, cicla sem repetir
 */
export async function getDailyPrayer(userId: string): Promise<OriginalPrayer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('original_prayers')
    .select(`
      id, user_id, title, theme, content, image_url, audio_url, youtube_url, duration, created_at,
      likes_original_prayers(user_id),
      comments_original_prayers(id)
    `)
    .order('created_at', { ascending: true }); // ordem consistente

  if (error || !data || data.length === 0) return null;

  // Hash simples do userId para offset único por pessoa
  const userHash = userId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  const index = (daysSinceEpoch + userHash) % data.length;
  const prayer = data[index] as any;

  const likes = prayer.likes_original_prayers || [];
  const comments = prayer.comments_original_prayers || [];
  return {
    ...prayer,
    likes_count: likes.length,
    comments_count: comments.length,
    has_liked: likes.some((l: any) => l.user_id === userId),
    image_url: prayer.image_url || null,
  } as OriginalPrayer;
}

/**
 * Retorna uma lista determinística de orações (carrossel) para o dia
 * Regra: 1 oração de cada tema, no máximo 4 temas.
 */
export async function getDailyPrayersList(userId: string, limit = 4): Promise<OriginalPrayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('original_prayers')
    .select(`
      id, user_id, title, theme, content, image_url, audio_url, youtube_url, duration, created_at,
      likes_original_prayers(user_id),
      comments_original_prayers(id)
    `)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return [];

  const userHash = userId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);

  // 1. Agrupar por Tema
  const themeBuckets: { [key: string]: any[] } = {};
  for (const p of data) {
    if (!themeBuckets[p.theme]) {
      themeBuckets[p.theme] = [];
    }
    themeBuckets[p.theme].push(p);
  }

  // 2. Escolher até 4 temas diferentes
  const availableThemes = Object.keys(themeBuckets).slice(0, limit);
  const prayers: OriginalPrayer[] = [];

  // 3. Selecionar 1 oração determinística de cada tema
    for (const theme of availableThemes) {
    const bucket = themeBuckets[theme];
    const subIndex = (daysSinceEpoch + userHash) % bucket.length;
    const p = bucket[subIndex];
    const likes = p.likes_original_prayers || [];
    const comments = p.comments_original_prayers || [];

    prayers.push({
      ...p,
      likes_count: likes.length,
      comments_count: comments.length,
      has_liked: likes.some((l: any) => l.user_id === userId),
      image_url: p.image_url || null,
    } as OriginalPrayer);
  }

  return prayers;
}
