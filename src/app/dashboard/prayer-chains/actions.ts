'use server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPrayerChain, deletePrayerChain, joinPrayerChain, leavePrayerChain } from '../../../../execution/prayer_chains_repository';

export async function createPrayerChainAction(formData: FormData) {
  const title = (formData.get('title') as string)?.trim();
  const purpose = (formData.get('purpose') as string)?.trim();
  const category = formData.get('category') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const execution_time = formData.get('execution_time') as string;
  const periodicityRaw = formData.get('periodicity') as string;
  const itemsRaw = formData.get('items') as string;

  if (!title || !start_date || !execution_time || !periodicityRaw || !itemsRaw) {
    console.error('Campos obrigatórios faltando');
    return;
  }

  let periodicity: string[];
  let items: any[];

  try {
    periodicity = JSON.parse(periodicityRaw);
    items = JSON.parse(itemsRaw);
  } catch (e) {
    console.error('Erro ao parsear dados:', e);
    return;
  }

  try {
    await createPrayerChain({
      title,
      purpose,
      category: category || 'Geral',
      start_date,
      end_date: end_date || undefined,
      execution_time,
      periodicity,
      items,
    });
  } catch (err) {
    console.error('Erro ao criar corrente:', err);
    return;
  }

  revalidatePath('/dashboard/prayer-chains');
  redirect('/dashboard/prayer-chains');
}

export async function deletePrayerChainAction(formData: FormData) {
  const chainId = formData.get('chainId') as string;
  if (!chainId) return;

  await deletePrayerChain(chainId);

  revalidatePath('/dashboard/prayer-chains');
  redirect('/dashboard/prayer-chains');
}

export async function joinPrayerChainAction(formData: FormData) {
  const chainId = formData.get('chainId') as string;
  if (!chainId) return;
  await joinPrayerChain(chainId);
  revalidatePath(`/dashboard/prayer-chains/${chainId}`);
  revalidatePath('/dashboard/prayer-chains');
}

export async function leavePrayerChainAction(formData: FormData) {
  const chainId = formData.get('chainId') as string;
  if (!chainId) return;
  await leavePrayerChain(chainId);
  revalidatePath(`/dashboard/prayer-chains/${chainId}`);
  revalidatePath('/dashboard/prayer-chains');
}
