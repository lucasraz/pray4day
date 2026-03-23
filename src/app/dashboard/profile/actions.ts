'use server'
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(formData: FormData) {
  const socialName = formData.get('social_name') as string;
  const faithName = formData.get('faith_name') as string;
  const birthDate = formData.get('birth_date') as string;
  const state = formData.get('state') as string;
  const avatarFile = formData.get('avatarFile') as File | null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  let avatar_url: string | undefined = undefined;

  // Processa o upload da imagem de perfil (avatar)
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${user.id}-${Date.now()}.png`; // Simple ext resolution, Supabase will infer mime
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatar_url = urlData.publicUrl;
    } else {
      console.error('Erro no upload de avatar (Bucket "avatars" existe?):', uploadError);
    }
  }

  // Objeto base para atualizar
  const updatePayload: any = {
    social_name: socialName || null,
    faith_name: faithName || null,
    birth_date: birthDate || null,
    state: state || null,
  };

  // Se gerou um link novo, ele entra no pacote. Se não, não toca.
  if (avatar_url) {
    updatePayload.avatar_url = avatar_url;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
  }

  revalidatePath('/dashboard/profile');
}
