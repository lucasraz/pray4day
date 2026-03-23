import { createClient } from '@/lib/supabase/server'

export interface Verse {
  id: string
  category: string
  reference: string
  text: string
  created_at: string
}

export async function getDailyVerse() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

  // 1. Verifica se já existe um versículo para hoje
  const { data: dailyVerseEntry, error: fetchError } = await supabase
    .from('verse_of_the_day')
    .select('verse_id, verses(*)')
    .eq('date', today)
    .single()

  if (dailyVerseEntry && dailyVerseEntry.verses) {
    return (dailyVerseEntry.verses as unknown) as Verse
  }

  // 2. Se não houver, precisamos escolher um novo
  // Busca versículos que nunca foram usados ou há mais tempo
  const { data: pickedVerse, error: pickError } = await supabase
    .from('verses')
    .select('id, category, reference, text')
    .order('created_at', { ascending: false }) // Fallback
    .limit(1) // Placeholder, vamos usar SQL bruto via RPC para garantir "no repeats"
    .single()

  // Para garantir a lógica "não se repetem até acabar", o ideal é um SQL que faça:
  // LEFT JOIN verse_of_the_day ON verses.id = verse_of_the_day.verse_id
  // ORDER BY verse_of_the_day.date ASC NULLS FIRST, RANDOM()
  // Mas no JS Client é difícil fazer Order por Join table
  
  // Vamos usar uma estratégia JS fallback ou tentar um RPC:
  // Mas como não podemos criar RPCs facilmente daqui, vamos usar uma lógica no JS:
  // 1. Busca todos os IDs de versículos usados
  const { data: usedVerses } = await supabase
    .from('verse_of_the_day')
    .select('verse_id')

  const usedIds = usedVerses?.map(v => v.verse_id) || []

  // 2. Busca versículos não usados
  let query = supabase
    .from('verses')
    .select('*')

  if (usedIds.length > 0) {
    query = query.not('id', 'in', `(${usedIds.join(',')})`)
  }

  const { data: unusedVerses, error: unusedError } = await query.limit(50) // Pega um lote

  let nextVerse: Verse | null = null

  if (unusedVerses && unusedVerses.length > 0) {
    // Escolhe um aleatório do lote de não usados
    const randomIndex = Math.floor(Math.random() * unusedVerses.length)
    nextVerse = unusedVerses[randomIndex] as Verse
  } else {
    // Se TODOS foram usados, pega o mais antigo do histórico (ou limpa histórico)
    // Para simplificar, limpa o histórico ou pega um aleatório de todos
    const { data: allVerses } = await supabase.from('verses').select('*').limit(10)
    if (allVerses && allVerses.length > 0) {
      nextVerse = allVerses[Math.floor(Math.random() * allVerses.length)] as Verse
    }
  }

  if (nextVerse) {
    // 3. Salva a escolha para hoje
    const { error: insertError } = await supabase
      .from('verse_of_the_day')
      .upsert({ date: today, verse_id: nextVerse.id }, { onConflict: 'date' }) // Upsert para evitar erro de concorrência

    if (insertError) {
      console.error('Erro ao salvar versículo do dia:', insertError)
    }

    return nextVerse
  }

  return null
}
