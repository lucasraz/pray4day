import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testComment() {
  const { data: prayers } = await supabase.from('original_prayers').select('id').limit(1);
  const prayerId = prayers[0]?.id;

  if (!prayerId) {
    console.log('Sem orações para testar.');
    return;
  }

  const { data: users } = await supabase.from('profiles').select('id, is_premium').eq('is_premium', true).limit(1);
  const userId = users[0]?.id;

  if (!userId) {
    console.log('Sem usuários premium para testar.');
    return;
  }

  console.log('Testando com PrayerId:', prayerId, 'UserId:', userId);

  const { data, error } = await supabase
    .from('comments_original_prayers')
    .insert([{
      prayer_id: prayerId,
       user_id: userId,
       content: 'Comentário de teste executado'
    }])
    .select();

  console.log('Resultado:', data ? 'Sucesso' : 'Falha', error?.message || '');
}

testComment();
