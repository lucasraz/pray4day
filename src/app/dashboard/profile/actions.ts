'use server'
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfileAction(formData: FormData) {
  const socialName = (formData.get('social_name') as string)?.trim();
  const faithName = (formData.get('faith_name') as string)?.trim();
  const birthDate = formData.get('birth_date') as string;
  const state = formData.get('state') as string;
  const displayNamePreference = formData.get('display_name_preference') as string || 'social';
  const avatarFile = formData.get('avatarFile') as File | null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  let avatar_url: string | undefined = undefined;

  // Processa o upload da imagem de perfil (avatar)
  if (avatarFile && avatarFile.size > 0) {
    // Mantém sempre o mesmo nome para sobrescrever o anterior (upsert no storage)
    const ext = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/avatar.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (!uploadError && uploadData) {
      // Cache busting para forçar nova imagem a aparecer
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
    } else {
      console.error('Erro no upload de avatar:', uploadError?.message || uploadError);
    }
  }

  // Objeto base para upsert (garante que funciona mesmo sem linha prévia)
  const upsertPayload: Record<string, unknown> = {
    id: user.id,
    social_name: socialName || null,
    faith_name: faithName || null,
    birth_date: birthDate || null,
    state: state || null,
    display_name_preference: displayNamePreference,
    updated_at: new Date().toISOString(),
  };

  if (avatar_url) {
    upsertPayload.avatar_url = avatar_url;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao atualizar perfil:', error.message);
    // Redireciona com sinal de erro
    redirect('/dashboard/profile?saved=error');
  }

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  redirect('/dashboard/profile?saved=true');
}
