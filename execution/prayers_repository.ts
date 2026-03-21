import { createClient } from '@/lib/supabase/server'

export interface Prayer {
  id: string
  title: string
  content: string
  category: string
  audio_url: string | null
  is_premium: boolean
  created_at: string
}

export async function getPrayers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching prayers:', error)
    return []
  }

  return data as Prayer[]
}

export async function getPrayerById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching prayer:', error)
    return null
  }

  return data as Prayer
}
