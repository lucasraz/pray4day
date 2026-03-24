'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOriginalPrayer, toggleLikeOriginalPrayer, toggleFavoriteActionLogic } from '../../../../execution/original_prayers_repository';
import { addCommentToPrayer } from '../../../../execution/comments_repository';

export async function likePrayerAction(formData: FormData) {
  const prayerId = formData.get('prayerId') as string;
  if (!prayerId) return;

  const result = await toggleLikeOriginalPrayer(prayerId);
  
  if (result?.error) {
    console.error('Error toggling like:', result.error);
    return;
  }

  // Revalidate to show updated like count and heart state
  revalidatePath('/dashboard/original-prayers');
}

export async function createPrayerAction(formData: FormData) {
  const title = formData.get('title') as string;
  const theme = formData.get('theme') as string;
  const content = formData.get('content') as string;
  const audioFile = formData.get('audioFile') as File | null;
  const imageFile = formData.get('imageFile') as File | null;
  const youtube_url = formData.get('youtube_url') as string | null;

  if (!title || !theme || !content) {
    console.error('Preencha todos os campos obrigatórios.');
    return;
  }

  let audio_url: string | undefined = undefined;
  let image_url: string | undefined = undefined;

  try {
    // 🛡️ Blindagem contra Spam / Payload excessivo
    if (title.length > 100) throw new Error('TITLE_TOO_LONG');
    if (content.length > 5000) throw new Error('CONTENT_TOO_LONG');

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (audioFile && typeof audioFile !== 'string' && audioFile.size > 0) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      const { data, error } = await supabase.storage.from('prayers-audio').upload(fileName, audioFile);
      
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('prayers-audio').getPublicUrl(fileName);
        audio_url = urlData.publicUrl;
      } else {
        console.error('Erro no upload de áudio:', error);
      }
    }

    if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0 && userId) {
      const fileExt = imageFile.name ? imageFile.name.split('.').pop() : 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('prayers-images').upload(fileName, imageFile);
      
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('prayers-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      } else {
        console.error('Erro no upload de imagem:', error);
      }
    }

    await createOriginalPrayer({
      title,
      theme,
      content,
      audio_url,
      image_url,
      youtube_url: youtube_url || null,
    });
  } catch (err: any) {
    console.error('Error creating prayer:', err);
    
    // Redireciona com erro para o form ler e dar feedback
    if (err?.message === 'TITLE_TOO_LONG') {
      redirect('/dashboard/original-prayers/create?error=title_long');
    }
    if (err?.message === 'CONTENT_TOO_LONG') {
      redirect('/dashboard/original-prayers/create?error=content_long');
    }
    if (err?.message === 'PAYWALL_LIMIT_REACHED') {
      redirect('/dashboard/original-prayers/create?error=limit');
    }
    redirect('/dashboard/original-prayers/create?error=database');
  }

  revalidatePath('/dashboard/original-prayers');
  redirect('/dashboard/original-prayers');
}

export async function favoritePrayerAction(formData: FormData) {
  const prayerId = formData.get('prayerId') as string;
  if (!prayerId) return;

  const result = await toggleFavoriteActionLogic(prayerId);
  
  if (result.error === 'FAVORITES_LOCKED') {
     redirect('/api/checkout');
  }

  revalidatePath(`/dashboard/original-prayers/${prayerId}`);
  revalidatePath('/dashboard/original-prayers');
  redirect(`/dashboard/original-prayers/${prayerId}`);
}

export async function addCommentAction(prayerId: string, content: string) {
  if (!prayerId || !content.trim()) return { error: 'Conteúdo vazio' };

  try {
    const { addCommentToPrayer } = await import('../../../../execution/comments_repository');
    const result = await addCommentToPrayer(prayerId, content);
    
    if (!result.error) {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/dashboard');
      revalidatePath(`/dashboard/original-prayers/${prayerId}`);
    }
    return result;
  } catch (err: any) {
    console.error('addCommentAction crash:', err);
    return { error: err?.message || 'Erro interno no servidor de comentários' };
  }
}

export async function deleteCommentAction(commentId: string, prayerId: string) {
  try {
    const { deleteCommentFromPrayer } = await import('../../../../execution/comments_repository');
    const result = await deleteCommentFromPrayer(commentId);
    if (!result.error) {
       const { revalidatePath } = await import('next/cache');
       revalidatePath(`/dashboard/original-prayers/${prayerId}`);
       revalidatePath('/dashboard');
    }
    return result;
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteOriginalPrayerAction(formData: FormData) {
  const prayerId = formData.get('prayerId') as string;
  if (!prayerId) return;

  const { deleteOriginalPrayer } = await import('../../../../execution/original_prayers_repository');
  try {
    await deleteOriginalPrayer(prayerId);
  } catch (err) {
    console.error('Falha ao excluir oração', err);
    return;
  }

  revalidatePath('/dashboard/original-prayers');
  redirect('/dashboard/original-prayers');
}

export async function updateOriginalPrayerAction(formData: FormData) {
  const prayerId = formData.get('prayerId') as string;
  const title = formData.get('title') as string;
  const theme = formData.get('theme') as string;
  const content = formData.get('content') as string;
  const youtube_url = formData.get('youtube_url') as string | null;
  const imageFile = formData.get('imageFile') as File | null;

  if (!prayerId || !title || !theme || !content) return;

  const { updateOriginalPrayer } = await import('../../../../execution/original_prayers_repository');
  let image_url: string | undefined = undefined;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0 && userId) {
      const fileExt = imageFile.name ? imageFile.name.split('.').pop() : 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('prayers-images').upload(fileName, imageFile);
      
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('prayers-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    await updateOriginalPrayer(prayerId, {
      title,
      theme,
      content,
      youtube_url: youtube_url || null,
      image_url
    });
  } catch (err) {
    console.error('Falha ao atualizar oração', err);
    return;
  }

  revalidatePath(`/dashboard/original-prayers/${prayerId}`);
  revalidatePath('/dashboard/original-prayers');
  redirect(`/dashboard/original-prayers/${prayerId}`);
}

export async function getCommentsAction(prayerId: string) {
  if (!prayerId) return [];
  const { getCommentsForPrayer } = await import('../../../../execution/comments_repository');
  return await getCommentsForPrayer(prayerId);
}
