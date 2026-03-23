'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOriginalPrayer, toggleLikeOriginalPrayer, toggleFavoriteActionLogic } from '../../../../execution/original_prayers_repository';

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
  const youtube_url = formData.get('youtube_url') as string | null;

  if (!title || !theme || !content) {
    console.error('Preencha todos os campos obrigatórios.');
    return;
  }

  let audio_url: string | undefined = undefined;

  try {
    if (audioFile && audioFile.size > 0) {
      // Fazendo o upload do arquivo para o Storage via Supabase Client
      // Precisamos importar o createClient localmente nessa branch de tentativa se for o caso,
      // ou apenas instanciá-lo se a action o permitir. O repositório já faz uso dele, mas o storage é direto aqui:
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      const { data, error } = await supabase.storage.from('prayers-audio').upload(fileName, audioFile);
      
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('prayers-audio').getPublicUrl(fileName);
        audio_url = urlData.publicUrl;
      } else {
        console.error('Erro no upload de áudio:', error);
      }
    }

    await createOriginalPrayer({
      title,
      theme,
      content,
      audio_url,
      youtube_url: youtube_url || undefined,
    });
  } catch (err: any) {
    console.error('Error creating prayer:', err);
    return;
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

  if (!prayerId || !title || !theme || !content) return;

  const { updateOriginalPrayer } = await import('../../../../execution/original_prayers_repository');
  try {
    await updateOriginalPrayer(prayerId, {
      title,
      theme,
      content,
      youtube_url: youtube_url || undefined
    });
  } catch (err) {
    console.error('Falha ao atualizar oração', err);
    return;
  }

  revalidatePath(`/dashboard/original-prayers/${prayerId}`);
  revalidatePath('/dashboard/original-prayers');
  redirect(`/dashboard/original-prayers/${prayerId}`);
}
